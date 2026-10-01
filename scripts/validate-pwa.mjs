import fs from 'node:fs';
const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
if (manifest.id !== '/' || manifest.start_url !== '/' || manifest.scope !== '/' || manifest.display !== 'standalone') throw Error('Invalid app identity/scope');
for (const size of [192, 512]) {
  const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}` && icon.type === 'image/png');
  if (!icon) throw Error(`Missing ${size} PNG icon`);
  const png = fs.readFileSync(`public${icon.src}`);
  if (png.toString('hex',0,8) !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size) throw Error(`Invalid PNG dimensions: ${icon.src}`);
}
for (const file of ['sw.js', 'offline.html', 'icons/apple-touch-icon.png']) if (!fs.existsSync(`public/${file}`)) throw Error(`Missing ${file}`);
if (!fs.existsSync('public/hiu-club-logo.webp')) throw Error('Missing HIU CLB logo used to prepare the branded PWA icons');
const headers = fs.readFileSync('public/_headers','utf8');
if (!headers.includes('/sw.js\n  Cache-Control: no-cache') || !headers.includes('/manifest.webmanifest\n  Cache-Control: no-cache')) throw Error('Missing PWA update headers');
const gatewayWorker = fs.readFileSync('worker.mjs','utf8');
// The service worker must stay network-first with only the offline page cached, so a release can never
// leave users on a stale bundle (docs/RELEASE_PLAYBOOK.md, section 4). Widening this needs owner approval.
const serviceWorker = fs.readFileSync('public/sw.js', 'utf8');
if ((serviceWorker.match(/addAll\(/g) || []).length !== 1 || !serviceWorker.includes("addAll(['/offline.html'])")) throw Error('sw.js may precache only /offline.html');
if (/\bcache\.put\(|\.put\(event\.request|cache\.add\(/.test(serviceWorker)) throw Error('sw.js must not runtime-cache responses');
if (!serviceWorker.includes("event.request.mode !== 'navigate'")) throw Error('sw.js must only handle page navigations');
if (!serviceWorker.includes('url.origin !== self.location.origin')) throw Error('sw.js must never intercept other origins');
if (!gatewayWorker.includes('window.__HIUTMC_DISABLE_NESTED_PWA=true')) throw Error('A.I Thiệt Chẩn gateway must disable nested PWA registration');
if (!gatewayWorker.includes('hiutmc_gateway=20260927r1')) throw Error('A.I Thiệt Chẩn gateway must cache-bust proxied runtime assets');
if (!gatewayWorker.includes('redirected.pathname = config.prefix +')) throw Error('Proxied document navigation must stay inside the connected app prefix');
console.log('PWA manifest, icon dimensions, offline fallback, update headers and A.I Thiệt Chẩn nested-PWA isolation passed.');
