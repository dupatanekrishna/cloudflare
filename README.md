# Cloudflare Cloud Labs

A cloud-only learning notebook for exploring Cloudflare products through small, verified experiments. All hands-on work happens in the Cloudflare dashboard. This repository records what was actually tested, what the dashboard showed, and what should be tried next.

No local Worker project, Wrangler command, shell-based deployment, or local lab environment is part of this workflow.

## Start here

1. Use the [product inventory](docs/product-inventory.md) as a docs-derived catalog, not as proof that a service is enabled on this account.
2. Start with [Workers — dashboard experiment](labs/01-workers-first-request.md).
3. Follow the [lab index](labs/README.md) and record only observed results in each lab.
4. Use the [lab template](labs/TEMPLATE.md) for the next service after the Workers test is verified.

## Current state

- The screenshot shared for this project shows Workers & Pages and an existing Worker named **groot-api**.
- **groot-api** is an existing workload and is not the test target.
- No Workers experiment has been tested in the account yet, and no Cloudflare resource was created by this repository work.
- The Workers experiment is pending direct dashboard access.

## Rules for this learning project

- Work in the Cloudflare dashboard only.
- Use a separate, clearly named test resource; never edit, overwrite, or delete **groot-api** or another existing workload.
- Test one service at a time. Record the observed behavior before marking a lab complete or moving to the next service.
- Check account availability, current limits, and pricing before creating a resource. Stop if the dashboard requires a paid upgrade or unclear commitment.
- Do not record account IDs, tokens, email addresses, private domains, customer data, or other secrets in this repository.
- Do not claim a feature works in this account until it has been tested in the account.

## Repository structure

- docs/roadmap.md — service exploration sequence; future stages remain untested until verified.
- docs/service-map.md — product families and discovery checklist.
- docs/product-inventory.md — dated snapshot of entries in Cloudflare's public documentation directory.
- labs/ — experiment plans and verified results.

## Product references

Cloudflare's [official product directory](https://developers.cloudflare.com/directory/) changes over time. The inventory in this repo is a documentation snapshot; account availability and observed behavior must be verified in the dashboard before a lab is marked complete.
