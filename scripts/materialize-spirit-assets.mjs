import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { renderPhoenixStageSvg } from "../asset-sources/spirit-v2/phoenix-vectors.mjs";
import { renderSphinxStageSvg } from "../asset-sources/spirit-v2/sphinx-vectors.mjs";

const packedSourceDir = path.join(process.cwd(), "asset-sources", "spirit-v2-packed");
const outputDir = path.join(process.cwd(), "public", "spirit-pets", "visual-v2");
const stages = [1, 2, 3, 4];
const variants = ["full", "icon"];

if (!fs.existsSync(packedSourceDir)) {
  throw new Error("Packed spirit visual-v2 source bundle is missing");
}

const parts = fs.readdirSync(packedSourceDir)
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort();

if (parts.length === 0) throw new Error("Packed spirit visual-v2 source bundle has no parts");

function suffixPrefixOverlap(left, right) {
  const tail = left.slice(-Math.min(left.length, right.length));
  const probe = right + "\u0000" + tail;
  const prefix = new Array(probe.length).fill(0);
  for (let i = 1; i < probe.length; i += 1) {
    let j = prefix[i - 1];
    while (j > 0 && probe[i] !== probe[j]) j = prefix[j - 1];
    if (probe[i] === probe[j]) j += 1;
    prefix[i] = j;
  }
  return Math.min(prefix[prefix.length - 1], right.length);
}

let packedText = "";
for (const name of parts) {
  const chunk = fs.readFileSync(path.join(packedSourceDir, name), "utf8");
  const overlap = packedText ? suffixPrefixOverlap(packedText, chunk) : 0;
  if (overlap > 0) console.log(`De-overlap ${name}: ${overlap} duplicated chars`);
  packedText += chunk.slice(overlap);
}

const recovered = new Map();
const pairPattern = /"([^"]+\.webp)":"([A-Za-z0-9+/=]+)"/g;
let match;
while ((match = pairPattern.exec(packedText)) !== null) {
  recovered.set(match[1], match[2]);
}

const approvedSpecies = ["dragon", "phoenix", "sphinx"];
const requiredDragon = [];
for (const stage of stages) {
  for (const variant of variants) requiredDragon.push(`dragon-stage-${stage}-${variant}.webp`);
}
for (const name of requiredDragon) {
  if (!recovered.has(name)) throw new Error(`Packed source is missing required Thanh Long asset: ${name}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const name of requiredDragon) {
  const bytes = Buffer.from(recovered.get(name), "base64");
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`Invalid Thanh Long WebP payload: ${name}`);
  }
  await sharp(bytes).metadata();
  fs.writeFileSync(path.join(outputDir, name), bytes);
}

async function writeVectorSpecies(species, renderSvg) {
  for (const stage of stages) {
    const svg = Buffer.from(renderSvg(stage));
    await sharp(svg)
      .resize(256, 256, { fit: "contain" })
      .webp({ quality: 84, effort: 6, alphaQuality: 90 })
      .toFile(path.join(outputDir, `${species}-stage-${stage}-full.webp`));

    await sharp(svg)
      .resize(96, 96, { fit: "contain" })
      .webp({ quality: 80, effort: 6, alphaQuality: 88 })
      .toFile(path.join(outputDir, `${species}-stage-${stage}-icon.webp`));
  }
}

await writeVectorSpecies("phoenix", renderPhoenixStageSvg);
await writeVectorSpecies("sphinx", renderSphinxStageSvg);

const expectedCount = approvedSpecies.length * stages.length * variants.length;
const generated = fs.readdirSync(outputDir).filter((name) => name.endsWith(".webp"));
if (generated.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} approved visual-v2 assets, got ${generated.length}`);
}

console.log(`Materialized ${expectedCount} approved spirit visual-v2 WebP assets for Thanh Long, Chu Tuoc and Kim Su.`);
