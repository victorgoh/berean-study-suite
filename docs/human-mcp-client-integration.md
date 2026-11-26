# Berean MCP Server: Multi-Client Integration Guide

This guide explains how to connect and use the **Berean Model Context Protocol (MCP) Server** across all major AI coding assistants and desktop environments: **Google Antigravity IDE**, **Claude Desktop / Claude Code**, **Cursor**, **VS Code**, and **LibreChat / Custom Clients**.

---

## ⚡ Overview & Endpoints

The Berean MCP Server provides access to verified classical and modern commentary sets, original-language Hebrew/Greek morphology, Strong's lexicons, and composite Study Packs according to the configured MCP profile. Use `tools/list` or `get_available_resources` to discover the current tools.

The public endpoint needs no credentials. A self-hosted deployment may require an API key (see [optional API key](agent-mcp-server-design.md#optional-api-key)); the configurations below show where it goes, and the header lines can be left out for public deployments.

### Available Production Endpoints

| Environment | Transport | Endpoint URL |
| :--- | :--- | :--- |
| **Cloudflare Workers (Global Edge)** | Streamable HTTP | `https://berean-mcp.victorgoh.workers.dev/mcp` |
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
        "DATA_DIR": "/path/to/berean/data"
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
        "mcp-remote",
        "https://berean-mcp.victorgoh.workers.dev/mcp"
      ]
    }
  }
}
```

For a key-protected deployment, add `"--header", "Authorization: Bearer YOUR_API_KEY"` to the end of `args`.

`mcp-remote` provides the local process bridge Claude Desktop uses to connect to
the remote Streamable HTTP MCP endpoint. Restart Claude Desktop after saving the
configuration. Use the plain URL shown above; do not wrap it in Markdown link
syntax. After the server is updated, toggle the connector off and on (or restart
Claude Desktop) so it picks up changed tool descriptions and arguments.

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
larger than the MCP response limit, it is returned in pages: each page ends with
a note giving the next `page` number to request. Use `output_mode: "full"` for
larger pages, or the human Explorer to read long articles in one view.

| Tool Name | Focus & Included Resources |
| :--- | :--- |
| **`covenant_theology_pack`** | Redemptive-historical covenant study: Scripture text, John Calvin, John Gill, the ISBE encyclopedia article on covenant, Old Testament quotations, and 12 TSK cross-references. |
| **`passage_exegesis_pack`** | Detailed academic exegesis: Greek/Hebrew text, morphology, the Septuagint for OT passages, Keil & Delitzsch (`KD`), Expositor's Greek NT (`EGNT`), H. A. W. Meyer (`CECNT`), Clarke, The Pulpit Commentary, JFB, and cross-references. |
| **`sermon_study_pack`** | Focused homiletics & preaching: Scripture, Alexander Maclaren, Charles Simeon (Horae Homileticae), and TSK cross-references. |
| **`illustration_study_pack`** | Opt-in Biblical Illustrator anecdotes and sermon illustrations. This intentionally fuller source is separate from the default sermon pack. |
| **`lesson_creator_study_pack`** | Focused Bible teaching & small groups: Scripture text, Adam Clarke's chapter-opening synopsis, Charles Ellicott, and cross-references. |
| **`devotional_study_pack`** | Concise pastoral meditation: Scripture text, Tyndale Open Study Notes, Matthew Henry Concise Commentary, biblical promises, and cross-references. |
| **`prayer_guide_study_pack`** | Scriptural intercession: Scripture text, Joseph Benson, John Wesley, Matthew Henry Concise Commentary, and biblical promises. |
| **`word_study_pack`** | Deep word study: lexicon definitions for a Strong's number; with a reference, its parsing in that verse, plus A. T. Robertson and Marvin Vincent for New Testament verses. |
| **`topic_study_pack`** | Topical study: the Tyndale Bible Dictionary article on the topic and related biblical promises with full Scripture text. |
| **`commentary_study_pack`** | Multi-commentator comparison: several commentaries on one passage, chosen with `commentators` and ordered with `order_mode`. |

---

### 📖 Granular Tools

- **`bible_lookup`**: A verse, range or whole chapter in BSB (default), NET, KJV, WEB, ASV, OHGB (original Hebrew/Greek) or LXX.
- **`bible_search`**: Find verses containing a word or phrase in one translation, optionally within one book; supports `*` wildcards and reports the total number of matches.
- **`commentary_lookup`**: Query an active commentary with `reference` and `version`. Call `get_available_resources(category="commentaries")` first for current keys, aliases, scope, and descriptions. Examples include `Henry`, `Pulpit`, `ECF`, `Catena`, `Kretzmann`, and `Schaff`. Check each resource's recorded source and licence before redistribution.
- **`cross_references`**: Treasury of Scripture Knowledge (TSK) cross-references grouped by the word they connect to; `limit` caps how many are returned.
- **`morphology_lookup`**: Word-by-word grammatical tagging, lemma roots, transliterations, and glosses for any Old or New Testament verse.
- **`lexicon_lookup`**: Definitions by Strong's number from STEPBible TBESG/TBESH, Brown-Driver-Briggs (BDB), Thayer's Greek Lexicon and LSJ; "see …" pointer entries are followed.
- **`theological_dictionary`**: Query Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the source-labelled Classic Bible Dictionary Collection. Explicit source requests do not silently fall back to another source.
- **`parallel_passages`**: Gospel harmonies and Old/New Testament parallel accounts, optionally with full text.
- **`daily_reading`**: Daily Bible reading plan with scripture retrieval.
- **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, and study packs.

Every tool is marked read-only and accepts `output_mode` (page size) and `page`. Errors start with a code and a hint, for example `Error (RESOURCE_UNAVAILABLE): No verses found for Genesis 50:99 in BSB`. The full tool list, with each tool's description, comes from `tools/list`.

---

## 🔒 Security & Verification (Cloudflare Deployment Example)

The public demonstration deployment is intentionally open and protected by per-IP rate limits. A self-hosted deployment can require an API key by setting the optional `API_KEY` secret; it can also be restricted at the Cloudflare edge, for example with Cloudflare Access.

```bash
# Test the health endpoint
curl -s https://berean-mcp.<your-subdomain>.workers.dev/health

# Test a REST tool call
curl -s -X POST "https://berean-mcp.<your-subdomain>.workers.dev/tools/bible_lookup" \
  -H "Content-Type: application/json" \
  -d '{"version":"BSB","reference":"John 3:16"}'

# The same call on a key-protected deployment (401 without the header)
curl -s -X POST "https://berean-mcp.<your-subdomain>.workers.dev/tools/bible_lookup" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version":"BSB","reference":"John 3:16"}'
```

Cloudflare's browser check rejects requests whose user agent is Python's default `Python-urllib` (error 1010). The official MCP SDKs, `httpx`, `requests`, Node and curl are not affected; if you script against the server with `urllib`, set a `User-Agent` header.

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
