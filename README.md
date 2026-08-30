# 📖 Berean Study Suite

*A comprehensive open-source biblical research suite combining a universal Cloudflare Edge & Stdio MCP Server with an autonomous AI agentic study studio.*

> [!NOTE]
> **Where Rigorous Scholarship Meets Agentic Power:** The **Berean Study Suite** pairs an ultra-fast edge Model Context Protocol (MCP) server with an autonomous research studio for pastors, theologians, translators, and students of Scripture.

---

## 🌟 Architecture Overview

The **Berean Study Suite** is a unified, local-first research platform featuring:

1. **Berean MCP Server (`berean-mcp`)**: Universal Model Context Protocol server providing **35 exegetical tools** (23 specialized single-engine tools + 12 high-speed composite Study Packs), 26 classical commentary sets, 8 Bible translations/manuscript editions, Greek/Hebrew lexicons, and full REST/OpenAPI/Swagger endpoints for any MCP client (Claude Desktop, Cursor, ChatGPT, Antigravity).
2. **15 Theological Personas & Autonomous Pipelines**: 15 specialized theological personas, exegesis skills (`berean://skills/...`), universal typography standards (`berean://rules/typography`), and study prompts embedded directly into the MCP server with zero static token overhead.

---

## 💡 Why Berean Study Suite?

The **Berean Study Suite** was developed to provide an open, standardized bridge between historic biblical scholarship and modern AI assistants. By adopting the **Model Context Protocol (MCP)** and high-efficiency composite study pipelines, the suite delivers:

* **⚡ Context & Token Efficiency**: Single-turn composite Study Packs bundle original language morphology, cross-references, and commentaries into concise payloads, drastically reducing token burn and preserving the AI's active reasoning window.
* **🎯 Hallucination-Free Exegesis**: Queries verified SQLite databases directly, grounding AI responses in authentic biblical manuscripts and centuries of trusted commentary.
* **🔌 Universal Multi-Client Portability**: Works natively across Google Antigravity, Claude Desktop, Cursor, ChatGPT, and standalone Web Explorers.
* **🌍 Flexible Edge & Local Deployment**: Runs completely offline on local machines or globally on Cloudflare Workers with sub-50ms latency.

---

## 🌐 Live Demo & Interactive Explorers

Try out the live public instance hosted globally on Cloudflare Workers:

