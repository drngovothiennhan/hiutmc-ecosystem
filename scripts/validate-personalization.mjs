import assert from "node:assert/strict";
import {
  createLearningPlan,
  normalizePersonalLearningSnapshot,
} from "../data/personalized-learning.ts";

const now = Date.UTC(2026, 8, 27, 7, 0, 0);
const snapshot = normalizePersonalLearningSnapshot({
  journey: { updatedAt: new Date(now - 60_000).toISOString(), lastModule: "exam", lastActiveDate: "2026-09-27" },
  reviewCards: [
    { id: "card-1", subject: "YHCT cơ sở", topic: "Hàn nhiệt", due: now + 60_000, interval: 0, streak: 0, lastAttempt: "attempt-real-1" },
    { id: "card-invalid", topic: "", due: "soon", interval: -1, streak: 0, lastAttempt: "" },
  ],
  dailyHistory: [],
});

assert.equal(snapshot?.reviewCards.length, 1, "ignore malformed review card records");
const activePlan = createLearningPlan(snapshot, now);
assert.equal(activePlan.nextReason, "recent-activity", "prefer real recent Study OS module activity");
assert.match(activePlan.summary.join(" "), /Hàn nhiệt/, "summary names an actual due topic");
assert.equal(activePlan.summary.length, 2, "render a short two-sentence summary when evidence exists");

const weakPlan = createLearningPlan({
  journey: { updatedAt: "", lastActiveDate: "", lastModule: "" },
  reviewCards: [{ id: "card-2", subject: "Biện chứng", topic: "Khí huyết", due: now + 60_000, interval: 0, streak: 0, lastAttempt: "attempt-real-2" }],
}, now);
assert.equal(weakPlan.nextReason, "weak-topic", "use actual recent incorrect review card when no recent module activity exists");
assert.match(weakPlan.nextTitle, /Khí huyết/);

const emptyPlan = createLearningPlan(null, now);
assert.equal(emptyPlan.summaryState, "empty", "do not invent a personalized daily summary without user data");
assert.deepEqual(emptyPlan.summary, []);

console.log("Personalized learning uses authenticated snapshot fields and truthful empty states.");
