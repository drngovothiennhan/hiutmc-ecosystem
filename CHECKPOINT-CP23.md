# CHECKPOINT CP23 — ADMIN/MOD SHARED BACKEND SHADOW MODE

Date: 2026-09-24

## Stable base
- CP22 production SHA: `9230f6d3a485c73e638e33e69bc6890d992d3729`
- Public UI and graphics are frozen for CP23.
- No visible Admin/Mod data-source cutover is part of this checkpoint.

## Additive backend
Production Supabase migration: `ecosystem_admin_backend_shadow_v1`.

New tables:
- `public.ecosystem_hub_drafts`
- `public.ecosystem_moderation_queue`
- `public.ecosystem_audit_log`

Security:
- RLS enabled on all three tables.
- Direct client writes are not granted.
- Staff reads require canonical role >= Mod.
- Hub-draft write RPC requires Admin.
- Moderation submit/review RPC requires Mod or higher.
- Audit records are written by the role-checked server functions.

RPC contract:
- `ecosystem_staff_snapshot()`
- `ecosystem_admin_save_hub_draft(...)`
- `ecosystem_mod_submit_queue(...)`
- `ecosystem_mod_review_queue(...)`

## Cloudflare shadow API
Hidden staff-only endpoints:
- `GET /api/staff/shadow/snapshot`
- `POST /api/staff/shadow/hub-draft`
- `POST /api/staff/shadow/moderation`

They reuse the CP21 HttpOnly staff session and revalidate role before invoking Supabase RPCs. Mutating endpoints also enforce same-origin requests.

## Stability guard
- `app/page.tsx` is not changed by CP23.
- `components/StaffConsole.tsx` is not changed by CP23.
- Browser-local Admin/Mod data remains the visible source during this checkpoint.
- Static Hub registry remains the public source.
- Stage 2 cutover is forbidden until CP23 CI + RC CI + production deploy + live smoke pass.

## Validation
- Additive migration validator rejects destructive SQL patterns.
- CI checks the shadow Worker/API contract.
- Production smoke confirms anonymous access to every CP23 shadow endpoint is denied.
- Existing CP21 Admin/Mod route protection, CP22 Zalo/social preview, PWA and public Hub smoke remain mandatory.

## Rollback
Application rollback target: CP22 SHA `9230f6d3a485c73e638e33e69bc6890d992d3729`.
The CP23 database objects are additive and can safely remain unused if the application is rolled back.
