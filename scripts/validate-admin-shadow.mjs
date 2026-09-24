import fs from "node:fs";

const migrationPath = "supabase/migrations/20260924052000_ecosystem_admin_backend_shadow_v1.sql";
const workerPath = "worker.mjs";
const planPath = "docs/DEVELOPMENT_PLAN_CP23_CP30.md";
const errors = [];

for (const path of [migrationPath, workerPath, planPath]) {
  if (!fs.existsSync(path)) errors.push(`missing CP23 file: ${path}`);
}

const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf8") : "";
const worker = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, "utf8") : "";
const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, "utf8") : "";

for (const marker of [
  "ecosystem_hub_drafts",
  "ecosystem_moderation_queue",
  "ecosystem_audit_log",
  "enable row level security",
  "ecosystem_staff_snapshot",
  "ecosystem_admin_save_hub_draft",
  "ecosystem_mod_submit_queue",
  "ecosystem_mod_review_queue",
  "private.has_min_role('admin'",
  "private.has_min_role('mod'",
  "revision_conflict",
]) {
  if (!migration.includes(marker)) errors.push(`migration missing marker: ${marker}`);
}

for (const dangerous of [
  /drop\s+table/i,
  /truncate\s+/i,
  /alter\s+table[^;]+drop\s+column/i,
  /delete\s+from\s+public\.club_members/i,
  /update\s+public\.club_members/i,
]) {
  if (dangerous.test(migration)) errors.push(`migration contains forbidden destructive pattern: ${dangerous}`);
}

for (const marker of [
  "/api/staff/shadow/snapshot",
  "/api/staff/shadow/hub-draft",
  "/api/staff/shadow/moderation",
  "ecosystem_staff_snapshot",
  "ecosystem_admin_save_hub_draft",
  "sameOriginMutation",
  'shadow: "cp23"',
]) {
  if (!worker.includes(marker)) errors.push(`worker missing CP23 shadow marker: ${marker}`);
}

for (const marker of [
  "Do not redesign or replace the approved homepage",
  "Stage 1 — Admin/Mod shared backend in SHADOW mode",
  "No Stage 2 UI cutover is allowed",
]) {
  if (!plan.includes(marker)) errors.push(`development plan missing guardrail: ${marker}`);
}

if (errors.length) {
  console.error("CP23 shadow-backend validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CP23 additive Admin/Mod shadow backend contract passed; no destructive migration patterns detected.");
