# HIU YHCT Ecosystem — Production status

## Source of truth
- Public site: https://hiutmc.com
- Admin Center: https://hiutmc.com/admin/
- Mod Center: https://hiutmc.com/mod/
- Repository: `drngovothiennhan/hiutmc-ecosystem`
- Host: Cloudflare Workers Static Assets
- Production branch: `production`; stable releases keep `main` and `production` aligned.
- CI: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/ci.yml
- Production deploy and smoke: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/deploy-cloudflare.yml
- Exact release contract: `RELEASE.json`.

## Approved product
- The homepage is the approved illustrated HIU YHCT ecosystem map, with direct links to Study OS, A.I Thiệt Chẩn, Trung Y Văn and 3D Atlas.
- The mobile taskbar links to Trang chủ, Ứng dụng, Nhiệm vụ, Atlas 3D and Cộng đồng.
- A reversible Mobile/PC switch remains visible in both modes; returning from PC mode restores the device-sized layout and taskbar.
- The floating Trợ lý học tập button opens the approved Study OS assistant and direct routes to all four registered Hubs; it does not simulate an AI chat inside the portal.
- Daily missions rotate across the registered learning hubs. Personal completions, experience points, current streak, weekly challenge and badges are saved in the browser on that device only.
- The local points are not grades and are not synced to member accounts. A class leaderboard stays unavailable until verified member data and shared storage are connected; the app must not fabricate names or scores.
- Admin/Mod access is server-enforced by the Cloudflare Worker against the active Supabase member session and canonical `club_members.role`. `/admin/` requires `admin`; `/mod/` accepts `mod`, `super_mod`, or `admin`.
- The Admin Center still provides local Hub content/link editing, Mod review UI, export/import and activity notes. Those content/settings drafts remain browser-local until a shared publishing backend is connected.
- The HIU CLB logo is used in the academy map and PWA icons. Reduced-motion settings disable ambient animations.

## Integration boundaries
- Each registered Hub opens its verified upstream URL. Authentication and availability inside a Hub belong to that Hub's hosting provider.
- The main site does not control Vercel access protection or sign-in for A.I Thiệt Chẩn. Any Vercel SSO change must be made in that project's deployment settings by an owner.
- Canonical Hub subdomains remain separate routing work recorded in the registry; current links must not imply that those aliases are active.
- No other app repository is modified by this project.

## Social link preview
- The homepage exports crawler-visible Open Graph metadata for Zalo and other social link previews.
- Share title: `HIU YHCT Ecosystem – Cổng học tập Y học cổ truyền HIU`.
- Share summary mentions Study OS, Atlas 3D, A.I Thiệt Chẩn, Trung Y Văn and the HIU YHCT academic community.
- Preview image uses the public 512×512 PNG icon with a versioned query string to reduce stale image-cache reuse.
- `robots.txt` allows link-preview crawlers.

## CP23 shared staff backend
- Additive Supabase storage exists for Hub drafts, moderation queue and audit log.
- RLS is enabled and privileged writes are exposed only through role-checked RPCs.
- Hidden Cloudflare staff APIs proxy verified Admin/Mod sessions to those RPCs.
- Production Supabase migration `ecosystem_admin_backend_shadow_v1` is applied and the Admin/Mod UI now reads and writes its shared drafts, moderation queue and audit log.
- Admin can publish each Hub revision through a separate role-checked RPC; only the publication table is exposed through a public read-only RPC.
- The homepage and ecosystem map load published Hub values through `/api/hub-registry`; browser-local drafts are never used as public content.
- Rollback is additive: reverting the UI/Worker restores the static registry while published rows remain available for a later release.

## CP31 Admin traffic counter
- The Admin Center includes a server-protected traffic view; the Mod Center does not expose it.
- It counts public HTML page views on `hiutmc.com`, excluding static assets, API calls, Admin/Mod routes and prefetches.
- The Cloudflare Durable Object keeps the lifetime total and daily totals for a rolling 31-day window; the Admin UI displays today and the last seven days in Vietnam time.
- The counter does not retain IP addresses, user agents, account identifiers or device identifiers. Values represent page views, not unique visitors.
- Production deployment and smoke passed in GitHub Actions run #46: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/36078439597.
- Cloudflare Worker version: `8225f14e-757c-4f6e-9936-2c3435f184d8`.

## CP32 shared Hub publishing
- Supabase migration `ecosystem_hub_shared_publication_v1` is applied to the production project.
- Admin-only publish RPC and anonymous read-only registry RPC privileges were verified; the publication table has no direct client grants.
- Local build, release checks, staff authorization contracts, traffic tests and Wrangler dry-run pass. Cloudflare deployment and live smoke are pending the source update.

## Production release gates
1. Repository boundary, release metadata and Hub registry validation.
2. Map asset, PWA manifest/icons, Community contract and learning-progress validation.
3. Staff authorization contract validation plus static build and approved dashboard markers.
4. Wrangler dry-run validates Worker + static ASSETS binding.
5. Production smoke confirms anonymous denial for `/admin/`, `/mod/` and `/api/staff/access`, then validates public routes.

GitHub Actions records the exact source commit and run for each CI/deployment. Do not mark a change production-live until the deploy workflow and live smoke succeed.
