import assert from "node:assert/strict";
import {
  currentStreak,
  earnedPoints,
  longestStreak,
  missionCatalog,
  normalizeProgress,
  selectMissionsForDay,
  weekStart,
  weeklyMissionCount,
} from "../data/learning-progress.ts";

const todayMissions = selectMissionsForDay("2026-09-24");
assert.equal(todayMissions.length, 3, "show three daily missions");
assert.equal(new Set(todayMissions.map((mission) => mission.id)).size, 3, "do not repeat a mission in one day");
assert.notDeepEqual(todayMissions.map((mission) => mission.id), selectMissionsForDay("2026-09-25").map((mission) => mission.id), "rotate missions between days");

const clean = normalizeProgress({ completions: [
  { day: "2026-09-21", missionId: "study-15" },
  { day: "2026-09-21", missionId: "study-15" },
  { day: "2026-09-22", missionId: "atlas-point" },
  { day: "not-a-date", missionId: "herb-search" },
  { day: "2026-02-31", missionId: "herb-search" },
  { day: "2026-99-99", missionId: "herb-search" },
  { day: "2026-09-23", missionId: "unknown-id" },
] });
assert.equal(clean.completions.length, 2, "deduplicate completions and reject untrusted rows");
assert.equal(selectMissionsForDay("2026-02-31").length, 3, "fall back safely for malformed dates");
assert.equal(currentStreak(clean.completions, ""), 0, "avoid invalid server-render streaks before hydration");
const streakRows = [...clean.completions, { day: "2026-09-23", missionId: "herb-search" }];
assert.equal(currentStreak(streakRows, "2026-09-24"), 3, "count a chain through yesterday when today is not done");
assert.equal(currentStreak(streakRows, "2026-09-25"), 0, "expire the current chain after a missed full day");
assert.equal(longestStreak(streakRows), 3, "retain the best-ever consecutive streak for the badge");
assert.equal(weekStart("2026-09-24"), "2026-09-21", "weeks start on Monday");
assert.equal(weeklyMissionCount(streakRows, "2026-09-24"), 3, "count this week's completions");
assert.equal(earnedPoints(clean.completions), missionCatalog.find((mission) => mission.id === "study-15").points + missionCatalog.find((mission) => mission.id === "atlas-point").points, "derive XP from completed missions");

console.log("Daily mission rotation, local progress normalization, streak, weekly challenge and XP checks passed.");
