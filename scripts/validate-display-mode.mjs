import fs from "node:fs";

const dashboard = fs.readFileSync("app/dashboard.module.css", "utf8");
const member = fs.readFileSync("components/MemberAuthBridge.module.css", "utf8");
const spirit = fs.readFileSync("components/SpiritCompanion.module.css", "utf8");
const page = fs.readFileSync("app/page.tsx", "utf8");

const errors = [];

for (const marker of [
  "CP24 Display Mode Isolation",
  'html:not([data-display-mode="pc"])',
  ".mobileDock{display:grid!important}",
  'html[data-display-mode="pc"]',
  ".noticeCard{display:block!important}",
  ".continueButton:after{content:none!important}",
  ".events .event:nth-child(n+3){display:grid!important}",
  '.topActions :global(.displayModeToggle)',
]) {
  if (!dashboard.includes(marker)) errors.push(`dashboard missing display-mode marker: ${marker}`);
}

for (const marker of [
  'html[data-display-mode="pc"]',
  ".accountButton>span{display:grid!important;",
  ".avatar{width:36px!important;height:36px!important}",
]) {
  if (!member.includes(marker)) errors.push(`member account missing PC override: ${marker}`);
}

for (const marker of [
  'html[data-display-mode="pc"]',
  ".wrap{right:18px!important;bottom:18px!important}",
  ".launcher{width:68px!important;height:64px!important",
  ".level{display:block!important}",
]) {
  if (!spirit.includes(marker)) errors.push(`spirit companion missing PC override: ${marker}`);
}

if (!dashboard.includes('academy-world.webp')) errors.push("approved hero background reference is missing");

for (const marker of [
  "Khám phá hệ sinh thái HIU YHCT",
  "Cộng đồng HIU YHCT",
  "Sự kiện & hoạt động",
  "Thông báo gần đây",
]) {
  if (!page.includes(marker)) errors.push(`approved homepage structure missing marker: ${marker}`);
}

if (errors.length) {
  console.error("Display mode isolation validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("PC/mobile display-mode isolation contract passed without changing approved homepage structure.");
