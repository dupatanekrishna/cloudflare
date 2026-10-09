# Cloudflare Learn & Build

A hands-on notebook for exploring Cloudflare's products through small, documented experiments. The aim is to learn how the services fit together, verify behavior with evidence, and keep each experiment safe to repeat and easy to clean up.

## Start here

1. Read the [learning roadmap](docs/roadmap.md).
2. Browse the [service map](docs/service-map.md) and mark the areas you want to study.
3. Set your account boundaries with [Lab 00: account baseline and safety](labs/00-account-baseline-and-safety.md).
4. Run [Lab 01: your first Worker](labs/01-workers-first-request.md).
5. Use the [lab index](labs/README.md) and [lab template](labs/TEMPLATE.md) for each experiment.

## Current starting point

The Cloudflare dashboard screenshot shared for this project on 2026-10-10 shows Workers & Pages and an existing Worker named **groot-api**. It is recorded only as an inventory note. The first lab creates a separate local project; it does not change, deploy over, or delete that Worker.

No Cloudflare resources were provisioned as part of this repository setup.

## Lab rules

- Use names beginning with cf-lab or lab- for disposable resources.
- Keep generated projects under labs/projects/ so the root stays a documentation and index area.
- Test locally first. Deploy only after reviewing the current plan, limits, and pricing for that product.
- Keep credentials out of source control. Do not commit API tokens, .dev.vars, .env files, account IDs, or private customer data.
- Record the exact resource name and cleanup step in every lab that creates cloud resources.
- Prefer scoped tokens and the minimum permissions needed; never use a global key in a lab.
- Separate learning resources from production routes, domains, and application code.

## Repository structure

- docs/roadmap.md — staged learning plan and completion criteria.
- docs/service-map.md — product families and a living discovery checklist.
- docs/product-inventory.md — dated checkbox inventory of the live directory.
- labs/ — repeatable experiments, beginning with Workers.
- labs/projects/ — generated sample applications created during hands-on work.

## Cloudflare product references

Cloudflare's catalog changes over time. Use the [official product directory](https://developers.cloudflare.com/directory/) as the live index, and the [Cloudflare Fundamentals getting-started guide](https://developers.cloudflare.com/fundamentals/get-started/) for account and product concepts. Product availability, limits, and pricing depend on the account and product; check the dashboard before provisioning.

