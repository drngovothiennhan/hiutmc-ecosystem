const base = process.env.BASE_URL || "https://hiutmc.com";
const routes = [
  ["/", "HIU YHCT"],
  ["/learn/", "Learning Center"],
  ["/ai/", "HIU YHCT AI Lab"],
  ["/community/", "HIU YHCT Community"],
  ["/discover/", "HIU YHCT Discover"],
  ["/search/", "Search Hub"],
  ["/ecosystem/study-os/", "Study OS"],
  ["/ecosystem/ai-thiet-chan/", "A.I Thiệt Chẩn"],
  ["/ecosystem/trung-y-van/", "Trung Y Văn HIU"],
  ["/ecosystem/atlas/", "3D Huyệt vị"],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getWithRetry(url, attempts = 12) {
  let last;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
      });
      clearTimeout(timer);
      const text = await response.text();
      if (response.ok) return { response, text, attempt: i };
      last = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      last = error;
    }
    if (i < attempts) await sleep(10000);
  }
  throw last || new Error(`Unable to fetch ${url}`);
}

for (const [route, marker] of routes) {
  const url = new URL(route, base).toString();
  const { response, text, attempt } = await getWithRetry(url);
  if (!text.includes(marker)) {
    throw new Error(`${url} is reachable but missing expected marker: ${marker}`);
  }
  console.log(`PASS ${response.status} ${url} (attempt ${attempt})`);
}

async function expectStaffRedirect(route, required) {
  const url = new URL(route, base).toString();
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
  });
  if (![301, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(`${url} must reject anonymous access with a redirect; got HTTP ${response.status}`);
  }
  const location = response.headers.get("location") || "";
  if (!location.includes(`staff_required=${required}`)) {
    throw new Error(`${url} redirected without the expected staff gate: ${location}`);
  }
  console.log(`PASS protected ${route} -> ${location}`);
}

await expectStaffRedirect("/admin/", "admin");
await expectStaffRedirect("/mod/", "mod");

const anonymousStaff = await fetch(new URL("/api/staff/access", base), {
  redirect: "manual",
  headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
});
const anonymousStaffBody = await anonymousStaff.json().catch(() => ({}));
if (anonymousStaff.status !== 401 || anonymousStaffBody.authorized !== false) {
  throw new Error(`Anonymous staff API must return 401/authorized=false; got ${anonymousStaff.status}`);
}
console.log("PASS anonymous staff API denied");

const home = await fetch(new URL("/", base), { redirect: "follow" });
const requiredHeaders = [
  ["x-content-type-options", "nosniff"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
];
for (const [name, expected] of requiredHeaders) {
  const value = home.headers.get(name);
  if (!value || !value.toLowerCase().includes(expected)) {
    throw new Error(`Missing/invalid production header ${name}: ${value ?? "<absent>"}`);
  }
  console.log(`PASS header ${name}: ${value}`);
}

console.log("HIU YHCT production smoke passed.");

const { text: liveHtml } = await getWithRetry(new URL('/', base));
const approvedMarkers = [
  "HIU YHCT DIGITAL CAMPUS",
  "Chào mừng trở lại",
  "TIẾP TỤC HỌC TẬP",
  "Khám phá hệ sinh thái HIU YHCT",
  "Study OS",
  "3D Atlas",
  "A.I Thiệt Chẩn",
  "Trung Y Văn",
  "Nhiệm vụ hôm nay",
  "Linh thú đồng hành",
];
for (const marker of approvedMarkers) {
  if (!liveHtml.includes(marker)) throw new Error(`Missing approved CP15 homepage marker: ${marker}`);
}
for (const marker of ["assistantLauncher", "learning-assistant-panel", "Trợ lý học tập"]) {
  if (liveHtml.includes(marker)) throw new Error(`Legacy learning assistant must remain removed from CP15 homepage: ${marker}`);
}
const hiddenAvatarMarkers = [
  "Bước vào thế giới YHCT",
  "Giới tính nhân vật",
  "Tạo nhân vật của bạn",
];
for (const marker of hiddenAvatarMarkers) {
  if (liveHtml.includes(marker)) throw new Error(`Legacy avatar flow must remain hidden in CP15: ${marker}`);
}
const memberAppUrls = [
  "https://yhct-hiu-final4-stage-hiu-yhct.vercel.app/",
  "https://ai-thiet-chan-hiu-yhct.vercel.app/",
  "https://drngovothiennhan.github.io/trung-y-van-hiu/",
  "https://drngovothiennhan.github.io/human-atlas/",
];
for (const appUrl of memberAppUrls) {
  if (!liveHtml.includes(appUrl)) throw new Error(`Homepage is missing an app destination: ${appUrl}`);
}
const { text: manifestText } = await getWithRetry(new URL('/manifest.webmanifest', base));
const manifest = JSON.parse(manifestText);
if (manifest.id !== '/' || manifest.display !== 'standalone') throw new Error('Invalid live PWA manifest');
for (const size of [192, 512]) {
  const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}` && icon.type === 'image/png');
  if (!icon) throw new Error(`Missing live PWA icon ${size}`);
  const response = await fetch(new URL(icon.src, base));
  const data = Buffer.from(await response.arrayBuffer());
  if (!response.ok || data.length < 24 || data.toString('hex',0,8) !== '89504e470d0a1a0a' || data.readUInt32BE(16) !== size || data.readUInt32BE(20) !== size) throw new Error(`Invalid live PNG ${size}`);
}
for (const [path, marker] of [['/sw.js','hiutmc-offline-v1'],['/offline.html','Bạn đang ngoại tuyến']]) {
  const { response, text } = await getWithRetry(new URL(path, base));
  if (!text.includes(marker) || !response.headers.get('cache-control')?.includes('no-cache')) throw new Error(`PWA asset/header check failed ${path}`);
}
console.log('PASS CP21 Digital Campus, server-protected Admin/Mod routes, existing Hub destinations, PWA and offline worker.');
