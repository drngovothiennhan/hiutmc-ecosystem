"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ecosystemApps } from "@/data/apps";
import { mergeHubDrafts, readHubDrafts, type HubDrafts } from "@/components/hub-registry";
import styles from "@/app/admin/admin.module.css";

type Tab = "overview" | "traffic" | "content" | "links" | "moderation" | "roles" | "audit" | "settings";
type QueueItem = { id: string; text: string; date: string; status: string };
type LogItem = { id: string; text: string; date: string };
type Stored = { queue: QueueItem[]; logs: LogItem[] };
type BackendAuditItem = {
  id: string | number;
  action: string;
  targetId?: string | null;
  actorRole?: string | null;
  createdAt: string;
  details?: { source?: string; code?: string; message?: string; route?: string; context?: Record<string, unknown> };
};
type HubRevisions = Record<string, number>;
type StaffAccess = {
  authorized: boolean;
  role?: string;
  canAdmin?: boolean;
  canModerate?: boolean;
  member?: { fullName?: string; studentCode?: string; title?: string };
};
type TrafficStats = { totalVisits: number; todayVisits: number; dailyVisits: { date: string; visits: number }[] };
const tabList: { id: Tab; title: string; icon: string }[] = [
  { id: "overview", title: "Tổng quan", icon: "◫" }, { id: "traffic", title: "Lượt truy cập", icon: "↗" }, { id: "content", title: "Nội dung Hub", icon: "▤" },
  { id: "links", title: "Liên kết", icon: "↗" }, { id: "moderation", title: "Duyệt của Mod", icon: "✓" },
  { id: "roles", title: "Thành viên & vai trò", icon: "◎" }, { id: "audit", title: "Nhật ký", icon: "≋" },
  { id: "settings", title: "Cấu hình", icon: "⚙" },
];
function dateLabel(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? "Vừa cập nhật" : date.toLocaleString("vi-VN");
}
async function staffRequest(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null) as { error?: string; data?: unknown } | null;
  if (!response.ok) {
    const detail = data?.data && typeof data.data === "object" ? Object.values(data.data as Record<string, unknown>).filter((value) => typeof value === "string").join(" ") : "";
    throw new Error([data?.error, detail].filter(Boolean).join(" · ") || `Yêu cầu thất bại (${response.status}).`);
  }
  return data;
}

