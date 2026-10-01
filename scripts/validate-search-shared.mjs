import assert from "node:assert/strict";
import fs from "node:fs";
import { googleSearchHref, normalizeSearch, parseLibraryRows, rankLibrary } from "../data/shared-search.ts";
import { FEATURE_FLAG_IDS, FEATURE_FLAG_REGISTRY } from "../lib/feature-flags.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const row = (n, title, extra = {}) => ({ resourceKey: `hiu_res_${String(n).padStart(20, "0")}`, title, resourceType: "document", status: "published", audience: "members", updatedAt: `2026-09-${10 + n}T00:00:00Z`, ...extra });

// parsing: only published, member-audience, well-formed rows
assert.deepEqual(parseLibraryRows(null), []);
assert.deepEqual(parseLibraryRows("x"), []);
const parsed = parseLibraryRows([
  row(1, "Nhân sâm và bổ khí"),
  row(2, "Bản nháp", { status: "draft" }),
  row(3, "Chỉ quản trị", { audience: "staff" }),
  row(4, "Khóa sai", { resourceKey: "bad" }),
  row(5, "   "),
  null,
]);
assert.equal(parsed.length, 1);
assert.equal(parsed[0].title, "Nhân sâm và bổ khí");

// ranking: diacritic-insensitive, empty query shows nothing, no invented hits
const rows = parseLibraryRows([row(1, "Nhân sâm và bổ khí"), row(2, "Kinh lạc đại cương"), row(3, "Phương tễ: Tứ quân tử thang")]);
assert.equal(normalizeSearch("Nhân Sâm!"), "nhan sam");
assert.equal(rankLibrary(rows, "nhan sam")[0].title, "Nhân sâm và bổ khí");
assert.equal(rankLibrary(rows, "Nhân sâm")[0].title, "Nhân sâm và bổ khí");
assert.deepEqual(rankLibrary(rows, ""), []);
assert.deepEqual(rankLibrary(rows, "thời tiết"), [], "no match => no result");
assert.deepEqual(rankLibrary([], "nhan sam"), []);
assert.ok(rankLibrary(rows, "kinh lac").length === 1);

// google link: encoded, bounded, null for empty
assert.equal(googleSearchHref("   "), null);
assert.equal(googleSearchHref("nhân sâm"), "https://www.google.com/search?q=" + encodeURIComponent("nhân sâm"));
assert.ok(!googleSearchHref("<script>").includes("<"));
assert.ok(decodeURIComponent(googleSearchHref("a".repeat(500)).split("q=")[1]).length <= 120);

// flags: registered, default OFF
for (const flag of ["search-shared-library", "search-google-link"]) {
  if (!FEATURE_FLAG_IDS.includes(flag)) errors.push(`flag ${flag} is not registered`);
  else if (FEATURE_FLAG_REGISTRY[flag].default.stage !== "off") errors.push(`flag ${flag} must default to off`);
}

// source guards
const logic = read("data/shared-search.ts");
for (const banned of [/\bfetch\s*\(/, /localStorage/, /Math\.random/]) if (banned.test(logic)) errors.push(`shared-search.ts must stay pure: ${banned}`);
const extras = read("components/SearchExtras.tsx");
for (const flag of ["search-shared-library", "search-google-link"]) if (!extras.includes(`"${flag}"`)) errors.push(`SearchExtras must use flag ${flag}`);
if (!/learning_resource_list_v1/.test(extras)) errors.push("SearchExtras must read the shared Study OS library RPC");
if (/p_include_drafts:\s*true/.test(extras)) errors.push("SearchExtras must never request drafts");
if (!/rel="noopener noreferrer"/.test(extras)) errors.push("external Google link needs rel=noopener noreferrer");
if (!/if \(!hits\.length && (!herbs\.length && )?(!drugs\.length && )?!googleHref\) return null/.test(extras)) errors.push("with all flags OFF SearchExtras must render nothing");
if (!read("app/search/SearchClient.tsx").includes("<SearchExtras")) errors.push("SearchClient must mount SearchExtras");

if (errors.length) {
  console.error("Search shared-sources validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Search extras (shared Study OS library + Google link) are truthful, bounded and flag-gated.");
