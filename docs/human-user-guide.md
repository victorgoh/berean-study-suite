# Human User Guide

Berean Study Suite provides a human-oriented Bible research interface for looking up Scripture, comparing reference sources, and requesting readable Study Packs. It is a research aid, not a Bible reading replacement or an authority on interpretation.

## What you can explore

- Bible passages and keyword searches
- Individual commentaries or comparative commentary packs
- Original-language morphology, lexicons, and interlinear data
- Dictionaries, encyclopedias, topics, names, locations, and cross-references
- Chapter summaries and other contextual reference tools

The Explorer is designed for readable, comprehensive results. Study Packs may combine several sources and therefore produce large responses. For smaller responses, use a focused single-resource lookup.

## Explorer and AI use

The Explorer can combine multiple commentaries, dictionaries, encyclopedias, cross-references, and language resources in one Study Pack. This is convenient for a human reader. AI clients should generally make focused requests, select one preferred commentary where needed, and avoid multi-source packs when token cost matters.

Missing entries should be reported clearly. A verse request must not silently expand into a chapter response; request the chapter explicitly if broad context is wanted.

## Study workflows

The repository also includes optional AI-assisted research prompts and workflows, including `berean` and `berean-plus`. They can help organize retrieval and follow-up questions, but the MCP server remains the evidence and retrieval layer. Treat generated synthesis as a starting point for review, not as an authoritative conclusion.

## Further reading

- [MCP client integration](human-mcp-client-integration.md)
- [Local deployment](local-deployment.md)
- [Cloudflare deployment](cloudflare-deployment.md)
- [Data sources and provenance](data-sources-and-provenance.md)
