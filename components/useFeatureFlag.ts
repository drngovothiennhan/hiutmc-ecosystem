"use client";

import { useEffect, useState } from "react";
import type { FlagId } from "@/lib/feature-flags.mjs";

type FlagMap = Partial<Record<FlagId, boolean>>;
type CacheEntry = { at: number; key: string; flags: FlagMap };

const CACHE_KEY = "hiutmc:feature-flags:v1";
const CACHE_TTL_MS = 60_000;
const inflight = new Map<string, Promise<FlagMap>>();

function readCache(key: string): FlagMap | null {
  try {
    const entry = JSON.parse(window.sessionStorage.getItem(CACHE_KEY) || "null") as CacheEntry | null;
    if (entry && entry.key === key && Date.now() - entry.at < CACHE_TTL_MS && entry.flags) return entry.flags;
  } catch {}
  return null;
}

function writeCache(key: string, flags: FlagMap) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), key, flags } satisfies CacheEntry));
  } catch {}
}

function loadFlags(accessToken: string | undefined, preview: string): Promise<FlagMap> {
  const key = `${accessToken ? accessToken.slice(-12) : ""}|${preview}`;
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(key);
  if (pending) return pending;
  const url = preview ? `/api/flags?preview=${encodeURIComponent(preview)}` : "/api/flags";
  const request = fetch(url, accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined)
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { flags?: FlagMap } | null) => {
      const flags = data && data.flags && typeof data.flags === "object" ? data.flags : {};
      writeCache(key, flags);
      return flags;
    })
    .catch(() => ({}) as FlagMap)
    .finally(() => { inflight.delete(key); });
  inflight.set(key, request);
  return request;
}

/**
 * Returns whether a rollout flag is ON for the current visitor. Always starts OFF (false) and only turns
 * ON once the Worker confirms it, so an unreleased feature can never flash on screen. Any error keeps it OFF.
 *
 * Staff can preview a flag ahead of rollout with `?flag_preview=<flag-id>`; the Worker honours it only for a
 * verified Admin/Mod session. Pass `accessToken` (the member's Supabase access token) when the feature is
 * rolled out to testers/percentages, so the Worker can identify the member; without it only the staff
 * cookie and the "all" stage apply.
 *
 * Flags are not a security control: the feature itself must still enforce access server-side.
 */
export function useFeatureFlag(id: FlagId, options: { accessToken?: string } = {}): boolean {
  const [enabled, setEnabled] = useState(false);
  const accessToken = options.accessToken;

  useEffect(() => {
    let live = true;
    const preview = new URLSearchParams(window.location.search).get("flag_preview") || "";
    void loadFlags(accessToken, preview).then((flags) => {
      if (live) setEnabled(flags[id] === true);
    });
    return () => { live = false; };
  }, [id, accessToken]);

  return enabled;
}
