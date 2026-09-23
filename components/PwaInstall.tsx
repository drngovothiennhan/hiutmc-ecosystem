"use client";

import { useEffect, useRef, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<unknown>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
const DISMISSED = "hiutmc-install-dismissed-at";
const INSTALLED = "hiutmc-installed";
const WEEK = 7 * 24 * 60 * 60 * 1000;
function read(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function write(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Private browsing still works. */ } }

export default function PwaInstall() {
  const deferred = useRef<InstallEvent | null>(null);
  const [mode, setMode] = useState<"native" | "ios" | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)");
    const nav = navigator as Navigator & { standalone?: boolean };
    const isStandalone = () => standalone.matches || nav.standalone === true;
    const markInstalled = () => {
      deferred.current = null; setInstalled(true); setVisible(false); setMode(null); write(INSTALLED, "1");
    };
    const modeChanged = () => { if (isStandalone()) markInstalled(); };
    if (isStandalone()) markInstalled();
    else setInstalled(read(INSTALLED) === "1");
    const mayRemind = () => Date.now() - Number(read(DISMISSED) || 0) > WEEK;
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      if (isStandalone()) return;
      // A new native offer is authoritative even if this browser stored an old installation.
      write(INSTALLED, "0"); setInstalled(false);
      deferred.current = event as InstallEvent; setMode("native"); setVisible(mayRemind());
    };
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const timer = window.setTimeout(() => {
      if (ios && !isStandalone() && read(INSTALLED) !== "1" && !deferred.current) {
        setMode("ios"); setVisible(mayRemind());
      }
    }, 8000);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", markInstalled);
    standalone.addEventListener("change", modeChanged);
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // Browsing and direct app links remain available if registration is blocked.
      });
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", markInstalled);
      standalone.removeEventListener("change", modeChanged);
    };
  }, []);

  function dismiss() { write(DISMISSED, String(Date.now())); setVisible(false); }
  async function install() {
    const event = deferred.current;
    if (!event || busy) return;
    setBusy(true); setMessage("");
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "dismissed") dismiss();
      else setVisible(false);
      deferred.current = null; setMode(null);
    } catch {
      deferred.current = null; setMode(null);
      setMessage("Hãy mở menu trình duyệt và chọn Cài đặt ứng dụng hoặc Thêm vào màn hình chính.");
    } finally { setBusy(false); }
  }

  if (installed || (!mode && !message)) return null;
  return <>
    {!visible && mode && <button className="pwaReopen" onClick={() => setVisible(true)}>＋ Cài HIU TMC</button>}
    {visible && <aside className="pwaInstall" aria-label="Cài đặt HIU TMC" aria-live="polite">
      <img src="/icons/icon-192.png" width="48" height="48" alt="" />
      <div><strong>HIU TMC trên màn hình chính</strong>
        <p>{mode === "ios" ? "Mở trong Safari, chọn Chia sẻ → Thêm vào Màn hình chính → Thêm." : "Cài ứng dụng để mở nhanh bản đồ và các công cụ học tập."}</p>
        {message && <p role="status">{message}</p>}
        <div className="pwaActions">{mode === "native" && <button disabled={busy} onClick={install}>{busy ? "Đang mở…" : "Cài ứng dụng"}</button>}<button onClick={dismiss}>Để sau</button></div>
      </div>
    </aside>}
  </>;
}
