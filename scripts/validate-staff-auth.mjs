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
  "async function refreshSession(current: StoredSession)",
  'new URLSearchParams(window.location.search).get("open") === "game-hub"',
  "navigateToGameHub(next)",
]) {
  if (!files.auth.includes(marker)) errors.push(`member auth bridge missing marker: ${marker}`);
}

const gameHubLaunchStart = files.auth.indexOf("openGameHub: async (rawUrl) => {");
const gameHubLaunchEnd = files.auth.indexOf("refreshLearningProgress,", gameHubLaunchStart);
const gameHubLaunch = gameHubLaunchStart >= 0 && gameHubLaunchEnd > gameHubLaunchStart
  ? files.auth.slice(gameHubLaunchStart, gameHubLaunchEnd)
  : "";
for (const marker of [
  'target.origin !== new URL(GAME_HUB_URL).origin',
  "access_token: session.accessToken",
  "refresh_token: session.refreshToken",
  "window.location.assign(target.toString())",
]) {
  if (!gameHubLaunch.includes(marker)) errors.push(`Game Hub launch missing safe handoff marker: ${marker}`);
}
if (gameHubLaunch.includes("await ")) errors.push("Game Hub launch must not wait on network or animation before navigating.");

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
