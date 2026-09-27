# Linh Thú — Hồ sơ dùng chung và các giai đoạn 1–6

## Quy tắc định danh bắt buộc

- Species của hồ sơ Linh Thú được lưu theo mã chuẩn: thanh_long, chu_tuoc, kim_su, ky_lan, ho_ly, khong_tuoc.
- Với tài khoản có role admin tại thời điểm tạo hồ sơ hoặc chạy migration backfill, server gán species = thanh_long.
- Client không gửi role và không thể ghi species khác cho tài khoản admin. RLS khóa ghi trực tiếp; RPC duy nhất cập nhật species tự đọc role từ hồ sơ club_members và từ chối giá trị khác thanh_long khi role là admin.
- Migration backfill chuẩn hóa hồ sơ của admin hiện hữu. Migration chỉ chạy một lần theo cơ chế migration; role update sau đó không gọi trigger đổi species.
- Đổi role không tự sửa species của hồ sơ đã tồn tại. Nếu role được nâng/hạ sau đó, hồ sơ hiện hữu giữ nguyên; quy tắc admin chỉ áp dụng cho hồ sơ được tạo lần đầu hoặc backfill migration.
- Hồ sơ species dùng `spirit_pet_profiles.member_id` làm khóa chuẩn trên máy chủ; member đã đăng nhập nhận cùng một hồ sơ khi đổi thiết bị. Server RPC là nguồn dữ liệu duy nhất cho loài đã đồng bộ.
- Trong lần đăng nhập đầu sau nâng cấp, client có thể gửi loài hợp lệ từ khóa localStorage cũ `hiutmc-spirit-pet-v1` để khởi tạo hồ sơ chưa có. RPC chỉ dùng giá trị này khi chưa có hồ sơ; admin vẫn luôn nhận `thanh_long`. Sau khi server trả hồ sơ hợp lệ, khóa cũ được xóa khỏi thiết bị. Nếu mạng hoặc RPC lỗi, ứng dụng không trình bày dữ liệu cục bộ như hồ sơ đã đồng bộ và sẽ thử lại ở lần tải sau.
- Không ghi species hồ sơ member vào localStorage sau khi đồng bộ. Bản xem trước loài cho khách chưa đăng nhập chỉ tồn tại trong bộ nhớ và không đồng bộ cho tới khi đăng nhập.
- Hiện chỉ species là dữ liệu Linh Thú được lưu bền vững. Cấp preview chỉ là trạng thái giao diện tạm thời; cấp thật, XP, thân mật, vật phẩm và phần thưởng chưa có dữ liệu hồ sơ và vẫn FROZEN/REVIEW.
- Không backfill hàng loạt member không phải admin về một loài mặc định: lựa chọn cũ có thể chỉ còn trên thiết bị. Hồ sơ cũ được chuyển dần khi mỗi người đăng nhập, để không ghi đè lựa chọn đó.

## Giai đoạn 1 — Hồ sơ dùng chung

Tạo hồ sơ theo member ID, chỉ cho member đọc hồ sơ của mình. Khi hồ sơ mới được tạo, RPC lấy member ID và role từ phiên Supabase phía server. Tài khoản admin luôn được gán Thanh Long, bất kể client gửi yêu cầu species nào. Trigger INSERT của club_members cũng tạo sẵn hồ sơ Thanh Long cho admin mới; backfill chuyển admin hiện có sang Thanh Long mà không sửa loài của member không phải admin.

Tiêu chí nghiệm thu:

- Admin mới nhận thanh_long từ trigger hoặc RPC; client không thể ép giá trị khác.
- Admin hiện có nhận thanh_long sau migration backfill.
- RPC ghi loài từ chối species không phải thanh_long nếu role hiện tại là admin.
- Ghi trực tiếp vào bảng bị từ chối với anon/authenticated.
- Cập nhật role trên một hồ sơ đã có không tự đổi species.
- Member không phải admin giữ species đã có; hồ sơ mới dùng loài cũ hợp lệ chỉ trong lần nhập chuyển tiếp, hoặc server chọn mặc định khi không có giá trị cũ.
- Hồ sơ loài đã xác nhận từ máy chủ hoạt động sau đăng nhập trên thiết bị khác; không còn bản sao species đăng nhập nào được ghi ở localStorage.
- Khóa localStorage cũ chỉ được đọc để khởi tạo hồ sơ thiếu, rồi xóa sau phản hồi thành công từ server; lỗi server không được biến thành fallback cục bộ.
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

Các ứng dụng HIU TMC dùng member identity và species canonical từ hồ sơ chung. Không tạo profile trùng theo từng thiết bị; không thay species khi role đổi; mọi endpoint/RPC mới phải kế thừa ràng buộc admin Thanh Long và được kiểm thử trước khi cutover. Dữ liệu loài đã đồng bộ phải tiếp tục dùng được khi đổi máy. Chỉ mở đồng bộ cấp thật, XP, thân mật, vật phẩm hoặc phần thưởng sau khi có duyệt riêng và thiết kế quyền ghi server-side.

## Vết kiểm tra

- Migration: supabase/migrations/20260927000000_spirit_pet_shared_profile_admin_dragon_v1.sql
- Contract test: scripts/validate-spirit-pet-admin.mjs
- CI command: npm run validate:spirit-pet-admin
