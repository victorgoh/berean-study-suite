# 📖 Berean Study Suite

*A comprehensive open-source biblical research suite combining a universal Cloudflare Edge & Stdio MCP Server with an autonomous AI agentic study studio.*

> [!NOTE]
> **Where Rigorous Scholarship Meets Agentic Power:** The **Berean Study Suite** pairs an ultra-fast edge Model Context Protocol (MCP) server with an autonomous research studio for pastors, theologians, translators, and students of Scripture.

---

## 🌟 Architecture Overview

The **Berean Study Suite** is a unified, local-first research platform featuring:

1. **Berean MCP Server (`berean-mcp`)**: Universal Model Context Protocol server providing **27 exegetical tools** (18 specialized single-engine tools + 9 high-speed composite Study Packs), 26 classical commentary sets, 7 Bible translations/manuscript editions, Greek/Hebrew lexicons, and full REST/OpenAPI/Swagger endpoints for any MCP client (Claude Desktop, Cursor, ChatGPT, Antigravity).
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
| **📖 Bible Study Explorer** | [https://berean-mcp.victorgoh.workers.dev/](https://berean-mcp.victorgoh.workers.dev/) | Reader-friendly Web UI to explore all 27 tools, scripture texts, and classical commentaries |
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

The **Berean MCP Server** delivers **27 total tools** (18 specialized single-engine tools and 9 high-performance composite study packs):

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

### 2. Specialized Single-Engine Tools
- **Scripture & Texts**: `bible_lookup`, `bible_search`, `daily_reading`
- **Commentaries**: `commentary_lookup` (26 classical commentary sets with intelligent alias resolution)
- **Linguistics & Morphology**: `lexicon_lookup` (Strong's, Thayer, BDB, LSJ), `morphology_lookup` (Greek & Hebrew word-by-word syntax)
- **Topical & Reference**: `topic_study`, `character_lookup` (with ancestry and relationship trees), `location_lookup` (with GPS coordinates and map links), `theological_dictionary` (Easton's, ISBE Encyclopedia, Smith's), `biblical_promises`
- **Context & Structure**: `parallel_passages` (Gospel harmonies and OT parallels), `book_analysis`, `chapter_summary`, `bible_names`, `chronology`, `cross_references`
- **Discovery**: `get_available_resources` (Real-time listing of active bibles, commentaries, lexicons, study packs, personas, skills, workflows, and rules)

---

## 📚 Classical Commentaries & Reference Data

All classical commentary databases, lexicons, and biblical reference datasets are powered by upstream [`biblematedata`](https://pypi.org/project/biblematedata/) and **[STEPBible.org](https://www.stepbible.org/)** (Tyndale House, Cambridge):

- **Classical Exegesis & Homiletics**: Access extensive whole-Bible and testament-specific works by **Matthew Henry, John Calvin, John Gill, Jamieson-Fausset-Brown, Alexander Maclaren, Charles Spurgeon, Keil & Delitzsch, H. A. W. Meyer, Charles Simeon, Albert Barnes, Charles Ellicott**, and many others.
- **STEPBible Original Language Lexicons (TBESG & TBESH)**: Extended Greek and Hebrew Strong's lexicons with disambiguated senses, transliterations, and morphological classifications from Tyndale House, Cambridge (CC BY 4.0).
- **Tyndale Open Study Notes (TNotes)**: High-density historical-grammatical and exegetical study notes compiled by Tyndale House scholars.
- **Dynamic Resource Discovery**: Use the `get_available_resources` MCP tool at any time to list all active translations, commentary aliases, and lexicons available in your current environment.
- **Data Integration Guide**: See [docs/stepbible_data_integration.md](docs/stepbible_data_integration.md) for full compilation and deployment steps.

---

## 🚀 Getting Started

> [!TIP]
> **🤖 Recommended Setup: Let Your AI Coding Agent Handle It**:
> Installation and configuration are best and most effortlessly handled directly by your AI coding assistant (**Google Antigravity IDE**, **Claude Code**, **Cursor**, or **Windsurf**).
> 
> Simply clone the repository, open the workspace folder in your AI agent, and prompt:
> > *"Please set up the Berean Study Suite for me. Inspect my Node environment, install dependencies in berean-mcp, and run the test suite to verify all 27 tools work."*
> 
> Your agent will automatically inspect your environment, execute the setup steps, and ensure all tools and personas are ready for study.

### 1. Prerequisites
- **Node.js 18+**
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
Verify that all 18 specialized single-engine tools, 9 composite study packs, and local SQLite databases are working:
```bash
cd berean-mcp
npm test
```
*(You should see all 27 automated tests pass with 0 failures.)*

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
  > *"Diagnose my Berean Study Suite setup, ensure all Node dependencies are installed, and test that all 27 MCP tools are live."*
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
│   ├── src/              # Server implementation, 27 tools, prompts & resources
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
- **[docs/stepbible_data_integration.md](docs/stepbible_data_integration.md)**: Guide on compiling, integrating, and deploying STEPBible datasets (TBESG, TBESH, Tyndale Open Study Notes, Septuagint, and OT in NT).
- **[docs/ai_team_personas.md](docs/ai_team_personas.md)**: Profiles and guidelines for the 15 AI study personas.
- **[docs/slash_commands.md](docs/slash_commands.md)**: Reference guide for workflow commands and the 27 MCP tools.
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
- **[STEPBible.org](https://www.stepbible.org/)** and **Tyndale House, Cambridge** for generously publishing the TBESG Greek Lexicon, TBESH Hebrew Lexicon, and Tyndale Open Study Notes under open-access Creative Commons licenses.
- The **Model Context Protocol (MCP)** community for establishing the open standard bridging language models and structured domain tools.
- All public domain biblical scholars, commentators, and translators whose lifelong labours continue to enrich students of Scripture worldwide.
