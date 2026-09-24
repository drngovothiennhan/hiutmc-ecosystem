# HIU YHCT ECOSYSTEM — STAGED DEVELOPMENT PLAN CP23–CP30

Date: 2026-09-24  
Stable baseline: CP22 `9230f6d3a485c73e638e33e69bc6890d992d3729`

## Non-negotiable guardrails
1. Do not redesign or replace the approved homepage, dockbar, responsive layout, visual identity, PWA shell, or current Hub entry points while backend work is being introduced.
2. Do not replace a working production path in one step. Every shared-data feature uses additive schema -> shadow API -> CI/smoke -> controlled cutover -> rollback.
3. Existing static Hub registry remains the fallback source until a server-backed source passes production smoke.
4. Existing member SSO, CP21 Admin/Mod authorization, Cloudflare Worker routing, Supabase member identity, and CP22 social preview remain release gates.
5. No fabricated user, learning, ranking, event, or analytics data. Empty/unconnected states remain explicit.
6. Every stage gets its own checkpoint and can be rolled back to the previous production SHA without destructive database rollback.
7. Database changes are additive first. Existing production tables are not dropped or renamed as part of these stages.

## Stage 0 — Baseline freeze and observability
Status: completed by CP22.
- Freeze the current visual baseline and public routes.
- Keep main = release-candidate = production before starting each promotion.
- Preserve production smoke for public routes, PWA, Admin/Mod denial, social preview.
- Record exact SHA and Cloudflare version after each release.

## Stage 1 — Admin/Mod shared backend in SHADOW mode
Priority: P0.
Goal: create shared storage without changing the visible Admin/Mod behavior yet.
- Add tables for Hub drafts/content, moderation queue, and audit log.
- Enable RLS using the canonical `club_members` role chain.
- Add server RPC/write functions so browser clients cannot forge privileged audit records.
- Add Worker staff API endpoints for read/write validation.
- Keep the current browser-local Admin/Mod storage active as the visible source during shadow verification.
Acceptance:
- Existing UI is pixel/behavior unchanged.
- Additive migration passes.
- Anonymous access is denied.
- Mod cannot perform Admin-only publishing/configuration writes.
- Admin shadow write/read round-trip is verified.
Rollback: no UI cutover is required; backend tables can remain unused.

## Stage 2 — Controlled Admin/Mod cutover
Priority: P0.
Goal: make server storage the canonical Admin/Mod source.
- Read server state first, with local draft fallback only on network failure.
- Save Hub drafts/mod queue/audit to server.
- Add explicit Draft -> Mod review -> Admin publish states.
- Keep static registry as public fallback until publish records are verified.
- Add version/revision field and optimistic concurrency to avoid overwrites.
Acceptance:
- Cross-device Admin draft visible after sign-in.
- Mod sees only permitted review functions.
- Admin publishes a revision and audit log records actor/time/version.
- Network failure does not break public homepage.
Rollback: switch feature flag back to browser-local mode.

## Stage 3 — Learning progress synchronization
Priority: P0.
Goal: make homepage progress, missions, streak, XP and badges use verified shared learning data.
- Reuse existing `learning-sync` backend as source of truth.
- Introduce a read-only homepage progress adapter first.
- Do not remove local mission cache until server data is stable.
- Clearly separate academic/verified points from local engagement points during migration.
Acceptance:
- Same member sees same progress on two devices.
- Study OS and homepage agree on current lesson/progress.
- No local-only XP is promoted to verified ranking.

## Stage 4 — Notifications and CLB events
Priority: P0/P1.
- Add verified announcements/events/notification tables.
- Admin creates, Mod reviews where configured, members read.
- Homepage placeholders are replaced only when verified rows exist.
- Add optional PWA notifications later; initial release is in-app only.
Acceptance:
- Empty database displays current safe empty state.
- Published event appears consistently across devices.

## Stage 5 — Canonical domains and unified SSO
Priority: P1.
- Establish `study.hiutmc.com`, `thietchan.hiutmc.com`, `atlas.hiutmc.com`, `trungyvan.hiutmc.com` one at a time.
- Verify DNS/hosting independently before changing registry links.
- Reuse common member identity/session bridge; never weaken individual Hub security.
Acceptance:
- Each canonical domain resolves, passes TLS and health checks, then registry is changed.
- Old upstream links remain rollback targets.

## Stage 6 — Global ecosystem search
Priority: P1.
- Create normalized search index/API over approved Study OS, Atlas and Trung Y Văn content.
- AI Thiệt Chẩn contributes only content that is appropriate for search.
- Search results retain source provenance and deep-link to the originating Hub.
Acceptance:
- Search never invents unavailable content.
- Missing indexes degrade to per-Hub links, not errors.

## Stage 7 — Verified member profile and leaderboard
Priority: P1/P2.
- Profile aggregates verified learning activity, badges and eligible competition metrics.
- Leaderboard reads server-verified scores only.
- Admin can define competition windows/rules; no manual hidden score edits.
Acceptance:
- Ranking inputs are traceable to server records.
- Local browser XP never affects official ranking.

## Stage 8 — Operations dashboard, analytics and offline expansion
Priority: P2.
- Privacy-minimized aggregate health/usage metrics.
- Error and login-failure monitoring.
- Optional offline packs for selected learning content, flashcards and Atlas references.
- Background re-sync after connectivity returns.
Acceptance:
- No unnecessary personal tracking.
- Offline failure never blocks online usage.

## Promotion sequence for every stage
1. Feature branch from the latest stable main.
2. Additive implementation only.
3. Unit/contract validation.
4. Pull request CI.
5. Merge to main only after CI passes.
6. Promote to release-candidate and run CI again.
7. Promote to production.
8. Run live smoke against canonical URLs.
9. Update checkpoint + Drive manifest only after live smoke passes.

## Current execution
CP23 starts Stage 1 only. No Stage 2 UI cutover is allowed until CP23 shadow storage/API has passed its own validation.
