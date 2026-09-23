"use client";

import { useEffect, useState } from "react";
import { ecosystemApps, type EcosystemApp } from "@/data/apps";

export type HubDraft = Partial<Pick<EcosystemApp, "name" | "shortName" | "tagline" | "description" | "currentUpstreamUrl">>;
export type HubDrafts = Record<string, HubDraft>;
const KEY = "hiutmc-admin-hub-drafts-v1";
const CHANGE_EVENT = "hiutmc:hub-drafts-changed";

function validDraft(value: unknown): value is HubDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  for (const key of ["name", "shortName", "tagline", "description", "currentUpstreamUrl"]) {
    if (item[key] !== undefined && typeof item[key] !== "string") return false;
  }
  const url = item.currentUpstreamUrl;
  if (typeof url === "string") {
    try { if (new URL(url).protocol !== "https:") return false; } catch { return false; }
  }
  return true;
}

export function readHubDrafts(): HubDrafts {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const allowed = new Set(ecosystemApps.map((app) => app.slug));
    return Object.fromEntries(Object.entries(parsed).filter(([slug, value]) => allowed.has(slug) && validDraft(value))) as HubDrafts;
  } catch { return {}; }
}

export function writeHubDrafts(drafts: HubDrafts): void {
  if (typeof window === "undefined") return;
  const allowed = new Set(ecosystemApps.map((app) => app.slug));
  const safe = Object.fromEntries(Object.entries(drafts).filter(([slug, value]) => allowed.has(slug) && validDraft(value)));
  window.localStorage.setItem(KEY, JSON.stringify(safe));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function mergeHubDrafts(drafts: HubDrafts): EcosystemApp[] {
  return ecosystemApps.map((app) => ({ ...app, ...(drafts[app.slug] ?? {}) }));
}

export function useHubRegistry(): EcosystemApp[] {
  const [apps, setApps] = useState(ecosystemApps);
  useEffect(() => {
    const sync = () => setApps(mergeHubDrafts(readHubDrafts()));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(CHANGE_EVENT, sync); };
  }, []);
  return apps;
}
