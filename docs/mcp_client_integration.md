# Berean MCP Server: Multi-Client Integration Guide

This guide explains how to connect and use the **Berean Model Context Protocol (MCP) Server** across all major AI coding assistants and desktop environments: **Google Antigravity IDE**, **Claude Desktop / Claude Code**, **Cursor**, **VS Code**, and **LibreChat / Custom Clients**.

---

## ⚡ Overview & Endpoints

The Berean MCP Server provides access to **25 verified classical public domain commentary sets**, original language Hebrew/Greek morphology, Strong's lexicons, and 8 composite Study Packs.

### Available Production Endpoints

| Environment | Transport | Endpoint URL |
| :--- | :--- | :--- |
| **Cloudflare Workers (Global Edge)** | Streamable HTTP | `https://berean-mcp.<your-subdomain>.workers.dev/mcp?key=YOUR_API_KEY` |
| **Local Machine (Zero Network)** | Stdio | `npx -y tsx berean-mcp/scripts/run_local_stdio.ts` |
| **Local Machine (Local HTTP Server)** | Streamable HTTP | `http://localhost:7860/mcp` |

---

## 🔌 Client Setup Configurations

### 1. Google Antigravity IDE

Add the server to your `mcp_config.json` (located in `~/.gemini/config/mcp_config.json` or workspace configuration):

```json
{
  "mcpServers": {
    "berean": {
      "serverUrl": "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

*For local offline mode (no internet required):*
```json
{
  "mcpServers": {
    "berean-local": {
      "command": "npx",
      "args": ["-y", "tsx", "scripts/run_local_stdio.ts"],
      "cwd": "/path/to/berean-study-suite/berean-mcp",
      "env": {
        "BEREAN_DATA": "/path/to/berean/data"
      }
    }
  }
}
```

---

### 2. Claude Desktop / Claude Code (Anthropic)

Add Berean MCP to your `claude_desktop_config.json` (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "berean": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-proxy",
        "https://berean-mcp.<your-subdomain>.workers.dev/mcp?key=YOUR_API_KEY"
      ]
    }
  }
}
```

*For local offline execution directly with Node.js:*
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

---

### 3. Cursor & VS Code

In Cursor Settings → **Features** → **MCP Servers** → **Add New MCP Server** (or `.cursor/mcp.json`):

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

---

### 4. LibreChat / Custom Web Clients

In your `librechat.yaml` configuration:

```yaml
mcpServers:
  berean:
    type: "streamable-http"
    url: "https://berean-mcp.<your-subdomain>.workers.dev/mcp"
    headers:
      Authorization: "Bearer YOUR_API_KEY"
```

---

## 🛠️ Available MCP Tools

### 📦 Composite Study Packs (Single-Turn Synthesis)

| Tool Name | Focus & Included Resources |
| :--- | :--- |
| **`covenant_theology_pack`** | Redemptive-historical covenant progression, Calvin exegesis, Matthew Henry architecture, Gill prophecy, ISBE encyclopedia, and 12 TSK cross-references. |
| **`passage_exegesis_pack`** | Detailed academic exegesis: Greek/Hebrew text, morphology, Keil & Delitzsch (`KD`), Expositor's Greek NT (`EGNT`), H. A. W. Meyer (`CECNT`), Clarke, The Pulpit Commentary, and JFB. |
| **`sermon_study_pack`** | Homiletics & preaching: Scripture, Alexander Maclaren, Charles Simeon (Horae Homileticae), The Biblical Illustrator, Matthew Henry, and TSK cross-references. |
| **`lesson_creator_study_pack`** | Bible teaching & small groups: Scripture text, chapter summaries, Charles Ellicott, Albert Barnes, and The Expositor's Bible. |
| **`devotional_study_pack`** | Pastoral meditation: Scripture text, Charles Spurgeon, Alexander Maclaren, Albert Barnes, Matthew Henry, and biblical promises. |
| **`prayer_guide_study_pack`** | Scriptural intercession: Scripture text, Charles Spurgeon, Joseph Benson, John Wesley, and biblical promises for ACTS prayer. |
| **`word_study_pack`** | Deep word study: Strong's Concordance, BDB / Thayer lexicons, morphology occurrences, A. T. Robertson, and Marvin Vincent. |
| **`topic_study_pack`** | Systematic topical study: Easton's Bible Dictionary, Nave's Topical definitions, and biblical promises. |
| **`commentary_study_pack`** | Multi-commentator comparison: Synthesizes custom commentators side-by-side on any passage. |

---

### 📖 Granular Tools

- **`bible_lookup`**: Retrieve full passages from BSB, NET, KJV, or OHGB (Original Hebrew/Greek).
- **`bible_search`**: High-speed keyword search with book/testament filters and wildcards.
- **`commentary_lookup`**: Query any of the active public domain commentaries in `biblematedata` (e.g. `Henry`, `JFB`, `Calvin`, `Gill`, `MacL`, `Barnes`, `Spur`, `Clarke`, `Wesley`, `Benson`, `Pulpit`, `EGNT`, `CECNT`, `ECER`, `EBC`, `KD`, `Lange`, `Rob`, `Vincent`, `Whedon`, `CBSC`, `Brooks`, `PHC`, `HH`, `BI`).
- **`cross_references`**: Retrieve Treasury of Scripture Knowledge (TSK) cross-references ranked by relevance votes.
- **`morphology_lookup`**: Word-by-word grammatical tagging, lemma roots, transliterations, and glosses for any Old or New Testament verse.
- **`lexicon_lookup`**: Comprehensive lexical definitions from Strong's, Brown-Driver-Briggs (BDB), and Thayer's Greek Lexicon.
- **`theological_dictionary`**: Query Easton's Bible Dictionary or International Standard Bible Encyclopedia (ISBE).
- **`parallel_passages`**: Side-by-side Gospel parallels, Old Testament synoptic parallels, and quote fulfillments.
- **`daily_reading`**: Daily Bible reading plan with scripture retrieval.
- **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, and study packs.

---

## 🔒 Security & Verification (Cloudflare Deployment Example)

To verify that your Cloudflare Workers deployment is active, healthy, and authenticated:

```bash
# Test Health Endpoint (Cloudflare deployment example)
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health

# Test Bible Lookup via REST
curl -s -X POST "https://berean-mcp.<your-subdomain>.workers.dev/tools/bible_lookup?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version":"BSB","reference":"John 3:16"}'
```
