import { aiRouting, aiTools } from "@/data/ai-lab";
import styles from "./ai.module.css";

export default function AILabPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU YHCT Ecosystem</a>
        <a href="/learn/" className={styles.learn}>Learning Center</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>HIU YHCT AI Lab</span>
        <h1>Một cổng AI.<br />Đúng công cụ cho đúng việc.</h1>
        <p>
          AI Lab không gom mọi chức năng vào một chatbot. Hệ thống giúp sinh viên xác định nhu cầu,
          rồi mở trực tiếp công cụ đang hoạt động phù hợp nhất.
        </p>
      </section>

      <section className={styles.routing}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Điều hướng theo nhu cầu</span>
          <h2>Bạn đang cần làm gì?</h2>
        </div>
        <div className={styles.routeGrid}>
          {aiRouting.map((item, index) => (
            <article key={item.need}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.need}</h3>
              <p>{item.target}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.tools}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Công cụ đã có</span>
          <h2>Mở trực tiếp, không qua màn hình xác nhận.</h2>
        </div>
        <div className={styles.toolGrid}>
          {aiTools.map((tool) => (
            <a href={tool.href} key={tool.title} className={styles.card}>
              <span>{tool.role}</span>
              <h3>{tool.title}</h3>
              <p>{tool.body}</p>
              <b>{tool.action} ↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.guardrail}>
        <strong>Phạm vi sử dụng</strong>
        <p>
          AI Lab phục vụ học tập và điều hướng công cụ. A.I Thiệt Chẩn được trình bày như công cụ học
          quan sát, không thay thế chẩn đoán, tư vấn hoặc quyết định chuyên môn y tế.
        </p>
      </section>
    </main>
  );
}
