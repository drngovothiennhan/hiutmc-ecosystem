# Direct navigation, contacts and PWA — 23 September 2026

## Changes
- All 12 homepage application links (map, quick dock, app cards) open the registry's upstream URL immediately in the same tab. No confirmation or district popup.
- Existing internal detail URLs remain available for compatibility.
- Contact information uses the exact email, fanpage name, TikTok handle and address supplied by the user. A Facebook URL was not invented.
- The manifest has a stable root ID, standalone display, real 192/512 PNG icons and an Apple touch icon.
- Native installation offers use beforeinstallprompt. iOS gets manual Safari instructions. The reminder is dismissible for seven days; a small reopen button remains. Standalone launch and appinstalled suppress reminders. Storage restrictions do not break navigation.
- A newly emitted browser installation offer overrides a stale local installation marker. Browser/OS support limits the ability to detect installation from a regular browser tab; this is not a universal device-wide installation detector.
- Service worker uses network-first navigation with a small offline fallback. It does not cache app content or intercept other origins. Its cache cleanup only touches this app's cache prefix.
- No-cache headers protect worker/manifest updates. CI and production checks validate PWA assets, PNG sizes, direct links and contacts.

## Branding pending
No new logo attachment arrived in this request. The only current upload is the original layout reference 29852.png. An older generated logo found in Library was not substituted for the requested attachment. Existing botanical identity remains, with raster icons exported from the current SVG. The official replacement, external white-border removal and centering await the actual logo file.

## Browser references
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://web.dev/learn/pwa/installation-prompt/

## Verification
Evidence is added after the integrated browser checks. Simulated installation events test UI logic; they do not constitute installation on a physical Android/iOS device.

Integrated local checks passed: TypeScript/build; manifest and icon validation; Chromium installability returned an empty error list; direct navigation destination; exact supplied contacts; synthetic install/dismiss/installed lifecycle; seven-day reminder suppression; responsive layout at 1440/768/390/360 px; actual offline fallback after stopping the local web server and recovery after restarting it; emulated iOS instructions; standalone suppression; no client exceptions.
