import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { renderPhoenixStageSvg } from "../asset-sources/spirit-v2/phoenix-vectors.mjs";

const sourceDir = path.join(process.cwd(), "asset-sources", "spirit-v2");
const outputDir = path.join(process.cwd(), "public", "spirit-pets", "visual-v2");

if (!fs.existsSync(sourceDir)) {
  throw new Error("Spirit visual-v2 source bundle is missing");
}

const parts = fs.readdirSync(sourceDir)
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort();

if (parts.length === 0) throw new Error("Spirit visual-v2 source bundle has no parts");

const bundleText = parts
  .map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8"))
  .join("");

const bundle = JSON.parse(bundleText);
const bundledSpecies = ["dragon", "qilin", "fox", "peacock", "sphinx"];
const stages = [1, 2, 3, 4];
const variants = ["full", "icon"];
const bundledExpected = new Set();

for (const species of bundledSpecies) {
  for (const stage of stages) {
    for (const variant of variants) {
      bundledExpected.add(`${species}-stage-${stage}-${variant}.webp`);
    }
  }
}

const names = Object.keys(bundle);
if (names.length !== bundledExpected.size) {
  throw new Error(`Expected ${bundledExpected.size} bundled spirit assets, got ${names.length}`);
}
for (const name of names) {
  if (!bundledExpected.has(name)) throw new Error(`Unexpected spirit asset in bundle: ${name}`);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const name of [...bundledExpected].sort()) {
  const bytes = Buffer.from(bundle[name], "base64");
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`Invalid WebP payload: ${name}`);
  }
  fs.writeFileSync(path.join(outputDir, name), bytes);
}

for (const stage of stages) {
  const svg = Buffer.from(renderPhoenixStageSvg(stage));
  const fullName = `phoenix-stage-${stage}-full.webp`;
  const iconName = `phoenix-stage-${stage}-icon.webp`;

  await sharp(svg)
    .resize(256, 256, { fit: "contain" })
    .webp({ quality: 84, effort: 6, alphaQuality: 90 })
    .toFile(path.join(outputDir, fullName));

  await sharp(svg)
    .resize(96, 96, { fit: "contain" })
    .webp({ quality: 80, effort: 6, alphaQuality: 88 })
    .toFile(path.join(outputDir, iconName));
}

console.log(`Materialized ${bundledExpected.size + 8} spirit visual-v2 WebP assets: 40 bundled + 8 Chu Tuoc conversions.`);
