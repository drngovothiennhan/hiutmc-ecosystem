"use client";

import { useEffect, useMemo, useState } from "react";
import { communityBackend } from "@/data/community-backend";
import styles from "./discover.module.css";

type Citation = {
  id?: string;
  type?: string;
  title?: string;
  url?: string;
  journal?: string;
  publicationYear?: string;
};

type DiscoverPost = {
  id: string;
  title: string;
  abstract: string | null;
  post_type: string;
  specialty: string;
  tags: string[];
  created_at: string;
  mod_verified_at: string | null;
  citation_verified: boolean;
  citations: Citation[];
};

const approvedCitationUrl = (citation: Citation) => {
  if (!citation.url) return null;
  try {
    const url = new URL(citation.url);
    if (url.protocol !== "https:") return null;
    const allowed = new Set(["pubmed.ncbi.nlm.nih.gov", "kcb.vn", "www.kcb.vn"]);
    return allowed.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
};

export default function DiscoverFeed() {
  const [posts, setPosts] = useState<DiscoverPost[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      select: "id,title,abstract,post_type,specialty,tags,created_at,mod_verified_at,citation_verified,citations",
      moderation_status: "eq.approved",
      visibility: "eq.public",
      privacy_scrubbed: "eq.true",
      citation_verified: "eq.true",
      is_spam: "eq.false",
      post_type: "in.(research,reference)",
      order: "created_at.desc",
      limit: "18"
    });

    fetch(`${communityBackend.url}/rest/v1/${communityBackend.table}?${params.toString()}`, {
      headers: { apikey: communityBackend.publishableKey, Accept: "application/json" },
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<DiscoverPost[]>;
      })
      .then((rows) => {
        setPosts(rows);
        setState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("error");
      });

    return () => controller.abort();
  }, []);

  const research = useMemo(() => posts.filter((post) => post.post_type === "research"), [posts]);
  const references = useMemo(() => posts.filter((post) => post.post_type === "reference"), [posts]);

  if (state === "loading") return <div className={styles.feedState}>Đang tải nội dung đã xác minh…</div>;
  if (state === "error") {
    return (
      <div className={styles.feedState}>
        <strong>Chưa tải được nguồn học thuật.</strong>
        <span>Discover không thay dữ liệu lỗi bằng nội dung mẫu.</span>
      </div>
    );
  }

  const renderPosts = (items: DiscoverPost[]) => (
    <div className={styles.feedGrid}>
      {items.map((post) => {
        const citations = Array.isArray(post.citations) ? post.citations : [];
        const linkedCitation = citations.find((citation) => approvedCitationUrl(citation));
        const sourceUrl = linkedCitation ? approvedCitationUrl(linkedCitation) : null;
        return (
          <article key={post.id} className={styles.feedCard}>
            <div className={styles.feedMeta}>
              <span>{post.post_type === "research" ? "Nghiên cứu" : "Tham khảo"}</span>
              <small>{post.mod_verified_at ? "Đã kiểm chứng học thuật" : "Đã duyệt"}</small>
            </div>
            <h3>{post.title}</h3>
            {post.abstract && <p>{post.abstract}</p>}
            <div className={styles.feedFooter}>
              <span>{post.specialty || "YHCT"}</span>
              <b>{citations.length} nguồn</b>
            </div>
            {sourceUrl ? (
              <a className={styles.sourceCta} href={sourceUrl} target="_blank" rel="noreferrer">
                Mở nguồn xác minh ↗
              </a>
            ) : (
              <span className={styles.sourceNote}>Nguồn đã lưu trong hồ sơ học thuật</span>
            )}
          </article>
        );
      })}
    </div>
  );

  return (
    <div className={styles.verifiedFeed}>
      <section>
        <div className={styles.feedHeading}>
          <span className={styles.kicker}>Research Radar</span>
          <h2>Nghiên cứu đã xác minh</h2>
          <span className={styles.count}>{research.length} nội dung</span>
        </div>
        {research.length ? renderPosts(research) : <div className={styles.feedState}>Chưa có nghiên cứu công khai phù hợp.</div>}
      </section>

      <section>
        <div className={styles.feedHeading}>
          <span className={styles.kicker}>Tài liệu tham khảo</span>
          <h2>Nguồn học thuật mới</h2>
          <span className={styles.count}>{references.length} nội dung</span>
        </div>
        {references.length ? renderPosts(references) : <div className={styles.feedState}>Chưa có tài liệu tham khảo công khai phù hợp.</div>}
      </section>
    </div>
  );
}
