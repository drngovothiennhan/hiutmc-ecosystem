// Pure lookup over data/herb-names.generated.json (names from Wikidata, CC0). Names only: no medical claims.
export type HerbEntry = { qid: string; latin: string; vi: string[]; viAliases: string[]; zh: string[]; en: string[]; url: string };

const MAX_QUERY = 120;

export function normalizeHerb(text: string): string {
  return String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Display name preference: Vietnamese label, then Vietnamese alias, then Latin. */
export function herbTitle(entry: HerbEntry): string {
  return entry.vi[0] || entry.viAliases[0] || entry.latin;
}

/** Entries whose Vietnamese/Latin/English name (diacritic-insensitive) or Chinese name contains the query. Empty query => none. */
export function lookupHerbs(entries: readonly HerbEntry[], query: string, limit = 5): HerbEntry[] {
  const raw = String(query ?? "").slice(0, MAX_QUERY).trim();
  const needle = normalizeHerb(raw);
  if (!needle && !raw) return [];
  return entries
    .map((entry) => {
      const names = [...entry.vi, ...entry.viAliases, entry.latin, ...entry.en].map(normalizeHerb);
      let score = 0;
      if (needle && names.some((name) => name === needle)) score = 30;
      else if (needle && names.some((name) => name.includes(needle))) score = 10;
      if (entry.zh.some((name) => name.includes(raw))) score = Math.max(score, 30);
      return { entry, score };
    })
    .filter((item) => item.score > 0 && (item.entry.vi.length > 0 || item.entry.viAliases.length > 0 || item.score >= 10))
    .sort((a, b) => b.score - a.score || a.entry.latin.localeCompare(b.entry.latin))
    .slice(0, Math.max(1, Math.min(limit, 8)))
    .map((item) => item.entry);
}
