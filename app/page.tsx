import EcosystemMap from "@/components/EcosystemMap";
import { ecosystemApps } from "@/data/apps";
import { hubPillars, learningShortcuts, plannedSpaces } from "@/data/hub";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#main-content">Bỏ qua đến nội dung chính</a>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="HIU YHCT Ecosystem">
          <img src="/favicon.svg" width="42" height="42" alt="" />
          <span><strong>HIU YHCT</strong><small>ECOSYSTEM</small></span>
        </a>
        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          <a href="/learn/">Học tập</a>
          <a href="/ai/">AI Lab</a>
          <a href="#community">Cộng đồng</a>
          <a href="#discover">Khám phá</a>
        </nav>
        <a className={styles.primaryAction} href="/ai/">Mở AI Lab</a>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Câu lạc bộ Y học cổ truyền · HIU</span>
          <h1>Học tinh hoa YHCT.<br />Kết nối tương lai.</h1>
          <p>
            Một cổng chung để học tập, sử dụng công cụ AI, khám phá kinh lạc – huyệt vị,
            trao đổi học thuật và theo dõi các hoạt động của cộng đồng HIU YHCT.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.heroPrimary} href="/learn/">Bắt đầu học</a>
            <a className={styles.heroSecondary} href="#ecosystem">Mở công cụ</a>
          </div>
          <div className={styles.pillarRow}>
            {hubPillars.map((item) => (
              <article key={item.title}>
                <span>{item.icon}</span>
                <div><strong>{item.title}</strong><small>{item.body}</small></div>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <img src="/academy-world.webp" alt="" />
          <div className={styles.heroVisualBadge}>
            <strong>Học tập • Kết nối • Cập nhật</strong>
            <span>Hệ sinh thái số dành cho sinh viên YHCT HIU</span>
          </div>
        </div>
      </section>

      <section id="main-content" className={styles.today}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Hôm nay tại HIU YHCT</span>
          <h2>Đi thẳng tới việc bạn cần làm.</h2>
        </div>
        <div className={styles.shortcutGrid}>
          {learningShortcuts.map((item, index) => (
            <a key={item.label} href={item.href} className={styles.shortcutCard}>
              <span className={styles.shortcutIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section id="learn" className={styles.learnSection}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Learning Center</span>
          <h2>Một hành trình học, nhiều công cụ liên kết.</h2>
          <p>
            Cấu trúc mới ưu tiên luồng: đọc kiến thức → quan sát trực quan → luyện tập →
            hỏi AI → quay lại nội dung cần ôn, thay vì để sinh viên tự tìm giữa nhiều ứng dụng rời rạc.
          </p>
        </div>
        <div className={styles.learningFlow}>
          {["Bài học", "Atlas 3D", "Flashcard / Quiz", "AI hỗ trợ", "Ôn lại"].map((item, index) => (
            <div key={item} className={styles.flowItem}>
              <span>{index + 1}</span><strong>{item}</strong>
            </div>
          ))}
        </div>
        <a className={styles.inlineCta} href="/learn/">Mở Learning Center →</a>
      </section>

      <section id="ecosystem" className={styles.ecosystem}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Công cụ đang hoạt động</span>
          <h2>Chạm một lần, vào thẳng ứng dụng.</h2>
          <p>Không hiển thị bước xác nhận trung gian. Mỗi ứng dụng giữ chuyên môn riêng nhưng cùng xuất phát từ một Hub.</p>
        </div>
        <div className={styles.appGrid}>
          {ecosystemApps.map((app) => (
            <a href={app.currentUpstreamUrl} className={styles.appCard} key={app.slug}>
              <div className={styles.appMeta}><span>{app.status}</span><small>{app.tagline}</small></div>
              <h3>{app.name}</h3>
              <p>{app.description}</p>
              <b>Mở ứng dụng ↗</b>
            </a>
          ))}
        </div>
        <div className={styles.mapPanel}>
          <div>
            <span className={styles.kicker}>Bản đồ hệ sinh thái</span>
            <h3>Giữ lại hình ảnh nhận diện hiện có, nhưng đặt sau các tác vụ học tập chính.</h3>
          </div>
          <EcosystemMap />
        </div>
      </section>

      <section id="community" className={styles.futureSection}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Cộng đồng & Khám phá</span>
          <h2>Mở rộng có kiểm soát, không công bố tính năng chưa có backend.</h2>
        </div>
        <div className={styles.futureGrid}>
          {plannedSpaces.map((space) => (
            <article key={space.title} id={space.title === "Discover" ? "discover" : undefined}>
              <span>{space.status}</span>
              <h3>{space.title}</h3>
              <p>{space.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contact}>
        <div>
          <span className={styles.kicker}>Liên hệ & trao đổi học thuật</span>
          <h2>HIU CLB Y Học cổ truyền</h2>
        </div>
        <address>
          <a href="mailto:clb.yhoccotruyen.hiu@gmail.com">📩 clb.yhoccotruyen.hiu@gmail.com</a>
          <span>🌐 Fanpage: HIU CLB Y Học cổ truyền</span>
          <a href="https://www.tiktok.com/@hiu.clb.yhoccotruyen">🎵 @hiu.clb.yhoccotruyen</a>
          <span>📍 215 Điện Biên Phủ, phường Gia Định, Thành phố Hồ Chí Minh</span>
        </address>
      </section>

      <nav className={styles.mobileDock} aria-label="Điều hướng nhanh trên điện thoại">
        <a href="#top"><span>⌂</span><small>Trang chủ</small></a>
        <a href="/learn/"><span>▤</span><small>Học tập</small></a>
        <a href="/ai/"><span>✦</span><small>AI Lab</small></a>
        <a href="#community"><span>◎</span><small>Cộng đồng</small></a>
        <a href="#discover"><span>◇</span><small>Khám phá</small></a>
      </nav>

      <footer className={styles.footer}>
        <strong>HIU YHCT Ecosystem</strong>
        <span>Học tập · Kết nối · Cập nhật · Phát triển</span>
      </footer>
    </main>
  );
}
