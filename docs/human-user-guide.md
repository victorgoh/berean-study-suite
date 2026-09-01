# Human User Guide

Berean Study Suite provides a human-oriented Bible research interface for looking up Scripture, comparing reference sources, and requesting readable Study Packs. It is a research aid, not a Bible reading replacement or an authority on interpretation.

## What you can explore

- Bible passages and keyword searches
- Individual commentaries or comparative commentary packs
- Original-language morphology, lexicons, and interlinear data
- Dictionaries, encyclopedias, topics, names, locations, and cross-references
- Chapter summaries and other contextual reference tools

The Explorer is designed for readable, comprehensive results. Study Packs may combine several sources and therefore produce large responses. For smaller responses, use a focused single-resource lookup.

## Using the Explorer

The Explorer opens without running a search. Choose the category that best matches what you want to investigate:

- **Passage** — read or search Scripture, follow cross-references, and compare parallel passages
- **Reflection** — gather devotional, prayer, or biblical-promise material
- **Commentary** — study a passage, compare commentaries, or open book and chapter guides
- **Original Words** — examine lexicons, grammar, morphology, and interlinear material
- **Background** — consult dictionaries and information about people, places, chronology, and historical context

Each category initially shows its most commonly useful tools. Choose **More study tools** when you need a specialist lookup. After selecting a tool, the short guidance above the search field explains what kind of passage, word, topic, person, or place to enter. Only selectors relevant to that tool are shown.

After a successful request, the search panel is reduced to a short summary so that the result remains the focus. Choose **Change search** to reopen the full controls. Multi-source results use expandable sections with **Expand all** and **Collapse all** controls. Long single-source results may include a contents navigator and a **Back to results top** button.

Use **Copy results** to copy the original formatted text. **Copy link** copies a bookmarkable URL containing the selected tool, query, translation, and chosen commentary or dictionary. Opening that link restores the search setup without automatically running it. **Print** excludes the search interface, navigation, and footer, and prints the complete result with collapsed sections expanded.

Starting a new request cancels an unfinished earlier request so that an older response cannot replace newer results. A request that runs for more than one minute stops with an option to retry or choose a more focused lookup.

The category and tool menus support mouse, touch, and keyboard use. Use Left and Right Arrow between categories, Down Arrow to enter a tool menu, Up and Down Arrow within the menu, and Escape to close it. On smaller screens, the tool menu opens as a full-width panel.

Missing or unavailable material is shown as a clear result state rather than silently substituting a broader passage or different source.

## Explorer and AI use

The Explorer can combine multiple commentaries, dictionaries, encyclopedias, cross-references, and language resources in one Study Pack. This is convenient for a human reader. AI clients should generally make focused requests, select one preferred commentary where needed, and avoid multi-source packs when token cost matters.

A verse request must not silently expand into a chapter response; request the chapter explicitly if broad context is wanted.

## Study workflows

The repository also includes optional AI-assisted research prompts and workflows, including `berean` and `berean-plus`. They can help organize retrieval and follow-up questions, but the MCP server remains the evidence and retrieval layer. Treat generated synthesis as a starting point for review, not as an authoritative conclusion.

## Further reading

- [MCP client integration](human-mcp-client-integration.md)
- [Local deployment](local-deployment.md)
- [Cloudflare deployment](cloudflare-deployment.md)
- [Data sources and provenance](data-sources-and-provenance.md)
