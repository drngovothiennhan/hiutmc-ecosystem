import fs from "node:fs";

const homePath = "out/index.html";
const adminPath = "out/admin/index.html";
const errors = [];
if (!fs.existsSync(homePath)) errors.push("missing exported homepage");
if (!fs.existsSync(adminPath)) errors.push("missing exported Admin Center route");

const home = fs.existsSync(homePath) ? fs.readFileSync(homePath, "utf8") : "";
const admin = fs.existsSync(adminPath) ? fs.readFileSync(adminPath, "utf8") : "";
for (const marker of [
  "Học tinh hoa YHCT.",
  "Kết nối tương lai số.",
  "BẢN ĐỒ HỆ SINH THÁI HIU Y HỌC CỔ TRUYỀN",
  "Khám phá ứng dụng",
  "Đăng nhập thành viên",
  "Admin Center",
  "approvedMobileTaskbar",
  "Nhiệm vụ",
  "Nhiệm vụ hôm nay",
  "Học tập trung 15 phút",
  "Thử thách tuần",
  "Huy hiệu khám phá",
  "chưa đồng bộ với tài khoản thành viên",
  "Bảng thi đua nhóm sẽ chỉ mở khi có dữ liệu thành viên đã xác thực",
  "Chuyển đổi giữa giao diện Mobile và PC",
  "Hiện đang ở giao diện",
  'class="navLeaf" src="/hiu-club-logo.webp"',
  "Atlas 3D",
  "Cộng đồng",
  "clb.yhoccotruyen.hiu@gmail.com",
  "@hiu.clb.yhoccotruyen",
]) if (!home.includes(marker)) errors.push(`homepage missing approved CP12 marker: ${marker}`);
for (const marker of [
  "Tổng quan",
  "Nội dung Hub",
  "Liên kết",
  "Duyệt của Mod",
  "Thành viên &amp; vai trò",
  "Nhật ký",
  "Cấu hình",
  "Chỉ lưu trên trình duyệt này",
]) if (!admin.includes(marker)) errors.push(`Admin Center missing marker: ${marker}`);
if (home.includes("Chọn điểm đến") || admin.includes("Đăng nhập quản trị chưa được kích hoạt")) {
  errors.push("CP11 dashboard or placeholder Admin was exported instead of the approved CP12 experience");
}
if (home.includes("assistantLauncher") || home.includes("learning-assistant-panel") || home.includes("Trợ lý học tập")) {
  errors.push("learning assistant must remain temporarily hidden until its error is fixed");
}
for (const asset of ["out/hiu-club-logo.webp", "out/academy-world.webp", "out/academy-mobile.webp", "out/icons/icon-192.png", "out/icons/icon-512.png", "out/icons/apple-touch-icon.png"]) {
  if (!fs.existsSync(asset)) errors.push(`missing approved visual asset: ${asset}`);
}
const cssHrefs = [...home.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((match) => match[1]);
const css = cssHrefs.map((href) => fs.readFileSync(`out/${href.replace(/^\//, "").split("?")[0]}`, "utf8")).join("\n");
if (!css.includes("html[data-display-mode=pc] .approvedMobileTaskbar{display:none}")) errors.push("PC mode must hide the mobile taskbar");
if (css.includes("html[data-display-mode=pc] .displayModeToggle{display:none}")) errors.push("display mode switch must remain visible so mobile users can switch back");
const sourceCss = fs.readFileSync("app/globals.css", "utf8");
if (!sourceCss.includes(".heritageNav .displayModeToggle{position:static")) errors.push("mobile display mode switch must remain in the header layout");
if (!sourceCss.includes(".approvedMobileTaskbar a{align-content:center;align-items:center;gap:3px;min-width:0;min-height:54px")) errors.push("mobile taskbar items must retain larger tap targets");
if (!sourceCss.includes("env(safe-area-inset-bottom)")) errors.push("mobile layout must account for the device safe area");

if (errors.length) {
  console.error("Approved release validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Approved CP14 homepage, mobile taskbar, illustrated map, official logo, accessible display mode, local learning features, community links and Admin Center are present; learning assistant is temporarily hidden.");
