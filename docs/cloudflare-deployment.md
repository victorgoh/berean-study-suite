# Cloudflare Deployment

This document covers deployment of the `berean-mcp` Worker using Cloudflare Workers, R2, and D1.

## Deployment outline

1. Create or select an R2 bucket for large read-only resource files.
2. Create D1 databases for indexed reference and morphology data.
3. Copy the Wrangler example and configure bindings locally.
4. Upload only the resources required by the deployed service.
5. Run typechecks and focused tests.
6. Deploy with `npm run deploy`.

```bash
cd berean-mcp
npm install
npx wrangler login
npm run typecheck
npm run deploy
```

## Configure `wrangler.jsonc`

`wrangler.jsonc` holds your account's D1 database IDs, so it is gitignored. Create it from the template and fill in the IDs:

```bash
cp wrangler.jsonc.example wrangler.jsonc
npx wrangler d1 list
```

Copy the IDs of the reference and morphology databases into the two `database_id` fields. The template also sets the rate-limit bindings (see [MCP server design](agent-mcp-server-design.md#anonymous-rate-limiting)) and `MCP_PROFILE`.

Keep two things in mind when deploying:

- **Plain variables are replaced on every deploy.** `wrangler deploy` sets the Worker's plain variables to exactly those in `wrangler.jsonc`; a variable added in the Cloudflare dashboard but missing from the file is removed. Secrets (`wrangler secret put`, for example `ANALYTICS_SNIPPET`) are kept. Check the live Worker's settings before a first deploy from a new machine.
- **Check the build before deploying** with `npx wrangler deploy --dry-run --outdir /tmp/berean-dist`, which also lists the bindings that will be used.

To restrict a deployment to people who have a key, set the optional `API_KEY` secret with `npx wrangler secret put API_KEY` (see [optional API key](agent-mcp-server-design.md#optional-api-key)). Without it the API is public. The Explorer cannot fetch results on a key-protected deployment.

The Worker serves `robots.txt` (the Explorer and docs are indexable; `/tools/` and `/mcp` are not) and `sitemap.xml`, and the Explorer page carries a description and link-preview tags. Repeated tool answers are cached in memory per isolate (see [MCP server design](agent-mcp-server-design.md#result-cache)).

The service is designed to run on the Workers Free plan (10 ms CPU per request, 128 MB memory, 100,000 requests per day). Avoid features that require a paid plan.

## Verify and roll back

After deploying, check the live Worker:

```bash
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health
curl -s -X POST https://berean-mcp.<your-subdomain>.workers.dev/tools/bible_lookup \
  -H "Content-Type: application/json" -d '{"reference":"John 3:16"}'
```

Each deploy prints a version ID. To return to the previous version, find its ID with `npx wrangler deployments list` and run:

```bash
npx wrangler rollback <version-id>
```

The Worker is read-only with respect to study content. Authentication, health results, resource availability, and response behavior are deployment-specific. Do not commit private Wrangler configuration, credentials, `.wrangler/`, or resource data files.

## Operating model

The project is intended for a single user or small group. Validate changes before deployment and redeploy the complete Worker when recovery is needed. Storage-level versioning, staged promotion, and automated rollback are deliberately outside the current scope.

Before a consequential action such as uploading data, changing D1, deploying, or deleting a resource, an AI assistant should explain the effect and obtain the operator's approval.

For storage inventory and provenance, see [shared academic datasets](shared-academic-datasets.md) and the AI-oriented [resource runbook](agent-resource-data-runbook.md).
