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

## Optional Cloudflare Authentication

Authentication is deployment-specific. The public demo is intentionally unauthenticated. A private Cloudflare deployment can add API-key or Bearer-token authorization before its URL is shared.

### 1. Set Secret in Cloudflare
```bash
npx wrangler secret put API_KEY
# Enter your high-entropy key, e.g. bm_live_...
```

### 2. Client Configurations

#### Antigravity / Cursor / Custom Clients (`mcp_config.json`):
```json
{
  "mcpServers": {
    "berean": {
      "url": "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_KEY"
      }
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "berean": {
      "url": "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_KEY"
      }
    }
  }
}
```

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

### 1. Composite Study Packs (High-Speed Single-Turn Endpoints)

> **AI usage note:** Composite Study Packs are optimized for human readers who want several related resources together. They are not necessarily token-efficient for AI clients: a single response can contain multiple commentaries, Scripture text, cross-references, and language data. Prefer the granular tools for focused AI requests, and use larger Study Packs only when the additional context is needed.

For AI-facing MCP use, request one commentary at a time and specify the preferred commentary when relevant (for example, `TNotes`, `Henry`, or `JFB`). The human Explorer may use multiple commentaries and Study Packs for comparison and comprehensive research. Study Pack tools are human-oriented and should be omitted from an AI-facing tool set.
2. **`sermon_study_pack`**: Focused preaching preparation: Scripture, Alexander Maclaren homiletics, Charles Simeon outlines (*Horae Homileticae*), and TSK cross-references.
3. **`illustration_study_pack`**: Opt-in Biblical Illustrator historical anecdotes and sermon illustrations, kept separate because its source material can be substantial.
4. **`lesson_creator_study_pack`**: Focused Sunday School and small-group preparation: Scripture, a sourced chapter opening, Charles Ellicott's historical context, and cross-references.
4. **`devotional_study_pack`**: Concise devotional reflection using Tyndale Open Study Notes, Matthew Henry's Concise Commentary, and supporting cross-references.
5. **`prayer_guide_study_pack`**: Scripture for prayer, Spurgeon/Benson adoration, Wesley self-examination, and promises for first-person ACTS prayer.
6. **`passage_exegesis_pack`**: Primary translation, OHGB original Greek/Hebrew, Keil & Delitzsch (OT) / H.A.W. Meyer (NT), Expositor's Greek NT, The Pulpit Commentary, and JFB.
7. **`word_study_pack`**: Strong's numbers, TBESG/TBESH/Thayer/BDB lexicons, in-context morphology, and A.T. Robertson / Marvin Vincent word studies.
8. **`interlinear_study_pack`**: Inline Greek/Hebrew to English word-by-word interlinear with continuous verse layout, grammatical parsing tags, and an automated lexical glossary.
9. **`septuagint_study_pack`**: Greek Septuagint (LXX) text, Brenton English translation, Dead Sea Scrolls textual variants, and Hebrew Masoretic Text comparative exegesis.
10. **`ot_in_nt_study_pack`**: Apostolic hermeneutics and Old Testament quotations/allusions in the New Testament with verbatim Hebrew MT, Greek LXX, and Greek NT comparative alignment.
11. **`covenant_theology_pack`**: Redemptive covenants throughout Scripture with John Calvin, John Gill, and ISBE Encyclopedia insights.
12. **`commentary_study_pack`**: Dynamic multi-commentary bundler allowing side-by-side comparative retrieval across any subset of the 26 available commentators with priority ordering.
13. **`topic_study_pack`**: Nave's Topical Concordance, Torrey's New Topical Textbook, Easton's Bible Dictionary, and cross-references.

### 2. Specialized Single-Engine Tools

#### Scripture Texts & Translations
14. **`bible_lookup`**: Retrieve full chapter and verse ranges across BSB, NET, KJV, ASV, WEB, OHGB, and LXX.
15. **`bible_search`**: High-speed full-text search with regex and testament filters.
16. **`parallel_passages`**: Gospel harmonies and Old/New Testament parallel passages.
17. **`daily_reading`**: 365-day whole-Bible reading schedules with automatic Scripture embedding.

#### Classical Commentaries & Cross-References
18. **`commentary_lookup`**: Query any individual commentator (26 classical sets + Tyndale Open Study Notes) with intelligent alias normalization.
19. **`cross_references`**: Query Treasury of Scripture Knowledge (TSK) cross-reference collections.

#### Original Languages & Textual Alignment
20. **`lexicon_lookup`**: Strong's, TBESG/TBESH, Thayer's Greek, BDB Hebrew, and LSJ Lexicons.
21. **`morphology_lookup`**: Original language grammatical and parsing breakdowns.
22. **`interlinear_lookup`**: Inline word-by-word Greek/Hebrew to English interlinear with continuous verse layout and rare-word glossary.
23. **`septuagint_lookup`**: Look up Greek Septuagint (LXX) text, Brenton English translation, and textual divergence notes for any Old Testament passage.
24. **`ot_quotations_lookup`**: Look up Old Testament quotations, citations, allusions, and Septuagint bridge references for any NT or OT passage.

#### Theology, Doctrines & Devotional Tools
25. **`theological_dictionary`**: Source-specific Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, and Vine's articles, plus an explicitly labelled Classic Bible Dictionary Collection option.
26. **`topic_study`**: Topical concordance lookups (Nave's & Torrey's).
27. **`biblical_promises`**: Topic-indexed biblical promises for faith and prayer.

#### Historical, Geographical & Cultural Backgrounds
28. **`character_lookup`**: Biographical profiles & ASCII relationship family trees.
29. **`location_lookup`**: GPS coordinates and Google Maps links for biblical cities and sites.
30. **`entity_disambiguation`**: Disambiguate biblical persons or locations sharing identical names (e.g. Mary, James, John, Zechariah, Herod).
31. **`convert_ancient_units`**: Convert ancient biblical weights, measures, distances, and currencies into modern metric, imperial, and labor purchasing power.
32. **`bible_names`**: Etymological meanings and origins of biblical names.
33. **`chronology`**: Biblical timelines and historical genealogies.
34. **`book_analysis`**: Source-attributed Tyndale Open Study Notes book summaries and full introductions.
35. **`chapter_summary`**: Structural summaries and central themes for any chapter.

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
* **Health Check**: `http://localhost:7860/health`
* **REST Tool Calling Example**:
  ```bash
  curl -s -X POST http://localhost:7860/tools/bible_lookup \
    -H "Content-Type: application/json" \
    -d '{"version":"BSB","reference":"John 3:16"}'
  ```

### Optional Cloudflare Deployment

Cloudflare is useful when you want a hosted endpoint or a shared Explorer. It uses R2 for larger read-only resource files and D1 for the configured indexes. See [Cloudflare Deployment](../docs/cloudflare-deployment.md) for the complete, separate setup guide.
