"use client";

import { useEffect, type CSSProperties } from "react";
import HomeIcon, { type HomeIconName } from "@/components/HomeIcon";
import DailyMissions from "@/components/DailyMissions";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import SpiritCompanion from "@/components/SpiritCompanion";
import { canAccessGameHub, GameHubLink, MemberAccount, MemberAuthProvider, StudyOsLink, useMemberAuth } from "@/components/MemberAuthBridge";
import { useHubRegistry } from "@/components/hub-registry";
import styles from "./dashboard.module.css";

const hubMeta: Record<string, { icon: HomeIconName; tone: string }> = {
  "study-os": { icon: "study-os", tone: "#9f1c3b" },
  "atlas": { icon: "atlas-3d", tone: "#2a6d9a" },
  "ai-thiet-chan": { icon: "ai-tongue", tone: "#537d4d" },
  "trung-y-van": { icon: "trung-y-van", tone: "#9a6a32" },
};

const communityItems: Array<{ icon: HomeIconName; title: string; meta: string }> = [
  { icon: "herbal-function", title: "Dược liệu theo công năng", meta: "Mở kho nội dung đã được công bố" },
  { icon: "pathology-yhct", title: "Bệnh học YHCT", meta: "Học theo chủ đề trong hệ sinh thái" },
  { icon: "acupuncture", title: "Châm cứu · Thủ pháp", meta: "Kết nối Atlas và học liệu liên quan" },
];

const events = [
  { day: "—", month: "CLB", title: "Lịch hoạt động học thuật", meta: "Sẽ hiển thị khi dữ liệu CLB được kết nối và xác thực." },
  { day: "—", month: "Học tập", title: "Lịch học & nhắc việc", meta: "Sẽ đồng bộ từ tài khoản thành viên sau khi được duyệt." },
  { day: "—", month: "Cộng đồng", title: "Thông báo cộng đồng", meta: "Chỉ hiển thị nội dung đã được xác thực." },
];

