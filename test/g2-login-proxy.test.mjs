import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";

const origin = "https://preview.example.workers.dev";

function request({ method = "POST", headers = {}, body = "" } = {}) {
  return new Request(`${origin}/api/g2-member-login`, {
    method,
    headers: { origin, "content-type": "application/json", ...headers },
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
}

test("preview login proxy stays disabled outside the isolated preview", async () => {
  const response = await worker.fetch(request({ body: JSON.stringify({ studentCode: "test", password: "fake" }) }), {
    G2_SSO_PREVIEW: "0",
  });
  assert.equal(response.status, 404);
});

test("preview login proxy rejects wrong origin and methods without forwarding", async () => {
  const wrongOrigin = request({
    headers: { origin: "https://attacker.example" },
    body: JSON.stringify({ studentCode: "test", password: "fake" }),
  });
  assert.equal((await worker.fetch(wrongOrigin, { G2_SSO_PREVIEW: "1" })).status, 403);
  assert.equal((await worker.fetch(request({ method: "GET" }), { G2_SSO_PREVIEW: "1" })).status, 405);
});

test("preview login proxy validates input and forwards only bounded credentials", async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ access_token: "mock-access" }, { status: 200 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const invalid = request({ body: "{" });
  assert.equal((await worker.fetch(invalid, { G2_SSO_PREVIEW: "1" })).status, 400);
  assert.equal(calls.length, 0);

  const validRequest = request({
    headers: { "cf-connecting-ip": "203.0.113.7" },
    body: JSON.stringify({ studentCode: "  123456  ", password: "test-only-password", extra: "discard" }),
  });
  const response = await worker.fetch(validRequest, { G2_SSO_PREVIEW: "1" });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.map(({ url }) => url), [
    "https://gzmpnsrwqjpsbklyflqr.supabase.co/functions/v1/member-login",
  ]);
  assert.deepEqual(JSON.parse(calls[0].init.body), { studentCode: "123456", password: "test-only-password" });
  assert.equal(calls[0].init.headers["x-forwarded-for"], "203.0.113.7");
  assert.equal(calls[0].init.headers.apikey, "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
