# CHECKPOINT CP30 — Homepage typography system

Date: 2026-09-24
Base main: `757afc0c3f11e63f8d3acbbabc21221de121d040`
Working branch: `cp30-home-typography-system`

## Backups
- Production CP29 backup: `backup/production-cp29-20260924-1827` -> `3fbb91fc5a57f77d3550849044008ed980e0cc5c`
- Main pre-CP30 backup: `backup/main-pre-cp30-20260924-1827` -> `757afc0c3f11e63f8d3acbbabc21221de121d040`

## Scope
Homepage typography only. No app rebuild and no architecture change.

### Typography groups
1. Title group
   - Georgia / Times-compatible serif stack.
   - Hero title, section titles, card titles and approved display headings use a consistent scale.
2. Content group
   - Inter / system UI sans stack.
   - Search, navigation, descriptions, metadata, actions and supporting copy share consistent content scales.
3. Numeral group
   - Inter / system UI sans stack.
   - Tabular + lining numerals enabled for percentage, date, badge and mission-number surfaces.

## Responsive policy
- Auto/Mobile uses the compact CP30 token scale.
- Forced PC mode keeps the desktop typography scale even on a small physical viewport.
- Existing PC/mobile layout isolation remains untouched.

## Frozen surface
No changes to approved icons, colors, cards, background, routes, URLs, authentication, SSO, learning-progress sync, backend, app registry or application architecture.

## Release gate
Do not promote to production until:
- repository CI passes;
- Cloudflare preview is reachable;
- responsive screenshots pass at 360 / 390 / 412 / 430 / 1024 / 1366 / 1440 px;
- no horizontal overflow;
- visual review confirms title/content/numeral hierarchy and no clipping;
- production smoke passes after promotion.

## QA completed
- Pull-request CI: run #142 passed on typography head `e04ac69918934c9b781bb5542d41e7f0682881d6`.
- Cloudflare preview route smoke: passed.
- Responsive screenshot smoke: passed at 360 / 390 / 412 / 430 / 1024 / 1366 / 1440 px.
- Final responsive artifact digest: `sha256:4c5baa5599bcaa856b416f1b698292ec996b66946bc1d76bc30f13d5f06e2e50`.
- Visual review: no horizontal overflow, clipping or layout regression observed on mobile and desktop.
- Main advanced only in agent-workspace deployment metadata; no homepage/UI file conflict was found before rebase.
