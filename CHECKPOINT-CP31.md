# CHECKPOINT CP31 — Motion performance and Hub topic access

Date: 2026-09-24
Base main: `291998df156ad9b3d8004899895e04c398d9d396`
Working branch: `perf/cp31-motion-hub-access`
Pull request: #42

## Scope
Preserve the current dashboard layout and visual identity. Improve the companion effect's animation work and make existing homepage learning topics directly keyboard-accessible through Search Hub.

## Changes
- Keep the companion glow as a static filter and animate only transform/opacity.
- Turn the three existing community topic tiles into accessible Search Hub links using existing indexed terms: dược liệu, nội khoa, châm cứu.
- Add keyboard-visible focus indication to topic links.
- No changes to page structure, labels, colors, card layout, registered app URLs, authentication/SSO, learning progress storage, or application architecture.
- No new learning/event content was invented.

## Verification
- PR CI run #150 passed on code head `e4d6f68cb202622d116354554f460acc8f11c076`.
- Repository boundary, release metadata, registry, assets, PWA, Community backend, learning progress, staff authorization, display mode, build/export, approved release, and Cloudflare bundle checks passed.
- Confirmed all three destination terms exist in `data/search-index.ts`.
- Production deployment: not performed.
- Visual review on physical mobile/desktop and post-deployment navigation smoke: pending before any production release.
