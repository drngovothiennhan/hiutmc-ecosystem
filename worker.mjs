const SUPABASE_URL = "https://gzmpnsrwqjpsbklyflqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4hMhXROZ-aVgWoaQ5fFKQ_ZAcXuIzG";
const COOKIE_NAME = "hiutmc_staff_session";
const STAFF_ROLES = new Set(["mod", "super_mod", "admin"]);
const APP_PROXY_CONFIG = Object.freeze({
  study: {
    prefix: "/apps/study",
    upstreamOrigin: "https://yhct-hiu-final4-stage-hiu-yhct.vercel.app",
    upstreamBase: "",
  },
  thietchan: {
    prefix: "/apps/thietchan",
    upstreamOrigin: "https://ai-thiet-chan-hiu-yhct.vercel.app",
    upstreamBase: "",
  },
  trungyvan: {
    prefix: "/apps/trungyvan",
    upstreamOrigin: "https://drngovothiennhan.github.io",
    upstreamBase: "/trung-y-van-hiu",
  },
  atlas: {
    prefix: "/apps/atlas",
    upstreamOrigin: "https://drngovothiennhan.github.io",
    upstreamBase: "/human-atlas",
  },
});


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


function proxyConfigForPath(pathname) {
  return Object.entries(APP_PROXY_CONFIG).find(([, config]) =>
    pathname === config.prefix || pathname.startsWith(config.prefix + "/")
  ) || null;
}

function proxyConfigFromReferer(request) {
  const raw = request.headers.get("referer") || "";
  if (!raw) return null;
  try {
    const ref = new URL(raw);
    if (ref.origin !== "https://hiutmc.com") return null;
    return proxyConfigForPath(ref.pathname);
  } catch {
    return null;
  }
}

function joinProxyPath(base, suffix) {
  const left = base && base !== "/" ? base.replace(/\/+$/, "") : "";
  const right = suffix.startsWith("/") ? suffix : "/" + suffix;
  return (left + right).replace(/\/{2,}/g, "/") || "/";
}

function rewriteProxyLocation(location, config) {
  if (!location) return location;
  try {
    const resolved = new URL(location, config.upstreamOrigin);
    const upstream = new URL(config.upstreamOrigin);
    if (resolved.origin !== upstream.origin) return location;
    let pathname = resolved.pathname;
    if (config.upstreamBase && pathname.startsWith(config.upstreamBase)) {
      pathname = pathname.slice(config.upstreamBase.length) || "/";
    }
    return "https://hiutmc.com" + config.prefix + (pathname.startsWith("/") ? pathname : "/" + pathname) + resolved.search + resolved.hash;
  } catch {
    return location;
  }
}

function proxyBridgeScript(prefix) {
  const encoded = JSON.stringify(prefix);
  return `<script>(()=>{const P=${encoded};const m=v=>typeof v==="string"&&v.startsWith("/")&&!v.startsWith("//")&&!v.startsWith(P+"/")?P+v:v;const f=window.fetch.bind(window);window.fetch=(input,init)=>{if(typeof input==="string")return f(m(input),init);if(input instanceof Request){try{const u=new URL(input.url);if(u.origin===location.origin&&!u.pathname.startsWith(P+"/")&&u.pathname!==P){const next=P+u.pathname+u.search+u.hash;input=new Request(next,input)}}catch{}}return f(input,init)};const xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url,...rest){return xo.call(this,method,m(String(url)),...rest)};for(const k of ["pushState","replaceState"]){const o=history[k].bind(history);history[k]=function(state,title,url){return o(state,title,typeof url==="string"?m(url):url)}}document.addEventListener("click",e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target instanceof Element?e.target.closest("a[href]"):null;if(!a)return;const raw=a.getAttribute("href")||"";if(raw.startsWith("/")&&!raw.startsWith("//")&&!raw.startsWith(P+"/")){e.preventDefault();location.assign(P+raw)}},true);try{const sw=navigator.serviceWorker;if(sw&&sw.register){const r=sw.register.bind(sw);sw.register=(url,opt={})=>r(m(String(url)),{...opt,scope:opt.scope?m(String(opt.scope)):P+"/"})}}catch{}})();</script>`;
}

class ProxyUrlRewriter {
  constructor(prefix) { this.prefix = prefix; }
  element(element) {
    for (const name of ["href", "src", "action", "poster"]) {
      const value = element.getAttribute(name);
      if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith(this.prefix + "/")) {
        element.setAttribute(name, this.prefix + value);
      }
    }
    const srcset = element.getAttribute("srcset");
    if (srcset) {
      element.setAttribute("srcset", srcset.split(",").map((part) => {
        const bits = part.trim().split(/\s+/);
        if (bits[0]?.startsWith("/") && !bits[0].startsWith("//") && !bits[0].startsWith(this.prefix + "/")) {
          bits[0] = this.prefix + bits[0];
        }
        return bits.join(" ");
      }).join(", "));
    }
  }
}

