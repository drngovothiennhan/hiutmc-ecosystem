import assert from "node:assert/strict";
import fs from "node:fs";
import { ecosystemApps } from "../data/apps.ts";
import { normalizePersonalLearningSnapshot } from "../data/personalized-learning.ts";
import {
  buildContextCards, chooseNudge, dueTopics, greetingFor, inQuietHours, normalizeQuestion, routeQuestion, weakTopics,
} from "../data/assistant-guidance.ts";
import { FEATURE_FLAG_IDS } from "../lib/feature-flags.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const at = (hour, minute = 0) => new Date(2026, 9, 1, hour, minute, 0);
const base = { total: 3, remaining: 3, nextMission: { title: "Học tập trung 15 phút", hubSlug: "study-os" }, streak: 0, weeklyCount: 0, snapshot: null };
const input = (overrides = {}) => ({ now: at(10), ...base, ...overrides });
const NOW = at(10).getTime();
const snapshot = normalizePersonalLearningSnapshot({
  journey: { updatedAt: "", lastModule: "", lastActiveDate: "" },
  reviewCards: [
    { id: "a", subject: "YHCT cơ sở", topic: "Hàn nhiệt", due: NOW - 60_000, interval: 1, streak: 0, lastAttempt: "x1" },
    { id: "b", subject: "YHCT cơ sở", topic: "Hàn nhiệt", due: NOW - 30_000, interval: 1, streak: 1, lastAttempt: "x2" },
    { id: "c", subject: "", topic: "Khí huyết", due: NOW + 3_600_000, interval: 1, streak: 2, lastAttempt: "x3" },
    { id: "d", subject: "", topic: "Tạng phủ", due: NOW + 40 * 3_600_000, interval: 1, streak: 0, lastAttempt: "" },
  ],
});

// --- greeting / quiet hours -----------------------------------------------------------------------
assert.equal(greetingFor(at(8)), "Chào buổi sáng");
assert.equal(greetingFor(at(12)), "Chào buổi trưa");
assert.equal(greetingFor(at(16)), "Chào buổi chiều");
assert.equal(greetingFor(at(20)), "Chào buổi tối");
assert.equal(greetingFor(at(2)), "Khuya rồi");
assert.equal(inQuietHours(at(23)), true);
assert.equal(inQuietHours(at(22, 29)), false);
assert.equal(inQuietHours(at(22, 30)), true);
assert.equal(inQuietHours(at(5, 59)), true);
assert.equal(inQuietHours(at(6)), false);

// --- review topics come only from the real snapshot --------------------------------------------------
assert.deepEqual(dueTopics(null, NOW), []);
assert.deepEqual(dueTopics(snapshot, NOW), ["YHCT cơ sở · Hàn nhiệt"], "due now, de-duplicated");
assert.deepEqual(dueTopics(snapshot, NOW, 86_400_000), ["YHCT cơ sở · Hàn nhiệt", "Khí huyết"], "due within 24h");
assert.deepEqual(weakTopics(snapshot), ["YHCT cơ sở · Hàn nhiệt"], "streak 0 with a real attempt only (not the one with no attempt)");
assert.deepEqual(weakTopics(null), []);

// --- context cards: truthful, bounded ---------------------------------------------------------------
assert.deepEqual(buildContextCards(input({ total: 0, remaining: 0, nextMission: null }), ecosystemApps), [], "nothing true to say => no cards");
let cards = buildContextCards(input(), ecosystemApps);
assert.equal(cards.length, 1);
assert.equal(cards[0].id, "next-mission");
assert.equal(cards[0].href, ecosystemApps.find((app) => app.slug === "study-os").launchUrl);
cards = buildContextCards(input({ snapshot, streak: 4 }), ecosystemApps);
assert.equal(cards[0].id, "due-review", "due review comes first");
assert.match(cards[0].detail, /Hàn nhiệt/);
assert.ok(cards.length <= 3);
assert.equal(buildContextCards(input({ remaining: 0, streak: 5, nextMission: null }), ecosystemApps)[0].id, "missions-done");
assert.match(buildContextCards(input({ remaining: 0, streak: 5, nextMission: null }), ecosystemApps)[0].detail, /5 ngày/);
for (const card of buildContextCards(input({ snapshot, streak: 4 }), ecosystemApps)) {
  if (card.href && !ecosystemApps.some((app) => app.launchUrl === card.href)) errors.push(`card links outside the registry: ${card.href}`);
}
// a snapshot with no due and no weak topics must not produce a review card
const calm = normalizePersonalLearningSnapshot({ journey: {}, reviewCards: [{ id: "z", subject: "", topic: "Tạng phủ", due: NOW + 40 * 3_600_000, interval: 1, streak: 2, lastAttempt: "q" }] });
assert.ok(!buildContextCards(input({ snapshot: calm }), ecosystemApps).some((card) => card.id === "due-review" || card.id === "reinforce"));

