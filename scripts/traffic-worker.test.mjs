import test from "node:test";
import assert from "node:assert/strict";
import worker, { VisitCounter } from "../worker.mjs";

function makeStorage() {
  const values = new Map();
  return {
    values,
    async get(key) { return values.get(key); },
    async put(keyOrValues, value) {
      if (typeof keyOrValues === "object") for (const [key, item] of Object.entries(keyOrValues)) values.set(key, item);
      else values.set(keyOrValues, value);
    },
    async delete(key) { return values.delete(key); },
    async transaction(callback) {
      const tx = {
        get: async (key) => values.get(key),
        put: async (keyOrValues, value) => this.put(keyOrValues, value),
        delete: async (key) => this.delete(key),
      };
      return callback(tx);
    },
  };
}

function mockVisits(stats = { totalVisits: 21, todayVisits: 3, dailyVisits: [] }) {
  const calls = [];
  const namespace = {
    idFromName(name) { return name; },
    get(id) {
      assert.equal(id, "hiutmc-public-pages-v1");
      return { async fetch(input, init) {
        calls.push({ url: String(input), method: init?.method || "GET" });
        return String(input).endsWith("/stats")
          ? Response.json(stats)
          : new Response(null, { status: 202 });
      } };
    },
  };
  return { namespace, calls };
}

async function mockAdminAuth(role = "admin") {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    if (String(input).includes("/auth/v1/user")) return Response.json({ id: "verified-user-id" });
    if (String(input).includes("/rest/v1/club_members")) return Response.json([{
      id: "verified-member-id", full_name: "Verified Admin", student_code: "test", role,
      status: "approved", login_enabled: true, data_conflict: false,
    }]);
    throw new Error(`Unexpected auth request: ${String(input)}`);
  };
  return () => { globalThis.fetch = originalFetch; };
}

test("public HTML document requests increment the counter in the background", async () => {
  const visits = mockVisits();
  const pending = [];
  const env = {
    VISITS: visits.namespace,
    ASSETS: { fetch: async () => new Response("home", { headers: { "content-type": "text/html" } }) },
  };
  const response = await worker.fetch(
    new Request("https://hiutmc.com/learn/", { headers: { accept: "text/html" } }),
    env,
    { waitUntil(promise) { pending.push(promise); } },
  );
  await Promise.all(pending);
  assert.equal(response.status, 200);
  assert.deepEqual(visits.calls, [{ url: "https://traffic.internal/visit", method: "POST" }]);
});

test("non-page, API, admin, mod and foreign-origin requests are not counted", async () => {
  const candidates = [
    new Request("https://hiutmc.com/icons/icon.png", { headers: { accept: "image/avif" } }),
    new Request("https://hiutmc.com/learn/", { headers: { accept: "text/html", purpose: "prefetch" } }),
    new Request("https://hiutmc.com/learn/", { headers: { accept: "text/html", "sec-fetch-dest": "image" } }),
    new Request("https://hiutmc.com/api/staff/access", { headers: { accept: "text/html" } }),
    new Request("https://hiutmc.com/admin/", { headers: { accept: "text/html" } }),
    new Request("https://elsewhere.test/", { headers: { accept: "text/html" } }),
  ];
  for (const request of candidates) {
    const visits = mockVisits();
    const pending = [];
    await worker.fetch(request, {
      VISITS: visits.namespace,
      ASSETS: { fetch: async () => new Response("ok") },
    }, { waitUntil(promise) { pending.push(promise); } });
    await Promise.all(pending);
    assert.equal(visits.calls.length, 0);
  }
});

test("anonymous visitors cannot read Admin traffic statistics", async () => {
  const visits = mockVisits();
  const response = await worker.fetch(new Request("https://hiutmc.com/api/admin/traffic"), {
    VISITS: visits.namespace,
    ASSETS: { fetch: async () => new Response("unused") },
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { authorized: false, reason: "missing_token" });
  assert.equal(visits.calls.length, 0);
});

test("only a server-verified Admin can read traffic statistics", async (t) => {
  const restoreFetch = await mockAdminAuth("admin");
  t.after(restoreFetch);
  const visits = mockVisits();
  const response = await worker.fetch(new Request("https://hiutmc.com/api/admin/traffic", {
    headers: { authorization: "Bearer verified-session-token-with-more-than-forty-characters" },
  }), {
    VISITS: visits.namespace,
    ASSETS: { fetch: async () => new Response("unused") },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { totalVisits: 21, todayVisits: 3, dailyVisits: [] });
  assert.deepEqual(visits.calls, [{ url: "https://traffic.internal/stats", method: "GET" }]);
});

test("a Moderator cannot read Admin traffic statistics", async (t) => {
  const restoreFetch = await mockAdminAuth("mod");
  t.after(restoreFetch);
  const visits = mockVisits();
  const response = await worker.fetch(new Request("https://hiutmc.com/api/admin/traffic", {
    headers: { authorization: "Bearer verified-session-token-with-more-than-forty-characters" },
  }), {
    VISITS: visits.namespace,
    ASSETS: { fetch: async () => new Response("unused") },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { authorized: false, reason: "admin_required" });
  assert.equal(visits.calls.length, 0);
});

test("Durable Object atomically stores total and daily counts", async () => {
  const storage = makeStorage();
  const counter = new VisitCounter({ storage });
  for (let i = 0; i < 3; i += 1) {
    const response = await counter.fetch(new Request("https://traffic.internal/visit", { method: "POST" }));
    assert.equal(response.status, 202);
  }
  const response = await counter.fetch(new Request("https://traffic.internal/stats"));
  const stats = await response.json();
  assert.equal(stats.totalVisits, 3);
  assert.equal(stats.todayVisits, 3);
  assert.equal(stats.dailyVisits.length, 7);
  assert.equal(stats.dailyVisits.at(-1).visits, 3);
});
