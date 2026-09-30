import fs from "node:fs";
import assert from "node:assert/strict";
import {
  AUTO_THEME_ID, DEFAULT_THEME_ID, THEME_CSS_VARIABLES, effectiveTheme, getSiteTheme, isKnownThemeId,
  resolveThemeForDate, siteThemes, themeCssVariables,
} from "../data/site-themes.ts";
import { SITE_THEME_SCRIPT } from "../lib/site-theme-script.mjs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const migration = read("supabase/migrations/20260930150000_site_theme_and_member_roles_v1.sql");
const worker = read("worker.mjs");
const layout = read("app/layout.tsx");
const consoleSource = read("components/StaffConsole.tsx");
const members = read("components/StaffMembers.tsx");
const themePanel = read("components/StaffThemePanel.tsx");
const runtime = read("components/SiteTheme.tsx");

// --- database ---------------------------------------------------------------------------
for (const marker of [
  "create table if not exists public.site_theme_settings",
  "enable row level security",
  "revoke all on table public.site_theme_settings from anon, authenticated",
  "site_theme_get_public_v1", "site_theme_set_v1", "ecosystem_admin_member_list_v1", "ecosystem_admin_set_member_role_v1",
  "private.has_min_role('admin'::public.app_role)",
  "set search_path = public, private, pg_catalog",
  "grant execute on function public.site_theme_get_public_v1() to anon, authenticated",
  "grant execute on function public.site_theme_set_v1(text) to authenticated",
  "grant execute on function public.ecosystem_admin_member_list_v1() to authenticated",
  "grant execute on function public.ecosystem_admin_set_member_role_v1(uuid, text) to authenticated",
  "cannot change own role",
  "p_role not in ('member', 'mod')",
  "v_target.role::text not in ('member', 'mod')",
  "site_theme_changed", "member_role_changed",
]) if (!migration.includes(marker)) errors.push(`migration missing: ${marker}`);
for (const banned of [/drop\s+table/i, /truncate/i, /delete\s+from/i, /drop\s+column/i]) {
  if (banned.test(migration)) errors.push(`migration must be additive: ${banned}`);
}
for (const alter of migration.match(/alter\s+table\s+[a-z_.]+/gi) ?? []) {
  if (!/site_theme_settings$/i.test(alter)) errors.push(`migration may only alter its own new table: ${alter}`);
}
if ((migration.match(/update\s+public\.club_members/gi) ?? []).length !== 1) errors.push("only the Member<->Mod RPC may update club_members");
if (/grant execute on function public\.(site_theme_set_v1|ecosystem_admin_[a-z_]+)\([^)]*\) to[^;]*anon/i.test(migration)) errors.push("admin RPCs must not be executable by anon");

// --- worker: every admin route is gated by an Admin check and same-origin for writes ------------
const routeBlock = (path) => {
  const start = worker.indexOf(`pathname === "${path}"`);
  if (start < 0) { errors.push(`worker missing route ${path}`); return ""; }
  const next = worker.indexOf('if (pathname === "', start + 10);
  return worker.slice(start, next < 0 ? undefined : next);
};
for (const [path, mutation] of [["/api/staff/site-theme", true], ["/api/staff/members", false], ["/api/staff/members/role", true]]) {
  const block = routeBlock(path);
  if (!block.includes('shadowStaffAccess(request, "admin")')) errors.push(`${path} must require a server-verified Admin`);
  if (mutation && !block.includes("sameOriginMutation(request)")) errors.push(`${path} must reject cross-origin writes`);
}
const publicTheme = routeBlock("/api/site-theme");
if (publicTheme.includes("shadowStaffAccess") || !publicTheme.includes("site_theme_get_public_v1")) errors.push("/api/site-theme must be the public read of the saved theme id");
if (!publicTheme.includes('"default"')) errors.push("/api/site-theme must fall back to the default theme");
if (!/api\\\/\(staff\|admin\|hub-registry\|site-theme\)/.test(worker)) errors.push("reservedMainPath must reserve /api/site-theme");
if (worker.includes("SITE_THEME_SCRIPT")) errors.push("the site theme must not be injected into connected apps");
if (!routeBlock("/api/staff/members/role").includes('"mod"') ) errors.push("role route must be limited to member/mod");

