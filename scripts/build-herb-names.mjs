// Builds data/herb-names.generated.json from Wikidata (CC0). Runs on GitHub Actions (the sandbox has no access).
// Only names are collected: Latin (P225), Vietnamese / Chinese / English labels and aliases, plus the Wikidata link.
// No medical claims are collected. Usage: node scripts/build-herb-names.mjs [--fixture path.json] [--out path.json]
import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const OUT = opt("--out") ?? "data/herb-names.generated.json";
const seed = JSON.parse(fs.readFileSync("data/herb-seed.json", "utf8")).taxa;

export function buildQuery(names) {
  const values = names.map((name) => `"${name.replace(/"/g, "")}"`).join(" ");
  return `SELECT ?item ?name
  (GROUP_CONCAT(DISTINCT ?vi; separator="|") AS ?vis) (GROUP_CONCAT(DISTINCT ?viA; separator="|") AS ?viAs)
  (GROUP_CONCAT(DISTINCT ?zh; separator="|") AS ?zhs) (GROUP_CONCAT(DISTINCT ?en; separator="|") AS ?ens)
WHERE {
  VALUES ?name { ${values} }
  ?item wdt:P225 ?name .
  OPTIONAL { ?item rdfs:label ?vi FILTER(LANG(?vi) = "vi") }
  OPTIONAL { ?item skos:altLabel ?viA FILTER(LANG(?viA) = "vi") }
  OPTIONAL { ?item rdfs:label ?zh FILTER(LANG(?zh) = "zh") }
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
}
GROUP BY ?item ?name`;
}

// Wikidata often falls back to the Latin name (or a Latin synonym) as the "Vietnamese" label. Those are not Vietnamese names.
export const isLatinBinomial = (text) => /^[A-Z][a-z-]+ (?:×\s?)?[a-z-]+(?: (?:subsp|var|f)\. [a-z-]+)?$/.test(text);

const split = (value) => [...new Set(String(value ?? "").split("|").map((part) => part.trim()).filter(Boolean))].slice(0, 6);
const splitVi = (value) => split(value).filter((part) => !isLatinBinomial(part));

export function rowsToEntries(bindings) {
  const entries = [];
  for (const row of bindings) {
    const qid = String(row.item?.value ?? "").split("/").pop();
    if (!/^Q\d+$/.test(qid) || !row.name?.value) continue;
    const vi = splitVi(row.vis?.value), aliases = splitVi(row.viAs?.value);
    entries.push({
      qid, latin: row.name.value, vi, viAliases: aliases,
      zh: split(row.zhs?.value), en: split(row.ens?.value),
      url: `https://www.wikidata.org/wiki/${qid}`,
    });
  }
  return entries.sort((a, b) => a.latin.localeCompare(b.latin));
}

async function fetchChunk(names) {
  const response = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/sparql-results+json",
      "User-Agent": "HIU-TMC-herb-names/1.0 (https://hiutmc.com; non-commercial learning platform)",
    },
    body: new URLSearchParams({ query: buildQuery(names) }),
  });
  if (!response.ok) throw new Error(`Wikidata ${response.status}`);
  return (await response.json()).results.bindings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixture = opt("--fixture");
  let bindings = [];
  if (fixture) bindings = JSON.parse(fs.readFileSync(fixture, "utf8")).results.bindings;
  else for (let i = 0; i < seed.length; i += 25) bindings.push(...await fetchChunk(seed.slice(i, i + 25)));
  const entries = rowsToEntries(bindings);
  if (!entries.length) { console.error("No entries returned; refusing to overwrite the dataset."); process.exit(1); }
  const missing = seed.filter((name) => !entries.some((entry) => entry.latin === name));
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikidata", license: "CC0 1.0", entries }, null, 1) + "\n");
  console.log(`Wrote ${entries.length} entries (${entries.filter((e) => e.vi.length || e.viAliases.length).length} with a Vietnamese name). Not found in Wikidata: ${missing.length ? missing.join(", ") : "none"}`);
}
