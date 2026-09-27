import fs from "node:fs";
import path from "node:path";

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
const expectedSpecies = ["dragon", "qilin", "fox", "peacock", "sphinx"];
const expectedStages = [1, 2, 3, 4];
const expectedVariants = ["full", "icon"];
const expected = new Set();

for (const species of expectedSpecies) {
  for (const stage of expectedStages) {
    for (const variant of expectedVariants) {
      expected.add(`${species}-stage-${stage}-${variant}.webp`);
    }
  }
}

const names = Object.keys(bundle);
if (names.length !== expected.size) {
  throw new Error(`Expected ${expected.size} spirit assets, got ${names.length}`);
}
for (const name of names) {
  if (!expected.has(name)) throw new Error(`Unexpected spirit asset in bundle: ${name}`);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const name of [...expected].sort()) {
  const bytes = Buffer.from(bundle[name], "base64");
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`Invalid WebP payload: ${name}`);
  }
  fs.writeFileSync(path.join(outputDir, name), bytes);
}

console.log(`Materialized ${expected.size} spirit visual-v2 WebP assets from ${parts.length} source parts.`);
