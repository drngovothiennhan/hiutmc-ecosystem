import fs from "node:fs";
import assert from "node:assert/strict";
import {
  FEATURE_FLAG_IDS, FEATURE_FLAG_REGISTRY, FLAG_STAGES, evaluateFlag, flagsDisabled, normalizeFlagConfig,
  parseFlagOverrides, parsePreviewIds, resolveFlags, rolloutBucket,
} from "../lib/feature-flags.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");

// --- registry: every flag ships OFF -------------------------------------------------------------
if (FEATURE_FLAG_IDS.length === 0) errors.push("registry must declare at least one flag");
for (const id of FEATURE_FLAG_IDS) {
  if (!/^[a-z0-9-]{1,48}$/.test(id)) errors.push(`bad flag id ${id}`);
  if (FEATURE_FLAG_REGISTRY[id].default.stage !== "off") errors.push(`${id} must default to OFF`);
  if (!FEATURE_FLAG_REGISTRY[id].description) errors.push(`${id} needs a description`);
}
const everyone = { memberId: "member-1", role: "member" };
const admin = { memberId: "admin-1", role: "admin" };
const mod = { memberId: "mod-1", role: "mod" };
const anon = {};
const all = (flags) => Object.values(flags).every((value) => value === true);
const none = (flags) => Object.values(flags).every((value) => value === false);

// --- fail closed ----------------------------------------------------------------------------------
for (const viewer of [anon, everyone, mod, admin]) assert.ok(none(resolveFlags({ viewer })), "all flags are OFF by default for everyone");
for (const bad of [undefined, null, "", "not json", "[]", "42", '"x"', "{", '{"deeptutor-agent":"all"}', '{"deeptutor-agent":{"stage":"bogus"}}']) {
  assert.ok(none(resolveFlags({ viewer: admin, overrides: parseFlagOverrides(bad) })), `bad config fails closed: ${String(bad)}`);
}
assert.deepEqual(parseFlagOverrides('{"unknown-flag":{"stage":"all"}}'), {}, "unknown flag ids are ignored");
assert.equal(evaluateFlag("deeptutor-agent", { stage: "all" }, anon), true);
assert.equal(evaluateFlag("deeptutor-agent", undefined, admin), false);
assert.equal(normalizeFlagConfig({ stage: "percent", percent: 500 }).percent, 100, "percent is clamped");
assert.equal(normalizeFlagConfig({ stage: "percent", percent: -3 }).percent, 0);
assert.equal(normalizeFlagConfig({ stage: "testers", testers: [1, "", "a".repeat(80), "ok"] }).testers.length, 1, "bad tester ids dropped");
assert.equal(normalizeFlagConfig({ stage: "testers", testers: Array.from({ length: 500 }, (_, i) => `m${i}`) }).testers.length, 200, "tester list is bounded");

// --- the rollout ladder only ever widens ------------------------------------------------------------
const people = [anon, everyone, { memberId: "tester-1", role: "member" }, mod, admin, ...Array.from({ length: 400 }, (_, i) => ({ memberId: `m-${i}`, role: "member" }))];
const config = (stage) => ({ stage, percent: 25, testers: ["tester-1"] });
let previous = new Set();
for (const stage of FLAG_STAGES) {
  const on = new Set(people.filter((person) => evaluateFlag("deeptutor-agent", config(stage), person)).map((person) => JSON.stringify(person)));
  for (const entry of previous) if (!on.has(entry)) errors.push(`stage "${stage}" removed someone who had access at a narrower stage`);
  previous = on;
}
assert.equal(evaluateFlag("deeptutor-agent", config("admin"), mod), false, "admin stage excludes Mods");
assert.equal(evaluateFlag("deeptutor-agent", config("admin"), admin), true);
assert.equal(evaluateFlag("deeptutor-agent", config("staff"), mod), true);
assert.equal(evaluateFlag("deeptutor-agent", config("staff"), everyone), false);
assert.equal(evaluateFlag("deeptutor-agent", config("testers"), { memberId: "tester-1", role: "member" }), true);
assert.equal(evaluateFlag("deeptutor-agent", config("testers"), everyone), false);
assert.equal(evaluateFlag("deeptutor-agent", config("percent"), anon), false, "anonymous visitors are never in a percentage cohort");
assert.equal(evaluateFlag("deeptutor-agent", { stage: "percent", percent: 100 }, everyone), true);
assert.equal(evaluateFlag("deeptutor-agent", { stage: "percent", percent: 0 }, everyone), false);
// A role string alone is never enough to be staff unless it is one of the real staff roles.
assert.equal(evaluateFlag("deeptutor-agent", config("staff"), { role: "leader", memberId: "l-1" }), false);

