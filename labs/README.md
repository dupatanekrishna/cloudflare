# Cloudflare dashboard labs

All experiments in this repository are intended to run in the Cloudflare dashboard. There are no local Worker projects or CLI steps.

## Current experiment

| Lab | Focus | Status |
|---|---|---|
| [01 — Workers dashboard experiment](01-workers-first-request.md) | Create and verify a separate test Worker in Workers & Pages | Not tested yet |

The account screenshot shows an existing **groot-api** Worker. It is inventory only and must remain unchanged.

## Lab lifecycle

1. Confirm the service is available in the account dashboard.
2. Check the current plan, limits, and pricing before creating anything.
3. Perform one isolated experiment in the dashboard.
4. Verify the result in the dashboard and through the service's own test surface.
5. Record only observed behavior, errors, and cleanup details.
6. Mark the lab complete only after evidence is captured without secrets or account identifiers.

Use [TEMPLATE.md](TEMPLATE.md) to record a new experiment after the current one has been tested.
