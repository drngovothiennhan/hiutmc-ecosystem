"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "@/app/admin/admin.module.css";
import { AUTO_THEME_ID, DEFAULT_THEME_ID, effectiveTheme, isKnownThemeId, siteThemes, type SiteTheme, type ThemeGroup } from "@/data/site-themes";

const GROUPS: Array<{ group: ThemeGroup[]; title: string }> = [
  { group: ["default", "auto"], title: "Mặc định và tự động" },
  { group: ["season"], title: "Theo bốn mùa" },
  { group: ["festival"], title: "Theo lễ hội" },
];

function swatchStyle(theme: SiteTheme, now: Date): CSSProperties {
  const shown = effectiveTheme(theme.id, now);
  const v = shown.vars;
  return {
    "--sw-side": v?.navy ?? "#112a44",
    "--sw-accent": v?.wine ?? "#9f1c3b",
    "--sw-bg": v?.bg2 ?? "#f7f2e8",
    "--sw-card": v?.cream ?? "#efe4d1",
  } as CSSProperties;
}

async function themeRequest(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null) as { error?: string; themeId?: string; data?: unknown } | null;
  if (!response.ok) {
    const detail = data?.data && typeof data.data === "object" ? Object.values(data.data as Record<string, unknown>).filter((value) => typeof value === "string").join(" ") : "";
    throw new Error([data?.error, detail].filter(Boolean).join(" · ") || `Yêu cầu thất bại (${response.status}).`);
  }
  return data;
}

/** Admin-only menu for the site-wide theme. The choice is saved on the server and shown to every visitor. */
export default function StaffThemePanel() {
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    let live = true;
    void themeRequest("/api/site-theme").then((data) => {
      const id = data?.themeId;
      if (live) setActive(isKnownThemeId(id) ? id : DEFAULT_THEME_ID);
    }).catch(() => { if (live) setActive(DEFAULT_THEME_ID); });
    return () => { live = false; };
  }, []);

  const apply = async (theme: SiteTheme) => {
    if (theme.id === active) return;
    if (!window.confirm(`Áp dụng giao diện "${theme.name}" cho toàn bộ trang chủ HIU TMC? Mọi người truy cập sẽ thấy sau tối đa khoảng một phút.`)) return;
    setBusy(theme.id); setNotice(""); setError("");
    try {
      await themeRequest("/api/staff/site-theme", { themeId: theme.id });
      setActive(theme.id);
      setNotice(`Đã áp dụng "${theme.name}". Có thể mất tối đa khoảng một phút để mọi thiết bị nhận giao diện mới. Muốn quay lại thiết kế ban đầu, chọn "Mặc định HIU TMC".`);
    } catch (reason) {
      setError(reason instanceof Error ? `Không áp dụng được: ${reason.message}` : "Không áp dụng được giao diện.");
    } finally { setBusy(""); }
  };

  const activeTheme = active ? siteThemes.find((theme) => theme.id === active) : null;
  return <div className={styles.content}>
    <div className={styles.intro}>
      <h2>Giao diện trang chủ</h2>
      <p>Chọn giao diện theo mùa hoặc lễ hội cho toàn bộ trang chính hiutmc.com. Chỉ đổi màu sắc và thêm hiệu ứng trang trí nhẹ; bố cục, nội dung và các ứng dụng kết nối không thay đổi. Người dùng bật "giảm chuyển động" sẽ không thấy hiệu ứng rơi.</p>
    </div>
    {error && <p className={styles.statusMessage} role="alert">{error}</p>}
    {notice && <p className={styles.statusMessage} role="status">{notice}</p>}
    <section className={styles.panel}>
      <small>ĐANG ÁP DỤNG</small>
      <h3>{activeTheme ? `${activeTheme.icon} ${activeTheme.name}` : "Đang tải…"}</h3>
      {activeTheme?.id === AUTO_THEME_ID && <p>Hôm nay hiển thị: <strong>{effectiveTheme(AUTO_THEME_ID, now).name}</strong></p>}
    </section>
    {GROUPS.map(({ group, title }) => <section key={title} aria-label={title}>
      <h3 className={styles.themeGroupTitle}>{title}</h3>
      <div className={styles.themeGrid}>
        {siteThemes.filter((theme) => group.includes(theme.group)).map((theme) => {
          const isActive = theme.id === active;
          return <article className={`${styles.themeCard}${isActive ? ` ${styles.themeActive}` : ""}`} key={theme.id}>
            <div className={styles.themeSwatch} style={swatchStyle(theme, now)} aria-hidden="true"><i /><b /><em>{effectiveTheme(theme.id, now).icon}</em></div>
            <h4>{theme.icon} {theme.name}</h4>
            <p>{theme.description}</p>
            <div className={styles.actions}>
              <button className={styles.primary} disabled={isActive || busy !== "" || active === null} onClick={() => void apply(theme)}>{isActive ? "Đang dùng" : busy === theme.id ? "Đang áp dụng…" : "Áp dụng"}</button>
              {theme.id !== DEFAULT_THEME_ID && <a className={styles.secondary} href={`/?theme_preview=${theme.id}`} target="_blank" rel="noreferrer">Xem thử ↗</a>}
            </div>
          </article>;
        })}
      </div>
    </section>)}
  </div>;
}
