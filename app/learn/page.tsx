import { learningFlow, learningModes, subjectGroups } from "@/data/learning";
import styles from "./learn.module.css";

export default function LearnPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU YHCT Ecosystem</a>
        <div>
          <span>Learning Center</span>
          <strong>Học theo mục tiêu, không theo danh sách ứng dụng.</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>HIU YHCT Learning Center</span>
          <h1>Một điểm bắt đầu cho mọi hành trình học.</h1>
          <p>
            Learning Center giúp sinh viên chọn đúng việc cần làm trước, rồi điều hướng sang
            Study OS, Atlas, Trung Y Văn hoặc công cụ AI phù hợp. Những hệ thống đang hoạt động
            được giữ nguyên; Hub chỉ làm nhiệm vụ kết nối và giảm số bước thao tác.
          </p>
          <div className={styles.actions}>
            <a href={learningModes[0].href}>Học 15 phút ↗</a>
            <a href="#subjects">Chọn môn học</a>
            <a href="/search/">Tìm trong Ecosystem</a>
            <a href="/ai/">Mở AI Lab</a>
          </div>
        </div>
        <aside className={styles.flow} aria-label="Luồng học đề xuất">
          {learningFlow.map((step, index) => (
            <div key={step}><span>{index + 1}</span><p>{step}</p></div>
          ))}
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Chế độ học</span>
          <h2>Chọn theo nhu cầu hiện tại.</h2>
        </div>
        <div className={styles.modeGrid}>
          {learningModes.map((mode) => (
            <a href={mode.href} key={mode.title} className={styles.modeCard}>
              <span>Mở trực tiếp</span>
              <h3>{mode.title}</h3>
              <p>{mode.body}</p>
              <b>{mode.action} ↗</b>
            </a>
          ))}
        </div>
      </section>

      <section id="subjects" className={styles.subjectSection}>
        <div className={styles.heading}>
          <span className={styles.kicker}>Theo môn / chủ đề</span>
          <h2>Khung học tập ưu tiên sinh viên YHCT.</h2>
          <p>
            Giai đoạn này chỉ tổ chức kiến trúc thông tin. Nội dung chi tiết của từng môn sẽ được
            kết nối từ nguồn học liệu thật; không tự tạo bài học, số liệu hay case chưa được kiểm chứng.
          </p>
        </div>
        <div className={styles.subjectGrid}>
          {subjectGroups.map((subject) => (
            <a
              key={subject.title}
              href={`/search/?q=${encodeURIComponent(subject.title)}`}
            >
              <h3>{subject.title}</h3>
              <p>{subject.body}</p>
              <span>Tìm tài nguyên liên quan →</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.guardrail}>
        <strong>Nguyên tắc dữ liệu</strong>
        <p>
          Learning Center chỉ điều hướng tới nội dung và công cụ đã có nguồn. Tính năng tìm kiếm,
          tài liệu, case và nội dung cập nhật sẽ chỉ được bật khi có dữ liệu thật và nguồn xác minh.
        </p>
      </section>
    </main>
  );
}