export default function StaffConsole({ mode }: { mode: "admin" | "mod" }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [drafts, setDrafts] = useState<HubDrafts>({});
  const [stored, setStored] = useState<Stored>({ queue: [], logs: [] });
  const [revisions, setRevisions] = useState<HubRevisions>({});
  const [sharedReady, setSharedReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState<StaffAccess | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [request, setRequest] = useState("");
  const [traffic, setTraffic] = useState<TrafficStats | null>(null);
  const [trafficError, setTrafficError] = useState("");
  const [trafficRefresh, setTrafficRefresh] = useState(0);
  const [snapshotRefresh, setSnapshotRefresh] = useState(0);
  const [gameHubErrors, setGameHubErrors] = useState<BackendAuditItem[]>([]);
  const [auditServerState, setAuditServerState] = useState("Chưa tải nhật ký lỗi.");
  const apps = useMemo(() => mergeHubDrafts(drafts), [drafts]);
  const visibleTabs = useMemo(
    () => mode === "admin" ? tabList : tabList.filter((item) => ["overview", "moderation", "audit"].includes(item.id)),
    [mode],
  );

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const response = await fetch("/api/staff/access", { cache: "no-store" });
        const access = (await response.json().catch(() => null)) as StaffAccess | null;
        const allowed = Boolean(access?.authorized && (mode === "admin" ? access.canAdmin : access.canModerate));
        if (!allowed) {
          window.location.replace(`/?staff_required=${mode}`);
          return;
        }
        if (live) {
          setStaff(access);
          setAuthReady(true);
        }
      } catch {
        window.location.replace(`/?staff_required=${mode}`);
      }
    })();
    return () => { live = false; };
  }, [mode]);

  useEffect(() => { setDrafts(readHubDrafts()); }, []);
  useEffect(() => {
    if (!authReady) return;
    let live = true;
    setAuditServerState("Đang tải nhật ký từ máy chủ…");
    void staffRequest("/api/staff/shadow/snapshot").then((result) => {
      if (!live) return;
      const snapshot = result?.data as { hubDrafts?: Array<{ hubSlug: string; draft: HubDrafts[string]; revision: number }>; moderationQueue?: Array<{ id: string; payload: { text?: string }; status: string; createdAt: string }>; auditLog?: BackendAuditItem[] } | null;
      const auditLog = snapshot?.auditLog ?? [];
      const sharedDrafts = Object.fromEntries((snapshot?.hubDrafts ?? []).map((row) => [row.hubSlug, row.draft])) as HubDrafts;
      const nextRevisions = Object.fromEntries((snapshot?.hubDrafts ?? []).map((row) => [row.hubSlug, Number(row.revision)]));
      setDrafts((localDrafts) => ({ ...localDrafts, ...sharedDrafts }));
      setRevisions(nextRevisions);
      setStored({
        queue: (snapshot?.moderationQueue ?? []).map((row) => ({ id: row.id, text: String(row.payload?.text || "Nội dung cần xem xét"), date: dateLabel(row.createdAt), status: row.status === "pending" ? "Chờ duyệt" : row.status === "archived" ? "Đã lưu trữ" : "Đã duyệt" })),
        logs: auditLog.map((row) => ({ id: String(row.id), text: `${row.action}${row.targetId ? ` · ${row.targetId}` : ""}`, date: dateLabel(row.createdAt) })),
      });
      setGameHubErrors(auditLog.filter((row) => row.action === "game_hub_error" && row.details?.source === "hiutmc-game-hub"));
      setAuditServerState("Đã đồng bộ nhật ký máy chủ.");
      setSharedReady(true);
    }).catch((error: unknown) => {
      if (live) {
        setAuditServerState("Không tải được nhật ký máy chủ. Hãy thử làm mới.");
        setNotice(error instanceof Error ? `Không tải được dữ liệu dùng chung: ${error.message}` : "Không tải được dữ liệu dùng chung.");
      }
    });
    return () => { live = false; };
  }, [authReady, snapshotRefresh]);
  useEffect(() => {
    if (!authReady || mode !== "admin" || tab !== "traffic") return;
    let live = true;
    setTrafficError("");
    void fetch("/api/admin/traffic", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null) as TrafficStats | { error?: string } | null;
        if (!response.ok || !data || !("totalVisits" in data)) throw new Error("Không tải được số liệu lượt truy cập.");
        if (live) setTraffic(data);
      })
      .catch((error: unknown) => {
        if (live) setTrafficError(error instanceof Error ? error.message : "Không tải được số liệu lượt truy cập.");
      });
    return () => { live = false; };
  }, [authReady, mode, tab, trafficRefresh]);
  const edit = (slug: string, field: string, value: string) => setDrafts((s) => ({ ...s, [slug]: { ...s[slug], [field]: value } }));
  const saveHub = async (slug: string, publish = false) => {
    const draft = drafts[slug] || {};
    if (draft.currentUpstreamUrl) {
      try { if (new URL(draft.currentUpstreamUrl).protocol !== "https:") throw new Error(); }
      catch { setNotice(`URL của ${slug} phải là liên kết HTTPS hợp lệ.`); return; }
    }
    setBusy(true); setNotice("");
    try {
      const saved = await staffRequest("/api/staff/shadow/hub-draft", { hubSlug: slug, draft, expectedRevision: revisions[slug] ?? 0 });
      const savedData = saved?.data as { revision?: number } | undefined;
      setRevisions((current) => ({ ...current, [slug]: Number(savedData?.revision ?? (current[slug] || 0) + 1) }));
      if (publish) {
        await staffRequest("/api/staff/shadow/publish", { hubSlug: slug });
        setNotice(`Đã xuất bản ${slug} dùng chung. Các thiết bị sẽ nhận nội dung mới trong tối đa một phút.`);
      } else setNotice(`Đã lưu bản nháp ${slug} dùng chung.`);
      const result = await staffRequest("/api/staff/shadow/snapshot");
      const snapshot = result?.data as { moderationQueue?: Array<{ id: string; payload: { text?: string }; status: string; createdAt: string }>; auditLog?: Array<{ id: string | number; action: string; targetId?: string; createdAt: string }> } | null;
      setStored({
        queue: (snapshot?.moderationQueue ?? []).map((row) => ({ id: row.id, text: String(row.payload?.text || "Nội dung cần xem xét"), date: dateLabel(row.createdAt), status: row.status === "pending" ? "Chờ duyệt" : row.status === "archived" ? "Đã lưu trữ" : "Đã duyệt" })),
        logs: (snapshot?.auditLog ?? []).map((row) => ({ id: String(row.id), text: `${row.action}${row.targetId ? ` · ${row.targetId}` : ""}`, date: dateLabel(row.createdAt) })),
      });
    } catch (error) {
      setNotice(error instanceof Error && /revision_conflict/i.test(error.message) ? "Bản nháp đã được cập nhật ở nơi khác. Tải lại trang để nhận phiên bản mới trước khi lưu." : error instanceof Error ? `Không lưu được: ${error.message}` : "Không lưu được dữ liệu dùng chung.");
    } finally { setBusy(false); }
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ schema: "hiutmc-hub-drafts-v1", savedAt: new Date().toISOString(), storage: "browser-local-draft", hubs: drafts }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "hiutmc-hub-drafts.json"; a.click(); URL.revokeObjectURL(url);
    setNotice("Đã xuất bản sao JSON.");
  };
  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const value = JSON.parse(await file.text()) as { schema?: string; hubs?: HubDrafts };
      if (value.schema !== "hiutmc-hub-drafts-v1" || !value.hubs || typeof value.hubs !== "object") throw new Error("File JSON không đúng định dạng bản nháp Hub.");
      const allowed = new Set(ecosystemApps.map((app) => app.slug));
      const safe = Object.fromEntries(Object.entries(value.hubs).filter(([slug, draft]) => allowed.has(slug) && draft && typeof draft === "object")) as HubDrafts;
      setDrafts(safe); setNotice("Đã nhập dữ liệu vào biểu mẫu. Hãy lưu từng Hub để đồng bộ lên máy chủ.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Không thể đọc file JSON."); }
    event.target.value = "";
  };
  const addQueueItem = async () => {
    const text = request.trim(); if (!text) return;
    setBusy(true);
    try {
      await staffRequest("/api/staff/shadow/moderation", { action: "submit", itemType: "content", payload: { text } });
      setRequest(""); setNotice("Đã gửi vào hàng chờ dùng chung.");
      const result = await staffRequest("/api/staff/shadow/snapshot");
      const snapshot = result?.data as { moderationQueue?: Array<{ id: string; payload: { text?: string }; status: string; createdAt: string }>; auditLog?: Array<{ id: string | number; action: string; targetId?: string; createdAt: string }> } | null;
      setStored({ queue: (snapshot?.moderationQueue ?? []).map((row) => ({ id: row.id, text: String(row.payload?.text || "Nội dung cần xem xét"), date: dateLabel(row.createdAt), status: row.status === "pending" ? "Chờ duyệt" : row.status === "archived" ? "Đã lưu trữ" : "Đã duyệt" })), logs: (snapshot?.auditLog ?? []).map((row) => ({ id: String(row.id), text: `${row.action}${row.targetId ? ` · ${row.targetId}` : ""}`, date: dateLabel(row.createdAt) })) });
    } catch (error) { setNotice(error instanceof Error ? `Không gửi được: ${error.message}` : "Không gửi được vào hàng chờ."); }
    finally { setBusy(false); }
  };
  const review = async (itemId: string, status: string) => {
    setBusy(true);
    try {
      await staffRequest("/api/staff/shadow/moderation", { action: "review", id: itemId, status: status === "Đã lưu trữ" ? "archived" : "reviewed" });
      const result = await staffRequest("/api/staff/shadow/snapshot");
      const snapshot = result?.data as { moderationQueue?: Array<{ id: string; payload: { text?: string }; status: string; createdAt: string }>; auditLog?: Array<{ id: string | number; action: string; targetId?: string; createdAt: string }> } | null;
      setStored({ queue: (snapshot?.moderationQueue ?? []).map((row) => ({ id: row.id, text: String(row.payload?.text || "Nội dung cần xem xét"), date: dateLabel(row.createdAt), status: row.status === "pending" ? "Chờ duyệt" : row.status === "archived" ? "Đã lưu trữ" : "Đã duyệt" })), logs: (snapshot?.auditLog ?? []).map((row) => ({ id: String(row.id), text: `${row.action}${row.targetId ? ` · ${row.targetId}` : ""}`, date: dateLabel(row.createdAt) })) });
      setNotice("Đã cập nhật trạng thái mục dùng chung.");
    } catch (error) { setNotice(error instanceof Error ? `Không cập nhật được: ${error.message}` : "Không cập nhật được trạng thái."); }
    finally { setBusy(false); }
  };
  const clearDrafts = () => { setDrafts({}); setNotice("Đã xóa phần chỉnh sửa chưa lưu trên biểu mẫu này."); };

  if (!authReady) {
    return <main className={styles.authGate}><section><span>HIU YHCT STAFF AUTH</span><h1>Đang xác minh quyền máy chủ…</h1><p>Cloudflare đang kiểm tra phiên đăng nhập với hồ sơ thành viên trước khi mở khu vực quản trị.</p></section></main>;
  }

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="/"><span className={styles.seal}>HIU</span><span><strong>{mode === "admin" ? "ADMIN CENTER" : "MOD CENTER"}</strong><small>HIU YHCT ECOSYSTEM</small></span></a>
      <p className={styles.sideLabel}>KHÔNG GIAN QUẢN TRỊ</p>
      <nav className={styles.nav} aria-label="Mục quản trị">{visibleTabs.map((item) => <button key={item.id} className={tab === item.id ? styles.selected : ""} onClick={() => { setTab(item.id); setNotice(""); }}><span>{item.icon}</span>{item.title}</button>)}</nav>
      <a className={styles.back} href="/">← Xem trang chính</a>
    </aside>
    <section className={styles.main}>
      <header className={styles.top}><div><span className={styles.eyebrow}>HIU YHCT · BẢNG ĐIỀU KHIỂN</span><h1>{visibleTabs.find((item) => item.id === tab)?.title}</h1><small className={styles.staffIdentity}>{staff?.member?.fullName || "HIU YHCT"} · {staff?.role || mode}</small></div><span className={styles.localTag}>SERVER VERIFIED</span></header>
      <div className={styles.warning}><strong>Quyền truy cập đã xác thực tại máy chủ</strong><p>Cloudflare xác minh phiên Supabase và vai trò club_members. Bản nháp Hub, xuất bản công khai, hàng chờ Moderator và nhật ký được lưu trên Supabase để đồng bộ giữa các thiết bị.</p></div>
      {notice && <p className={styles.statusMessage} role="status">{notice}</p>}

      {tab === "overview" && <div className={styles.content}><div className={styles.metrics}><article><small>HUB</small><strong>{ecosystemApps.length}</strong><span>Điểm đến trong registry</span></article><article><small>BẢN NHÁP ĐÃ SỬA</small><strong>{Object.keys(drafts).length}</strong><span>Bản nháp trên biểu mẫu</span></article><article><small>MỤC CHỜ DUYỆT</small><strong>{stored.queue.filter((x) => x.status === "Chờ duyệt").length}</strong><span>Hàng chờ dùng chung</span></article><article><small>LỖI GAME HUB</small><strong>{gameHubErrors.length}</strong><span>{auditServerState}</span></article></div><section className={styles.panel}><h2>Quản lý lối vào hệ sinh thái</h2><p>Chỉnh tên, mô tả và URL HTTPS; lưu nháp dùng chung hoặc xuất bản để cập nhật trang chính cho mọi thiết bị.</p><button className={styles.primary} onClick={() => setTab(mode === "admin" ? "content" : "moderation")}>{mode === "admin" ? "Mở Nội dung Hub →" : "Mở hàng chờ duyệt →"}</button></section><section className={styles.panel}><h2>Quy trình duyệt</h2><p>Admin và Moderator dùng quyền từ hồ sơ club_members; mọi thao tác ghi nhận tại máy chủ.</p><button className={styles.secondary} onClick={() => setTab(mode === "admin" ? "roles" : "audit")}>{mode === "admin" ? "Xem vai trò & quyền" : "Xem nhật ký"}</button></section><section className={styles.panel}><h2>Báo lỗi Game Hub</h2><p>{auditServerState} · {gameHubErrors.length} lỗi gần đây trong nhật ký máy chủ.</p><button className={styles.secondary} onClick={() => setSnapshotRefresh((value) => value + 1)}>Làm mới nhật ký</button>{gameHubErrors.length === 0 ? <div className={styles.empty}><span>✓</span><strong>Chưa có lỗi Game Hub được ghi nhận</strong><p>Khi có lỗi, mã và thời điểm sẽ xuất hiện tại đây.</p></div> : <div className={styles.logs}>{gameHubErrors.slice(0, 5).map((item) => <article key={String(item.id)}><span>!</span><div><strong>{item.details?.code || "application_error"} · {item.details?.message || "Lỗi ứng dụng"}</strong><small>{item.details?.route || "Game Hub"} · {dateLabel(item.createdAt)} · {item.actorRole || "member"}</small></div></article>)}</div>}</section></div>}

      {tab === "traffic" && mode === "admin" && <div className={styles.content}>
        <div className={styles.intro}><h2>Thống kê lượt truy cập</h2><p>Chỉ Admin đã xác thực mới xem được. Bộ đếm ghi nhận lượt mở trang công khai, không lưu địa chỉ IP hoặc thông tin định danh thiết bị.</p></div>
        {trafficError && <p className={styles.statusMessage} role="alert">{trafficError}</p>}
        <div className={styles.metrics}>
          <article><small>TỔNG LƯỢT TRUY CẬP</small><strong>{traffic ? traffic.totalVisits.toLocaleString("vi-VN") : "—"}</strong><span>Từ khi bật bộ đếm</span></article>
          <article><small>HÔM NAY · GIỜ VIỆT NAM</small><strong>{traffic ? traffic.todayVisits.toLocaleString("vi-VN") : "—"}</strong><span>Lượt mở trang công khai</span></article>
          <article><small>7 NGÀY GẦN NHẤT</small><strong>{traffic ? traffic.dailyVisits.reduce((sum, day) => sum + day.visits, 0).toLocaleString("vi-VN") : "—"}</strong><span>Tổng theo ngày</span></article>
        </div>
        <section className={styles.panel}><div className={styles.trafficHeader}><div><h2>Lượt truy cập theo ngày</h2><p>Số liệu theo múi giờ Việt Nam (UTC+7).</p></div><button className={styles.secondary} onClick={() => setTrafficRefresh((value) => value + 1)}>Làm mới</button></div>
          {!traffic ? <p role="status">{trafficError ? "Chưa có số liệu mới." : "Đang tải số liệu…"}</p> : <div className={styles.trafficDays}>{traffic.dailyVisits.map((day) => {
            const peak = Math.max(1, ...traffic.dailyVisits.map((item) => item.visits));
            return <div className={styles.trafficDay} key={day.date}><time dateTime={day.date}>{new Date(`${day.date}T12:00:00+07:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</time><div className={styles.trafficBarTrack}><span className={styles.trafficBar} style={{ width: `${Math.max(day.visits > 0 ? 4 : 0, (day.visits / peak) * 100)}%` }} /></div><strong>{day.visits.toLocaleString("vi-VN")}</strong></div>;
          })}</div>}
        </section>
      </div>}

      {tab === "content" && <div className={styles.content}><div className={styles.intro}><h2>Nội dung từng Hub</h2><p>Bản nháp lưu trên Supabase cho Admin; xuất bản sẽ cập nhật bản đồ, thẻ ứng dụng và lối vào nhanh trên toàn hệ sinh thái.</p></div>{!sharedReady && <p role="status">Đang tải dữ liệu dùng chung…</p>}{apps.map((app) => <article className={styles.editor} key={app.slug}><div className={styles.editorTitle}><span className={styles.appIcon}>{app.shortName.slice(0, 1)}</span><div><h3>{app.name}</h3><small>{app.slug} · {app.hosting} · Bản nháp r{revisions[app.slug] ?? 0}</small></div><span className={styles.statusPill}>{app.status}</span></div><div className={styles.fields}><label>Tên hiển thị<input value={app.name} onChange={(e) => edit(app.slug, "name", e.target.value)} /></label><label>Tên ngắn<input value={app.shortName} onChange={(e) => edit(app.slug, "shortName", e.target.value)} /></label><label>Mô tả ngắn<input value={app.tagline} onChange={(e) => edit(app.slug, "tagline", e.target.value)} /></label><label>URL HTTPS<input type="url" value={app.currentUpstreamUrl} onChange={(e) => edit(app.slug, "currentUpstreamUrl", e.target.value)} /></label><label className={styles.full}>Mô tả Hub<textarea rows={3} value={app.description} onChange={(e) => edit(app.slug, "description", e.target.value)} /></label></div><div className={styles.actions}><button className={styles.secondary} disabled={!sharedReady || busy || !drafts[app.slug]} onClick={() => void saveHub(app.slug)}>Lưu nháp dùng chung</button><button className={styles.primary} disabled={!sharedReady || busy || !drafts[app.slug]} onClick={() => void saveHub(app.slug, true)}>Xuất bản Hub</button></div></article>)}</div>}

      {tab === "links" && <div className={styles.content}><div className={styles.intro}><h2>Các liên kết hiện có</h2><p>Điểm đến đã xuất bản được dùng chung trên trang chủ; bản nháp chỉ hiển thị trong Admin Center.</p></div><div className={styles.linkList}>{apps.map((app) => <article key={app.slug}><div><strong>{app.name}</strong><small>{app.tagline}</small><code>{app.currentUpstreamUrl}</code></div><span className={styles.statusPill}>{app.status}</span><a href={app.currentUpstreamUrl} target="_blank" rel="noreferrer">Mở ↗</a></article>)}</div></div>}

      {tab === "moderation" && <div className={styles.content}><div className={styles.intro}><h2>Hàng chờ duyệt của Moderator</h2><p>Yêu cầu và trạng thái được đồng bộ từ Supabase giữa Admin và Moderator.</p></div><section className={styles.panel}><label className={styles.request}>Gửi mục cần xem xét<textarea rows={3} value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Nhập nội dung cần xem xét…" /></label><button className={styles.primary} disabled={busy || !sharedReady} onClick={() => void addQueueItem()}>Gửi vào hàng chờ dùng chung</button></section>{stored.queue.length === 0 ? <div className={styles.empty}><span>✓</span><strong>Chưa có mục chờ duyệt</strong><p>Hàng chờ đang lấy dữ liệu trực tiếp từ máy chủ.</p></div> : <div className={styles.queue}>{stored.queue.map((item) => <article key={item.id}><div><span className={styles.statusPill}>{item.status}</span><p>{item.text}</p><small>{item.date} · Máy chủ</small></div><div><button disabled={busy || item.status !== "Chờ duyệt"} onClick={() => void review(item.id, "Đã duyệt")}>Duyệt</button><button disabled={busy || item.status !== "Chờ duyệt"} onClick={() => void review(item.id, "Đã lưu trữ")}>Lưu trữ</button></div></article>)}</div>}</div>}

      {tab === "roles" && <div className={styles.content}><div className={styles.intro}><h2>Thành viên và vai trò</h2><p>Phiên hiện tại đã được xác thực từ hệ thống thành viên dùng chung; quyền hiển thị lấy từ vai trò máy chủ.</p></div><div className={styles.roles}><article><span>◇</span><h3>Admin</h3><p>Vai trò dự kiến: quản lý nội dung Hub, cấu hình và quy trình xuất bản.</p><b>Admin: yêu cầu role admin tại máy chủ</b></article><article><span>◎</span><h3>Moderator</h3><p>Vai trò dự kiến: xem xét và gửi đề xuất nội dung cho Admin.</p><b>Moderator: yêu cầu role mod/super_mod/admin</b></article></div><div className={styles.warning}><strong>Không hiển thị dữ liệu thành viên không cần thiết</strong><p>Khu vực này chỉ dùng thông tin vai trò tối thiểu để phân quyền; không tự tạo tên, email, điểm số hoặc thông tin tài khoản.</p></div></div>}

      {tab === "audit" && <div className={styles.content}><div className={styles.intro}><h2>Nhật ký thao tác và báo lỗi</h2><p>Nhật ký được lưu tại Supabase và dùng chung giữa các thiết bị.</p><button className={styles.secondary} onClick={() => setSnapshotRefresh((value) => value + 1)}>Làm mới nhật ký backend</button><p>{auditServerState}</p></div><section className={styles.panel}><h3>Lỗi Game Hub gần đây ({gameHubErrors.length})</h3>{gameHubErrors.length === 0 ? <p>Chưa có báo lỗi Game Hub trong nhật ký backend.</p> : <div className={styles.logs}>{gameHubErrors.map((item) => <article key={String(item.id)}><span>!</span><div><strong>{item.details?.code || "application_error"} · {item.details?.message || "Lỗi ứng dụng"}</strong><small>{item.details?.route || "Game Hub"} · {dateLabel(item.createdAt)} · {item.actorRole || "member"} · #{item.id}</small></div></article>)}</div>}</section><div className={styles.intro}><h3>Tất cả nhật ký máy chủ</h3></div>{stored.logs.length === 0 ? <div className={styles.empty}><span>≋</span><strong>Chưa có thao tác được ghi</strong><p>Nhật ký máy chủ sẽ xuất hiện sau khi có thao tác được ghi nhận.</p></div> : <div className={styles.logs}>{stored.logs.map((item) => <article key={item.id}><span>•</span><div><strong>{item.text}</strong><small>{item.date} · Máy chủ</small></div></article>)}</div>}</div>}

      {tab === "settings" && <div className={styles.content}><div className={styles.intro}><h2>Cấu hình và sao lưu</h2><p>Nhập hoặc xuất dữ liệu JSON để chuẩn bị bản nháp; thao tác lưu và xuất bản cần thực hiện trong Nội dung Hub.</p></div><section className={styles.panel}><h3>Sao lưu JSON</h3><p>File chỉ chứa các bản nháp Hub, không có mật khẩu hay tài khoản thành viên.</p><div className={styles.actions}><button className={styles.primary} onClick={exportJson}>Xuất JSON</button><label className={styles.fileButton}>Nhập JSON<input type="file" accept="application/json,.json" onChange={importJson} /></label><button className={styles.danger} onClick={clearDrafts}>Xóa chỉnh sửa chưa lưu</button></div></section><section className={styles.panel}><h3>Tình trạng kết nối</h3><ul className={styles.checks}><li>Đăng nhập Staff: đã xác minh qua Supabase session</li><li>Phân quyền Admin/Moderator: đã chặn tại Cloudflare Worker</li><li>Dữ liệu nháp, duyệt và nhật ký: Supabase dùng chung</li><li>Hub đã xuất bản: hiển thị công khai và đồng bộ qua Cloudflare</li></ul></section></div>}
    </section>
  </main>;
}
