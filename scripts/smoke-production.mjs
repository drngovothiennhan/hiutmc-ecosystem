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

const sameOriginAppRoutes = [
  ["/apps/study/", "YHCT HIU 4.0"],
  ["/apps/thietchan/", "A.I THIỆT CHẨN"],
  ["/apps/trungyvan/", "Trung Y Văn HIU"],
  ["/apps/atlas/", "Huyệt vị · Kinh lạc · Giải phẫu 3D"],
];


async function fetchBody(url, options = {}, kind = "text") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = kind === "bytes" ? Buffer.from(await response.arrayBuffer()) : await response.text();
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHeaders(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getWithRetry(url, attempts = 12) {
  let last;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const { response, body: text } = await fetchBody(url, {
        redirect: "follow",
        headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
      });
      if (response.ok) return { response, text, attempt: i };
      last = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      last = error;
    }
    if (i < attempts) await sleep(10000);
  }
  throw last || new Error(`Unable to fetch ${url}`);
}

let liveHtmlFromRoute = "";
for (const [route, marker] of routes) {
  const url = new URL(route, base).toString();
  const { response, text, attempt } = await getWithRetry(url);
  if (!text.includes(marker)) {
    throw new Error(`${url} is reachable but missing expected marker: ${marker}`);
  }
  if (route === "/") liveHtmlFromRoute = text;
  console.log(`PASS ${response.status} ${url} (attempt ${attempt})`);
}

for (const [route, marker] of sameOriginAppRoutes) {
  const url = new URL(route, base).toString();
  const { response, text, attempt } = await getWithRetry(url);
  if (!text.includes(marker)) throw new Error(`${url} gateway missing expected marker: ${marker}`);
  if (!response.headers.get("x-hiutmc-app-gateway")) throw new Error(`${url} missing gateway header`);
  if (!text.includes("<base href=")) throw new Error(`${url} missing same-origin base rewrite`);
  console.log(`PASS same-origin gateway ${response.status} ${url} (attempt ${attempt})`);
}

