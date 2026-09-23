import { academicRooms, communityFeatures } from "@/data/community-hub";
import styles from "./community.module.css";

export default function CommunityPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU YHCT Ecosystem</a>
        <div className={styles.nav}>
          <a href="/learn/">Learning Center</a>
          <a href="/discover/">Discover</a>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>HIU YHCT Community</span>
        <h1>Học cùng nhau.<br />Chia sẻ có kiểm chứng.</h1>
        <p>
          Community được tổ chức theo không gian học thuật. Giai đoạn này ưu tiên kiến trúc
          và luồng trải nghiệm; các tính năng cần backend cộng đồng được ghi rõ trạng thái,
          không giả lập thành chức năng đã hoạt động.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Phòng học thuật</span>
          <h2>Trao đổi theo đúng chủ đề.</h2>
        </div>
        <div className={styles.roomGrid}>
          {academicRooms.map((room) => (
            <article key={room.title}>
              <span>Phòng học thuật</span>
              <h3>{room.title}</h3>
              <p>{room.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Không gian cộng đồng</span>
          <h2>Phát triển từng lớp, không dựng giả backend.</h2>
        </div>
        <div className={styles.featureGrid}>
          {communityFeatures.map((feature) => (
            <article key={feature.title}>
              <span>{feature.status}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contact}>
        <div>
          <span className={styles.kicker}>Trao đổi học thuật</span>
          <h2>Kết nối với HIU CLB Y Học cổ truyền</h2>
        </div>
        <address>
          <a href="mailto:clb.yhoccotruyen.hiu@gmail.com">📩 clb.yhoccotruyen.hiu@gmail.com</a>
          <span>🌐 Fanpage: HIU CLB Y Học cổ truyền</span>
          <a href="https://www.tiktok.com/@hiu.clb.yhoccotruyen">🎵 @hiu.clb.yhoccotruyen</a>
        </address>
      </section>
    </main>
  );
}
