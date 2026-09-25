"use client";

import { useEffect, useState } from "react";
import type { EcosystemApp } from "@/data/apps";

const assistantLinks = [
  { slug: "study-os", title: "Hỏi bài & ôn tập", note: "Trợ lý học tập đã duyệt" },
  { slug: "ai-thiet-chan", title: "Học thiệt chẩn", note: "Công cụ học tập chuyên biệt" },
  { slug: "trung-y-van", title: "Tra cứu Trung Y Văn", note: "Đọc và đối chiếu học liệu" },
  { slug: "atlas", title: "Quan sát Atlas 3D", note: "Kinh lạc và huyệt vị" },
] as const;

export default function LearningAssistant({ apps }: { apps: EcosystemApp[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <aside className={`learningAssistant${open ? " isOpen" : ""}`}>
    <section className="assistantPanel" id="learning-assistant-panel" aria-labelledby="assistant-title" hidden={!open}>
      <header className="assistantPanelHeader">
        <div><span>HIU · Y HỌC CỔ TRUYỀN</span><h2 id="assistant-title">Trợ lý học tập</h2></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng bảng trợ lý">×</button>
      </header>
      <p className="assistantIntro">Chọn đúng không gian cho việc bạn muốn làm. Trợ lý đã duyệt mở trong Study OS.</p>
      <nav className="assistantLinks" aria-label="Lối vào trợ lý và học liệu">
        {assistantLinks.map((item) => {
          const app = apps.find((candidate) => candidate.slug === item.slug);
          return app ? <a href={app.currentUpstreamUrl} data-app-transition key={item.slug}>
            <span aria-hidden="true">{item.slug === "study-os" ? "✦" : item.slug === "ai-thiet-chan" ? "◉" : item.slug === "atlas" ? "◎" : "▤"}</span>
            <span><strong>{item.title}</strong><small>{item.note}</small></span><b aria-hidden="true">↗</b>
          </a> : null;
        })}
      </nav>
      <small className="assistantDisclosure">Cổng HIU mở trực tiếp Hub đã đăng ký; hội thoại và đăng nhập diễn ra trong ứng dụng tương ứng.</small>
    </section>
    <button className="assistantLauncher" type="button" aria-expanded={open} aria-controls="learning-assistant-panel" onClick={() => setOpen((value) => !value)}>
      <img src="/hiu-club-logo.webp" width="26" height="26" alt="" />
      <span>{open ? "Đóng trợ lý" : "Trợ lý học tập"}</span>
      <b aria-hidden="true">{open ? "×" : "＋"}</b>
    </button>
  </aside>;
}
