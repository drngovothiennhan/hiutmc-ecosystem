import fs from "node:fs";

const release = JSON.parse(fs.readFileSync("RELEASE.json", "utf8"));
const expected = {
  product_name: "HIU YHCT Ecosystem",
  domain: "https://hiutmc.com",
  hosting: "Cloudflare Workers Static Assets",
  stage: "production",
  repository: "drngovothiennhan/hiutmc-ecosystem"
};

const errors = [];
if (!/^HIU-YHCT-ECOSYSTEM-\d{8}-\d{2}$/.test(release.release || "")) {
  errors.push("release must use HIU-YHCT-ECOSYSTEM-YYYYMMDD-NN");
}
if (!/^CP\d+$/.test(release.checkpoint || "")) errors.push("checkpoint must use CP<number>");
if (!/^[0-9a-f]{40}$/.test(release.base_checkpoint_sha || "")) errors.push("base_checkpoint_sha must be a full git SHA");
for (const [key, value] of Object.entries(expected)) {
  if (release[key] !== value) errors.push(`${key} must equal ${value}`);
}
if (!release.verification?.includes("production smoke")) errors.push("verification must require production smoke");

if (errors.length) {
  console.error("Release validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Release contract passed: ${release.release} from ${release.base_checkpoint_sha.slice(0, 8)}.`);
