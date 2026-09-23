export type Mission = {
  id: string;
  title: string;
  detail: string;
  hubSlug: string;
  points: number;
};

export type MissionCompletion = { day: string; missionId: string };
export type LearningProgress = { completions: MissionCompletion[] };

export const missionCatalog: Mission[] = [
  { id: "study-15", title: "Học tập trung 15 phút", detail: "Mở một bài học hoặc bộ thẻ học trong Study OS.", hubSlug: "study-os", points: 20 },
  { id: "quiz-round", title: "Hoàn thành một lượt luyện tập", detail: "Làm một lượt quiz hoặc ôn tập trong Study OS.", hubSlug: "study-os", points: 25 },
  { id: "atlas-point", title: "Khám phá một huyệt vị", detail: "Mở Atlas 3D và xem vị trí cùng đường kinh của một huyệt.", hubSlug: "atlas", points: 25 },
  { id: "herb-search", title: "Tra cứu một vị thuốc", detail: "Tìm một mục dược liệu trong Trung Y Văn.", hubSlug: "trung-y-van", points: 20 },
  { id: "tongue-observe", title: "Luyện quan sát thiệt chẩn", detail: "Mở A.I Thiệt Chẩn để học cách quan sát trong bối cảnh giáo dục.", hubSlug: "ai-thiet-chan", points: 25 },
];

const missionIds = new Set(missionCatalog.map((mission) => mission.id));

export function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function selectMissionsForDay(dayKey: string): Mission[] {
  const [year, month, day] = dayKey.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (!year || month < 1 || month > 12 || day < 1 || day > 31 || parsed.toISOString().slice(0, 10) !== dayKey) return missionCatalog.slice(0, 3);
  const ordinal = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const start = ((ordinal % missionCatalog.length) + missionCatalog.length) % missionCatalog.length;
  return [0, 1, 2].map((offset) => missionCatalog[(start + offset) % missionCatalog.length]);
}

export function normalizeProgress(value: unknown): LearningProgress {
  if (!value || typeof value !== "object" || !Array.isArray((value as { completions?: unknown }).completions)) return { completions: [] };
  const candidates = (value as { completions: unknown[] }).completions;
  const unique = new Map<string, MissionCompletion>();
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.day)) continue;
    const [year, month, day] = row.day.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (month < 1 || month > 12 || day < 1 || day > 31 || parsedDate.toISOString().slice(0, 10) !== row.day) continue;
    if (typeof row.missionId !== "string" || !missionIds.has(row.missionId)) continue;
    unique.set(`${row.day}|${row.missionId}`, { day: row.day, missionId: row.missionId });
  }
  return { completions: [...unique.values()].sort((a, b) => a.day.localeCompare(b.day)).slice(-1200) };
}

function shiftDay(dayKey: string, offset: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function currentStreak(completions: MissionCompletion[], today: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return 0;
  const activeDays = new Set(completions.map((item) => item.day));
  let cursor = activeDays.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function longestStreak(completions: MissionCompletion[]): number {
  const activeDays = [...new Set(completions.map((item) => item.day))].sort();
  let longest = 0;
  let run = 0;
  let previous = "";
  for (const day of activeDays) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  return longest;
}

export function weekStart(dayKey: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return dayKey;
  const [year, month, day] = dayKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return shiftDay(dayKey, -((weekday + 6) % 7));
}

export function weeklyMissionCount(completions: MissionCompletion[], today: string): number {
  const start = weekStart(today);
  const end = shiftDay(start, 7);
  return completions.filter((item) => item.day >= start && item.day < end).length;
}

export function earnedPoints(completions: MissionCompletion[]): number {
  const points = new Map(missionCatalog.map((mission) => [mission.id, mission.points]));
  return completions.reduce((sum, item) => sum + (points.get(item.missionId) ?? 0), 0);
}
