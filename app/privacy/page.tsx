import type { Metadata } from "next";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description:
    "Cách HIU TMC thu thập, sử dụng, lưu trữ và xóa dữ liệu của người dùng.",
  alternates: { canonical: "/privacy/" },
};

const CONTACT_EMAIL = "clb.yhoccotruyen.hiu@gmail.com";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU TMC</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>HIU TMC · Quyền riêng tư</span>
        <h1>Chính sách quyền riêng tư</h1>
        <p>
          Áp dụng cho website hiutmc.com và ứng dụng Android HIU TMC. Cập nhật lần cuối: 30/09/2026.
        </p>
      </section>

      <div className={styles.body}>
        <section>
          <h2>1. Ai vận hành</h2>
          <p>
            HIU TMC do HIU CLB Y Học cổ truyền vận hành, phục vụ học tập của sinh viên
            Y học cổ truyền. Mọi câu hỏi về dữ liệu xin gửi tới{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p>
            <b>Ghi chú đổi tên:</b> từ 30/09/2026, hệ sinh thái trước đây gọi là “HIU YHCT Ecosystem”
            thống nhất mang tên <b>HIU TMC</b>. Đây chỉ là thay đổi tên gọi; đơn vị vận hành, tài khoản thành viên,
            dữ liệu và cách chúng tôi xử lý dữ liệu không thay đổi. Một số địa chỉ kỹ thuật cũ có thể còn chứa
            “yhct” và vẫn hoạt động bình thường.
          </p>
        </section>

        <section>
          <h2>2. Dữ liệu chúng tôi xử lý</h2>
          <ul>
            <li>
              <b>Tài khoản thành viên:</b> mã sinh viên và mật khẩu dùng để đăng nhập, vai trò trong CLB
              (thành viên, quản trị). Mật khẩu được xác thực qua Supabase Auth và không được lưu dưới dạng văn bản thường.
            </li>
            <li>
              <b>Tiến độ học tập:</b> nhiệm vụ đã hoàn thành, thống kê học tập đồng bộ và hồ sơ linh thú của bạn.
            </li>
            <li>
              <b>Dữ liệu trên thiết bị:</b> điểm trải nghiệm, chuỗi ngày học, huy hiệu và tùy chọn giao diện được
              lưu trong bộ nhớ trình duyệt của bạn và không tự động gửi đi nếu bạn chưa đăng nhập.
            </li>
            <li>
              <b>Ảnh trong A.I Thiệt Chẩn:</b> nếu bạn dùng camera hoặc tải ảnh lên, ảnh được gửi đi phân tích.
              Các ca sau phân tích có thể được lưu vào kho dữ liệu phục vụ cải thiện học máy, không kèm tên hay
              thông tin định danh. Vui lòng không chụp hoặc tải ảnh có thể nhận dạng người khác khi chưa được đồng ý.
            </li>
            <li>
              <b>Báo lỗi và thống kê truy cập:</b> số lượt truy cập trang công khai được đếm tổng hợp (không gắn với
              danh tính) và báo lỗi của Game Hub để sửa sự cố.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Mục đích sử dụng</h2>
          <p>
            Để đăng nhập, đồng bộ tiến độ học giữa các thiết bị, vận hành các công cụ học tập, kiểm duyệt nội dung
            cộng đồng và sửa lỗi. Chúng tôi không bán dữ liệu cá nhân và không dùng cho quảng cáo.
          </p>
        </section>

        <section>
          <h2>4. Lưu trữ và bên xử lý</h2>
          <p>
            Dữ liệu được truyền qua HTTPS và xử lý trên các dịch vụ: Cloudflare (website, mạng phân phối), Supabase
            (đăng nhập và cơ sở dữ liệu), Vercel và GitHub Pages (một số ứng dụng học tập). Các bên này chỉ xử lý dữ
            liệu để vận hành dịch vụ cho HIU TMC.
          </p>
        </section>

        <section>
          <h2>5. Quyền của bạn và xóa dữ liệu</h2>
          <p>
            Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu tài khoản và tiến độ học tập bằng cách gửi email tới{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> với tiêu đề “Yêu cầu dữ liệu HIU TMC” kèm mã
            sinh viên. Chúng tôi phản hồi trong vòng 30 ngày. Dữ liệu lưu trên thiết bị có thể xóa bằng cách xóa dữ
            liệu trang web trong trình duyệt hoặc gỡ ứng dụng.
          </p>
        </section>

        <section>
          <h2>6. Nội dung y học</h2>
          <div className={styles.note}>
            HIU TMC chỉ phục vụ học tập và tham khảo. Kết quả của công cụ, kể cả A.I Thiệt Chẩn, không thay thế
            chẩn đoán, tư vấn hay điều trị của bác sĩ. Khi có vấn đề sức khỏe, hãy gặp cơ sở y tế.
          </div>
        </section>

        <section>
          <h2>7. Trẻ em</h2>
          <p>Dịch vụ dành cho sinh viên và người từ 16 tuổi trở lên, không nhắm tới trẻ em.</p>
        </section>

        <section>
          <h2>8. Thay đổi chính sách</h2>
          <p>Khi chính sách thay đổi, bản mới được đăng tại trang này cùng ngày cập nhật.</p>
        </section>
      </div>
    </main>
  );
}
