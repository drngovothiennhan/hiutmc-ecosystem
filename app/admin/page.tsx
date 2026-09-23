import type { Metadata } from "next";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Quản trị",
  description: "Thông tin về quyền truy cập quản trị HIU YHCT Ecosystem.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Trở về HIU YHCT Ecosystem">
          <img src="/favicon.svg" width="38" height="38" alt="" />
          <span><strong>HIU YHCT</strong><small>ECOSYSTEM</small></span>
        </a>
        <a className={styles.homeLink} href="/">← Trang chính</a>
      </header>

      <section className={styles.card} aria-labelledby="admin-title">
        <div className={styles.icon} aria-hidden="true">⌑</div>
        <p className={styles.kicker}>Khu vực quản trị</p>
        <h1 id="admin-title">Đăng nhập Admin</h1>
        <p className={styles.lead}>Lối vào quản trị đã được đặt tại đây để quản trị viên dễ tìm từ trang chính.</p>
        <div className={styles.notice} role="status">
          <strong>Đăng nhập quản trị chưa được kích hoạt</strong>
          <p>Hub hiện được xuất bản dưới dạng website tĩnh và chưa kết nối hệ thống xác thực Admin phía máy chủ. Vì vậy, trang này chưa nhận mật khẩu và chưa mở bảng điều khiển.</p>
        </div>
        <p className={styles.guidance}>Không nhập hoặc gửi mật khẩu tại trang này. Khi hệ thống xác thực và phân quyền được kết nối, liên kết này sẽ dẫn tới màn hình đăng nhập bảo mật.</p>
        <a className={styles.backButton} href="/">Trở về trang chính</a>
      </section>

      <footer className={styles.footer}>HIU YHCT Ecosystem · Quyền quản trị cần được xác minh ở máy chủ</footer>
    </main>
  );
}
