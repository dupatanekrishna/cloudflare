# Lab 01 — First Worker request

- **Status:** Ready
- **Product family:** Workers
- **Date drafted:** 2026-10-10
- **Cloud resources created:** None for local steps; optional separate test Worker for deployment
- **Estimated duration:** 30–45 minutes

## Goal

Create a Worker in this repository, run it locally with Wrangler, inspect a request and response, then decide whether to deploy it under a new disposable name.

## Safety and usage

- This lab does not use or modify the existing **groot-api** Worker.
- The required steps run locally. Deployment is optional and creates a separate cloud resource.
- Before deployment, check the current Workers limits and pricing in your account.
- Do not put API keys or other secrets in the sample code.
- The Cloudflare account login initiated by Wrangler should happen in your own browser. Never paste an auth token into this repo or chat.

## Prerequisites

- Git and a current Node.js LTS release supported by Cloudflare's current Wrangler documentation.
- npm.
- A local clone of this repository.
- A Cloudflare account only if you choose to authenticate or deploy.

## 1. Create a separate Worker project

From the repository root:

    mkdir -p labs/projects/workers
    cd labs/projects/workers
    npm create cloudflare@latest -- worker-hello-world

In the setup prompts, choose:

- **Hello World example**
- **Worker only**
- **JavaScript**
- **Git initialization:** No, because this repository already owns version control
- **Deploy now:** No

If the prompt wording changes, choose the equivalent minimal Worker-only JavaScript starter and skip immediate deployment.

## 2. Run locally

    cd worker-hello-world
    npx wrangler dev

Wrangler starts a local development server, normally at http://localhost:8787. In a second terminal, send a request:

    curl -i http://localhost:8787/

Confirm that the response is successful and contains the starter message. Stop the local server with Ctrl-C when finished.

## 3. Extend the request handler

Replace the generated src/index.js with this small request/response example:

    export default {
      async fetch(request) {
        const url = new URL(request.url);
        return Response.json({
          ok: true,
          product: "Workers",
          method: request.method,
          path: url.pathname,
        });
      },
    };

Start Wrangler again and test both a root path and a nested path:

    npx wrangler dev
    curl -i http://localhost:8787/
    curl -i http://localhost:8787/lab/one

Check that the JSON reports the HTTP method and path you sent. Try a POST request as well:

    curl -i -X POST http://localhost:8787/lab/post

In this first lab, both GET and POST return the same JSON. Later labs can add method validation and routing.

## 4. Optional deployment

Skip this section if you only want the local experiment.

Before deploying, review the current Workers limits and pricing and confirm that the generated Wrangler configuration names a new test Worker such as worker-hello-world. From the worker-hello-world project directory, deploy only that project:

    npx wrangler deploy

Follow Wrangler's browser authentication flow if prompted. Verify the deployed test endpoint in a browser or with curl. Do not run a deploy command from a directory or configuration that targets groot-api or another existing app.

## Expected result

- The Worker responds locally with JSON for the root and nested paths.
- You can explain that Wrangler runs the handler locally, while deployment publishes a named Worker to Cloudflare.
- If you deployed, the new test Worker appears separately from groot-api.

## Troubleshooting

| Symptom | Check |
|---|---|
| Port 8787 is busy | Stop the other local server or use Wrangler's documented port option. |
| npm create prompts differ | Choose the minimal Worker-only JavaScript starter and do not deploy immediately. |
| Wrangler asks to authenticate | Complete the official browser login flow in your own browser; keep credentials private. |
| Deployment targets the wrong Worker | Stop. Inspect the project's Wrangler configuration and name before retrying. |

## Cleanup

For a local-only run, stop Wrangler and remove the generated worker-hello-world folder if you do not want to keep it.

If you deployed, remove only the Worker created for this lab using the Cloudflare dashboard after confirming its exact name. Do not remove groot-api. Record the cleanup date here before marking the lab complete.

## References

- [Cloudflare Workers: get started with the CLI](https://developers.cloudflare.com/workers/get-started/guide/)
- [First Worker learning path](https://developers.cloudflare.com/learning-paths/workers/get-started/first-worker/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Workers storage options](https://developers.cloudflare.com/workers/platform/storage-options/)
