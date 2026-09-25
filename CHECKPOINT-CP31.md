# CP31 — Admin-only traffic counter

- Base production commit: `5ccb76683f8de06fe56bcaef00d8bd881a4ed5f0` (CP30).
- Scope: add a persistent count of public HTML page views to the existing Admin Center.
- Counting: GET document requests for `hiutmc.com` public routes only; static assets, APIs, Admin/Mod pages, non-GET requests and other hosts are excluded.
- Storage: one Cloudflare Durable Object with SQLite-backed storage; lifetime total and daily counts for the most recent 31 days, displayed as the current day and seven-day trend in Vietnam time.
- Privacy: no IP addresses, user agents, account IDs or device identifiers are stored. This measures page views, not unique visitors.
- Access control: `/api/admin/traffic` checks the existing Supabase session and requires the canonical `admin` role in the Cloudflare Worker. The Mod Center does not show the traffic tab.
- Verification: unit tests cover counting, exclusions, anonymous denial, Admin access and Mod denial; CI/build, Wrangler dry-run, deploy and production smoke are required.
- Deployment state: live on production. GitHub Actions deploy and production smoke passed in run #46 for commit `9fc99e3acc1698935e723fbe6d2fcf7599cefc77`.
- Cloudflare Worker version: `8225f14e-757c-4f6e-9936-2c3435f184d8`.
- Run evidence: https://github.com/drngovothiennhan/hiutmc-ecosystem/actions/runs/36078439597
