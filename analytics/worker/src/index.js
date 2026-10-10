const ALLOWED_EVENTS = new Set([
  "page_view",
  "section_click",
  "internal_link_click",
  "external_link_click",
  "active_time",
  "chat_open",
  "chat_message_sent",
  "chat_response_received",
  "chat_error"
]);
const MAX_BODY_BYTES = 4096;
const MAX_DAYS = 90;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true });
    }
    if (url.pathname === "/tracker.js" && request.method === "GET") {
      return assetResponse(request, env, "/tracker.js");
    }
    if ((url.pathname === "/dashboard" || url.pathname === "/dashboard/") && request.method === "GET") {
      return assetResponse(request, env, "/dashboard.html");
    }
    if (url.pathname === "/v1/events" && (request.method === "POST" || request.method === "OPTIONS")) {
      return handleEvents(request, env, url);
    }
    if (url.pathname === "/v1/summary" && (request.method === "GET" || request.method === "OPTIONS")) {
      return handleSummary(request, env, url);
    }
    return json({ error: "Not found" }, 404);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      env.DB.prepare("DELETE FROM events WHERE created_at < unixepoch() - ?")
        .bind(90 * 24 * 60 * 60)
        .run()
    );
  }
};

async function assetResponse(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  assetUrl.search = "";
  const asset = await env.ASSETS.fetch(new Request(assetUrl, request));
  if (!asset.ok) return json({ error: "Asset not found" }, 404);
  const headers = new Headers(asset.headers);
  headers.set("Cache-Control", pathname === "/tracker.js" ? "public, max-age=300" : "no-store");
  if (pathname === "/tracker.js") {
    headers.set("Content-Type", "text/javascript; charset=utf-8");
    headers.set("X-Content-Type-Options", "nosniff");
  } else {
    headers.set("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
  }
  return new Response(asset.body, { status: asset.status, headers });
}

async function handleEvents(request, env, url) {
  const siteId = cleanId(url.searchParams.get("site"));
  const origin = request.headers.get("Origin") || "";
  const allowed = siteId ? await isAllowedOrigin(env, siteId, origin) : false;
  if (!allowed) return json({ error: "Origin or site not allowed" }, 403);

  const cors = corsHeaders(origin);
  if (request.method === "OPTIONS") {
    cors.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    cors.set("Access-Control-Allow-Headers", "Content-Type");
    cors.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers: cors });
  }
  if (!/^text\/plain(?:\s*;|$)/i.test(request.headers.get("Content-Type") || "")) {
    return json({ error: "Use text/plain" }, 415, cors);
  }
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: "Event too large" }, 413, cors);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Event too large" }, 413, cors);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid event" }, 400, cors);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid event" }, 400, cors);
  const eventType = typeof body.type === "string" ? body.type : "";
  if (!ALLOWED_EVENTS.has(eventType)) return json({ error: "Event type not allowed" }, 400, cors);

  const sessionId = typeof body.session_id === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(body.session_id)
    ? body.session_id
    : "";
  if (!sessionId) return json({ error: "Invalid session" }, 400, cors);

  const pagePath = cleanPath(body.page_path);
  if (!pagePath) return json({ error: "Invalid page path" }, 400, cors);
  const target = cleanTarget(body.target);
  const targetHost = cleanHost(body.target_host);
  const activeMs = eventType === "active_time" && Number.isFinite(body.active_ms)
    ? Math.max(0, Math.min(60000, Math.floor(body.active_ms)))
    : 0;
  const eventId = typeof body.event_id === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(body.event_id)
    ? body.event_id
    : crypto.randomUUID();
  const details = request.cf || {};
  const ua = request.headers.get("User-Agent") || "";
  const agent = classifyAgent(ua);
  const referrerHost = getReferrerHost(request.headers.get("Referer"));

  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO events (event_id, site_id, session_id, event_type, created_at, page_path, target, target_host, referrer_host, active_ms, browser, os, device_type, country, region, city) VALUES (?, ?, ?, ?, unixepoch(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      eventId, siteId, sessionId, eventType, pagePath, target, targetHost, referrerHost,
      activeMs, agent.browser, agent.os, agent.device,
      cleanLabel(details.country), cleanLabel(details.region), cleanLabel(details.city)
    ).run();
  } catch {
    return json({ error: "Could not record event" }, 503, cors);
  }
  return json({ ok: true }, 202, cors);
}

