/**
 * Interactive Web Playground for Berean MCP Server
 * Self-contained, zero-dependency, high-performance HTML/CSS/JS UI
 */

export function renderPlaygroundHtml(): string {
  const bt = String.fromCharCode(96);
  const bt3 = bt + bt + bt;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berean MCP Server — Interactive Playground</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --card-bg: rgba(15, 23, 42, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-hover: rgba(56, 189, 248, 0.35);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --accent-purple: #a855f7;
      --accent-green: #10b981;
      --accent-amber: #f59e0b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --input-bg: rgba(2, 6, 23, 0.75);
      --code-bg: #030712;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    header {
      border-bottom: 1px solid var(--card-border);
      background: rgba(7, 9, 14, 0.88);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0.85rem 1.5rem;
    }

    .header-container {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(to right, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .header-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.12);
      color: var(--accent-green);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--accent-green);
      box-shadow: 0 0 8px var(--accent-green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .btn-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      transition: all 0.2s ease;
    }

    .btn-link:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Main Container */
    main {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem;
      flex: 1;
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 1080px) {
      main {
        grid-template-columns: 1fr;
      }
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.015);
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      flex: 1;
      overflow-y: auto;
    }

    /* Category Filter Pills */
    .category-pills {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin-bottom: 0.25rem;
    }

    .cat-pill {
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-dim);
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .cat-pill:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .cat-pill.active {
      color: #fff;
      background: rgba(56, 189, 248, 0.18);
      border-color: var(--accent);
      box-shadow: 0 0 10px var(--accent-glow);
    }

    /* Search Input */
    .search-box {
      position: relative;
      margin-bottom: 0.25rem;
    }

    .search-box input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      font-size: 0.8rem;
      color: var(--text-main);
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-box input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow);
    }

    .search-shortcut {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.65rem;
      color: var(--text-dim);
      background: rgba(255, 255, 255, 0.06);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      pointer-events: none;
    }

    /* Form Inputs */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    select, input[type="text"], input[type="number"] {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      font-size: 0.85rem;
      color: var(--text-main);
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    select:focus, input[type="text"]:focus, input[type="number"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow);
    }

    select option {
      background: #0f172a;
      color: #f8fafc;
    }

    /* Preset Chips */
    .preset-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .chip:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-1px);
    }

    /* Recent History Chips */
    .history-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }

    .history-chip {
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 4px;
      padding: 0.2rem 0.5rem;
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      color: #d8b4fe;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .history-chip:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: var(--accent-purple);
      color: #fff;
    }

    /* Buttons */
    .btn-execute {
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }

    .btn-execute:hover {
      background: linear-gradient(135deg, #60a5fa, #1d4ed8);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }

    .btn-execute:active {
      transform: translateY(0);
    }

    .btn-execute:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Tabs */
    .tab-bar {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--card-border);
      padding: 0.5rem 1.25rem 0 1.25rem;
      background: rgba(255, 255, 255, 0.015);
      overflow-x: auto;
    }

    .tab-btn {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.5rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-dim);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* Stats Bar */
    .stats-bar {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.72rem;
      color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      padding: 0.5rem 1.25rem;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--card-border);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .stat-val {
      font-weight: 600;
      color: var(--text-muted);
    }

    .stat-val.ok {
      color: var(--accent-green);
    }

    /* Code View */
    .code-container {
      position: relative;
      flex: 1;
      background: var(--code-bg);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .code-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--card-border);
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      border-radius: 4px;
      padding: 0.25rem 0.55rem;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      border-color: rgba(255, 255, 255, 0.25);
    }

    pre.code-block {
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      color: #e2e8f0;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      flex: 1;
    }

    /* Markdown Rendered View */
    .preview-container {
      padding: 1.25rem;
      background: rgba(3, 7, 18, 0.5);
      border-radius: 8px;
      overflow-y: auto;
      flex: 1;
      font-size: 0.85rem;
      line-height: 1.6;
      color: #cbd5e1;
    }

    .preview-container h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.5rem;
    }

    .preview-container h2 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 1.2rem;
      margin-bottom: 0.5rem;
    }

    .preview-container h3 {
      font-size: 0.92rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-top: 1rem;
      margin-bottom: 0.4rem;
    }

    .preview-container p {
      margin-bottom: 0.75rem;
    }

    .preview-container ul, .preview-container ol {
      margin-left: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .preview-container li {
      margin-bottom: 0.25rem;
    }

    .preview-container blockquote {
      border-left: 3px solid var(--accent);
      background: rgba(56, 189, 248, 0.05);
      padding: 0.6rem 0.85rem;
      border-radius: 0 6px 6px 0;
      margin: 0.75rem 0;
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .preview-container table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.78rem;
    }

    .preview-container th, .preview-container td {
      border: 1px solid var(--card-border);
      padding: 0.45rem 0.65rem;
      text-align: left;
    }

    .preview-container th {
      background: rgba(255, 255, 255, 0.04);
      color: var(--accent);
      font-weight: 700;
    }

    .preview-container code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-size: 0.78rem;
      color: #38bdf8;
    }

    .verse-tag {
      font-weight: 700;
      color: var(--accent);
      background: rgba(56, 189, 248, 0.1);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      display: inline-block;
      margin-right: 0.25rem;
    }

    /* Client Config Sections */
    .config-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .config-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Spinner */
    .spinner {
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top: 2px solid #000;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="header-container">
      <a href="/" class="brand">
        <div class="brand-icon">⚡</div>
        <div class="brand-text">
          <h1>Berean MCP Server</h1>
          <p>Universal Bible Exegesis Engine • Focused Research & Human Study Packs</p>
        </div>
      </a>
      <div class="header-links">
        <div class="badge-status">
          <div class="badge-dot"></div>
          Server Online
        </div>
        <a href="https://github.com/victorgoh/berean-study-suite" class="btn-link" target="_blank" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);">⭐ GitHub Suite</a>
        <a href="/mcp" class="btn-link" target="_blank">📡 /mcp Endpoint</a>
        <a href="/openapi.json" class="btn-link" target="_blank">📋 OpenAPI</a>
        <a href="/health" class="btn-link" target="_blank">💚 Health</a>
      </div>
    </div>
  </header>

  <!-- Main Layout -->
  <main>
    <!-- Left Panel: Request Builder -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>🛠️ Request Builder</span>
        </div>
        <span id="endpoint-tag" style="font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; color: var(--accent);">POST /tools/bible_lookup</span>
      </div>
      <div class="card-body">
        
        <!-- Category Filter Pills -->
        <div class="category-pills" id="category-pills">
          <div class="cat-pill active" data-cat="all">All Tools</div>
          <div class="cat-pill" data-cat="scripture">📖 Scripture (5)</div>
          <div class="cat-pill" data-cat="packs">⚡ Study Packs</div>
          <div class="cat-pill" data-cat="languages">🏛 Languages (3)</div>
          <div class="cat-pill" data-cat="topical">📚 Topical & Bio (9)</div>
        </div>

        <!-- Search / Quick Filter Input -->
        <div class="search-box">
          <input type="text" id="tool-search" placeholder="Search tools or endpoints... (e.g. prayer, greek, commentary)" />
          <span class="search-shortcut">/</span>
        </div>

        <!-- Tool Selector -->
        <div class="form-group">
          <label for="tool-select">Select MCP Tool</label>
          <select id="tool-select">
            <optgroup label="📖 Scripture & Exegesis" data-cat="scripture">
              <option value="bible_lookup" selected>bible_lookup (Passage lookup across BSB/NET/KJV/OHGB)</option>
              <option value="bible_search">bible_search (Full-text scripture keyword search)</option>
              <option value="commentary_lookup">commentary_lookup (26 Classical commentaries)</option>
              <option value="cross_references">cross_references (TSK Scripture cross references)</option>
              <option value="parallel_passages">parallel_passages (Gospel & historical parallels)</option>
            </optgroup>
            <optgroup label="⚡ Composite Study Packs" data-cat="packs">
              <option value="sermon_study_pack">sermon_study_pack (Preaching outlines & exegesis)</option>
              <option value="passage_exegesis_pack">passage_exegesis_pack (Deep morphology & analysis)</option>
              <option value="prayer_guide_study_pack">prayer_guide_study_pack (Scripture-led prayer & ACTS)</option>
              <option value="devotional_study_pack">devotional_study_pack (Spiritual devotion & prayer)</option>
              <option value="lesson_creator_study_pack">lesson_creator_study_pack (Small group curriculum)</option>
              <option value="covenant_theology_pack">covenant_theology_pack (Redemptive covenant links)</option>
              <option value="word_study_pack">word_study_pack (Original lemma & concordances)</option>
              <option value="topic_study_pack">topic_study_pack (Systematic theology synthesis)</option>
              <option value="commentary_study_pack">commentary_study_pack (Multi-commentary comparison)</option>
            </optgroup>
            <optgroup label="🏛 Original Languages & Lexicons" data-cat="languages">
              <option value="lexicon_lookup">lexicon_lookup (BDB Hebrew / Thayer Greek)</option>
              <option value="morphology_lookup">morphology_lookup (Hebrew / Greek syntax parsing)</option>
              <option value="theological_dictionary">theological_dictionary (TBESH / MCGED)</option>
            </optgroup>
            <optgroup label="📚 Topical & Reference Catalog" data-cat="topical">
              <option value="topic_study">topic_study (Nave's Topical Bible themes)</option>
              <option value="biblical_promises">biblical_promises (Categorized covenant promises)</option>
              <option value="character_lookup">character_lookup (Biblical biographies & trees)</option>
              <option value="location_lookup">location_lookup (Biblical geography & coordinates)</option>
              <option value="book_analysis">book_analysis (Tyndale source-attributed book guide)</option>
              <option value="chapter_summary">chapter_summary (Chapter breakdown & key verses)</option>
              <option value="bible_names">bible_names (Etymology & meanings of names)</option>
              <option value="chronology">chronology (Biblical timelines & historical epochs)</option>
              <option value="daily_reading">daily_reading (Daily canonical reading plan)</option>
              <option value="get_available_resources">get_available_resources (Active resource catalog)</option>
            </optgroup>
          </select>
        </div>

        <!-- Dynamic Form Fields -->
        <div id="dynamic-params" style="display: flex; flex-direction: column; gap: 0.9rem;">
          <!-- Dynamically populated -->
        </div>

        <!-- 1-Click Presets -->
        <div class="preset-section">
          <label>1-Click Test Presets</label>
          <div class="chips-container" id="preset-chips">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn-execute" id="btn-execute">
          <span id="btn-text">⚡ Execute Request</span>
          <span style="font-size:0.68rem; opacity:0.8; font-weight:normal; margin-left:auto;">⌘ Enter</span>
        </button>

        <!-- Recent History -->
        <div class="form-group" style="margin-top: 0.25rem;">
          <label style="display: flex; justify-content: space-between;">
            <span>Recent Queries</span>
            <span id="btn-clear-history" style="cursor: pointer; color: var(--text-dim); text-transform: none; font-size: 0.7rem;">Clear</span>
          </label>
          <div class="history-container" id="history-chips">
            <span style="font-size:0.72rem; color:var(--text-dim)">No recent executions</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Right Panel: Live Response Explorer -->
    <div class="card">
      
      <!-- Tab Navigation -->
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="preview">👁️ Rendered Preview</button>
        <button class="tab-btn" data-tab="json">{ } Raw JSON</button>
        <button class="tab-btn" data-tab="curl">⌨️ cURL Command</button>
        <button class="tab-btn" data-tab="ai-config">🤖 AI Integration</button>
      </div>

      <!-- Execution Stats -->
      <div class="stats-bar">
        <div class="stat-item">
          <span>Status:</span>
          <span class="stat-val ok" id="stat-status">Ready</span>
        </div>
        <div class="stat-item">
          <span>Latency:</span>
          <span class="stat-val" id="stat-time">—</span>
        </div>
        <div class="stat-item">
          <span>Payload:</span>
          <span class="stat-val" id="stat-size">—</span>
        </div>
      </div>

      <div class="card-body" style="padding: 1rem;">
        
        <!-- Tab 1: Rendered Markdown Preview -->
        <div class="code-container" id="tab-preview">
          <div class="code-toolbar">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Formatted Biblical Response</span>
            <button class="copy-btn" id="btn-copy-preview">📋 Copy Markdown</button>
          </div>
          <div class="preview-container" id="preview-container">
            <div style="text-align: center; color: var(--text-dim); padding: 4rem 1rem;">
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📖</div>
              <p style="font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem;">Select an MCP tool on the left and click Execute</p>
              <p style="font-size: 0.75rem;">Fast in-memory WASM SQLite • 26 classical commentaries & original Greek/Hebrew datasets</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Raw JSON -->
        <div class="code-container" id="tab-json" style="display: none;">
          <div class="code-toolbar">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">JSON Output</span>
            <button class="copy-btn" id="btn-copy-json">📋 Copy JSON</button>
          </div>
          <pre class="code-block" id="json-container">// Waiting for execution...</pre>
        </div>

        <!-- Tab 3: cURL Command -->
        <div class="code-container" id="tab-curl" style="display: none;">
          <div class="code-toolbar">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Shell / REST Snippet</span>
            <button class="copy-btn" id="btn-copy-curl">📋 Copy cURL</button>
          </div>
          <pre class="code-block" id="curl-snippet"></pre>
        </div>

        <!-- Tab 4: AI Integration Configs -->
        <div class="code-container" id="tab-ai-config" style="display: none; overflow-y: auto;">
          <div class="code-toolbar">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">AI Client MCP Configuration</span>
            <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('ai-cfg-claude').innerText)">📋 Copy Claude Config</button>
          </div>
          <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div class="config-title">Claude Desktop / Antigravity Config (claude_desktop_config.json)</div>
              <pre class="code-block" id="ai-cfg-claude" style="border: 1px solid var(--card-border); border-radius: 6px;">{
  "mcpServers": {
    "berean": {
      "url": "https://berean-mcp.victorgoh.workers.dev/mcp"
    }
  }
}</pre>
            </div>
            <div>
              <div class="config-title">Local Dev Connection (when running npm run dev)</div>
              <pre class="code-block" style="border: 1px solid var(--card-border); border-radius: 6px;">{
  "mcpServers": {
    "berean-local": {
      "url": "http://localhost:8787/mcp"
    }
  }
}</pre>
            </div>
          </div>
        </div>

        <!-- Ecosystem Info Card -->
        <div class="config-card" style="background: rgba(56, 189, 248, 0.04); border-color: rgba(56, 189, 248, 0.2);">
          <div class="config-title" style="color: var(--accent);">
            <span>📦 Berean AI Study Suite</span>
            <a href="https://github.com/victorgoh/berean-study-suite" target="_blank" style="color: var(--accent); font-size: 0.72rem; text-decoration: none; display: flex; align-items: center; gap: 4px;">
              View on GitHub ↗
            </a>
          </div>
          <p style="font-size: 0.78rem; line-height: 1.45; color: var(--text-dim); margin-top: 0.35rem;">
            The complete open-source suite includes the <strong>Berean MCP Server</strong>, <strong>15 Specialized AI Personas</strong>, autonomous <strong>/berean</strong> and <strong>/berean-plus</strong> workflow orchestrators, Greek/Hebrew interlinear databases, and DOCX manuscript export tools.
          </p>
          <div style="margin-top: 0.6rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="https://github.com/victorgoh/berean-study-suite" class="btn-link" target="_blank" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.3); color: #fff; font-size: 0.75rem;">
              ⭐ GitHub: victorgoh/berean-study-suite
            </a>
          </div>
        </div>

      </div>

    </div>
  </main>

  <script>
    // Tool Metadata & Parameters Map
    const TOOLS_CONFIG = {
      bible_lookup: {
        category: "scripture",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "John 3:16" },
          { id: "version", label: "Translation Version", type: "select", options: ["BSB", "NET", "KJV", "WEB", "ASV", "OHGB", "OHGBi"], default: "BSB" }
        ],
        presets: [
          { name: "John 3:16 (BSB)", params: { reference: "John 3:16", version: "BSB" } },
          { name: "Genesis 1:1-3 (OHGB)", params: { reference: "Genesis 1:1-3", version: "OHGB" } },
          { name: "Romans 8:28-30 (NET)", params: { reference: "Romans 8:28-30", version: "NET" } },
          { name: "Psalm 23:1-6 (KJV)", params: { reference: "Psalm 23:1-6", version: "KJV" } }
        ]
      },
      bible_search: {
        category: "scripture",
        fields: [
          { id: "query", label: "Search Query / Words", type: "text", default: "covenant of peace" },
          { id: "version", label: "Translation Version", type: "select", options: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" },
          { id: "limit", label: "Result Limit", type: "number", default: 10 }
        ],
        presets: [
          { name: "covenant of peace", params: { query: "covenant of peace", version: "BSB", limit: 10 } },
          { name: "born again", params: { query: "born again", version: "BSB", limit: 10 } },
          { name: "shepherd", params: { query: "shepherd", version: "BSB", limit: 10 } }
        ]
      },
      commentary_lookup: {
        category: "scripture",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Romans 8:28" },
          { id: "commentary", label: "Commentary Version", type: "select", options: ["Henry", "JFB", "Calvin", "MacL", "Barnes", "Spur", "HH", "Clarke", "Gill", "KD", "CECNT", "Pulpit", "Poole", "Trapp", "Wesley", "Benson", "Geneva", "Scofield", "Ryle", "Darby", "Bullinger"], default: "Henry" }
        ],
        presets: [
          { name: "Romans 8:28 (Matthew Henry)", params: { reference: "Romans 8:28", commentary: "Henry" } },
          { name: "Genesis 1:1 (Calvin)", params: { reference: "Genesis 1:1", commentary: "Calvin" } },
          { name: "Psalm 23:1 (Spurgeon)", params: { reference: "Psalm 23:1", commentary: "Spur" } },
          { name: "John 1:1 (A.T. Robertson)", params: { reference: "John 1:1", commentary: "Rob" } }
        ]
      },
      cross_references: {
        category: "scripture",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Romans 8:28" }
        ],
        presets: [
          { name: "Romans 8:28", params: { reference: "Romans 8:28" } },
          { name: "John 3:16", params: { reference: "John 3:16" } },
          { name: "Genesis 1:1", params: { reference: "Genesis 1:1" } }
        ]
      },
      parallel_passages: {
        category: "scripture",
        fields: [
          { id: "reference", label: "Scripture Reference / Topic", type: "text", default: "Matthew 4:1-11" }
        ],
        presets: [
          { name: "Matthew 4:1-11 (Temptation Parallels)", params: { reference: "Matthew 4:1-11" } },
          { name: "Matthew 28:1-10 (Resurrection Parallels)", params: { reference: "Matthew 28:1-10" } },
          { name: "Matthew 3:13-17 (Baptism Parallels)", params: { reference: "Matthew 3:13-17" } }
        ]
      },
      sermon_study_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Psalm 23:1" }
        ],
        presets: [
          { name: "Psalm 23:1 (Good Shepherd)", params: { reference: "Psalm 23:1" } },
          { name: "Ephesians 2:8-10 (Grace & Works)", params: { reference: "Ephesians 2:8-10" } },
          { name: "Isaiah 53:5-6 (The Suffering Servant)", params: { reference: "Isaiah 53:5-6" } }
        ]
      },
      prayer_guide_study_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Bible Passage / Scripture Reference", type: "text", default: "Psalm 51:1-12" },
          { id: "version", label: "Translation Version", type: "select", options: ["BSB", "NET", "KJV", "OHGB"], default: "BSB" }
        ],
        presets: [
          { name: "Psalm 51:1-12 (Repentance & Cleansing)", params: { reference: "Psalm 51:1-12", version: "BSB" } },
          { name: "Ephesians 3:14-21 (Paul's Intercession for Spiritual Strength)", params: { reference: "Ephesians 3:14-21", version: "BSB" } },
          { name: "Matthew 6:9-13 (The Lord's Prayer)", params: { reference: "Matthew 6:9-13", version: "BSB" } },
          { name: "Psalm 23 (The Shepherd's Protection)", params: { reference: "Psalm 23", version: "BSB" } },
          { name: "Philippians 4:4-9 (Peace & Supplication)", params: { reference: "Philippians 4:4-9", version: "BSB" } }
        ]
      },
      devotional_study_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Bible Passage / Scripture Reference", type: "text", default: "John 15:1-8" }
        ],
        presets: [
          { name: "John 15:1-8 (The True Vine)", params: { reference: "John 15:1-8" } },
          { name: "Psalm 46:1-10 (God Our Refuge)", params: { reference: "Psalm 46:1-10" } },
          { name: "Lamentations 3:22-26 (Great is Thy Faithfulness)", params: { reference: "Lamentations 3:22-26" } }
        ]
      },
      lesson_creator_study_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Bible Passage / Scripture Reference", type: "text", default: "Luke 15:11-32" },
          { id: "version", label: "Translation Version", type: "select", options: ["BSB", "NET", "KJV", "OHGB"], default: "BSB" }
        ],
        presets: [
          { name: "Luke 15:11-32 (The Prodigal Son)", params: { reference: "Luke 15:11-32", version: "BSB" } },
          { name: "Acts 2:42-47 (The Early Church Fellowship)", params: { reference: "Acts 2:42-47", version: "BSB" } },
          { name: "John 10:1-18 (The Good Shepherd)", params: { reference: "John 10:1-18", version: "BSB" } },
          { name: "Romans 12:1-21 (Living Sacrifices & Spiritual Gifts)", params: { reference: "Romans 12:1-21", version: "BSB" } }
        ]
      },
      passage_exegesis_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Romans 8:28" }
        ],
        presets: [
          { name: "Romans 8:28 (Exegesis)", params: { reference: "Romans 8:28" } },
          { name: "John 1:1-5 (Prologue Exegesis)", params: { reference: "John 1:1-5" } },
          { name: "Genesis 1:1-3 (Creation Exegesis)", params: { reference: "Genesis 1:1-3" } }
        ]
      },
      covenant_theology_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Genesis 15:6" }
        ],
        presets: [
          { name: "Genesis 15:6 (Abrahamic Covenant)", params: { reference: "Genesis 15:6" } },
          { name: "Jeremiah 31:31 (New Covenant Promise)", params: { reference: "Jeremiah 31:31" } },
          { name: "2 Samuel 7:12 (Davidic Covenant)", params: { reference: "2 Samuel 7:12" } }
        ]
      },
      word_study_pack: {
        category: "packs",
        fields: [
          { id: "strongs", label: "Strong's Number", type: "text", default: "G26" }
        ],
        presets: [
          { name: "G26 (Agape - Love)", params: { strongs: "G26" } },
          { name: "H1254 (Bara - Create)", params: { strongs: "H1254" } },
          { name: "G4102 (Pistis - Faith)", params: { strongs: "G4102" } },
          { name: "H2617 (Hesed - Steadfast Love)", params: { strongs: "H2617" } }
        ]
      },
      topic_study_pack: {
        category: "packs",
        fields: [
          { id: "topic", label: "Theological Topic", type: "text", default: "Justification" }
        ],
        presets: [
          { name: "Justification", params: { topic: "Justification" } },
          { name: "Grace", params: { topic: "Grace" } },
          { name: "Atonement", params: { topic: "Atonement" } }
        ]
      },
      commentary_study_pack: {
        category: "packs",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "Romans 8:28" }
        ],
        presets: [
          { name: "Romans 8:28 (Multi-Commentary)", params: { reference: "Romans 8:28" } },
          { name: "John 3:16 (Multi-Commentary)", params: { reference: "John 3:16" } }
        ]
      },
      lexicon_lookup: {
        category: "languages",
        fields: [
          { id: "strongs", label: "Strong's Number", type: "text", default: "G26" }
        ],
        presets: [
          { name: "G26 (Thayer: Agape)", params: { strongs: "G26" } },
          { name: "H1254 (BDB: Bara)", params: { strongs: "H1254" } },
          { name: "G3056 (Thayer: Logos)", params: { strongs: "G3056" } }
        ]
      },
      morphology_lookup: {
        category: "languages",
        fields: [
          { id: "reference", label: "Scripture Reference", type: "text", default: "John 1:1" }
        ],
        presets: [
          { name: "John 1:1 (Greek Morphology)", params: { reference: "John 1:1" } },
          { name: "Genesis 1:1 (Hebrew Morphology)", params: { reference: "Genesis 1:1" } }
        ]
      },
      theological_dictionary: {
        category: "languages",
        fields: [
          { id: "term", label: "Theological Term", type: "text", default: "Grace" }
        ],
        presets: [
          { name: "Grace", params: { term: "Grace" } },
          { name: "Redemption", params: { term: "Redemption" } },
          { name: "Covenant", params: { term: "Covenant" } }
        ]
      },
      topic_study: {
        category: "topical",
        fields: [
          { id: "topic", label: "Biblical Topic", type: "text", default: "Love" }
        ],
        presets: [
          { name: "Love", params: { topic: "Love" } },
          { name: "Prayer", params: { topic: "Prayer" } },
          { name: "Faith", params: { topic: "Faith" } },
          { name: "Justification", params: { topic: "Justification" } },
          { name: "Grace", params: { topic: "Grace" } }
        ]
      },
      biblical_promises: {
        category: "topical",
        fields: [
          { id: "category", label: "Promise Category", type: "text", default: "Peace" }
        ],
        presets: [
          { name: "Peace", params: { category: "Peace" } },
          { name: "Comfort", params: { category: "Comfort" } },
          { name: "Forgiveness", params: { category: "Forgiveness" } }
        ]
      },
      character_lookup: {
        category: "topical",
        fields: [
          { id: "name", label: "Biblical Character Name", type: "text", default: "David" }
        ],
        presets: [
          { name: "David", params: { name: "David" } },
          { name: "Abraham", params: { name: "Abraham" } },
          { name: "Paul", params: { name: "Paul" } }
        ]
      },
      location_lookup: {
        category: "topical",
        fields: [
          { id: "location", label: "Biblical Location", type: "text", default: "Jerusalem" }
        ],
        presets: [
          { name: "Jerusalem", params: { location: "Jerusalem" } },
          { name: "Bethlehem", params: { location: "Bethlehem" } }
        ]
      },
      book_analysis: {
        category: "topical",
        fields: [
          { id: "book", label: "Book of the Bible", type: "text", default: "Romans" }
        ],
        presets: [
          { name: "Romans", params: { book: "Romans" } },
          { name: "Genesis", params: { book: "Genesis" } },
          { name: "Hebrews", params: { book: "Hebrews" } }
        ]
      },
      chapter_summary: {
        category: "topical",
        fields: [
          { id: "book", label: "Book", type: "text", default: "John" },
          { id: "chapter", label: "Chapter", type: "number", default: 1 }
        ],
        presets: [
          { name: "John 1", params: { book: "John", chapter: 1 } },
          { name: "Genesis 1", params: { book: "Genesis", chapter: 1 } }
        ]
      },
      bible_names: {
        category: "topical",
        fields: [
          { id: "name", label: "Biblical Name", type: "text", default: "Immanuel" }
        ],
        presets: [
          { name: "Immanuel", params: { name: "Immanuel" } },
          { name: "Jesus", params: { name: "Jesus" } }
        ]
      },
      chronology: {
        category: "topical",
        fields: [
          { id: "period", label: "Historical Period / Epoch", type: "text", default: "Patriarchs" }
        ],
        presets: [
          { name: "Patriarchs", params: { period: "Patriarchs" } },
          { name: "Exodus", params: { period: "Exodus" } },
          { name: "Life of Christ", params: { period: "Life of Christ" } }
        ]
      },
      daily_reading: {
        category: "topical",
        fields: [
          { id: "day", label: "Day of the Year (1-365)", type: "number", default: 1 }
        ],
        presets: [
          { name: "Day 1", params: { day: 1 } },
          { name: "Day 100", params: { day: 100 } }
        ]
      },
      get_available_resources: {
        category: "topical",
        fields: [
          { id: "category", label: "Category", type: "select", options: ["all", "bibles", "commentaries", "lexicons", "dictionaries"], default: "all" }
        ],
        presets: [
          { name: "All Resources", params: { category: "all" } },
          { name: "Commentaries", params: { category: "commentaries" } },
          { name: "Bibles", params: { category: "bibles" } }
        ]
      }
    };

    // DOM Elements
    const toolSelect = document.getElementById("tool-select");
    const toolSearch = document.getElementById("tool-search");
    const categoryPills = document.getElementById("category-pills");
    const dynamicParamsContainer = document.getElementById("dynamic-params");
    const presetChipsContainer = document.getElementById("preset-chips");
    const historyChipsContainer = document.getElementById("history-chips");
    const btnClearHistory = document.getElementById("btn-clear-history");
    const btnExecute = document.getElementById("btn-execute");
    const btnText = document.getElementById("btn-text");
    const endpointTag = document.getElementById("endpoint-tag");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = {
      preview: document.getElementById("tab-preview"),
      json: document.getElementById("tab-json"),
      curl: document.getElementById("tab-curl"),
      "ai-config": document.getElementById("tab-ai-config")
    };
    const statStatus = document.getElementById("stat-status");
    const statTime = document.getElementById("stat-time");
    const statSize = document.getElementById("stat-size");
    const previewContainer = document.getElementById("preview-container");
    const jsonContainer = document.getElementById("json-container");
    const curlSnippet = document.getElementById("curl-snippet");
    const btnCopyPreview = document.getElementById("btn-copy-preview");
    const btnCopyJson = document.getElementById("btn-copy-json");
    const btnCopyCurl = document.getElementById("btn-copy-curl");

    let currentResponseData = null;
    let currentRawMarkdown = "";
    let currentActiveCategory = "all";

    // Switch Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-tab");
        Object.keys(tabContents).forEach(k => {
          if (tabContents[k]) tabContents[k].style.display = k === target ? (k === 'ai-config' ? 'block' : 'flex') : 'none';
        });
      });
    });

    // Category Filter Pills
    categoryPills.querySelectorAll(".cat-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        categoryPills.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentActiveCategory = pill.getAttribute("data-cat");
        filterToolOptions();
      });
    });

    // Search Tools
    toolSearch.addEventListener("input", () => {
      filterToolOptions();
    });

    // Filter Tool Options
    function filterToolOptions() {
      const q = toolSearch.value.trim().toLowerCase();
      const optgroups = toolSelect.querySelectorAll("optgroup");
      let firstVisible = null;

      optgroups.forEach(group => {
        const groupCat = group.getAttribute("data-cat");
        const catMatch = currentActiveCategory === "all" || currentActiveCategory === groupCat;
        let visibleCount = 0;

        group.querySelectorAll("option").forEach(opt => {
          const val = opt.value.toLowerCase();
          const text = opt.textContent.toLowerCase();
          const searchMatch = !q || val.includes(q) || text.includes(q);
          const visible = catMatch && searchMatch;

          opt.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount++;
            if (!firstVisible) firstVisible = opt;
          }
        });

        group.style.display = visibleCount > 0 ? "" : "none";
      });

      // If current selection is hidden, select first visible
      const currentOpt = toolSelect.querySelector('option[value="' + toolSelect.value + '"]');
      if (currentOpt && currentOpt.style.display === "none" && firstVisible) {
        toolSelect.value = firstVisible.value;
        renderFields(toolSelect.value);
      }
    }

    // Render Dynamic Form Fields
    function renderFields(toolKey) {
      const config = TOOLS_CONFIG[toolKey] || { fields: [] };
      endpointTag.textContent = "POST /tools/" + toolKey;
      
      let html = "";
      config.fields.forEach(field => {
        html += '<div class="form-group">';
        html += '<label for="field-' + field.id + '">' + field.label + '</label>';
        if (field.type === "select") {
          html += '<select id="field-' + field.id + '">';
          field.options.forEach(opt => {
            const sel = opt === field.default ? ' selected' : '';
            html += '<option value="' + opt + '"' + sel + '>' + opt + '</option>';
          });
          html += '</select>';
        } else if (field.type === "number") {
          html += '<input type="number" id="field-' + field.id + '" value="' + (field.default || "") + '" />';
        } else {
          html += '<input type="text" id="field-' + field.id + '" value="' + (field.default || "") + '" />';
        }
        html += '</div>';
      });
      dynamicParamsContainer.innerHTML = html;

      // Render Presets
      let chipHtml = "";
      (config.presets || []).forEach((p, idx) => {
        chipHtml += '<div class="chip" data-idx="' + idx + '">' + p.name + '</div>';
      });
      presetChipsContainer.innerHTML = chipHtml || '<span style="font-size:0.75rem; color:var(--text-dim)">No presets</span>';

      presetChipsContainer.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
          const idx = parseInt(chip.getAttribute("data-idx"));
          const preset = config.presets[idx];
          if (preset && preset.params) {
            Object.keys(preset.params).forEach(k => {
              const el = document.getElementById("field-" + k);
              if (el) el.value = preset.params[k];
            });
            updateCurlSnippet();
          }
        });
      });

      updateCurlSnippet();
    }

    // Read Current Request Payload
    function getPayload() {
      const toolKey = toolSelect.value;
      const config = TOOLS_CONFIG[toolKey] || { fields: [] };
      const payload = {};
      config.fields.forEach(field => {
        const el = document.getElementById("field-" + field.id);
        if (el) {
          if (field.type === "number") {
            payload[field.id] = parseFloat(el.value) || 0;
          } else {
            payload[field.id] = el.value.trim();
          }
        }
      });
      return payload;
    }

    // Update cURL Display
    function updateCurlSnippet() {
      const toolKey = toolSelect.value;
      const payload = getPayload();
      const origin = window.location.origin;
      const cmd = "curl -X POST " + origin + "/tools/" + toolKey + " \\\\\n  -H \\"Content-Type: application/json\\" \\\\\n  -d '" + JSON.stringify(payload, null, 2) + "'";
      curlSnippet.textContent = cmd;
    }

    // Execution History (localStorage)
    function loadHistory() {
      try {
        const raw = localStorage.getItem("berean_history");
        const list = raw ? JSON.parse(raw) : [];
        if (!list || list.length === 0) {
          historyChipsContainer.innerHTML = '<span style="font-size:0.72rem; color:var(--text-dim)">No recent executions</span>';
          return;
        }
        let html = "";
        list.forEach((item, idx) => {
          const label = item.tool + ": " + (item.payload.reference || item.payload.topic || item.payload.strongs || item.payload.query || item.payload.name || item.payload.category || "");
          html += '<div class="history-chip" data-hidx="' + idx + '" title="' + JSON.stringify(item.payload).replace(/"/g, '&quot;') + '">' + label.slice(0, 24) + '</div>';
        });
        historyChipsContainer.innerHTML = html;

        historyChipsContainer.querySelectorAll(".history-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            const idx = parseInt(chip.getAttribute("data-hidx"));
            const item = list[idx];
            if (item) {
              toolSelect.value = item.tool;
              renderFields(item.tool);
              Object.keys(item.payload).forEach(k => {
                const el = document.getElementById("field-" + k);
                if (el) el.value = item.payload[k];
              });
              executeRequest();
            }
          });
        });
      } catch {}
    }

    function saveHistory(tool, payload) {
      try {
        const raw = localStorage.getItem("berean_history");
        let list = raw ? JSON.parse(raw) : [];
        list = [{ tool, payload, time: Date.now() }, ...list.filter(x => !(x.tool === tool && JSON.stringify(x.payload) === JSON.stringify(payload)))].slice(0, 6);
        localStorage.setItem("berean_history", JSON.stringify(list));
        loadHistory();
      } catch {}
    }

    btnClearHistory.addEventListener("click", () => {
      localStorage.removeItem("berean_history");
      loadHistory();
    });

    // Execute Tool Request
    async function executeRequest() {
      const toolKey = toolSelect.value;
      const payload = getPayload();
      
      btnExecute.disabled = true;
      btnText.innerHTML = '<div class="spinner"></div> Executing...';
      statStatus.textContent = "Loading...";
      statStatus.className = "stat-val";

      const startTime = performance.now();

      try {
        const res = await fetch("/tools/" + toolKey, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const duration = Math.round(performance.now() - startTime);
        const text = await res.text();
        const sizeKb = (text.length / 1024).toFixed(1) + " KB";

        statTime.textContent = duration + " ms";
        statSize.textContent = sizeKb;

        if (res.ok) {
          statStatus.textContent = res.status + " " + res.statusText;
          statStatus.className = "stat-val ok";
        } else {
          statStatus.textContent = res.status + " Error";
          statStatus.className = "stat-val";
          statStatus.style.color = "#ef4444";
        }

        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { raw: text };
        }

        currentResponseData = parsed;
        jsonContainer.textContent = JSON.stringify(parsed, null, 2);

        // Render Markdown Preview
        let md = "";
        if (parsed.formattedText) {
          md = parsed.formattedText;
        } else if (parsed.markdown) {
          md = parsed.markdown;
        } else if (parsed.text) {
          md = parsed.text;
        } else if (parsed.error) {
          md = "**Error**: " + parsed.error;
        } else {
          md = JSON.stringify(parsed, null, 2);
        }

        currentRawMarkdown = md;
        previewContainer.innerHTML = renderMarkdown(md);
        saveHistory(toolKey, payload);

      } catch (err) {
        statStatus.textContent = "Network Error";
        statStatus.className = "stat-val";
        statStatus.style.color = "#ef4444";
        previewContainer.innerHTML = '<div style="color:#ef4444; font-weight:600;">Request failed: ' + err.message + '</div>';
        jsonContainer.textContent = JSON.stringify({ error: err.message }, null, 2);
      } finally {
        btnExecute.disabled = false;
        btnText.innerHTML = "⚡ Execute Request";
      }
    }

    // Markdown Parser
    function renderMarkdown(md) {
      if (!md) return "";
      let html = md;

      // Escape HTML tags
      html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Scripture Tag Highlighting [Romans 8:28 (BSB)]
      html = html.replace(/\\[([0-9a-zA-Z\\s]+ \\d+:\\d+(?:-\\d+)?(?:\\s*\\([A-Za-z0-9]+\\))?)\\]/g, '<span class="verse-tag">[$1]</span>');

      // Alerts
      html = html.replace(/&gt; \\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\\]\\s*\\n&gt; (.*?)(?=\\n\\n|\\n$|$)/gs, (m, type, content) => {
        return '<blockquote class="alert alert-' + type.toLowerCase() + '"><strong>' + type + ':</strong> ' + content.replace(/\\n&gt; /g, ' ') + '</blockquote>';
      });

      // Headers
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold & Italic
      html = html.replace(/\\*\\*\\*(.*?)\\*\\*\\*/gim, '<strong><em>$1</em></strong>');
      html = html.replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>');
      html = html.replace(/\\*(.*?)\\*/gim, '<em>$1</em>');

      // Lists
      html = html.replace(/^• (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
      html = html.replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>');

      // Code blocks
      const bt = String.fromCharCode(96);
      const bt3 = bt + bt + bt;
      html = html.replace(new RegExp(bt3 + "([a-z]*)\\n([\\\\s\\\\S]*?)" + bt3, "gim"), '<pre class="code-block">$2</pre>');
      html = html.replace(new RegExp(bt + "([^" + bt + "]+)" + bt, "gim"), '<code>$1</code>');

      // Blockquotes
      html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

      // Paragraphs & Linebreaks
      html = html.replace(/\\n\\n+/g, '</p><p>');
      html = html.replace(/\\n/g, '<br />');

      return '<p>' + html + '</p>';
    }

    // Copy Buttons
    btnCopyPreview.addEventListener("click", () => {
      navigator.clipboard.writeText(currentRawMarkdown);
      const orig = btnCopyPreview.textContent;
      btnCopyPreview.textContent = "✅ Copied!";
      setTimeout(() => { btnCopyPreview.textContent = orig; }, 1500);
    });

    btnCopyJson.addEventListener("click", () => {
      navigator.clipboard.writeText(jsonContainer.textContent);
      const orig = btnCopyJson.textContent;
      btnCopyJson.textContent = "✅ Copied!";
      setTimeout(() => { btnCopyJson.textContent = orig; }, 1500);
    });

    btnCopyCurl.addEventListener("click", () => {
      navigator.clipboard.writeText(curlSnippet.textContent);
      const orig = btnCopyCurl.textContent;
      btnCopyCurl.textContent = "✅ Copied!";
      setTimeout(() => { btnCopyCurl.textContent = orig; }, 1500);
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        executeRequest();
      }
      if (e.key === "/" && document.activeElement !== toolSearch && !document.activeElement.matches("input, select, textarea")) {
        e.preventDefault();
        toolSearch.focus();
        toolSearch.select();
      }
    });

    // Event Listeners
    toolSelect.addEventListener("change", () => {
      renderFields(toolSelect.value);
    });

    dynamicParamsContainer.addEventListener("input", updateCurlSnippet);
    btnExecute.addEventListener("click", executeRequest);

    // Initial Setup - Start with bible_lookup
    toolSelect.value = "bible_lookup";
    renderFields("bible_lookup");
    loadHistory();
  </script>
</body>
</html>`;
}
