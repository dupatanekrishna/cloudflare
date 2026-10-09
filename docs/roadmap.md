# Cloudflare learning roadmap

This roadmap is for dashboard-based experiments. The repository stores the runbooks and results; the experiments themselves are performed in Cloudflare. A stage is complete only after its behavior has been tested in the account and the actual result has been recorded.

Use the [official product directory](https://developers.cloudflare.com/directory/) as a public catalog. A directory entry does not prove account access, plan entitlement, or behavior in this account.

## Stage 1 — Workers (start here)

**Mode:** Cloudflare dashboard only.

**Experiment:** Create a separate test Worker from the Workers & Pages dashboard, use the generated Hello World starter, verify its deployed URL, and inspect the deployment and available logs. Keep the existing **groot-api** Worker untouched.

**Complete when:** the test Worker is separately named, its endpoint returns the expected response, the dashboard status/log evidence is recorded, and the cleanup decision is documented.

**Current status:** not tested in the account yet. No Worker was created by this repository work.

## Later stages — do not start until Workers is tested

These are topics to explore after the first Workers experiment is complete. They are not evidence that the services are available or tested in this account.

- DNS, SSL/TLS, caching, rules, and traffic delivery
- Workers & Pages features
- D1, KV, R2, Queues, Durable Objects, and Workflows
- AI, Vectorize, media, and realtime features
- Application security: WAF, rate limiting, Turnstile, and API protection
- Cloudflare One: Access, Tunnel, Gateway, WARP, and device posture
- Network services, logging, analytics, and infrastructure automation

For each topic, first confirm the feature is visible and usable in the account dashboard. Test one item, write down the observed result and limits, then decide the next step. If a workflow requires a local tool or a plan upgrade, stop and document that limitation instead of switching to a local or paid path.
