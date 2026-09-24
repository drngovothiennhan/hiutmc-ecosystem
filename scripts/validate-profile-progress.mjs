import fs from "node:fs";

const display=fs.readFileSync("components/DisplayModeToggle.tsx","utf8");
const auth=fs.readFileSync("components/MemberAuthBridge.tsx","utf8");
const authCss=fs.readFileSync("components/MemberAuthBridge.module.css","utf8");
const page=fs.readFileSync("app/page.tsx","utf8");
const dashboard=fs.readFileSync("app/dashboard.module.css","utf8");
const globals=fs.readFileSync("app/globals.css","utf8");
const errors=[];

for(const marker of [
  "hiutmc:display-mode-change",
  "window.dispatchEvent(new CustomEvent<DisplayMode>",
  "window.addEventListener(EVENT",
]){
  if(!display.includes(marker))errors.push(`display mode sync missing: ${marker}`);
}

for(const marker of [
  "DisplayModeToggle",
  "profileModeButton",
  "learningProgressReady",
  'method: "GET"',
  "/functions/v1/learning-sync",
  "refreshLearningProgress",
]){
  if(!auth.includes(marker))errors.push(`member profile/progress bridge missing: ${marker}`);
}

for(const marker of [
  ".displayModeSetting",
  ".profileModeButton",
  "position:static!important",
  "justify-content:center!important",
]){
  if(!authCss.includes(marker))errors.push(`profile display control style missing: ${marker}`);
}

for(const marker of [
  'html:not([data-display-mode="pc"])',
  '.topActions :global(.displayModeToggle)',
  'display:none!important',
  ".ringSyncPending",
  ".ringSyncedNoScore",
]){
  if(!dashboard.includes(marker))errors.push(`dashboard CP25 guard missing: ${marker}`);
}

for(const marker of [
  "learningProgress",
  "Đã đồng bộ Study OS",
  "Chưa có bản đồng bộ thành công",
  "Streak",
  "todayQuestions",
  "ringStyle",
  "member.fullName",
]){
  if(!page.includes(marker))errors.push(`homepage progress state missing: ${marker}`);
}

if(page.includes("<strong>Chưa đồng bộ</strong>")){
  errors.push("homepage still contains the old hard-coded Chưa đồng bộ state");
}

if(page.includes("người học YHCT")){
  errors.push("homepage still contains generic người học YHCT instead of the synced member name");
}

for(const marker of [
  "button.displayModeToggle",
  "align-items:center",
  "justify-content:center",
  "line-height:1!important",
]){
  if(!globals.includes(marker))errors.push(`global display-mode alignment missing: ${marker}`);
}

if(errors.length){
  console.error("CP25 profile/progress validation failed:");
  for(const error of errors)console.error("- "+error);
  process.exit(1);
}

console.log("CP25 profile display control and server learning-progress bridge contract passed.");
