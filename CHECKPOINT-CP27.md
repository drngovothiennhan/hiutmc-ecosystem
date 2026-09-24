# CHECKPOINT CP27 — Hero member name single line

Date: 2026-09-24
Base: `1ecbd6ac7bef9432b71c181b1c56cb23032d0ae8` (CP26)

## Scope
- Keep the authenticated Study OS member full name on one visual line in the homepage hero.
- Preserve the approved hero artwork and all existing colors/cards/layout structure.
- Add a true-Mobile font-size guard so the one-line name does not wrap on narrow screens.
- Add a regression assertion for `white-space: nowrap`.

## Frozen surface
No changes to SSO, member identity source, learning sync, Hub routing, Admin/Mod backend, imagery, or visual architecture.

## Release gate
CI, Cloudflare production deploy, and live smoke must pass.
