# CHECKPOINT CP28 — Sans typography clarity +0.5px

Date: 2026-09-24
Base: `58c6e88adb53d4cc0f254242b34288fbb0965d1f` (CP27)

## Scope
- Increase explicit pixel sizes by exactly **+0.5px** for text using the Inter/system UI sans stack across app and component stylesheets.
- Preserve Georgia/serif display typography and icon-like glyph sizing.
- Improve inherited sans clarity with `font-weight: 450` and `font-optical-sizing: auto`.
- Example verified in the Digital Campus hero body copy: 12px → 12.5px base, 13px → 13.5px PC mode.

## Frozen surface
No change to approved colors, cards, backgrounds, imagery, data, SSO, learning sync, Hub routing, or Admin/Mod behavior.

## Release gate
CI, Cloudflare production deployment, and live smoke must pass before CP28 is considered live.
