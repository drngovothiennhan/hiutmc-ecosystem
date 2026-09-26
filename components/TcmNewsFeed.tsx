"use client";

import { useEffect, useState } from "react";
import { publicSupabase } from "@/data/public-supabase";
import styles from "./TcmNewsFeed.module.css";

type NewsItem = {
  id: string;
  title: string;
  canonical_url: string;
  publisher: string | null;
  published_at: string | null;
  summary: string | null;
  tags: string[] | null;
};

type FeedState =
  | { status: "loading"; items: NewsItem[] }
  | { status: "ready"; items: NewsItem[] }
  | { status: "error"; items: NewsItem[] };

function isNewsItem(value: unknown): value is NewsItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" || !item.id ||
    typeof item.title !== "string" || !item.title.trim() ||
    typeof item.canonical_url !== "string" ||
    !(item.publisher === null || typeof item.publisher === "string") ||
    !(item.published_at === null || typeof item.published_at === "string") ||
    !(item.summary === null || typeof item.summary === "string") ||
    !(item.tags === null || (Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === "string")))
  ) return false;
  try {
    return new URL(item.canonical_url).protocol === "https:";
  } catch {
    return false;
  }
}

function publishedLabel(value: string | null) {
  if (!value) return "Thời gian đăng chưa có từ nguồn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Thời gian đăng chưa có từ nguồn";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export default function TcmNewsFeed({ limit = 12, compact = false }: { limit?: number; compact?: boolean }) {
  const [state, setState] = useState<FeedState>({ status: "loading", items: [] });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", items: [] });

    fetch(`${publicSupabase.url}/rest/v1/rpc/tcm_news_feed_v1`, {
      method: "POST",
      headers: {
        apikey: publicSupabase.publishableKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_limit: Math.max(1, Math.min(limit, 30)) }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid news feed response");
        return payload.filter(isNewsItem);
      })
      .then((items) => setState({ status: "ready", items }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error", items: [] });
      });

    return () => controller.abort();
  }, [limit, refresh]);

  return (
    <section className={`${styles.feed} ${compact ? styles.compact : ""}`} aria-busy={state.status === "loading"}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>TIN CẬP NHẬT · GOOGLE NEWS</span>
          <h2>{compact ? "Tin mới từ nguồn mở" : "Cập nhật YHCT từ các nguồn mở"}</h2>
          <p>Tin được lấy từ feed Google News hiện có. Mở bài gốc để kiểm tra nội dung; đây không phải tài liệu học thuật hay tư vấn điều trị.</p>
        </div>
        {compact && <a className={styles.allLink} href="/discover/">Xem Discover →</a>}
      </header>

      {state.status === "loading" && <div className={styles.state} role="status">Đang tải tin từ nguồn hiện tại…</div>}
      {state.status === "error" && (
        <div className={styles.state} role="status">
          <strong>Chưa tải được feed tin cập nhật.</strong>
          <span>Không thay thế bằng nội dung mẫu.</span>
          <button type="button" onClick={() => setRefresh((value) => value + 1)}>Thử tải lại</button>
        </div>
      )}
      {state.status === "ready" && state.items.length === 0 && (
        <div className={styles.state}>Hiện chưa có tin công khai trong feed.</div>
      )}
      {state.status === "ready" && state.items.length > 0 && (
        <>
          <div className={styles.grid}>
            {state.items.map((item) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.meta}>
                  <span>Google News</span>
                  <time dateTime={item.published_at || undefined}>{publishedLabel(item.published_at)}</time>
                </div>
                <h3>{item.title}</h3>
                {item.summary && item.summary !== item.title && <p>{item.summary}</p>}
                <div className={styles.footer}>
                  <span>{item.publisher || "Nhà xuất bản chưa được nguồn ghi rõ"}</span>
                  <a href={item.canonical_url} target="_blank" rel="noopener noreferrer">Mở bài gốc ↗</a>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className={styles.tags} aria-label="Chủ đề">
                    {item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                )}
              </article>
            ))}
          </div>
          {!compact && <p className={styles.count}>Đang hiển thị {state.items.length} tin mới nhất được feed công khai trả về.</p>}
        </>
      )}
    </section>
  );
}
