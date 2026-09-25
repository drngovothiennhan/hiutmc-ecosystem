# G2 SSO QA checkpoint — 2026-09-25

## Current state

- Ecosystem branch: `g2/game-hub-sso-preview`
- Ecosystem source commit for this QA pass: `58b8b09c8c187315b937917426271ca67e16540c`
- Game Hub receiver preview: `https://437e5bd0.hiutmc-game-hub.pages.dev/` (immutable preview for Game Hub commit `1d5d8450d47897a0cf0e02609046be82008cd405`)
- Ecosystem preview used for the final handoff: `https://4723bd3f-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev/?g2-sso-test=1`
- The confirmed QA member is `20262026`; the preview profile matched immediately before opening the handoff.
- Game Hub CI and preview smoke: runs `36124266028` and `36124265443`; both passed.
- Ecosystem CI and preview smoke: runs `36124738514` and `36124734111`; both passed.

## Safe browser QA result

- Earlier SSO attempts failed because the Game Hub required a refresh token to be at least 20 characters; the producer sent the field, but the consumer rejected its format using a local length assumption.
- The Game Hub now requires the refresh field to be present, verifies the access token with Supabase Auth, trusts only `app_metadata.member_id`, strips the bridge fragment, and preserves the refresh token so Ecosystem can continue using its stored session.
- Ecosystem login now reconciles the server-returned member with the refreshed Auth claim and linked member profile before saving the session.
- On the first receiver failure the bridge fragment was removed from the URL; no gameplay or Garden data was touched.
- End-to-end result: the browser reached the pinned Game Hub preview, the Hub showed its verified-profile state, and the URL fragment was absent after handoff. The Hub consumed the same Auth session that Ecosystem had just matched to `20262026`; the bridge accepts only the trusted `app_metadata.member_id` claim.
- No credentials, tokens, cookies, account names, or member records were inspected or recorded.
- No Garden gameplay, Supabase writes, schema changes, Study OS changes, production deployment, or DNS/domain changes occurred.

## Next action

G2 SSO is verified on isolated previews. Continue G3 by reading `GARDEN_V7_EXTRACTION_MAP.md` and the approved gameplay contracts; keep production data read-only until an isolated test environment or verified rollback is available.
