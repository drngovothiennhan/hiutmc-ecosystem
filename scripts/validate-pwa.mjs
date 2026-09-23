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
console.log('PWA manifest, icon dimensions, offline fallback and update headers passed.');
