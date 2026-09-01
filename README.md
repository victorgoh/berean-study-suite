# Berean Study Suite

Berean Study Suite is a Bible research and reference platform. It provides Scripture texts and related resources through a local or Cloudflare-based Model Context Protocol (MCP) server, together with a human-oriented web Explorer.

It helps users retrieve and examine configured Bible translations, commentaries, lexicons, dictionaries, morphology, and cross-references. Results should be evaluated against the underlying source and the user's own study context. The project does not replace personal Bible reading, devotional time, or professional judgment.

## What it provides

- Focused lookups for Scripture and biblical reference data.
- A human-friendly Explorer for comparing sources and using readable Study Packs.
- MCP and REST interfaces for AI clients and other applications.
- Local/offline operation or Cloudflare Workers deployment.
- Read-only access to configured datasets, with resource discovery and source attribution.

Study Packs are intended for convenient human reading and can return substantial multi-source responses. AI clients should generally prefer focused lookups to reduce context size and token cost.

## Start here

- [Human User Guide](docs/human-user-guide.md) — Explore Scripture and reference resources in the web interface.
- [MCP Client Integration](docs/human-mcp-client-integration.md) — Connect an AI client and discover the active tool catalog.
- [Local Deployment](docs/local-deployment.md) — Run the project locally or offline.
- [Cloudflare Deployment](docs/cloudflare-deployment.md) — Deploy the Worker with R2 and D1.
- [Customization and Extension](docs/customization-and-extension.md) — Add resources or change features.
- [Data Sources and Provenance](docs/data-sources-and-provenance.md) — Review origins, licenses, and storage.

AI programming-agent documents use the `agent-` prefix and contain implementation-oriented details.

## Try the demo

Try the [Berean Bible Study Explorer](https://berean-mcp.victorgoh.workers.dev/) to explore the available Scripture and reference tools in the browser.

## Quick start: local use

```bash
git clone https://github.com/victorgoh/berean-study-suite.git
cd berean-study-suite/berean-mcp
npm install
npm run typecheck
npm run start:http
```

Open `http://localhost:7860/` for the Explorer. For a stdio MCP server, run:

```bash
npm run start:stdio
```

## Scope

The project is designed for a single user or small group. It favors a straightforward read-only resource model and redeployment when recovery is needed. Enterprise storage versioning and automated rollback are intentionally outside the current scope.

Preserve source attribution and licensing information when adding resources, and validate changes locally before deployment.
