// Pure lookup over public/data/drug-names.generated.json (names from Wikidata, CC0). Names and ATC codes only.
export type DrugEntry = { qid: string; vi: string; en: string; atc: string[]; url: string };

const MAX_QUERY = 120;

export function normalizeDrug(text: string): string {
  return String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Parses the downloaded file defensively; anything malformed is dropped. */
export function parseDrugFile(data: unknown): DrugEntry[] {
  const list = (data as { entries?: unknown } | null)?.entries;
  if (!Array.isArray(list)) return [];
  return list.filter((row): row is DrugEntry => Boolean(row) && typeof row.qid === "string" && /^Q\d+$/.test(row.qid) && typeof row.vi === "string" && row.vi.length > 0 && typeof row.url === "string" && row.url.startsWith("https://www.wikidata.org/"))
    .map((row) => ({ qid: row.qid, vi: row.vi, en: typeof row.en === "string" ? row.en : "", atc: Array.isArray(row.atc) ? row.atc.filter((code) => typeof code === "string").slice(0, 3) : [], url: row.url }));
}

/** Needs at least 2 characters; exact name first, then prefix, then contains. */
export function lookupDrugs(entries: readonly DrugEntry[], query: string, limit = 5): DrugEntry[] {
  const needle = normalizeDrug(String(query ?? "").slice(0, MAX_QUERY));
  if (needle.length < 2) return [];
  return entries
    .map((entry) => {
      const names = [normalizeDrug(entry.vi), normalizeDrug(entry.en)];
      const score = names.some((name) => name === needle) ? 30 : names.some((name) => name.startsWith(needle)) ? 20 : names.some((name) => name.includes(needle)) ? 10 : 0;
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.vi.localeCompare(b.entry.vi, "vi"))
    .slice(0, Math.max(1, Math.min(limit, 8)))
    .map((item) => item.entry);
}
