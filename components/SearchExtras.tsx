"use client";

import { useEffect, useMemo, useState } from "react";
import { googleSearchHref, parseLibraryRows, rankLibrary, type LibraryHit } from "@/data/shared-search";
import { ecosystemApps } from "@/data/apps";
import { StudyOsLink, SUPABASE_KEY, SUPABASE_URL, useMemberAuth } from "./MemberAuthBridge";
import { useFeatureFlag } from "./useFeatureFlag";

/**
 * Optional extras under the Search page results. Both are behind feature flags that ship OFF:
 *   search-shared-library -> published member resources from the Study OS library (same Supabase data, member session)
 *   search-google-link    -> external Google link, labelled as not verified by HIU
 * With both flags OFF this renders nothing, so the approved Search page is unchanged.
 */
export default function SearchExtras({ query }: { query: string }) {
  const { accessToken } = useMemberAuth();
  const library = useFeatureFlag("search-shared-library", { accessToken });
  const google = useFeatureFlag("search-google-link", { accessToken });
  const [rows, setRows] = useState<LibraryHit[] | null>(null);
  const studyHref = ecosystemApps.find((app) => app.slug === "study-os")?.launchUrl ?? "/apps/study/";

  useEffect(() => {
    if (!library || !accessToken) { setRows(null); return; }
    const controller = new AbortController();
    fetch(`${SUPABASE_URL}/rest/v1/rpc/learning_resource_list_v1`, {
      method: "POST",
      signal: controller.signal,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_limit: 100, p_include_drafts: false }),
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setRows(parseLibraryRows(data)))
      .catch(() => { if (!controller.signal.aborted) setRows([]); });
    return () => controller.abort();
  }, [library, accessToken]);

  const hits = useMemo(() => (library && rows ? rankLibrary(rows, query) : []), [library, rows, query]);
  const googleHref = google ? googleSearchHref(query) : null;
  if (!hits.length && !googleHref) return null;

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 24, maxWidth: 900 }}>
      {hits.length > 0 && (
        <section aria-label="Học liệu thành viên">
          <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Học liệu thành viên (thư viện Study OS)</h2>
          <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
            {hits.map((hit) => (
              <li key={hit.resourceKey} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", border: "1px solid rgba(116,21,29,.14)", borderRadius: 14, background: "#fff" }}>
                <span>{hit.title}</span>
                <StudyOsLink href={studyHref} className="">Mở Study OS →</StudyOsLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      {googleHref && (
        <p style={{ margin: 0, fontSize: 14 }}>
          <a href={googleHref} target="_blank" rel="noopener noreferrer"><b>Tìm “{query.trim().slice(0, 40)}” trên Google ↗</b></a>
          <br /><small>Kết quả bên ngoài, không do HIU TMC xác thực.</small>
        </p>
      )}
    </div>
  );
}
