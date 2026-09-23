import SearchClient from "./SearchClient";
import styles from "./search.module.css";

export default function SearchPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU YHCT Ecosystem</a>
        <a href="/learn/" className={styles.learn}>Learning Center</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>Search Hub</span>
        <h1>Tìm một lần.<br />Đi đúng nơi.</h1>
        <p>
          Tìm kiếm trên danh mục đã xác thực của Ecosystem: công cụ, điểm vào học tập và chủ đề.
          Search Hub không tạo câu trả lời giả và không khẳng định có học liệu chi tiết khi dữ liệu chưa được kết nối.
        </p>
      </section>

      <section className={styles.content}>
        <SearchClient />
      </section>
    </main>
  );
}
