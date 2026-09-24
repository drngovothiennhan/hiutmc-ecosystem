# PROMPT TRIỂN KHAI UI HIU YHCT DIGITAL CAMPUS + LINH THÚ GÓC NHỎ

## Vai trò
Bạn là Senior Product Designer + Senior Front-end Engineer phụ trách repo `drngovothiennhan/hiutmc-ecosystem`. Mục tiêu là tái hiện bản mockup HIU YHCT Digital Campus đã duyệt với độ tương đồng thị giác và hành vi 95–99% trong giới hạn kỹ thuật của Next.js static export và Cloudflare Workers Assets.

## Nguyên tắc khóa
1. Không phá các Hub đang hoạt động, URL upstream, PWA, Admin Center, dữ liệu nhiệm vụ và các route ổn định.
2. Trang chủ phải trở thành một dashboard liền mạch, không còn cảm giác nhiều section rời rạc.
3. PC dùng sidebar + topbar + canvas chính + right rail. Mobile dùng một cột + bottom navigation.
4. 4 Hub cốt lõi chỉ xuất hiện như một cụm điều hướng chính, không lặp lại nhiều lần.
5. Linh thú chỉ là góc trợ lý nhỏ, không chiếm layout chính, thay vai trò trợ lý anime.
6. Người dùng chỉ được nhận ngẫu nhiên 1 linh thú lần đầu; lựa chọn được lưu bền vững. Các loài: Rồng, Phụng Hoàng, Nhân Sư, Kỳ Lân, Khổng Tước, Hồ Ly.
7. Mỗi loài có idle motion riêng; ưu tiên CSS/SVG 2D–2.5D nhẹ. Không kéo thư viện nặng.
8. Linh thú phụ trách nhắc học, thông báo, quà và tiến hóa. Ở giai đoạn đầu chỉ bật phần an toàn; tiến hóa/sync account được khóa cho tới khi backend được duyệt.
9. Mọi phần phụ phát sinh sau khi giao diện chính hoàn tất phải đóng băng, gắn nhãn REVIEW/FROZEN và không đưa lên production trước thẩm định.
10. Không merge production khi visual QA, mobile QA, build và route smoke chưa đạt.

## Giai đoạn
### Phase 1 — Shell + visual parity
- Dựng sidebar, topbar, welcome hero, continue-learning card, Core Hubs, community/events, progress right rail.
- Responsive 1440px, 1024px, 390px.
- Giữ target click >= 44px trên mobile.
- Không dùng layout desktop thu nhỏ máy móc cho mobile.

### Phase 2 — Spirit Companion
- Component riêng, state lưu localStorage.
- Random đúng một lần.
- SVG/2D lightweight, animation khác nhau theo loài.
- Desktop đặt fixed ở góc phải dưới; mobile đặt ngay trên bottom bar.
- Panel mở rộng <= 330px, tự đóng, không che nội dung chính.
- Thông báo ưu tiên học tập, nhiệm vụ, hoạt động CLB.

### Phase 3 — Functional integration
- Kết nối dữ liệu nhiệm vụ thật.
- Kết nối auth/member nếu có API ổn định.
- XP/thân mật, quà, tiến hóa chỉ bật sau khi có storage/backend chính thức.
- Không bịa tiến độ hoặc thông báo cá nhân.

### Phase 4 — QA & preview
- npm run check.
- Kiểm tra 1440x900, 1024x768, 390x844.
- Kiểm tra no overflow, dock không che CTA, pet không che nhiệm vụ.
- Deploy worker preview riêng, không dùng route hiutmc.com.
- Tạo checkpoint commit + PR trước khi xin duyệt merge.

## Acceptance
- Bố cục, tỷ lệ, màu, khoảng trắng và hierarchy tiệm cận mockup 95–99%.
- Mobile mượt, không xuất hiện vùng trống vô nghĩa.
- Pet chiếm tối đa khoảng 8–12% viewport ở trạng thái đóng.
- Production không thay đổi trước khi duyệt.