| Resource | URL | Description |
| :--- | :--- | :--- |
| **📖 Bible Study Explorer** | [https://berean-mcp.victorgoh.workers.dev/](https://berean-mcp.victorgoh.workers.dev/) | Reader-friendly Web UI to explore all 35 tools, Scripture texts, and classical commentaries |
| **⚡ Scalar API Reference** | [https://berean-mcp.victorgoh.workers.dev/docs](https://berean-mcp.victorgoh.workers.dev/docs) | Interactive API documentation with built-in request runner & multi-language snippets |
| **📜 Swagger UI** | [https://berean-mcp.victorgoh.workers.dev/swagger](https://berean-mcp.victorgoh.workers.dev/swagger) | Classic OpenAPI schema visualizer & API playground |
| **📋 OpenAPI Spec** | [https://berean-mcp.victorgoh.workers.dev/openapi.json](https://berean-mcp.victorgoh.workers.dev/openapi.json) | Complete OpenAPI 3.1.0 JSON schema |
| **📡 MCP Gateway** | `https://berean-mcp.victorgoh.workers.dev/mcp` | Streamable HTTP endpoint for AI Assistants (Antigravity, Claude, Cursor) |

---

## ⚡ The Signature AI Study Pipelines

### 1. `/berean` — Phased Autonomous Exegesis & Synthesis
Accessible via `berean://skills/berean` and the `berean-study` prompt, this pipeline runs a structured 5-phase research workflow:
* **Phase 1: Study Planning & Goal Setting** — Generates a master study plan tailored to the user's passage, topic, or sermon seed.
* **Phase 2: Scripture & Exegetical Data Retrieval** — Queries verified SQLite databases via `berean-mcp` tools, completely eliminating AI scripture hallucinations.
* **Phase 3: Exegesis & Contextual Analysis** — Engages OT/NT biblical scholars to analyze original Greek/Hebrew syntax, morphology, and historical backgrounds.
* **Phase 4: Systematic & Redemptive-Historical Synthesis** — Evaluates covenantal themes and redemptive trajectories.
* **Phase 5: Pastoral & Practical Application** — Crafts gospel-centered applications, first-person prayers, and small-group questions.
* **Iterative Final Manuscript** — Runs an iterative draft-audit-revision loop adopting the *Master Biblical Writer* persona to produce a publication-quality manuscript.

### 2. `/berean-plus` — Dynamic & Goal-Oriented Research
Accessible via `berean://skills/berean-plus` and the `berean-plus-study` prompt, this pipeline is designed for complex or specialized research requests:
* 🗺️ **Dynamic Phased Planning**: Formulates custom phases aligned directly with user research requirements.
* 🎭 **Dynamic Persona Matching**: Dynamically assigns the most suitable theological persona to each sub-task.
* 🎯 **Goal-Oriented Checkpoint Audits**: After each phase, the *Study Quality Auditor* audits the findings, identifies gaps, injects follow-up steps, and re-audits before proceeding.

---

## 🛠️ Berean MCP Server (`berean-mcp`)

The **Berean MCP Server** delivers **35 total tools** (23 specialized single-engine tools and 12 high-performance composite study packs):

### 1. High-Speed Composite Study Packs (Single-Turn Endpoints)
- **`sermon_study_pack`** — Aggregates Scripture (BSB), Alexander Maclaren homiletics, Charles Simeon outlines (*Horae Homileticae*), The Biblical Illustrator, Matthew Henry, and TSK cross-references.
- **`devotional_study_pack`** — Gathers Scripture, Charles Spurgeon (*Treasury of David*), Alexander Maclaren, Albert Barnes, Matthew Henry, and Biblical Promises.
- **`passage_exegesis_pack`** — Combines primary translation, OHGB original Hebrew/Greek, Keil & Delitzsch (OT) / H.A.W. Meyer (NT), Expositor's Greek NT, The Pulpit Commentary, and JFB.
- **`word_study_pack`** — Combines Strong's numbers, Thayer Greek / BDB Hebrew lexicons, in-context morphology, and A.T. Robertson / Marvin Vincent word studies.
- **`topic_study_pack`** — Combines Nave's Topical Concordance, Torrey's New Topical Textbook, Easton's Bible Dictionary, and cross-references.
- **`commentary_study_pack`** — Dynamic multi-commentary bundler allowing side-by-side comparative retrieval across any subset of the 26 available commentators.
- **`lesson_creator_study_pack`** — Produces structured lesson outlines, discussion questions, Albert Barnes' practical remarks, and Charles Ellicott's historical context for teachers.
- **`prayer_guide_study_pack`** — Bundles Scripture, Spurgeon/Benson adoration, Wesley self-examination, and promises for first-person ACTS prayer.
- **`covenant_theology_pack`** — Traces redemptive covenants throughout Scripture with John Calvin, John Gill, and ISBE Encyclopedia insights.
- **`interlinear_study_pack`** — Provides continuous Greek/Hebrew interlinear text, morphology tags, and an original-language glossary.
- **`ot_in_nt_study_pack`** — Compares Old Testament quotations and allusions across the Hebrew MT, Greek LXX, and Greek New Testament.
- **`septuagint_study_pack`** — Compares LXX Greek, Brenton English, textual variants, and the Hebrew Masoretic Text.

### 2. Specialized Single-Engine Tools
- **Scripture & Texts**: `bible_lookup`, `bible_search`, `daily_reading`
- **Commentaries**: `commentary_lookup` (26 classical commentary sets with intelligent alias resolution)
- **Linguistics & Morphology**: `lexicon_lookup` (Strong's, Thayer, BDB, LSJ), `morphology_lookup` (Greek & Hebrew word-by-word syntax)
- **Topical & Reference**: `topic_study`, `character_lookup` (with ancestry and relationship trees), `location_lookup` (with GPS coordinates and map links), `theological_dictionary` (Easton's, ISBE Encyclopedia, Smith's), `biblical_promises`
- **Context & Structure**: `parallel_passages` (Gospel harmonies and OT parallels), `book_analysis`, `chapter_summary`, `bible_names`, `chronology`, `cross_references`
- **Textual, Entity & Measurement Research**: `interlinear_lookup`, `ot_quotations_lookup`, `septuagint_lookup`, `entity_disambiguation`, `convert_ancient_units`
- **Discovery**: `get_available_resources` (Real-time listing of active bibles, commentaries, lexicons, study packs, personas, skills, workflows, and rules)

---

## 📚 Classical Commentaries & Biblical Reference Data

The Berean Study Suite is strictly built on **100% Public Domain** classical historical works and **Open-Access (CC BY-SA 4.0)** academic datasets. No customized, proprietary, or non-public domain commentaries are included in the suite.

### Provenance & Licensing Directory

| Resource / Commentary Set | Author(s) & Era | Status & License | Scope |
| :--- | :--- | :--- | :--- |
| **Tyndale Open Study Notes (`TNotes`)** | Tyndale House, Cambridge / STEPBible.org | **CC BY-SA 4.0** | Whole Bible (15,000+ verses) |
| **Tyndale Open Bible Dictionary** | Tyndale House Publishers / STEPBible.org | **CC BY-SA 4.0** | 6,010 articles / 9,865 headwords |
| **Matthew Henry's Commentary** | Matthew Henry (1662–1714) | **Public Domain** | Whole Bible (Devotional / Practical) |
| **Jamieson-Fausset-Brown (JFB)** | R. Jamieson, A. R. Fausset, D. Brown (1871) | **Public Domain** | Whole Bible (Critical / Explanatory) |
| **John Calvin's Commentaries** | John Calvin (1509–1564) | **Public Domain** | Whole Bible (Exegetical / Reformed) |
| **John Gill's Exposition** | John Gill (1697–1771) | **Public Domain** | Whole Bible (Hebraic / Rabbinic) |
| **Albert Barnes' Notes** | Albert Barnes (1798–1870) | **Public Domain** | Whole Bible (Verse-by-Verse Explanatory) |
| **Alexander Maclaren's Expositions** | Alexander Maclaren (1826–1910) | **Public Domain** | Whole Bible (Expository / Homiletical) |
| **Charles Simeon's *Horae Homileticae*** | Charles Simeon (1759–1836) | **Public Domain** | Whole Bible (2,500+ Sermon Outlines) |
| **Charles Spurgeon (*Treasury of David*)** | Charles Spurgeon (1834–1892) | **Public Domain** | Whole Bible / Psalms Exposition |
| **Keil & Delitzsch Commentary (KD)** | C. F. Keil & Franz Delitzsch (1807–1890) | **Public Domain** | Old Testament (Grammatical / ANE) |
| **H. A. W. Meyer Commentary (CECNT)** | H. A. W. Meyer (1800–1873) | **Public Domain** | New Testament (Critical / Exegetical) |
| **Expositor's Greek New Testament** | W. Robertson Nicoll (1851–1923) | **Public Domain** | New Testament (Greek Textual Exegesis) |
| **The Pulpit Commentary** | H. D. M. Spence & J. S. Exell (1880–1919) | **Public Domain** | Whole Bible (Historical / Homiletical) |
| **The Biblical Illustrator** | Joseph S. Exell (1887–1910) | **Public Domain** | Whole Bible (Illustrations & Sermons) |
| **Charles Ellicott's Commentary (ECER)** | Charles Ellicott (1819–1905) | **Public Domain** | Whole Bible (English Readers) |
| **The Expositor's Bible (EBC)** | W. Robertson Nicoll et al. (1887–1900) | **Public Domain** | Whole Bible (Theological Essays) |
| **A. T. Robertson's Word Pictures** | A. T. Robertson (1863–1934) | **Public Domain** | New Testament (Koine Greek Syntax) |
| **Marvin Vincent's Word Studies** | Marvin Vincent (1834–1922) | **Public Domain** | New Testament (Greek Etymology) |
| **John Wesley's Explanatory Notes** | John Wesley (1703–1791) | **Public Domain** | Whole Bible (Practical Holiness) |
| **Adam Clarke's Commentary** | Adam Clarke (1760–1832) | **Public Domain** | Whole Bible (Archaeology / Semitics) |
| **Joseph Benson's Commentary** | Joseph Benson (1749–1821) | **Public Domain** | Whole Bible (Early Methodist) |
| **Daniel Whedon's Commentary** | Daniel Whedon (1808–1885) | **Public Domain** | Whole Bible (Wesleyan-Arminian) |
| **John Peter Lange's Commentary** | John Peter Lange (1802–1884) | **Public Domain** | Whole Bible (Tri-fold Exegesis) |
| **Thomas Brooks' Expositions** | Thomas Brooks (1608–1680) | **Public Domain** | Whole Bible (Puritan Pastoral) |
| **Cambridge Bible (CBSC)** | A. F. Kirkpatrick (1849–1940) | **Public Domain** | Whole Bible (Grammatical / Historical) |
| **Preacher's Homiletical (PHC)** | Joseph S. Exell et al. (1892) | **Public Domain** | Whole Bible (Homiletic Analysis) |
| **International Critical (ICCNT)** | Pre-1928 Scholars | **Public Domain** | New Testament (Textual Criticism) |

*Tip: Use the `get_available_resources` MCP tool at any time to list all active translations, commentary aliases, and lexicons in your environment.*

---

## 🏛️ STEPBible Data Compilation & Integration

You can compile and import the latest open-access STEPBible datasets for both **local offline use** and **Cloudflare edge deployment**:

### 1. Compile Datasets
All compilation utilities are located in `berean-mcp/scripts/`:

```bash
cd berean-mcp

# Greek (TBESG) & Hebrew (TBESH) Lexicons (downloads & generates SQLite + D1 SQL)
python3 scripts/prepare_step_lexicon.py

# Tyndale Open Study Notes (compiles into standard SQLite commentary format)
python3 scripts/prepare_tnotes.py

# Septuagint (LXX), OT Quotations in NT, & Biblical Entities / Ancient Units
python3 scripts/prepare_lxx.py
python3 scripts/prepare_ot_in_nt.py
python3 scripts/prepare_entities_and_units.py
```

### 2. Local vs. Cloudflare Edge Deployment
* **100% Local Offline**: Compiled SQLite databases in `data/lexicons/step_lexicon.sqlite` and `data/commentaries/TNotes.commentary` (or `~/.biblemate/data/`) are automatically detected and loaded by `npm run start:stdio` and `npm run start:http`.
* **Cloudflare Edge (Workers + D1 + R2)**:
  * **Import Lexicon into D1**: `npx wrangler d1 execute biblemate-reference --remote --file=data/lexicons/step_lexicon_d1.sql` (or `python3 scripts/import_to_d1.py --only step`)
  * **Upload Auxiliaries to R2**: `python3 scripts/upload_auxiliary_to_r2.py` (or `npx wrangler r2 object put biblemate-data/commentaries/cTNotes.commentary --file=data/commentaries/TNotes.commentary --remote`)
  * **Deploy**: `npx wrangler deploy`

### 3. Verify & Test STEPBible Integration
Run the focused verification test suite:
```bash
cd berean-mcp
npx tsx scripts/test_step_lexicon.ts        # Test Greek & Hebrew extended Strong's
npx tsx scripts/test_tnotes.ts              # Test Tyndale study notes lookup
npx tsx scripts/test_septuagint.ts          # Test Septuagint & variants
npx tsx scripts/test_ot_in_nt.ts            # Test OT quotations in NT alignment
npx tsx scripts/test_entities_and_units.ts  # Test entity disambiguation & unit conversion
```

*(For comprehensive integration details and advanced options, see [docs/stepbible_data_integration.md](docs/stepbible_data_integration.md).)*

---

## 🚀 Getting Started

> [!TIP]
> **🤖 Recommended Setup: Let Your AI Coding Agent Handle It**:
> Installation and configuration are best and most effortlessly handled directly by your AI coding assistant (**Google Antigravity IDE**, **Claude Code**, **Cursor**, or **Windsurf**).
> 
> Simply clone the repository, open the workspace folder in your AI agent, and prompt:
> > *"Please set up the Berean Study Suite for me. Inspect my Node environment, install dependencies in berean-mcp, and run the typecheck plus focused service tests to verify all 35 tools work."*
> 
> Your agent will automatically inspect your environment, execute the setup steps, and ensure all tools and personas are ready for study.

### 1. Prerequisites
- **Node.js 18+**
- **Python 3.9+** (for dataset compilation and sync scripts)
- **Google Antigravity IDE**, **Claude Code**, or **Cursor**
- **Pandoc** (optional, for Word document exports: `brew install pandoc`)
- **Cloudflare Account (Optional)**: For zero-cost serverless edge deployment with Cloudflare Workers, D1, and R2 (not required for 100% local use).

### 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/victorgoh/berean-study-suite.git
   cd berean-study-suite
   ```

2. **Install MCP Server Dependencies**:
   ```bash
   cd berean-mcp
   npm install
   cd ..
   ```
   *(No build step required — `tsx` runs TypeScript directly)*

### 3. Running 100% Locally & Offline

You can run the entire Berean Study Suite completely offline on your computer—**zero cloud accounts, zero remote servers, and zero internet required**:

#### A. In Google Antigravity IDE
1. Open this repository folder in **Google Antigravity IDE**.
2. Connect the **Berean MCP Server** in your `mcp_config.json`.
3. Start studying immediately by prompting in the chat:
   > *"Run a Berean-Plus study on Ephesians 2:1-10"* *(or type `berean init` to install the `/berean-plus` UI shortcut)*.

#### B. In Claude Desktop / Cursor / VS Code (Local Stdio Mode)
To run the local Berean MCP server via standard input/output (`stdio`) directly from your machine:

Add `berean-local` to your `claude_desktop_config.json` or Cursor `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "berean-local": {
      "command": "npx",
      "args": ["-y", "tsx", "scripts/run_local_stdio.ts"],
      "cwd": "/path/to/berean-study-suite/berean-mcp"
    }
  }
}
```

#### C. Starting the MCP Server Manually

You can also start the MCP server directly from your terminal in either **Stdio** or **HTTP** mode:

* **1. Stdio Mode (Standard for CLI and Desktop MCP Clients)**:
  ```bash
  cd berean-mcp
  npm run start:stdio
  ```

* **2. Local HTTP Server Mode (for Web Apps, REST APIs, or Streamable HTTP on `localhost:7860`)**:
  ```bash
  cd berean-mcp
  npm run start:http
  ```
  * Web Study Explorer: `http://localhost:7860/`
  * Scalar API Docs: `http://localhost:7860/docs`
  * Swagger UI: `http://localhost:7860/swagger`
  * MCP Endpoint: `http://localhost:7860/mcp`
  * Health Check: `http://localhost:7860/health`

#### D. Testing Your Local Setup
Verify that all 35 tools, 12 composite study packs, and local SQLite databases are working:
```bash
cd berean-mcp
npm run typecheck
npx tsx scripts/test_all_services.ts
npx tsx scripts/test_composite_packs.ts
```

### 4. Using Berean in Any Project Workspace (`berean init` & `berean check`)

Once the **Berean MCP Server** is connected (either globally in `~/.gemini/config/mcp_config.json` or via edge endpoint `https://berean-mcp.victorgoh.workers.dev/mcp`), you can use Berean across **any project or workspace**:

* **⚡ Instant Setup (`berean init`)**: Type `"berean init"` in the AI chat. The assistant will automatically create `.agents/workflows/` and install the 4 lean slash shortcuts (`/berean`, `/berean-plus`, `/docx`, `/image`) in **1 second**.
* **🔍 Diagnose & Verify (`berean check`)**: Type `"berean check"` in the AI chat to verify MCP connection health, registered commentary databases, and workspace workflow status.

---

### 🤖 Troubleshooting & Effortless Setup with AI Coding Assistants
If you encounter any issues getting the suite to run (e.g., Node dependencies, MCP server endpoints, or client configuration), **let an AI agentic assistant troubleshoot and configure it for you**:

* **Google Antigravity IDE**: Open this workspace and ask the chat agent:
  > *"I'm having trouble getting the Berean Study Suite running. Please inspect my environment, fix any issues, and get everything working for me."*
* **Claude Code / Claude Desktop**: Run `claude` in this directory or connect via MCP (see [docs/mcp_client_integration.md](docs/mcp_client_integration.md)) and prompt:
  > *"Diagnose my Berean Study Suite setup, ensure all Node dependencies are installed, run typecheck and the focused service tests, and verify that all 35 MCP tools are live."*
* **Cursor / Windsurf**: Open this project in Agent mode and prompt:
  > *"Help me set up Berean Study Suite. Check my Node environment and ensure the MCP server tests pass."*

Any modern agentic coding assistant can autonomously inspect your local environment, install missing packages, resolve path issues, and verify that the tools are live.

---

## 🛠️ Customization & Extending the Suite (With Your AI Assistant)

> [!NOTE]
> *Note: The following customization suggestions and ideas are AI-generated to illustrate possibilities for extending the suite.*

Because Berean Study Suite is built on an open agentic architecture, you can prompt your AI coding assistant (Google Antigravity IDE, Claude Code, Cursor, or Windsurf) to expand and customize the suite for your specific study, teaching, or ministry needs:

### 1. 📚 Ingesting Custom Commentaries & Bible Versions
Prompt your AI assistant to convert and index custom resources:
> *"I have sermon notes and commentary notes in markdown/PDF format. Please help me convert them into a SQLite database matching the Berean schema and register it as a new commentary source in `databaseMap.ts`."*
* **Custom Translations**: Drop additional public domain SQLite `.bible` translations into `bibles/`.
* **Personal Archives**: Index personal sermon transcripts and study papers so the AI can reference them alongside classical commentators.

### 2. 👥 Creating New AI Theological Personas & Workflows
Expand the team of 15 personas or create specialized study workflows directly in `berean-mcp`:
> *"Add a new 'Early Church Patristics Scholar' persona to `src/mcp/prompts.ts` that analyzes passages from the perspective of the Ante-Nicene and Post-Nicene Church Fathers."*
> *"Register a new `/youth-lesson` workflow in `src/mcp/prompts.ts` and `src/mcp/resources.ts` that transforms deep passage exegesis into high-engagement teen discussion outlines with object lessons."*

### 3. 🔍 Semantic Vector Search & Concept RAG
Enhance keyword search with semantic understanding:
> *"Add a local vector embedding index (using ChromaDB or SQLite-vec) so I can search for biblical concepts and themes like 'peace in the midst of betrayal' across all commentaries."*

### 4. 📊 Visual Exegesis & Presentation Generation
Automate visual ministry materials:
> *"Create a script that converts `/lesson_creator_study_pack` outputs into formatted PowerPoint (`.pptx`) or Marp presentation slides for Sunday school."*
> *"Add automated grammatical sentence flow and chiasm diagram generators using Mermaid.js."*

### 5. 🎙️ Audio Devotionals (Text-to-Speech)
Build voice pipelines:
> *"Create a Python script that takes the daily reading and `/devotional_study_pack` output and generates a narrated MP3 devotional podcast using ElevenLabs or OpenAI TTS."*

### 6. 📓 Obsidian & Personal Knowledge Management (PKM) Sync
Connect your studies directly to your personal notes:
> *"Write a script to sync all generated study reports from `berean/` into my Obsidian vault, automatically formatting Scripture references and Strong's numbers as `[[wikilinks]]`."*

---

## 📁 Repository Structure

```
├── berean-mcp/           # Cloudflare Edge & Stdio MCP Server (TypeScript)
│   ├── src/              # Server implementation, 35 tools, prompts & resources
│   │   ├── mcp/          # Tool schemas, prompts, and resource definitions
│   │   ├── services/     # Bible, commentary, study pack & catalog engines
│   │   └── ui/           # Bible Study Explorer, Scalar & Swagger Web UIs
│   ├── scripts/          # Test scripts and Cloudflare database sync utilities
│   └── wrangler.jsonc    # Cloudflare Worker deployment configuration
├── docs/                 # Detailed architecture and user documentation
├── LICENSE               # GNU General Public License v3
└── README.md             # Project overview, quickstart & API links
```

---

## 📖 Documentation

- **[docs/mcp_client_integration.md](docs/mcp_client_integration.md)**: Multi-client setup guide for Antigravity IDE, Claude Desktop, Cursor, and VS Code.
- **[docs/ai_team_personas.md](docs/ai_team_personas.md)**: Profiles and guidelines for the 15 AI study personas.
- **[docs/slash_commands.md](docs/slash_commands.md)**: Reference guide for workflow commands and the 35 MCP tools.
- **[docs/stepbible_data_integration.md](docs/stepbible_data_integration.md)**: Compile, import, verify, and deploy STEPBible lexicons and related study datasets.
- **[docs/study_outputs.md](docs/study_outputs.md)**: Guide to study output formats, folder layouts, and document export.

---

## 🕊️ A Word from the Heart: Love Builds Up

> *"Knowledge puffs up, but love builds up."* — [1 Corinthians 8:1 (BSB)]

The **Berean Study Suite** was designed to remove friction from deep, rigorous biblical research—bringing original languages, textual exegesis, and centuries of classical commentary into an accessible, unified workspace.

However, biblical and theological study is never an end in itself. We earnestly encourage everyone who uses these tools to let them serve your **personal journey and intimacy with Jesus Christ**:

* **From Information to Transformation**: Do not let this suite merely become an instrument for intellectual knowledge that puffs up. Let every original language word study, grammatical analysis, and commentary insight draw your heart into deeper awe, humility, repentance, and worship before God.
* **To Love and Bless Others**: Let what you discover in Scripture overflow in genuine love, compassion, patience, and practical service toward your family, your local church, and your neighbors.
* **To Proclaim the Gospel of Grace**: Use these tools to equip yourself to preach faithfully, teach clearly, comfort the brokenhearted, and point those around you to the unfathomable love and saving grace of Jesus Christ.

*May your study of God's Holy Word bear lasting fruit in love for God and love for others.*

---

## 🙏 Acknowledgements & Attribution

Special thanks and deep appreciation to:
- **[Eliran Wong](https://github.com/eliranwong)** for his pioneering work on [Biblemate-Agentic-workspace](https://github.com/eliranwong/Biblemate-Agentic-workspace) as the foundational architecture on which this suite is built, and for creating and maintaining the indispensable [`biblematedata`](https://pypi.org/project/biblematedata/) package.
- **[STEPBible.org](https://www.stepbible.org/)** and **Tyndale House, Cambridge** for generously providing the open-access TBESG/TBESH Lexicons, Tyndale Open Study Notes, Septuagint alignment data, and biblical entity research data under Creative Commons licensing.
- The **Model Context Protocol (MCP)** community for establishing the open standard bridging language models and structured domain tools.
- All public domain biblical scholars, commentators, and translators whose lifelong labours continue to enrich students of Scripture worldwide.
