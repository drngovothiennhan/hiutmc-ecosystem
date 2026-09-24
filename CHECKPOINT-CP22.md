# CHECKPOINT CP22 — ZALO / SOCIAL LINK PREVIEW

Date: 2026-09-24

## Base
- CP21 production: `3ebe01e53e4d732eed12fa37810ce7c4ba355d48`

## Share preview
- Canonical URL: https://hiutmc.com
- Open Graph title: `HIU YHCT Ecosystem – Cổng học tập Y học cổ truyền HIU`
- Open Graph description: `Study OS · Atlas 3D · A.I Thiệt Chẩn · Trung Y Văn · cộng đồng học thuật dành cho sinh viên Y học cổ truyền HIU.`
- Preview image: `https://hiutmc.com/icons/icon-512.png?share=cp22`
- Image format: PNG, 512 × 512.
- Twitter summary metadata mirrors the same title, description and image.
- `robots.txt` allows link-preview crawlers.

## Validation
- Static export must contain `og:title`, `og:description`, `og:image` and Twitter card metadata.
- Production smoke fetches the homepage with a Zalo-like user-agent and verifies the Open Graph fields.
- Production smoke verifies that the preview PNG is reachable and at least 300 × 300.
- CP21 Admin/Mod server authorization smoke remains mandatory.

## Cache note
Social platforms can cache link previews. The preview image URL is versioned with `?share=cp22` to avoid reusing a stale image cache. If Zalo has cached the page URL itself, sharing the URL with a temporary query string once can force a fresh crawl without changing the canonical URL.
