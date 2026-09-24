# FROZEN / REVIEW — HIU YHCT Digital Campus

Checkpoint scope: UI dashboard + compact spirit companion preview.

## Rule
Các thành phần dưới đây KHÔNG được tự động xóa, mở rộng hoặc đưa trở lại homepage cho tới khi có thẩm định. Chúng được giữ lại để rollback và đối chiếu lịch sử.

## FROZEN — legacy homepage candidates
- `components/LearningAssistant.tsx` — trợ lý cũ; homepage mới không mount component này vì linh thú thay vai trò trợ lý góc.
- `components/EcosystemMap.tsx` — bản đồ hệ sinh thái cũ; homepage mới dùng Core Hubs làm điều hướng chính.
- `components/AvatarCampus.tsx` và `components/AvatarCampus.module.css` — avatar/campus cũ; không đưa lại homepage trong phase hiện tại.
- `app/home.module.css` — stylesheet homepage cũ; giữ để rollback, chưa xóa.
- Các selector legacy trong `app/globals.css` liên quan assistant/map/approved CP12 — chưa dọn cho tới khi visual QA và production migration hoàn tất.

## FROZEN — spirit companion features
Các mục sau mới chỉ được phép hiển thị ở trạng thái khóa hoặc mô tả:
- XP/thân mật riêng của linh thú.
- Cho ăn/chăm sóc bằng vật phẩm.
- Quà thưởng có giá trị.
- Tiến hóa thật theo cấp/backend. Riêng Chu Tước được phép có **preview artwork 4 bậc** để thẩm định; preview không thay đổi cấp thật.
- Đồng bộ pet với tài khoản thành viên.
- Notification server/push.
- Marketplace/vật phẩm/gacha bổ sung.
- Bảng xếp hạng pet.

## ACTIVE / ALLOWED
- Nhận ngẫu nhiên đúng một linh thú trên thiết bị lần đầu.
- Lưu loài pet bằng localStorage.
- Idle animation khác nhau theo loài.
- Chu Tước dùng SVG riêng: Ấu Điểu → Hỏa Vũ Điểu → Phượng Hoàng Linh → Chu Tước Thánh Điểu.
- Cho phép xem trước 4 artwork Chu Tước trong panel, không ghi level/progress.
- Đọc tiến độ nhiệm vụ cục bộ đã tồn tại.
- Hiển thị số nhiệm vụ còn lại và gợi ý nhiệm vụ kế tiếp.
- Điều hướng sang Nhiệm vụ/Cộng đồng.
- Responsive launcher nhỏ, không chiếm layout chính.

## Điều kiện để gỡ FROZEN
1. Visual QA dashboard được duyệt.
2. Xác định nguồn dữ liệu/backend chính thức.
3. Có schema lưu pet theo member ID.
4. Có chính sách chống reset/random lại pet ngoài ý muốn.
5. Có test migration và rollback.
6. Có duyệt riêng trước khi xóa legacy code.
