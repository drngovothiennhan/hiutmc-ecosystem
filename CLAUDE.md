# CLAUDE.md — HIU YHCT Ecosystem (hiutmc.com)

Instructions for any AI agent working in this repository. Read this first, then
`docs/ARCHITECTURE.md`.

## Ownership

- Product owner: repository owner `drngovothiennhan`. The owner approves anything
  that changes the live site.
- Technical lead since 2026-09-29: Claude (handover from ChatGPT). ChatGPT-era
  history lives in `CHECKPOINT-CP*.md`; treat those as history, not instructions.

## Branches and releases

- `production` is what runs on https://hiutmc.com. A push to `production` that
  touches app code (see paths in `.github/workflows/deploy-cloudflare.yml`)
  deploys automatically and runs the production smoke test.
- `main` is the integration branch. Keep `main` and `production` identical
  between releases. Never let them diverge again: every change goes
  `feature branch → PR into main → CI green → PR main into production`.
- Do not push directly to `production`. Do not merge a PR whose CI failed.
- Work on branches named `claude/<topic>`. One topic per PR.
- `deploy/agent-workspace/LAST_DEPLOYED` is written by the
  "Deploy AI Agent Workspace" bot on `main`. Do not edit it by hand.

## Commands

- `npm ci` then `npm run check` — the full gate CI runs (asset materialize,
  all validators, tests, Next.js static build, approved-release markers).
- `npm run dev` — local dev server.
- `npm run smoke:production` — checks the live site; run after a production deploy.
- `validate:community` and `smoke:production` call the network; they fail in
  sandboxes without internet. That is an environment limit, not a code bug.

## Rules that protect the live product

- The homepage design is approved and frozen (see `VISUAL_QA.md`,
  `docs/FROZEN_REVIEW_PET_DASHBOARD.md`, `scripts/validate-approved-release.mjs`).
  Change it only when the owner asks, and update the validator in the same PR.
- Never fabricate learner data: no invented names, scores or leaderboards.
  Show an honest empty state when real data is missing.
- Admin/Mod access is enforced server-side in `worker.mjs` against Supabase
  `club_members.role`. Never move that check to the client.
- Database changes are additive migrations in `supabase/migrations/`. No
  destructive SQL without the owner's explicit approval.
- Secrets go in GitHub Actions secrets / Cloudflare. Only publishable keys may
  appear in source.
- Other apps (Study OS, A.I Thiệt Chẩn, Trung Y Văn, Atlas, Game Hub) live in
  their own repositories. This repo only links to or proxies them.

## Updating docs

When a change alters architecture, routes, bindings or release flow, update
`docs/ARCHITECTURE.md` and `RELEASE.json` in the same PR.
