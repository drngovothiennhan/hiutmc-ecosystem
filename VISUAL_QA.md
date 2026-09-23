# Illustrated academy QA — 2026-09-23

## Build and release
- Repository, registry and asset validation passed.
- TypeScript and Next.js static export passed.
- Cloudflare dry run and production deployment passed.
- CI 35815910062 and production workflow 35815935741: success.
- Production smoke verified HTTP 200 on / and all four application detail routes, with required security headers.

## Browser verification
Local candidate and live website checked in Chromium at 1440, 768, 390 and 360 px.
- No horizontal overflow.
- Desktop image decoded at 1774 × 887, mobile at 1536 × 1024.
- All four district buttons: click, Enter and Escape checked.
- Pause control and prefers-reduced-motion passed.
- No client JavaScript exceptions.
- Screenshots reviewed; earlier mobile CTA and tablet headline overlap corrected.
- All four local app detail routes showed the upstream CTA.

The browser's native connection to the public host timed out in this environment. Live browser requests were therefore fetched from the actual HTTPS domain using curl through the environment proxy and fulfilled into Chromium; no local site responses were substituted. CI independently tested the real public domain. The downloaded desktop artwork SHA-256 exactly matched the reviewed asset.

## Visual limits
The page reconstructs the reference's composition and style. Numerical 95% similarity has not been measured and is not claimed. No Lighthouse score is asserted.
