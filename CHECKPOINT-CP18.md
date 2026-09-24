# CHECKPOINT CP18 — CTA OVERFLOW + MEMBER SSO

Date: 2026-09-24

## Base
- CP17: `ba6bb2ae733d23eef6a5cc83bcc48dfc4d519c49`

## Fix
- Mobile Continue CTA is now a fixed 42–44px arrow button; text cannot overflow the card.
- Added homepage member login using the exact same Supabase `member-login` authority as Study OS.
- Member profile is verified against `club_members`.
- Homepage session refreshes using Supabase refresh token.
- Opening Study OS from the homepage transfers the active session in a transient URL fragment generated only at click time.
- The target app must consume and immediately clear the fragment before restoring the member session.

## Security
- Tokens are never embedded into server-rendered HTML.
- Tokens are not placed in query parameters.
- Bridge fragments are generated only on explicit navigation.
- Allowed Study OS hosts are restricted to the production Vercel hostname and planned `study.hiutmc.com`.

## Rollback
Rollback target: `ba6bb2ae733d23eef6a5cc83bcc48dfc4d519c49`.
