import { communityBackend } from "../data/community-backend.ts";

const params = new URLSearchParams({
  select: "id,title,abstract,tags,specialty,post_type,created_at,mod_verified_at,citation_verified,moderation_status,visibility,privacy_scrubbed,is_spam",
  moderation_status: "eq.approved",
  visibility: "eq.public",
  privacy_scrubbed: "eq.true",
  citation_verified: "eq.true",
  is_spam: "eq.false",
  order: "created_at.desc",
  limit: "10"
});

const response = await fetch(`${communityBackend.url}/rest/v1/${communityBackend.table}?${params.toString()}`, {
  headers: {
    apikey: communityBackend.publishableKey,
    Accept: "application/json"
  }
});

if (!response.ok) throw new Error(`Community backend returned HTTP ${response.status}`);
const rows = await response.json();
if (!Array.isArray(rows)) throw new Error("Community backend did not return an array");

for (const row of rows) {
  if (
    row.moderation_status !== "approved" ||
    row.visibility !== "public" ||
    row.privacy_scrubbed !== true ||
    row.citation_verified !== true ||
    row.is_spam !== false
  ) {
    throw new Error(`Unsafe Community row returned: ${row.id ?? "<unknown>"}`);
  }
}

console.log(`Community backend contract passed with ${rows.length} safe public rows.`);
