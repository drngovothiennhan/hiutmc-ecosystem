"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import DisplayModeToggle from "./DisplayModeToggle";
import styles from "./MemberAuthBridge.module.css";

const SUPABASE_URL = "https://gzmpnsrwqjpsbklyflqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG";
const STORAGE_KEY = "hiutmc-member-session-v1";
const BRIDGE_FLAG = "ecosystem_sso";

export type Member = {
  id: string;
  studentCode?: string;
  fullName: string;
  role: string;
  title: string;
  avatarUrl?: string;
};

export type LearningProgress = {
  hasSync: boolean;
  syncedAt?: string;
  activeDate?: string | null;
  streak: number;
  xp: number;
  todayQuestions: number;
  examAttempts: number;
  lastExamScore: number | null;
  aiUses: number;
  reviewCardCount: number;
  sourceVersion?: string | null;
};

export type StaffAccess = {
  authorized: boolean;
  role?: string;
  canAdmin?: boolean;
  canModerate?: boolean;
  member?: {
    id?: string;
    fullName?: string;
    studentCode?: string;
    title?: string;
  };
  reason?: string;
};

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  member: Member;
};

type AuthContextValue = {
  member: Member | null;
  staffAccess: StaffAccess | null;
  learningProgress: LearningProgress | null;
  learningProgressReady: boolean;
  ready: boolean;
  login: (studentCode: string, password: string) => Promise<StaffAccess | null>;
  logout: () => Promise<void>;
  openStudyOs: (url: string) => Promise<void>;
  openGameHubPreview: () => Promise<void>;
  refreshLearningProgress: () => Promise<void>;
  openStaffConsole: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function base64UrlJson(value: string): Record<string, unknown> {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded)))) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function tokenPayload(accessToken: string) {
  const part = accessToken.split(".")[1] ?? "";
  return base64UrlJson(part);
}

function tokenExpiry(accessToken: string) {
  const exp = Number(tokenPayload(accessToken).exp ?? 0);
  return Number.isFinite(exp) && exp > 0 ? exp * 1000 : Date.now() + 45 * 60 * 1000;
}

function readStored(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.member?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStored(session: StoredSession | null) {
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id || ""),
    studentCode: String(row.student_code || row.studentCode || "") || undefined,
    fullName: String(row.full_name || row.fullName || "Thành viên"),
    role: String(row.role || "member"),
    title: String(row.position_title || row.title || "Hội viên"),
    avatarUrl: String(row.avatar_url || row.avatarUrl || "") || undefined,
  };
}

