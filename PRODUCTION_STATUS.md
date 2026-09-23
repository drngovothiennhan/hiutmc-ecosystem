# HIU YHCT Ecosystem — Production status

## Source of truth
- Public site: https://hiutmc.com
- Admin Center: https://hiutmc.com/admin/
- Repository: `drngovothiennhan/hiutmc-ecosystem`
- Host: Cloudflare Workers Static Assets
- Production branch: `production`; stable releases keep `main` and `production` aligned.
- CI: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/ci.yml
- Production deploy and smoke: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/workflows/deploy-cloudflare.yml
- Exact release contract: `RELEASE.json`.

## Approved product
- The homepage is the approved illustrated HIU YHCT ecosystem map, with direct links to Study OS, A.I Thiệt Chẩn, Trung Y Văn and 3D Atlas.
- The mobile taskbar links to Trang chủ, Ứng dụng, Nhiệm vụ, Atlas 3D and Cộng đồng.
- Daily missions rotate across the registered learning hubs. Personal completions, experience points, current streak, weekly challenge and badges are saved in the browser on that device only.
- The local points are not grades and are not synced to member accounts. A class leaderboard stays unavailable until verified member data and shared storage are connected; the app must not fabricate names or scores.
- The Admin Center provides local Hub content/link editing, Mod review UI, export/import and activity notes. Its settings are browser-local; the displayed roles are not server-enforced authentication or shared permissions.
- The HIU CLB logo is used in the academy map and PWA icons. Reduced-motion settings disable ambient animations.

## Integration boundaries
- Each registered Hub opens its verified upstream URL. Authentication and availability inside a Hub belong to that Hub's hosting provider.
- The main site does not control Vercel access protection or sign-in for A.I Thiệt Chẩn. Any Vercel SSO change must be made in that project's deployment settings by an owner.
- Canonical Hub subdomains remain separate routing work recorded in the registry; current links must not imply that those aliases are active.
- No other app repository is modified by this project.

## Production release gates
1. Repository boundary, release metadata and Hub registry validation.
2. Map asset, PWA manifest/icons, Community contract and learning-progress validation.
3. Static build, approved-home/Admin markers and required route checks.
4. Wrangler dry-run in CI and Cloudflare deploy workflow.
5. Production smoke against `https://hiutmc.com` after deployment.

GitHub Actions records the exact source commit and run for each CI/deployment. Do not mark a change production-live until the deploy workflow and live smoke succeed.
