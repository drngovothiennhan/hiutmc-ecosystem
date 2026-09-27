"use client";

import { useEffect, useState, type CSSProperties } from "react";
import HomeIcon, { type HomeIconName } from "@/components/HomeIcon";
import DailyMissions from "@/components/DailyMissions";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import SpiritCompanion from "@/components/SpiritCompanion";
import { canAccessGameHub, GameHubLink, MemberAccount, MemberAuthProvider, StudyOsLink, useMemberAuth } from "@/components/MemberAuthBridge";
import { useHubRegistry } from "@/components/hub-registry";
import { createLearningPlan } from "@/data/personalized-learning";
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

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Thời điểm không xác định";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function HomeContent() {
  const apps = useHubRegistry();
  const { openStudyOs, openGameHub, member, ready, learningProgress, learningProgressReady, personalLearningSnapshot, personalLearningSnapshotStatus, notifications, unreadNotificationCount, notificationsStatus, markAllNotificationsRead } = useMemberAuth();
  const [notificationActionError, setNotificationActionError] = useState(false);
  const studyOsUrl = apps.find((app) => app.slug === "study-os")?.launchUrl ?? "/learn/";
  const registerUrl = new URL(studyOsUrl, "https://hiutmc.com");
  registerUrl.searchParams.set("auth", "register");
  const atlasApp = apps.find((app) => app.slug === "atlas");
  const atlasUrl = atlasApp?.launchUrl ?? "/ecosystem/atlas/";
  const thietChanApp = apps.find((app) => app.slug === "ai-thiet-chan");
  const thietChanUrl = thietChanApp?.launchUrl ?? "/apps/thietchan/";
  const trialGameUrl = "/apps/game-hub/y-quan-live/interview/?trial=1";
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
  const learningPlan = createLearningPlan(personalLearningSnapshot);
  const showNotificationInbox = Boolean(member && (notificationsStatus !== "ready" || unreadNotificationCount > 0));

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
            {showNotificationInbox && <a className={styles.bell} href="#notifications" aria-label={`Thông báo, ${unreadNotificationCount} chưa đọc`}>
              ♢<span className={styles.bellBadge} aria-hidden="true">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>
            </a>}
            <DisplayModeToggle />
            <MemberAccount studyOsUrl={studyOsUrl} />
          </div>
        </header>

        <section id="top" className={styles.hero}>
          <small>HIU YHCT DIGITAL CAMPUS</small>
          <h1>Chào mừng trở lại, <span>{member?.fullName || "HIU YHCT"}!</span></h1>
          <p>Một điểm vào thống nhất cho học tập, Atlas 3D, AI, Trung Y Văn và hoạt động học thuật của cộng đồng HIU.</p>
          <div className={styles.heroCtas}>
            {ready && !member && <StudyOsLink className={styles.heroJoin} href={registerUrl.toString()}>Đăng ký thành viên <span aria-hidden="true">↗</span></StudyOsLink>}
            <a className={styles.heroTry} href={trialGameUrl}>Chơi thử Y Quán <span aria-hidden="true">→</span></a>
          </div>
          
          <div className={styles.heroMark}>Dưỡng Tâm<br />Học Thuật<br />Hành Y Đạo</div>
        </section>

        <section className={styles.entryShowcase} aria-labelledby="entry-showcase-title">
          <header className={styles.entryShowcaseHead}>
            <span><small>TRẢI NGHIỆM HỆ SINH THÁI</small><h2 id="entry-showcase-title">Xem trước công cụ đang có</h2></span>
            <span>Thông tin lấy từ cấu hình ứng dụng hiện hành</span>
          </header>
          <div className={styles.entryCards}>
            <a className={styles.entryCard} href={atlasUrl}>
              <span className={styles.entryKind}>3D ATLAS · {atlasApp?.status ?? "Preview"}</span>
              <strong>{atlasApp?.name ?? "3D Atlas"}</strong>
              <p>{atlasApp?.description ?? "Mô hình tương tác để học huyệt vị, kinh lạc và các mốc giải phẫu."}</p>
              <b>Mở Atlas 3D →</b>
            </a>
            <a className={styles.entryCard} href={thietChanUrl}>
              <span className={styles.entryKind}>CÔNG CỤ HỌC TẬP · {thietChanApp?.status ?? "Production"}</span>
              <strong>{thietChanApp?.name ?? "A.I Thiệt Chẩn"}</strong>
              <p>{thietChanApp?.description ?? "Học quan sát và đối chiếu đặc điểm lưỡi trong bối cảnh giáo dục YHCT."}</p>
              <b>Mở A.I Thiệt Chẩn →</b>
            </a>
            <a className={styles.entryCard} href={trialGameUrl}>
              <span className={styles.entryKind}>GAME HUB · DÙNG THỬ</span>
              <strong>Y Quán · Luyện Thập vấn</strong>
              <p>Thử một ca mô phỏng có sẵn trên Game Hub, không cần đăng nhập. Bản dùng thử không lưu tiến độ.</p>
              <b>Chơi thử một ca →</b>
            </a>
          </div>
        </section>

        <div className={styles.grid}>
          <section className={styles.mainColumn}>
            <section className={styles.personalizedPanel} aria-labelledby="personalized-learning-title">
              <div className={styles.personalizedLayout}>
                <div className={styles.personalizedThumb} role="img" aria-label="Minh họa phong cảnh cổng làng và kiến trúc cổ" />
                <div className={styles.personalizedContent}>
                  <header className={styles.personalizedHeader}>
                    <span><small>CÁ NHÂN HÓA HỌC TẬP</small><h2 id="personalized-learning-title">Hôm nay nên ôn gì</h2></span>
                    <span className={styles.personalizedBadge}>Theo tiến độ đã đồng bộ</span>
                  </header>
                  <small className={styles.personalizedContinueLabel}>TIẾP TỤC HỌC TẬP</small>
                  {!member ? (
                    <p className={styles.personalizedEmpty}>Đăng nhập thành viên để xem gợi ý dựa trên tiến độ học tập của bạn.</p>
                  ) : personalLearningSnapshotStatus === "loading" ? (
                    <p className={styles.personalizedEmpty} role="status">Đang đọc tiến độ học tập đã đồng bộ…</p>
                  ) : personalLearningSnapshotStatus === "error" ? (
                    <p className={styles.personalizedEmpty} role="alert">Chưa đọc được tiến độ học tập từ máy chủ. Hãy thử tải lại trang hoặc mở Study OS.</p>
                  ) : (
                    <>
                      <article className={styles.personalizedPlan}>
                        <small>BÀI HỌC TIẾP THEO</small>
                        <strong>{learningPlan.nextTitle}</strong>
                        <p>{learningPlan.nextDetail}</p>
                      </article>
                      {personalLearningSnapshotStatus === "ready" && learningPlan.summaryState === "ready" ? (
                        <div className={styles.personalizedSummary} aria-live="polite">
                          {learningPlan.summary.map((sentence) => <p key={sentence}>{sentence}</p>)}
                        </div>
                      ) : personalLearningSnapshotStatus === "empty" ? (
                        <p className={styles.personalizedEmpty}>Tài khoản chưa có snapshot tiến độ được đồng bộ. Chưa thể tạo tóm tắt học tập cá nhân hôm nay.</p>
                      ) : null}
                    </>
                  )}
                  <StudyOsLink className={styles.personalizedLink} href={studyOsUrl}>
                    Mở Study OS <span aria-hidden="true">→</span>
                  </StudyOsLink>
                </div>
              </div>
            </section>

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
              <div className={ringClass} style={ringStyle}>
                {synced && latestScore === null ? <span className={styles.progressEmblem} aria-label="Biểu trưng Study OS"><HomeIcon name="study-os" /></span> : <strong>{ringLabel}</strong>}
              </div>
              <div className={styles.progressText}><small>Tiến độ học tập</small><strong>{progressTitle}</strong><span>{progressDetail}</span></div>
            </section>

            <section id="missions" className={styles.missionWrap}>
              <DailyMissions apps={apps} />
            </section>

            {showNotificationInbox && <section id="notifications" className={styles.noticeCard} aria-labelledby="notifications-title">
              <header className={styles.noticeHeader}>
                <h3 id="notifications-title">Thông báo gần đây</h3>
                {unreadNotificationCount > 0 && <button type="button" onClick={() => { setNotificationActionError(false); void markAllNotificationsRead().catch(() => setNotificationActionError(true)); }}>Đánh dấu đã đọc tất cả</button>}
              </header>
              {notificationsStatus === "loading" ? (
                <p className={styles.notificationState} role="status">Đang tải thông báo đã đồng bộ…</p>
              ) : notificationsStatus === "error" ? (
                <p className={styles.notificationState} role="alert">Chưa tải được thông báo từ máy chủ. Hãy thử tải lại trang.</p>
              ) : (
                <ul>
                  {notifications.filter((notification) => !notification.read_at).slice(0, 3).map((notification) => (
                    <li key={notification.id} className={styles.notificationUnread}>
                      <i aria-hidden="true">•</i>
                      <span><strong>{notification.title}</strong><span>{notification.body}</span><small>{formatNotificationTime(notification.created_at)}</small></span>
                    </li>
                  ))}
                </ul>
              )}
              {notificationActionError && <p className={styles.notificationError} role="alert">Chưa đánh dấu được thông báo. Hãy thử lại.</p>}
            </section>}
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
