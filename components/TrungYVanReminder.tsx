"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TYV_SEEN_EVENT,
  TYV_SEEN_KEY,
  TYV_SUMMARY_KEY,
  TYV_URL,
  buildTyvReminder,
  dayKey,
  parseTyvSummary,
  type TyvReminder,
} from "@/data/trung-y-van-reminder";
import styles from "./TrungYVanReminder.module.css";

/**
 * Shows the Trung Y Văn study reminder through the Linh thú.
 * mode="popup": small bubble above the launcher, once per day until dismissed.
 * mode="panel": the same message inside the open companion panel (not hidden by "Để sau").
 * Everything is read from this device's localStorage; renders nothing without a valid summary.
 */
export default function TrungYVanReminder({ mode }: { mode: "popup" | "panel" }) {
  const [reminder, setReminder] = useState<TyvReminder | null>(null);
  const [seenDay, setSeenDay] = useState("");
  const [today, setToday] = useState("");

  const refresh = useCallback(() => {
    const now = new Date();
    setToday(dayKey(now));
    try {
      setReminder(buildTyvReminder(parseTyvSummary(window.localStorage.getItem(TYV_SUMMARY_KEY)), now));
      setSeenDay(window.localStorage.getItem(TYV_SEEN_KEY) || "");
    } catch {
      setReminder(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("storage", refresh);
    window.addEventListener(TYV_SEEN_EVENT, refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(TYV_SEEN_EVENT, refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const dismiss = () => {
    try { window.localStorage.setItem(TYV_SEEN_KEY, today); } catch {}
    window.dispatchEvent(new Event(TYV_SEEN_EVENT));
  };

  if (!reminder || !today) return null;
  if (mode === "popup" && seenDay === today) return null;

  return (
    <div className={mode === "popup" ? styles.popup : styles.inline} role="status" aria-live="polite">
      <div className={styles.text}>
        <strong>Linh thú nhắc bạn ôn Trung Y Văn</strong>
        <span>{reminder.message}</span>
      </div>
      <a className={styles.go} href={TYV_URL} data-app-transition>Học ngay</a>
      {mode === "popup" && (
        <button className={styles.later} type="button" onClick={dismiss} aria-label="Để sau">×</button>
      )}
    </div>
  );
}