async function handleSummary(request, env, url) {
  const siteId = cleanId(url.searchParams.get("site"));
  const origin = request.headers.get("Origin") || "";
  const cors = origin ? corsHeaders(origin) : new Headers();
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Cross-origin report requests are not allowed" }, 403);
  if (request.method === "OPTIONS") {
    cors.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    cors.set("Access-Control-Allow-Headers", "Authorization");
    cors.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers: cors });
  }
  if (!siteId) return json({ error: "Invalid site" }, 400, cors);
  if (!env.ADMIN_TOKEN) return json({ error: "ADMIN_TOKEN secret is not configured" }, 503, cors);
  if (!constantTimeEqual(request.headers.get("Authorization") || "", "Bearer " + env.ADMIN_TOKEN)) {
    return json({ error: "Unauthorized" }, 401, cors);
  }
  const enabled = await env.DB.prepare("SELECT site_id FROM sites WHERE site_id = ? AND enabled = 1").bind(siteId).first();
  if (!enabled) return json({ error: "Unknown site" }, 404, cors);

  const parsedDays = Number.parseInt(url.searchParams.get("days") || "7", 10);
  const days = Number.isFinite(parsedDays) ? Math.max(1, Math.min(MAX_DAYS, parsedDays)) : 7;
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  try {
    const [totals, daily, pages, browsers, devices, operatingSystems, locations, externalLinks, chat] = await Promise.all([
      env.DB.prepare(
        "SELECT COUNT(DISTINCT session_id) AS sessions, SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views, SUM(CASE WHEN event_type IN ('section_click','internal_link_click','external_link_click') THEN 1 ELSE 0 END) AS clicks, SUM(CASE WHEN event_type LIKE 'chat_%' THEN 1 ELSE 0 END) AS chatbot_events, SUM(CASE WHEN event_type = 'active_time' THEN active_ms ELSE 0 END) AS active_ms FROM events WHERE site_id = ? AND created_at >= ?"
      ).bind(siteId, since).first(),
      env.DB.prepare(
        "SELECT date(created_at, 'unixepoch') AS day, COUNT(DISTINCT session_id) AS sessions, SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views FROM events WHERE site_id = ? AND created_at >= ? GROUP BY day ORDER BY day"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT page_path AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type = 'page_view' AND created_at >= ? GROUP BY page_path ORDER BY count DESC LIMIT 10"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT browser AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type = 'page_view' AND created_at >= ? GROUP BY browser ORDER BY count DESC LIMIT 10"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT device_type AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type = 'page_view' AND created_at >= ? GROUP BY device_type ORDER BY count DESC LIMIT 10"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT os AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type = 'page_view' AND created_at >= ? GROUP BY os ORDER BY count DESC LIMIT 10"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT COALESCE(country, 'Unknown') AS country, COALESCE(region, '') AS region, COALESCE(city, '') AS city, COUNT(DISTINCT session_id) AS sessions FROM events WHERE site_id = ? AND event_type = 'page_view' AND created_at >= ? GROUP BY country, region, city ORDER BY sessions DESC LIMIT 12"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT target_host AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type = 'external_link_click' AND created_at >= ? AND target_host IS NOT NULL GROUP BY target_host ORDER BY count DESC LIMIT 10"
      ).bind(siteId, since).all(),
      env.DB.prepare(
        "SELECT event_type AS name, COUNT(*) AS count FROM events WHERE site_id = ? AND event_type LIKE 'chat_%' AND created_at >= ? GROUP BY event_type ORDER BY count DESC"
      ).bind(siteId, since).all()
    ]);
    const sessions = Number(totals?.sessions || 0);
    const pageViews = Number(totals?.page_views || 0);
    const activeMs = Number(totals?.active_ms || 0);
    return json({
      site_id: siteId,
      days,
      totals: {
        sessions,
        page_views: pageViews,
        clicks: Number(totals?.clicks || 0),
        chatbot_events: Number(totals?.chatbot_events || 0),
        active_seconds: Math.round(activeMs / 1000),
        avg_active_seconds_per_page_view: pageViews ? Math.round(activeMs / pageViews / 1000) : 0,
        avg_active_seconds_per_session: sessions ? Math.round(activeMs / sessions / 1000) : 0
      },
      daily: daily.results || [],
      top_pages: pages.results || [],
      browsers: browsers.results || [],
      devices: devices.results || [],
      operating_systems: operatingSystems.results || [],
      locations: locations.results || [],
      external_links: externalLinks.results || [],
      chatbot: chat.results || []
    }, 200, cors);
  } catch {
    return json({ error: "Could not load report" }, 503, cors);
  }
}

