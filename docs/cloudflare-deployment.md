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
npm run typecheck
npm run deploy
```

The Worker is read-only with respect to study content. Authentication, health results, resource availability, and response behavior are deployment-specific. Do not commit private Wrangler configuration, credentials, `.wrangler/`, or resource data files.

For storage inventory and provenance, see [shared academic datasets](shared-academic-datasets.md) and the AI-oriented [resource runbook](agent-resource-data-runbook.md).
