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
- Existing upstream apps remain registered and open directly.

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
The immediately previous stable checkpoint is the rollback target. CP7 is based on CP6 commit `e1d71af1d50e4772dc8833efe1748c6d17a9dda9`.

No other application repository is modified by this release process.
