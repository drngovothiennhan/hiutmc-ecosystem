import fs from "node:fs";

const migrationPath = "supabase/migrations/20260924052000_ecosystem_admin_backend_shadow_v1.sql";
const publicationMigrationPath = "supabase/migrations/20260925000100_ecosystem_hub_shared_publication_v1.sql";
const workerPath = "worker.mjs";
const planPath = "docs/DEVELOPMENT_PLAN_CP23_CP30.md";
const staffUiPath = "components/StaffConsole.tsx";
const registryPath = "components/hub-registry.ts";
const errors = [];

for (const path of [migrationPath, publicationMigrationPath, workerPath, planPath, staffUiPath, registryPath]) {
  if (!fs.existsSync(path)) errors.push(`missing CP23 file: ${path}`);
}

const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf8") : "";
const publicationMigration = fs.existsSync(publicationMigrationPath) ? fs.readFileSync(publicationMigrationPath, "utf8") : "";
const worker = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, "utf8") : "";
const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, "utf8") : "";
const staffUi = fs.existsSync(staffUiPath) ? fs.readFileSync(staffUiPath, "utf8") : "";
const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, "utf8") : "";

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
  "const pathname =",
  'shadow: "cp23"',
]) {
  if (!worker.includes(marker)) errors.push(`worker missing CP23 shadow marker: ${marker}`);
}

for (const marker of [
  "ecosystem_hub_publications",
  "ecosystem_public_hub_registry",
  "ecosystem_admin_publish_hub",
  "private.has_min_role('admin'",
  "grant execute on function public.ecosystem_public_hub_registry() to anon",
]) {
  if (!publicationMigration.includes(marker)) errors.push(`publication migration missing marker: ${marker}`);
}

for (const marker of ["/api/hub-registry", "/api/staff/shadow/publish", "ecosystem_public_hub_registry", "ecosystem_admin_publish_hub"]) {
  if (!worker.includes(marker)) errors.push(`worker missing shared publication marker: ${marker}`);
}
for (const marker of ["Lưu nháp dùng chung", "Xuất bản Hub", "/api/staff/shadow/snapshot", "/api/staff/shadow/moderation"]) {
  if (!staffUi.includes(marker)) errors.push(`staff UI missing shared workflow marker: ${marker}`);
}
if (!registry.includes("/api/hub-registry")) errors.push("public Hub registry is not reading shared publication API");
if (/localStorage/.test(staffUi)) errors.push("staff UI still reads or writes localStorage for operational data");

for (const marker of [
  "Do not redesign or replace the approved homepage",
  "Stage 1 — Admin/Mod shared backend in SHADOW mode",
  "The 2026-09-25 shared publication release completes Stage 2",
]) {
  if (!plan.includes(marker)) errors.push(`development plan missing guardrail: ${marker}`);
}

if (errors.length) {
  console.error("CP23 shadow-backend validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Shared Admin/Mod storage, Hub publication and authorization contract passed; no destructive migration patterns detected.");
