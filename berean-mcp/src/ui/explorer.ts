/**
 * Non-Technical Reader-Friendly Bible Study Explorer
 * Global Preferred Bible Translation setting, clean unified search bar, and mode-specific presets.
 */

export function renderExplorerHtml(): string {
  const bt = String.fromCharCode(96);
  const bt3 = bt + bt + bt;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berean Bible Study Explorer — Exegesis & Devotional Suite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📖</text></svg>">
  <style>
    :root {
      --bg: #090c14;
      --surface: rgba(18, 24, 38, 0.7);
      --surface-border: rgba(255, 255, 255, 0.08);
      --surface-hover: rgba(255, 255, 255, 0.12);
      --accent: #38bdf8;
      --accent-gold: #f59e0b;
      --accent-purple: #a855f7;
      --accent-green: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --input-bg: rgba(7, 10, 19, 0.85);
      --card-radius: 14px;
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
        radial-gradient(at 20% 0%, rgba(56, 189, 248, 0.1) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.1) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(245, 158, 11, 0.05) 0px, transparent 60%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Header */
    header {
      border-bottom: 1px solid var(--surface-border);
      background: rgba(9, 12, 20, 0.88);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0.85rem 1.5rem;
    }

    .header-container {
      max-width: 1280px;
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

    .brand-logo {
      font-size: 1.6rem;
      display: flex;
      align-items: center;
    }

    .brand-title h1 {
      font-family: 'Cinzel', serif;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #ffffff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-title p {
      font-size: 0.72rem;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* Global Setting: Preferred Bible Version in Top Bar */
    .pref-version-wrapper {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .pref-version-select {
      background: transparent;
      border: none;
      color: var(--accent);
      font-weight: 700;
      font-size: 0.78rem;
      outline: none;
      cursor: pointer;
    }

    .pref-version-select option {
      background: #0f172a;
      color: #ffffff;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .nav-btn.primary {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.35);
      color: var(--accent);
    }

    /* Main Container */
    main {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* Hero Search Card */
    .hero-card {
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
      border: 1px solid var(--surface-border);
      border-radius: var(--card-radius);
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .hero-title {
      text-align: center;
      max-width: 700px;
      margin: 0 auto;
    }

    .hero-title h2 {
      font-family: 'Cinzel', serif;
      font-size: 1.55rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #ffffff;
      margin-bottom: 0.35rem;
    }

    .hero-title p {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Category Navigation Tabs */
    .category-tabs {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .cat-tab {
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-dim);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .cat-tab:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .cat-tab.active {
      color: var(--accent);
      background: rgba(56, 189, 248, 0.12);
      border-color: rgba(56, 189, 248, 0.3);
    }

    /* Mode Pills Selector */
    .mode-pills {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .mode-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--surface-border);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .mode-pill:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .mode-pill.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.35));
      border-color: var(--accent);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
    }

    /* Clean Unified Search Row */
    .search-row {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-input-wrapper {
      flex: 1;
      min-width: 280px;
      position: relative;
    }

    .search-input-wrapper input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      padding: 0.85rem 1.1rem;
      font-size: 0.95rem;
      color: #ffffff;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-input-wrapper input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.3);
    }

    .search-input-wrapper input::placeholder {
      color: var(--text-dim);
    }

    /* Sub-Selector for specific modes like single commentary or dictionary */
    .sub-select {
      background: var(--input-bg);
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      font-size: 0.88rem;
      font-weight: 600;
      color: #ffffff;
      outline: none;
      cursor: pointer;
    }

    .sub-select option {
      background: #0f172a;
      color: #ffffff;
    }

    .btn-study {
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.85rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-study:hover {
      background: linear-gradient(135deg, #60a5fa, #1d4ed8);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.55);
      transform: translateY(-1px);
    }

    .btn-study:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Card Footer: Samples on Left, Translation on Right */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Contextual 1-Click Inspiration Topics */
    .inspiration-bar {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      font-size: 0.75rem;
      color: var(--text-muted);
      flex: 1;
    }

    .sample-tag {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 0.22rem 0.55rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sample-tag:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Results Card */
    .results-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: var(--card-radius);
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(14px);
      overflow: hidden;
      display: none;
    }

    .results-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.02);
      flex-wrap: wrap;
    }

    .results-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .results-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .results-body {
      padding: 2rem 2.5rem;
      font-family: 'Lora', Georgia, serif;
      font-size: 1.02rem;
      line-height: 1.85;
      color: #e2e8f0;
      overflow-y: auto;
      max-height: 800px;
    }

    @media (max-width: 768px) {
      .results-body {
        padding: 1.25rem;
        font-size: 0.95rem;
      }
    }

    /* Biblical Formatting */
    .results-body h1 {
      font-family: 'Cinzel', serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.6rem;
    }

    .results-body h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 1.8rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .results-body h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-top: 1.2rem;
      margin-bottom: 0.4rem;
    }

    .results-body p {
      margin-bottom: 1.1rem;
    }

    .results-body ul, .results-body ol {
      margin-left: 1.75rem;
      margin-bottom: 1.1rem;
    }

    .results-body li {
      margin-bottom: 0.35rem;
    }

    .results-body blockquote {
      border-left: 3px solid var(--accent);
      background: rgba(56, 189, 248, 0.06);
      padding: 0.85rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
      color: #94a3b8;
    }

    .results-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.85rem;
    }

    .results-body th, .results-body td {
      border: 1px solid var(--surface-border);
      padding: 0.55rem 0.8rem;
      text-align: left;
    }

    .results-body th {
      background: rgba(255, 255, 255, 0.05);
      color: var(--accent);
      font-weight: 700;
    }

    .verse-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      color: var(--accent-gold);
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      display: inline-block;
      margin-right: 0.35rem;
      font-size: 0.82rem;
    }

    /* Spinner */
    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Open Source Site Footer */
    .site-footer {
      border-top: 1px solid var(--surface-border);
      background: rgba(6, 9, 15, 0.95);
      backdrop-filter: blur(16px);
      padding: 3rem 1.5rem 2rem 1.5rem;
      margin-top: auto;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.4fr 1.1fr 1fr;
      gap: 2.5rem;
    }

    @media (max-width: 860px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 1.75rem;
      }
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .footer-brand-name {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 1.05rem;
      color: #ffffff;
      background: linear-gradient(135deg, #ffffff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .footer-desc {
      line-height: 1.6;
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    .footer-col h4 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: 0.02em;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .footer-links strong {
      color: #cbd5e1;
    }

    .footer-links a {
      color: var(--accent);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .footer-links a:hover {
      color: #93c5fd;
      text-decoration: underline;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.25rem;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-dim);
      line-height: 1.6;
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="header-container">
      <a href="/study" class="brand">
        <div class="brand-logo">📖</div>
        <div class="brand-title">
          <h1>Berean Bible Study Explorer</h1>
          <p>Universal Exegesis, Classic Commentaries & Devotional Suite</p>
        </div>
      </a>
      <div class="nav-actions">
        <a href="/docs" class="nav-btn primary">⚡ Developer API</a>
        <a href="https://github.com/victorgoh/berean-study-suite" class="nav-btn" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 2px;">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    
    <!-- Hero Search & Action Card -->
    <div class="hero-card">
      <div class="hero-title">
        <h2>What would you like to study today?</h2>
        <p>Explore original texts, 26 classical commentaries (Spurgeon, Henry, Calvin), sermon outlines, and guided scripture prayers.</p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="category-tabs" id="category-tabs">
        <button class="cat-tab active" data-cat="scripture">📖 Scripture & Harmony (5)</button>
        <button class="cat-tab" data-cat="packs">⚡ Composite Study Packs (9)</button>
        <button class="cat-tab" data-cat="languages">🏛️ Original Languages (3)</button>
        <button class="cat-tab" data-cat="reference">📚 Reference & History (9)</button>
      </div>

      <!-- Study Mode Pills -->
      <div class="mode-pills" id="mode-pills">
        <!-- Scripture -->
        <div class="mode-pill active" data-cat="scripture" data-mode="scripture">📜 Read Scripture</div>
        <div class="mode-pill" data-cat="scripture" data-mode="search">🔍 Search Words</div>
        <div class="mode-pill" data-cat="scripture" data-mode="commentary_single">✍️ Single Commentary</div>
        <div class="mode-pill" data-cat="scripture" data-mode="xref">🔗 Cross References</div>
        <div class="mode-pill" data-cat="scripture" data-mode="parallels">⚖️ Gospel Parallels</div>

        <!-- Packs -->
        <div class="mode-pill" data-cat="packs" data-mode="prayer" style="display:none;">🙏 Prayer Guide</div>
        <div class="mode-pill" data-cat="packs" data-mode="sermon" style="display:none;">🎙️ Sermon Prep</div>
        <div class="mode-pill" data-cat="packs" data-mode="exegesis" style="display:none;">🔬 Deep Exegesis</div>
        <div class="mode-pill" data-cat="packs" data-mode="lesson" style="display:none;">🏫 Lesson Creator</div>
        <div class="mode-pill" data-cat="packs" data-mode="devotional" style="display:none;">🕊️ Daily Devotional</div>
        <div class="mode-pill" data-cat="packs" data-mode="covenant" style="display:none;">👑 Covenant Theology</div>
        <div class="mode-pill" data-cat="packs" data-mode="word_pack" style="display:none;">🔤 Word Study Pack</div>
        <div class="mode-pill" data-cat="packs" data-mode="topic_pack" style="display:none;">📑 Topical Study Pack</div>
        <div class="mode-pill" data-cat="packs" data-mode="commentary_pack" style="display:none;">💬 Multi-Commentary</div>

        <!-- Languages -->
        <div class="mode-pill" data-cat="languages" data-mode="lexicon" style="display:none;">🏛️ Lexicon (BDB/Thayer)</div>
        <div class="mode-pill" data-cat="languages" data-mode="morphology" style="display:none;">🧩 Syntax & Morphology</div>
        <div class="mode-pill" data-cat="languages" data-mode="dictionary" style="display:none;">📖 Theological Dict</div>

        <!-- Reference -->
        <div class="mode-pill" data-cat="reference" data-mode="topic" style="display:none;">🏷️ Nave's Topics</div>
        <div class="mode-pill" data-cat="reference" data-mode="promises" style="display:none;">🌈 Biblical Promises</div>
        <div class="mode-pill" data-cat="reference" data-mode="character" style="display:none;">👤 Bible Characters</div>
        <div class="mode-pill" data-cat="reference" data-mode="location" style="display:none;">📍 Geography & Maps</div>
        <div class="mode-pill" data-cat="reference" data-mode="book_analysis" style="display:none;">📚 Book Overview</div>
        <div class="mode-pill" data-cat="reference" data-mode="chapter_summary" style="display:none;">📋 Chapter Summary</div>
        <div class="mode-pill" data-cat="reference" data-mode="names" style="display:none;">🏷️ Name Etymology</div>
        <div class="mode-pill" data-cat="reference" data-mode="chronology" style="display:none;">⏳ Chronology & Era</div>
        <div class="mode-pill" data-cat="reference" data-mode="daily_reading" style="display:none;">📅 Daily Reading Plan</div>
      </div>

      <!-- Clean Unified Search Input Row -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <input type="text" id="query-input" placeholder="Passage: e.g. John 3:16, Romans 8:28, Genesis 1:1-3" value="John 3:16" />
        </div>

        <!-- Commentary Selector (Only visible for Single Commentary mode) -->
        <select id="commentary-select" class="sub-select" style="display:none;">
          <option value="Henry" selected>Matthew Henry (Devotional)</option>
          <option value="JFB">Jamieson-Fausset-Brown (Critical)</option>
          <option value="Calvin">John Calvin (Reformed)</option>
          <option value="Spur">Charles Spurgeon (Treasury of David)</option>
          <option value="MacL">Alexander Maclaren (Expositions)</option>
          <option value="Barnes">Albert Barnes (Notes)</option>
          <option value="KD">Keil & Delitzsch (OT Exegesis)</option>
          <option value="CECNT">H. A. W. Meyer (NT Critical)</option>
          <option value="Pulpit">The Pulpit Commentary</option>
          <option value="Clarke">Adam Clarke</option>
          <option value="Gill">John Gill</option>
          <option value="Wesley">John Wesley</option>
        </select>

        <!-- Dictionary Selector (Only visible for Theological Dictionary mode) -->
        <select id="dict-select" class="sub-select" style="display:none;">
          <option value="all" selected>All Dictionaries (Combined)</option>
          <option value="tbesh">TBESH (Theological Wordbook)</option>
          <option value="mcged">MCGED (Classic Greek/Hebrew)</option>
        </select>

        <button class="btn-study" id="btn-study">
          <span id="btn-icon">⚡</span>
          <span id="btn-text">Generate Prayer Guide</span>
        </button>
      </div>

      <!-- Panel Footer: Sample Queries on Left, Preferred Translation on Right -->
      <div class="card-footer">
        <div class="inspiration-bar" id="inspiration-bar">
          <span id="inspiration-label">Sample queries:</span>
          <div id="sample-tags-container" style="display:inline-flex; gap:0.4rem; flex-wrap:wrap;"></div>
        </div>

        <div class="pref-version-wrapper" title="Default Bible translation used across all Scripture queries, prayers, and lessons">
          <span>📖 Translation:</span>
          <select id="pref-version-select" class="pref-version-select">
            <option value="BSB" selected>Berean Standard Bible (BSB)</option>
            <option value="NET">New English Translation (NET)</option>
            <option value="KJV">King James Version (KJV - 1769)</option>
            <option value="WEB">World English Bible (WEB)</option>
            <option value="ASV">American Standard Version (ASV - 1901)</option>
            <option value="OHGB">Original Hebrew/Greek (OHGB)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Display Card -->
    <div class="results-card" id="results-card">
      <div class="results-header">
        <div class="results-title">
          <span id="results-icon">📖</span>
          <span id="results-heading">Study Results</span>
        </div>
        <div class="results-actions">
          <span id="latency-tag" style="font-size: 0.72rem; color: var(--text-dim); margin-right: 0.5rem;">—</span>
          <button class="action-btn" id="btn-copy">📋 Copy Study Notes</button>
          <button class="action-btn" onclick="window.print()">🖨️ Print</button>
        </div>
      </div>
      <div class="results-body" id="results-body">
        <!-- Rendered Biblical Content -->
      </div>
    </div>

  </main>

  <!-- Open Source Project Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Col 1: About the Project -->
        <div class="footer-col">
          <div class="footer-brand">
            <span style="font-size: 1.3rem;">📖</span>
            <span class="footer-brand-name">Berean AI Study Suite</span>
          </div>
          <p class="footer-desc">
            An open-source biblical exegesis engine, devotional suite, and Model Context Protocol (MCP) server. Built to empower pastors, students, scholars, and autonomous AI agents with instant access to public-domain Scripture texts, original language datasets, and 26 classical commentaries.
          </p>
        </div>

        <!-- Col 2: What Powers This Tool -->
        <div class="footer-col">
          <h4>What Powers This Engine</h4>
          <ul class="footer-links">
            <li><strong>Runtime:</strong> In-Memory WASM SQLite Engine</li>
            <li><strong>Protocol:</strong> Model Context Protocol (MCP Streamable HTTP)</li>
            <li><strong>Scripture Texts:</strong> OHGB (Hebrew/Greek), BSB, NET, KJV, ASV, WEB</li>
            <li><strong>Lexicons & Dictionaries:</strong> BDB, Thayer, Easton, Nave's, TSK</li>
            <li><strong>Classical Commentaries:</strong> Matthew Henry, Calvin, Spurgeon, JFB, Meyer, KD, Barnes</li>
          </ul>
        </div>

        <!-- Col 3: Source Code & Resources -->
        <div class="footer-col">
          <h4>Project Links & Source Code</h4>
          <ul class="footer-links">
            <li><a href="https://github.com/victorgoh/berean-study-suite" target="_blank" rel="noopener noreferrer">⭐ GitHub Repository (victorgoh/berean-study-suite)</a></li>
            <li><a href="/docs">⚡ Scalar API Reference & Tester</a></li>
            <li><a href="/swagger">📜 Swagger UI Explorer</a></li>
            <li><a href="/openapi.json">📋 OpenAPI 3.1 Specification</a></li>
            <li><a href="/mcp">📡 Model Context Protocol (MCP) Gateway</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Berean AI Study Suite. Open-source under the MIT License. Biblical texts and classical commentaries are in the Public Domain or used under open academic licenses.</p>
      </div>
    </div>
  </footer>

  <script>
    // Complete 26-Tool Context Configuration
    const TOOL_CONFIG = {
      // 1. Study Packs
      prayer: {
        endpoint: "/tools/prayer_guide_study_pack",
        icon: "🙏",
        btnLabel: "Generate Prayer Guide",
        placeholder: "Passage for prayer: e.g. Psalm 51:1-4, Ephesians 3:14-17",
        defaultQuery: "Psalm 23:1-3",
        samples: [
          { label: "Psalm 23:1-3 (Shepherd)", query: "Psalm 23:1-3" },
          { label: "Psalm 51:1-4 (Repentance)", query: "Psalm 51:1-4" },
          { label: "Ephesians 3:14-17 (Strength)", query: "Ephesians 3:14-17" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      sermon: {
        endpoint: "/tools/sermon_study_pack",
        icon: "🎙️",
        btnLabel: "Prepare Sermon Pack",
        placeholder: "Preaching text: e.g. Romans 8:28-30, Psalm 23:1-3",
        defaultQuery: "Romans 8:28-30",
        samples: [
          { label: "Romans 8:28-30 (Conquerors)", query: "Romans 8:28-30" },
          { label: "Psalm 23:1-3 (Guidance)", query: "Psalm 23:1-3" },
          { label: "Ephesians 2:8-10 (Grace)", query: "Ephesians 2:8-10" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      exegesis: {
        endpoint: "/tools/passage_exegesis_pack",
        icon: "🔬",
        btnLabel: "Generate Exegesis Pack",
        placeholder: "Passage for exegesis: e.g. Romans 8:28, John 1:1-3",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28 (Foreknowledge)", query: "Romans 8:28" },
          { label: "John 1:1-3 (The Word)", query: "John 1:1-3" },
          { label: "Genesis 1:1-3 (Creation)", query: "Genesis 1:1-3" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      lesson: {
        endpoint: "/tools/lesson_creator_study_pack",
        icon: "🏫",
        btnLabel: "Create Lesson Pack",
        placeholder: "Lesson Scripture: e.g. Luke 15:11-16, Acts 2:42-45",
        defaultQuery: "Luke 15:11-16",
        samples: [
          { label: "Luke 15:11-16 (Prodigal)", query: "Luke 15:11-16" },
          { label: "Acts 2:42-45 (Fellowship)", query: "Acts 2:42-45" },
          { label: "Romans 12:1-3 (Living Sacrifice)", query: "Romans 12:1-3" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      devotional: {
        endpoint: "/tools/devotional_study_pack",
        icon: "🕊️",
        btnLabel: "Create Devotional Pack",
        placeholder: "Devotional text: e.g. John 15:1-4, Psalm 46:1-3",
        defaultQuery: "John 15:1-4",
        samples: [
          { label: "John 15:1-4 (The True Vine)", query: "John 15:1-4" },
          { label: "Psalm 46:1-3 (Our Refuge)", query: "Psalm 46:1-3" },
          { label: "Lamentations 3:22-24 (Faithfulness)", query: "Lamentations 3:22-24" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      covenant: {
        endpoint: "/tools/covenant_theology_pack",
        icon: "👑",
        btnLabel: "Trace Covenant Links",
        placeholder: "Covenant text: e.g. Genesis 15:6, Jeremiah 31:31",
        defaultQuery: "Genesis 15:6",
        samples: [
          { label: "Genesis 15:6 (Abrahamic)", query: "Genesis 15:6" },
          { label: "Jeremiah 31:31 (New Covenant)", query: "Jeremiah 31:31" },
          { label: "2 Samuel 7:12-13 (Davidic)", query: "2 Samuel 7:12-13" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      word_pack: {
        endpoint: "/tools/word_study_pack",
        icon: "🔤",
        btnLabel: "Unpack Word Study",
        placeholder: "Strong's Code (e.g. G26, H1254, G4102)",
        defaultQuery: "G26",
        samples: [
          { label: "G26 (Agape - Love)", query: "G26" },
          { label: "H1254 (Bara - Create)", query: "H1254" },
          { label: "G4102 (Pistis - Faith)", query: "G4102" },
          { label: "H7965 (Shalom - Peace)", query: "H7965" }
        ],
        buildPayload: (q) => ({ strongs: q })
      },
      topic_pack: {
        endpoint: "/tools/topic_study_pack",
        icon: "📑",
        btnLabel: "Study Doctrinal Theme",
        placeholder: "Doctrinal topic: e.g. Justification, Grace, Atonement",
        defaultQuery: "Justification",
        samples: [
          { label: "Justification", query: "Justification" },
          { label: "Grace", query: "Grace" },
          { label: "Atonement", query: "Atonement" },
          { label: "Sanctification", query: "Sanctification" }
        ],
        buildPayload: (q, v) => ({ topic: q, version: v })
      },
      commentary_pack: {
        endpoint: "/tools/commentary_study_pack",
        icon: "💬",
        btnLabel: "Compare Commentaries",
        placeholder: "Passage: e.g. Romans 8:28, John 3:16, Psalm 23:1",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28 (Foreknowledge)", query: "Romans 8:28" },
          { label: "John 3:16 (For God So Loved)", query: "John 3:16" },
          { label: "Psalm 23:1 (The Lord is my Shepherd)", query: "Psalm 23:1" }
        ],
        buildPayload: (q) => ({ reference: q, commentators: ["Henry", "JFB", "Calvin", "Spur"] })
      },

      // 2. Scripture & Harmony
      scripture: {
        endpoint: "/tools/bible_lookup",
        icon: "📜",
        btnLabel: "Read Scripture",
        placeholder: "Passage: e.g. John 3:16, Romans 8:28, Genesis 1:1-3",
        defaultQuery: "John 3:16",
        samples: [
          { label: "John 3:16", query: "John 3:16" },
          { label: "Romans 8:28-30", query: "Romans 8:28-30" },
          { label: "Psalm 23:1-3", query: "Psalm 23:1-3" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      search: {
        endpoint: "/tools/bible_search",
        icon: "🔍",
        btnLabel: "Search Scripture",
        placeholder: "Search keywords: e.g. covenant of peace, good shepherd",
        defaultQuery: "covenant of peace",
        samples: [
          { label: "covenant of peace", query: "covenant of peace" },
          { label: "good shepherd", query: "good shepherd" },
          { label: "born again", query: "born again" }
        ],
        buildPayload: (q, v) => ({ query: q, version: v, limit: 5 })
      },
      commentary_single: {
        endpoint: "/tools/commentary_lookup",
        icon: "✍️",
        btnLabel: "Lookup Commentary",
        placeholder: "Passage: e.g. Romans 8:28, Psalm 23:1, John 1:1",
        defaultQuery: "Romans 8:28",
        hasCommentarySelect: true,
        samples: [
          { label: "Romans 8:28", query: "Romans 8:28" },
          { label: "Psalm 23:1", query: "Psalm 23:1" },
          { label: "John 1:1", query: "John 1:1" }
        ],
        buildPayload: (q, v, c) => ({ reference: q, commentary: c || "Henry" })
      },
      xref: {
        endpoint: "/tools/cross_references",
        icon: "🔗",
        btnLabel: "Fetch Cross References",
        placeholder: "Passage: e.g. Romans 8:28, John 3:16, Genesis 1:1",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28", query: "Romans 8:28" },
          { label: "John 3:16", query: "John 3:16" },
          { label: "Psalm 119:105", query: "Psalm 119:105" }
        ],
        buildPayload: (q) => ({ reference: q, limit: 8 })
      },
      parallels: {
        endpoint: "/tools/parallel_passages",
        icon: "⚖️",
        btnLabel: "Find Gospel Parallels",
        placeholder: "Gospel passage or event: e.g. Matthew 4:1-4, Matthew 28:1-4",
        defaultQuery: "Matthew 4:1-4",
        samples: [
          { label: "Matthew 4:1-4 (Temptation)", query: "Matthew 4:1-4" },
          { label: "Matthew 28:1-4 (Resurrection)", query: "Matthew 28:1-4" },
          { label: "Mark 1:9-11 (Baptism of Jesus)", query: "Mark 1:9-11" }
        ],
        buildPayload: (q) => ({ reference: q })
      },

      // 3. Original Languages
      lexicon: {
        endpoint: "/tools/lexicon_lookup",
        icon: "🏛️",
        btnLabel: "Lookup Lexicon Entry",
        placeholder: "Strong's # (e.g. G26 for Greek Thayer, H1254 for Hebrew BDB)",
        defaultQuery: "G26",
        samples: [
          { label: "G26 (Agape - Thayer)", query: "G26" },
          { label: "H1254 (Bara - BDB)", query: "H1254" },
          { label: "G3056 (Logos - Word)", query: "G3056" },
          { label: "H7965 (Shalom - Peace)", query: "H7965" }
        ],
        buildPayload: (q) => ({ strongs: q })
      },
      morphology: {
        endpoint: "/tools/morphology_lookup",
        icon: "🧩",
        btnLabel: "Parse Verse Syntax",
        placeholder: "Single verse: e.g. John 1:1, Genesis 1:1, Romans 8:28",
        defaultQuery: "John 1:1",
        samples: [
          { label: "John 1:1 (Greek)", query: "John 1:1" },
          { label: "Genesis 1:1 (Hebrew)", query: "Genesis 1:1" },
          { label: "Romans 8:28 (Greek)", query: "Romans 8:28" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      dictionary: {
        endpoint: "/tools/theological_dictionary",
        icon: "📖",
        btnLabel: "Lookup Theological Dict",
        placeholder: "Theological term: e.g. Grace, Redemption, Covenant",
        defaultQuery: "Grace",
        hasDictSelect: true,
        samples: [
          { label: "Grace", query: "Grace" },
          { label: "Redemption", query: "Redemption" },
          { label: "Covenant", query: "Covenant" }
        ],
        buildPayload: (q, v, c, d) => ({ term: q, dictionary: d || "all" })
      },

      // 4. Reference & Catalog
      topic: {
        endpoint: "/tools/topic_study",
        icon: "🏷️",
        btnLabel: "Nave's Topic Lookup",
        placeholder: "Biblical theme: e.g. Love, Prayer, Faith, Peace",
        defaultQuery: "Love",
        samples: [
          { label: "Love", query: "Love" },
          { label: "Prayer", query: "Prayer" },
          { label: "Faith", query: "Faith" },
          { label: "Peace", query: "Peace" }
        ],
        buildPayload: (q) => ({ topic: q })
      },
      promises: {
        endpoint: "/tools/biblical_promises",
        icon: "🌈",
        btnLabel: "Find Biblical Promises",
        placeholder: "Promise topic: e.g. Peace, Comfort, Forgiveness, Hope",
        defaultQuery: "Peace",
        samples: [
          { label: "Peace", query: "Peace" },
          { label: "Comfort", query: "Comfort" },
          { label: "Forgiveness", query: "Forgiveness" }
        ],
        buildPayload: (q, v) => ({ category: q, version: v })
      },
      character: {
        endpoint: "/tools/character_lookup",
        icon: "👤",
        btnLabel: "Lookup Character",
        placeholder: "Biblical character name: e.g. David, Abraham, Paul, Moses",
        defaultQuery: "David",
        samples: [
          { label: "David", query: "David" },
          { label: "Abraham", query: "Abraham" },
          { label: "Paul", query: "Paul" },
          { label: "Moses", query: "Moses" }
        ],
        buildPayload: (q) => ({ name: q })
      },
      location: {
        endpoint: "/tools/location_lookup",
        icon: "📍",
        btnLabel: "Lookup Geography",
        placeholder: "Location: e.g. Jerusalem, Bethlehem, Nazareth, Mount Sinai",
        defaultQuery: "Jerusalem",
        samples: [
          { label: "Jerusalem", query: "Jerusalem" },
          { label: "Bethlehem", query: "Bethlehem" },
          { label: "Nazareth", query: "Nazareth" }
        ],
        buildPayload: (q) => ({ location: q })
      },
      book_analysis: {
        endpoint: "/tools/book_analysis",
        icon: "📚",
        btnLabel: "Analyze Book Structure",
        placeholder: "Book name: e.g. Romans, Genesis, Hebrews, John",
        defaultQuery: "Romans",
        samples: [
          { label: "Romans", query: "Romans" },
          { label: "Genesis", query: "Genesis" },
          { label: "Hebrews", query: "Hebrews" }
        ],
        buildPayload: (q) => ({ book: q })
      },
      chapter_summary: {
        endpoint: "/tools/chapter_summary",
        icon: "📋",
        btnLabel: "Summarize Chapter",
        placeholder: "Book and Chapter: e.g. John 1, Romans 8, Genesis 1",
        defaultQuery: "John 1",
        samples: [
          { label: "John 1", query: "John 1" },
          { label: "Romans 8", query: "Romans 8" },
          { label: "Genesis 1", query: "Genesis 1" }
        ],
        buildPayload: (q) => {
          const parts = q.trim().split(" ");
          const ch = parseInt(parts.pop()) || 1;
          const bk = parts.join(" ") || "John";
          return { book: bk, chapter: ch };
        }
      },
      names: {
        endpoint: "/tools/bible_names",
        icon: "🏷️",
        btnLabel: "Lookup Name Meaning",
        placeholder: "Name: e.g. Immanuel, Joshua, Melchizedek, Jesus",
        defaultQuery: "Immanuel",
        samples: [
          { label: "Immanuel", query: "Immanuel" },
          { label: "Joshua", query: "Joshua" },
          { label: "Melchizedek", query: "Melchizedek" }
        ],
        buildPayload: (q) => ({ name: q })
      },
      chronology: {
        endpoint: "/tools/chronology",
        icon: "⏳",
        btnLabel: "View Era Timeline",
        placeholder: "Era: e.g. Patriarchs, Exodus, Life of Christ, Early Church",
        defaultQuery: "Patriarchs",
        samples: [
          { label: "Patriarchs", query: "Patriarchs" },
          { label: "Exodus", query: "Exodus" },
          { label: "Life of Christ", query: "Life of Christ" }
        ],
        buildPayload: (q) => ({ period: q })
      },
      daily_reading: {
        endpoint: "/tools/daily_reading",
        icon: "📅",
        btnLabel: "Get Reading Plan",
        placeholder: "Day of year (1-365): e.g. 1, 50, 100",
        defaultQuery: "1",
        samples: [
          { label: "Day 1 (Genesis / Matthew)", query: "1" },
          { label: "Day 50 (Leviticus / Mark)", query: "50" },
          { label: "Day 100 (Joshua / Luke)", query: "100" }
        ],
        buildPayload: (q) => ({ day: parseInt(q) || 1 })
      }
    };

    let activeMode = "scripture";
    let activeCat = "scripture";
    let lastRenderedMarkdown = "";

    const queryInput = document.getElementById("query-input");
    const prefVersionSelect = document.getElementById("pref-version-select");
    const commentarySelect = document.getElementById("commentary-select");
    const dictSelect = document.getElementById("dict-select");
    const btnStudy = document.getElementById("btn-study");
    const btnIcon = document.getElementById("btn-icon");
    const btnText = document.getElementById("btn-text");
    const catTabs = document.querySelectorAll(".cat-tab");
    const modePills = document.querySelectorAll(".mode-pill");
    const resultsCard = document.getElementById("results-card");
    const resultsBody = document.getElementById("results-body");
    const resultsHeading = document.getElementById("results-heading");
    const resultsIcon = document.getElementById("results-icon");
    const latencyTag = document.getElementById("latency-tag");
    const btnCopy = document.getElementById("btn-copy");
    const sampleTagsContainer = document.getElementById("sample-tags-container");

    // Load / Save Preferred Bible Version from localStorage
    const savedVersion = localStorage.getItem("berean_preferred_version");
    if (savedVersion) {
      prefVersionSelect.value = savedVersion;
    }
    prefVersionSelect.addEventListener("change", () => {
      localStorage.setItem("berean_preferred_version", prefVersionSelect.value);
    });

    // Update Contextual UI Controls & Samples for the Active Mode
    function updateContextualControls() {
      const cfg = TOOL_CONFIG[activeMode] || TOOL_CONFIG.prayer;

      // Update Input Field & Button
      queryInput.placeholder = cfg.placeholder;
      btnText.textContent = cfg.btnLabel;

      // Sub-Selectors (only for Single Commentary or Dict)
      commentarySelect.style.display = cfg.hasCommentarySelect ? "inline-block" : "none";
      dictSelect.style.display = cfg.hasDictSelect ? "inline-block" : "none";

      // Render Mode-Specific Sample Tags
      sampleTagsContainer.innerHTML = "";
      if (cfg.samples && cfg.samples.length > 0) {
        cfg.samples.forEach(s => {
          const tag = document.createElement("span");
          tag.className = "sample-tag";
          tag.textContent = s.label;
          tag.addEventListener("click", () => {
            queryInput.value = s.query;
            executeStudy();
          });
          sampleTagsContainer.appendChild(tag);
        });
      }
    }

    // Category Tabs Filter
    catTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        catTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeCat = tab.getAttribute("data-cat");

        let firstPill = null;
        modePills.forEach(pill => {
          const pcat = pill.getAttribute("data-cat");
          const visible = pcat === activeCat;
          pill.style.display = visible ? "inline-flex" : "none";
          if (visible && !firstPill) firstPill = pill;
        });

        if (firstPill) {
          modePills.forEach(p => p.classList.remove("active"));
          firstPill.classList.add("active");
          activeMode = firstPill.getAttribute("data-mode");
          queryInput.value = (TOOL_CONFIG[activeMode] || {}).defaultQuery || "";
          updateContextualControls();
        }
      });
    });

    // Switch Mode Pill
    modePills.forEach(pill => {
      pill.addEventListener("click", () => {
        modePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeMode = pill.getAttribute("data-mode");
        queryInput.value = (TOOL_CONFIG[activeMode] || {}).defaultQuery || "";
        updateContextualControls();
      });
    });

    // Execute Study Request
    async function executeStudy() {
      const q = queryInput.value.trim();
      if (!q) return;

      const v = prefVersionSelect.value || "BSB";
      const c = commentarySelect.value;
      const d = dictSelect.value;
      const config = TOOL_CONFIG[activeMode] || TOOL_CONFIG.prayer;
      const payload = config.buildPayload(q, v, c, d);

      btnStudy.disabled = true;
      btnIcon.innerHTML = '<div class="spinner"></div>';
      btnText.textContent = "Studying...";
      
      resultsCard.style.display = "block";
      resultsBody.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-muted);"><div class="spinner" style="margin:0 auto 1rem auto; width:24px; height:24px; border-width:3px;"></div>Querying Berean Exegesis Engine...</div>';
      resultsHeading.textContent = config.btnLabel + ": " + q;
      resultsIcon.textContent = config.icon;

      const startTime = performance.now();

      try {
        const res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const duration = Math.round(performance.now() - startTime);
        latencyTag.textContent = duration + " ms";

        const text = await res.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { text: text };
        }

        let md = "";
        if (parsed.formattedText) {
          md = parsed.formattedText;
        } else if (parsed.markdown) {
          md = parsed.markdown;
        } else if (parsed.text) {
          md = parsed.text;
        } else if (parsed.verses) {
          md = "# Scripture: " + q + " (" + v + ")\\n\\n" + parsed.verses.map(x => "[" + x.book + " " + x.chapter + ":" + x.verse + " (" + v + ")] " + x.text).join("\\n\\n");
        } else if (parsed.matches) {
          md = "# Search Results for: " + q + " (" + parsed.totalCount + " matches)\\n\\n" + parsed.matches.map(x => "[" + x.book + " " + x.chapter + ":" + x.verse + " (" + v + ")] " + x.text).join("\\n\\n");
        } else if (parsed.error) {
          md = "**Error**: " + parsed.error;
        } else {
          md = JSON.stringify(parsed, null, 2);
        }

        lastRenderedMarkdown = md;
        resultsBody.innerHTML = formatMarkdown(md);

        // Smooth scroll to results
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (err) {
        resultsBody.innerHTML = '<div style="color:#ef4444; font-weight:bold;">Error fetching study data: ' + err.message + '</div>';
      } finally {
        btnStudy.disabled = false;
        btnIcon.textContent = "⚡";
        btnText.textContent = config.btnLabel;
      }
    }

    // Markdown Formatter
    function formatMarkdown(md) {
      if (!md) return "";
      let html = md;

      // Escape HTML
      html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Scripture Tag Highlighting [Romans 8:28 (BSB)]
      html = html.replace(/\\[([0-9a-zA-Z\\s]+ \\d+:\\d+(?:-\\d+)?(?:\\s*\\([A-Za-z0-9]+\\))?)\\]/g, '<span class="verse-badge">[$1]</span>');

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
      html = html.replace(new RegExp(bt3 + "([a-z]*)\\n([\\\\s\\\\S]*?)" + bt3, "gim"), '<pre style="background:rgba(0,0,0,0.4); padding:1rem; border-radius:8px; font-family:monospace; font-size:0.85rem;">$2</pre>');
      html = html.replace(new RegExp(bt + "([^" + bt + "]+)" + bt, "gim"), '<code style="background:rgba(255,255,255,0.08); padding:0.1rem 0.35rem; border-radius:4px; font-family:monospace; color:#38bdf8;">$1</code>');

      // Blockquotes
      html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

      // Paragraphs & Linebreaks
      html = html.replace(/\\n\\n+/g, '</p><p>');
      html = html.replace(/\\n/g, '<br />');

      return '<p>' + html + '</p>';
    }

    // Copy Button
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(lastRenderedMarkdown);
      const orig = btnCopy.textContent;
      btnCopy.textContent = "✅ Copied Notes!";
      setTimeout(() => { btnCopy.textContent = orig; }, 1800);
    });

    // Enter Key to Study
    queryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeStudy();
      }
    });

    btnStudy.addEventListener("click", executeStudy);

    // Initial setup on load
    updateContextualControls();
    executeStudy();
  </script>
</body>
</html>`;
}
