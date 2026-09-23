# HIU YHCT Ecosystem — Production release checklist

## Approved CP12 experience
- [x] Illustrated ecosystem map remains the homepage and links directly to all four registered Hubs.
- [x] Traditional visual style, ambient weather-like motion, motion toggle and reduced-motion support are preserved.
- [x] Mobile taskbar provides Trang chủ, Ứng dụng, Nhiệm vụ, Atlas 3D and Cộng đồng navigation.
- [x] Mobile/PC switch stays visible in PC mode and switches back to adaptive mobile layout.
- [x] Approved learning assistant entry opens Study OS and exposes direct links to the other registered Hubs.
- [x] Admin Center route includes Hub content/URL editing, Mod review, export/import and activity notes.
- [x] HIU CLB logo is present in the map and PWA icon set.

## Learning engagement
- [x] Three daily tasks rotate across the real Hub registry.
- [x] Browser-local completions drive XP, daily completion count, streak, weekly challenge and earned badges.
- [x] Data validation rejects unknown task IDs, malformed dates and duplicates.
- [x] UI discloses that data is local to the current browser and XP is not an academic grade.
- [x] No invented member identities, class rankings or scores are shown.

## Known integration limits
- Admin and Mod screens are a browser-local prototype; role labels are not server-enforced authorization.
- Learning progress is not shared across members/devices. A real leaderboard requires verified membership and backend persistence.
- Hub SSO and access rules are owned by each upstream service. The main site cannot change A.I Thiệt Chẩn's Vercel SSO setting.
- Canonical Hub subdomains are not implied to be live unless verified in the registry and deployed separately.

## Required release checks
- [x] Repository boundary, metadata, registry, asset, PWA and Community contract validators pass.
- [x] Learning mission/streak/weekly challenge validator passes.
- [x] Next.js static export and approved CP12 homepage/Admin markers pass.
- [x] Required routes and Wrangler dry-run pass in CI.
- [x] Cloudflare deployment completes and live production smoke passes before announcing a release.

- Canonical repository: `drngovothiennhan/hiutmc-ecosystem`
- Production: https://hiutmc.com
- Admin Center: https://hiutmc.com/admin/
