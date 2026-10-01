"use client";

import { useEffect, useMemo, useState } from "react";
import { googleSearchHref, parseLibraryRows, rankLibrary, type LibraryHit } from "@/data/shared-search";
import { ecosystemApps } from "@/data/apps";
import herbData from "@/data/herb-names.generated.json";
import { lookupDrugs, parseDrugFile, type DrugEntry } from "@/data/drug-lookup";
import { herbTitle, lookupHerbs, type HerbEntry } from "@/data/herb-lookup";
import { StudyOsLink, SUPABASE_KEY, SUPABASE_URL, useMemberAuth } from "./MemberAuthBridge";
import { useFeatureFlag } from "./useFeatureFlag";

/**
 * Optional extras under the Search page results. Both are behind feature flags that ship OFF:
 *   search-shared-library -> published member resources from the Study OS library (same Supabase data, member session)
 *   search-herb-names     -> herb names (Vietnamese/Latin/Chinese) from Wikidata, CC0, names only
 *   search-google-link    -> external Google link, labelled as not verified by HIU
 * With both flags OFF this renders nothing, so the approved Search page is unchanged.
 */
export default function SearchExtras({ query }: { query: string }) {
  const { accessToken } = useMemberAuth();
  const library = useFeatureFlag("search-shared-library", { accessToken });
  const herbNames = useFeatureFlag("search-herb-names", { accessToken });
  const drugNames = useFeatureFlag("search-drug-names", { accessToken });
  const google = useFeatureFlag("search-google-link", { accessToken });
  const [drugFile, setDrugFile] = useState<DrugEntry[] | null>(null);
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

  useEffect(() => {
    if (!drugNames || drugFile || query.trim().length < 2) return;
    const controller = new AbortController();
    fetch("/data/drug-names.generated.json", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setDrugFile(parseDrugFile(data)))
      .catch(() => { if (!controller.signal.aborted) setDrugFile([]); });
    return () => controller.abort();
  }, [drugNames, drugFile, query]);

  const drugs = useMemo(() => (drugNames && drugFile ? lookupDrugs(drugFile, query) : []), [drugNames, drugFile, query]);
  const hits = useMemo(() => (library && rows ? rankLibrary(rows, query) : []), [library, rows, query]);
  const herbs = useMemo(() => (herbNames ? lookupHerbs(herbData.entries as HerbEntry[], query) : []), [herbNames, query]);
  const googleHref = google ? googleSearchHref(query) : null;
  if (!hits.length && !herbs.length && !drugs.length && !googleHref) return null;

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
      {herbs.length > 0 && (
        <section aria-label="Tên dược liệu">
          <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Tên dược liệu</h2>
          <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
            {herbs.map((herb) => (
              <li key={herb.qid} style={{ padding: "12px 14px", border: "1px solid rgba(116,21,29,.14)", borderRadius: 14, background: "#fff" }}>
                <b>{herbTitle(herb)}</b> · <i>{herb.latin}</i>
                {herb.zh[0] ? <> · {herb.zh[0]}</> : null}
                {herb.viAliases.length > 0 ? <><br /><small>Tên khác: {herb.viAliases.slice(0, 3).join(", ")}</small></> : null}
                <br /><small>Nguồn tên gọi: <a href={herb.url} target="_blank" rel="noopener noreferrer">Wikidata</a> (CC0). Chỉ là tên, không phải thông tin y khoa; tra cứu công dụng ở Trung Y Văn.</small>
              </li>
            ))}
          </ul>
        </section>
      )}
      {drugs.length > 0 && (
        <section aria-label="Tên thuốc">
          <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Tên thuốc</h2>
          <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
            {drugs.map((drug) => (
              <li key={drug.qid} style={{ padding: "12px 14px", border: "1px solid rgba(116,21,29,.14)", borderRadius: 14, background: "#fff" }}>
                <b>{drug.vi}</b>{drug.en && drug.en.toLowerCase() !== drug.vi.toLowerCase() ? <> · <i>{drug.en}</i></> : null}
                {drug.atc.length > 0 ? <> · ATC {drug.atc.join(", ")}</> : null}
                <br /><small>Nguồn tên gọi: <a href={drug.url} target="_blank" rel="noopener noreferrer">Wikidata</a> (CC0). Chỉ là tên và mã phân loại, không phải hướng dẫn dùng thuốc.</small>
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
