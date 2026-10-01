# Architecture — HIU TMC

> Ghi chú đổi tên (30/09/2026): "HIU YHCT Ecosystem" nay thống nhất là **HIU TMC**. Chỉ đổi tên nhận diện hiển thị; URL, tên package và mã release cũ giữ nguyên để tránh xung đột.

State as of 2026-09-29, verified against the `production` branch (release
`HIU-YHCT-ECOSYSTEM-20260927-04`, checkpoint CP37).

## What it is

hiutmc.com is the portal of the HIU Traditional Medicine (YHCT) club. It shows
an illustrated ecosystem map, daily learning missions, a spirit-pet companion,
and gateways into five separate learning apps, plus Admin/Mod consoles.

## Runtime

```
Browser ──► Cloudflare Worker "hiutmc-ecosystem" (worker.mjs, custom domain hiutmc.com)
              ├─ static site: Next.js 16 static export in ./out  (binding ASSETS)
              ├─ /api/staff/*, /admin, /mod ── verifies Supabase session + club_members.role
              │    (/api/staff/members[/role] and /api/staff/site-theme are Admin-only)
              ├─ /api/site-theme ── public read of the saved site theme id (falls back to "default")
              ├─ /api/flags ── per-viewer feature-flag booleans (all OFF unless the FEATURE_FLAGS secret raises a stage)
              ├─ /api/hub-registry, /api/admin/traffic
              ├─ Durable Object VisitCounter (binding VISITS) ── public page visit stats
              └─ /apps/<name>/* ── same-origin reverse proxy to each app (table below)

Supabase project gzmpnsrwqjpsbklyflqr ── auth, club_members, shadow Admin/Mod tables,
                                          learning-sync, spirit-pet profiles,
                                          member_mission_completions (daily missions)
```

### Proxied apps (`APP_PROXY_CONFIG` in `worker.mjs`)

| Path on hiutmc.com | App | Upstream |
|---|---|---|
| `/apps/study` | Study OS | Vercel `yhct-hiu-final4-stage-hiu-yhct` |
| `/apps/thietchan` | A.I Thiệt Chẩn | Vercel `ai-thiet-chan-hiu-yhct` |
| `/apps/trungyvan` | Trung Y Văn | GitHub Pages `/trung-y-van-hiu` |
| `/apps/atlas` | 3D Atlas | GitHub Pages `/human-atlas` |
| `/apps/game-hub` | HIU Game Hub | Cloudflare Pages `hiutmc-game-hub` |

The Worker injects a small script so proxied apps keep their own path prefix
(fetch, XHR, history, links and service-worker scope are rewritten).

### Daily missions and badges

Signed-in members keep completed daily missions in `member_mission_completions`
(RLS: a member reads only their own rows; writes only through the
`mission_completions_sync` and `mission_completion_set` RPCs, which take identity
from the session). Badges, streaks, the weekly challenge and XP are derived from
those rows in `data/learning-progress.ts`, so nothing else is stored.
`MemberAuthBridge` mirrors the list into localStorage (the cache that `DailyMissions`
and `SpiritCompanion` read), merges guest or unsent rows on first sign-in, never
uploads rows mirrored from a different member, and clears the mirror on sign-out.
Guests keep device-only progress.

### Admin Center (regrouped 2026-09-30)

Tabs: **Tổng quan** (includes traffic), **Nội dung & Liên kết**, **Duyệt & Thành viên**,
**Nhật ký & Cấu hình**, **Giao diện**. Moderators see only overview, review and system.
Admin-only additions:

- *Member roles*: `ecosystem_admin_member_list_v1` and `ecosystem_admin_set_member_role_v1`.
  Only Member ↔ Mod can be changed; Admin, Leader and Super Mod rows are untouched, an Admin
  cannot change their own role, a promotion needs an approved, login-enabled member, and each
  change is written to `ecosystem_audit_log`.
- *Site theme*: `site_theme_settings` (one row) with `site_theme_get_public_v1` (anon read) and
  `site_theme_set_v1` (Admin write, audited). Themes live in `data/site-themes.ts`
  (four seasons, six festivals, plus "auto" by date). All stylesheet colours that a theme can change read
  `var(--st-*, <original colour>)`, so with no theme (or any failure) the approved design is
  unchanged. `components/SiteTheme.tsx` applies the theme and light decoration; `?theme_preview=<id>`
  previews a theme in one tab without saving. Themes are not injected into the connected apps.

### Feature flags (added 2026-10-01)

Upgrades ship dark and are widened without a redeploy. `lib/feature-flags.mjs` holds the registry (every flag
defaults OFF) and the pure evaluator shared by the Worker, the client hook and the validator. Stages widen only:
`off → admin → staff → testers → percent → all`. `GET /api/flags` derives the viewer from the verified Supabase
session (an ineligible `club_members` row is never staff), reads the optional **`FEATURE_FLAGS`** Worker secret
(JSON, per-flag stage/percent/testers) and returns only booleans, `private, no-store`. Invalid or missing
config means everything OFF. **`FEATURE_FLAGS_DISABLED`** (secret) is a kill switch. Verified staff can preview a
flag in their own session with `?flag_preview=<id>`. Client code uses `useFeatureFlag(id)`
(`components/useFeatureFlag.ts`), which starts `false`. The approved homepage does not use flags. Flags are a
rollout control, not an authorization mechanism. Operating guide: `docs/RELEASE_PLAYBOOK.md`.

### Smarter companion guidance (added 2026-10-01, all flags OFF)

The portal's assistant surface is the spirit companion (`SpiritCompanion`); the generative "ask a question" assistant
and the AI credits live in Study OS (separate repo). Three independent upgrades extend the companion, each behind its
own flag (`assistant-context`, `assistant-quick-ask`, `assistant-nudges`) so they roll out separately:

