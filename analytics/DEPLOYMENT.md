# Site analytics deployment runbook

This runbook describes the current analytics deployment in the `cloudflare` repository. It covers the standalone analytics service only.

## Current components

| Component | Current address or resource |
| --- | --- |
| Dashboard | `https://analytics.dkalki.com` (GitHub Pages) |
| Worker API and tracker | `https://site-analytics-api.support-dupatane.workers.dev` |
| Worker | `site-analytics-api` |
| D1 database | `site-analytics` |
| Site ID | `dkalki-portfolio` |

The dashboard is a public static page. Report data requires the `ADMIN_TOKEN` Worker secret. The dashboard asks for the token when loading a report and keeps it in page memory.

## Data flow

1. A portfolio page loads `/tracker.js` from the analytics Worker with the `dkalki-portfolio` site ID.
2. The tracker sends allowed page-view, click, active-time, and explicit chatbot events to `/v1/events`.
3. The Worker checks the registered site origin and stores permitted event fields in D1.
4. The dashboard at `analytics.dkalki.com` requests aggregated results from `/v1/summary` on the Worker API and requires the admin token.

The dashboard hostname and Worker API hostname are separate. The dashboard domain currently points to GitHub Pages; the API continues using `workers.dev`.

## GitHub Pages and DNS

- Repository: `dupatanekrishna/cloudflare` (public).
- Pages source: **GitHub Actions**.
- Workflow: `.github/workflows/deploy-analytics-pages.yml`.
- The workflow publishes `analytics/worker/public/dashboard.html` as the Pages entry page.
- Custom domain: `analytics.dkalki.com`; the root `CNAME` file records this hostname.
- GoDaddy DNS: CNAME host `analytics` points to `dupatanekrishna.github.io`.

Keep the current nameservers, apex (`@`) records, and `krishna.dupatane.portfolio` record unchanged. Only the analytics subdomain is used for the dashboard.

After DNS changes, GitHub Pages may show **DNS Check in Progress** while it verifies the record and issues a TLS certificate. Wait for verification, then enable **Enforce HTTPS** when available. The Pages workflow was successfully retried on 2026-10-10: [run details](https://github.com/dupatanekrishna/cloudflare/actions/runs/38014762346).

Do not point `analytics.dkalki.com` at the Worker while it is assigned to GitHub Pages. If a custom Worker API domain is needed later, use a separate subdomain and configure it separately.

## Worker API

Base URL: `https://site-analytics-api.support-dupatane.workers.dev`.

| Method and path | Purpose |
| --- | --- |
| `GET /health` | Read-only health check |
| `GET /tracker.js` | Browser tracking script |
| `POST /v1/events?site=SITE_ID` | Store a validated event |
| `GET /v1/summary?site=SITE_ID&range=today` | Return an aggregate report for today in Asia/Kolkata; requires `Authorization: Bearer ADMIN_TOKEN` |
| `GET /dashboard` | Worker-hosted dashboard page |

The dashboard summary endpoint accepts the exact origins `https://dupatanekrishna.github.io` and `https://analytics.dkalki.com`. Event ingestion separately requires an origin registered for the site in D1.

Worker configuration is in `analytics/worker/wrangler.jsonc`. It binds D1 as `DB`, serves static assets as `ASSETS`, and runs daily retention cleanup. The cleanup removes events older than 90 days. Worker observability is disabled in the configuration.

Keep the `ADMIN_TOKEN` value in Cloudflare Worker secrets. Never put the value in this repository, a workflow file, or a screenshot.

## Privacy and reliable verification

- The collector stores temporary anonymous tab IDs and selected event fields; it does not store visitor names, IP addresses, raw user-agent strings, form values, or chatbot message text.
- Browser, device, operating system, and location are inferred or approximate. They are not guaranteed to identify a real device or precise location.
- Active time is approximate and only counts while the portfolio tab is visible.
- The Worker deletes events after 90 days; persistent invocation logging is disabled.
- Use `GET /health` to check the API without writing an analytics event.
- Avoid sending synthetic events with the production site ID because they change the dashboard totals. Use a separate test site ID and origin for event testing.

## Scope and safety

This analytics deployment uses its own Worker and D1 database. The existing chatbot Worker and database are separate. The Pages workflow publishes the dashboard file only; it does not deploy the portfolio site. The existing portfolio nameservers and production DNS records remain unchanged.
