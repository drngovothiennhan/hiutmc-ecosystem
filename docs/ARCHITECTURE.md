# Architecture — HIU YHCT Ecosystem

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
                                          learning-sync, spirit-pet profiles
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

## Source layout

| Path | Contents |
|---|---|
| `app/` | Next.js routes: home, admin, mod, ai, community, discover, ecosystem/[slug], learn, search |
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
