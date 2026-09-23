# CP14 — UI refinement checkpoint

- **Base:** CP13, `93331d29fb0c0ca17687bdeefbe1c11190ceaa71`
- **Repository:** `drngovothiennhan/hiutmc-ecosystem`
- **Production target:** `https://hiutmc.com` (Cloudflare Workers Static Assets)
- **Assistant:** remains hidden as required by CP13.
- **Release status:** prepared for review; not deployed.

## Changes

- Use the approved transparent HIU YHCT Club logo in the homepage navigation without stretching it.
- Reduce the mobile masthead and keep the Mobile/PC switch in the header flow, with the current mode announced to assistive technology.
- Improve mobile Hub cards and enlarge the five item dock, including safe-area and bottom-content spacing.
- Record CP14 in `RELEASE.json` with CP13 as its base.
- Extend the approved-release validator for the approved logo, visible mode state, in-flow mobile switch and dock targets.

## Files

- `app/page.tsx`
- `app/globals.css`
- `components/DisplayModeToggle.tsx`
- `scripts/validate-approved-release.mjs`
- `RELEASE.json`
- `CHECKPOINT-CP14.md`

## Verification

- `npm run check` — passed, including all repository validators, TypeScript, static production build and approved-release checks.
- `npm run smoke:production` against the current CP13 production — passed for 11 routes, security headers, app destinations, PWA assets and hidden assistant.
- CP14 viewport rendering at 360×800, 390×844, tablet and desktop — pending. Chromium is unavailable in the execution environment, and its browser download returned an empty archive. Production deployment is held until this visual gate can run.
