"use client";

import { useEffect, useState } from "react";

type Mode = "auto" | "pc";
const KEY = "hiutmc-display-mode-v1";

export default function DisplayModeToggle() {
  const [mode, setMode] = useState<Mode>("auto");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "pc") setMode("pc");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.displayMode = mode;
    return () => { delete document.documentElement.dataset.displayMode; };
  }, [mode]);
  const toggle = () => {
    const next: Mode = mode === "pc" ? "auto" : "pc";
    setMode(next);
    try { window.localStorage.setItem(KEY, next); } catch { /* The display switch still works for this visit. */ }
  };
  const currentMode = mode === "pc" ? "PC" : "Mobile";
  const nextMode = mode === "pc" ? "Mobile" : "PC";
  const label = mode === "pc" ? "PC → Mobile" : "Mobile → PC";
  return <button className="displayModeToggle" type="button" onClick={toggle} aria-label={`Chuyển đổi giữa giao diện Mobile và PC. Hiện đang ở giao diện ${currentMode}.`} aria-pressed={mode === "pc"} title={`Đang ở giao diện ${currentMode}; chuyển sang ${nextMode}`}>{label}</button>;
}
