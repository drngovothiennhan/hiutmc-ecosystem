"use client";

import { MemberAccount, MemberAuthProvider, useMemberAuth } from "@/components/MemberAuthBridge";
import { useHubRegistry } from "@/components/hub-registry";
import styles from "./library.module.css";

function LibraryGateway() {
  const apps = useHubRegistry();
  const { member, ready, openStudyOs } = useMemberAuth();
  const studyOs = apps.find((app) => app.slug === "study-os");
  const studyOsUrl = (() => {
    try {
      const target = new URL(studyOs?.currentUpstreamUrl || "https://study.hiutmc.com/");
      target.pathname = "/research";
      target.search = "";
      target.hash = "";
      return target.toString();
    } catch {
      return "https://study.hiutmc.com/research";
    }
  })();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU TMC Ecosystem</a>
        <MemberAccount studyOsUrl={studyOsUrl} />
      </header>
      <section className={styles.panel}>
        <span className={styles.kicker}>HIU TMC · STUDY OS</span>
        <h1>Thư viện học liệu</h1>
        <p className={styles.lead}>
          Hub điều hướng đến danh mục tài liệu trong Study OS. Study OS giữ dữ liệu tài liệu và kiểm tra
          phiên đăng nhập, trạng thái xuất bản cùng quyền truy cập của từng thành viên.
        </p>
        <div className={styles.info}>
          <span aria-hidden="true">▤</span>
          <div>
            <strong>Danh mục tài liệu do Study OS quản lý</strong>
            <p>Phiên thành viên hiện có sẽ được chuyển tiếp bằng cơ chế SSO đang dùng giữa hai ứng dụng.</p>
          </div>
        </div>
        <button
          className={styles.primary}
          type="button"
          onClick={() => void openStudyOs(studyOsUrl)}
          aria-describedby="library-access-note"
        >
          {!ready ? "Đang kiểm tra phiên…" : member ? "Mở Thư viện trong Study OS →" : "Đăng nhập hoặc mở Thư viện →"}
        </button>
        <p className={styles.note} id="library-access-note">
          Kết nối hiện mở danh mục Study OS. Trình đọc online qua Hub cần endpoint nội dung có kiểm soát; Hub không lưu bản sao hoặc đường dẫn tệp gốc.
        </p>
      </section>
    </main>
  );
}

export default function LibraryPage() {
  return <MemberAuthProvider><LibraryGateway /></MemberAuthProvider>;
}
