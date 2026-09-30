import fs from "node:fs";
import assert from "node:assert/strict";
import { diffCompletions, mergeProgress, normalizeProgress } from "../data/learning-progress.ts";

const errors = [];
const sql = fs.readFileSync("supabase/migrations/20260930120000_member_mission_completions_v1.sql", "utf8");
const auth = fs.readFileSync("components/MemberAuthBridge.tsx", "utf8");
const missions = fs.readFileSync("components/DailyMissions.tsx", "utf8");

for (const marker of [
  "create table if not exists public.member_mission_completions",
  "primary key (member_id, day, mission_id)",
  "enable row level security",
  "member_id = private.current_member_id()",
  "revoke all on table public.member_mission_completions from anon, authenticated",
  "grant select on table public.member_mission_completions to authenticated",
  "security definer",
  "set search_path = public, private, pg_catalog",
  "revoke all on function public.mission_completions_sync(jsonb) from public, anon",
  "revoke all on function public.mission_completion_set(date, text, boolean) from public, anon",
  "grant execute on function public.mission_completions_sync(jsonb) to authenticated",
  "grant execute on function public.mission_completion_set(date, text, boolean) to authenticated",
]) if (!sql.includes(marker)) errors.push(`mission sync migration missing: ${marker}`);

for (const banned of [/drop\s+table/i, /truncate/i, /delete\s+from\s+public\.(?!member_mission_completions)/i, /alter\s+table\s+public\.(?!member_mission_completions)/i]) {
  if (banned.test(sql)) errors.push(`mission sync migration must be additive: ${banned}`);
}
if (/p_member_id|member_id\s+uuid\s*,\s*p_/i.test(sql)) errors.push("RPCs must derive identity from the session, not a client-supplied member id");

for (const marker of [
  "mission_completions_sync",
  "mission_completion_set",
  "missionSyncStatus",
  "MISSION_OWNER_KEY",
  "diffCompletions",
  "writeMissionMirror({ completions: [] }, null)",
]) if (!auth.includes(marker)) errors.push(`member bridge mission sync missing: ${marker}`);

for (const marker of ["missionSyncStatus", "lưu theo tài khoản", "source === \"account\""]) {
  if (!missions.includes(marker)) errors.push(`DailyMissions account sync missing: ${marker}`);
}
if (missions.includes("chưa đồng bộ với tài khoản thành viên.")) errors.push("DailyMissions still claims progress is never synced");

const a = { day: "2026-09-29", missionId: "study-15" };
const b = { day: "2026-09-30", missionId: "atlas-point" };
const c = { day: "2026-09-30", missionId: "quiz-round" };
const diff = diffCompletions([a, b], [b, c]);
assert.deepEqual(diff.added, [c], "diff adds only new rows");
assert.deepEqual(diff.removed, [a], "diff removes only rows that disappeared");
assert.deepEqual(diffCompletions([a], [a]), { added: [], removed: [] }, "no-op diff is empty");
const merged = mergeProgress({ completions: [a, b, { day: "bad", missionId: "study-15" }] }, { completions: [b, c] }, null, "junk");
assert.equal(merged.completions.length, 3, "merge is a de-duplicated union that drops untrusted rows");
assert.deepEqual(normalizeProgress(mergeProgress()), { completions: [] }, "merging nothing is empty");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Mission account-sync migration, bridge wiring and merge/diff checks passed.");
