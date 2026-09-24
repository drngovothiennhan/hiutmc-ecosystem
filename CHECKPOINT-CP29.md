# CHECKPOINT CP29 — Homepage approved icon system

Date: 2026-09-24
Base: `909ed7173f8f4aea0cbee79a041b4d99be38d787` (CP28)
Branch: `cp29-approved-home-icons`

## Scope
Icon-only update for the approved HIU YHCT Ecosystem homepage reference.

### Audited mapping
- Study OS: `▣` → approved open-book + sprout vector, burgundy on soft pink.
- A.I Thiệt Chẩn: `◈` → approved tongue inside scan/focus frame, dark green on soft green.
- Trung Y Văn: `冊` → approved classical scroll/text + leaf vector, bronze brown on beige.
- 3D Atlas: `◎` → approved body/meridian vector, blue on pale blue.
- Dược liệu theo công năng: `⚕` → approved mortar/pestle + leaf vector, brown on beige.
- Bệnh học YHCT: `☯` → approved Yin-Yang + light cloud motif vector, navy on pale blue.
- Châm cứu · Thủ pháp: `✦` → approved needles + manipulation curve + sparkle vector, burgundy on soft pink.
- Mobile dock: `⌂ / ▤ / ◎ / ◈ / ♧` → house / open book / anatomical layers / AI sparkle / people-group SVG icons.

## Files changed
- `components/HomeIcon.tsx`
- `app/page.tsx`
- `app/dashboard.module.css`
- `CHECKPOINT-CP29.md`

## Frozen surface
No change to card data, titles, subtitles, URLs, click handlers, router/navigation, authentication, SSO, learning-progress sync, notification, assistant, search, desktop layout structure, mobile/PC mode logic, backend, package dependencies, or application architecture.

## Visual constraints
- Internal SVG only; no emoji, Unicode icon glyphs, raster icon assets, or new package dependency for the marked icons.
- Content icon visual boxes are 56–60 px across the existing responsive surfaces.
- Mobile dock icons are 29–30 px and inherit existing active/inactive colors.
- Existing card and navigation DOM structure is preserved wherever possible.

## Release gate
This branch is preview-only. Do not merge to production until:
- GitHub CI passes;
- static build and approved-release validation pass;
- responsive smoke is checked at 360 / 390 / 412 / 430 px and 1024 / 1366 / 1440 px;
- navigation and authentication/SSO/progress smoke pass;
- visual comparison confirms the icon mapping against the approved reference.
