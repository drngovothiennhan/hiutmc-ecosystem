"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ecosystemApps } from "@/data/apps";
import { mergeHubDrafts, readHubDrafts, writeHubDrafts, type HubDrafts } from "@/components/hub-registry";
import styles from "@/app/admin/admin.module.css";

type Tab = "overview" | "content" | "links" | "moderation" | "roles" | "audit" | "settings";
type QueueItem = { id: string; text: string; date: string; status: string };
type LogItem = { id: string; text: string; date: string };
type Stored = { queue: QueueItem[]; logs: LogItem[] };
type StaffAccess = {
  authorized: boolean;
  role?: string;
  canAdmin?: boolean;
  canModerate?: boolean;
  member?: { fullName?: string; studentCode?: string; title?: string };
};
const STORE_KEY = "hiutmc-admin-panel-v1";
const tabList: { id: Tab; title: string; icon: string }[] = [
  { id: "overview", title: "Tổng quan", icon: "◫" }, { id: "content", title: "Nội dung Hub", icon: "▤" },
  { id: "links", title: "Liên kết", icon: "↗" }, { id: "moderation", title: "Duyệt của Mod", icon: "✓" },
  { id: "roles", title: "Thành viên & vai trò", icon: "◎" }, { id: "audit", title: "Nhật ký", icon: "≋" },
  { id: "settings", title: "Cấu hình", icon: "⚙" },
];
const empty: Stored = { queue: [], logs: [] };

