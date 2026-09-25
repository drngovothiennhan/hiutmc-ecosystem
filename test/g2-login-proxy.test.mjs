import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";

const previewOrigin = "https://3f874a2d-hiutmc-ecosystem-g2-sso-preview.dr-ngovothiennhan.workers.dev";

function request({ origin = previewOrigin, method = "POST", headers = {}, body = "" } = {}) {
  return new Request(`${previewOrigin}/api/g2-member-login`, {
    method,
    headers: { origin, "content-type": "application/json", ...headers },
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
}

test("member login proxy is restricted to the dedicated G2 Workers preview host", async () => {
  const productionRequest = new Request("https://hiutmc.com/api/g2-member-login", {
    method: "GET",
    headers: { origin: "https://hiutmc.com" },
  });
  const response = await worker.fetch(productionRequest, {});
  assert.equal(response.status, 404);
});

test("preview login proxy rejects wrong origins and methods without forwarding", async () => {
  const wrongOrigin = request({
    origin: "https://attacker.example",
    body: JSON.stringify({ studentCode: "test", password: "fake" }),
  });
  assert.equal((await worker.fetch(wrongOrigin, {})).status, 403);
  assert.equal((await worker.fetch(request({ method: "GET" }), {})).status, 405);
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
  assert.equal((await worker.fetch(invalid, {})).status, 400);
  assert.equal(calls.length, 0);

  const validRequest = request({
    headers: { "cf-connecting-ip": "203.0.113.7" },
    body: JSON.stringify({ studentCode: "  123456  ", password: "test-only-password", extra: "discard" }),
  });
  const response = await worker.fetch(validRequest, {});
  assert.equal(response.status, 200);
  assert.deepEqual(calls.map(({ url }) => url), [
    "https://gzmpnsrwqjpsbklyflqr.supabase.co/functions/v1/member-login",
  ]);
  assert.deepEqual(JSON.parse(calls[0].init.body), { studentCode: "123456", password: "test-only-password" });
  assert.equal(calls[0].init.headers["x-forwarded-for"], "203.0.113.7");
  assert.equal(calls[0].init.headers.apikey, "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
