# Cloudflare learning roadmap

This roadmap moves from the request path and account basics into development, data, security, networking, and operations. Each stage should leave behind a lab note with a diagram or request flow, exact steps, observed result, failure notes, and cleanup instructions.

Use the live [Cloudflare product directory](https://developers.cloudflare.com/directory/) to track renamed or newly released products. A product that is not enabled on this account can still be documented as a design and access review; do not buy a plan just to check a box.

## Stage 0 — Account, DNS, and safe experiments

**Goal:** Understand zones, DNS records, proxy status, TLS modes, account resources, and how to isolate a disposable lab from a real application.

**Labs:** account inventory; DNS lookup and request-path sketch; TLS settings review.

**Complete when:** you can explain where DNS ends, where Cloudflare proxying begins, how the origin is reached, and how to avoid changing a production route. Start with [Lab 00](../labs/00-account-baseline-and-safety.md).

## Stage 1 — Workers and Pages

**Goal:** Build and test an edge application locally, understand request handlers and configuration, then make a deliberate deployment.

**Labs:** first Worker; request methods and paths; environment variables and secrets; routes and custom domains; Workers Logs and tail; versions and rollback; Pages and Functions.

**Complete when:** a Worker is tested locally, deployed under a distinct lab name if desired, observed in logs, and removed or documented with a cleanup decision.

## Stage 2 — Application delivery and security

**Goal:** Trace a request through DNS, TLS, caching, rules, and origin protection.

**Labs:** cache behavior and cache keys; redirect/transform rules; WAF and custom rules; rate limiting; Turnstile; API Shield and schema validation; DDoS concepts; origin protection.

**Complete when:** you can describe what each control evaluates, test it with harmless requests, inspect its logs, and explain its effect on legitimate traffic.

## Stage 3 — Storage, databases, and asynchronous work

**Goal:** Select the right data service and connect it to a Worker with explicit bindings.

**Labs:** KV for key-value data; D1 for relational data; R2 for objects; Queues for background jobs; Durable Objects for coordination; Workflows for durable multi-step tasks; Hyperdrive for an existing SQL database; Vectorize for embeddings.

**Complete when:** each experiment states its consistency, persistence, retry, access, and cleanup behavior, and the same application uses at least two appropriate data primitives.

## Stage 4 — AI, media, and realtime

**Goal:** Explore how the developer platform connects to inference, search, images, video, and realtime workloads.

**Labs:** Workers AI; AI Gateway; Vectorize semantic search; image delivery; Stream; RealtimeKit/SFU/TURN.

**Complete when:** a small demo describes request flow, data sent to the model or media service, observability, and any product-specific usage limits checked in the account.

## Stage 5 — Cloudflare One and private connectivity

**Goal:** Learn identity-aware access and private network connectivity without exposing a private service publicly.

**Labs:** Tunnel; Access policy for a test app; WARP/Cloudflare One Client; Gateway policy concepts; device posture; internal DNS; Cloudflare Mesh.

**Design-review topics:** CASB, DLP, Remote Browser Isolation, email security, Digital Experience Monitoring, Cloudflare WAN, and Multi-Cloud Networking. These may require organization setup or a paid entitlement.

**Complete when:** you can draw the identity, device, policy, tunnel, and origin path and identify where logs and policy decisions are visible.

## Stage 6 — Network and resilience services

**Goal:** Understand services for larger networks and higher availability.

**Labs or design reviews:** Load Balancing and health checks; Spectrum; Magic Transit; Cloudflare WAN; Network Firewall; DNS Firewall; Network Interconnect; network flow visibility; Waiting Room.

**Complete when:** each design states the traffic layer, prerequisites, failure behavior, and whether the feature is available to this account.

## Stage 7 — Observability, automation, and operations

**Goal:** Make experiments repeatable and observable.

**Labs:** Workers Logs and Logpush; GraphQL Analytics API; Radar; notifications; API tokens; Wrangler configuration; GitHub Actions; Terraform or Pulumi; resource tagging; deployment versions.

**Complete when:** a change can be reviewed in Git, deployed intentionally, verified with logs or metrics, and rolled back or cleaned up.

## Stage 8 — Capstone

**Goal:** Build a small API with a Worker, D1 or KV, R2, and a Queue; add a safe access/security control, logging, and a repeatable deployment path.

**Complete when:** the README includes the architecture, setup, tests, deployment boundary, usage/limit review, observability evidence, and cleanup steps.

## Progress tracker

- [ ] Stage 0 — Account, DNS, and safe experiments
- [ ] Stage 1 — Workers and Pages
- [ ] Stage 2 — Application delivery and security
- [ ] Stage 3 — Storage, databases, and asynchronous work
- [ ] Stage 4 — AI, media, and realtime
- [ ] Stage 5 — Cloudflare One and private connectivity
- [ ] Stage 6 — Network and resilience services
- [ ] Stage 7 — Observability, automation, and operations
- [ ] Stage 8 — Capstone

