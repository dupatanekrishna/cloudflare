# Lab 00 — Account baseline and safety

- **Status:** Ready
- **Product family:** Account platform and developer platform
- **Date drafted:** 2026-10-10
- **Cloud resources created:** None
- **Estimated duration:** 20–30 minutes

## Goal

Build a written inventory and safety boundary before provisioning anything. This lab is read-only.

## Concepts

A Cloudflare account can contain multiple zones and products. DNS, proxying, Workers, and Cloudflare One have separate configuration surfaces. A development experiment should have its own name and should not take over a production hostname or application.

## Steps

### 1. Record a safe starting inventory

Use the dashboard, and record only what is useful for learning:

| Item | Your notes |
|---|---|
| Account plan and enabled products | |
| workers.dev subdomain or test hostname | |
| Existing Workers & Pages projects | |
| Existing zones and whether they are production | |
| Services you want to test first | |

The dashboard screenshot shared with this project shows one existing Worker called **groot-api**. Treat it as an existing workload. Do not edit, deploy over, rename, or delete it during the starter labs.

Do not copy account IDs, email addresses, tokens, private domains, or customer data into this repository.

### 2. Check access and billing before creating resources

For each planned lab, read the current product documentation, account limits, and pricing page. Product availability and charging rules can differ by plan and can change. Avoid enabling products or creating resources until you understand the effect.

When a lab needs API access, use Wrangler's interactive authentication or a narrowly scoped API token for that one task. Do not use the global API key. Never put credentials into Markdown, source code, terminal transcripts, or screenshots.

### 3. Set the repository boundary

- Put generated applications under labs/projects/.
- Use disposable names beginning with cf-lab- or lab-.
- Keep production domains and routes out of the initial labs.
- Check .gitignore before creating local environment files.
- Use local development first, and treat deployment as a separate, deliberate step.

### 4. Write a cleanup note before provisioning

For every cloud resource a later lab creates, write down its exact name, where it appears in the dashboard, and the steps needed to remove it. After the lab, verify that the resource is gone or explicitly record why it remains.

## Expected result

A local account inventory exists without secrets, production changes, or newly created Cloudflare resources.

## Completion check

- [ ] I know which Worker is the existing workload and will leave it unchanged.
- [ ] I checked current access, limits, and pricing before provisioning.
- [ ] I know where local secrets are kept and how Git ignores them.
- [ ] I will record cleanup steps before creating lab resources.

## References

- [Cloudflare Fundamentals: getting started](https://developers.cloudflare.com/fundamentals/get-started/)
- [Cloudflare product directory](https://developers.cloudflare.com/directory/)
