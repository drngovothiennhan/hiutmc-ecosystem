# CHECKPOINT CP21 — SERVER-SIDE ADMIN/MOD AUTHORIZATION

Date: 2026-09-24

## Base
- CP20 production: `15080a8e844de0b08843bd42abcd1e28ccd2afd1`

## Authorization
- Cloudflare Worker validates the Supabase access token before creating a staff session.
- Staff session is stored only in an `HttpOnly; Secure; SameSite=Strict` cookie.
- `/admin/` requires canonical `club_members.role = admin`.
- `/mod/` requires canonical role `mod`, `super_mod`, or `admin`.
- Anonymous or insufficient-role requests are redirected to the public homepage before protected HTML is served.
- `/api/staff/access` exposes only the verified staff access summary for the active server session.
- Logout clears both the local member session and the server staff cookie.

## Homepage behavior
- Member login remains the single visible login entry.
- Staff roles are revalidated by the server after login.
- Admin is sent to `/admin/`; Mod/Super Mod is sent to `/mod/`.
- Restored member sessions silently refresh the server staff cookie without forcing a redirect.
- The account dialog exposes Admin Center or Mod Center only after the server confirms staff access.

## Console scope
- Admin retains the existing local Hub/content/settings prototype.
- Mod Center exposes only Tổng quan, Duyệt của Mod and Nhật ký.
- Staff authorization is server-enforced; shared publishing storage remains a separate backend concern.

## Release gates
- `npm run validate:staff-auth`
- static export includes `/admin/` and `/mod/`
- Wrangler dry-run succeeds with Worker + ASSETS binding
- production smoke confirms anonymous denial for both staff routes and the staff API
- Cloudflare production deploy succeeds

## Rollback
Rollback target: `15080a8e844de0b08843bd42abcd1e28ccd2afd1`.
