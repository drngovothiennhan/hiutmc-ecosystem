// Pure helpers for the Search page's two optional extras (each behind its own feature flag):
//   search-shared-library -> published member learning resources from the Study OS library (same Supabase data)
//   search-google-link    -> an honest external link to Google
// No network here; the component fetches. Nothing is invented: an empty library gives an empty list.

export type LibraryHit = { resourceKey: string; title: string; resourceType: string; updatedAt: string };

const MAX_QUERY = 120;

export function normalizeSearch(text: string): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Accepts only well-formed, published, member-audience rows from learning_resource_list_v1. */
export function parseLibraryRows(data: unknown): LibraryHit[] {
  if (!Array.isArray(data)) return [];
  const rows: LibraryHit[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    if (typeof row.resourceKey !== "string" || !/^hiu_res_[0-9a-f]{20}$/.test(row.resourceKey)) continue;
    if (typeof row.title !== "string" || !row.title.trim()) continue;
    if (row.status !== "published" || row.audience !== "members") continue;
    rows.push({
      resourceKey: row.resourceKey,
      title: row.title.trim().slice(0, 300),
      resourceType: typeof row.resourceType === "string" ? row.resourceType : "document",
      updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : "",
    });
  }
  return rows;
}

/** Title match, diacritic-insensitive. No query => nothing (the library is not dumped into search). */
export function rankLibrary(rows: readonly LibraryHit[], query: string, limit = 6): LibraryHit[] {
  const needle = normalizeSearch(String(query ?? "").slice(0, MAX_QUERY));
  if (!needle) return [];
  const tokens = [...new Set(needle.split(" ").filter((token) => token.length > 1))].slice(0, 12);
  return rows
    .map((row) => {
      const title = normalizeSearch(row.title);
      let score = title.includes(needle) ? 20 : 0;
      for (const token of tokens) if (title.includes(token)) score += token.length >= 5 ? 3 : 1;
      return { row, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.row.updatedAt || "0") - Date.parse(a.row.updatedAt || "0"))
    .slice(0, Math.max(1, Math.min(limit, 8)))
    .map((entry) => entry.row);
}

export function googleSearchHref(query: string): string | null {
  const text = String(query ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY);
  return text ? `https://www.google.com/search?q=${encodeURIComponent(text)}` : null;
}
