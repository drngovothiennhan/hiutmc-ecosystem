"use client";

import { useCallback, useEffect, useState } from "react";

export type DisplayMode = "auto" | "pc";
const KEY = "hiutmc-display-mode-v1";
const EVENT = "hiutmc:display-mode-change";

function readMode(): DisplayMode {
  try { return window.localStorage.getItem(KEY) === "pc" ? "pc" : "auto"; }
  catch { return "auto"; }
}

function applyMode(mode: DisplayMode) {
  document.documentElement.dataset.displayMode = mode;
}

export function useDisplayMode() {
  const [mode, setModeState] = useState<DisplayMode>("auto");

  useEffect(() => {
    const sync = () => {
      const next = readMode();
      setModeState(next);
      applyMode(next);
    };
    sync();
    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<DisplayMode>).detail;
      if (next !== "auto" && next !== "pc") return;
      setModeState(next);
      applyMode(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) sync();
    };
    window.addEventListener(EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setMode = useCallback((next: DisplayMode) => {
    setModeState(next);
    applyMode(next);
    try { window.localStorage.setItem(KEY, next); } catch {}
    window.dispatchEvent(new CustomEvent<DisplayMode>(EVENT, { detail: next }));
  }, []);

  return { mode, setMode };
}

export default function DisplayModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useDisplayMode();
  const toggle = () => setMode(mode === "pc" ? "auto" : "pc");
  const currentMode = mode === "pc" ? "PC" : "Mobile";
  const nextMode = mode === "pc" ? "Mobile" : "PC";
  const label = mode === "pc" ? "PC → Mobile" : "Mobile → PC";

  return (
    <button
      className={["displayModeToggle", className].filter(Boolean).join(" ")}
      type="button"
      onClick={toggle}
      aria-label={`Chuyển đổi giữa giao diện Mobile và PC. Hiện đang ở giao diện ${currentMode}.`}
      aria-pressed={mode === "pc"}
      title={`Đang ở giao diện ${currentMode}; chuyển sang ${nextMode}`}
    >
      {label}
    </button>
  );
}
