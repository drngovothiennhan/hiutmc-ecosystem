"use client";

import type { CSSProperties } from "react";
import DailyMissions from "@/components/DailyMissions";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import SpiritCompanion from "@/components/SpiritCompanion";
import { useHubRegistry } from "@/components/hub-registry";
import styles from "./dashboard.module.css";

const hubMeta: Record<string, { icon: string; tone: string }> = {
  "study-os": { icon: "▣", tone: "#9f1c3b" },
  "atlas": { icon: "◎", tone: "#2a6d9a" },
  "ai-thiet-chan": { icon: "◈", tone: "#537d4d" },
  "trung-y-van": { icon: "冊", tone: "#9a6a32" },
};

const communityItems = [
  { icon: "⚕", title: "Dược liệu theo công năng", meta: "120 bài học" },
  { icon: "☯", title: "Bệnh học YHCT", meta: "95 bài học" },
  { icon: "✦", title: "Châm cứu · Thủ pháp", meta: "68 bài học" },
];

const events = [
  { day: "15", month: "Tháng 3", title: "Hội thảo ứng dụng AI trong học YHCT", meta: "Online · 200 người quan tâm" },
  { day: "22", month: "Tháng 3", title: "Workshop nhận biết dược liệu qua Atlas", meta: "Trực tiếp · 150 lượt quan tâm" },
  { day: "05", month: "Tháng 4", title: "Tọa đàm YHCT trong chăm sóc sức khỏe hiện đại", meta: "Online · Cộng đồng HIU" },
];

export default function Home() {
  const apps = useHubRegistry();
  const studyOsUrl = apps.find((app) => app.slug === "study-os")?.currentUpstreamUrl ?? "/learn/";
  const atlasUrl = apps.find((app) => app.slug === "atlas")?.currentUpstreamUrl ?? "/ecosystem/atlas/";

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Điều hướng hệ sinh thái">
        <a className={styles.brand} href="#top">
          <img src="/hiu-club-logo.webp" alt="HIU YHCT" width="44" height="44" />
          <span><strong>HIU YHCT</strong><small>TMC ECOSYSTEM</small></span>
        </a>
        <nav className={styles.nav}>
          <a href="#top"><i>⌂</i>Trang chủ</a>
          <a href={studyOsUrl}><i>▤</i>Học tập</a>
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
            <a className={styles.member} href={studyOsUrl}>
              <i className={styles.memberAvatar}>HIU</i>
              <span><strong>Thành viên YHCT</strong><small>Đăng nhập / tiếp tục học</small></span>
            </a>
          </div>
        </header>

        <section id="top" className={styles.hero}>
          <small>HIU YHCT DIGITAL CAMPUS</small>
          <h1>Chào mừng trở lại, <span>người học YHCT!</span></h1>
          <p>Một điểm vào thống nhất cho học tập, Atlas 3D, AI, Trung Y Văn và hoạt động học thuật của cộng đồng HIU.</p>
          <div className={styles.heroMark}>Dưỡng Tâm<br />Học Thuật<br />Hành Y Đạo</div>
        </section>

        <div className={styles.grid}>
          <section className={styles.mainColumn}>
            <article className={styles.continueCard}>
              <div className={styles.lessonThumb} aria-hidden="true" />
              <div className={styles.continueCopy}>
                <small>TIẾP TỤC HỌC TẬP</small>
                <h2>Bài 4: Tạng Phủ · Can Tạng</h2>
                <p>YHCT cơ bản · còn khoảng 12 phút</p>
                <div className={styles.progressLine}><i /></div>
              </div>
              <a className={styles.continueButton} href={studyOsUrl}>Tiếp tục →</a>
            </article>

            <section id="ecosystem" className={styles.panel}>
              <header className={styles.panelHead}>
                <span><small>Core Hubs</small><h2>Khám phá hệ sinh thái HIU YHCT</h2></span>
                <a href="/discover/">Xem tất cả →</a>
              </header>
              <div className={styles.hubGrid}>
                {apps.map((app) => {
                  const meta = hubMeta[app.slug] ?? { icon: "✦", tone: app.accent };
                  return (
                    <a key={app.slug} className={styles.hub} href={app.currentUpstreamUrl} style={{ "--hub": meta.tone } as CSSProperties}>
                      <span className={styles.hubIcon}>{meta.icon}</span>
                      <strong>{app.shortName}</strong>
                      <p>{app.tagline}</p>
                      <b>Mở ứng dụng →</b>
                    </a>
                  );
                })}
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
                      <span>{item.icon}</span><strong>{item.title}</strong><small>{item.meta}</small>
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
              <div className={styles.ring}><strong>65%</strong></div>
              <div className={styles.progressText}><small>Tiến độ học tập</small><strong>32 / 49 bài hoàn thành</strong><span>5 chuyên đề đang học · 12 ngày học liên tiếp</span></div>
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
        <a href="#top"><i>⌂</i><span>Trang chủ</span></a>
        <a href={studyOsUrl}><i>▤</i><span>Học tập</span></a>
        <a href={atlasUrl}><i>◎</i><span>Atlas</span></a>
        <a href="/ai/"><i>◈</i><span>AI</span></a>
        <a href="/community/"><i>♧</i><span>Cộng đồng</span></a>
      </nav>

      <SpiritCompanion />
    </main>
  );
}
