# G2 SSO QA checkpoint — 2026-09-25

## Current state

- Ecosystem branch: `g2/game-hub-sso-preview`
- Baseline source commit: `efb6180233a7492fa2eeeaa75b082d168d6fb8be`
- Game Hub receiver preview: `https://66c6e9be.hiutmc-game-hub.pages.dev/`
- Ecosystem preview tested: `https://6c3859e3-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev/?g2-sso-test=1`
- Latest CI and preview smoke at checkpoint: runs 36115666088 and 36115659952; both passed.

## Safe browser QA result

- The Ecosystem preview sign-in flow reached a signed-in UI state.
- The visible signed-in member did not match the designated test member `20262026`.
- The Game Hub handoff button was not activated. No bridge fragment was transmitted to Game Hub.
- No credentials, tokens, cookies, account names, or member records were inspected or recorded.
- No Garden gameplay, Supabase writes, schema changes, Study OS changes, production deployment, or DNS/domain changes occurred.

## Next action

Use a new isolated Workers preview origin so the browser does not reuse this origin's other-member session. Use the secure browser sign-in flow and confirm the visible account matches `20262026`. If it does not, stop without activating SSO. Once identity is correct, verify the Game Hub positive signed-in state and fragment removal before considering G3.
