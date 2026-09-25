const SUPABASE_URL = "https://gzmpnsrwqjpsbklyflqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG";
const COOKIE_NAME = "hiutmc_staff_session";
const STAFF_ROLES = new Set(["mod", "super_mod", "admin"]);

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function bearer(request) {
  const value = request.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function staffCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2700`;
}

function clearStaffCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

async function validateStaff(token) {
  if (!token || token.length < 40) return { authorized: false, reason: "missing_token" };

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${token}`,
    },
  });
  if (!userResponse.ok) return { authorized: false, reason: "invalid_session" };

  const user = await userResponse.json();
  const userId = String(user?.id || "");
  if (!userId) return { authorized: false, reason: "invalid_session" };

  const url = new URL(`${SUPABASE_URL}/rest/v1/club_members`);
  url.searchParams.set("select", "id,student_code,full_name,role,position_title,status,login_enabled,data_conflict");
  url.searchParams.set("auth_user_id", `eq.${userId}`);
  url.searchParams.set("limit", "1");

  const profileResponse = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });
  if (!profileResponse.ok) return { authorized: false, reason: "profile_lookup_failed" };

  const rows = await profileResponse.json();
  const member = Array.isArray(rows) ? rows[0] : null;
  if (!member) return { authorized: false, reason: "member_not_found" };

  const role = String(member.role || "member");
  const eligible =
    member.status === "approved" &&
    member.login_enabled !== false &&
    member.data_conflict !== true &&
    STAFF_ROLES.has(role);

  if (!eligible) {
    return {
      authorized: false,
      reason: "insufficient_role",
      role,
      member: {
        id: String(member.id || ""),
        fullName: String(member.full_name || ""),
        studentCode: String(member.student_code || ""),
        title: String(member.position_title || ""),
      },
    };
  }

  return {
    authorized: true,
    role,
    canAdmin: role === "admin",
    canModerate: STAFF_ROLES.has(role),
    member: {
      id: String(member.id || ""),
      fullName: String(member.full_name || ""),
      studentCode: String(member.student_code || ""),
      title: String(member.position_title || ""),
    },
  };
}


async function supabaseRpc(token, name, body = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(async () => ({ error: await response.text().catch(() => "") }));
  return { response, payload };
}

function sameOriginMutation(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === "https://hiutmc.com";
}

async function shadowStaffAccess(request, requiredRole = "mod") {
  const token = bearer(request) || readCookie(request, COOKIE_NAME);
  const access = await validateStaff(token);
  if (!access.authorized) return { ok: false, response: json(access, 401), token: "" };
  if (requiredRole === "admin" && !access.canAdmin) {
    return { ok: false, response: json({ authorized: false, reason: "admin_required" }, 403), token: "" };
  }
  if (requiredRole === "mod" && !access.canModerate) {
    return { ok: false, response: json({ authorized: false, reason: "mod_required" }, 403), token: "" };
  }
  return { ok: true, access, token };
}

function redirectToHome(requiredRole) {
  const suffix = requiredRole === "admin" ? "admin" : "mod";
  return Response.redirect(`https://hiutmc.com/?staff_required=${suffix}`, 302);
}

async function protectedAsset(request, env, requiredRole) {
  const token = readCookie(request, COOKIE_NAME);
  const access = await validateStaff(token);
  if (!access.authorized) return redirectToHome(requiredRole);
  if (requiredRole === "admin" && !access.canAdmin) return redirectToHome("admin");

  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-hiutmc-staff-role", access.role);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function vietnamDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function previousDateKey(dateKey, daysAgo) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day - daysAgo));
  return date.toISOString().slice(0, 10);
}

function shouldCountPageView(request, url) {
  if (request.method !== "GET" || !request.headers.get("accept")?.includes("text/html")) return false;
  if (/prefetch/i.test(`${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`)) return false;
  const destination = request.headers.get("sec-fetch-dest");
  if (destination && destination !== "document") return false;
  if (!/(^|\.)hiutmc\.com$/i.test(url.hostname)) return false;
  if (/^\/(api|admin|mod)(\/|$)/.test(url.pathname)) return false;
  return true;
}

async function recordPageView(env) {
  if (!env.VISITS) return;
  const stub = env.VISITS.get(env.VISITS.idFromName("hiutmc-public-pages-v1"));
  await stub.fetch("https://traffic.internal/visit", { method: "POST" });
}

async function getTrafficStats(env) {
  if (!env.VISITS) return null;
  const stub = env.VISITS.get(env.VISITS.idFromName("hiutmc-public-pages-v1"));
  const response = await stub.fetch("https://traffic.internal/stats", { method: "GET" });
  if (!response.ok) return null;
  return response.json();
}

