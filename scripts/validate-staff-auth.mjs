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
  "validateStaff",
  "HttpOnly",
  "Secure",
  "SameSite=Strict",
  'url.pathname === "/admin"',
  'url.pathname === "/mod"',
]) {
  if (!files.worker.includes(marker)) errors.push(`worker missing staff authorization marker: ${marker}`);
}

for (const marker of [
  "syncStaffSession",
  "clearStaffSession",
  'window.location.assign(access.canAdmin ? "/admin/" : "/mod/")',
  "staffAccess",
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

for (const marker of ['"main": "./worker.mjs"', '"binding": "ASSETS"']) {
  if (!files.wrangler.includes(marker)) errors.push(`wrangler missing worker/assets marker: ${marker}`);
}

if (errors.length) {
  console.error("Staff authorization validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Cloudflare + Supabase staff authorization contract is present.");
