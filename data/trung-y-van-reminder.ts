/**
 * Trung Y Văn study reminder shown by the Linh thú companion.
 *
 * Trung Y Văn (served from the same hiutmc.com origin under /apps/trungyvan/) writes a small
 * summary to this device's browser storage when the learner turns on its reminder. This file only validates and
 * turns that summary into one calm message. It reads nothing from a server and never fabricates
 * numbers: invalid or missing data produces no reminder.
 */

export const TYV_SUMMARY_KEY = "trung-y-van-hiu-exam-summary-v1";
export const TYV_SEEN_KEY = "hiutmc-trung-y-van-reminder-seen-v1";
export const TYV_SEEN_EVENT = "hiutmc:trung-y-van-reminder-seen";
// Fixed target: the link never comes from stored data.
export const TYV_URL = "/apps/trungyvan/";

export type TyvSummary = {
  examDate: string;
  remindTime: string;
  day: string;
  newPerDay: number;
  newLeft: number;
  due: number;
  goalDone: boolean;
};

export type TyvReminder = { message: string; daysLeft: number };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function count(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(9999, Math.max(0, Math.floor(n))) : 0;
}

export function dayKey(now: Date) {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function parseTyvSummary(raw: string | null): TyvSummary | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    if (!value || typeof value !== "object" || value.v !== 1) return null;
    if (typeof value.examDate !== "string" || !DATE_RE.test(value.examDate)) return null;
    if (typeof value.remindTime !== "string" || !TIME_RE.test(value.remindTime)) return null;
    if (typeof value.day !== "string" || !DATE_RE.test(value.day)) return null;
    return {
      examDate: value.examDate,
      remindTime: value.remindTime,
      day: value.day,
      newPerDay: count(value.newPerDay),
      newLeft: count(value.newLeft),
      due: count(value.due),
      goalDone: value.goalDone === true,
    };
  } catch {
    return null;
  }
}

/** Whole days until the end of the exam day; null when the date is invalid or already past. */
export function daysUntilExam(examDate: string, now: Date) {
  if (!DATE_RE.test(examDate)) return null;
  const [y, m, d] = examDate.split("-").map(Number);
  const end = new Date(y, m - 1, d, 23, 59, 59).getTime();
  if (Number.isNaN(end) || end < now.getTime()) return null;
  return Math.max(0, Math.ceil((end - now.getTime()) / DAY_MS) - 1);
}

export function buildTyvReminder(summary: TyvSummary | null, now: Date): TyvReminder | null {
  if (!summary) return null;
  const daysLeft = daysUntilExam(summary.examDate, now);
  if (daysLeft === null) return null;

  const [hh, mm] = summary.remindTime.split(":").map(Number);
  if (now.getHours() * 60 + now.getMinutes() < hh * 60 + mm) return null;

  const today = dayKey(now);
  const parts: string[] = [];
  if (summary.day === today) {
    if (summary.goalDone) return null;
    if (summary.newLeft > 0) parts.push(`${summary.newLeft} từ mới`);
    if (summary.due > 0) parts.push(`${summary.due} từ cần ôn`);
    if (!parts.length) return null;
  } else {
    // The learner has not opened Trung Y Văn today: the exact counts are unknown, so stay general.
    if (summary.newPerDay > 0) parts.push(`khoảng ${summary.newPerDay} từ mới`);
    parts.push("các từ đến hạn cần ôn");
  }

  const tail = daysLeft === 0 ? "Hôm nay là ngày thi." : `Còn ${daysLeft} ngày đến kỳ thi.`;
  return { message: `Hôm nay còn ${parts.join(" và ")}. ${tail}`, daysLeft };
}