// --- themes -----------------------------------------------------------------------------
const hex = /^#[0-9a-f]{6}$/i;
const lum = (color) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const ids = new Set();
for (const theme of siteThemes) {
  if (ids.has(theme.id)) errors.push(`duplicate theme id ${theme.id}`);
  ids.add(theme.id);
  if (!/^[a-z0-9-]{1,32}$/.test(theme.id)) errors.push(`bad theme id ${theme.id}`);
  if (theme.decor && (theme.decor.count > 20 || theme.decor.glyphs.length === 0)) errors.push(`${theme.id}: decoration must be light (<= 20 items)`);
  if (theme.id === DEFAULT_THEME_ID || theme.id === AUTO_THEME_ID) {
    if (theme.vars || theme.decor) errors.push(`${theme.id} must not carry colours or decoration`);
    continue;
  }
  const vars = theme.vars;
  if (!vars) { errors.push(`${theme.id}: missing colours`); continue; }
  for (const [key, value] of Object.entries(vars)) if (!hex.test(value)) errors.push(`${theme.id}.${key} is not a #rrggbb colour`);
  for (const key of ["wine", "wine2", "navy", "navy2", "navyDeep"]) {
    if (contrast(vars[key], "#ffffff") < 4.5) errors.push(`${theme.id}.${key} needs contrast >= 4.5 with white text (got ${contrast(vars[key], "#ffffff").toFixed(2)})`);
  }
  for (const surface of ["paper", "cream", "bg1", "bg2", "bg3", "body"]) {
    if (contrast("#24323d", vars[surface]) < 7) errors.push(`${theme.id}.${surface} is too dark for the body text colour`);
  }
  assert.equal(Object.keys(themeCssVariables(theme)).length, THEME_CSS_VARIABLES.length, `${theme.id}: every variable defined`);
}
for (const required of ["default", "auto", "xuan", "ha", "thu", "dong"]) if (!ids.has(required)) errors.push(`missing theme ${required}`);
if (siteThemes.filter((theme) => theme.group === "festival").length < 5) errors.push("expected festival themes");
assert.equal(getSiteTheme("does-not-exist").id, DEFAULT_THEME_ID, "unknown ids fall back to the default design");
assert.equal(isKnownThemeId("../x"), false);
const at = (iso) => resolveThemeForDate(new Date(`${iso}T05:00:00Z`));
assert.equal(at("2026-09-25"), "trung-thu", "Mid-Autumn 2026");
assert.equal(at("2026-09-30"), "thu", "autumn outside a festival");
assert.equal(at("2026-09-01"), "quoc-khanh");
assert.equal(at("2027-01-30"), "tet", "Tet season");
assert.equal(at("2026-11-20"), "nha-giao");
assert.equal(at("2026-12-24"), "giang-sinh");
assert.equal(at("2026-06-15"), "ha");
assert.equal(at("2027-01-15"), "dong");
for (let day = 0; day < 366; day += 1) {
  const resolved = resolveThemeForDate(new Date(Date.UTC(2026, 0, 1 + day, 5)));
  if (!isKnownThemeId(resolved) || resolved === AUTO_THEME_ID || resolved === DEFAULT_THEME_ID) errors.push(`auto resolved an invalid theme on day ${day}: ${resolved}`);
}
assert.equal(effectiveTheme(AUTO_THEME_ID, new Date("2026-09-30T05:00:00Z")).id, "thu");

// --- stylesheets: themeable colours must keep their original value as fallback -------------
const used = new Set();
for (const path of ["app/dashboard.module.css", "app/globals.css", "components/MemberAuthBridge.module.css"]) {
  const css = read(path);
  if (/var\(--st-[a-z0-9-]+\)/.test(css)) errors.push(`${path}: every var(--st-*) needs a fallback so the default design is unchanged`);
  for (const match of css.matchAll(/var\((--st-[a-z0-9-]+),/g)) used.add(match[1]);
}
for (const name of used) if (!THEME_CSS_VARIABLES.includes(name)) errors.push(`stylesheet uses unknown theme variable ${name}`);
for (const name of THEME_CSS_VARIABLES) if (!used.has(name)) errors.push(`theme variable ${name} is not used by any stylesheet`);

// --- runtime ----------------------------------------------------------------------------
try { new Function(SITE_THEME_SCRIPT); } catch (error) { errors.push(`site theme script is invalid: ${error.message}`); }
if (!layout.includes("SITE_THEME_SCRIPT") || !layout.includes("<SiteTheme />")) errors.push("root layout must load the site theme");
if (!runtime.includes("theme_preview") || !runtime.includes("prefers") && !fs.readFileSync("components/SiteTheme.module.css", "utf8").includes("prefers-reduced-motion")) errors.push("theme runtime must support preview and reduced motion");
if (!fs.readFileSync("components/SiteTheme.module.css", "utf8").includes("prefers-reduced-motion:reduce")) errors.push("decorations must honour prefers-reduced-motion");
if (!fs.readFileSync("components/SiteTheme.module.css", "utf8").includes("pointer-events:none")) errors.push("decorations must never capture clicks");

// --- Admin Center -------------------------------------------------------------------------
for (const marker of ["Tổng quan", "Nội dung & Liên kết", "Duyệt & Thành viên", "Nhật ký & Cấu hình", "Giao diện", "StaffMembers", "StaffThemePanel"]) {
  if (!consoleSource.includes(marker)) errors.push(`Admin Center missing: ${marker}`);
}
for (const oldTab of ['id: "traffic"', 'id: "content"', 'id: "links"', 'id: "moderation"', 'id: "roles"', 'id: "audit"', 'id: "settings"']) {
  if (consoleSource.includes(oldTab)) errors.push(`old separate tab still present: ${oldTab}`);
}
if (!/\["overview", "review", "system"\]\.includes/.test(consoleSource)) errors.push("Moderators must only see overview, review and system");
if (!/tab === "theme" && mode === "admin"/.test(consoleSource)) errors.push("the theme tab must be Admin-only");
if (!/tab === "review" && mode === "admin" && <div className=\{styles\.content\}><StaffMembers/.test(consoleSource)) errors.push("member management must be Admin-only");
if (/localStorage/.test(members) || /localStorage/.test(themePanel)) errors.push("Admin panels must not use localStorage");
if (!members.includes('"mod"') || !members.includes('"member"') || /role: "admin"|role: "leader"|role: "super_mod"/.test(members)) errors.push("member UI may only switch between member and mod");

if (errors.length) {
  console.error("Site theme / Admin Center validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Site theme (${siteThemes.length} themes), Admin-only theme and member-role endpoints, additive migration and regrouped Admin Center checks passed.`);
