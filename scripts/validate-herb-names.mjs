import assert from "node:assert/strict";
import fs from "node:fs";
import { buildQuery, rowsToEntries } from "./build-herb-names.mjs";
import { herbTitle, lookupHerbs, normalizeHerb } from "../data/herb-lookup.ts";
import { FEATURE_FLAG_REGISTRY } from "../lib/feature-flags.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const b = (qid, name, extra = {}) => ({ item: { value: `http://www.wikidata.org/entity/${qid}` }, name: { value: name }, vis: { value: extra.vi ?? "" }, viAs: { value: extra.viA ?? "" }, zhs: { value: extra.zh ?? "" }, ens: { value: extra.en ?? "" } });

// generator: parsing is strict and bounded
const entries = rowsToEntries([
  b("Q1", "Panax ginseng", { vi: "Nhân sâm", viA: "Sâm Triều Tiên|Nhân sâm", zh: "人参", en: "Asian ginseng" }),
  b("Q2", "Glycyrrhiza uralensis", { en: "Chinese licorice" }),
  b("bad", "Not a qid"),
  { item: { value: "http://www.wikidata.org/entity/Q3" } },
]);
assert.equal(entries.length, 2, "malformed rows are dropped");
const ginseng = entries.find((entry) => entry.qid === "Q1");
assert.deepEqual(ginseng.viAliases, ["Sâm Triều Tiên", "Nhân sâm"]);
assert.equal(ginseng.url, "https://www.wikidata.org/wiki/Q1");
assert.ok(buildQuery(['a"b']).includes('"ab"'), "quotes are stripped from VALUES");

// lookup: diacritic-insensitive, truthful
assert.equal(normalizeHerb("Nhân Sâm"), "nhan sam");
assert.equal(lookupHerbs(entries, "nhan sam")[0].qid, "Q1");
assert.equal(lookupHerbs(entries, "人参")[0].qid, "Q1");
assert.equal(lookupHerbs(entries, "panax")[0].qid, "Q1");
assert.deepEqual(lookupHerbs(entries, ""), []);
assert.deepEqual(lookupHerbs(entries, "thời tiết"), []);
assert.equal(herbTitle(entries.find((entry) => entry.qid === "Q2")), "Glycyrrhiza uralensis", "no Vietnamese name => Latin, never an invented name");

// dataset file: honest shape
const data = JSON.parse(read("data/herb-names.generated.json"));
if (data.license !== "CC0 1.0" || data.source !== "Wikidata") errors.push("dataset must declare source Wikidata and license CC0 1.0");
for (const entry of data.entries) if (!/^Q\d+$/.test(entry.qid) || !entry.latin || !entry.url?.startsWith("https://www.wikidata.org/")) errors.push(`bad dataset entry ${entry.qid}`);
const seed = JSON.parse(read("data/herb-seed.json")).taxa;
if (new Set(seed).size !== seed.length) errors.push("seed list has duplicates");

// flag + wiring + workflow guards
if (FEATURE_FLAG_REGISTRY["search-herb-names"]?.default.stage !== "off") errors.push("search-herb-names must be registered and default off");
const extras = read("components/SearchExtras.tsx");
if (!extras.includes('"search-herb-names"')) errors.push("SearchExtras must use the search-herb-names flag");
if (!/if \(!hits\.length && !herbs\.length && !googleHref\) return null/.test(extras)) errors.push("with every flag OFF SearchExtras must render nothing");
const workflow = read(".github/workflows/herb-names-refresh.yml");
if (/schedule:|push:|pull_request:/.test(workflow.replace(/#.*$/gm, ""))) errors.push("herb-names workflow must be manual only");
if (/origin (main|production)/.test(workflow)) errors.push("herb-names workflow must never push to main or production");

if (errors.length) { console.error("Herb names validation failed:"); for (const e of errors) console.error(`- ${e}`); process.exit(1); }
console.log("Herb names (Wikidata CC0, names only) generator, lookup and flag wiring are truthful and bounded.");
