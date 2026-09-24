"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import styles from "./MemberAuthBridge.module.css";

const SUPABASE_URL = "https://gzmpnsrwqjpsbklyflqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG";
const STORAGE_KEY = "hiutmc-member-session-v1";
const BRIDGE_FLAG = "ecosystem_sso";

type Member = {
  id: string;
  studentCode?: string;
  fullName: string;
  role: string;
  title: string;
  avatarUrl?: string;
};

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  member: Member;
};

type AuthContextValue = {
  member: Member | null;
  ready: boolean;
  login: (studentCode: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  openStudyOs: (url: string) => Promise<void>;
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

async function refreshSession(current: StoredSession): Promise<StoredSession> {
  if (current.expiresAt - Date.now() > 90_000) return current;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: current.refreshToken }),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error("Phiên đăng nhập đã hết hạn.");
  const accessToken = String(body.access_token || "");
  const refreshToken = String(body.refresh_token || current.refreshToken);
  const member = await fetchMember(accessToken);
  const next = { accessToken, refreshToken, expiresAt: tokenExpiry(accessToken), member };
  saveStored(next);
  return next;
}

async function loginMember(studentCode: string, password: string): Promise<StoredSession> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/member-login`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ studentCode: studentCode.trim(), password }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(body.error || "Đăng nhập không thành công"));
  const accessToken = String(body.access_token || "");
  const refreshToken = String(body.refresh_token || "");
  if (!accessToken || !refreshToken) throw new Error("Máy chủ chưa trả về phiên đăng nhập hợp lệ.");
  const member = body.member && typeof body.member === "object"
    ? mapMember(body.member as Record<string, unknown>)
    : await fetchMember(accessToken);
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const bridged = await consumeIncomingBridge();
        if (bridged) {
          if (live) setSession(bridged);
          return;
        }
        const cached = readStored();
        if (!cached) return;
        const refreshed = await refreshSession(cached);
        if (live) setSession(refreshed);
      } catch {
        saveStored(null);
        if (live) setSession(null);
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    member: session?.member ?? null,
    ready,
    login: async (studentCode, password) => {
      const next = await loginMember(studentCode, password);
      setSession(next);
    },
    logout: async () => {
      const accessToken = session?.accessToken;
      saveStored(null);
      setSession(null);
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
  }), [ready, session]);

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
  const { member, ready, login, logout, openStudyOs } = useMemberAuth();
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
      await login(studentCode, password);
      setPassword("");
      setOpen(false);
    } catch (cause) {
      setPassword("");
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập.");
    } finally {
      setBusy(false);
    }
  };

  const initials = (member?.fullName || "HIU").split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();

  return <>
    <button className={styles.accountButton} type="button" onClick={() => setOpen(true)} aria-label={member ? `Tài khoản ${member.fullName}` : "Đăng nhập thành viên"}>
      <i className={styles.avatar}>{member?.avatarUrl?<img src={member.avatarUrl} alt="" />:(initials || "HIU")}</i>
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
            <i className={styles.avatarLarge}>{member.avatarUrl?<img src={member.avatarUrl} alt="" />:initials}</i>
            <span><small>THÀNH VIÊN ĐÃ ĐỒNG BỘ</small><strong>{member.fullName}</strong><em>{member.studentCode || "HIU YHCT"} · {member.title}</em></span>
          </div>
          <p>Phiên đăng nhập trang chủ dùng cùng hệ tài khoản với Study OS. Khi mở Study OS từ đây, hệ thống chuyển phiên sang app và không yêu cầu nhập lại mật khẩu.</p>
          <button className={styles.primary} type="button" onClick={() => void openStudyOs(studyOsUrl)}>Mở Study OS →</button>
          <button className={styles.secondary} type="button" onClick={() => void logout().then(() => setOpen(false))}>Đăng xuất</button>
        </> : <form onSubmit={submit}>
          <small className={styles.kicker}>HIU YHCT MEMBER SSO</small>
          <h2>Đăng nhập thành viên</h2>
          <p>Dùng cùng MSSV và mật khẩu đang sử dụng tại Study OS.</p>
          <label>MSSV<input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} autoComplete="username" inputMode="numeric" disabled={busy} /></label>
          <label>Mật khẩu<input value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} type="password" autoComplete="current-password" disabled={busy} /></label>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.primary} type="submit" disabled={busy || !studentCode.trim() || !password}>{busy ? "Đang xác thực…" : "Đăng nhập"}</button>
          <small className={styles.note}>Tài khoản và quyền thành viên được xác thực trực tiếp từ hệ thống Study OS.</small>
        </form>}
      </section>
    </div>}
  </>;
}
