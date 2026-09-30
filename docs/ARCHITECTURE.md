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
| `ci.yml` | PRs to main/production, pushes to main | `npm run check` |
| `deploy-cloudflare.yml` | push to `production` (app paths) | check, deploy Worker, production smoke |
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