export class VisitCounter {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/visit" && request.method === "POST") {
      const today = vietnamDateKey();
      await this.ctx.storage.transaction(async (txn) => {
        const total = Number(await txn.get("total") || 0);
        const visitsToday = Number(await txn.get(`day:${today}`) || 0);
        await txn.put({ total: total + 1, [`day:${today}`]: visitsToday + 1 });

        if (await txn.get("lastPrunedDay") !== today) {
          const cutoff = previousDateKey(today, 30);
          const dayEntries = await txn.list({ prefix: "day:" });
          for (const key of dayEntries.keys()) {
            if (key.slice(4) < cutoff) await txn.delete(key);
          }
          await txn.put("lastPrunedDay", today);
        }
      });
      return json({ ok: true }, 202);
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const today = vietnamDateKey();
      const daily = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = previousDateKey(today, offset);
        daily.push({ date, visits: Number(await this.ctx.storage.get(`day:${date}`) || 0) });
      }
      return json({ totalVisits: Number(await this.ctx.storage.get("total") || 0), todayVisits: daily.at(-1)?.visits || 0, dailyVisits: daily });
    }

    return json({ error: "Not found" }, 404);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;

    if (pathname === "/api/staff/session") {
      if (request.method === "DELETE") {
        return json({ ok: true }, 200, { "set-cookie": clearStaffCookie() });
      }
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

      const token = bearer(request);
      const access = await validateStaff(token);
      if (!access.authorized) {
        return json({ ...access, authorized: false }, 200, { "set-cookie": clearStaffCookie() });
      }
      return json(access, 200, { "set-cookie": staffCookie(token) });
    }

    if (pathname === "/api/staff/access") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const token = bearer(request) || readCookie(request, COOKIE_NAME);
      const access = await validateStaff(token);
      return json(access, access.authorized ? 200 : 401);
    }

    if (pathname === "/api/admin/traffic") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const gate = await shadowStaffAccess(request, "admin");
      if (!gate.ok) return gate.response;
      const stats = await getTrafficStats(env);
      if (!stats) return json({ error: "Traffic counter unavailable" }, 503);
      return json(stats);
    }


    if (pathname === "/api/staff/shadow/snapshot") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const gate = await shadowStaffAccess(request, "mod");
      if (!gate.ok) return gate.response;
      const { response, payload } = await supabaseRpc(gate.token, "ecosystem_staff_snapshot");
      return json({ shadow: "cp23", data: payload }, response.ok ? 200 : response.status);
    }

    if (pathname === "/api/staff/shadow/hub-draft") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (!sameOriginMutation(request)) return json({ error: "Invalid origin" }, 403);
      const gate = await shadowStaffAccess(request, "admin");
      if (!gate.ok) return gate.response;
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);
      const { response, payload } = await supabaseRpc(gate.token, "ecosystem_admin_save_hub_draft", {
        p_hub_slug: String(body.hubSlug || ""),
        p_draft: body.draft && typeof body.draft === "object" ? body.draft : {},
        p_expected_revision: body.expectedRevision === null || body.expectedRevision === undefined ? null : Number(body.expectedRevision),
      });
      return json({ shadow: "cp23", data: payload }, response.ok ? 200 : response.status);
    }

    if (pathname === "/api/staff/shadow/moderation") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (!sameOriginMutation(request)) return json({ error: "Invalid origin" }, 403);
      const gate = await shadowStaffAccess(request, "mod");
      if (!gate.ok) return gate.response;
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);

      if (body.action === "submit") {
        const { response, payload } = await supabaseRpc(gate.token, "ecosystem_mod_submit_queue", {
          p_item_type: String(body.itemType || "other"),
          p_hub_slug: body.hubSlug ? String(body.hubSlug) : null,
          p_payload: body.payload && typeof body.payload === "object" ? body.payload : {},
        });
        return json({ shadow: "cp23", data: payload }, response.ok ? 200 : response.status);
      }

      if (body.action === "review") {
        const { response, payload } = await supabaseRpc(gate.token, "ecosystem_mod_review_queue", {
          p_id: String(body.id || ""),
          p_status: String(body.status || ""),
        });
        return json({ shadow: "cp23", data: payload }, response.ok ? 200 : response.status);
      }

      return json({ error: "Unknown moderation action" }, 400);
    }

    if (pathname === "/admin") {
      return protectedAsset(request, env, "admin");
    }

    if (pathname === "/mod") {
      return protectedAsset(request, env, "mod");
    }

    if (shouldCountPageView(request, url) && ctx?.waitUntil) {
      ctx.waitUntil(recordPageView(env).catch(() => undefined));
    }

    return env.ASSETS.fetch(request);
  },
};
