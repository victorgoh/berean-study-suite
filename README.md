# Berean Study Suite

## Try the Bible Study Explorer

[Open the Berean Bible Study Explorer](https://berean-mcp.victorgoh.workers.dev/)

Berean Study Suite is a place to explore Bible passages alongside helpful study resources. Choose Passage, Reflection, Commentary, Original Words, or Background; then enter a passage or subject and review related material from the selected source.

It is most useful when you want to look more closely at a passage, compare a few sources, or gather material for further reflection and study. Long and multi-source results provide contents or expandable sections so you can concentrate on one part at a time.

This tool is not meant to replace reading Scripture for yourself, personal devotional time, or wise guidance from your faith community. It is a research companion that helps you find and review available source material.

## For developers and self-hosters

The remainder of this README introduces the project for people who want to run it locally, connect it to an AI client, customize its resources, or deploy it on Cloudflare.

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

## Ongoing Improvements

Current work focuses on making the project dependable, clear, and useful in everyday study:

- **Testing and bug fixing:** Verify major tools, passage ranges, missing-resource handling, and local or deployed storage access.
- **Fine-tuning content output and formatting:** Keep responses readable and relevant, with study-pack sections, tables, and source material presented clearly.
- **Source content formatting cleanup:** Normalize imported resources so HTML entities, markup, line breaks, and original-language text display correctly.
- **Resource reliability and coverage:** Check that every enabled Bible, commentary, dictionary, and language resource is available and behaves predictably when content is missing.
- **Regression testing:** Maintain representative checks for ranges, cross-chapter passages, large sources, and common Explorer workflows as resources and services change.
- **Source licensing and provenance:** Record each resource's source, licence, attribution, import process, and storage path.
- **Output relevance and size:** Keep default responses focused; make larger sources and fuller study material explicit choices.
- **Explorer usability and accessibility:** Improve desktop and mobile navigation, keyboard use, clear errors, readable tables, and expandable sections.
- **Operational diagnostics:** Keep health and resource checks useful for identifying local or deployment-specific configuration problems.
