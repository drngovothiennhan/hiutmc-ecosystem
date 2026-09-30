import fs from "node:fs";

const dashboard = fs.readFileSync("app/dashboard.module.css", "utf8");
const member = fs.readFileSync("components/MemberAuthBridge.module.css", "utf8");
const spirit = fs.readFileSync("components/SpiritCompanion.module.css", "utf8");
const page = fs.readFileSync("app/page.tsx", "utf8");
const memberComponent = fs.readFileSync("components/MemberAuthBridge.tsx", "utf8");

const errors = [];

if (!memberComponent.includes("onModeChange?.(nextMode)")) errors.push("profile display mode must notify the account dialog when changed");
if (!memberComponent.includes('if (next === "pc") setOpen(false);')) errors.push("member dialog must close automatically when switching to PC mode");

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
  "Khám phá hệ sinh thái HIU TMC",
  "Cộng đồng HIU TMC",
  "Sự kiện & hoạt động",
  "Thông báo gần đây",
]) {
  if (!page.includes(marker)) errors.push(`approved homepage structure missing marker: ${marker}`);
}

const shell = fs.readFileSync("lib/shell-mode.mjs", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const worker = fs.readFileSync("worker.mjs", "utf8");
const assistant = fs.readFileSync("components/LearningAssistant.tsx", "utf8");
const toggle = fs.readFileSync("components/DisplayModeToggle.tsx", "utf8");
const { SHELL_MODE_SCRIPT, DISPLAY_MODE_STORAGE_KEY } = await import("../lib/shell-mode.mjs");
try { new Function(SHELL_MODE_SCRIPT); } catch (error) { errors.push(`shell mode script is not valid JavaScript: ${error.message}`); }
if (!toggle.includes(`"${DISPLAY_MODE_STORAGE_KEY}"`)) errors.push("DisplayModeToggle must use the storage key shared with the shell script");
if (!shell.includes("@view-transition{navigation:auto}")) errors.push("shell script must opt every page into the shared view transition");
if (!shell.includes('name="viewport"') && !shell.includes("meta[name=\"viewport\"]") && !shell.includes("meta[name=")) errors.push("shell script must control the viewport meta for PC mode");
if (!layout.includes("SHELL_MODE_SCRIPT")) errors.push("root layout must inject the shell script on every portal page");
if (!worker.includes("SHELL_MODE_SCRIPT")) errors.push("worker must inject the shell script into connected apps");
if (!toggle.includes("__hiutmcApplyDisplayMode")) errors.push("DisplayModeToggle must delegate to the shell script");
if (assistant.includes("currentUpstreamUrl")) errors.push("assistant links must use the same-origin launchUrl so PC mode and transitions survive navigation");

if (errors.length) {
  console.error("Display mode isolation validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("PC/mobile display-mode isolation contract passed without changing approved homepage structure.");