class ProxyHeadInjector {
  constructor(prefix) { this.prefix = prefix; }
  element(element) {
    element.prepend(`<base href="${this.prefix}/">${proxyBridgeScript(this.prefix)}`, { html: true });
  }
}

async function rewriteProxyManifest(response, config) {
  try {
    const manifest = await response.json();
    const prefix = config.prefix + "/";
    manifest.id = prefix;
    manifest.start_url = prefix;
    manifest.scope = prefix;
    if (Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map((icon) => {
        if (!icon || typeof icon !== "object") return icon;
        const src = String(icon.src || "");
        if (!src || /^https?:\/\//i.test(src) || src.startsWith("data:")) return icon;
        const cleaned = src.replace(/^\.\//, "").replace(/^\//, "");
        return { ...icon, src: prefix + cleaned };
      });
    }
    return new Response(JSON.stringify(manifest), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return response;
  }
}

async function proxyEcosystemApp(request, url, config, suffixOverride = null) {
  const suffix = suffixOverride ?? (url.pathname.slice(config.prefix.length) || "/");
  const target = new URL(config.upstreamOrigin);
  target.pathname = joinProxyPath(config.upstreamBase, suffix);
  target.search = url.search;

  const proxyRequest = new Request(target.toString(), request);
  proxyRequest.headers.delete("cookie");
  proxyRequest.headers.delete("host");
  proxyRequest.headers.delete("cf-connecting-ip");
  proxyRequest.headers.delete("cf-ray");
  proxyRequest.headers.delete("x-forwarded-for");
  proxyRequest.headers.set("x-hiutmc-gateway", "same-origin-pwa-v1");
  if (proxyRequest.headers.has("origin")) proxyRequest.headers.set("origin", target.origin);
  if (proxyRequest.headers.has("referer")) proxyRequest.headers.set("referer", target.origin + target.pathname);

  let upstream;
  try {
    upstream = await fetch(proxyRequest, { redirect: "manual" });
    const acceptsHtml = request.method === "GET" && request.headers.get("accept")?.includes("text/html");
    const routeLike = !/\.[a-z0-9]{1,10}$/i.test(suffix.split("?")[0]);
    if (upstream.status === 404 && acceptsHtml && routeLike) {
      const fallbackTarget = new URL(config.upstreamOrigin);
      fallbackTarget.pathname = joinProxyPath(config.upstreamBase, "/");
      fallbackTarget.search = "";
      const fallbackRequest = new Request(fallbackTarget.toString(), proxyRequest);
      fallbackRequest.headers.set("referer", fallbackTarget.origin + fallbackTarget.pathname);
      upstream = await fetch(fallbackRequest, { redirect: "manual" });
    }
  } catch {
    if (request.method === "GET" && request.headers.get("accept")?.includes("text/html")) {
      return Response.redirect(target.toString(), 302);
    }
    return json({ error: "Connected application temporarily unavailable" }, 502);
  }

  const headers = new Headers(upstream.headers);
  headers.delete("set-cookie");
  headers.set("x-hiutmc-app-gateway", config.prefix);
  const location = headers.get("location");
  if (location) headers.set("location", rewriteProxyLocation(location, config));

  const contentType = (headers.get("content-type") || "").toLowerCase();
  const proxied = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });

  if (request.method !== "GET" || upstream.status === 204 || upstream.status === 304) return proxied;

  if (contentType.includes("text/html")) {
    headers.set("cache-control", "no-store");
    return new HTMLRewriter()
      .on("head", new ProxyHeadInjector(config.prefix))
      .on("a,link,script,img,source,video,audio,form,iframe", new ProxyUrlRewriter(config.prefix))
      .transform(new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      }));
  }

  if (contentType.includes("application/manifest+json") || url.pathname.endsWith("manifest.webmanifest")) {
    return rewriteProxyManifest(proxied, config);
  }

  return proxied;
}

function reservedMainPath(pathname) {
  return /^\/(api\/(staff|admin|hub-registry)|admin|mod)(\/|$)/.test(pathname);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;

    const directProxy = proxyConfigForPath(url.pathname);
    if (directProxy) {
      return proxyEcosystemApp(request, url, directProxy[1]);
    }

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


    const referredProxy = proxyConfigFromReferer(request);
    if (referredProxy && !reservedMainPath(pathname)) {
      const isDocument = request.headers.get("sec-fetch-dest") === "document" || request.headers.get("accept")?.includes("text/html");
      if (!isDocument) return proxyEcosystemApp(request, url, referredProxy[1], url.pathname);
    }

    if (pathname === "/admin") {
      return protectedAsset(request, env, "admin");
    }

    if (pathname === "/mod") {
      return protectedAsset(request, env, "mod");
    }

    return env.ASSETS.fetch(request);
  },
};
