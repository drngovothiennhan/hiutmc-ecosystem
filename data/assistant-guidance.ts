// Pure guidance logic for the companion ("Linh thú") — no network, no AI calls, no AI credits.
//
// Three independent capabilities, each shipped behind its own feature flag (lib/feature-flags.mjs):
//   assistant-context   -> buildContextCards(): what to do next, from data the member already has
//   assistant-quick-ask -> routeQuestion(): a typed question -> the right app / site search
//   assistant-nudges    -> chooseNudge(): at most one calm reminder, once per kind per day
//
// Honesty rule (CLAUDE.md): never invent learner data. Every sentence below is derived from real
// inputs; with no data the functions return nothing rather than something generic dressed as personal.

// Only type imports (erased at runtime) so this module runs under plain Node for its validator; the app
// registry is passed in by the caller instead of imported.
import type { PersonalLearningSnapshot } from "./personalized-learning";

export type AppRef = { slug: string; shortName: string; launchUrl: string };

export type GuidanceInput = {
  now: Date;
  total: number; // missions today
  remaining: number; // missions still open today
  nextMission?: { title: string; hubSlug: string } | null;
  streak: number; // consecutive active days (mission completions)
  weeklyCount: number; // missions completed this week
  snapshot: PersonalLearningSnapshot | null; // verified Study OS snapshot, or null
};

export type ContextCard = { id: string; title: string; detail: string; href?: string };

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 5) return "Khuya rồi";
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function appHref(apps: readonly AppRef[], slug: string): string | undefined {
  return apps.find((app) => app.slug === slug)?.launchUrl;
}

function topicLabel(card: { subject: string; topic: string }): string {
  return card.subject ? `${card.subject} · ${card.topic}` : card.topic;
}

/** Review topics due now or within `withinMs`, soonest first, de-duplicated, from the verified snapshot. */
export function dueTopics(snapshot: PersonalLearningSnapshot | null, now: number, withinMs = 0, limit = 3): string[] {
  if (!snapshot) return [];
  const labels = snapshot.reviewCards
    .filter((card) => card.due <= now + withinMs)
    .sort((a, b) => a.due - b.due)
    .map(topicLabel);
  return [...new Set(labels)].slice(0, limit);
}

/** Topics whose last review attempt ended with streak 0 (needs reinforcing), from the verified snapshot. */
export function weakTopics(snapshot: PersonalLearningSnapshot | null, limit = 2): string[] {
  if (!snapshot) return [];
  const labels = snapshot.reviewCards
    .filter((card) => card.streak === 0 && Boolean(card.lastAttempt))
    .sort((a, b) => a.due - b.due)
    .map(topicLabel);
  return [...new Set(labels)].slice(0, limit);
}

/** Up to three short cards for the panel. Empty array when there is nothing true to say. */
export function buildContextCards(input: GuidanceInput, apps: readonly AppRef[]): ContextCard[] {
  const now = input.now.getTime();
  const cards: ContextCard[] = [];
  const studyHref = appHref(apps, "study-os");

  const due = dueTopics(input.snapshot, now, DAY);
  const weak = weakTopics(input.snapshot);
  if (due.length > 0) {
    cards.push({
      id: "due-review",
      title: `Ôn lại: ${due[0]}`,
      detail: due.length > 1
        ? `Theo lịch ôn đã đồng bộ, ${due.length} chủ đề đến hạn trong 24 giờ tới: ${due.join(", ")}.`
        : "Chủ đề này đến hạn ôn trong 24 giờ tới theo lịch ôn đã đồng bộ.",
      href: studyHref,
    });
  } else if (weak.length > 0) {
    cards.push({
      id: "reinforce",
      title: `Củng cố: ${weak[0]}`,
      detail: "Lượt ôn gần nhất của chủ đề này chưa đạt (streak 0) theo dữ liệu đã đồng bộ.",
      href: studyHref,
    });
  }

  if (input.nextMission && input.remaining > 0) {
    cards.push({
      id: "next-mission",
      title: input.nextMission.title,
      detail: `Còn ${input.remaining}/${input.total} nhiệm vụ hôm nay. Đây là việc gợi ý tiếp theo.`,
      href: appHref(apps, input.nextMission.hubSlug),
    });
  } else if (input.total > 0 && input.remaining === 0) {
    cards.push({
      id: "missions-done",
      title: "Đã xong nhiệm vụ hôm nay",
      detail: input.streak > 1 ? `Chuỗi hiện tại: ${input.streak} ngày học liên tiếp.` : "Bạn đã hoàn thành đủ nhiệm vụ trong ngày.",
    });
  }

  if (input.streak > 0 && input.remaining > 0 && cards.length < 3) {
    cards.push({
      id: "streak",
      title: `Chuỗi ${input.streak} ngày`,
      detail: "Hoàn thành một nhiệm vụ hôm nay để giữ chuỗi học liên tiếp.",
    });
  }
  return cards.slice(0, 3);
}

