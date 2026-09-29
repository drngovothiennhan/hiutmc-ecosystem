# Lộ trình phát triển Linh Thú đồng hành

Ngày lập: 2026-09-27

## Hiện trạng đã xác nhận

- Loài linh thú được chọn một lần trên thiết bị và lưu bằng `localStorage`.
- Linh thú đọc nhiệm vụ hoàn thành từ tiến độ cục bộ; tiến độ này chưa đồng bộ giữa thiết bị.
- Cấp hiện cố định ở Lv.1. Chu Tước có bốn hình thái để xem trước; preview không làm đổi cấp thật.
- Đồng bộ tài khoản, XP/thân mật riêng, vật phẩm, phần thưởng, tiến hóa thật và xếp hạng pet vẫn đang đóng băng để rà soát.

## Giai đoạn 1 — Hồ sơ pet dùng chung, không mất loài đã chọn

- Gắn một hồ sơ pet với thành viên đã xác thực; giữ nguyên loài hiện tại khi chuyển từ thiết bị cũ.
- Lưu lựa chọn và thay đổi hồ sơ qua API/RPC có RLS, không cho client tự ghi XP hoặc cấp.
- Có luồng liên kết hồ sơ local hiện tại với tài khoản; nếu xung đột thì giữ lựa chọn đã có và báo rõ, không random lại.
- Tiêu chí: cùng tài khoản thấy cùng một pet trên hai thiết bị; đăng xuất không xóa dữ liệu server; kiểm tra quyền member-to-member.

## Giai đoạn 2 — Tiến độ và thân mật dựa trên học tập đã xác thực

- Chỉ cộng điểm từ sự kiện Study OS đã đồng bộ và có khóa idempotency; không lấy XP local của nhiệm vụ làm điểm chính thức.
- Công bố quy tắc điểm, giới hạn theo ngày và lịch sử thay đổi để có thể đối chiếu.
- Tiêu chí: gửi lại cùng sự kiện không nhân đôi điểm; dữ liệu homepage, Study OS và pet giải thích được từ cùng nguồn tiến độ.

## Giai đoạn 3 — Chăm sóc nhẹ, không tạo áp lực

- Thêm tương tác chăm sóc mang tính trang trí, dùng năng lượng/vật phẩm có giới hạn minh bạch.
- Không phạt khi nghỉ học, không đặt chuỗi ngày làm mất cấp, không bán lượt quay hoặc thưởng ngẫu nhiên ở giai đoạn đầu.
- Tiêu chí: hành động có thể bỏ qua; không mất tiến độ học; không có vật phẩm trả phí hay gacha.

## Giai đoạn 4 — Tiến hóa và hoàn thiện các loài

- Chốt artwork, tên gọi, bậc và điều kiện tiến hóa cho Thanh Long, Kỳ Lân, Hồ Ly, Khổng Tước, Kim Sư; giữ bốn artwork Chu Tước hiện có.
- Tách chế độ xem trước khỏi cấp thật. Cấp thật chỉ thay đổi khi máy chủ xác nhận mốc tiến độ.
- Tiêu chí: kiểm tra đầy đủ mobile/PC, giảm chuyển động theo cài đặt hệ điều hành, và không thể tự sửa cấp từ trình duyệt.

## Giai đoạn 5 — Thông báo và hoạt động cộng đồng

- Dùng hộp thông báo theo thành viên đã có trong Supabase; ưu tiên thông báo trong ứng dụng, đồng bộ trạng thái đã đọc giữa thiết bị.
- Chỉ thêm thông báo đẩy sau khi thông báo trong ứng dụng có nguồn phát, quyền riêng tư và cơ chế tắt rõ ràng.
- Tiêu chí: badge bằng số thông báo chưa đọc của đúng thành viên; đánh dấu đã đọc được lưu server; sự kiện mới cập nhật qua Realtime, có làm mới dự phòng.

## Cổng phát hành

Mỗi giai đoạn có migration bổ sung, RLS/RPC review, kiểm thử hai tài khoản tách biệt, kiểm thử khôi phục/đăng xuất, production smoke và checkpoint riêng. Giữ nguyên UI đang chạy nếu bất kỳ cổng nào chưa đạt; không xóa dữ liệu pet local trước khi xác minh liên kết thành công.
