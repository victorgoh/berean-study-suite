# Berean MCP Server (Cloudflare Edge Edition)

A comprehensive Model Context Protocol (MCP) Server for biblical study, theological exegesis, scripture search, Strong's lexicons, original language morphology, classical commentary sets, and AI study personas.

Designed to run **100% free on Cloudflare Workers** with data hosted in **Cloudflare R2** and **Cloudflare D1**.

---

## ⚡ Architecture & Performance

- **26 MCP Tools & 8 Composite Study Packs**: Provides granular single-engine tools as well as high-speed composite Study Packs delivering up to 170,000 characters (~30,000 words) of verified biblical analysis in a single round-trip.
- **Edge Cloudflare Execution**: Sub-50ms cold start, multi-tier LRU caching, and streaming JSON-RPC / Streamable HTTP transports.
- **Hybrid Storage**:
  - **Cloudflare D1 (Serverless SQLite)**: Ultra-fast indexing for Strong's Hebrew Lexicon (BDB), ISBE/Easton's Encyclopedias, and OT/NT Morphological datasets.
  - **Cloudflare R2 (Object Storage)**: High-capacity storage for 29 classical commentary sets, BSB/NET/KJV/OHGB Bible databases, and cross-reference collections.
- **Token Optimization**: Reclaims **33,000+ tokens of context window** on every turn.

---

## 🔒 Security & Authentication

The server supports private API Key / Bearer Token authorization enforced at Cloudflare's global edge:

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

## 📚 Available Classical Commentary Sets (in `biblematedata`)

| Commentary / Author | MCP Key Alias | Scope | Focus |
| :--- | :--- | :--- | :--- |
| **Matthew Henry** | `Henry` | Whole Bible | Classic Puritan practical aphorisms & devotional depth |
| **Jamieson-Fausset-Brown** | `JFB` | Whole Bible | Concise, balanced grammatical & historical synthesis |
| **John Calvin** | `Calvin` | Whole Bible | Reformational exegesis with Christocentric covenant focus |
| **John Gill** | `Gill` | Whole Bible | Exhaustive exposition with Second Temple rabbinic context |
| **Albert Barnes** | `Barnes` | Whole Bible | Verse-by-verse notes highlighting practical teaching lessons |
| **Alexander Maclaren** | `MacL` | Whole Bible | Vivid homiletical gems & structural preaching insights |
| **Charles Simeon** | `HH` | Whole Bible | 2,536 Homiletical preaching outlines (*Horae Homileticae*) |
| **The Biblical Illustrator** | `BI` | Whole Bible | 57 volumes of sermon illustrations & historical anecdotes |
| **Charles Spurgeon** | `Spur` | Whole Bible | *Treasury of David* on Psalms & devotional expositions |
| **Keil & Delitzsch** | `KD` | Old Testament | Gold standard academic Hebrew grammar & Ancient Near East |
| **H. A. W. Meyer** | `CECNT` | New Testament | Authoritative academic Greek grammatical exegesis |
| **Expositor's Greek NT** | `EGNT` | New Testament | Critical & grammatical Greek Testament exegesis |
| **Adam Clarke** | `Clarke` | Whole Bible | Semitic customs, philology, and biblical archaeology |
| **Joseph Benson** | `Benson` | Whole Bible | Methodist notes on holy living & pastoral examination |
| **John Wesley** | `Wesley` | Whole Bible | Pithy notes on heart holiness, grace, and obedience |
| **The Pulpit Commentary** | `Pulpit` | Whole Bible | Multi-volume historical introductions & homiletic outlines |
| **The Expositor's Bible** | `EBC` | Whole Bible | Thematic essay lectures & in-depth chapter expositions |
| **Charles Ellicott** | `ECER` | Whole Bible | Lay-accessible commentary synthesizing critical scholarship |
| **A. T. Robertson** | `Rob` | New Testament | World-renowned Koine Greek syntax & word pictures |
| **Marvin Vincent** | `Vincent` | New Testament | Greek lexical etymology & cultural imagery |
| **Daniel Whedon** | `Whedon` | Whole Bible | Wesleyan-Arminian biblical commentary with logical rigor |
| **John Peter Lange** | `Lange` | Whole Bible | Tri-fold Exegetical, Doctrinal, and Homiletical analysis |
| **Cambridge Bible (CBSC)** | `CBSC` | Whole Bible | Scholarly historical and grammatical notes |
| **Thomas Brooks** | `Brooks` | Whole Bible | Puritan spiritual treatises & pastoral aphorisms |
| **Preacher's Homiletical** | `PHC` | Whole Bible | Comprehensive paragraph-by-paragraph sermon outlines |

