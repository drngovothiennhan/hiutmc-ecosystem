import { ecosystemApps } from "@/data/apps";
import { plannedSpaces } from "@/data/hub";
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
          <a href="/community/">Cộng đồng</a>
          <a href="/discover/">Khám phá</a>
          <a href="/search/">Tìm kiếm</a>
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.memberLogin} href={ecosystemApps.find((app) => app.slug === "study-os")?.currentUpstreamUrl ?? "/ecosystem/study-os/"} aria-label="Đăng nhập thành viên bằng tài khoản HIU YHCT Study OS hiện có">Đăng nhập thành viên</a>
          <a className={styles.primaryAction} href="/ai/">Mở AI Lab</a>
        </div>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Câu lạc bộ Y học cổ truyền · HIU</span>
          <h1>Học đúng trọng tâm.<br />Kết nối đúng công cụ.</h1>
          <p>
            Một điểm vào gọn cho học liệu, kinh lạc – huyệt vị, công cụ AI và hoạt động học thuật của sinh viên YHCT HIU.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.heroPrimary} href={ecosystemApps.find((app) => app.slug === "study-os")?.currentUpstreamUrl ?? "/ecosystem/study-os/"}>Tiếp tục học</a>
            <a className={styles.heroSecondary} href="#main-content">Khám phá các Hub</a>
          </div>
          <small className={styles.loginNote}>Đăng nhập thành viên dùng Study OS. Đăng nhập chung giữa các ứng dụng đang chờ tích hợp SSO an toàn.</small>
          <div className={styles.heroTags} aria-label="Các nội dung chính">
            <span>Học liệu YHCT</span><span>Kinh lạc · Huyệt vị</span><span>AI hỗ trợ học tập</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <section className={styles.launchPanel} aria-labelledby="launch-title">
            <div className={styles.launchHeading}>
              <div><span className={styles.kicker}>HIU YHCT ECOSYSTEM</span><h2 id="launch-title">Chọn điểm đến</h2></div>
              <span className={styles.launchMark} aria-hidden="true">✦</span>
            </div>
            <div className={styles.quickAppGrid}>
              {ecosystemApps.map((app, index) => (
                <a href={app.currentUpstreamUrl} className={styles.quickAppCard} key={app.slug}>
                  <span className={styles.quickAppIndex}>0{index + 1}</span>
                  <span className={styles.quickAppArrow} aria-hidden="true">↗</span>
                  <strong>{app.shortName}</strong>
                  <small>{app.tagline}</small>
                  <span className={styles.quickAppStatus}>{app.status === "Production" ? "Đang hoạt động" : "Bản xem trước"}</span>
                </a>
              ))}
            </div>
            <p className={styles.launchFoot}>Mở trực tiếp ứng dụng cần dùng, không qua bước xác nhận trung gian.</p>
          </section>
        </div>
      </section>

      <section id="main-content" className={styles.learnSection}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Learning Center</span>
          <h2>Một hành trình học, nhiều công cụ liên kết.</h2>
          <p>
            Đi từ bài học đến quan sát trực quan, luyện tập, hỏi AI rồi quay lại nội dung cần ôn.
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
          <span className={styles.kicker}>Công cụ trong hệ sinh thái</span>
          <h2>Vào thẳng ứng dụng bạn cần.</h2>
          <p>Mỗi ứng dụng giữ nội dung chuyên biệt và mở tại địa chỉ đang hoạt động.</p>
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
      </section>

      <section id="community" className={styles.futureSection}>
        <div className={styles.sectionTitle}>
          <span className={styles.kicker}>Cộng đồng & Khám phá</span>
          <h2>Không gian học thuật được cập nhật có kiểm chứng.</h2>
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
        <a href="/community/"><span>◎</span><small>Cộng đồng</small></a>
        <a href="/discover/"><span>◇</span><small>Khám phá</small></a>
      </nav>

      <footer className={styles.footer}>
        <strong>HIU YHCT Ecosystem</strong>
        <span>Học tập · Kết nối · Cập nhật · Phát triển</span>
      </footer>
    </main>
  );
}