- *Context cards* — "what to do next" from data the member already has (verified Study OS snapshot: due/weak review
  topics; today's missions; streak). Nothing is shown when there is no real data.
- *Quick ask* — a typed question is routed to the right registered app (Atlas, Trung Y Văn, A.I Thiệt Chẩn, Study OS)
  plus a `/search/?q=` link. Offline keyword routing: no AI call, no credits, never a clinical answer. Game Hub is never
  suggested (role-gated).
- *Calm nudges* — one reminder chip, each kind at most once per day (due review > streak at risk after 18:00 > unfinished
  missions), quiet hours 22:30–06:00, dismissible, opening the panel counts as seen.

Logic is pure and offline in `data/assistant-guidance.ts` (validated by `validate:assistant-guidance`); UI is
`components/AssistantGuidance.tsx` mounted by `SpiritCompanion`, which renders nothing while every flag is OFF.
`MemberAuthBridge` now also exposes the member's `accessToken` in context so flag rollouts can target members.

### Search extras (added 2026-10-01, both flags OFF)

`/search/` filters a static curated index (`data/search-index.ts`). Two optional extras, each behind its own flag and
rendered by `components/SearchExtras.tsx` (nothing renders while both are OFF):

- `search-shared-library` — published, member-audience resources from the Study OS library, read with the member's session via
  the existing `learning_resource_list_v1` RPC on the shared Supabase project (never drafts). Titles only; "Mở Study OS" opens Study OS.
- `search-google-link` — a `https://www.google.com/search?q=` link, labelled as an external result not verified by HIU.

- `search-herb-names` — herb names (Vietnamese / Latin / Chinese) from `data/herb-names.generated.json`, built from Wikidata (CC0) by
  `scripts/build-herb-names.mjs` through the manual-only workflow `herb-names-refresh.yml`, which pushes to the review branch
  `bot/herb-names` (never main/production). Names only, no medical claims. Seed keys: `data/herb-seed.json`. Pharmacopoeia text is NOT used
  (it is copyrighted; permission is pending with the owner).

- `search-drug-names` — drug names (Vietnamese, international, ATC code) from `public/data/drug-names.generated.json`, built from Wikidata (CC0)
  by `scripts/build-drug-names.mjs` in the same manual workflow; fetched lazily by the browser only when the flag is on and a query is typed.
  Names and ATC codes only: no indications, doses or clinical claims, and every result says so.

Pure logic: `data/shared-search.ts`, `data/herb-lookup.ts`, `data/drug-lookup.ts` (validated by `validate:search-shared`, `validate:herb-names`, `validate:drug-names`).

## Source layout

| Path | Contents |
|---|---|
| `app/` | Next.js routes: home, admin, mod, ai, community, discover, ecosystem/[slug], learn, privacy, search |
| `components/` | UI: EcosystemMap, SpiritCompanion, DailyMissions, MemberAuthBridge, StaffConsole, PwaInstall … |
| `data/` | App registry (`apps.ts`), learning, community, personalization, spirit-pet visuals |
| `asset-sources/` | Spirit-pet artwork sources; `npm run materialize:spirit-assets` renders them to `public/spirit-pets/` |
| `scripts/` | Validators and tests that make up `npm run check`, plus production smoke |
| `supabase/migrations/` | Additive SQL migrations |
| `deploy/agent-workspace/` | Workers AI proxy (`agent-ai.hiutmc.com`) and deploy checkpoint |
| `CHECKPOINT-CP*.md` | Change history from the ChatGPT period (CP14–CP36) |

## CI/CD

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | PRs to main/production, pushes to main | `npm run check` equivalent (now includes mission-sync, site-theme and feature-flag validators) |
| `deploy-cloudflare.yml` | push to `production` (app paths) | check, deploy Worker, production smoke |
| `preview-version.yml` | manual only (draft) | uploads a non-live Worker version for a preview URL |
| `production-health.yml` | manual only (draft; schedule commented out) | production smoke test, for monitoring |
| `agent-workspace-deploy.yml` | every 15 min + pushes to main | polls the private `ai-agent-workspace` build; deploys only when its SHA changed, then records it in `deploy/agent-workspace/LAST_DEPLOYED` |
| `cp29-preview.yml` | push to `cp29-approved-home-icons`, manual | legacy CP29 preview build |

## Other Cloudflare Workers seen on the account (2026-09-29)

`ai-agent-workspace`, `ai-agent-workspace-ai` (deployed by the agent workflow),
`hiu-class-online-preview`, preview copies `*-preview-feat-artifact-ui`,
`hiutmc-ecosystem-pet-preview`. Two separate Cloudflare accounts each hold an
`ai-thiet-chan-cf-preview` Worker. None of the previews are required by
production; clean-up needs the owner's approval.

## Known open work

- PR #56 Hub library ↔ Study OS PDFs — not live; needs rebuilding on current `main`.
- PR #47 Game Hub SSO G2 — partly superseded by the live G3 launcher; decide keep/close.
- PR #42 CP31 motion effects — partly live; needs rebuilding on current `main`.
- Y Quán personalization is deferred until Game Hub exposes per-topic learner data.

## Google Play (TWA)

The PWA is packaged for Google Play as a Trusted Web Activity (package `com.hiutmc.app`,
built with PWABuilder). Steps and store copy: `docs/play-store/PLAY-STORE-KIT.md`.
Digital Asset Links must be served at `/.well-known/assetlinks.json` (template in
`docs/play-store/assetlinks.template.json`; add `public/.well-known/assetlinks.json`
with the real SHA-256 fingerprints once the app is created in Play Console).
Privacy policy: `/privacy/`.
