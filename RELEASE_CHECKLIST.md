# HIU TMC Ecosystem — Production Release Checklist

## Canonical repository
- [x] Independent repository: `drngovothiennhan/hiutmc-ecosystem`.
- [x] Repository boundary validation passes in CI.
- [x] Study OS repository `drngovothiennhan/yhct-hiu-4-0` is no longer a release source for this Hub.

## Build gate
- [x] Next.js static export succeeds.
- [x] Home route exists.
- [x] Four application detail routes exist.
- [x] App registry validation succeeds.
- [x] Vector map asset integrity validation succeeds.
- [x] Cloudflare Wrangler dry-run succeeds.
- [x] robots.txt, sitemap.xml, favicon, manifest and 404 are generated.
- [x] Keyboard focus states, skip link and mobile navigation are present.
- [x] CI artifact is generated.

## Routing gate
- [x] Study OS production alias is registered in the central app registry.
- [x] A.I Thiệt Chẩn production alias is registered in the central app registry.
- [x] Trung Y Văn GitHub Pages endpoint is registered.
- [x] 3D Atlas GitHub Pages endpoint is registered.
- [ ] Canonical application subdomains under `hiutmc.com` are activated.

## Infrastructure gate
- [x] `hiutmc.com` is registered.
- [x] Cloudflare static-only Wrangler configuration exists.
- [x] Production workflow is present in this repository.
- [x] Branches `main`, `release-candidate`, and `production` exist.
- [x] `CLOUDFLARE_API_TOKEN` is available to GitHub Actions.
- [x] `CLOUDFLARE_ACCOUNT_ID` is available to GitHub Actions.
- [x] First production deployment from this repository succeeds.
- [x] `hiutmc.com` is attached as a Cloudflare custom domain.
- [x] Live smoke test on `https://hiutmc.com` passes.
- [x] Required security headers pass production smoke.

## Production evidence — 2026-09-23
- Production source commit: `f2393175a45f607c4b247dbe6a17c8c538304ad7`
- GitHub Actions run: `35813128206`
- Cloudflare Worker: `hiutmc-ecosystem`
- Cloudflare Version ID: `4bd15d4d-5b8b-4a96-b3d8-0a2731480366`
- Custom domain: `https://hiutmc.com`
- Worker fallback URL: `https://hiutmc-ecosystem.dr-ngovothiennhan.workers.dev`
- Smoke: HTTP 200 on home + 4 application detail routes.
- Security headers: `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.

## Remaining ecosystem routing work
The Hub itself is now production-live. Canonical application subdomains such as `study.hiutmc.com`, `thietchan.hiutmc.com`, `trungyvan.hiutmc.com`, and `atlas.hiutmc.com` remain a separate Stage B/D routing task and must be activated one at a time after verifying each upstream.

## Release rule
Future releases must pass repository boundary, registry, asset, static build, Cloudflare deployment, and live smoke gates.
