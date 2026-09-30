# HIU TMC lên Google Play — Bộ hướng dẫn (cách đơn giản nhất)

Hiện trạng đã kiểm tra trên hiutmc.com: HTTPS ok, `manifest.webmanifest` đủ (name, start_url "/", display standalone, icon 192 và 512 maskable, theme #981b36), service worker `/sw.js` có offline fallback. **Đủ điều kiện đóng gói TWA, không cần sửa code.**

Chọn: **PWABuilder → TWA**. Nó tự tạo file .aab đã ký, keystore và assetlinks.json. Không cần cài Android Studio.

---

## Phần A — Việc bạn làm (khoảng 30 phút)

### A1. Tạo gói .aab bằng PWABuilder
1. Vào https://www.pwabuilder.com, nhập `https://hiutmc.com`, bấm Start.
2. Bấm **Package for stores → Android → Generate Package**.
3. Điền:
   - Package ID: `com.hiutmc.app` (đặt xong không đổi được trên Play)
   - App name: `HIU TMC`
   - Launcher name: `HIU TMC`
   - App version: `1.0.0`, version code: `1`
   - Host: `hiutmc.com`, Start URL: `/`
   - Display: Standalone, Status bar color: `#981b36`
   - Signing key: chọn **Create new**, đặt mật khẩu (ghi lại!)
4. Tải file zip về. Trong zip có:
   - `*.aab` (file nộp lên Play)
   - `signing.keystore` và `signing-key-info.txt` (**sao lưu 2 nơi, mất là không cập nhật app được nữa**; tốt nhất bật Play App Signing ở bước A3)
   - `assetlinks.json` (dùng ở A2)

### A2. Đưa assetlinks.json lên website
Đặt file vào repo web, đường dẫn cuối cùng phải mở được:
`https://hiutmc.com/.well-known/assetlinks.json`

- Trên Cloudflare Pages: tạo thư mục `public/.well-known/` (hoặc thư mục output của bạn) rồi thêm file.
- Nếu dùng Play App Signing (khuyên dùng), lấy SHA-256 của **App signing key** trong Play Console (Setup → App signing) và thêm vào mảng `sha256_cert_fingerprints` cùng với SHA-256 của upload key. Xem mẫu `assetlinks.template.json`.
- Kiểm tra: mở link trên trình duyệt phải thấy JSON, không bị chuyển hướng, không có trang HTML bọc.

### A3. Tạo app trong Play Console
1. Play Console → **Create app**: tên `HIU TMC`, ngôn ngữ mặc định Tiếng Việt, loại App, miễn phí.
2. **Bật Play App Signing** khi tải bản đầu tiên.
3. Vào **Testing → Closed testing (hoặc Internal testing trước)** → Create release → tải file `.aab`.
4. Điền các mục bắt buộc trong Dashboard (xem Phần B).

### A4. Nếu là tài khoản cá nhân (tạo sau 11/2023)
Google yêu cầu **closed testing tối thiểu 12 tester, liên tục 14 ngày** rồi mới xin được production. Cách làm:
- Tạo một Google Group, thêm 12+ email tester (bạn bè, sinh viên CLB), thêm group đó vào track closed testing.
- Tester bấm link opt-in và cài app, giữ cài đặt trong 14 ngày.
- Sau đó bấm **Apply for production** và trả lời vài câu hỏi.
Tài khoản tổ chức thì bỏ qua bước này.

---

## Phần B — Nội dung điền sẵn cho Play Console

**Tên app (≤30 ký tự):** HIU TMC – Học Y học cổ truyền

**Mô tả ngắn (≤80 ký tự):**
Study OS, Atlas 3D huyệt vị, AI Thiệt Chẩn và cộng đồng học YHCT.

**Mô tả đầy đủ:**
HIU TMC là cổng học tập số dành cho sinh viên Y học cổ truyền HIU, gom các công cụ vào một ứng dụng:

• Study OS: học tập, ôn luyện, theo dõi tiến độ.
• Atlas 3D: mô hình tương tác huyệt vị và kinh lạc.
• A.I Thiệt Chẩn: khu trải nghiệm AI hỗ trợ học quan sát và đối chiếu đặc điểm lưỡi.
• Trung Y Văn: kho tri thức Y học cổ truyền.
• Game Hub và Y Quán: luyện tập qua tình huống mô phỏng.
• Cộng đồng: chia sẻ và học cùng nhau.

Lưu ý: Nội dung chỉ phục vụ học tập và giáo dục, không thay thế chẩn đoán, tư vấn hay điều trị của bác sĩ.

**Danh mục:** Education. **Email liên hệ:** (email của bạn). **Website:** https://hiutmc.com

**Hình ảnh cần chuẩn bị:**
- Icon 512×512 (dùng `https://hiutmc.com/icons/icon-512.png`)
- Feature graphic 1024×500
- Ít nhất 2 ảnh chụp màn hình điện thoại (nên 4–8): trang chủ, Study OS, Atlas 3D, AI Thiệt Chẩn

**Các form khai báo cần lưu ý:**
- **Privacy policy URL:** bắt buộc, ví dụ https://hiutmc.com/privacy (cần tạo trang này; mẫu bên dưới).
- **Data safety:** khai báo có thu thập email/tên tài khoản, tiến độ học tập; có ảnh/dữ liệu lưỡi nếu A.I Thiệt Chẩn cho tải ảnh; mã hóa khi truyền (HTTPS); người dùng có thể yêu cầu xóa dữ liệu (cần link hoặc cách xóa).
- **Health apps declaration:** có khai báo cho ứng dụng liên quan sức khỏe. Chọn hướng giáo dục, không chẩn đoán/điều trị.
- **Content rating:** làm bảng câu hỏi IARC, chọn giáo dục, không bạo lực/cờ bạc.
- **Target audience:** 18+ hoặc 13+ (tránh chọn dưới 13 để không dính chính sách trẻ em).
- **Ads:** không có quảng cáo. **App access:** nếu có phần cần đăng nhập, cung cấp tài khoản test cho reviewer (Study OS đăng nhập → tạo sẵn 1 tài khoản demo).

---

## Phần C — Mẫu trang chính sách quyền riêng tư (đặt tại /privacy)

**Chính sách quyền riêng tư – HIU TMC**
Cập nhật: 30/09/2026

1. **Đơn vị vận hành:** [Tên bạn/CLB/đơn vị], liên hệ [email].
2. **Dữ liệu thu thập:** thông tin tài khoản (tên hiển thị, email), tiến độ học tập, cài đặt cá nhân; nếu dùng A.I Thiệt Chẩn: hình ảnh do người dùng tải lên để phân tích trong bối cảnh học tập [xác nhận lại với hệ thống thật].
3. **Mục đích sử dụng:** cung cấp tính năng học tập, đồng bộ tiến độ, cải thiện ứng dụng. Không bán dữ liệu cho bên thứ ba.
4. **Lưu trữ và bảo mật:** dữ liệu truyền qua HTTPS, lưu trên hạ tầng đám mây [Cloudflare/Supabase... điền đúng thực tế].
5. **Nội dung y học:** ứng dụng phục vụ giáo dục, không thay thế chẩn đoán hoặc điều trị y khoa.
6. **Quyền của bạn:** yêu cầu xem, sửa, xóa dữ liệu bằng cách gửi email đến [email]; chúng tôi xử lý trong vòng [30] ngày.
7. **Thay đổi:** nếu chính sách đổi, bản mới được đăng tại trang này.

(Bạn cần đối chiếu mục 2 và 4 với hệ thống thực tế trước khi đăng.)

---

## Phần D — Cập nhật sau này
Sửa web là app tự cập nhật, không cần nộp lại. Chỉ phải nộp bản .aab mới khi đổi icon, tên, màu, package hoặc nâng phiên bản TWA (tăng version code lên 2, 3...).
