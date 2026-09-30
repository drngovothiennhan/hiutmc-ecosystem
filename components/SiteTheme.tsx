"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import styles from "./SiteTheme.module.css";
import { SITE_THEME_STORAGE_KEY } from "@/lib/site-theme-script.mjs";
import { DEFAULT_THEME_ID, THEME_CSS_VARIABLES, effectiveTheme, isKnownThemeId, themeCssVariables, type SiteTheme } from "@/data/site-themes";

function applyTheme(theme: SiteTheme) {
  const root = document.documentElement;
  const vars = themeCssVariables(theme);
  for (const name of THEME_CSS_VARIABLES) root.style.removeProperty(name);
  if (Object.keys(vars).length === 0) {
    root.removeAttribute("data-site-theme");
    return vars;
  }
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  root.setAttribute("data-site-theme", theme.id);
  return vars;
}

function writeCache(storedId: string, theme: SiteTheme, vars: Record<string, string>) {
  try {
    if (storedId === DEFAULT_THEME_ID || Object.keys(vars).length === 0) window.localStorage.removeItem(SITE_THEME_STORAGE_KEY);
    else window.localStorage.setItem(SITE_THEME_STORAGE_KEY, JSON.stringify({ storedId, themeId: theme.id, vars }));
  } catch {}
}

function Decor({ theme }: { theme: SiteTheme }) {
  const decor = theme.decor;
  const items = useMemo(() => {
    if (!decor) return [];
    return Array.from({ length: decor.count }, (_, i) => ({
      glyph: decor.glyphs[i % decor.glyphs.length],
      style: {
        "--x": `${(i * 37 + 11) % 97}vw`,
        "--y": `${(i * 29 + 8) % 80 + 8}vh`,
        "--size": `${16 + ((i * 5) % 14)}px`,
        "--dur": `${9 + ((i * 3) % 8)}s`,
        "--delay": `-${(i * 17) % 13}s`,
        "--drift": `${(i % 2 ? 1 : -1) * (20 + ((i * 7) % 50))}px`,
      } as CSSProperties,
    }));
  }, [decor]);
  if (!decor) return null;
  return <div className={`${styles.decor} ${styles[decor.motion] ?? ""}`} aria-hidden="true">{items.map((item, index) => <span className={styles.glyph} style={item.style} key={index}>{item.glyph}</span>)}</div>;
}

/**
 * Applies the Admin-selected site theme. The default design is the fallback for everything:
 * no theme, unknown id, network error, or a staff console page. `?theme_preview=<id>` shows a
 * theme in this tab only (used by the Admin "Xem thử" link) and never touches the saved cache.
 */
export default function SiteTheme() {
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const staffPage = /^\/(admin|mod)(\/|$)/.test(pathname);

  useEffect(() => {
    let live = true;
    const preview = new URLSearchParams(window.location.search).get("theme_preview");
    if (preview && isKnownThemeId(preview)) {
      const resolved = effectiveTheme(preview);
      applyTheme(resolved);
      setTheme(resolved);
      return;
    }
    // Paint from the cache (already applied by the head script) while the real value loads.
    try {
      const cached = JSON.parse(window.localStorage.getItem(SITE_THEME_STORAGE_KEY) || "null") as { storedId?: string } | null;
      if (cached?.storedId && isKnownThemeId(cached.storedId)) setTheme(effectiveTheme(cached.storedId));
    } catch {}
    void fetch("/api/site-theme")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { themeId?: unknown } | null) => {
        if (!live || !data || !isKnownThemeId(data.themeId)) return;
        const resolved = effectiveTheme(data.themeId);
        const vars = applyTheme(resolved);
        writeCache(data.themeId, resolved, vars);
        setTheme(resolved);
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  if (!theme || !theme.decor || staffPage) return null;
  return <Decor theme={theme} />;
}
