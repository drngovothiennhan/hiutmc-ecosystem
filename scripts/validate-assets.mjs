import fs from 'node:fs';
const image = fs.readFileSync('public/academy-world.webp');
if (image.toString('ascii',0,4)!=='RIFF'||image.toString('ascii',8,12)!=='WEBP'||image.length<50000) throw new Error('Academy illustration is missing or invalid');
if(image.length>1800000)throw new Error('Academy image exceeds 1.8 MB budget');
const component=fs.readFileSync('components/EcosystemMap.tsx','utf8');
for(const asset of ['/academy-world.webp','/academy-mobile.webp','/ecosystem-map-art.svg'])if(!component.includes(asset)||!fs.existsSync(`public${asset}`))throw new Error(`Missing artwork or fallback: ${asset}`);
console.log(`Illustrated map and SVG fallback validated (${Math.round(image.length/1024)} KB).`);
