# 📖 Berean AI Study Plugin for Antigravity

*“Now the Bereans were more noble-minded than those in Thessalonica, for they received the message with great eagerness and examined the Scriptures daily to see if these things were true.”* — **Acts 17:11**

**Berean** is a comprehensive, publication-quality biblical exegesis and theology plugin for [Antigravity](https://github.com/google/antigravity). It bundles automated multi-phase study pipelines, specialized scholarly and pastoral personas, original language parsers (Greek, Hebrew, Aramaic), multi-commentary synthesis, and MCP study packs into a portable package.

---

## ✨ Features

- **Dynamic Multi-Phase Study Engine**:
  - `/berean`: Rapid, focused exegesis, sermon preparation, devotional reflection, and ACTS prayer generation.
  - `/berean-plus`: Deep, dynamically planned multi-phase research with dynamic audit checkpoints, quality scoring, and iterative drafting loops.
- **15 Specialized Personas**: Rotate between OT/NT Scholars, Biblical Linguistic Analysts, Biblical Theologians, Passionate Evangelists, Compassionate Pastors, and Master Biblical Writers.
- **Universal Scripture Verification**: Strictly retrieves exact biblical texts via local databases/MCP to eliminate AI hallucinations.
- **High-Speed MCP Study Packs**: Instant bundling of commentaries, cross-references, morphologic analyses, and historical creeds.

---

## 🚀 Installation & Setup

### 1. Install the Plugin Bundle

#### Option A: Global Plugin (Available in All Antigravity Projects)
Clone into your global Antigravity plugins directory:
```bash
git clone https://github.com/<your-username>/antigravity-plugin-berean.git ~/.gemini/config/plugins/berean
```

#### Option B: Project-Specific Installation
Place this folder inside your project's `.agents/plugins/berean` or register it in `.agents/plugins.json`.

---

### 2. Configure the Berean MCP Server Backend

The plugin requires the **Berean MCP Server** to provide real-time Scripture lookups, Strong's lexicons, morphology, and composite study packs. Choose **one** of the following options:

#### 🌐 Option A: Connect to Hosted Cloudflare Worker (Easiest / Zero Setup)
Edit `~/.gemini/config/plugins/berean/mcp_config.json` (or your project's `mcp_config.json`):
```json
{
  "mcpServers": {
    "berean": {
      "url": "https://berean-mcp.<your-subdomain>.workers.dev/mcp",
      "transport": "streamable-http"
    }
  }
}
```
*(If your endpoint requires authentication, append `?key=YOUR_API_KEY` or add `"headers": {"Authorization": "Bearer YOUR_API_KEY"}`)*.

---

#### ☁️ Option B: Deploy Your Own Cloudflare Edge Worker
If you want to host your own dedicated MCP server on Cloudflare Workers (100% free tier):

1. **Clone & Install**:
   ```bash
   git clone https://github.com/<your-username>/berean-mcp.git
   cd berean-mcp
   npm install
   ```
2. **Configure Cloudflare D1 & R2**:
   - Create your D1 databases: `npx wrangler d1 create berean-morphology` & `npx wrangler d1 create berean-reference`.
   - Update the `database_id` values in `wrangler.jsonc`.
   - Bind your R2 bucket for Bible & commentary storage: `bucket_name: "berean-data"`.
3. **Deploy**:
   ```bash
   npx wrangler deploy
   ```
4. **Point the plugin `mcp_config.json`** to your new worker URL:
   `https://berean-mcp.<your-subdomain>.workers.dev/mcp`.

---

#### 🐳 Option C: Deploy via Container (Docker / Fly.io)
If you want containerized cloud hosting without configuring cloud databases:

1. Deploy to Fly.io or your Docker host:
   ```bash
   cd berean-mcp
   fly launch --no-deploy
   fly deploy
   ```
2. Update `mcp_config.json`:
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

#### 💻 Option D: Run Locally (Local Node.js / Stdio)
If you prefer running the MCP server entirely offline on your local machine:

1. Install dependencies:
   ```bash
   cd berean-mcp
   npm install
   ```
2. Configure `mcp_config.json` to execute via portable workspace-relative stdio:
   ```json
   {
     "mcpServers": {
       "berean": {
         "command": "npx",
         "args": ["-y", "tsx", "berean-mcp/scripts/run_local_stdio.ts"]
       }
     }
   }
   ```

---

## 🛠️ Slash Commands

| Command | Description |
| :--- | :--- |
| `/berean <topic or passage>` | Launch an automated Berean study plan |
| `/berean-plus <topic or passage>` | Launch a dynamically planned Berean-Plus research pipeline |
| `/sermon <passage>` | Generate a full sermon manuscript with illustrations and prayers |
| `/devotion <passage>` | Generate a devotional reflection and pastoral prayer |
| `/insights <passage>` | Extract deep original language and grammatical insights |
| `/prayer <passage>` | Generate a 1st-person scriptural prayer (ACTS framework) |
| `/theology <passage>` | Map systematic and biblical theology themes |
