# Cloudflare Site Analytics

A standalone, privacy-conscious analytics collector for static websites. It uses one Cloudflare Worker, one D1 database, and a small browser script. The same collector supports multiple sites by assigning each site a site ID and allowed origin.

This project is isolated from the existing chatbot Worker and its D1 database. It does not deploy or modify either one.

## Events and data

The browser script records:

- Page views and internal section/link clicks.
- External link clicks, storing the destination hostname (for example, github.com).
- Approximate active time while a page is visible.
- Browser, operating system, device type, and approximate country/region/city from the request.
- Referrer hostname when the browser provides one.
- Explicit chatbot events when the chatbot page calls the tracker.

The collector stores an ephemeral, random session ID in sessionStorage so it can group activity in one browser tab. This is not a name or account ID. Location is IP-derived and approximate; it is not GPS.

The collector does not store IP addresses, raw user-agent strings, query strings, URL fragments, form values, or chatbot message text. Do not add those values to custom events. The script honors browser Do Not Track and Global Privacy Control signals. Session IDs are temporary per-tab analytics IDs; they do not identify a named person or prove that a visitor logged in. Active time is approximate and counts only while the page is visible.

Cloudflare Web Analytics can report aggregate browser, device, country, and referrer data, but it does not currently support custom events such as clicks or chatbot usage. This project adds those event types.

## Repository layout

- db/schema.sql — D1 tables and initial site registration.
- worker/src/index.js — event collector, report API, and 90-day retention cleanup.
- worker/public/tracker.js — browser event script served by the Worker.
- worker/public/dashboard.html — private-by-token summary dashboard.
- worker/wrangler.jsonc — Worker, D1, assets, cron, and logging configuration.

## Cloudflare setup

All steps can be completed in Cloudflare and GitHub's web interface; no local setup is required.

1. In Cloudflare, create a D1 database named site-analytics.
2. Open the D1 console and run the contents of db/schema.sql. It registers the first site as dkalki-portfolio for the origin shown there. Add more sites and origins using the same tables when you generalize the tracker.
3. Copy the database ID. In this repository's feat/site-analytics branch, edit worker/wrangler.jsonc and replace REPLACE_WITH_D1_DATABASE_ID with that ID. Commit only that file change.
4. In Workers & Pages, select Create application → Get started next to Import a repository. Connect the GitHub account if prompted, choose dupatanekrishna/cloudflare, select branch feat/site-analytics, and set the root directory to analytics/worker. Leave the build command blank. Set the deploy command to npx wrangler deploy, then save and deploy.
5. After the Worker is created, set ADMIN_TOKEN as a Worker secret in Settings → Variables and Secrets. Use a password-manager-generated random value; do not commit it.
6. In Cloudflare, select the `site-analytics-api` Worker and add `analytics.dkalki.com` under Settings → Domains & Routes → Custom Domains. Wait until the custom domain is active.
7. Verify `https://analytics.dkalki.com/health` returns `{"ok":true}`. Open `https://analytics.dkalki.com/dashboard`, enter dkalki-portfolio and the ADMIN_TOKEN value, then load the report.

~~~html
<script defer src="https://analytics.dkalki.com/tracker.js" data-site-id="dkalki-portfolio"></script>
~~~

Keep the site ID consistent with the D1 registration. The only portfolio edit needed is this analytics script URL on each page being tracked. The current allowed origin is the live site origin in db/schema.sql. If the live hostname changes, update site_origins and rerun the site registration SQL.

9. Open the live site in a new browser tab, visit a few sections, and click a test external link. Return to `https://analytics.dkalki.com/dashboard` and refresh the report.

## Chatbot event integration

A portfolio link click records only that the visitor opened the chatbot link. To record actual use, add calls on the chatbot page when the widget opens, a message is submitted, a response arrives, or an error occurs:

~~~js
window.siteAnalytics.track("chat_open");
window.siteAnalytics.track("chat_message_sent");
window.siteAnalytics.track("chat_response_received");
window.siteAnalytics.track("chat_error");
~~~

The tracker accepts only those named event types and ignores message text. If the chatbot runs on a different origin, register that origin in site_origins and load the same script there with an appropriate site ID.

## Generalizing to another website

For each site, add one row to sites and one or more exact origins to site_origins, then add the script tag with that site's site ID. The Worker rejects events from unregistered origins. Origin checks limit browser submissions; they are not authentication for non-browser clients, so this collector must not be used for sensitive or security-critical data.

## Cost and privacy controls

- Workers Observability is disabled in wrangler.jsonc, so this Worker does not persist invocation logs or traces.
- The daily cleanup removes event rows older than 90 days.
- Keep the account on the Workers Free plan. Free-plan quotas cap usage; exceeding a Free limit stops or rejects usage rather than automatically upgrading the account.
- D1 is storage, not a charting service. The dashboard reads aggregate results from D1 and never returns raw session events.
- Publish a short analytics/privacy notice for visitors and provide a way to opt out where applicable. This script is not a login tracker and does not identify people by name.

## Endpoints

- GET /health — non-sensitive health check.
- GET /tracker.js — public browser script.
- POST /v1/events?site=SITE_ID — validated event ingestion.
- GET /v1/summary?site=SITE_ID&range=today — today's Asia/Kolkata calendar day through the current time; requires Authorization: Bearer ADMIN_TOKEN. Use `days=7`, `days=30`, or `days=90` for rolling windows.
- GET /dashboard — report UI; requires the admin token when loading report data.
