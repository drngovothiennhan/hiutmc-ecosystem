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

function redirectToHome(requiredRole) {
  const suffix = requiredRole === "admin" ? "admin" : "mod";
  return Response.redirect(`https://hiutmc.com/?staff_required=${suffix}`, 302);
}

async function protectedAsset(request, env, requiredRole, assetPath) {
  const token = readCookie(request, COOKIE_NAME);
  const access = await validateStaff(token);
  if (!access.authorized) return redirectToHome(requiredRole);
  if (requiredRole === "admin" && !access.canAdmin) return redirectToHome("admin");

  if (assetPath) {
    const target = new URL(request.url);
    target.pathname = assetPath;
    target.search = "";
    const response = await env.ASSETS.fetch(new Request(target, request));
    const headers = new Headers(response.headers);
    headers.set("cache-control", "private, no-store");
    headers.set("x-hiutmc-staff-role", access.role);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-hiutmc-staff-role", access.role);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/staff/session") {
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

    if (url.pathname === "/api/staff/access") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const token = bearer(request) || readCookie(request, COOKIE_NAME);
      const access = await validateStaff(token);
      return json(access, access.authorized ? 200 : 401);
    }

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      return protectedAsset(request, env, "admin");
    }

    if (url.pathname === "/mod" || url.pathname === "/mod/") {
      return protectedAsset(request, env, "mod", "/admin/");
    }

    return env.ASSETS.fetch(request);
  },
};
