"use client";

import { useEffect, useMemo, useState } from "react";
import { communityBackend } from "@/data/community-backend";
import styles from "./community.module.css";

type AcademicPost = {
  id: string;
  title: string;
  abstract: string | null;
  tags: string[];
  specialty: string;
  post_type: string;
  created_at: string;
  mod_verified_at: string | null;
  citation_verified: boolean;
};

type FeedState =
  | { status: "loading"; posts: AcademicPost[]; error: null }
  | { status: "ready"; posts: AcademicPost[]; error: null }
  | { status: "error"; posts: AcademicPost[]; error: string };

const typeLabel = (value: string) => {
  if (value === "research") return "Nghiên cứu";
  if (value === "reference") return "Tham khảo";
  if (value === "case") return "Case Lab";
  return value;
};

export default function CommunityFeed() {
  const [state, setState] = useState<FeedState>({ status: "loading", posts: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      select: "id,title,abstract,tags,specialty,post_type,created_at,mod_verified_at,citation_verified",
      moderation_status: "eq.approved",
      visibility: "eq.public",
      privacy_scrubbed: "eq.true",
      citation_verified: "eq.true",
      is_spam: "eq.false",
      order: "created_at.desc",
      limit: "24"
    });

    fetch(`${communityBackend.url}/rest/v1/${communityBackend.table}?${params.toString()}`, {
      headers: {
        apikey: communityBackend.publishableKey,
        Accept: "application/json"
      },
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<AcademicPost[]>;
      })
      .then((posts) => setState({ status: "ready", posts, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Không xác định";
        setState({ status: "error", posts: [], error: message });
      });

    return () => controller.abort();
  }, []);

  const cases = useMemo(() => state.posts.filter((post) => post.post_type === "case"), [state.posts]);
  const academicPosts = useMemo(() => state.posts.filter((post) => post.post_type !== "case"), [state.posts]);

  if (state.status === "loading") {
    return <div className={styles.feedState}>Đang tải nội dung học thuật đã duyệt…</div>;
  }

  if (state.status === "error") {
    return (
      <div className={styles.feedState}>
        <strong>Chưa tải được Academic Feed.</strong>
        <span>Dữ liệu không được thay bằng nội dung mẫu. Hãy thử tải lại trang.</span>
      </div>
    );
  }

  return (
    <div className={styles.liveFeed}>
      <div className={styles.feedHeader}>
        <div>
          <span className={styles.kicker}>Academic Feed · dữ liệu thật</span>
          <h2>Nội dung công khai đã qua kiểm duyệt</h2>
        </div>
        <span className={styles.liveBadge}>{academicPosts.length} nội dung</span>
      </div>

      {academicPosts.length > 0 ? (
        <div className={styles.postGrid}>
          {academicPosts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postMeta}>
                <span>{typeLabel(post.post_type)}</span>
                <small>{post.mod_verified_at ? "Đã kiểm chứng học thuật" : "Đã duyệt"}</small>
              </div>
              <h3>{post.title}</h3>
              {post.abstract && <p>{post.abstract}</p>}
              <div className={styles.postFooter}>
                <span>{post.specialty || "YHCT"}</span>
                {post.citation_verified && <b>Nguồn đã xác minh</b>}
              </div>
              {post.tags?.length > 0 && (
                <div className={styles.tags} aria-label="Chủ đề">
                  {post.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.feedState}>Chưa có nội dung học thuật công khai đã duyệt.</div>
      )}

      <div className={styles.caseLab}>
        <div>
          <span className={styles.kicker}>Case Lab</span>
          <h2>Ca học tập đã kiểm duyệt</h2>
        </div>
        {cases.length > 0 ? (
          <div className={styles.postGrid}>
            {cases.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postMeta}><span>Case Lab</span><small>Đã duyệt</small></div>
                <h3>{post.title}</h3>
                {post.abstract && <p>{post.abstract}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.feedState}>
            <strong>Chưa có ca Case Lab đã duyệt.</strong>
            <span>Hệ thống không tạo ca mẫu hoặc nội dung giả để lấp giao diện.</span>
          </div>
        )}
      </div>
    </div>
  );
}
