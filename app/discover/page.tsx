import { discoverChannels } from "@/data/community-hub";
import DiscoverFeed from "./DiscoverFeed";
import styles from "./discover.module.css";

export default function DiscoverPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU YHCT Ecosystem</a>
        <a href="/community/" className={styles.community}>Community</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>HIU YHCT Discover</span>
        <h1>Cập nhật có nguồn.<br />Không chạy theo số lượng.</h1>
        <p>
          Discover đọc nội dung học thuật công khai đã duyệt từ backend CLB và chỉ tạo liên kết khi
          nguồn xác minh có URL hợp lệ. Sự kiện/cơ hội nội bộ không bị mở công khai nếu chưa có nguồn
          public phù hợp.
        </p>
      </section>

      <section className={styles.liveSection}>
        <DiscoverFeed />
      </section>

      <section className={styles.channels}>
        {discoverChannels.map((channel, index) => (
          <article key={channel.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{channel.title}</h2>
            <p>{channel.body}</p>
            <small>{channel.title === "Học thuật" ? "Đang hoạt động" : "Chờ nguồn công khai"}</small>
          </article>
        ))}
      </section>

      <section className={styles.sources}>
        <div>
          <span className={styles.kicker}>Nguồn chính thức hiện có</span>
          <h2>Kênh của CLB</h2>
        </div>
        <div className={styles.sourceLinks}>
          <span>🌐 Fanpage: HIU CLB Y Học cổ truyền</span>
          <a href="https://www.tiktok.com/@hiu.clb.yhoccotruyen">🎵 TikTok @hiu.clb.yhoccotruyen ↗</a>
          <a href="mailto:clb.yhoccotruyen.hiu@gmail.com">📩 Email học thuật ↗</a>
        </div>
      </section>

      <section className={styles.rule}>
        <strong>Quy tắc xuất bản</strong>
        <p>Không hiển thị ngày, số liệu, tên sự kiện, bài báo hoặc kết quả nghiên cứu nếu chưa có nguồn thật để đối chiếu.</p>
      </section>
    </main>
  );
}
