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

## Staff authorization
- [x] Member login is the single public login entry; Admin/Mod detection occurs after server validation.
- [x] `/admin/` requires canonical `club_members.role = admin`.
- [x] `/mod/` accepts `mod`, `super_mod`, or `admin`.
- [x] Staff cookie is HttpOnly, Secure and SameSite=Strict.
- [x] Logout clears the server staff session.

## Known integration limits
- Admin/Mod access is server-enforced, but Hub drafts, moderation queue and local activity notes are still browser-local until shared publishing storage is connected.
- Learning progress is not shared across members/devices. A real leaderboard requires verified membership and backend persistence.
- Hub SSO and access rules are owned by each upstream service. The main site cannot change A.I Thiệt Chẩn's Vercel SSO setting.
- Canonical Hub subdomains are not implied to be live unless verified in the registry and deployed separately.

## Social link preview
- [x] Open Graph title, description and PNG image are present in the static homepage HTML.
- [x] Twitter summary metadata mirrors the same share card.
- [x] `robots.txt` allows crawlers.
- [x] Production smoke verifies the metadata with a Zalo-like user-agent and validates the image bytes/dimensions.

## CP23 shadow backend
- [x] Additive tables exist for Hub drafts, moderation queue and audit log.
- [x] RLS is enabled on all CP23 tables.
- [x] Admin draft writes require Admin; moderation actions require Mod or higher.
- [x] Shadow Worker endpoints are hidden behind the existing staff session.
- [x] Homepage and Staff Console visible UI remain unchanged in CP23.
- [ ] Production smoke must confirm anonymous denial for all CP23 shadow endpoints before Stage 2 starts.

## Required release checks
- [x] Repository boundary, metadata, registry, asset, PWA and Community contract validators pass.
- [x] Learning mission/streak/weekly challenge validator passes.
- [x] Server staff authorization validator passes.
- [x] Next.js static export includes approved homepage plus gated Admin/Mod routes.
- [x] Required routes and Wrangler dry-run pass in CI.
- [x] Cloudflare deployment completes and live production smoke passes before announcing a release.

- Canonical repository: `drngovothiennhan/hiutmc-ecosystem`
- Production: https://hiutmc.com
- Admin Center: https://hiutmc.com/admin/
- Mod Center: https://hiutmc.com/mod/
