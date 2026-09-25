# HIU TMC Hub ↔ StudyOS Library

## Current implementation

- The Hub remains a static Next.js export.
- The Hub catalog calls the configured StudyOS upstream with the existing member access token. The token is refreshed by the existing Hub SSO bridge.
- The catalog shows published records and searches only bibliographic metadata supplied by StudyOS: title, author, subject/topic, keywords/tags, and MIME type.
- A details panel shows available metadata. Missing metadata stays blank; no titles, authors, subjects, or keywords are generated.
- PDF records open in a canvas-based PDF.js reader. Page navigation, zoom, fullscreen, loading and error states are provided. The Hub UI has no download or print controls.
- Other formats remain visible in the catalog and open the matching StudyOS research route using `resourceKey` and the existing SSO bridge.
- StudyOS reads the `resourceKey` query and highlights the matching published record in its research catalog.

## Protected PDF request flow

1. Hub obtains a current member token through the existing SSO session.
2. Hub requests the StudyOS catalog with that bearer token.
3. For a PDF, PDF.js requests content ranges from the existing StudyOS resources API route.
4. StudyOS verifies approved member access on each request.
5. A server-only RPC returns a private Drive locator only when the resource is currently published for members.
6. StudyOS fetches the PDF bytes from Google Drive server-side and returns bounded byte ranges to the reader.

The browser does not receive a Drive URL or the service-role key. Responses are private/no-store and the API allows the production Hub origins. When a file is sent to a browser, screenshots and technical extraction cannot be prevented absolutely.

## Release prerequisites

- Apply `20260925115111_protected_learning_resource_reader.sql` in the intended non-production test database first.
- Configure `SUPABASE_SERVICE_ROLE_KEY` and `GOOGLE_SERVICE_ACCOUNT_JSON` in the StudyOS server environment. Never place either value in Hub variables or browser code.
- Register and publish a real PDF with audience `members` in the test environment, then verify member, non-member, draft, archived, unsupported MIME, and byte-range cases.
- Deploy the StudyOS backend before the Hub release. The Hub branch CI build passed; the StudyOS Web CI passed on run #1127.
- The connected production database was observed with zero learning-resource rows. No sample rows were created, no production migration was run, and no production deployment was made.

## Boundaries

- Hub search is metadata-only; it does not search document text or replace StudyOS research tools.
- The protected byte API currently supports Drive-hosted PDF resources.
- No watermark, download-prevention guarantee, full-text search, or unsupported-format reader is implemented.
