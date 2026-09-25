# G2 SSO QA checkpoint — 2026-09-25

## Current state

- Ecosystem branch: `g2/game-hub-sso-preview`
- Ecosystem source commit before this QA pass: `9bbe6c39a7baa06c5caa21732b52488062fb939a`
- Game Hub receiver preview: `https://437e5bd0.hiutmc-game-hub.pages.dev/` (immutable preview for Game Hub commit `1d5d8450d47897a0cf0e02609046be82008cd405`)
- Ecosystem preview used to confirm the QA member: `https://9455bb87-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev/?g2-sso-test=1`
- The confirmed QA member is `20262026`; the preview profile matched before opening the handoff.
- Game Hub CI and preview smoke for the receiver fix: run `36124266028` and run `36124265443`; both passed.

## Safe browser QA result

- Earlier SSO attempts failed because the Game Hub required a refresh token to be at least 20 characters; the producer sent the field, but the consumer rejected its format using a local length assumption.
- The Game Hub now requires the refresh field to be present, verifies the access token with Supabase Auth, trusts only `app_metadata.member_id`, strips the bridge fragment, and preserves the refresh token so Ecosystem can continue using its stored session.
- Ecosystem login now reconciles the server-returned member with the refreshed Auth claim and linked member profile before saving the session.
- On the first receiver failure the bridge fragment was removed from the URL; no gameplay or Garden data was touched.
- The current end-to-end handoff result is pending against the newly pinned immutable receiver and a fresh Ecosystem preview origin.
- No credentials, tokens, cookies, account names, or member records were inspected or recorded.
- No Garden gameplay, Supabase writes, schema changes, Study OS changes, production deployment, or DNS/domain changes occurred.

## Next action

Deploy the Ecosystem pin update to a new isolated Workers preview origin. Use the secure browser sign-in flow and confirm the visible account matches `20262026`. If it does not, stop without activating SSO. Once identity is correct, verify the Game Hub positive signed-in state and fragment removal before considering G3.
