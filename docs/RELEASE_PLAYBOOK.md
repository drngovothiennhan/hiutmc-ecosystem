# Release playbook — upgrading hiutmc.com without users noticing

Goal: every upgrade ships **invisible first**, is widened in small steps, and can be undone in seconds.
Owner approval is still required for anything that changes what visitors see (see `CLAUDE.md`).

## The four levers, fastest first

| Lever | Undo time | What it undoes |
|---|---|---|
| 1. Feature flag OFF (or kill switch) | seconds | a new feature's visibility |
| 2. Cloudflare one-click rollback | ~1 minute | a bad Worker/static deploy |
| 3. Revert PR → `main` → `production` | ~10 minutes (CI + deploy) | any code change |
| 4. Database migration | not automatic | why migrations are additive only (below) |

Always reach for the fastest lever that fits.

## 1. Normal flow (unchanged from CLAUDE.md)

`claude/<topic>` → PR into `main` → CI green → PR `main` into `production` → automatic deploy + production smoke.
Never push to `production` directly and never merge a red PR. CI also runs `validate:feature-flags`,
`validate:mission-sync` and `validate:site-theme`.

## 2. Ship a risky change behind a flag

1. Register the flag in `lib/feature-flags.mjs` (`FEATURE_FLAG_REGISTRY`) and in `lib/feature-flags.d.mts`
   (`FlagId`). Every flag **ships OFF**; CI fails if a default is not OFF.
2. In a client component: `const on = useFeatureFlag("my-flag")` (`components/useFeatureFlag.ts`). It starts
   `false` and only turns `true` after the Worker confirms, so nothing flashes. Do not use flags in the
   frozen homepage (`app/layout.tsx`, `app/page.tsx` and the approved components) — CI enforces this.
3. The feature must still enforce its own access server-side. **A flag is a rollout control, not security.**
4. Merge and deploy as usual. Nothing changes for visitors because the flag is OFF.

### Rollout ladder

Stages only ever widen (each includes the previous ones; CI proves this):

`off` → `admin` → `staff` → `testers` → `percent` → `all`

| Stage | Who sees it |
|---|---|
| `off` | nobody |
| `admin` | verified Admins only |
| `staff` | verified Admin / Super Mod / Mod |
| `testers` | staff + members listed in `testers` (their `club_members.id`) |
| `percent` | staff + testers + a stable `percent`% of signed-in members (same people each time; raising the % only adds people; anonymous visitors are never in a cohort) |
| `all` | everyone |

### Changing a stage (no deploy)

Cloudflare dashboard → Workers & Pages → `hiutmc-ecosystem` → Settings → Variables and Secrets →
add a **Secret** named `FEATURE_FLAGS` (a Secret, not a plain variable: `wrangler deploy` keeps secrets but
replaces plain variables). Value is JSON:

```json
{
  "deeptutor-agent": { "stage": "testers", "testers": ["<club_members.id>"] },
  "clinical-learning-hub": { "stage": "percent", "percent": 10 }
}
```

Unknown flags and invalid JSON are ignored, so a typo means "everything OFF", never "everything ON".
Visitors pick up a change within about a minute (60-second client cache).

**Kill switch:** add a Secret `FEATURE_FLAGS_DISABLED` = `1`. Every flag becomes OFF for everyone, including
staff preview. Remove it to resume.

**Staff preview on the live site:** open any page with `?flag_preview=<flag-id>` while signed in as
Admin/Mod. The Worker honours it only for a verified staff session, and only for that session.

### Suggested timeline for a feature

1. *Internal:* flag `admin`/`staff`; use `?flag_preview=` on production data-free paths.
2. *Testers:* 3–10 named members. Ask for feedback; watch the checks below for a day.
3. *Percent:* 10% → 50% (wait at least a day between steps).
4. *All*, then after a stable week delete the flag and its dead branch of code in a normal PR.

Go/no-go before each widening: production smoke green, no new errors in Cloudflare Worker logs, no new
errors in Supabase logs, no tester reports. If any fails, set the stage back one step (or `off`).

## 3. Database changes: expand, then contract

Migrations in `supabase/migrations/` are additive only (new tables, columns, functions; no drops, renames
or destructive SQL without the owner's explicit approval).

1. **Expand:** add the new column/table/RPC. Old code keeps working because nothing it uses changed.
2. **Migrate/backfill** in a separate step if needed.
3. **Switch** the code (behind a flag) to the new structure.
4. **Contract:** only after the flag is at `all` and stable, and only with the owner's approval, remove the
   old structure in its own later change.

## 4. Service worker and PWA safety

`public/sw.js` is deliberately tiny: network-first for page navigations, an offline fallback page, and it
never touches other origins or the connected apps. That is why users never get stuck on an old version.

- Do **not** add precaching of the app shell, `/_next/static/*` or API responses without a versioned
  invalidation plan and the owner's approval. `validate:pwa` fails if `sw.js` starts caching anything but
  `/offline.html`.
- Keep `/sw.js` and `/manifest.webmanifest` on `Cache-Control: no-cache` (`public/_headers`).
- Bump `CACHE` in `sw.js` only when `offline.html` itself changes; old caches are removed on activate.
- The Google Play app (`com.hiutmc.app`) is a Trusted Web Activity wrapping the site, so web releases reach
  it without a store update. Re-release on Play only when the wrapper changes.

## 5. Rolling back

**Fast path (Cloudflare):** Workers & Pages → `hiutmc-ecosystem` → Deployments → pick the last good version →
*Rollback*. CLI equivalent: `npx wrangler rollback` (needs the Cloudflare token). This swaps code and
static assets only; it does **not** revert database migrations, secrets or flag settings.

**After a rollback:** open a revert PR so `main` and `production` match what is live again (they must not
diverge), then fix forward on a branch.

## 6. After every production deploy

1. The deploy workflow runs `npm run smoke:production` automatically — confirm it is green.
2. Spot-check by hand: home page loads with the approved design; member sign-in; Study OS, A.I Thiệt Chẩn,
   Trung Y Văn, Atlas and Game Hub open through `/apps/*`; `/admin/` redirects when signed out.
3. Look at Cloudflare Worker logs for new errors for ~15 minutes.

## 7. Optional tooling (drafts — see below)

Two workflows are included **disabled by default** and need the owner's go-ahead before use:

- `.github/workflows/preview-version.yml` — manual: builds a branch and uploads it as a Cloudflare Worker
  *version* with a preview URL, without making it live. Caveat: the preview shares production bindings
  (visit counter, Supabase), so test read-only flows only. Not yet exercised.
- `.github/workflows/production-health.yml` — manual now; a commented-out schedule runs the production smoke
  test every 30 minutes and fails the run (GitHub emails you) when the site is unhealthy. Enable it by
  uncommenting the `schedule` block.

## Not built yet

- A database-backed flag store with an Admin Center panel (so stages can be changed without touching the
  Cloudflare dashboard). Needs an additive migration and the owner's approval.
- Per-member rollout for guests (anonymous visitors only ever see `all`-stage flags).
