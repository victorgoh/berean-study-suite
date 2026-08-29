# 📖 Berean Study Suite

*A comprehensive open-source biblical research suite combining a universal Cloudflare Edge & Stdio MCP Server with an autonomous AI agentic study studio.*

> [!NOTE]
> **Where Rigorous Scholarship Meets Agentic Power:** The **Berean Study Suite** pairs an ultra-fast edge Model Context Protocol (MCP) server with an autonomous research studio for pastors, theologians, translators, and students of Scripture.

---

## 🌟 Architecture Overview

The **Berean Study Suite** is a unified, local-first research platform featuring:

1. **Berean MCP Server (`berean-mcp`)**: Universal Model Context Protocol server providing **24 exegetical tools**, 26 classical commentaries, Greek/Hebrew lexicons, and 8 high-speed composite Study Packs for any MCP client (Claude Desktop, Cursor, ChatGPT, Antigravity).
2. **Berean Agentic Studio (`.agents/`)**: Autonomous AI study orchestration powered by 15 customized theological personas, dynamic multi-phase study pipelines (`/berean`, `/berean-plus`), and automatic local document authoring.

---

## ⚡ The Signature AI Study Pipelines

### 1. `/berean` — Phased Autonomous Exegesis & Synthesis
Backed by [`.agents/skills/berean`](.agents/skills/berean), `/berean` runs a structured 5-phase research pipeline:
* **Phase 1: Study Planning & Goal Setting** — Generates a master study plan tailored to the user's passage, topic, or sermon seed.
* **Phase 2: Local Scripture & Exegetical Data Retrieval** — Queries verified SQLite databases via `berean-mcp` tools, completely eliminating AI scripture hallucinations.
* **Phase 3: Exegesis & Contextual Analysis** — Engages OT/NT biblical scholars to analyze original Greek/Hebrew syntax, morphology, and historical backgrounds.
* **Phase 4: Systematic & Redemptive-Historical Synthesis** — Evaluates covenantal themes and redemptive trajectories.
* **Phase 5: Pastoral & Practical Application** — Crafts gospel-centered applications, first-person prayers, and small-group questions.
* **Iterative Final Manuscript** — Runs an iterative draft-audit-revision loop (minimum 2 cycles) adopting the *Master Biblical Writer* persona to produce a publication-quality manuscript.

### 2. `/berean-plus` — Dynamic & Goal-Oriented Research
Backed by [`.agents/skills/berean-plus`](.agents/skills/berean-plus), `/berean-plus` is designed for complex, specialized, or non-standard research requests:
* 🗺️ **Dynamic Phased Planning**: Formulates custom phases aligned directly with user research requirements.
* 🎭 **Dynamic Persona Matching**: Dynamically assigns the most suitable theological persona to each sub-task.
* 🎯 **Goal-Oriented Checkpoint Audits**: After each phase, the *Study Plan & Phase Quality Auditor* audits the findings, identifies gaps, injects follow-up steps, and re-audits before proceeding.

---

## 🛠️ Berean MCP Server (`berean-mcp`)

The **Berean MCP Server** delivers 24 granular tools and 8 high-performance composite study packs:

### Core Tool Categories
- **Scripture & Texts**: `bible_lookup`, `bible_search`, `original_language_lookup`, `interlinear_lookup`
- **Commentaries & Classics**: `commentary_lookup`, `classic_commentary_search`, `classic_text_lookup`
- **Linguistics & Morphology**: `lexicon_lookup`, `morphology_lookup`, `original_language_study`
- **Topical & Reference**: `topic_study`, `character_lookup`, `location_lookup`, `theological_dictionary`, `biblical_promises`
- **Context & Structure**: `parallel_passages`, `book_analysis`, `chapter_summary`, `cross_references`

### High-Speed Composite Study Packs
- `passage_exegesis_pack` — Aggregates Scripture translations, commentaries, original language morphology, and cross-references in one call.
- `word_study_pack` — Combines Strong's definitions, lexicon entries, grammatical occurrences, and theological significance.
- `topic_study_pack` — Combines topical outlines, key scriptures, theological dictionary entries, and promises.
- `sermon_study_pack` — Fetches text, commentaries, themes, outlines, and pastoral application insights.
- `devotional_study_pack` — Gathers scripture, devotional commentaries, and prayer guides.
- `lesson_creator_study_pack` — Produces structured lesson outlines, discussion questions, and background context.
- `covenant_theology_pack` — Traces redemptive covenants throughout Scripture.

---

## 🚀 Getting Started

