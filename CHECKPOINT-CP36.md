# CP36 — Personalized Study OS recommendations

## Change

- The home page reads the authenticated member's encrypted Study OS snapshot using the existing `learning-sync?snapshot=1` endpoint.
- Recommendations use the actual latest Study OS activity timestamp/module and adaptive review cards (`subject`, `topic`, `due`, `streak`, `lastAttempt`).
- “Hôm nay nên ôn gì” renders the actual due/soon-due topics and streak-0 topics; it has an honest empty state when no topic-level review evidence exists.
- No model is asked to invent performance or curriculum data. Y Quán remains excluded because the current Game Hub integration does not expose per-topic outcomes to Ecosystem.
- Added a dedicated deterministic selector test and included it in both `npm run check` and the Cloudflare production release gate.

## Verification

- `npm run validate:personalization` — pass.
- `npm run check` — pass on the production branch base, including TypeScript build, gateway checks, traffic tests, and approved release validation.
- Production deployment and `npm run smoke:production` remain required after merge to `production`.

## Boundaries

- The available snapshot has no lesson-level in-progress/completed status or historical daily quiz score by topic. The UI does not claim to know either; it resumes the Study OS entry point or recommends based on real adaptive review cards.
- Cross-hub Y Quán personalization is deferred until both hubs write verified learner activity to a shared, member-scoped contract.
