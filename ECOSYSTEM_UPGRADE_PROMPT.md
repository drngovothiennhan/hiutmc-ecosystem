# MASTER EXECUTION PROMPT — HIU YHCT ECOSYSTEM UPGRADE

## Mission
Upgrade only `drngovothiennhan/hiutmc-ecosystem` into a student-first YHCT ecosystem supporting **learning, academic exchange, and timely information**. Preserve stable integrations, use the current Cloudflare architecture, and do not modify other repositories.

## Non-negotiable rules
1. Work in small milestones. Every milestone must end with: validation → build → CI → checkpoint commit → monitoring link.
2. Never publish invented statistics, events, users, research claims, or learning outcomes.
3. Existing upstream applications must open directly; do not add confirmation dialogs.
4. Mobile-first: no horizontal overflow, touch targets >= 44px where practical, usable at 360px viewport.
5. Preserve PWA, offline fallback, current app registry, security headers, and rollback path.
6. Do not replace a working subsystem just for visual consistency.
7. Production promotion only after CI passes. If production smoke fails, diagnose/retry before continuing.
8. Each checkpoint must record commit SHA, CI run, production run/version when available, verified routes, and rollback SHA.

## Approved target information architecture
- Home / Student Hub
- Learn / Learning Center
- Atlas / 3D Kinh lạc – Huyệt vị
- AI Lab
- Community
- Discover
- Personal area only when authentication/data are actually available

## Milestones
### CP1 — Student Hub foundation
- Simplify navigation.
- Hero focused on Học tập • Kết nối • Cập nhật.
- Fast access to Study OS, Atlas, AI Thiệt Chẩn, Trung Y Văn.
- Add learning, community and discover preview zones without pretending unavailable backend features are live.
- Keep direct app navigation, PWA and club contact information.

### CP2 — Learning Center portal
- Subject/topic navigation shell.
- “Học 15 phút” launch path into existing Study OS.
- Resource categories: bài học, quiz, flashcard, thư viện, Atlas, AI.
- Search entry point routed to existing reliable services only.

### CP3 — AI Lab + contextual routing
- One AI Lab landing surface.
- Clearly separate general study assistance from specialized tools.
- Add safe educational labels and direct deep links where upstream apps support them.

### CP4 — Community + Discover
- Academic-room taxonomy and study-group/case-lab presentation layer.
- Clearly mark features requiring future backend as “Đang phát triển”.
- Club news/research/event discovery shell with source links; never fabricate content.

### CP5 — Release hardening
- Accessibility, responsive QA, PWA QA, route checks, performance cleanup.
- Remove obsolete duplicate presentation code only after visual parity is confirmed.
- Final production checkpoint and rollback record.

## Acceptance gates for every checkpoint
- `npm run validate:repo`
- `npm run validate:registry`
- `npm run validate:assets`
- `npm run build`
- Cloudflare dry-run
- Required route export check
- Production smoke after deploy
- No fake data and no broken upstream links

## Reporting format
For each checkpoint report only:
- DONE / BLOCKED
- commit SHA
- CI link + result
- production link + result
- user-visible changes
- rollback SHA
- next checkpoint

Continue automatically to the next approved checkpoint after the previous checkpoint is stable.
