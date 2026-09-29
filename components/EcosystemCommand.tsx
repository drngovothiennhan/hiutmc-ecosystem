"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ecosystemApps } from "@/data/apps";
import styles from "@/app/admin/admin.module.css";

export type AuditItem = {
  id: string | number;
  action: string;
  targetId?: string | null;
  actorRole?: string | null;
  createdAt: string;
  details?: { source?: string; code?: string; message?: string; route?: string; context?: Record<string, unknown> };
};

type Probe = { state: "idle" | "checking" | "ok" | "fail"; ms?: number; status?: number };
const SESSION_KEY = "hiutmc-member-session-v1";

const targets = [
  ...ecosystemApps.map((app) => ({ id: app.slug, name: app.name, accent: app.accent, path: new URL(app.launchUrl).pathname })),
  { id: "game-hub", name: "Game Hub", accent: "#7fb069", path: "/apps/gamehub/" },
  { id: "y-quan", name: "Y Quán", accent: "#c9a25a", path: "/apps/gamehub/y-quan-live/" },
];

function ago(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return "";
  const m = Math.round(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} giờ trước` : `${Math.round(h / 24)} ngày trước`;
}

export function AppStatusGrid() {
  const [probes, setProbes] = useState<Record<string, Probe>>({});
  const run = useCallback(async () => {
    setProbes(Object.fromEntries(targets.map((t) => [t.id, { state: "checking" } as Probe])));
    await Promise.all(targets.map(async (t) => {
      const started = performance.now();
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 12000);
        const response = await fetch(t.path, { cache: "no-store", signal: controller.signal });
        window.clearTimeout(timer);
        const ms = Math.round(performance.now() - started);
        setProbes((old) => ({ ...old, [t.id]: { state: response.ok ? "ok" : "fail", ms, status: response.status } }));
      } catch {
        setProbes((old) => ({ ...old, [t.id]: { state: "fail" } }));
      }
    }));
  }, []);
  useEffect(() => { void run(); }, [run]);
  return (
    <section className={styles.panel}>
      <div className={styles.rowHead}><h2>Trạng thái ứng dụng</h2><button className={styles.secondary} onClick={() => void run()}>Kiểm tra lại</button></div>
      <p>Đo trực tiếp từ trình duyệt của bạn qua cổng hiutmc.com/apps/*; không phải số liệu giả lập.</p>
      <div className={styles.appGrid}>
        {targets.map((t) => {
          const p = probes[t.id] || { state: "idle" };
          const label = p.state === "ok" ? `Hoạt động · ${p.ms} ms` : p.state === "fail" ? `Lỗi${p.status ? ` · HTTP ${p.status}` : " · không kết nối"}` : "Đang kiểm tra…";
          return (
            <a key={t.id} className={`${styles.appCard} ${p.state === "ok" ? styles.ok : p.state === "fail" ? styles.bad : ""}`} href={t.path} target="_blank" rel="noreferrer" style={{ borderTopColor: t.accent }}>
              <strong>{t.name}</strong><small>{t.path}</small><span>{label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function AccountSyncPanel({ role }: { role?: string }) {
  const [info, setInfo] = useState<{ has: boolean; expiresIn?: number; memberId?: boolean; claimMember?: boolean } | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) { setInfo({ has: false }); return; }
      const s = JSON.parse(raw) as { accessToken?: string; refreshToken?: string; expiresAt?: number; member?: { id?: string } };
      let claim = false;
      try {
        const payload = JSON.parse(atob((s.accessToken || "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        claim = Boolean(payload?.app_metadata?.member_id);
      } catch { /* ignore */ }
      const exp = Number(s.expiresAt || 0);
      setInfo({ has: Boolean(s.accessToken && s.refreshToken), expiresIn: exp ? Math.round((exp * (exp < 1e12 ? 1000 : 1) - Date.now()) / 60000) : undefined, memberId: Boolean(s.member?.id), claimMember: claim });
    } catch { setInfo({ has: false }); }
  }, []);
  const rows: [string, boolean | undefined, string][] = [
    ["Phiên thành viên dùng chung", info?.has, "Khóa hiutmc-member-session-v1 trên hiutmc.com — mọi ứng dụng dưới /apps/* đọc chung phiên này."],
    ["Liên kết hồ sơ (member_id trong token)", info?.claimMember, "Thiếu claim này thì máy chủ trả identity_unlinked ở Game Hub/Y Quán. Đăng nhập lại để làm mới token."],
    ["Vai trò xác thực tại máy chủ", Boolean(role), "Lấy từ club_members qua /api/staff/access, không tin dữ liệu phía trình duyệt."],
  ];
  return (
    <section className={styles.panel}>
      <h2>Đồng bộ tài khoản (phiên này)</h2>
      <div className={styles.syncList}>
        {rows.map(([label, ok, hint]) => (
          <article key={label} className={ok ? styles.ok : styles.bad}><b>{ok ? "✓" : "!"}</b><div><strong>{label}</strong><small>{hint}</small></div></article>
        ))}
      </div>
      {info?.expiresIn !== undefined && <p>Token truy cập còn khoảng {Math.max(info.expiresIn, 0)} phút; các app tự làm mới bằng cùng một refresh token (khóa Web Lock dùng chung).</p>}
      <p>Ghi chú: mở Game Hub bằng địa chỉ pages.dev trực tiếp sẽ không dùng chung phiên; hãy vào qua hiutmc.com/apps/gamehub/.</p>
    </section>
  );
}

export function GameHubErrorFeed({ items, limit }: { items: AuditItem[]; limit?: number }) {
  const [code, setCode] = useState("all");
  const [query, setQuery] = useState("");
  const codes = useMemo(() => Array.from(new Set(items.map((i) => i.details?.code || "application_error"))), [items]);
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => { const k = String(i.details?.context?.operation || i.details?.code || "?"); map.set(k, (map.get(k) || 0) + 1); });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);
  const shown = items.filter((i) => (code === "all" || (i.details?.code || "application_error") === code)
    && (!query || JSON.stringify(i.details || {}).toLowerCase().includes(query.toLowerCase()))).slice(0, limit || 200);
  return (
    <div>
      {grouped.length > 0 && <div className={styles.chips}>{grouped.map(([k, n]) => <span key={k}>{k} <b>×{n}</b></span>)}</div>}
      {!limit && (
        <div className={styles.filters}>
          <select value={code} onChange={(e) => setCode(e.target.value)} aria-label="Lọc theo mã lỗi"><option value="all">Tất cả mã lỗi</option>{codes.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm operation, route, trạng thái…" aria-label="Tìm lỗi" />
        </div>
      )}
      {shown.length === 0 ? <p>Không có lỗi phù hợp.</p> : (
        <div className={styles.logs}>{shown.map((item) => {
          const c = item.details?.context || {};
          const extra = ["operation", "status", "errorType", "area"].filter((k) => c[k]).map((k) => `${k}: ${String(c[k])}`).join(" · ");
          return (
            <article key={String(item.id)}><span>!</span><div>
              <strong>{item.details?.code || "application_error"} · {item.details?.message || "Lỗi ứng dụng"}</strong>
              <small>{item.details?.route || "Game Hub"} · {ago(item.createdAt)} · {item.actorRole || "member"} · #{item.id}</small>
              {extra && <small>{extra}</small>}
            </div></article>
          );
        })}</div>
      )}
    </div>
  );
}
