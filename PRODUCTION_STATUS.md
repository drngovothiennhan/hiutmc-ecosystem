# Production checkpoint — 2026-09-23

**LIVE: Illustrated Academy Homepage**

- Website: https://hiutmc.com
- Repository: drngovothiennhan/hiutmc-ecosystem
- Hosting: Cloudflare Workers Static Assets
- Deployed commit: 73e3d4d935f461e349f8a72b50d9b1246a01a4b8
- Verified source tree: 387dbd51131d8e3edb3bb4ec7b0ebefeecb0cdf0
- CI: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/35815910062 — success
- Production: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/35815935741 — success
- Cloudflare version: 9f9d4a36-bebc-40d3-a0a1-3985e15a2f40
- Deployment completed: 2026-09-23 03:51 UTC (10:51 Vietnam)

## Verification
- Production workflow: build, route checks, deployment and smoke all passed.
- Homepage and all four internal application routes: HTTP 200.
- Required security headers: passed.
- Public desktop artwork SHA-256 matches the reviewed local asset: 393df3e80909e40503d25bfc903a4ff6f8d9c3924bae3aab56961859229c9518.
- Browser checks and visual evidence: see VISUAL_QA.md.

## Scope
Original 2D academy artwork, separate desktop/mobile compositions, four interactive application districts, Vietnamese handwritten accents, cloud/petal/light animation, page-wide pause and reduced-motion support. Application upstream URLs remain in the existing registry.

User explicitly authorized GitHub publication and Cloudflare deployment. No other application repository was modified.

## Rollback
Previous production commit: 1ce0a12497f4e583ae8c225331b477769b9c0020.
Previous Cloudflare version: e15ed2b0-8542-41e4-abd8-0d0d6928c887.
