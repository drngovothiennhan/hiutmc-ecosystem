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
for (const asset of ["out/hiu-club-logo.webp", "out/academy-world.webp", "out/academy-mobile.webp", "out/icons/icon-192.png", "out/icons/icon-512.png", "out/icons/apple-touch-icon.png"]) {
  if (!fs.existsSync(asset)) errors.push(`missing approved visual asset: ${asset}`);
}

if (errors.length) {
  console.error("Approved release validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Approved CP12 homepage, mobile taskbar, illustrated map, local learning features, logo, community links and Admin Center are present.");