async function fetchMember(accessToken: string): Promise<Member> {
  const payload = tokenPayload(accessToken);
  const appMeta = (payload.app_metadata || {}) as Record<string, unknown>;
  const memberId = String(appMeta.member_id || "");
  const authUserId = String(payload.sub || "");
  const url = new URL(`${SUPABASE_URL}/rest/v1/club_members`);
  url.searchParams.set("select", "id,auth_user_id,student_code,full_name,role,status,position_title,avatar_url,login_enabled");
  url.searchParams.set(memberId ? "id" : "auth_user_id", `eq.${memberId || authUserId}`);
  url.searchParams.set("limit", "1");
  const response = await fetch(url.toString(), {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Không thể xác minh hồ sơ thành viên.");
  const rows = (await response.json()) as Record<string, unknown>[];
  const row = rows[0];
  if (!row) throw new Error("Không tìm thấy hồ sơ thành viên.");
  if (String(row.status || "approved") !== "approved" || row.login_enabled === false) {
    throw new Error("Tài khoản chưa được phép đăng nhập.");
  }
  return mapMember(row);
}

async function syncStaffSession(accessToken: string): Promise<StaffAccess | null> {
  try {
    const response = await fetch("/api/staff/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const body = (await response.json().catch(() => null)) as StaffAccess | null;
    return body;
  } catch {
    return null;
  }
}

async function clearStaffSession() {
  try {
    await fetch("/api/staff/session", { method: "DELETE", cache: "no-store", keepalive: true });
  } catch {}
}

async function fetchLearningProgress(accessToken: string): Promise<LearningProgress | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/learning-sync`, {
      method: "GET",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return null;
    const stats = body.stats && typeof body.stats === "object" ? body.stats as Record<string, unknown> : null;
    return {
      hasSync: body.hasSync === true && Boolean(stats),
      syncedAt: stats ? String(stats.syncedAt || "") || undefined : undefined,
      activeDate: stats ? String(stats.activeDate || "") || null : null,
      streak: stats ? Math.max(0, Number(stats.streak) || 0) : 0,
      xp: stats ? Math.max(0, Number(stats.xp) || 0) : 0,
      todayQuestions: stats ? Math.max(0, Number(stats.todayQuestions) || 0) : 0,
      examAttempts: stats ? Math.max(0, Number(stats.examAttempts) || 0) : 0,
      lastExamScore: stats && stats.lastExamScore !== null && stats.lastExamScore !== undefined ? Math.max(0, Math.min(100, Number(stats.lastExamScore) || 0)) : null,
      aiUses: stats ? Math.max(0, Number(stats.aiUses) || 0) : 0,
      reviewCardCount: stats ? Math.max(0, Number(stats.reviewCardCount) || 0) : 0,
      sourceVersion: stats ? String(stats.sourceVersion || "") || null : null,
    };
  } catch {
    return null;
  }
}

async function refreshSession(current: StoredSession): Promise<StoredSession> {
  let accessToken = current.accessToken;
  let refreshToken = current.refreshToken;
  if (current.expiresAt - Date.now() <= 90_000) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) throw new Error("Phiên đăng nhập đã hết hạn.");
    accessToken = String(body.access_token || "");
    refreshToken = String(body.refresh_token || current.refreshToken);
  }
  if (!accessToken) throw new Error("Phiên đăng nhập không hợp lệ.");
  const member = await fetchMember(accessToken);
  const next = { accessToken, refreshToken, expiresAt: tokenExpiry(accessToken), member };
  saveStored(next);
  return next;
}

function useG2PreviewLoginProxy() {
  const hostname = window.location.hostname;
  const previewHost = /^(?:[a-f0-9]+-)?hiutmc-ecosystem-g2-sso-preview\.dr-ngovothiennhan\.workers\.dev$/.test(hostname);
  return previewHost && new URLSearchParams(window.location.search).get("g2-sso-test") === "1";
}

async function loginMember(studentCode: string, password: string): Promise<StoredSession> {
  const endpoint = useG2PreviewLoginProxy()
    ? "/api/g2-member-login"
    : `${SUPABASE_URL}/functions/v1/member-login`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: endpoint.startsWith("/") ? { "Content-Type": "application/json" } : { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ studentCode: studentCode.trim(), password }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(body.error || "Đăng nhập không thành công"));
  const accessToken = String(body.access_token || "");
  const refreshToken = String(body.refresh_token || "");
  if (!accessToken || !refreshToken) throw new Error("Máy chủ chưa trả về phiên đăng nhập hợp lệ.");
  const member = await fetchMember(accessToken);
  const session = { accessToken, refreshToken, expiresAt: tokenExpiry(accessToken), member };
  saveStored(session);
  return session;
}

function clearBridgeFragment() {
  if (!window.location.hash) return;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

async function consumeIncomingBridge(): Promise<StoredSession | null> {
  if (!window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.get(BRIDGE_FLAG) !== "1") return null;
  const accessToken = params.get("access_token") || "";
  const refreshToken = params.get("refresh_token") || "";
  clearBridgeFragment();
  if (accessToken.length < 40 || refreshToken.length < 20) return null;
  const member = await fetchMember(accessToken);
  const session = { accessToken, refreshToken, expiresAt: tokenExpiry(accessToken), member };
  saveStored(session);
  return session;
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [staffAccess, setStaffAccess] = useState<StaffAccess | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [learningProgressReady, setLearningProgressReady] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const bridged = await consumeIncomingBridge();
        if (bridged) {
          const access = await syncStaffSession(bridged.accessToken);
          if (live) {
            setSession(bridged);
            setStaffAccess(access?.authorized ? access : null);
          }
          return;
        }
        const cached = readStored();
        if (!cached) {
          await clearStaffSession();
          return;
        }
        const refreshed = await refreshSession(cached);
        const access = await syncStaffSession(refreshed.accessToken);
        if (live) {
          setSession(refreshed);
          setStaffAccess(access?.authorized ? access : null);
        }
      } catch {
        saveStored(null);
        await clearStaffSession();
        if (live) {
          setSession(null);
          setStaffAccess(null);
        }
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    const refresh = async () => {
      if (!session?.accessToken) {
        if (live) {
          setLearningProgress(null);
          setLearningProgressReady(true);
        }
        return;
      }
      const progress = await fetchLearningProgress(session.accessToken);
      if (live) {
        setLearningProgress(progress);
        setLearningProgressReady(true);
      }
    };
    setLearningProgressReady(false);
    void refresh();
    const onFocus = () => void refresh();
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => {
      live = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session?.accessToken, session?.member.id]);

  const refreshLearningProgress = async () => {
    if (!session?.accessToken) {
      setLearningProgress(null);
      setLearningProgressReady(true);
      return;
    }
    setLearningProgressReady(false);
    const progress = await fetchLearningProgress(session.accessToken);
    setLearningProgress(progress);
    setLearningProgressReady(true);
  };

  const value = useMemo<AuthContextValue>(() => ({
    member: session?.member ?? null,
    staffAccess,
    learningProgress,
    learningProgressReady,
    ready,
    login: async (studentCode, password) => {
      const next = await loginMember(studentCode, password);
      const access = await syncStaffSession(next.accessToken);
      setSession(next);
      setStaffAccess(access?.authorized ? access : null);
      return access;
    },
    logout: async () => {
      const accessToken = session?.accessToken;
      saveStored(null);
      setSession(null);
      setStaffAccess(null);
      setLearningProgress(null);
      setLearningProgressReady(true);
      await clearStaffSession();
      if (accessToken) {
        void fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
          keepalive: true,
        }).catch(() => {});
      }
    },
    openStudyOs: async (rawUrl) => {
      let target: URL;
      try { target = new URL(rawUrl); } catch { window.location.assign(rawUrl); return; }
      const allowed = new Set(["yhct-hiu-final4-stage-hiu-yhct.vercel.app", "study.hiutmc.com"]);
      if (!allowed.has(target.hostname) || !session) {
        window.location.assign(target.toString());
        return;
      }
      try {
        const fresh = await refreshSession(session);
        const access = await syncStaffSession(fresh.accessToken);
        setSession(fresh);
        setStaffAccess(access?.authorized ? access : null);
        const fragment = new URLSearchParams({
          [BRIDGE_FLAG]: "1",
          access_token: fresh.accessToken,
          refresh_token: fresh.refreshToken,
        });
        target.hash = fragment.toString();
        window.location.assign(target.toString());
      } catch {
        saveStored(null);
        await clearStaffSession();
        setSession(null);
        setStaffAccess(null);
        window.location.assign(target.toString());
      }
    },
    openGameHubPreview: async () => {
      const target = new URL("https://c8637929.hiutmc-game-hub.pages.dev/");
      if (!session) {
        window.location.assign(target.toString());
        return;
      }
      try {
        const fresh = await refreshSession(session);
        setSession(fresh);
        const fragment = new URLSearchParams({
          [BRIDGE_FLAG]: "1",
          access_token: fresh.accessToken,
          refresh_token: fresh.refreshToken,
        });
        target.hash = fragment.toString();
        window.location.assign(target.toString());
      } catch {
        saveStored(null);
        setSession(null);
        window.location.assign(target.toString());
      }
    },
    refreshLearningProgress,
    openStaffConsole: () => {
      if (!staffAccess?.authorized) return;
      window.location.assign(staffAccess.canAdmin ? "/admin/" : "/mod/");
    },
  }), [ready, session, staffAccess, learningProgress, learningProgressReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMemberAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useMemberAuth must be used inside MemberAuthProvider");
  return value;
}

export function StudyOsLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  const { openStudyOs } = useMemberAuth();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    void openStudyOs(href);
  };
  return <a href={href} className={className} onClick={onClick} {...rest}>{children}</a>;
}

export function MemberAccount({ studyOsUrl }: { studyOsUrl: string }) {
  const { member, staffAccess, learningProgress, ready, login, logout, openStudyOs, openStaffConsole } = useMemberAuth();
  const [open, setOpen] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !studentCode.trim() || !password) return;
    setBusy(true);
    setError("");
    try {
      const access = await login(studentCode, password);
      setPassword("");
      setOpen(false);
      if (access?.authorized) {
        window.location.assign(access.canAdmin ? "/admin/" : "/mod/");
      }
    } catch (cause) {
      setPassword("");
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập.");
    } finally {
      setBusy(false);
    }
  };

  const initials = (member?.fullName || "HIU").split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
  const staffLabel = staffAccess?.canAdmin ? "Admin Center" : "Mod Center";

  return <>
    <button className={styles.accountButton} type="button" onClick={() => setOpen(true)} aria-label={member ? `Tài khoản ${member.fullName}` : "Đăng nhập thành viên"}>
      <i className={styles.avatar}>{member?.avatarUrl ? <img src={member.avatarUrl} alt="" /> : (initials || "HIU")}</i>
      <span>
        <strong>{member ? member.fullName : "Thành viên YHCT"}</strong>
        <small>{!ready ? "Đang kiểm tra phiên…" : member ? `${member.title} · Đã đồng bộ Study OS` : "Đăng nhập bằng tài khoản Study OS"}</small>
      </span>
    </button>

    {open && <div className={styles.backdrop} onMouseDown={() => !busy && setOpen(false)}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={member ? "Tài khoản thành viên" : "Đăng nhập thành viên"} onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Đóng">×</button>
        {member ? <>
          <div className={styles.memberCard}>
            <i className={styles.avatarLarge}>{member.avatarUrl ? <img src={member.avatarUrl} alt="" /> : initials}</i>
            <span><small>THÀNH VIÊN ĐÃ ĐỒNG BỘ</small><strong>{member.fullName}</strong><em>{member.studentCode || "HIU YHCT"} · {member.title}</em></span>
          </div>
          <p>Phiên đăng nhập trang chủ dùng cùng hệ tài khoản với Study OS. Quyền Admin/Mod được xác minh lại tại máy chủ trước khi mở khu vực quản trị.</p>
          <div className={styles.displayModeSetting}>
            <span><strong>Chế độ hiển thị</strong><small>Chuyển Mobile/PC ngay trong hồ sơ thành viên.</small></span>
            <DisplayModeToggle className={styles.profileModeButton} />
          </div>
          <div className={styles.syncState}>
            <strong>{learningProgress?.hasSync ? "Tiến độ Study OS đã đồng bộ" : "Tiến độ Study OS chưa có bản đồng bộ thành công"}</strong>
            <small>{learningProgress?.hasSync ? `Streak ${learningProgress.streak} ngày · ${learningProgress.todayQuestions} câu hôm nay · ${learningProgress.xp} XP` : "Mở Study OS sau bản sửa để hệ thống gửi lại dữ liệu học tập lên máy chủ."}</small>
          </div>
          {staffAccess?.authorized && <button className={styles.staff} type="button" onClick={openStaffConsole}>Mở {staffLabel} →</button>}
          <button className={styles.primary} type="button" onClick={() => void openStudyOs(studyOsUrl)}>Mở Study OS →</button>
          <button className={styles.secondary} type="button" onClick={() => void logout().then(() => setOpen(false))}>Đăng xuất</button>
        </> : <form onSubmit={submit}>
          <small className={styles.kicker}>HIU YHCT MEMBER SSO</small>
          <h2>Đăng nhập thành viên</h2>
          <p>Dùng cùng MSSV và mật khẩu đang sử dụng tại Study OS. Tài khoản Admin/Mod sẽ được máy chủ nhận diện và chuyển đúng khu vực sau khi xác thực.</p>
          <label>MSSV<input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} autoComplete="username" inputMode="numeric" disabled={busy} /></label>
          <label>Mật khẩu<input value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} type="password" autoComplete="current-password" disabled={busy} /></label>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.primary} type="submit" disabled={busy || !studentCode.trim() || !password}>{busy ? "Đang xác thực…" : "Đăng nhập"}</button>
          <div className={styles.displayModeSetting}>
            <span><strong>Chế độ hiển thị</strong><small>Đổi Mobile/PC trước hoặc sau khi đăng nhập.</small></span>
            <DisplayModeToggle className={styles.profileModeButton} />
          </div>
          <small className={styles.note}>Tài khoản và quyền thành viên được xác thực trực tiếp từ hệ thống Study OS và hồ sơ club_members.</small>
        </form>}
      </section>
    </div>}
  </>;
}