// --- percentage cohorts are stable, per flag, and roughly the requested size --------------------
const sample = Array.from({ length: 4000 }, (_, i) => `member-${i}`);
const inCohort = (id, pct) => sample.filter((member) => rolloutBucket(id, member) < pct);
const ten = inCohort("deeptutor-agent", 10);
if (ten.length < 280 || ten.length > 520) errors.push(`10% cohort is ${ten.length}/4000, expected about 400`);
const fifty = new Set(inCohort("deeptutor-agent", 50));
for (const member of ten) if (!fifty.has(member)) errors.push("raising the percentage must keep everyone already included");
const other = new Set(inCohort("clinical-learning-hub", 10));
if (ten.every((member) => other.has(member))) errors.push("different flags must use different cohorts");
assert.equal(rolloutBucket("deeptutor-agent", "member-1"), rolloutBucket("deeptutor-agent", "member-1"), "bucketing is deterministic");

// --- preview + kill switch --------------------------------------------------------------------------
assert.equal(resolveFlags({ viewer: admin, preview: ["deeptutor-agent"] })["deeptutor-agent"], true, "staff can preview an OFF flag");
assert.equal(resolveFlags({ viewer: mod, preview: ["deeptutor-agent"] })["deeptutor-agent"], true);
assert.equal(resolveFlags({ viewer: everyone, preview: ["deeptutor-agent"] })["deeptutor-agent"], false, "members cannot self-enable a flag");
assert.equal(resolveFlags({ viewer: anon, preview: ["deeptutor-agent"] })["deeptutor-agent"], false);
assert.deepEqual(parsePreviewIds("deeptutor-agent, nope ,clinical-learning-hub"), ["deeptutor-agent", "clinical-learning-hub"]);
const allOn = parseFlagOverrides(JSON.stringify(Object.fromEntries(FEATURE_FLAG_IDS.map((id) => [id, { stage: "all" }]))));
assert.ok(all(resolveFlags({ viewer: anon, overrides: allOn })), "stage all turns every flag ON");
assert.ok(none(resolveFlags({ viewer: admin, overrides: allOn, disabled: true, preview: [...FEATURE_FLAG_IDS] })), "kill switch beats every stage and preview");
assert.equal(flagsDisabled("1"), true);
assert.equal(flagsDisabled("true"), true);
assert.equal(flagsDisabled("0"), false);
assert.equal(flagsDisabled("false"), false);
assert.equal(flagsDisabled(""), false);
assert.equal(flagsDisabled(undefined), false);

