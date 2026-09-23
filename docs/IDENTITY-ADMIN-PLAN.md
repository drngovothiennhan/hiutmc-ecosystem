# Identity, single sign-on and admin console

## What the homepage does now

- The **Đăng nhập thành viên** button opens the current Study OS upstream directly.
- Approved members continue to use the existing Study OS MSSV/password login and approval checks.
- Hub does not collect passwords, mint sessions, or claim a shared login across applications.

## Verified authentication boundary

Study OS currently authenticates through its Supabase `member-login` Edge Function. The function validates the member account and returns Supabase access/refresh tokens and member data. Its explicit allowed-origin list currently contains Study OS Vercel origins and local development origins; `https://hiutmc.com` is not on that list. The Hub is a static export and has no server route to safely broker credentials or admin operations.

The function and its member approval rules live in the separate repository `drngovothiennhan/yhct-hiu-4-0`. This Hub task must not modify that repository. A future, separately scoped auth integration must preserve `club_members.status`, `login_enabled`, and the existing role checks.

## Required design before SSO is called complete

1. Define one identity broker for `hiutmc.com` and its app subdomains, using the existing Study OS identity source.
2. Use an authorization-code exchange that is short-lived, one-time, audience-bound, and redeemed server-side. Never pass access or refresh tokens in query strings or fragments.
3. Register and verify each production origin, including the final canonical subdomains, in the auth service and app callback configuration.
4. Ensure each member app validates the same approved member and role state; signing in at the Hub must not bypass app-level authorization.
5. Test sign-in, denied/unapproved accounts, expired/replayed codes, sign-out, refresh, mobile browser behavior, and recovery.

## Admin console boundary

A static `/admin` page cannot provide real authorization. A UI-only password or localStorage flag is not an access control mechanism. A production admin console requires:

- server-verified administrator roles from trusted app metadata;
- scoped backend operations for registry/content/status management;
- separate least-privilege integrations for Cloudflare DNS, Vercel domains, and GitHub Pages settings;
- audit history for changes, confirmation for destructive changes, and tested rollback;
- no provider secrets in browser bundles or public static files.

The first safe admin scope should be Hub content and app registry management. Domain, deployment, and member-account administration should remain delegated to the corresponding provider consoles until secure server-side APIs are implemented.

## Approved avatar prototype

- The approved prototype is implemented in the Hub as an SVG anime-style 2D character, with gender presentation, hairstyle, hair color, skin tone, and clothing options.
- Members can move the character through the four learning destinations with touch controls or arrow keys, then open the selected app.
- The current static Hub stores only these appearance preferences in that browser's localStorage. It does not identify a member or synchronize profiles between devices.
- Do not link preferences to an account until the separately planned SSO/backend has member consent, access controls, and a documented retention policy.
- Continue with a lightweight 2D campus. Defer realtime shared-world or 3D features until usage and device performance justify the added infrastructure.