function HomeContent() {
  const apps = useHubRegistry();
  const { openStudyOs, openGameHub, member, ready, learningProgress, learningProgressReady } = useMemberAuth();
  const studyOsUrl = apps.find((app) => app.slug === "study-os")?.launchUrl ?? "/learn/";
  const atlasUrl = apps.find((app) => app.slug === "atlas")?.launchUrl ?? "/ecosystem/atlas/";
  const gameHubUrl = "/apps/game-hub/";
  useEffect(() => {
    if (!ready || !member || !canAccessGameHub(member.role)) return;
    const current = new URL(window.location.href);
    if (current.searchParams.get("open") !== "game-hub") return;
    current.searchParams.delete("open");
    window.history.replaceState(window.history.state, "", current.pathname + current.search + current.hash);
    void openGameHub(gameHubUrl);
  }, [ready, member?.id, member?.role, openGameHub, gameHubUrl]);
  const synced = Boolean(member && learningProgressReady && learningProgress?.hasSync);
  const latestScore = synced ? learningProgress?.lastExamScore ?? null : null;
  const ringLabel = !member ? "—" : !learningProgressReady ? "…" : synced ? (latestScore !== null ? `${latestScore}%` : "✓") : "—";
  const progressTitle = !member
    ? "Chưa đăng nhập"
    : !learningProgressReady
      ? "Đang kiểm tra đồng bộ"
      : synced
        ? "Đã đồng bộ Study OS"
        : "Chưa có bản đồng bộ thành công";
  const progressDetail = !member
    ? "Đăng nhập thành viên để đọc dữ liệu học tập đã xác thực."
    : !learningProgressReady
      ? "Đang đọc dữ liệu học tập từ máy chủ."
      : synced && learningProgress
        ? `Streak ${learningProgress.streak} ngày · ${learningProgress.todayQuestions} câu hôm nay · ${learningProgress.xp} XP${latestScore !== null ? ` · Điểm gần nhất ${latestScore}%` : ""}.`
        : "Mở Study OS một lần để gửi lại dữ liệu học tập sau bản sửa đồng bộ.";
  const ringClass = [styles.ring, synced && latestScore === null ? styles.ringSyncedNoScore : "", !synced ? styles.ringSyncPending : ""].filter(Boolean).join(" ");
  const ringStyle = synced && latestScore !== null
    ? ({ background: `conic-gradient(#219d6e 0 ${latestScore}%,#e6dfd2 ${latestScore}%)` } as CSSProperties)
    : undefined;

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Điều hướng hệ sinh thái">
        <a className={styles.brand} href="#top">
          <img src="/hiu-club-logo.webp" alt="HIU YHCT" width="44" height="44" />
          <span><strong>HIU YHCT</strong><small>TMC ECOSYSTEM</small></span>
        </a>
        <nav className={styles.nav}>
          <a href="#top"><i>⌂</i>Trang chủ</a>
          <StudyOsLink href={studyOsUrl}><i>▤</i>Học tập</StudyOsLink>
          <GameHubLink href={gameHubUrl}><i>♧</i>Game Hub</GameHubLink>
          <a href={atlasUrl}><i>◎</i>Atlas 3D</a>
          <a href="/ai/"><i>◈</i>AI YHCT</a>
          <a href="/community/"><i>♧</i>Cộng đồng</a>
          <a href="/discover/"><i>⌕</i>Khám phá</a>
        </nav>
        <div className={styles.sideBottom}>
          <strong>TRI THỨC CỔ TRUYỀN</strong>
          <span>Kiến tạo tương lai bằng một hệ sinh thái học tập liền mạch.</span>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.crumb}><b>Trang chủ</b><span>›</span><span>Tổng quan</span></div>
          <a className={styles.search} href="/search/" aria-label="Tìm kiếm toàn hệ sinh thái">⌕ <span>Tìm kiếm bài học, vị thuốc, huyệt, hội chứng, tài liệu...</span></a>
          <div className={styles.topActions}>
            <a className={styles.bell} href="#missions" aria-label="Thông báo">♢</a>
            <DisplayModeToggle />
            <MemberAccount studyOsUrl={studyOsUrl} />
          </div>
        </header>

        <section id="top" className={styles.hero}>
          <small>HIU YHCT DIGITAL CAMPUS</small>
          <h1>Chào mừng trở lại, <span>{member?.fullName || "HIU YHCT"}!</span></h1>
          <p>Một điểm vào thống nhất cho học tập, Atlas 3D, AI, Trung Y Văn và hoạt động học thuật của cộng đồng HIU.</p>
          <div className={styles.heroMark}>Dưỡng Tâm<br />Học Thuật<br />Hành Y Đạo</div>
        </section>

        <div className={styles.grid}>
          <section className={styles.mainColumn}>
            <article className={styles.continueCard}>
              <div className={styles.lessonThumb} aria-hidden="true" />
              <div className={styles.continueCopy}>
                <small>TIẾP TỤC HỌC TẬP</small>
                <h2>Tiếp tục bài học gần nhất</h2>
                <p>Mở Study OS để xem bài đang học và tiến độ thật của bạn.</p>
              </div>
              <a className={styles.continueButton} href={studyOsUrl} aria-label="Tiếp tục trong Study OS" onClick={(event) => { event.preventDefault(); void openStudyOs(studyOsUrl); }}>Tiếp tục <span aria-hidden="true">→</span></a>
            </article>

            <section id="ecosystem" className={styles.panel}>
              <header className={styles.panelHead}>
                <span><small>Core Hubs</small><h2>Khám phá hệ sinh thái HIU YHCT</h2></span>
                <a href="/discover/">Xem tất cả →</a>
              </header>
              <div className={styles.hubGrid}>
                {apps.map((app) => {
                  const meta = hubMeta[app.slug] ?? { icon: "nav-ai", tone: app.accent };
                  return (
                    <a key={app.slug} className={styles.hub} href={app.launchUrl} data-app-transition={app.slug === "study-os" ? undefined : ""} onClick={app.slug === "study-os" ? (event) => { event.preventDefault(); void openStudyOs(app.launchUrl); } : undefined} style={{ "--hub": meta.tone } as CSSProperties}>
                      <span className={styles.hubIcon}><HomeIcon name={meta.icon} /></span>
                      <strong>{app.shortName}</strong>
                      <p>{app.tagline}</p>
                      <b>Mở ứng dụng →</b>
                    </a>
                  );
                })}
                <GameHubLink href={gameHubUrl} className={styles.hub} style={{ "--hub": "#4d704c" } as CSSProperties}>
                  <span className={styles.hubIcon}><HomeIcon name="herbal-function" /></span>
                  <strong>Game Hub</strong>
                  <p>Đăng nhập tài khoản HIU TMC để mở Gia Viên Dược Thảo.</p>
                  <b>Mở ứng dụng →</b>
                </GameHubLink>
              </div>
            </section>

            <div className={styles.lowerGrid}>
              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <span><small>Học cùng cộng đồng</small><h2>Cộng đồng HIU YHCT</h2></span>
                  <a href="/community/">Xem thêm →</a>
                </header>
                <div className={styles.communityGrid}>
                  {communityItems.map((item) => (
                    <article className={styles.communityItem} key={item.title}>
                      <span className={styles.communityIcon}><HomeIcon name={item.icon} /></span><strong>{item.title}</strong><small>{item.meta}</small>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <span><small>Lịch học thuật</small><h2>Sự kiện & hoạt động</h2></span>
                </header>
                <div className={styles.events}>
                  {events.map((event) => (
                    <article className={styles.event} key={event.day + event.title}>
                      <b>{event.day}<br />{event.month}</b>
                      <span><strong>{event.title}</strong><small>{event.meta}</small></span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <aside className={styles.rightRail}>
            <section className={styles.progressCard}>
              <div className={ringClass} style={ringStyle}><strong>{ringLabel}</strong></div>
              <div className={styles.progressText}><small>Tiến độ học tập</small><strong>{progressTitle}</strong><span>{progressDetail}</span></div>
            </section>

            <section id="missions" className={styles.missionWrap}>
              <DailyMissions apps={apps} />
            </section>

            <section className={styles.noticeCard}>
              <h3>Thông báo gần đây</h3>
              <ul>
                <li><i>✓</i><span>Nhắc tiếp tục bài học đang dở trong Study OS.</span></li>
                <li><i>◎</i><span>Khám phá một mô hình kinh lạc mới trong Atlas 3D.</span></li>
                <li><i>✦</i><span>Linh thú sẽ gom nhắc học và hoạt động quan trọng vào một góc nhỏ.</span></li>
              </ul>
            </section>
          </aside>
        </div>

        <footer className={styles.footer}>
          <strong>HIU YHCT Ecosystem</strong>
          <span>Tri thức cổ truyền · Công nghệ hiện đại · Vì cộng đồng khỏe mạnh hơn</span>
        </footer>
      </div>

      <nav className={styles.mobileDock} aria-label="Điều hướng nhanh trên điện thoại">
        <a href="#top"><i><HomeIcon name="nav-home" /></i><span>Trang chủ</span></a>
        <StudyOsLink href={studyOsUrl}><i><HomeIcon name="nav-study" /></i><span>Học tập</span></StudyOsLink>
        <a href={atlasUrl}><i><HomeIcon name="nav-atlas" /></i><span>Atlas</span></a>
        <a href="/ai/"><i><HomeIcon name="nav-ai" /></i><span>AI</span></a>
        <a href="/community/"><i><HomeIcon name="nav-community" /></i><span>Cộng đồng</span></a>
      </nav>

      <SpiritCompanion />
    </main>
  );
}

export default function Home() {
  return <MemberAuthProvider><HomeContent /></MemberAuthProvider>;
}