async function isAllowedOrigin(env, siteId, origin) {
  if (!origin || origin.length > 255) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || (parsed.protocol !== "https:" && parsed.hostname !== "localhost")) return false;
    const row = await env.DB.prepare(
      "SELECT 1 AS allowed FROM sites JOIN site_origins USING (site_id) WHERE sites.site_id = ? AND sites.enabled = 1 AND site_origins.origin = ?"
    ).bind(siteId, origin).first();
    return Boolean(row);
  } catch {
    return false;
  }
}

function classifyAgent(ua) {
  const value = ua.toLowerCase();
  let browser = "Unknown";
  if (value.includes("edg/") || value.includes("edgios/")) browser = "Edge";
  else if (value.includes("opr/") || value.includes("opios/") || value.includes("opera")) browser = "Opera";
  else if (value.includes("firefox/") || value.includes("fxios/")) browser = "Firefox";
  else if (value.includes("crios/")) browser = "Chrome";
  else if (value.includes("chrome/")) browser = "Chrome";
  else if (value.includes("safari/")) browser = "Safari";

  let os = "Unknown";
  if (/android/.test(value)) os = "Android";
  else if (/iphone|ipad|ipod|cpu os/.test(value)) os = "iOS";
  else if (/windows/.test(value)) os = "Windows";
  else if (/mac os|macintosh/.test(value)) os = "macOS";
  else if (/linux/.test(value)) os = "Linux";

  let device = "Desktop";
  if (/ipad|tablet/.test(value)) device = "Tablet";
  else if (/mobile|iphone|ipod|android/.test(value)) device = "Mobile";
  return { browser, os, device };
}

function getReferrerHost(value) {
  if (!value) return null;
  try { return cleanHost(new URL(value).hostname); } catch { return null; }
}
function cleanId(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{1,63}$/.test(value) ? value : "";
}
function cleanPath(value) {
  if (typeof value !== "string" || value.length > 500 || !value.startsWith("/") || value.startsWith("//")) return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 300) || "/";
}
function cleanTarget(value) {
  if (typeof value !== "string") return null;
  const safe = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 255);
  return safe || null;
}
function cleanHost(value) {
  if (typeof value !== "string" || value.length > 253) return null;
  const host = value.toLowerCase().replace(/\.$/, "");
  return /^[a-z0-9.-]+$/.test(host) && host.includes(".") ? host : null;
}
function cleanLabel(value) {
  if (typeof value !== "string") return null;
  const label = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  return label || null;
}
function corsHeaders(origin) {
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
}
function json(value, status = 200, extraHeaders = new Headers()) {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(value), { status, headers });
}
function constantTimeEqual(actual, expected) {
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}