---

## 🛠️ Complete MCP Tool Catalog

### 1. Composite Study Packs (High-Speed Single-Turn Endpoints)
1. **`sermon_study_pack`**: Bundles Scripture (BSB), Alexander Maclaren (Expository Structure), Charles Simeon (Preaching Outline), Biblical Illustrator (Illustrations), Matthew Henry (Puritan Insights), and TSK Cross-References.
2. **`devotional_study_pack`**: Bundles Scripture, Alexander Maclaren, Charles Spurgeon (Adoration), Albert Barnes (Practical Remarks), Matthew Henry (Aphorisms), and Biblical Promises.
3. **`passage_exegesis_pack`**: Bundles Primary Translation, OHGB Original Greek/Hebrew, Keil & Delitzsch (OT) / H.A.W. Meyer (NT), Expositor's Greek NT, The Pulpit Commentary, and JFB.
4. **`word_study_pack`**: Bundles Strong's/Thayer/BDB Lexicons, In-Context Morphology, and A.T. Robertson / Marvin Vincent Word Studies.
5. **`lesson_creator_study_pack`**: Bundles Scripture, Chapter Summaries, Charles Ellicott, Albert Barnes, and The Expositor's Bible for teachers.
6. **`prayer_guide_study_pack`**: Bundles Scripture, Charles Spurgeon / Joseph Benson Adoration, John Wesley Examination, and Biblical Promises for 1st-person ACTS prayer.
7. **`covenant_theology_pack`**: Bundles Scripture, John Calvin's Covenant Exposition, John Gill's Prophecy, ISBE Encyclopedia, and Canonical Cross-References.
8. **`commentary_study_pack`**: Dynamic multi-commentary bundler allowing custom multi-perspective lookups across any subset of the available commentators in a single call.

### 2. Specialized Single-Engine Tools
9. **`bible_lookup`**: Retrieve full chapter and verse ranges across BSB, NET, KJV, ASV, WEB, and OHGB.
10. **`bible_search`**: High-speed full-text search with regex and testament filters.
11. **`commentary_lookup`**: Query any individual commentator with intelligent alias normalization.
12. **`cross_references`**: Query Treasury of Scripture Knowledge (TSK) cross-reference collections.
13. **`lexicon_lookup`**: Strong's, Thayer's Greek, BDB Hebrew, and LSJ Lexicons.
14. **`morphology_lookup`**: Original language grammatical and parsing breakdowns.
15. **`topic_study`**: Topical concordance lookups (Nave's & Torrey's).
16. **`character_lookup`**: Biographical profiles of biblical figures.
17. **`location_lookup`**: GPS coordinates and Google Maps links for biblical cities and sites.
18. **`theological_dictionary`**: Easton's Bible Dictionary and ISBE Encyclopedia entries.
19. **`parallel_passages`**: Gospel harmonies and synoptic comparisons.
20. **`biblical_promises`**: Topic-indexed biblical promises for faith and prayer.
21. **`book_analysis`**: Historical background, authorship, and date for all 66 books.
22. **`chapter_summary`**: Structural summaries and central themes for any chapter.
23. **`bible_names`**: Etymological meanings and origins of biblical names.
24. **`chronology`**: Biblical timelines and historical genealogies.
25. **`daily_reading`**: 365-day whole-Bible reading schedules with automatic Scripture embedding.
26. **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, and study packs.

---

## 🚀 Deployment Options

### Option 1: Deploy to Cloudflare Workers (Serverless Edge)

Cloudflare Workers provides sub-50ms cold starts on Cloudflare's global edge network.

