# CHECKPOINT CP25 — PROFILE MODE + LEARNING PROGRESS STABILITY

Date: 2026-09-24

## Stable base
- Ecosystem base: `2c0cf06bbef4d1e3e3529c47514c5043d6b9008d`
- Study OS learning-sync source: `e644c7d5c26df7f2248bf876aa877b96110969af`
- Supabase Edge Function: `learning-sync` v2, `verify_jwt=true`
- This checkpoint must be stable before Stage 2 Admin/Mod cutover begins.

## Fix 1 — Mobile/PC switch
- The off-center floating display-mode button is removed from the real Mobile layout.
- Mobile/PC switching is available inside the member/login profile dialog.
- The same control remains available in PC topbar mode.
- All controls share one local setting and a same-tab custom event, so switching from either location updates the whole page immediately.
- Mobile returns to the approved bottom dock and touch layout.
- PC retains the CP24 desktop override set.
- No approved colors, cards, fonts, backgrounds, images or content structure are redesigned.

## Fix 2 — Learning progress
Root cause found in live Supabase logs:
- `learning-sync` POST requests were returning HTTP 546 `WORKER_RESOURCE_LIMIT`.
- Requests remained active for about 150 seconds.
- The previous gzip implementation wrote to `CompressionStream` before consuming the readable side, allowing backpressure to stall the Edge Function.

Repair:
- gzip now pipes the source stream through `CompressionStream('gzip')` while the result is consumed.
- Authenticated `GET /functions/v1/learning-sync` returns the current member's safe aggregate `learning_sync_stats`.
- The Ecosystem homepage reads that authenticated server state after login/session restore and on focus/visibility refresh.
- The old hard-coded “Chưa đồng bộ” card is removed.
- When a successful sync exists, the homepage shows server values such as streak, today's questions, XP and latest exam score.
- When no successful snapshot exists yet, the UI says so explicitly and asks the member to open Study OS once so the repaired sync can upload current local learning state.
- No local XP is promoted to official leaderboard data.

## Stability boundary
- CP23 Admin/Mod shadow backend remains shadow-only.
- No Stage 2 Admin/Mod data-source cutover is included.
- Public Hub registry remains unchanged.
- CP21 staff authorization remains unchanged.
- CP22 Zalo/social metadata remains unchanged.
- CP24 approved PC/Mobile visual layout remains the baseline.

## Required gates
- Study OS Web CI must pass at `e644c7d5c26df7f2248bf876aa877b96110969af`.
- Study OS Vercel Production must pass for the same commit.
- Supabase `learning-sync` v2 must remain ACTIVE.
- Ecosystem profile/progress validator must pass.
- Ecosystem main + release-candidate CI must pass.
- Cloudflare production deployment and live smoke must pass.
- main = release-candidate = production before CP25 is declared stable.

## Rollback
- Ecosystem rollback: `2c0cf06bbef4d1e3e3529c47514c5043d6b9008d`.
- Study OS UI is unchanged by its learning-sync hotfix; if needed, the Edge Function can be redeployed from the prior source while the Ecosystem safely falls back to an explicit no-sync state.