// ------------------------------------------------------------------------------------------------
// Nudges

export type NudgeKind = "due-review" | "streak-risk" | "finish-missions";
export type Nudge = { kind: NudgeKind; text: string; href?: string };

/** Quiet hours: no nudges from 22:30 to 06:00 local time. */
export function inQuietHours(now: Date): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 22 * 60 + 30 || minutes < 6 * 60;
}

/**
 * At most one calm reminder. Priority: due review > streak at risk > unfinished missions.
 * `dismissedToday` holds kinds already shown/dismissed today, so each kind appears once per day.
 * Returns null when everything is done, in quiet hours, or when nothing true can be said.
 */
export function chooseNudge(input: GuidanceInput, dismissedToday: readonly string[], apps: readonly AppRef[]): Nudge | null {
  if (inQuietHours(input.now)) return null;
  const now = input.now.getTime();
  const studyHref = appHref(apps, "study-os");
  const skip = new Set(dismissedToday);

  const due = dueTopics(input.snapshot, now, 0, 2);
  if (due.length > 0 && !skip.has("due-review")) {
    return { kind: "due-review", text: `Đến hạn ôn: ${due.join(", ")}.`, href: studyHref };
  }
  const doneToday = input.total - input.remaining;
  if (input.streak > 0 && doneToday === 0 && input.now.getHours() >= 18 && !skip.has("streak-risk")) {
    return { kind: "streak-risk", text: `Chuỗi ${input.streak} ngày: làm một nhiệm vụ để giữ chuỗi hôm nay.` };
  }
  if (input.remaining > 0 && doneToday > 0 && !skip.has("finish-missions")) {
    return { kind: "finish-missions", text: `Còn ${input.remaining} nhiệm vụ hôm nay.` };
  }
  return null;
}

// ------------------------------------------------------------------------------------------------
// Quick ask: route a typed question to the right place. It points the way; it does not answer
// medical questions, so nothing here can be a wrong clinical statement.

export type QuestionRoute = { slug: string; title: string; why: string; href: string };
export type QuickAskResult = { routes: QuestionRoute[]; searchHref: string };

const MAX_QUESTION_LENGTH = 120;

/** Lower-case, strip Vietnamese diacritics (đ -> d) and punctuation so "Huyệt" matches "huyet". */
export function normalizeQuestion(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const RULES: Array<{ slug: string; why: string; keywords: string[] }> = [
  { slug: "atlas", why: "xem vị trí huyệt, đường kinh trên mô hình 3D", keywords: ["huyet", "kinh lac", "duong kinh", "cham cuu", "giai phau", "vi tri", "3d", "atlas", "mach", "nhan huyet", "tay huyet"] },
  { slug: "trung-y-van", why: "tra cứu vị thuốc, bài thuốc, học liệu Trung y văn", keywords: ["vi thuoc", "duoc lieu", "bai thuoc", "phuong te", "han van", "han nom", "trung y van", "tra cuu", "thang thuoc", "cong dung", "thao duoc"] },
  { slug: "ai-thiet-chan", why: "luyện quan sát lưỡi và thiệt chẩn", keywords: ["luoi", "reu", "thiet chan", "sac luoi", "chan doan luoi", "reu luoi", "chat luoi"] },
  { slug: "study-os", why: "hỏi bài, ôn tập, luyện câu hỏi", keywords: ["on tap", "quiz", "flashcard", "de thi", "thi", "hoi bai", "cau hoi", "bai hoc", "hoc", "kiem tra", "trac nghiem", "bai tap"] },
];

function hasKeyword(haystack: string, keyword: string): boolean {
  const padded = ` ${haystack} `;
  return padded.includes(` ${keyword} `) || (keyword.length >= 4 && padded.includes(keyword));
}

/** Returns up to two best-matching destinations plus a site-search link; null for empty input. */
export function routeQuestion(raw: string, apps: readonly AppRef[]): QuickAskResult | null {
  const text = normalizeQuestion(String(raw ?? "").slice(0, MAX_QUESTION_LENGTH));
  if (!text) return null;
  const scored = RULES
    .map((rule) => ({ rule, score: rule.keywords.filter((keyword) => hasKeyword(text, keyword)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const routes: QuestionRoute[] = [];
  for (const { rule } of scored) {
    const app = apps.find((candidate) => candidate.slug === rule.slug);
    if (app) routes.push({ slug: rule.slug, title: app.shortName, why: rule.why, href: app.launchUrl });
  }
  return { routes, searchHref: `/search/?q=${encodeURIComponent(String(raw).trim().slice(0, MAX_QUESTION_LENGTH))}` };
}
