# Cloudflare service map

This is the learning index for the account, not a claim that every product is enabled on every plan. The live [Cloudflare product directory](https://developers.cloudflare.com/directory/) is the source of truth for the full and current catalog. Record access, plan requirements, and pricing from the dashboard before building a lab.

For each item, use a lab note with one of these outcomes: **read** (concepts understood), **reviewed** (dashboard/API access checked), **lab** (hands-on experiment completed), or **not available** (not enabled or not appropriate for this account).

## Core platform and traffic

- [ ] Account structure, API tokens, audit and access controls
- [ ] DNS and Registrar
- [ ] Proxy status and request routing
- [ ] SSL/TLS
- [ ] CDN, caching, cache rules, and speed settings
- [ ] Load Balancing and Health Checks
- [ ] Waiting Room and Smart Shield
- [ ] Rules and Ruleset Engine
- [ ] Cloudflare Fundamentals

## Developer platform

- [ ] Workers and Wrangler
- [ ] Pages and Pages Functions
- [ ] Durable Objects
- [ ] Workflows
- [ ] Containers, Dynamic Workers, and Sandboxes
- [ ] Workers for Platforms and Flagship
- [ ] Browser Rendering
- [ ] Email Workers and Email Service
- [ ] Secrets Store
- [ ] Version Management

## Storage, databases, and eventing

- [ ] Workers KV
- [ ] D1
- [ ] R2
- [ ] Queues
- [ ] Hyperdrive
- [ ] Vectorize
- [ ] K2 event streams
- [ ] Basin Pipelines / streaming ingestion
- [ ] Workers Analytics Engine
- [ ] Resource tagging and data lifecycle

## AI and search

- [ ] Workers AI
- [ ] AI Gateway
- [ ] Vectorize and embeddings
- [ ] Web Search API
- [ ] AutoRAG and agent-related features, if listed and available
- [ ] Usage, privacy, and model/data handling review

## Application security

- [ ] DDoS Protection
- [ ] Web Application Firewall (WAF)
- [ ] Rate Limiting
- [ ] Bot Management
- [ ] Turnstile
- [ ] API Shield
- [ ] Fraud Detection
- [ ] Leaked Credentials Detection
- [ ] Security Center
- [ ] Keyless SSL and Geo Key Manager
- [ ] Data Localization Suite

## Cloudflare One and private access

- [ ] Cloudflare Access
- [ ] Cloudflare Tunnel
- [ ] Gateway / Secure Web Gateway
- [ ] WARP / Cloudflare One Client
- [ ] Cloudflare Mesh
- [ ] Device posture checks
- [ ] Internal DNS
- [ ] CASB
- [ ] Data Loss Prevention (DLP)
- [ ] Remote Browser Isolation
- [ ] Email Security and DMARC Management
- [ ] Digital Experience Monitoring

## Network and connectivity

- [ ] Cloudflare WAN (formerly Magic WAN)
- [ ] Magic Transit
- [ ] Spectrum
- [ ] Network Firewall
- [ ] Multi-Cloud Networking
- [ ] Network Interconnect
- [ ] DNS Firewall
- [ ] Network Flow and Network Visibility
- [ ] Public-to-private connectivity
- [ ] Time Services: NTP, NTS, and Roughtime

## Analytics, operations, media, and other products

- [ ] Workers Logs, Logpush, and Log Explorer
- [ ] GraphQL Analytics API and notifications
- [ ] Cloudflare Radar
- [ ] Network Error Logging
- [ ] Images and Stream
- [ ] RealtimeKit, Realtime SFU, TURN, and MoQ
- [ ] Email Routing
- [ ] Privacy Pass and Privacy Proxy
- [ ] Web3 Gateways
- [ ] Terraform and Pulumi
- [ ] OAuth and tenant/account management
- [ ] Consumer services and other products shown in the live directory

## How to expand the catalog

When the live directory lists a product not captured above:

1. Add it under the closest family, or create a new family if needed.
2. Link the official product documentation.
3. Note whether it is a feature, a standalone service, or a plan-gated capability.
4. Add a lab or a design review to the roadmap.
5. Capture access, usage limits, evidence, and cleanup requirements.

## Official starting points

- [Product directory](https://developers.cloudflare.com/directory/)
- [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/)
- [Cloudflare Developer Platform learning path](https://developers.cloudflare.com/learning-paths/workers/devplat/intro-to-devplat/)
- [Cloudflare One overview](https://developers.cloudflare.com/cloudflare-one/)
- [Choosing a Workers storage product](https://developers.cloudflare.com/workers/platform/storage-options/)

