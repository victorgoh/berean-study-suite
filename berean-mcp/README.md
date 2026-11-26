# Berean MCP Server

A Model Context Protocol (MCP) Server for retrieving Bible texts, commentary, lexicon entries, original-language morphology, and related reference data.

It runs locally with SQLite resource files, or optionally as a hosted service on Cloudflare Workers using R2 and D1. Local use does not require a Cloudflare account.

## Documentation

- [Project overview](../README.md)
- [Human User Guide](../docs/human-user-guide.md)
- [MCP Client Integration](../docs/human-mcp-client-integration.md)
- [Run Locally](../docs/local-deployment.md)
- [Deploy to Cloudflare (optional)](../docs/cloudflare-deployment.md)
- [Customization and Extension](../docs/customization-and-extension.md)
- [Data Sources and Provenance](../docs/data-sources-and-provenance.md)

---

## Try the Public Demo

The public demo lets you explore the available tools before running your own local or hosted copy:

| Resource | URL | Description |
| :--- | :--- | :--- |
| **📖 Bible Study Explorer** | [https://berean-mcp.victorgoh.workers.dev/](https://berean-mcp.victorgoh.workers.dev/) | Reader-friendly passage, reflection, commentary, original-language, and background study interface |
| **⚡ Scalar API Reference** | [https://berean-mcp.victorgoh.workers.dev/docs](https://berean-mcp.victorgoh.workers.dev/docs) | Interactive API documentation with built-in request runner & multi-language snippets |
| **📜 Swagger UI** | [https://berean-mcp.victorgoh.workers.dev/swagger](https://berean-mcp.victorgoh.workers.dev/swagger) | Classic OpenAPI schema visualizer & tester |
| **📋 OpenAPI Spec** | [https://berean-mcp.victorgoh.workers.dev/openapi.json](https://berean-mcp.victorgoh.workers.dev/openapi.json) | Complete OpenAPI 3.1.0 JSON schema |
| **📡 MCP Gateway** | [https://berean-mcp.victorgoh.workers.dev/mcp](https://berean-mcp.victorgoh.workers.dev/mcp) | Streamable HTTP endpoint for AI Assistants (Antigravity, Claude, Cursor) |

---

## How It Runs

- **Local use:** Run the Node server against your local SQLite Bible and reference resources. This is the simplest way to explore, test, and customize the project.
- **Optional hosted use:** Deploy the same service to Cloudflare Workers when you want a public or shared endpoint. R2 stores larger read-only resource files; D1 supports the configured reference indexes and morphology data.
- **Focused and composite tools:** Use focused lookups for a specific question. Study Packs combine several sources for convenient human reading and can return more content.

---

## Access, Optional API Key and Rate Limits

The public demo is intentionally open, and so is any deployment by default. Abuse is limited by per-IP rate limits (see [MCP server design](../docs/agent-mcp-server-design.md#anonymous-rate-limiting)).

### Optional: require an API key on your own deployment

If you host your own copy and want to restrict it, set an `API_KEY` secret. The Worker then requires that key on `/mcp` and `/tools/*`; health checks and the docs pages stay public.

```bash
npx wrangler secret put API_KEY
# Enter a long random key
```

Clients send the key as `Authorization: Bearer <key>` (preferred), as an `x-api-key` header, or, if a client cannot set headers, as `?key=<key>` on the URL (query strings can end up in logs). Requests without the right key get HTTP `401`. To make the deployment public again, delete the secret with `npx wrangler secret delete API_KEY`.

The Explorer's own tool calls do not send a key, so on a key-protected deployment the Explorer page loads but cannot fetch results.

### Client configuration

#### Antigravity / Cursor / Custom Clients (`mcp_config.json`):
```json
{
  "mcpServers": {
    "berean": {
      "url": "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Leave out `headers` for a public deployment such as the demo.

#### Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "berean": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
        "--header", "Authorization: Bearer YOUR_API_KEY"
      ]
    }
  }
}
```

Leave out the two `--header` entries for a public deployment.

The server is stateless: it issues no MCP session ID, so any client that speaks Streamable HTTP can connect, and a client never needs to resume a session. After a server update, reconnect the client (or restart Claude Desktop) to pick up changed tool descriptions.

---

## 📚 Classical Commentaries & Reference Data

The Berean Study Suite is strictly built on **100% Public Domain** classical historical works and **Open-Access (CC BY-SA 4.0)** academic datasets:

* **24 Deployed Commentary Sets (Cloudflare R2)**: Expository, grammatical, homiletical, and historical commentaries including STEPBible's modern-English Matthew Henry arrangement, John Calvin, John Gill, Albert Barnes, Alexander Maclaren, Charles Spurgeon, Keil & Delitzsch, H. A. W. Meyer, Charles Simeon, The Pulpit Commentary, and the Tyndale Open Study Notes.
* **8 Bible Translations & Manuscript Editions**: BSB, NET, KJV, ASV, WEB, Open Hebrew & Greek Bible (OHGB), Septuagint (LXX), and OHGB Word-by-Word Interlinear.
* **7 Original Language Lexicons**: STEPBible TBESG/TBESH, Thayer Greek, BDB Hebrew, LSJ, and morphological concordances.
* **Academic Reference & Dictionaries**: Tyndale Open Bible Dictionary (6,010 articles), ISBE Encyclopedia, Easton's, Smith's, Nave's Topical, and TSK Cross-References.

👉 **[View the Complete Academic Datasets & Provenance Directory &rarr;](../docs/shared-academic-datasets.md)** for detailed tables covering historical eras, theological scopes, database object keys, and licensing.

*Tip: Use the `get_available_resources` MCP tool at any time to query all active translations, commentary aliases, and lexicons installed in your environment.*

---

## 🛠️ Complete MCP Tool Catalog

### 0. Catalog Discovery & Metadata
1. **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, study packs, personas, skills, workflows, and rules.

### 1. Composite Study Packs (Single-Call Bundles)

> **AI usage note:** Composite Study Packs are optimized for human readers who want several related resources together. They are not necessarily token-efficient for AI clients: a single response can contain multiple commentaries, Scripture text, cross-references, and language data. Prefer the granular tools for focused AI requests, and use larger Study Packs only when the additional context is needed.

For AI-facing MCP use, request one commentary at a time and specify the preferred commentary when relevant (for example, `TNotes`, `Henry`, or `JFB`). The human Explorer may use multiple commentaries and Study Packs for comparison and comprehensive research. Study Pack tools are human-oriented and are only exposed over MCP when `MCP_PROFILE=human`.

2. **`sermon_study_pack`**: Scripture, Alexander Maclaren, Charles Simeon (*Horae Homileticae*) and TSK cross-references; add commentators with `extra_commentators`.
3. **`illustration_study_pack`**: Biblical Illustrator anecdotes and sermon illustrations with Scripture and a few cross-references; kept separate because its source material is long.
4. **`lesson_creator_study_pack`**: Scripture, Adam Clarke's chapter-opening synopsis, Charles Ellicott's commentary and cross-references.
5. **`devotional_study_pack`**: Scripture, Tyndale Open Study Notes, Matthew Henry's Concise Commentary, related biblical promises and cross-references.
6. **`prayer_guide_study_pack`**: Scripture, Joseph Benson, John Wesley and Matthew Henry's Concise Commentary, plus related promises, for praying through a passage.
7. **`passage_exegesis_pack`**: Translation plus OHGB Hebrew/Greek, morphology, the Septuagint for OT passages, Keil & Delitzsch, H. A. W. Meyer, Expositor's Greek NT, JFB, Clarke, The Pulpit Commentary and cross-references.
8. **`word_study_pack`**: Lexicon definitions for a Strong's number; with a reference, its parsing in that verse, plus A. T. Robertson and Marvin Vincent for New Testament verses.
9. **`interlinear_study_pack`**: Word-by-word Greek/Hebrew interlinear with English glosses, parsing and a glossary of notable words (`inline`, `ruby` or `table` layout).
10. **`septuagint_study_pack`**: Hebrew Masoretic Text, Greek Septuagint with Brenton's English, a modern translation, Keil & Delitzsch, Clarke and New Testament quotations (OT passages only).
11. **`ot_in_nt_study_pack`**: New Testament quotations of and allusions to the Old Testament, with aligned NT Greek, Hebrew text, Septuagint and translation, plus Calvin, Gill and cross-references.
12. **`covenant_theology_pack`**: Scripture, John Calvin, John Gill, the ISBE encyclopedia article on covenant, Old Testament quotations and 12 TSK cross-references.
13. **`commentary_study_pack`**: Several commentaries on one passage in a single call; choose them with `commentators` and the order with `order_mode`.
14. **`topic_study_pack`**: The Tyndale Bible Dictionary article on a topic plus related biblical promises with full Scripture text.

### 2. Specialized Single-Engine Tools

#### Scripture Texts & Translations
15. **`bible_lookup`**: A verse, range or whole chapter in BSB (default), NET, KJV, WEB, ASV, OHGB or LXX.
16. **`bible_search`**: Find verses containing a word or phrase in one translation, optionally within one book; supports `*` wildcards and `+` / `|`.
17. **`parallel_passages`**: Gospel harmonies and Old/New Testament parallel accounts, optionally with full text.
18. **`daily_reading`**: The reading plan's passages for today or a given date, optionally with full text.

#### Classical Commentaries & Cross-References
19. **`commentary_lookup`**: One commentary's notes on a passage; call `get_available_resources(category="commentaries")` for keys and aliases.
20. **`cross_references`**: Treasury of Scripture Knowledge references grouped by keyword; `limit` caps how many are returned.

#### Original Languages & Textual Alignment
21. **`lexicon_lookup`**: STEPBible TBESG/TBESH, Thayer, BDB and LSJ definitions by Strong's number; "see …" pointer entries are followed.
22. **`morphology_lookup`**: Word-by-word Greek/Hebrew parsing for a verse.
23. **`interlinear_lookup`**: Word-by-word Greek/Hebrew interlinear with English glosses and a glossary of notable words.
24. **`septuagint_lookup`**: Greek Septuagint text, Brenton's English and notes on differences from the Hebrew, for an OT passage.
25. **`ot_quotations_lookup`**: Old Testament quotations and allusions at a New Testament reference (or NT uses of an OT passage), with Septuagint links.

#### Theology, Doctrines & Devotional Tools
26. **`theological_dictionary`**: Tyndale (default), ISBE, Easton's, Smith's, Fausset's, Morrish or Vine's articles, or the labelled classic collection.
27. **`topic_study`**: Topical index (Nave's/Torrey style) with subtopics and references.
28. **`biblical_promises`**: Bible promises for a situation or need; everyday words such as "fear", "worry" or "lonely" map to matching topics.

#### Historical, Geographical & Cultural Backgrounds
29. **`character_lookup`**: Biographies of people in the Bible with family relationships and a family tree.
30. **`location_lookup`**: Coordinates, a map link and a historical/archaeological description of a biblical place.
31. **`entity_disambiguation`**: Tell apart people or places that share a name (e.g. Mary, James, Herod).
32. **`convert_ancient_units`**: Convert biblical weights, measures, distances and coins to modern units, with an indication of value in wages.
33. **`bible_names`**: Meanings and origins of biblical names.
34. **`chronology`**: Dated events from a biblical timeline matching a person, period or event.
35. **`book_analysis`**: Tyndale Open Study Notes book introduction (`summary` or `full`).
36. **`chapter_summary`**: Adam Clarke's chapter-opening synopsis.

All MCP tools are marked read-only and accept `output_mode` and `page`: long results are returned in pages, each ending with the next page number to request. Errors start with a code such as `RESOURCE_UNAVAILABLE` followed by a hint on what to try next.

---

## Run Locally or Deploy to Cloudflare

### Run Locally

Local use is fully supported. Run the Node server against your local Bible and reference databases; no Cloudflare account is needed.

#### 1. Stdio Mode (Standard for AI Coding Assistants & Desktop MCP Clients):
```bash
cd berean-mcp
npm install
npm run start:stdio
```

#### 2. Local HTTP Server Mode (for Web Apps, REST APIs, or Streamable HTTP):
```bash
cd berean-mcp
npm install
npm run start:http
```
* **MCP Streamable HTTP Endpoint**: `http://localhost:7860/mcp`
* **Explorer**: `http://localhost:7860/` (set `PORT` to change the port)
* **Data location**: see [where local data is read from](../docs/local-deployment.md#where-local-data-is-read-from); set `DATA_DIR` to point at your data
* **Health Check**: `http://localhost:7860/health`
* **REST Tool Calling Example**:
  ```bash
  curl -s -X POST http://localhost:7860/tools/bible_lookup \
    -H "Content-Type: application/json" \
    -d '{"version":"BSB","reference":"John 3:16"}'
  ```

### Optional Cloudflare Deployment

Cloudflare is useful when you want a hosted endpoint or a shared Explorer. It uses R2 for larger read-only resource files and D1 for the configured indexes. See [Cloudflare Deployment](../docs/cloudflare-deployment.md) for the complete, separate setup guide.
