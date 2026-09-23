# HIU YHCT Ecosystem — Production status

## Authoritative state
- Website: https://hiutmc.com
- Repository: drngovothiennhan/hiutmc-ecosystem
- Hosting: Cloudflare Workers Static Assets
- Release metadata: `RELEASE.json`
- Production source of truth: tip of the `production` branch
- Stable release rule: after production smoke passes, `main` and `production` must point to the same commit.
- CI workflow: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/ci.yml
- Production workflow: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/deploy-cloudflare.yml

## Current product surface
- Student Hub: `/`
- Learning Center: `/learn/`
- AI Lab: `/ai/`
- Community: `/community/`
- Discover: `/discover/`
- Search Hub: `/search/`
- Homepage: customizable 2D avatar campus prototype with keyboard/touch movement and browser-local preferences; the former ecosystem map is removed.
- Study OS homepage link is a direct navigation shortcut. Shared sign-in and account-bound avatar sync are not yet implemented.
- Existing upstream apps remain registered and open directly.

## Current production release
- Checkpoint: CP8 — `HIU-YHCT-ECOSYSTEM-20260923-08`
- Application commit deployed: `269bb4accaa45028b90f800d5f4338964c4b5e60`
- CI: successful, run #34 — https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/35852234097
- Cloudflare deploy and production smoke: successful, run #14 — https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/35852346924
- Production verification covered release contracts, static export, required routes, deployment, and smoke checks against `https://hiutmc.com`.

## Release verification
Every production release must pass:
1. repository boundary
2. release metadata
3. application registry
4. static assets
5. PWA contract
6. Community backend contract when enabled
7. static export and required routes
8. Cloudflare deployment
9. production smoke

## Community data rule
The Hub may only display anonymous Community feed records when the backend returns rows matching:
- `moderation_status = approved`
- `visibility = public`
- `privacy_scrubbed = true`
- `citation_verified = true`
- `is_spam = false`

No member identity data is required for the public feed. Posting, comments and reactions remain gated behind authenticated-member integration.

## Rollback
The immediately previous stable checkpoint is CP7 at `fd4bcc08a61a204109a85c7acb69a04247f893fb` (release `HIU-YHCT-ECOSYSTEM-20260923-07`). CP7 is based on CP6 commit `e1d71af1d50e4772dc8833efe1748c6d17a9dda9`.

No other application repository is modified by this release process.
