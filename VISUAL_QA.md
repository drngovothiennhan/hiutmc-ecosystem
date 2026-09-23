# Illustrated academy QA — 2026-09-23

- Build and TypeScript: passed; all four app detail routes statically exported.
- Repository, app registry and asset validators: passed.
- Cloudflare static bundle dry run: passed.
- Browser: Chromium, widths 1440, 768, 390 and 360 px.
- Desktop WebP decoded at 1774 × 887 (about 710 KB); mobile image at 1536 × 1024 (629 KB).
- Horizontal overflow: none at all four sizes.
- All four district controls: tap/click, Enter and Escape checked.
- Page-wide pause and prefers-reduced-motion: passed.
- Client JavaScript exceptions: none.
- Screenshots reviewed; mobile CTA and tablet headline overlap found and fixed before handoff.
- Live deployment validation is recorded separately in PRODUCTION_STATUS.md.

The page reproduces the reference's composition and style. A numerical 95% image-similarity result has not been measured and is not claimed.

All four internal application routes returned success with their upstream CTA present. Vietnamese handwriting glyph coverage was checked. No production release was attempted after automatic approval rejected the main-branch push.