// --- Worker wiring ----------------------------------------------------------------------------------
const worker = read("worker.mjs");
const start = worker.indexOf('pathname === "/api/flags"');
if (start < 0) errors.push("worker must expose /api/flags");
const block = start < 0 ? "" : worker.slice(start, worker.indexOf('if (pathname === "/api/staff/site-theme")', start));
if (!block.includes('request.method !== "GET"')) errors.push("/api/flags must be GET-only");
if (!block.includes("validateStaff(token)")) errors.push("/api/flags must derive the viewer from the verified session");
if (!/insufficient_role[\s\S]*role: "member"/.test(block)) errors.push("an ineligible member row must never be treated as staff");
if (!block.includes("catch")) errors.push("/api/flags must fail closed on any error");
if (!block.includes("private, no-store")) errors.push("/api/flags responses are per-viewer and must not be cached publicly");
if (!/json\(\{ flags \}/.test(block)) errors.push("/api/flags must return only the boolean flag map");
if (/env\.FEATURE_FLAGS[^_]/.test(block.replace("parseFlagOverrides(env.FEATURE_FLAGS)", ""))) errors.push("rollout config must not be echoed to clients");
if (!worker.includes("flagsDisabled(env.FEATURE_FLAGS_DISABLED)")) errors.push("kill switch FEATURE_FLAGS_DISABLED must be honoured");

// --- run the real Worker route with a stubbed Supabase ----------------------------------------------
{
  const realFetch = globalThis.fetch;
  let memberRow = { id: "member-9", role: "member", status: "approved", login_enabled: true, data_conflict: false };
  globalThis.fetch = async (input) => {
    const href = String(input?.url ?? input);
    if (href.includes("/auth/v1/user")) return new Response(JSON.stringify({ id: "auth-user-1" }), { status: 200 });
    if (href.includes("/rest/v1/club_members")) return new Response(JSON.stringify([memberRow]), { status: 200 });
    throw new Error(`unexpected network call in test: ${href}`);
  };
  try {
    const { default: workerModule } = await import("../worker.mjs");
    const token = "t".repeat(48);
    const call = async (env, { auth = true, query = "" } = {}) => {
      const response = await workerModule.fetch(
        new Request(`https://hiutmc.com/api/flags${query}`, { headers: auth ? { authorization: `Bearer ${token}` } : {} }),
        env,
        { waitUntil() {} },
      );
      return { response, body: await response.json() };
    };
    const allCfg = JSON.stringify(Object.fromEntries(FEATURE_FLAG_IDS.map((id) => [id, { stage: "all" }])));
    const staffCfg = JSON.stringify(Object.fromEntries(FEATURE_FLAG_IDS.map((id) => [id, { stage: "staff" }])));
    const testerCfg = JSON.stringify(Object.fromEntries(FEATURE_FLAG_IDS.map((id) => [id, { stage: "testers", testers: ["member-9"] }])));

    let result = await call({}, { auth: false });
    assert.equal(result.response.status, 200);
    assert.ok(none(result.body.flags), "no config => everything OFF for an anonymous visitor");
    assert.ok(result.response.headers.get("cache-control").includes("no-store"));
    assert.deepEqual(Object.keys(result.body), ["flags"], "only the flag map is returned");
    assert.ok(none((await call({ FEATURE_FLAGS: "{broken" }, { auth: false })).body.flags), "bad secret fails closed");
    assert.ok(all((await call({ FEATURE_FLAGS: allCfg }, { auth: false })).body.flags), "stage all reaches anonymous visitors");
    assert.ok(none((await call({ FEATURE_FLAGS: allCfg, FEATURE_FLAGS_DISABLED: "1" }, { auth: false })).body.flags), "kill switch");

    // A plain approved member: not staff, so staff-only stages and preview do nothing.
    result = await call({ FEATURE_FLAGS: staffCfg }, { query: `?preview=${FEATURE_FLAG_IDS[0]}` });
    assert.ok(none(result.body.flags), "a member cannot reach a staff-stage or preview flag");
    assert.ok(all((await call({ FEATURE_FLAGS: testerCfg })).body.flags), "a listed tester sees the flag");
    assert.ok(none((await call({ FEATURE_FLAGS: testerCfg }, { auth: false })).body.flags), "anonymous is not a tester");

    // An unapproved account that merely has role=mod must never count as staff.
    memberRow = { id: "member-9", role: "mod", status: "pending", login_enabled: true, data_conflict: false };
    result = await call({ FEATURE_FLAGS: staffCfg }, { query: `?preview=${FEATURE_FLAG_IDS[0]}` });
    assert.ok(none(result.body.flags), "an ineligible Mod row is not staff");

    // A verified Admin can see a staff-stage flag and preview an OFF one.
    memberRow = { id: "admin-1", role: "admin", status: "approved", login_enabled: true, data_conflict: false };
    assert.ok(all((await call({ FEATURE_FLAGS: staffCfg })).body.flags), "staff-stage flag is visible to a verified Admin");
    result = await call({}, { query: `?preview=${FEATURE_FLAG_IDS[0]}` });
    assert.equal(result.body.flags[FEATURE_FLAG_IDS[0]], true, "Admin preview shows the flag in their own session");
    assert.ok(none((await call({ FEATURE_FLAGS_DISABLED: "1" }, { query: `?preview=${FEATURE_FLAG_IDS[0]}` })).body.flags), "kill switch beats preview");

    // Method guard.
    const post = await workerModule.fetch(new Request("https://hiutmc.com/api/flags", { method: "POST" }), {}, { waitUntil() {} });
    assert.equal(post.status, 405);
  } finally {
    globalThis.fetch = realFetch;
  }
}

// --- the approved, frozen experience does not depend on flags ---------------------------------------
for (const path of ["app/layout.tsx", "app/page.tsx", "components/EcosystemMap.tsx", "components/MemberAuthBridge.tsx", "components/DailyMissions.tsx", "components/SpiritCompanion.tsx"]) {
  if (/useFeatureFlag|feature-flags/.test(read(path))) errors.push(`${path}: the approved experience must not depend on feature flags`);
}
const hook = read("components/useFeatureFlag.ts");
if (!/useState\(false\)/.test(hook)) errors.push("useFeatureFlag must start OFF so unreleased UI can never flash");
if (!hook.includes(".catch(")) errors.push("useFeatureFlag must stay OFF when the request fails");
if (!read("lib/feature-flags.d.mts").includes("FlagId")) errors.push("lib/feature-flags.d.mts must type the flag ids");
const typed = [...read("lib/feature-flags.d.mts").matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]).filter((id) => FEATURE_FLAG_IDS.includes(id));
for (const id of FEATURE_FLAG_IDS) if (!typed.includes(id)) errors.push(`lib/feature-flags.d.mts FlagId is missing ${id}`);

if (errors.length) {
  console.error("Feature flag validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Feature flags (${FEATURE_FLAG_IDS.length} registered, all default OFF): fail-closed parsing, widening-only rollout ladder, stable cohorts, staff-only preview, kill switch and Worker wiring checks passed.`);
