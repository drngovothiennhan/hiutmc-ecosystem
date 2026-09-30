"use client";

import { useEffect, useState } from "react";
import { publicSupabase } from "@/data/public-supabase";
import styles from "./LaunchShowcase.module.css";

type Showcase = {
  bank: { questions: number; subjects: number };
  activeLearners30d: number;
  gift: { credits: number; validDays: number; endsAt: string } | null;
  top: Array<{ rank: number; name: string; points: number }>;
};

type State = { status: "loading" } | { status: "error" } | { status: "ready"; data: Showcase };

const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function parse(value: unknown): Showcase | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const bank = raw.bank as Record<string, unknown> | undefined;
  if (!bank || !isCount(bank.questions) || !isCount(bank.subjects) || !isCount(raw.activeLearners30d)) return null;
  const gift = raw.gift as Record<string, unknown> | null | undefined;
  const top = Array.isArray(raw.top)
    ? raw.top.filter((row): row is { rank: number; name: string; points: number } => {
        const item = row as Record<string, unknown>;
        return !!item && isCount(item.rank) && typeof item.name === "string" && item.name.length > 0 && item.name.length <= 24 && isCount(item.points);
      }).slice(0, 5)
    : [];
  return {
    bank: { questions: bank.questions, subjects: bank.subjects },
    activeLearners30d: raw.activeLearners30d,
    gift: gift && isCount(gift.credits) && isCount(gift.validDays) && typeof gift.endsAt === "string"
      ? { credits: gift.credits, validDays: gift.validDays, endsAt: gift.endsAt }
      : null,
    top,
  };
}

const nf = new Intl.NumberFormat("vi-VN");

export default function LaunchShowcase() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${publicSupabase.url}/rest/v1/rpc/public_showcase_v1`, {
      method: "POST",
      headers: { apikey: publicSupabase.publishableKey, "Content-Type": "application/json", Accept: "application/json" },
      body: "{}",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = parse(await response.json());
        if (!data) throw new Error("Invalid showcase response");
        setState({ status: "ready", data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  // Không có dữ liệu thật thì không hiển thị gì, không thay bằng nội dung mẫu.
  if (state.status !== "ready") return null;
  const { data } = state;
  const giftActive = data.gift && new Date(data.gift.endsAt).getTime() > Date.now();

  return (
    <section className={styles.root} aria-labelledby="launch-showcase-title">
      <header>
        <span className={styles.kicker}>HỆ SINH THÁI HIU TMC</span>
        <h2 id="launch-showcase-title">Học cùng nhau, nhận thưởng khi học</h2>
      </header>
      <div className={styles.stats}>
        <div><strong>{nf.format(data.bank.questions)}</strong><span>câu hỏi trong ngân hàng · {data.bank.subjects} môn</span></div>
        <div><strong>{nf.format(data.activeLearners30d)}</strong><span>bạn đang luyện tập trong 30 ngày</span></div>
        {giftActive && data.gift && (
          <div className={styles.gift}><strong>{data.gift.credits}</strong><span>tín dụng AI tặng thành viên · dùng trong {data.gift.validDays} ngày</span></div>
        )}
      </div>
      {data.top.length > 0 && (
        <ol className={styles.board} aria-label="Top học tập 30 ngày">
          {data.top.map((row) => (
            <li key={`${row.rank}-${row.name}`}><b>#{row.rank}</b><span>{row.name}</span><em>{nf.format(row.points)} điểm</em></li>
          ))}
        </ol>
      )}
      <p className={styles.note}>Chỉ tính dữ liệu luyện tập đã được máy chủ xác minh. Tên người học được rút gọn thành chữ cái đầu.</p>
      <a className={styles.cta} href="https://yhct-hiu-final4-stage-hiu-yhct.vercel.app/">Mở Study OS →</a>
    </section>
  );
}