**Prerequisite**: A free [Cloudflare Account](https://dash.cloudflare.com/sign-up) (authenticated via `npx wrangler login`).

> [!TIP]
> **🤖 Automated AI-Agent Deployment (Recommended)**:
> The entire Cloudflare deployment process—including creating R2 buckets, uploading databases, provisioning D1 databases, updating database IDs in `wrangler.jsonc`, and deploying the worker—**is designed to be orchestrated directly by your AI coding agent** (Antigravity IDE, Claude Code, Cursor, or Windsurf). You do **not** need to manually execute these terminal commands one-by-one.
> 
> Simply open this project in your AI coding assistant and prompt:
> > *"Please deploy my Berean MCP server to Cloudflare Workers. Create the R2 bucket, upload the databases from biblematedata using the sync scripts, provision the D1 databases for morphology and references, update wrangler.jsonc, and deploy the live worker."*

#### ⚠️ Critical Storage Architecture Warnings:
> [!IMPORTANT]
> **Cloudflare D1 (Serverless Relational SQLite)** vs **Cloudflare R2 (Object Storage)**:
> 
> - **Use Cloudflare D1 for Index & Morphology Databases**:
>   - D1 is specifically designed for high-frequency, row-level SQL queries (e.g. `morphology.sqlite` for word-by-word Greek/Hebrew grammatical parsing and `berean-reference` for topic/dictionary indexes).
>   - **Warning**: D1 has strict database size constraints (500 MB on the free tier, 10 GB on paid) and batch execution limits. **Never** attempt to dump raw multi-gigabyte commentary collections or audio blobs into D1.
> 
> - **Use Cloudflare R2 for Large Commentary & Bible Files**:
>   - R2 is designed for zero-egress-fee, high-capacity object storage. It holds individual commentary files (e.g. `cHenry.commentary`, `cMacL.commentary`, `cBI.commentary`), entire Bible translation files (`BSB.bible`, `NET.bible`), and auxiliary index JSONs.
>   - **Warning**: R2 stores static read-only database files. Cloudflare Workers stream or query these via SQLite WASM in-memory. Do not attempt to write live transactions to R2 objects during query execution.

#### Reference Execution Flow (Handled by AI Agent):

```bash
# 1. Install dependencies & typecheck
cd berean-mcp
npm install
npm run typecheck

# 2. Setup Cloudflare R2 Bucket & Upload Commentary/Bible Files
# (Ensures local data is downloaded: pip install -r ../requirements.txt && biblematedata)
npx wrangler r2 bucket create biblemate-data
python3 scripts/sync_data_to_r2.py --bucket biblemate-data

# 3. Setup Cloudflare D1 Databases & Import Morphology/Reference Indexes
npx wrangler d1 create berean-morphology
npx wrangler d1 create berean-reference
# (The agent automatically updates database_id values in wrangler.jsonc)
python3 scripts/import_to_d1.py

# 4. Deploy Worker to Cloudflare Global Edge
npm run deploy

# 5. Set Private API Key Secret for Authentication
npx wrangler secret put API_KEY
```

---

### Option 2: Self-Hosted Container Deployment (Docker / Fly.io)

You can run `berean-mcp` as a standalone, self-contained container on **Fly.io**, **Railway**, or any **VPS/Docker host**. The included `Dockerfile` downloads the complete SQLite databases into the image during build.

1. **Deploy to Fly.io**:
   ```bash
   cd berean-mcp
   fly launch --no-deploy
   fly deploy
   ```
2. **Or Run Locally with Docker**:
   ```bash
   cd berean-mcp
   docker build -t berean-mcp .
   docker run -d -p 7860:7860 --name berean-mcp berean-mcp
   ```
3. **Connect Antigravity / Clients**:
   Use your container URL (e.g. `http://localhost:7860/mcp` or `https://berean-mcp.fly.dev/mcp`) in `mcp_config.json`:
   ```json
   {
     "mcpServers": {
       "berean": {
         "url": "https://berean-mcp.fly.dev/mcp",
         "transport": "streamable-http"
       }
     }
   }
   ```

---

### Option 3: Run Locally (Local Offline Node.js / Stdio & HTTP)

Zero internet required. Runs directly on your machine using your local `~/.biblemate/data` databases:

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
