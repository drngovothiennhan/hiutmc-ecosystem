# HIU TMC Ecosystem

Independent source repository for **HIU TMC Ecosystem Hub** at `https://hiutmc.com`.

## Product
A 2D anime-inspired Traditional Medicine ecosystem map connecting:
- Study OS
- A.I Thiệt Chẩn
- Trung Y Văn HIU
- 3D Huyệt vị – Kinh lạc

## Architecture
- Next.js static export
- No SSR / no serverless runtime for the Hub
- Cloudflare Workers Static Assets for production
- Central application registry: `data/apps.ts`
- Production domain: `hiutmc.com`

## Local validation
```bash
npm install
npm run validate:registry
npm run validate:assets
npm run build
npx wrangler deploy --dry-run
```

## Repository boundary
This repository is the **canonical and exclusive source** for HIU TMC Ecosystem Hub.
It must not write into or be merged into the Study OS repository `drngovothiennhan/yhct-hiu-4-0`.

## Release
- `main`: active development / stable integration
- `release-candidate`: frozen tested candidate
- `production`: Cloudflare deployment branch

See `PROJECT_EXECUTION_PROMPT.md`, `RELEASE_CHECKLIST.md`, `CLOUDFLARE_RELEASE_SETUP.md` and `APP_ONBOARDING.md`.


## Current dashboard direction
The CP7 student dashboard is the production source of truth. The old oversized ecosystem map is removed from the main task flow and replaced in the approved prototype by a compact, low-cost 2D avatar campus. Avatar preferences are browser-local only; Study OS remains the member sign-in source until a secure cross-app SSO flow is implemented.
