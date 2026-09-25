"use client";

import { useEffect, useState } from "react";
import styles from "./SeamlessAppFrame.module.css";

const EVENT = "hiutmc:seamless-app";
const KNOWN = new Set([
  "yhct-hiu-final4-stage-hiu-yhct.vercel.app",
  "ai-thiet-chan-hiu-yhct.vercel.app",
]);

function trusted(url: URL) {
  if (url.protocol !== "https:" || url.origin === window.location.origin) return false;
  if (url.hostname.endsWith(".hiutmc.com") || KNOWN.has(url.hostname)) return true;
  return url.hostname === "drngovothiennhan.github.io" &&
    (url.pathname.startsWith("/trung-y-van-hiu/") || url.pathname.startsWith("/human-atlas/"));
}

export async function requestSeamlessFullscreen() {
  if (typeof document === "undefined" || document.fullscreenElement || !document.documentElement.requestFullscreen) return false;
  try {
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

export function launchSeamlessApp(rawUrl: string, title = "HIU TMC") {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(rawUrl, window.location.href);
    if (!trusted(url)) return;
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { url: url.toString(), title } }));
  } catch {}
}

export default function SeamlessAppFrame() {
  const [app, setApp] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ url?: string; title?: string }>).detail;
      if (!detail?.url) return;
      try {
        const url = new URL(detail.url, window.location.href);
        if (!trusted(url)) return;
        setApp({ url: url.toString(), title: (detail.title || "HIU TMC").trim().slice(0, 80) || "HIU TMC" });
      } catch {}
    };

    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download")) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (!trusted(url)) return;
        event.preventDefault();
        void requestSeamlessFullscreen();
        launchSeamlessApp(url.toString(), anchor.getAttribute("aria-label") || anchor.textContent || "HIU TMC");
      } catch {}
    };

    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setApp(null);
    };

    window.addEventListener(EVENT, open as EventListener);
    document.addEventListener("click", click);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener(EVENT, open as EventListener);
      document.removeEventListener("click", click);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (!app) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = before; };
  }, [app]);

  const close = () => {
    setApp(null);
    if (document.fullscreenElement && document.exitFullscreen) void document.exitFullscreen().catch(() => {});
  };

  if (!app) return null;

  return (
    <section className={styles.shell} role="dialog" aria-modal="true" aria-label={app.title}>
      <iframe
        className={styles.frame}
        src={app.url}
        title={app.title}
        allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <button className={styles.close} type="button" onClick={close} aria-label="Trở về HIU TMC Ecosystem">×</button>
    </section>
  );
}
