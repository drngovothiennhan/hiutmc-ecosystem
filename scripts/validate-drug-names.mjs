import assert from "node:assert/strict";
import fs from "node:fs";
import { QUERY, rowsToEntries } from "./build-drug-names.mjs";
import { lookupDrugs, normalizeDrug, parseDrugFile } from "../data/drug-lookup.ts";
import { FEATURE_FLAG_REGISTRY } from "../lib/feature-flags.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const b = (qid, vi, en = "", atcs = "") => ({ item: { value: `http://www.wikidata.org/entity/${qid}` }, viL: { value: vi }, enL: { value: en }, atcs: { value: atcs } });

const entries = rowsToEntries([b("Q1", "Paracetamol", "paracetamol", "N02BE01|bad code|N02BE01"), b("Q2", "Amoxicillin", "amoxicillin", "J01CA04"), b("bad", "X"), b("Q3", "")]);
assert.equal(entries.length, 2, "malformed rows are dropped");
assert.deepEqual(entries.find((e) => e.qid === "Q1").atc, ["N02BE01"], "only well-formed, de-duplicated ATC codes");
assert.ok(/LIMIT \d+/.test(QUERY) && !/P2175|P5642|P3489/.test(QUERY), "query is bounded and collects no clinical-claim properties");

assert.equal(normalizeDrug("Đau đầu"), "dau dau");
assert.equal(lookupDrugs(entries, "paracet")[0].qid, "Q1");
assert.equal(lookupDrugs(entries, "AMOXI")[0].qid, "Q2");
assert.deepEqual(lookupDrugs(entries, "a"), [], "needs 2+ characters");
assert.deepEqual(lookupDrugs(entries, "thời tiết"), []);
assert.deepEqual(parseDrugFile(null), []);
assert.deepEqual(parseDrugFile({ entries: [{ qid: "Q1", vi: "A", url: "https://evil.example/x" }] }), [], "only Wikidata links accepted");

const data = JSON.parse(read("public/data/drug-names.generated.json"));
if (data.license !== "CC0 1.0" || data.source !== "Wikidata") errors.push("drug dataset must declare Wikidata / CC0 1.0");
if (parseDrugFile(data).length !== data.entries.length) errors.push("drug dataset has malformed entries");

if (FEATURE_FLAG_REGISTRY["search-drug-names"]?.default.stage !== "off") errors.push("search-drug-names must be registered and default off");
const extras = read("components/SearchExtras.tsx");
if (!extras.includes('"search-drug-names"')) errors.push("SearchExtras must use the search-drug-names flag");
if (!/Chỉ là tên và mã phân loại, không phải hướng dẫn dùng thuốc/.test(extras)) errors.push("drug results must carry the names-only disclaimer");
if (/learning-sync|supabase/i.test(read("data/drug-lookup.ts"))) errors.push("drug-lookup must stay pure");

if (errors.length) { console.error("Drug names validation failed:"); for (const e of errors) console.error(`- ${e}`); process.exit(1); }
console.log("Drug names (Wikidata CC0, names and ATC only) generator, lookup and flag wiring are truthful and bounded.");
