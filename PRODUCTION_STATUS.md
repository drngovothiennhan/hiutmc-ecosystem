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

## Production release gates
1. Repository boundary, release metadata and Hub registry validation.
2. Map asset, PWA manifest/icons, Community contract and learning-progress validation.
3. Staff authorization contract validation plus static build and approved dashboard markers.
4. Wrangler dry-run validates Worker + static ASSETS binding.
5. Production smoke confirms anonymous denial for `/admin/`, `/mod/` and `/api/staff/access`, then validates public routes.

GitHub Actions records the exact source commit and run for each CI/deployment. Do not mark a change production-live until the deploy workflow and live smoke succeed.