function readStored(): Stored {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || "null") as Partial<Stored> | null;
    return { queue: Array.isArray(data?.queue) ? data.queue : [], logs: Array.isArray(data?.logs) ? data.logs : [] };
  } catch { return empty; }
}
function id() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export default function StaffConsole({ mode }: { mode: "admin" | "mod" }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [drafts, setDrafts] = useState<HubDrafts>({});
  const [stored, setStored] = useState<Stored>(empty);
  const [ready, setReady] = useState(false);
  const [staff, setStaff] = useState<StaffAccess | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [request, setRequest] = useState("");
  const [gameHubErrors, setGameHubErrors] = useState<Array<{ id: string; errorCode: string; routeKey: string; createdAt: string }>>([]);
  const [gameHubErrorNotice, setGameHubErrorNotice] = useState("");
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

  useEffect(() => {
    if (!authReady || mode !== "admin" || tab !== "audit") return;
    let live = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/staff/shadow/game-hub-errors", { cache: "no-store" });
        const payload = await response.json().catch(() => null) as { events?: typeof gameHubErrors; error?: string } | null;
        if (!response.ok) throw new Error("Không tải được nhật ký lỗi Game Hub.");
        if (live) { setGameHubErrors(Array.isArray(payload?.events) ? payload.events : []); setGameHubErrorNotice(""); }
      } catch {
        if (live) setGameHubErrorNotice("Chưa tải được nhật ký lỗi Game Hub. Hãy thử làm mới.");
      }
    };
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 60_000);
    return () => { live = false; window.clearInterval(timer); };
  }, [authReady, mode, tab]);
  useEffect(() => { setDrafts(readHubDrafts()); setStored(readStored()); setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORE_KEY, JSON.stringify(stored)); }, [stored, ready]);
  const log = (text: string) => setStored((s) => ({ ...s, logs: [{ id: id(), text, date: new Date().toLocaleString("vi-VN") }, ...s.logs].slice(0, 100) }));
  const edit = (slug: string, field: string, value: string) => setDrafts((s) => ({ ...s, [slug]: { ...s[slug], [field]: value } }));
  const save = () => {
    for (const [slug, draft] of Object.entries(drafts)) if (draft.currentUpstreamUrl) {
      try { if (new URL(draft.currentUpstreamUrl).protocol !== "https:") throw new Error(); }
      catch { setNotice(`URL của ${slug} phải là liên kết HTTPS hợp lệ.`); return; }
    }
    writeHubDrafts(drafts); log("Lưu bản nháp Hub trong trình duyệt này.");
    setNotice("Đã lưu bản nháp trên thiết bị này; nội dung chưa xuất bản dùng chung.");
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ schema: "hiutmc-hub-drafts-v1", savedAt: new Date().toISOString(), storage: "browser-local-draft", hubs: drafts }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "hiutmc-hub-drafts.json"; a.click(); URL.revokeObjectURL(url);
    log("Xuất bản sao JSON Hub."); setNotice("Đã xuất bản sao JSON.");
  };
  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const value = JSON.parse(await file.text()) as { schema?: string; hubs?: HubDrafts };
      if (value.schema !== "hiutmc-hub-drafts-v1" || !value.hubs || typeof value.hubs !== "object") throw new Error("File JSON không đúng định dạng bản nháp Hub.");
      const allowed = new Set(ecosystemApps.map((app) => app.slug));
      const safe = Object.fromEntries(Object.entries(value.hubs).filter(([slug, draft]) => allowed.has(slug) && draft && typeof draft === "object")) as HubDrafts;
      setDrafts(safe); writeHubDrafts(safe); log("Nhập bản sao JSON Hub."); setNotice("Đã nhập bản nháp trên trình duyệt này.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Không thể đọc file JSON."); }
    event.target.value = "";
  };
  const addQueueItem = () => {
    const text = request.trim(); if (!text) return;
    setStored((s) => ({ ...s, queue: [{ id: id(), text, date: new Date().toLocaleString("vi-VN"), status: "Chờ duyệt" }, ...s.queue] }));
    setRequest(""); setNotice("Đã thêm vào hàng chờ cục bộ.");
  };
  const review = (itemId: string, status: string) => {
    setStored((s) => ({ ...s, queue: s.queue.map((item) => item.id === itemId ? { ...item, status } : item) }));
    log(`Cập nhật mục duyệt cục bộ: ${status}.`);
  };
  const clearDrafts = () => { setDrafts({}); writeHubDrafts({}); log("Khôi phục registry mặc định."); setNotice("Đã khôi phục nội dung mặc định trong trình duyệt này."); };

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
      <div className={styles.warning}><strong>Quyền truy cập đã xác thực tại máy chủ</strong><p>Cloudflare kiểm tra phiên Supabase và vai trò club_members trước khi phục vụ trang này. Nội dung Hub/queue hiện vẫn là bản nháp cục bộ cho đến khi backend xuất bản dùng chung được nối ở giai đoạn riêng.</p></div>
      {notice && <p className={styles.statusMessage} role="status">{notice}</p>}

      {tab === "overview" && <div className={styles.content}><div className={styles.metrics}><article><small>HUB</small><strong>{ecosystemApps.length}</strong><span>4 điểm đến trong registry</span></article><article><small>BẢN NHÁP ĐÃ SỬA</small><strong>{Object.keys(drafts).length}</strong><span>Thiết bị hiện tại</span></article><article><small>MỤC CHỜ DUYỆT</small><strong>{stored.queue.filter((x) => x.status === "Chờ duyệt").length}</strong><span>Hàng chờ cục bộ</span></article><article><small>NHẬT KÝ</small><strong>{stored.logs.length}</strong><span>Trên trình duyệt</span></article></div><section className={styles.panel}><h2>Quản lý lối vào hệ sinh thái</h2><p>Chỉnh tên, mô tả, URL HTTPS; bản nháp áp dụng lên bản đồ, thẻ ứng dụng và các lối vào nhanh trên cùng trình duyệt.</p><button className={styles.primary} onClick={() => setTab(mode === "admin" ? "content" : "moderation")}>{mode === "admin" ? "Mở Nội dung Hub →" : "Mở hàng chờ duyệt →"}</button></section><section className={styles.panel}><h2>Quy trình duyệt</h2><p>Admin và Moderator dùng quyền thật từ hồ sơ club_members; trang hiện tại chỉ mở sau khi máy chủ xác minh phiên và vai trò.</p><button className={styles.secondary} onClick={() => setTab(mode === "admin" ? "roles" : "audit")}>{mode === "admin" ? "Xem vai trò & quyền" : "Xem nhật ký"}</button></section></div>}

      {tab === "content" && <div className={styles.content}><div className={styles.intro}><h2>Nội dung từng Hub</h2><p>URL bản nháp nhận HTTPS. Khi lưu, bản đồ và các thẻ ở trang chính trên thiết bị này dùng giá trị mới.</p></div>{apps.map((app) => <article className={styles.editor} key={app.slug}><div className={styles.editorTitle}><span className={styles.appIcon}>{app.shortName.slice(0, 1)}</span><div><h3>{app.name}</h3><small>{app.slug} · {app.hosting}</small></div><span className={styles.statusPill}>{app.status}</span></div><div className={styles.fields}><label>Tên hiển thị<input value={app.name} onChange={(e) => edit(app.slug, "name", e.target.value)} /></label><label>Tên ngắn<input value={app.shortName} onChange={(e) => edit(app.slug, "shortName", e.target.value)} /></label><label>Mô tả ngắn<input value={app.tagline} onChange={(e) => edit(app.slug, "tagline", e.target.value)} /></label><label>URL HTTPS<input type="url" value={app.currentUpstreamUrl} onChange={(e) => edit(app.slug, "currentUpstreamUrl", e.target.value)} /></label><label className={styles.full}>Mô tả Hub<textarea rows={3} value={app.description} onChange={(e) => edit(app.slug, "description", e.target.value)} /></label></div></article>)}<button className={styles.primary} onClick={save}>Lưu bản nháp trên thiết bị</button></div>}

      {tab === "links" && <div className={styles.content}><div className={styles.intro}><h2>Các liên kết hiện có</h2><p>Điểm đến lấy từ registry hoặc bản nháp cục bộ. Trạng thái không được xác nhận tự động.</p></div><div className={styles.linkList}>{apps.map((app) => <article key={app.slug}><div><strong>{app.name}</strong><small>{app.tagline}</small><code>{app.currentUpstreamUrl}</code></div><span className={styles.statusPill}>{app.status}</span><a href={app.currentUpstreamUrl} target="_blank" rel="noreferrer">Mở ↗</a></article>)}</div><button className={styles.primary} onClick={save}>Lưu URL bản nháp</button></div>}

      {tab === "moderation" && <div className={styles.content}><div className={styles.intro}><h2>Hàng chờ duyệt của Moderator</h2><p>Hàng chờ kiểm thử; dữ liệu chỉ được lưu trong trình duyệt này.</p></div><section className={styles.panel}><label className={styles.request}>Thêm mục thử nghiệm<textarea rows={3} value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Nhập nội dung cần xem xét…" /></label><button className={styles.primary} onClick={addQueueItem}>Thêm vào hàng chờ cục bộ</button></section>{stored.queue.length === 0 ? <div className={styles.empty}><span>✓</span><strong>Chưa có mục chờ duyệt</strong><p>Không có yêu cầu nào được giả làm dữ liệu thật.</p></div> : <div className={styles.queue}>{stored.queue.map((item) => <article key={item.id}><div><span className={styles.statusPill}>{item.status}</span><p>{item.text}</p><small>{item.date} · Cục bộ</small></div><div><button onClick={() => review(item.id, "Đã duyệt")}>Duyệt</button><button onClick={() => review(item.id, "Đã lưu trữ")}>Lưu trữ</button></div></article>)}</div>}</div>}

      {tab === "roles" && <div className={styles.content}><div className={styles.intro}><h2>Thành viên và vai trò</h2><p>Phiên hiện tại đã được xác thực từ hệ thống thành viên dùng chung; quyền hiển thị lấy từ vai trò máy chủ.</p></div><div className={styles.roles}><article><span>◇</span><h3>Admin</h3><p>Vai trò dự kiến: quản lý nội dung Hub, cấu hình và quy trình xuất bản.</p><b>Admin: yêu cầu role admin tại máy chủ</b></article><article><span>◎</span><h3>Moderator</h3><p>Vai trò dự kiến: xem xét và gửi đề xuất nội dung cho Admin.</p><b>Moderator: yêu cầu role mod/super_mod/admin</b></article></div><div className={styles.warning}><strong>Không hiển thị dữ liệu thành viên không cần thiết</strong><p>Khu vực này chỉ dùng thông tin vai trò tối thiểu để phân quyền; không tự tạo tên, email, điểm số hoặc thông tin tài khoản.</p></div></div>}

      {tab === "audit" && <div className={styles.content}><div className={styles.intro}><h2>Nhật ký thao tác</h2><p>Thao tác được ghi trên trình duyệt hiện tại.</p></div>{mode === "admin" && <section className={styles.panel}><div className={styles.intro}><h2>Lỗi Game Hub · Y Quán</h2><p>Mã lỗi và khu vực phát sinh, tự làm mới mỗi phút. Không hiển thị nội dung phiên hay dữ liệu người chơi.</p></div>{gameHubErrorNotice && <p className={styles.statusMessage} role="status">{gameHubErrorNotice}</p>}{gameHubErrors.length === 0 ? <div className={styles.empty}><strong>Chưa có lỗi được ghi nhận</strong><p>Nhật ký sẽ xuất hiện khi Game Hub gửi mã lỗi hợp lệ.</p></div> : <div className={styles.logs}>{gameHubErrors.map((item) => <article key={item.id}><span>!</span><div><strong>{item.errorCode} · {item.routeKey}</strong><small>{new Date(item.createdAt).toLocaleString("vi-VN")} · Game Hub</small></div></article>)}</div>}</section>}{stored.logs.length === 0 ? <div className={styles.empty}><span>≋</span><strong>Chưa có thao tác được ghi</strong><p>Nhật ký xuất hiện khi lưu bản nháp hoặc duyệt mục cục bộ.</p></div> : <div className={styles.logs}>{stored.logs.map((item) => <article key={item.id}><span>•</span><div><strong>{item.text}</strong><small>{item.date} · Trình duyệt này</small></div></article>)}</div>}</div>}

      {tab === "settings" && <div className={styles.content}><div className={styles.intro}><h2>Cấu hình và sao lưu</h2><p>Xuất hoặc nhập dữ liệu bản nháp trên thiết bị.</p></div><section className={styles.panel}><h3>Sao lưu JSON</h3><p>File chỉ chứa các bản nháp Hub, không có mật khẩu hay tài khoản thành viên.</p><div className={styles.actions}><button className={styles.primary} onClick={exportJson}>Xuất JSON</button><label className={styles.fileButton}>Nhập JSON<input type="file" accept="application/json,.json" onChange={importJson} /></label><button className={styles.danger} onClick={clearDrafts}>Khôi phục mặc định</button></div></section><section className={styles.panel}><h3>Tình trạng kết nối</h3><ul className={styles.checks}><li>Đăng nhập Staff: đã xác minh qua Supabase session</li><li>Phân quyền Admin/Moderator: đã chặn tại Cloudflare Worker</li><li>Xuất bản nội dung dùng chung: chưa kết nối</li><li>Lưu bản nháp cục bộ: hoạt động</li></ul></section></div>}
    </section>
  </main>;
}
