(function () {
  "use strict";
  if (window.siteAnalytics) return;

  var script = document.currentScript;
  if (!script) return;
  var siteId = script.getAttribute("data-site-id") || "";
  var apiOrigin;
  try { apiOrigin = new URL(script.src).origin; } catch (_) { return; }
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(siteId)) return;

  var dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  if (dnt || navigator.globalPrivacyControl === true) return;

  var allowed = {
    page_view: true,
    section_click: true,
    internal_link_click: true,
    external_link_click: true,
    active_time: true,
    chat_open: true,
    chat_message_sent: true,
    chat_response_received: true,
    chat_error: true
  };
  var sessionId;
  try {
    sessionId = sessionStorage.getItem("site_analytics_session");
    if (!sessionId) {
      sessionId = randomId();
      sessionStorage.setItem("site_analytics_session", sessionId);
    }
  } catch (_) {
    sessionId = randomId();
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID().replace(/-/g, "");
    }
    var bytes = new Uint8Array(18);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  var endpoint = apiOrigin + "/v1/events?site=" + encodeURIComponent(siteId);
  function send(type, extra) {
    if (!allowed[type]) return;
    var payload = {
      event_id: randomId(),
      session_id: sessionId,
      type: type,
      page_path: window.location.pathname || "/"
    };
    if (extra && Number.isFinite(extra.active_ms)) payload.active_ms = Math.max(0, Math.min(60000, extra.active_ms));
    if (extra && typeof extra.target === "string") payload.target = extra.target.slice(0, 255);
    if (extra && typeof extra.target_host === "string") payload.target_host = extra.target_host.slice(0, 253);
    var body = JSON.stringify(payload);
    try {
      var queued = navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      if (queued) return;
    } catch (_) {}
    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: body
    }).catch(function () {});
  }

  window.siteAnalytics = {
    track: function (type) {
      if (allowed[type] && type.indexOf("chat_") === 0) send(type);
    }
  };

  send("page_view");

  document.addEventListener("click", function (event) {
    var element = event.target && event.target.closest ? event.target.closest("[data-analytics-event]") : null;
    if (element) {
      var customType = element.getAttribute("data-analytics-event");
      if (allowed[customType] && customType.indexOf("chat_") === 0) send(customType);
    }

    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var destination;
    try { destination = new URL(link.href, window.location.href); } catch (_) { return; }

    if (destination.origin !== window.location.origin) {
      send("external_link_click", { target: destination.hostname, target_host: destination.hostname });
      return;
    }

    if (destination.hash) {
      var section = destination.hash.slice(1);
      try { section = decodeURIComponent(section); } catch (_) {}
      section = section.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
      if (section) send("section_click", { target: section });
      return;
    }
    send("internal_link_click", { target: destination.pathname });
  }, { capture: true, passive: true });

  var lastActiveAt = document.visibilityState === "visible" ? Date.now() : 0;
  function flushActive() {
    if (!lastActiveAt) return;
    var now = Date.now();
    var elapsed = Math.max(0, Math.min(60000, now - lastActiveAt));
    lastActiveAt = now;
    if (elapsed >= 1000) send("active_time", { active_ms: elapsed });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      flushActive();
      lastActiveAt = 0;
    } else {
      lastActiveAt = Date.now();
    }
  });
  window.addEventListener("pagehide", flushActive);
  window.setInterval(function () {
    if (document.visibilityState === "visible") flushActive();
  }, 15000);
})();
