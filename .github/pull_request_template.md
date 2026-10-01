## What and why

<!-- One topic per PR. Say what changes for visitors (ideally: nothing yet). -->

## Safe-release checklist (see docs/RELEASE_PLAYBOOK.md)

- [ ] Based on `main`; branch named `claude/<topic>`; CI is green
- [ ] Anything visitors could notice is behind a feature flag that **ships OFF** (or the owner asked for it)
- [ ] The approved homepage is untouched (or the owner asked, and `validate-approved-release` is updated here)
- [ ] Database changes are additive migrations only (expand → switch → contract later)
- [ ] No new service-worker caching; `/sw.js` and manifest stay `no-cache`
- [ ] Rollback plan: flag OFF / Cloudflare rollback / revert PR (delete lines that do not apply)
- [ ] `docs/ARCHITECTURE.md` and `RELEASE.json` updated if architecture, routes, bindings or release flow changed

## How to verify

<!-- Commands run, pages checked, flag stage used for testing. -->
