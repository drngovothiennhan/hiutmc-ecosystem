import fs from "node:fs";

const homePath = "out/index.html";
const adminPath = "out/admin/index.html";
const modPath = "out/mod/index.html";
const consoleSourcePath = "components/StaffConsole.tsx";
const errors = [];

for (const [path, label] of [
  [homePath, "homepage"],
  [adminPath, "Admin Center route"],
  [modPath, "Mod Center route"],
]) {
  if (!fs.existsSync(path)) errors.push(`missing exported ${label}`);
}

const home = fs.existsSync(homePath) ? fs.readFileSync(homePath, "utf8") : "";
const admin = fs.existsSync(adminPath) ? fs.readFileSync(adminPath, "utf8") : "";
const mod = fs.existsSync(modPath) ? fs.readFileSync(modPath, "utf8") : "";
const staffConsole = fs.existsSync(consoleSourcePath) ? fs.readFileSync(consoleSourcePath, "utf8") : "";

for (const marker of [
  "HIU YHCT DIGITAL CAMPUS",
  "Chào mừng trở lại",
  "TIẾP TỤC HỌC TẬP",
  "Khám phá hệ sinh thái HIU YHCT",
  "Study OS",
  "3D Atlas",
  "A.I Thiệt Chẩn",
  "Trung Y Văn",
  "Cộng đồng HIU YHCT",
  "Sự kiện &amp; hoạt động",
  "Tiến độ học tập",
  "Nhiệm vụ hôm nay",
  "Linh thú đồng hành",
]) {
  if (!home.includes(marker)) errors.push(`homepage missing approved dashboard marker: ${marker}`);
}

for (const [html, route] of [[admin, "Admin"], [mod, "Mod"]]) {
  for (const marker of ["HIU YHCT STAFF AUTH", "Đang xác minh quyền máy chủ"]) {
    if (!html.includes(marker)) errors.push(`${route} route missing authorization gate marker: ${marker}`);
  }
}

for (const marker of [
  "Tổng quan",
  "Nội dung Hub",
  "Liên kết",
  "Duyệt của Mod",
  "Thành viên &amp; vai trò",
  "Nhật ký",
  "Cấu hình",
  "SERVER VERIFIED",
  'mode: "admin" | "mod"',
]) {
  if (!staffConsole.includes(marker)) errors.push(`Staff Console source missing marker: ${marker}`);
}

if (home.includes("Trợ lý học tập") || home.includes("assistantLauncher")) {
  errors.push("legacy learning assistant must not remain on the rebuilt homepage");
}

for (const asset of [
  "out/hiu-club-logo.webp",
  "out/academy-world.webp",
  "out/academy-mobile.webp",
  "out/icons/icon-192.png",
  "out/icons/icon-512.png",
  "out/icons/apple-touch-icon.png",
]) {
  if (!fs.existsSync(asset)) errors.push(`missing approved visual asset: ${asset}`);
}

const cssHrefs = [...home.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((match) => match[1]);
const css = cssHrefs
  .map((href) => fs.readFileSync(`out/${href.replace(/^\//, "").split("?")[0]}`, "utf8"))
  .join("\n");

if (!css.includes("grid-template-columns:218px")) errors.push("desktop dashboard sidebar layout is missing");
if (!css.includes("grid-template-columns:repeat(5,1fr)")) errors.push("mobile five-item taskbar layout is missing");
if (!css.includes("position:fixed")) errors.push("compact spirit companion fixed launcher styles are missing");

if (errors.length) {
  console.error("Approved dashboard validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Approved HIU YHCT Digital Campus, protected Admin/Mod routes and staff console are present.");
