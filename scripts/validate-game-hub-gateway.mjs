import fs from "node:fs";

const worker = fs.readFileSync("worker.mjs", "utf8");
const auth = fs.readFileSync("components/MemberAuthBridge.tsx", "utf8");
const home = fs.readFileSync("app/page.tsx", "utf8");
const checks = [
  ["Eco Worker proxies the independent Game Hub origin", /prefix:\s*"\/apps\/game-hub"[\s\S]*?upstreamOrigin:\s*"https:\/\/hiutmc-game-hub\.pages\.dev"/.test(worker)],
  ["Eco launches Game Hub same-origin without putting credentials in its URL", /location\.assign\("\/apps\/game-hub\/"\)/.test(auth) && !/access_token:\s*session\.accessToken/.test(auth)],
  ["Home navigation uses the Eco Game Hub route", /const gameHubUrl = "\/apps\/game-hub\/"/.test(home) && (home.match(/GameHubLink href={gameHubUrl}/g) || []).length >= 2],
  ["Refresh rotation is serialized using the shared browser lock", /hiutmc-supabase-session-refresh-v1/.test(auth) && /navigator\.locks\?\.request/.test(auth)],
  ["Transient errors do not clear the member session", /error\.clearSession = status === 401/.test(auth) && /if \(unauthorized\) \{\s*saveStored\(null\)/.test(auth)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
