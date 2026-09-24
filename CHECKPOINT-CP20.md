# CHECKPOINT CP20 — CANONICAL PROFILE REFRESH

Date: 2026-09-24

## Base
- CP19: `bae79ba0a4d6d7d13d2ac81b3582716a0ceb7533`

## Change
- Restored homepage sessions always re-read the canonical `club_members` profile.
- Name, avatar, role and position title no longer stay stale until access-token expiry.
- Login success also re-reads the canonical profile rather than trusting only the Edge Function response body.

## Rollback
Rollback target: `bae79ba0a4d6d7d13d2ac81b3582716a0ceb7533`.