> [!TIP]
> **🤖 Recommended Setup: Let Your AI Coding Agent Handle It**:
> Installation and configuration are best and most effortlessly handled directly by your AI coding assistant (**Google Antigravity IDE**, **Claude Code**, **Cursor**, or **Windsurf**).
> 
> Simply clone the repository, open the workspace folder in your AI agent, and prompt:
> > *"Please set up the Berean Study Suite for me. Inspect my Python and Node environment, install the dependencies from requirements.txt, download the local scripture databases via biblematedata, build the MCP server, and run the test suite to verify everything works."*
> 
> Your agent will automatically inspect your environment, execute the setup steps, and ensure all tools and personas are ready for study.

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** (for the MCP server)
- **Google Antigravity IDE**, **Claude Code**, or **Cursor**
- **Pandoc** (optional, for Word document exports: `brew install pandoc`)
- **Remote Cloud Deployment (Optional)**:
  - **Cloudflare Account** (for serverless edge deployment with Cloudflare Workers, D1, and R2)
  - **Hugging Face Account** (optional, for Docker-based Space hosting)

### 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/victorgoh/berean-study-suite.git
   cd berean-study-suite
   ```

2. **Install Python dependencies & Scripture Database**:
   ```bash
   pip install -r requirements.txt
   biblematedata
   ```

3. **Install Node Dependencies for the MCP Server**:
   ```bash
   cd berean-mcp
   npm install
   cd ..
   ```
   *(No `npm run build` required — `tsx` runs TypeScript directly)*

### 3. Running 100% Locally & Offline

You can run the entire Berean Study Suite completely offline on your computer—**zero cloud accounts, zero remote servers, and zero internet required**:

#### A. In Google Antigravity IDE
1. Open this repository folder in **Google Antigravity IDE**.
2. The `.agents/` configuration is auto-discovered, giving you immediate local access to the **15 theological personas**, slash workflows (`/berean`, `/berean-plus`, `/docx`, `/image`), and all MCP tools.
3. Start studying immediately by typing in the chat:
   > `/berean-plus Give me a comprehensive study of Ephesians 2:1-10`

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
  * Endpoint: `http://localhost:7860/mcp`
  * Health Check: `http://localhost:7860/health`

#### D. Testing Your Local Setup
Verify that all 18 granular tools, 8 composite study packs, and local SQLite databases are working:
```bash
cd berean-mcp
npx tsx scripts/test_all_services.ts
```
*(You should see all 27 automated tests pass with 0 failures.)*

---

### 🤖 Troubleshooting & Effortless Setup with AI Coding Assistants
If you encounter any issues getting the suite to run (e.g., Python interpreter paths, Node dependencies, database setup, or MCP server endpoints), **let an AI agentic assistant troubleshoot and configure it for you**:

* **Google Antigravity IDE**: Open this workspace and ask the chat agent:
  > *"I'm having trouble getting the Berean Study Suite running. Please inspect my environment, fix any issues, and get everything working for me."*
* **Claude Code / Claude Desktop**: Run `claude` in this directory or connect via MCP (see [docs/mcp_client_integration.md](docs/mcp_client_integration.md)) and prompt:
  > *"Diagnose my Berean Study Suite setup, build the MCP server, and ensure all local dependencies and databases are ready."*
* **Cursor / Windsurf**: Open this project in Agent mode and prompt:
  > *"Help me set up Berean Study Suite. Check my Python/Node environment and ensure the MCP server builds cleanly."*

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
Expand the team of 15 personas or create specialized study workflows:
> *"Add a new 'Early Church Patristics Scholar' persona to `.agents/agents.md` that analyzes passages from the perspective of the Ante-Nicene and Post-Nicene Church Fathers."*
> *"Create a new `/youth-lesson` workflow in `.agents/workflows/` that transforms deep passage exegesis into high-engagement teen discussion outlines with object lessons."*

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
├── .agents/              # Agentic studio config (personas, plugin, workflows)
│   ├── agents.md         # 15 customized theological AI personas
│   ├── plugins/berean/   # Self-contained Berean agent plugin & MCP config
│   ├── skills/           # Autonomous orchestrator skills (berean, berean-plus)
│   └── workflows/        # Core slash commands (/berean, /berean-plus, /image, /docx)
├── berean-mcp/           # Cloudflare Edge & Stdio MCP Server (TypeScript)
│   ├── src/              # Server implementation, tools, and services
│   ├── scripts/          # Test scripts and database sync utilities
│   └── wrangler.jsonc    # Cloudflare Worker deployment configuration
├── berean/               # Saved study outputs, manuscripts, and reports
├── images/               # Generated biblical illustrations and visual aids
├── notes/                # User research notes and custom documents
├── export/               # Exported Word documents (.docx) and bundles
└── docs/                 # Detailed architecture and user documentation
```

---

## 📖 Documentation

- **[docs/mcp_client_integration.md](docs/mcp_client_integration.md)**: Multi-client setup guide for Antigravity IDE, Claude Desktop, Cursor, and VS Code.
- **[docs/ai_team_personas.md](docs/ai_team_personas.md)**: Profiles and guidelines for the 15 AI study personas.
- **[docs/slash_commands.md](docs/slash_commands.md)**: Reference guide for workflow commands and the 24 MCP tools.
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
- The **Model Context Protocol (MCP)** community for establishing the open standard bridging language models and structured domain tools.
- All public domain biblical scholars, commentators, and translators whose lifelong labours continue to enrich students of Scripture worldwide.
