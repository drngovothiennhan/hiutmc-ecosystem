import "./validate-pwa.mjs";
import fs from "node:fs";
import { createHash } from "node:crypto";

const image = fs.readFileSync("public/academy-world.webp");
if (image.toString("ascii", 0, 4) !== "RIFF" || image.toString("ascii", 8, 12) !== "WEBP" || image.length < 50000) {
  throw new Error("Academy illustration is missing or invalid");
}
if (image.length > 1800000) throw new Error("Academy image exceeds 1.8 MB budget");

const mapComponent = fs.readFileSync("components/EcosystemMap.tsx", "utf8");
for (const asset of ["/academy-world.webp", "/academy-mobile.webp", "/ecosystem-map-art.svg"]) {
  if (!mapComponent.includes(asset) || !fs.existsSync(`public${asset}`)) {
    throw new Error(`Missing artwork or fallback: ${asset}`);
  }
}

const petSpecies = ["dragon", "phoenix", "sphinx", "peacock"];
const uniquePeacockStages = { full: new Set(), icon: new Set() };
const petStages = [1, 2, 3, 4];
const petVariants = ["full", "icon"];
let petAssetBytes = 0;

for (const species of petSpecies) {
  for (const stage of petStages) {
    for (const variant of petVariants) {
      const file = `public/spirit-pets/visual-v2/${species}-stage-${stage}-${variant}.webp`;
      if (!fs.existsSync(file)) throw new Error(`Missing spirit pet asset: ${file}`);
      const bytes = fs.readFileSync(file);
      if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
        throw new Error(`Invalid WebP spirit pet asset: ${file}`);
      }
      const budget = variant === "icon" ? 24000 : 90000;
      if (bytes.length > budget) throw new Error(`Spirit pet asset exceeds ${budget} byte budget: ${file}`);
      if (species === "peacock") {
        uniquePeacockStages[variant].add(createHash("sha256").update(bytes).digest("hex"));
      }
      petAssetBytes += bytes.length;
    }
  }
}

for (const variant of petVariants) {
  if (uniquePeacockStages[variant].size !== petStages.length) {
    throw new Error(`Khong Tuoc ${variant} artwork must be unique at all four preview stages`);
  }
}

const resolver = fs.readFileSync("data/spirit-pet-visuals.ts", "utf8");
if (!resolver.includes('SPIRIT_VISUAL_VERSION = "spirit-visual-v2-20260927"')) {
  throw new Error("Spirit pet visual_version is missing or changed unexpectedly");
}
for (const species of petSpecies) {
  if (!resolver.includes(`${species}: {`)) throw new Error(`Resolver missing species: ${species}`);
}

const companion = fs.readFileSync("components/SpiritCompanion.tsx", "utf8");
if (!companion.includes('VISUAL_V2_ACTIVE_SPECIES = new Set<PetKind>(["dragon", "phoenix", "sphinx", "peacock"])')) {
  throw new Error("Visual-v2 runtime allowlist must remain limited to Thanh Long, Chu Tuoc and Kim Su");
}

for (const required of ["previewStage", "BASELINE_VISUAL_STAGE", "resolveSpiritPetVisual", "data-visual-version"]) {
  if (!companion.includes(required)) throw new Error(`Spirit companion visual contract missing: ${required}`);
}
for (const forbidden of ["actual_level", "actualLevel", "setActualLevel", "setPetLevel", "supabase.rpc", ".from(\"pet", ".from('pet"]) {
  if (companion.includes(forbidden)) throw new Error(`Visual-only phase must not touch progression/backend: ${forbidden}`);
}

console.log(`Illustrated map validated (${Math.round(image.length / 1024)} KB); spirit visual-v2 validated (32 WebP assets; Thanh Long/Chu Tuoc/Kim Su/Khong Tuoc complete with four unique Peacock stages, ${Math.round(petAssetBytes / 1024)} KB total).`);