// --- nudges: calm, prioritised, once per kind per day -----------------------------------------------
assert.equal(chooseNudge(input({ now: at(23), snapshot }), [], ecosystemApps), null, "quiet hours");
assert.equal(chooseNudge(input({ now: at(3), snapshot }), [], ecosystemApps), null, "quiet hours");
assert.equal(chooseNudge(input({ remaining: 0 }), [], ecosystemApps), null, "all done => no nudge");
assert.equal(chooseNudge(input(), [], ecosystemApps), null, "nothing started, no streak => no pressure");
assert.equal(chooseNudge(input({ snapshot, streak: 3, now: at(19) }), [], ecosystemApps).kind, "due-review", "due review outranks streak");
assert.equal(chooseNudge(input({ snapshot, streak: 3, now: at(19) }), ["due-review"], ecosystemApps).kind, "streak-risk", "a dismissed kind is skipped");
assert.equal(chooseNudge(input({ streak: 3, now: at(19) }), [], ecosystemApps).kind, "streak-risk");
assert.equal(chooseNudge(input({ streak: 3, now: at(10) }), [], ecosystemApps), null, "streak nudge only from 18:00");
assert.equal(chooseNudge(input({ streak: 0, now: at(19) }), [], ecosystemApps), null, "no streak to protect => no streak nudge");
assert.equal(chooseNudge(input({ remaining: 2 }), [], ecosystemApps).kind, "finish-missions");
assert.equal(chooseNudge(input({ remaining: 2 }), ["finish-missions"], ecosystemApps), null);
assert.equal(chooseNudge(input({ snapshot, streak: 3, now: at(19) }), ["due-review", "streak-risk", "finish-missions"], ecosystemApps), null);

// --- quick ask: routes only to registered apps and never answers clinically ---------------------------
assert.equal(routeQuestion("", ecosystemApps), null);
assert.equal(routeQuestion("   ", ecosystemApps), null);
const first = (question) => routeQuestion(question, ecosystemApps)?.routes[0]?.slug;
assert.equal(first("Huyệt Hợp Cốc nằm ở đâu?"), "atlas");
assert.equal(first("vị trí đường kinh Đại trường"), "atlas");
assert.equal(first("công dụng của vị thuốc nhân sâm"), "trung-y-van");
assert.equal(first("tra cứu bài thuốc Tứ quân tử"), "trung-y-van");
assert.equal(first("rêu lưỡi vàng dày nghĩa là gì"), "ai-thiet-chan");
assert.equal(first("cho mình đề thi thử và flashcard ôn tập"), "study-os");
assert.equal(normalizeQuestion("Đau Đầu — Huyệt!"), "dau dau huyet");
const none = routeQuestion("thời tiết hôm nay", ecosystemApps);
assert.deepEqual(none.routes, [], "unknown topics get no guessed destination");
assert.equal(none.searchHref, "/search/?q=" + encodeURIComponent("thời tiết hôm nay"), "but always offer site search");
const long = routeQuestion("huyệt ".repeat(100), ecosystemApps);
assert.ok(decodeURIComponent(long.searchHref.split("q=")[1]).length <= 120, "question length is capped");
assert.ok(routeQuestion("huyệt và vị thuốc", ecosystemApps).routes.length <= 2);
assert.ok(!routeQuestion("<script>alert(1)</script>", ecosystemApps).searchHref.includes("<"), "search link is URL-encoded");
for (const slug of ["atlas", "trung-y-van", "ai-thiet-chan", "study-os"]) if (!ecosystemApps.some((app) => app.slug === slug)) errors.push(`routing rule targets unknown app ${slug}`);
assert.ok(!routeQuestion("game y quán ca lâm sàng", ecosystemApps).routes.some((route) => /game/i.test(route.slug)), "role-gated Game Hub is never suggested");

// --- source guards: no network, no AI, no credits, no invented data ----------------------------------
const logic = read("data/assistant-guidance.ts");
for (const banned of [/\bfetch\s*\(/, /XMLHttpRequest/, /\bAI\.run\b/, /localStorage/, /Math\.random/, /agent-ai\.hiutmc\.com/]) {
  if (banned.test(logic)) errors.push(`assistant-guidance.ts must stay pure/offline: ${banned}`);
}

// --- UI wiring ---------------------------------------------------------------------------------------
const component = read("components/AssistantGuidance.tsx");
for (const flag of ["assistant-context", "assistant-quick-ask", "assistant-nudges"]) {
  if (!FEATURE_FLAG_IDS.includes(flag)) errors.push(`flag ${flag} is not registered`);
  if (!component.includes(`"${flag}"`)) errors.push(`AssistantGuidance must use flag ${flag}`);
}
if (!/if \(!context && !quickAsk && !nudges\) return null/.test(component)) errors.push("with every flag OFF the component must render nothing");
if (/fetch\(/.test(component)) errors.push("AssistantGuidance must not make its own network calls");
if (!component.includes("prefers-reduced-motion") && !read("components/AssistantGuidance.module.css").includes("prefers-reduced-motion")) errors.push("guidance UI must honour reduced motion");
const companion = read("components/SpiritCompanion.tsx");
if (!companion.includes("<AssistantGuidance")) errors.push("SpiritCompanion must mount AssistantGuidance");
if (/useFeatureFlag|feature-flags/.test(companion)) errors.push("SpiritCompanion (approved) must not import flags itself; AssistantGuidance owns them");

if (errors.length) {
  console.error("Assistant guidance validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Assistant guidance (context cards, calm nudges, quick-ask routing) is truthful, offline, bounded and flag-gated.");
