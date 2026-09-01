# Berean MCP Server: Multi-Client Integration Guide

This guide explains how to connect and use the **Berean Model Context Protocol (MCP) Server** across all major AI coding assistants and desktop environments: **Google Antigravity IDE**, **Claude Desktop / Claude Code**, **Cursor**, **VS Code**, and **LibreChat / Custom Clients**.

---

## ⚡ Overview & Endpoints

The Berean MCP Server provides access to verified classical and modern commentary sets, original-language Hebrew/Greek morphology, Strong's lexicons, and composite Study Packs according to the configured MCP profile. Use `tools/list` or `get_available_resources` to discover the current tools.

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

> **Token and context note:** Composite Study Packs are convenient for human research because they assemble several related resources into one readable response. That same design can produce a large MCP result and increase token usage, latency, and context-window pressure in an AI client. For routine AI requests, prefer a specific Bible, commentary, lexicon, morphology, or cross-reference lookup. Request a composite pack when its broader context is genuinely useful.

For AI-assisted research, use one commentary per request and select the preferred commentary explicitly when needed. The Explorer supports multi-commentary comparison and Study Packs for human readers; those composite tools are human-oriented and should be omitted from an AI-facing MCP tool set.

Large dictionary and encyclopedia articles are standalone resources. They are
not automatically embedded in AI-oriented responses. If a complete article is
larger than the MCP response limit, the request returns an explicit
`RESOURCE_TOO_LARGE` result rather than silently truncating the source. Use the
human Explorer for complete long-form articles.

| Tool Name | Focus & Included Resources |
| :--- | :--- |
| **`covenant_theology_pack`** | Redemptive-historical covenant progression, Calvin exegesis, Matthew Henry architecture, Gill prophecy, ISBE encyclopedia, and 12 TSK cross-references. |
| **`passage_exegesis_pack`** | Detailed academic exegesis: Greek/Hebrew text, morphology, Keil & Delitzsch (`KD`), Expositor's Greek NT (`EGNT`), H. A. W. Meyer (`CECNT`), Clarke, The Pulpit Commentary, and JFB. |
| **`sermon_study_pack`** | Focused homiletics & preaching: Scripture, Alexander Maclaren, Charles Simeon (Horae Homileticae), and TSK cross-references. |
| **`illustration_study_pack`** | Opt-in Biblical Illustrator anecdotes and sermon illustrations. This intentionally fuller source is separate from the default sermon pack. |
| **`lesson_creator_study_pack`** | Focused Bible teaching & small groups: Scripture text, a sourced chapter opening, Charles Ellicott, and cross-references. |
| **`devotional_study_pack`** | Concise pastoral meditation: Scripture text, Tyndale Open Study Notes, Matthew Henry Concise Commentary, and biblical promises. |
| **`prayer_guide_study_pack`** | Scriptural intercession: Scripture text, Charles Spurgeon, Joseph Benson, John Wesley, and biblical promises for ACTS prayer. |
| **`word_study_pack`** | Deep word study: Strong's Concordance, BDB / Thayer lexicons, morphology occurrences, A. T. Robertson, and Marvin Vincent. |
| **`topic_study_pack`** | Systematic topical study: Easton's Bible Dictionary, Nave's Topical definitions, and biblical promises. |
| **`commentary_study_pack`** | Multi-commentator comparison: Synthesizes custom commentators side-by-side on any passage. |

---

### 📖 Granular Tools

- **`bible_lookup`**: Retrieve full passages from BSB, NET, KJV, or OHGB (Original Hebrew/Greek).
- **`bible_search`**: High-speed keyword search with book/testament filters and wildcards.
- **`commentary_lookup`**: Query any active commentary resource in `biblematedata` (e.g. `Henry`, `JFB`, `Calvin`, `Gill`, `MacL`, `Barnes`, `Spur`, `Clarke`, `Wesley`, `Benson`, `Pulpit`, `EGNT`, `CECNT`, `ECER`, `EBC`, `KD`, `Lange`, `Rob`, `Vincent`, `Whedon`, `CBSC`, `Brooks`, `PHC`, `HH`, `BI`). Check each resource's recorded source and licence before redistribution.
- **`cross_references`**: Retrieve Treasury of Scripture Knowledge (TSK) cross-references ranked by relevance votes.
- **`morphology_lookup`**: Word-by-word grammatical tagging, lemma roots, transliterations, and glosses for any Old or New Testament verse.
- **`lexicon_lookup`**: Comprehensive lexical definitions from Strong's, Brown-Driver-Briggs (BDB), and Thayer's Greek Lexicon.
- **`theological_dictionary`**: Query Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the source-labelled Classic Bible Dictionary Collection. Explicit source requests do not silently fall back to another source.
- **`parallel_passages`**: Side-by-side Gospel parallels, Old Testament synoptic parallels, and quote fulfillments.
- **`daily_reading`**: Daily Bible reading plan with scripture retrieval.
- **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, and study packs.

---

## 🔒 Security & Verification (Cloudflare Deployment Example)

The public demonstration deployment is intentionally unauthenticated. A private deployment may enforce authentication at the Worker or Cloudflare edge. Use the appropriate URL and credentials for the deployment you are testing:

```bash
# Test public health endpoint
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health

# Test authenticated Bible Lookup on a protected deployment
curl -s -X POST "https://berean-mcp.<your-subdomain>.workers.dev/tools/bible_lookup?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version":"BSB","reference":"John 3:16"}'
```

### Deployment-aware health checks

Health results describe the deployment being queried; local and Cloudflare deployments can have different bindings and datasets.

```bash
# Worker process is responding; does not require R2 or D1.
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health/live

# Required R2/D1 bindings are configured and usable.
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health/ready

# Reports representative Bible resource and database availability.
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health/resources
```

`/health/live` is a liveness check. `/health/ready` returns HTTP `503` when required bindings are absent. `/health/resources` performs representative R2/D1 checks and returns `ready` or `degraded`; optional datasets may be unavailable without preventing the Worker from starting.