async function expectStaffRedirect(route, required) {
  const url = new URL(route, base).toString();
  const response = await fetchHeaders(url, {
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

const { response: anonymousStaff, body: anonymousStaffText } = await fetchBody(new URL("/api/staff/access", base), {
  redirect: "manual",
  headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
});
const anonymousStaffBody = JSON.parse(anonymousStaffText || "{}");
if (anonymousStaff.status !== 401 || anonymousStaffBody.authorized !== false) {
  throw new Error(`Anonymous staff API must return 401/authorized=false; got ${anonymousStaff.status}`);
}
console.log("PASS anonymous staff API denied");

const { response: anonymousTraffic, body: anonymousTrafficText } = await fetchBody(new URL("/api/admin/traffic", base), {
  redirect: "manual",
  headers: { "user-agent": "HIU-YHCT-release-smoke/1.0" },
});
const anonymousTrafficBody = JSON.parse(anonymousTrafficText || "{}");
if (anonymousTraffic.status !== 401 || anonymousTrafficBody.authorized !== false) {
  throw new Error(`Anonymous traffic API must return 401/authorized=false; got ${anonymousTraffic.status}`);
}
console.log("PASS anonymous Admin traffic API denied");

const { response: publicHubsResponse, body: publicHubsText } = await fetchBody(new URL("/api/hub-registry", base), { redirect: "manual" });
const publicHubs = JSON.parse(publicHubsText || "null");
if (publicHubsResponse.status !== 200 || !Array.isArray(publicHubs?.hubs)) {
  throw new Error(`Published Hub registry must be public JSON; got ${publicHubsResponse.status}`);
}
console.log("PASS public published Hub registry API");

for (const [path, method] of [
  ["/api/staff/shadow/snapshot", "GET"],
  ["/api/staff/shadow/hub-draft", "POST"],
  ["/api/staff/shadow/publish", "POST"],
  ["/api/staff/shadow/moderation", "POST"],
]) {
  const { response, body: responseText } = await fetchBody(new URL(path, base), {
    method,
    redirect: "manual",
    headers: {
      "user-agent": "HIU-YHCT-release-smoke/1.0",
      ...(method === "POST" ? { "content-type": "application/json" } : {}),
    },
    ...(method === "POST" ? { body: JSON.stringify({}) } : {}),
  });
  const body = JSON.parse(responseText || "{}");
  if (response.status !== 401 || body.authorized !== false) {
    throw new Error(`Anonymous staff endpoint must return 401/authorized=false: ${path} got ${response.status}`);
  }
  console.log(`PASS staff endpoint denied anonymous ${method} ${path}`);
}

const home = await fetchHeaders(new URL("/", base), { redirect: "follow" });
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

const liveHtml = liveHtmlFromRoute;
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
  "https://hiutmc.com/apps/study/",
  "https://hiutmc.com/apps/thietchan/",
  "https://hiutmc.com/apps/trungyvan/",
  "https://hiutmc.com/apps/atlas/",
];
for (const appUrl of memberAppUrls) {
  if (!liveHtml.includes(appUrl)) throw new Error(`Homepage is missing an app destination: ${appUrl}`);
}
for (const rawUpstream of [
  "https://yhct-hiu-final4-stage-hiu-yhct.vercel.app/",
  "https://ai-thiet-chan-hiu-yhct.vercel.app/",
  "https://drngovothiennhan.github.io/trung-y-van-hiu/",
  "https://drngovothiennhan.github.io/human-atlas/",
]) {
  if (liveHtml.includes(`href="${rawUpstream}`)) throw new Error(`Homepage still exposes raw upstream navigation: ${rawUpstream}`);
}
const { text: manifestText } = await getWithRetry(new URL('/manifest.webmanifest', base));
const manifest = JSON.parse(manifestText);
if (manifest.id !== '/' || manifest.display !== 'standalone') throw new Error('Invalid live PWA manifest');
for (const size of [192, 512]) {
  const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}` && icon.type === 'image/png');
  if (!icon) throw new Error(`Missing live PWA icon ${size}`);
  const { response, body: data } = await fetchBody(new URL(icon.src, base), {}, "bytes");
  if (!response.ok || data.length < 24 || data.toString('hex',0,8) !== '89504e470d0a1a0a' || data.readUInt32BE(16) !== size || data.readUInt32BE(20) !== size) throw new Error(`Invalid live PNG ${size}`);
}
for (const [path, marker] of [['/sw.js','hiutmc-offline-v1'],['/offline.html','Bạn đang ngoại tuyến']]) {
  const { response, text } = await getWithRetry(new URL(path, base));
  if (!text.includes(marker) || !response.headers.get('cache-control')?.includes('no-cache')) throw new Error(`PWA asset/header check failed ${path}`);
}

const { body: zaloHtml } = await fetchBody(new URL("/", base), {
  redirect: "follow",
  headers: { "user-agent": "Zalo-LinkPreview/1.0" },
});
for (const marker of [
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'HIU YHCT Ecosystem – Cổng học tập Y học cổ truyền HIU',
  'https://hiutmc.com/icons/icon-512.png?share=cp22',
]) {
  if (!zaloHtml.includes(marker)) throw new Error(`Zalo/social preview HTML missing marker: ${marker}`);
}
const { response: socialImage, body: socialImageData } = await fetchBody("https://hiutmc.com/icons/icon-512.png?share=cp22", {}, "bytes");
if (!socialImage.ok || socialImageData.length < 24 || socialImageData.toString("hex",0,8) !== "89504e470d0a1a0a") {
  throw new Error("Social preview PNG is not reachable or invalid.");
}
if (socialImageData.readUInt32BE(16) < 300 || socialImageData.readUInt32BE(20) < 300) {
  throw new Error("Social preview image is too small.");
}
const { response: robots, body: robotsText } = await fetchBody(new URL("/robots.txt", base));
if (!robots.ok || !robotsText.includes("Allow: /")) throw new Error("robots.txt does not allow social crawlers.");
console.log("PASS Zalo/social Open Graph preview metadata, summary and image.");

console.log('PASS Digital Campus, shared Hub registry, server-protected Admin/Mod routes, staff API denial, Zalo link preview, existing Hub destinations, PWA and offline worker.');
