import fs from "node:fs";

const files = {
  worker: fs.readFileSync("worker.mjs", "utf8"),
  auth: fs.readFileSync("components/MemberAuthBridge.tsx", "utf8"),
  console: fs.readFileSync("components/StaffConsole.tsx", "utf8"),
  wrangler: fs.readFileSync("wrangler.jsonc", "utf8"),
};

const errors = [];
for (const marker of [
  "/api/staff/session",
  "/api/staff/access",
  "/api/admin/traffic",
  'shadowStaffAccess(request, "admin")',
  "validateStaff",
  "HttpOnly",
  "Secure",
  "SameSite=Strict",
  'pathname === "/admin"',
  'pathname === "/mod"',
]) {
  if (!files.worker.includes(marker)) errors.push(`worker missing staff authorization marker: ${marker}`);
}

for (const marker of [
  "syncStaffSession",
  "clearStaffSession",
  'window.location.assign(access.canAdmin ? "/admin/" : "/mod/")',
  "staffAccess",
  'const GAME_HUB_ROLES = new Set(["member", "mod", "super_mod", "leader", "admin"]);',
  "export function canAccessGameHub",
  "openGameHub: async",
  "if (!session || !canAccessGameHub(session.member.role)) return;",
  "async function refreshSession(current: StoredSession, forceRefresh = false)",
  "const fresh = await refreshSession(session, true);",
]) {
  if (!files.auth.includes(marker)) errors.push(`member auth bridge missing marker: ${marker}`);
}

for (const marker of [
  'fetch("/api/staff/access"',
  'mode: "admin" | "mod"',
  "visibleTabs",
  "SERVER VERIFIED",
]) {
  if (!files.console.includes(marker)) errors.push(`staff console missing marker: ${marker}`);
}

for (const marker of ['"main": "./worker.mjs"', '"binding": "ASSETS"', '"run_worker_first": true']) {
  if (!files.wrangler.includes(marker)) errors.push(`wrangler missing worker/assets marker: ${marker}`);
}

if (errors.length) {
  console.error("Staff authorization validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Cloudflare + Supabase staff authorization contract is present.");
