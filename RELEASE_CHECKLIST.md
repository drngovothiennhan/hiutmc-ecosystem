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
- [ ] `CLOUDFLARE_API_TOKEN` is stored as a GitHub Actions secret in **this repository**.
- [ ] `CLOUDFLARE_ACCOUNT_ID` is stored as a GitHub Actions secret in **this repository**.
- [ ] First production deployment from this repository succeeds.
- [ ] SSL for `hiutmc.com` is active.
- [ ] Live smoke test on `https://hiutmc.com` passes.

## Current verified checkpoint
- Repository: `drngovothiennhan/hiutmc-ecosystem`
- Main checkpoint: `1ec3c1cfb8423500a5f74ddf6734b22583aadf22`
- CI run: `35812155622`
- CI result: **PASS**
- Release-candidate branch: `release-candidate`
- Production branch: `production`

## Release rule
Do not announce production completion until the Cloudflare deployment and live smoke test both have evidence.
