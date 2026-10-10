# Cloudflare Site Analytics

A privacy-conscious analytics collector for static websites. It uses one Cloudflare Worker, one D1 database, and a small browser script. The same collector can support multiple sites by assigning each site a site ID and allowed origin.

This project is isolated from the existing chatbot Worker and its D1 database. It does not deploy or modify either one.

## Current deployment

- **API and tracker:** Cloudflare Worker at `https://site-analytics-api.support-dupatane.workers.dev`.
- **Database:** Cloudflare D1 database named `site-analytics`.
- **Dashboard:** GitHub Pages project site at `https://dupatanekrishna.github.io/cloudflare/`.
- **Portfolio tracking:** The browser script posts events to the Worker. The existing portfolio DNS and GitHub Pages hosting do not need to change for analytics.

The Cloudflare Worker still serves `/health`, `/tracker.js`, `/dashboard`, `/v1/events`, and `/v1/summary`. GitHub Pages serves the same dashboard HTML as a static page, separated from the API.

## Events and data

The browser script records:

- Page views and internal section/link clicks.
- External link clicks, storing only the destination hostname (for example, github.com).
- Approximate active time while a page is visible.
- Browser, operating system, device type, and approximate country/region/city from the request.
- Referrer hostname when the browser provides one.
- Explicit chatbot events when the chatbot page calls the tracker.

The collector stores a random, temporary session ID in sessionStorage so it can group activity in one browser tab. It is not a name or account ID. Location is IP-derived and approximate; it is not GPS.

The collector does not store IP addresses, raw user-agent strings, query strings, URL fragments, form values, or chatbot message text. Do not add those values to custom events. The script honors Do Not Track and Global Privacy Control signals. Session IDs do not identify a named person or prove that a visitor logged in. Active time is approximate and counts only while the page is visible.

## Repository layout

- `db/schema.sql` — D1 tables and initial site registration.
- `worker/src/index.js` — event collector, report API, and 90-day retention cleanup.
- `worker/public/tracker.js` — browser event script served by the Worker.
- `worker/public/dashboard.html` — dashboard source served by the Worker and copied to GitHub Pages.
- `worker/wrangler.jsonc` — Worker, D1, assets, cron, and logging configuration.
- `.github/workflows/deploy-analytics-pages.yml` — publishes the dashboard to GitHub Pages.

## GitHub Pages dashboard

The dashboard frontend is public, but report data still requires the `ADMIN_TOKEN` secret configured on the Cloudflare Worker. The token is entered by the administrator, sent over HTTPS in an Authorization header, and kept in the page's memory; the dashboard does not save it.

After the repository is public, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The workflow publishes `worker/public/dashboard.html` as the Pages entry page whenever it changes on `main`.

The Pages address is `https://dupatanekrishna.github.io/cloudflare/`. The API allows report requests from the exact origin `https://dupatanekrishna.github.io`. If the GitHub username or repository name changes, update that CORS origin and the URL in this README.

This approach does not require changing GoDaddy nameservers, moving the portfolio to Cloudflare DNS, or setting up `analytics.dkalki.com`. Keep using the working `workers.dev` endpoint unless you later choose to configure a custom domain separately.

## Cloudflare setup

The current Worker is named `site-analytics-api` and uses the D1 binding `DB` and static asset binding `ASSETS`.

1. In Cloudflare, create a D1 database named `site-analytics`.
2. Run the contents of `db/schema.sql` in the D1 console. It registers `dkalki-portfolio` for the portfolio origin shown there.
3. In the Worker settings, bind the D1 database as `DB` and set `ADMIN_TOKEN` as a Worker secret. Use a password-manager-generated value; never commit it.
4. Verify `https://site-analytics-api.support-dupatane.workers.dev/health` returns `{"ok":true}`.
5. Use this script on each page you want to track:

~~~html
<script defer src="https://site-analytics-api.support-dupatane.workers.dev/tracker.js" data-site-id="dkalki-portfolio"></script>
~~~

Keep the site ID consistent with the D1 registration and the page's origin. The tracker uses the script's origin as its API host, so it sends events to the Worker. The Worker accepts events only from registered origins.

Open the Pages dashboard, enter the site ID `dkalki-portfolio` and the Worker `ADMIN_TOKEN`, then choose a date range and load the report.

## Chatbot event integration

A portfolio link click records only that the visitor opened the chatbot link. To record actual use, add calls on the chatbot page when the widget opens, a message is submitted, a response arrives, or an error occurs:

~~~js
window.siteAnalytics.track("chat_open");
window.siteAnalytics.track("chat_message_sent");
window.siteAnalytics.track("chat_response_received");
window.siteAnalytics.track("chat_error");
~~~

The tracker accepts only those named event types and ignores message text. If the chatbot runs on a different origin, register that origin in `site_origins` and load the same script there with an appropriate site ID.

## Generalizing to another website

For each site, add a row to `sites` and one or more exact origins to `site_origins`, then add the script tag with that site's site ID. The Worker rejects events from unregistered origins. Origin checks limit browser submissions; they are not authentication for non-browser clients, so do not use this collector for sensitive or security-critical data.

## Cost and privacy controls

- Workers Observability is disabled in `wrangler.jsonc`, so this Worker does not persist invocation logs or traces.
- The daily cleanup removes event rows older than 90 days.
- The Worker is intended to remain on the Workers Free plan. Free-plan quotas cap usage; exceeding a Free limit stops or rejects usage rather than automatically upgrading the account.
- D1 is storage, not a charting service. The dashboard reads aggregate results from D1 and never returns raw session events.
- Publish a short analytics/privacy notice for visitors and provide a way to opt out where applicable. This script is not a login tracker and does not identify people by name.

## Endpoints

- `GET /health` — non-sensitive health check.
- `GET /tracker.js` — public browser script.
- `POST /v1/events?site=SITE_ID` — validated event ingestion.
- `GET /v1/summary?site=SITE_ID&range=today` — today's Asia/Kolkata calendar day through the current time; requires `Authorization: Bearer ADMIN_TOKEN`. Use `days=7`, `days=30`, or `days=90` for rolling windows.
- `GET /dashboard` — report UI; report data requires the admin token.
