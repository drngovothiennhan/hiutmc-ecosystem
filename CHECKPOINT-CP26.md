# CHECKPOINT CP26 — Member identity + display-mode alignment

Date: 2026-09-24
Base: `236120938778d995ce13315a8d2acfd026867aa4` (CP25)

## Scope
- Replace the generic homepage greeting identity with the authenticated member `fullName` already loaded from the canonical Study OS / `club_members` profile.
- Anonymous homepage keeps a neutral `HIU YHCT` greeting and never invents a person name.
- Center the `Mobile ↔ PC` control label both horizontally and vertically, including the member/profile dialog.
- Add regression guards preventing the generic `người học YHCT` string from returning and requiring the display-mode centering contract.

## Frozen surface
No changes to approved colors, typography families, cards, backgrounds, imagery, Hub layout, SSO semantics, learning-progress backend, Admin/Mod Stage 2, or existing routing.

## Release gate
CI must pass before merge. After merge, `production` must be fast-forwarded to the verified main SHA so the Cloudflare production workflow and live smoke run against the exact checkpoint.
