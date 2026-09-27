import fs from "node:fs";

const migrationPath = "supabase/migrations/20260927000000_spirit_pet_shared_profile_admin_dragon_v1.sql";
const authPath = "components/MemberAuthBridge.tsx";
const companionPath = "components/SpiritCompanion.tsx";
const roadmapPath = "docs/SPIRIT-PET-ROADMAP.md";
const errors = [];

for (const path of [migrationPath, authPath, companionPath, roadmapPath]) {
  if (!fs.existsSync(path)) errors.push("missing spirit-pet admin contract file: " + path);
}

const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf8") : "";
const auth = fs.existsSync(authPath) ? fs.readFileSync(authPath, "utf8") : "";
const companion = fs.existsSync(companionPath) ? fs.readFileSync(companionPath, "utf8") : "";
const roadmap = fs.existsSync(roadmapPath) ? fs.readFileSync(roadmapPath, "utf8") : "";

const initialization = migration.split("create or replace function public.spirit_pet_profile_initialize")[1]?.split("end\n$$;")[0] || "";
const speciesWrite = migration.split("create or replace function public.spirit_pet_profile_set_species")[1]?.split("end\n$$;")[0] || "";
const backfill = migration.split("-- One-time migration: normalize existing admin profiles to Thanh Long.")[1]?.split("-- New admin member rows")[0] || "";

for (const marker of [
  "member.role::text = 'admin'",
  "on conflict (member_id) do update",
  "set species = 'thanh_long'",
]) {
  if (!backfill.includes(marker)) errors.push("admin backfill contract missing: " + marker);
}

for (const marker of [
  "private.current_member_id()",
  "from public.club_members",
  "if v_role = 'admin' then",
  "v_species := 'thanh_long'",
  "on conflict (member_id) do nothing",
  "p_requested_species",
]) {
  if (!initialization.includes(marker)) errors.push("server-derived admin initialization missing: " + marker);
}

for (const marker of [
  "if v_role = 'admin' and p_species <> 'thanh_long' then",
  "raise exception 'admin spirit pet must remain Thanh Long'",
  "on conflict (member_id) do update",
]) {
  if (!speciesWrite.includes(marker)) errors.push("server species-write guard missing: " + marker);
}

for (const marker of [
  "after insert on public.club_members",
  "new.role::text = 'admin'",
  "values (new.id, 'thanh_long')",
]) {
  if (!migration.includes(marker)) errors.push("new-admin insert trigger missing: " + marker);
}
if (/create trigger[\s\S]{0,300}after update on public\.club_members/i.test(migration)) {
  errors.push("role updates must not trigger species changes");
}
if (!migration.includes("revoke all on table public.spirit_pet_profiles from anon, authenticated")) {
  errors.push("direct client table writes are not revoked");
}
if (!migration.includes("grant select on table public.spirit_pet_profiles to authenticated")) {
  errors.push("member profile read grant is missing");
}

for (const marker of [
  "/rest/v1/rpc/spirit_pet_profile_initialize",
  "p_requested_species",
  'thanh_long: "dragon"',
  'khong_tuoc: "peacock"',
]) {
  if (!auth.includes(marker)) errors.push("signed-in profile bridge missing: " + marker);
}
for (const marker of [
  "DATABASE_SPECIES_TO_KIND",
  "member && !spiritPetReady",
  "spiritPetSpecies",
]) {
  if (!companion.includes(marker)) errors.push("companion does not wait for the shared profile: " + marker);
}
for (const marker of [
  "Giai đoạn 1",
  "Giai đoạn 2",
  "Giai đoạn 3",
  "Giai đoạn 4",
  "Giai đoạn 5",
  "Giai đoạn 6",
  "Đổi role",
  "thanh_long",
]) {
  if (!roadmap.includes(marker)) errors.push("roadmap missing invariant marker: " + marker);
}

for (const dangerous of [
  /drop\s+table/i,
  /truncate\s+/i,
  /delete\s+from\s+public\.club_members/i,
  /update\s+public\.club_members/i,
]) {
  if (dangerous.test(migration)) errors.push("migration contains forbidden destructive pattern: " + dangerous);
}

if (errors.length) {
  console.error("Spirit-pet admin contract validation failed:");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}

console.log("Stage 1 spirit-pet profile contract passed: admin init/backfill is Thanh Long, RPC writes are role-guarded, and role changes do not rewrite existing species.");
