# Linh Thú — Hồ sơ dùng chung và các giai đoạn 1–6

## Quy tắc định danh bắt buộc

- Species của hồ sơ Linh Thú được lưu theo mã chuẩn: thanh_long, chu_tuoc, kim_su, ky_lan, ho_ly, khong_tuoc.
- Với tài khoản có role admin tại thời điểm tạo hồ sơ hoặc chạy migration backfill, server gán species = thanh_long.
- Client không gửi role và không thể ghi species khác cho tài khoản admin. RLS khóa ghi trực tiếp; RPC duy nhất cập nhật species tự đọc role từ hồ sơ club_members và từ chối giá trị khác thanh_long khi role là admin.
- Migration backfill chuẩn hóa hồ sơ của admin hiện hữu. Migration chỉ chạy một lần theo cơ chế migration; role update sau đó không gọi trigger đổi species.
- Đổi role không tự sửa species của hồ sơ đã tồn tại. Nếu role được nâng/hạ sau đó, hồ sơ hiện hữu giữ nguyên; quy tắc admin chỉ áp dụng cho hồ sơ được tạo lần đầu hoặc backfill migration.
- Các khóa cấp thật, XP, thân mật, vật phẩm và phần thưởng không nằm trong hồ sơ species này; vẫn FROZEN/REVIEW.

## Giai đoạn 1 — Hồ sơ dùng chung

Tạo hồ sơ theo member ID, chỉ cho member đọc hồ sơ của mình. Khi hồ sơ mới được tạo, RPC lấy member ID và role từ phiên Supabase phía server. Tài khoản admin luôn được gán Thanh Long, bất kể client gửi yêu cầu species nào. Trigger INSERT của club_members cũng tạo sẵn hồ sơ Thanh Long cho admin mới; backfill chuyển admin hiện có sang Thanh Long mà không sửa loài của member không phải admin.

Tiêu chí nghiệm thu:

- Admin mới nhận thanh_long từ trigger hoặc RPC; client không thể ép giá trị khác.
- Admin hiện có nhận thanh_long sau migration backfill.
- RPC ghi loài từ chối species không phải thanh_long nếu role hiện tại là admin.
- Ghi trực tiếp vào bảng bị từ chối với anon/authenticated.
- Cập nhật role trên một hồ sơ đã có không tự đổi species.
- Member không phải admin giữ species đã có; hồ sơ mới dùng loài mà client yêu cầu hợp lệ.
- Giai đoạn 1 có contract test trong scripts/validate-spirit-pet-admin.mjs và được chạy trong CI.

## Giai đoạn 2 — Artwork và bản xem trước

Artwork và mapping đọc species đã lưu. Mã hồ sơ thanh_long ánh xạ sang bộ asset Thanh Long. Preview chỉ đổi asset hiển thị, không ghi cấp thật. Kỳ Lân và Hồ Ly giữ nguyên trạng thái đóng băng cho tới khi được duyệt riêng.

## Giai đoạn 3 — Nhiệm vụ và hoạt động cục bộ

Nhiệm vụ/gợi ý không sửa species. Đồng bộ tiến độ không thay đổi hồ sơ loài; mọi lần ghi vẫn dùng member ID và kiểm tra quyền phía server.

## Giai đoạn 4 — Tiến hóa thật

Cấp, XP, thân mật, vật phẩm và phần thưởng tiếp tục FROZEN/REVIEW cho tới khi có duyệt riêng. Khi được mở trong tương lai, bảng/ RPC progression không được nhận species từ client để ghi đè hồ sơ.

## Giai đoạn 5 — Trợ lý Linh Thú

Trợ lý có thể đọc hồ sơ species đã xác thực để cá nhân hóa nội dung, nhưng không được tự thay loài hoặc suy ra quyền admin từ dữ liệu client. Role và species vẫn do server xác minh.

## Giai đoạn 6 — Đồng bộ hệ sinh thái

Các ứng dụng HIU TMC dùng member identity và species canonical từ hồ sơ chung. Không tạo profile trùng theo từng thiết bị; không thay species khi role đổi; mọi endpoint/RPC mới phải kế thừa ràng buộc admin Thanh Long và được kiểm thử trước khi cutover.

## Vết kiểm tra

- Migration: supabase/migrations/20260927000000_spirit_pet_shared_profile_admin_dragon_v1.sql
- Contract test: scripts/validate-spirit-pet-admin.mjs
- CI command: npm run validate:spirit-pet-admin
