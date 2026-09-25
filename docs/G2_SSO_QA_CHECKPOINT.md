# G2 SSO QA checkpoint — 2026-09-25

## Current state

- Ecosystem branch: `g2/game-hub-sso-preview`
- Ecosystem source commit for this QA pass: `58b8b09c8c187315b937917426271ca67e16540c`
- Game Hub receiver preview: `https://437e5bd0.hiutmc-game-hub.pages.dev/` (immutable preview for Game Hub commit `1d5d8450d47897a0cf0e02609046be82008cd405`)
- Ecosystem preview used for the final handoff: `https://4723bd3f-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev/?g2-sso-test=1`
- The designated QA member's preview profile matched immediately before opening the handoff.
- Game Hub CI and preview smoke: runs `36124266028` and `36124265443`; both passed.
- Ecosystem CI and preview smoke: runs `36124738514` and `36124734111`; both passed.

## Safe browser QA result

- Earlier SSO attempts failed because the Game Hub required a refresh token to be at least 20 characters; the producer sent the field, but the consumer rejected its format using a local length assumption.
- The Game Hub now requires the refresh field to be present, verifies the access token with Supabase Auth, trusts only `app_metadata.member_id`, strips the bridge fragment, and preserves the refresh token so Ecosystem can continue using its stored session.
- Ecosystem login now reconciles the server-returned member with the refreshed Auth claim and linked member profile before saving the session.
- On the first receiver failure the bridge fragment was removed from the URL; no gameplay or Garden data was touched.
- End-to-end result: the browser reached the pinned Game Hub preview, the Hub showed its verified-profile state, and the URL fragment was absent after handoff. The Hub consumed the same Auth session that Ecosystem had just matched to the designated QA member; the bridge accepts only the trusted `app_metadata.member_id` claim.
- No credentials, tokens, cookies, account names, or member records were inspected or recorded.
- No Garden gameplay, Supabase writes, schema changes, Study OS changes, production deployment, or DNS/domain changes occurred.

## G3 SSO smoke — current preview (2026-09-25)

- QA branch commit: `7c56d01228c689963be033987bcd8b66c3300281`; retargets the opt-in handoff to the current Game Hub G3 preview.
- Ecosystem CI run `36158267315` and isolated preview run `36158258910` passed.
- Latest immutable Ecosystem QA preview: `https://9070e22e-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev/?g2-sso-test=1`.
- The designated QA member signed in through the secure browser flow. The Game Hub receiver showed its signed-in state and the bridge fragment was cleared. The Garden continuation card was absent for this ordinary member account.
- No planting, care, harvest, inventory, plot-unlock, or reload gameplay action was run.
- The dedicated Supabase QA project still lacks the Garden plants, inventory, wallet, event, seed, and gameplay RPC schema. It cannot yet support the requested save/reload parity test.

## Remaining G3 gate

Use a fully isolated Garden schema and an authorized staff QA identity to test the gameplay sequence and persisted reload. Do not use a real production member save for those writes. The production beta remains role-restricted, and the previous isolated role-gate transaction remains the evidence for staff allowlisting.

