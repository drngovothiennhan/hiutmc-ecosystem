// Builds public/data/drug-names.generated.json from Wikidata (CC0). Runs on GitHub Actions (the sandbox has no access).
// Collects NAMES ONLY: Vietnamese label, English label, ATC code(s), Wikidata link. No indications, doses or clinical claims.
// Usage: node scripts/build-drug-names.mjs [--fixture path.json] [--out path.json]
import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const OUT = opt("--out") ?? "public/data/drug-names.generated.json";
const MAX_ENTRIES = 3000;

export const QUERY = `SELECT ?item (SAMPLE(?vi) AS ?viL) (SAMPLE(?en) AS ?enL) (GROUP_CONCAT(DISTINCT ?atc; separator="|") AS ?atcs)
WHERE {
  ?item wdt:P31 wd:Q12140 .
  ?item rdfs:label ?vi FILTER(LANG(?vi) = "vi")
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
  OPTIONAL { ?item wdt:P267 ?atc }
}
GROUP BY ?item
LIMIT ${MAX_ENTRIES}`;

export function rowsToEntries(bindings) {
  const entries = [];
  for (const row of bindings) {
    const qid = String(row.item?.value ?? "").split("/").pop();
    const vi = String(row.viL?.value ?? "").trim();
    if (!/^Q\d+$/.test(qid) || !vi || vi.length > 120) continue;
    const atc = [...new Set(String(row.atcs?.value ?? "").split("|").map((code) => code.trim()).filter((code) => /^[A-Z]\d{2}[A-Z]{0,2}\d{0,2}$/.test(code)))].slice(0, 3);
    entries.push({ qid, vi, en: String(row.enL?.value ?? "").trim().slice(0, 120), atc, url: `https://www.wikidata.org/wiki/${qid}` });
  }
  return entries.sort((a, b) => a.vi.localeCompare(b.vi, "vi"));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixture = opt("--fixture");
  let bindings;
  if (fixture) bindings = JSON.parse(fs.readFileSync(fixture, "utf8")).results.bindings;
  else {
    const response = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/sparql-results+json", "User-Agent": "HIU-TMC-drug-names/1.0 (https://hiutmc.com; non-commercial learning platform)" },
      body: new URLSearchParams({ query: QUERY }),
    });
    if (!response.ok) throw new Error(`Wikidata ${response.status}`);
    bindings = (await response.json()).results.bindings;
  }
  const entries = rowsToEntries(bindings);
  if (!entries.length) { console.error("No entries returned; refusing to overwrite the dataset."); process.exit(1); }
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikidata", license: "CC0 1.0", entries }) + "\n");
  console.log(`Wrote ${entries.length} drug names (${entries.filter((entry) => entry.atc.length).length} with an ATC code).`);
}
