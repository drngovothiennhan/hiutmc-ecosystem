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
const districtLinks = [...liveHtml.matchAll(/class="districtBanner" href="(https:\/\/[^\"]+)"/g)];
if (districtLinks.length !== 4 || new Set(districtLinks.map(item => item[1])).size !== 4 || liveHtml.includes('class="districtPreview"')) throw new Error('Direct app navigation contract failed');
if (!liveHtml.includes('clb.yhoccotruyen.hiu@gmail.com')) throw new Error('Missing club contact information');
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
console.log('PASS direct navigation, club contacts, PWA manifest/icons and offline worker.');
