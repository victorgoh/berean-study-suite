/**
 * Berean Bible Study Explorer — Lay-Friendly Edition
 * Warm, accessible companion for spiritual growth, scripture reflection, and biblical learning.
 */

export function renderExplorerHtml(analyticsSnippet: string = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berean Bible Study Explorer — Companion for Spiritual Growth & Scripture Learning</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📖</text></svg>">
  ${analyticsSnippet ? `\n  ${analyticsSnippet}\n` : ""}
  <style>
    :root {
      --bg: #0e131f;
      --surface: rgba(20, 27, 41, 0.75);
      --surface-border: rgba(255, 255, 255, 0.09);
      --surface-hover: rgba(255, 255, 255, 0.13);
      --accent-gold: #e5a93c;
      --accent-gold-hover: #f5b74f;
      --accent-gold-bg: rgba(229, 169, 60, 0.12);
      --accent-gold-border: rgba(229, 169, 60, 0.35);
      --accent-blue: #60a5fa;
      --accent-sage: #68a67d;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --input-bg: rgba(11, 16, 26, 0.85);
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
        radial-gradient(at 15% 0%, rgba(229, 169, 60, 0.08) 0px, transparent 45%),
        radial-gradient(at 85% 0%, rgba(96, 165, 250, 0.08) 0px, transparent 45%),
        radial-gradient(at 50% 100%, rgba(104, 166, 125, 0.06) 0px, transparent 55%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Header */
    header {
      border-bottom: 1px solid var(--surface-border);
      background: rgba(14, 19, 31, 0.92);
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
      font-family: 'Lora', Georgia, serif;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: #ffffff;
    }

    .brand-title p {
      font-size: 0.74rem;
      color: var(--text-muted);
      letter-spacing: 0.01em;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    /* Global Setting: Preferred Bible Version in Top Bar */
    .pref-version-wrapper {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.76rem;
      color: var(--text-muted);
    }

    .pref-version-select {
      background: transparent;
      border: none;
      color: var(--accent-gold);
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
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.76rem;
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

    .nav-btn.github-btn {
      background: var(--accent-gold-bg);
      border-color: var(--accent-gold-border);
      color: var(--accent-gold);
      font-weight: 700;
    }

    .nav-btn.github-btn:hover {
      background: rgba(229, 169, 60, 0.22);
      border-color: var(--accent-gold-hover);
      color: #ffffff;
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
      background: linear-gradient(180deg, rgba(28, 36, 52, 0.75) 0%, rgba(16, 22, 34, 0.9) 100%);
      border: 1px solid var(--surface-border);
      border-radius: var(--card-radius);
      padding: 2rem;
      box-shadow: 0 18px 38px -12px rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
    }

    .hero-title {
      text-align: center;
      max-width: 740px;
      margin: 0 auto;
    }

    .hero-title h2 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.6rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.4rem;
    }

    .hero-title p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.55;
    }

    /* Category Navigation Tabs */
    .category-tabs {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.85rem;
      flex-wrap: wrap;
    }

    .cat-tab {
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      font-size: 0.82rem;
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
      color: var(--accent-gold);
      background: var(--accent-gold-bg);
      border-color: var(--accent-gold-border);
    }

    /* Mode Pills Selector */
    .mode-pills {
      display: flex;
      justify-content: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .mode-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.38rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.76rem;
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
      background: linear-gradient(135deg, rgba(229, 169, 60, 0.3), rgba(180, 120, 20, 0.4));
      border-color: var(--accent-gold);
      box-shadow: 0 0 10px rgba(229, 169, 60, 0.25);
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
      border-color: var(--accent-gold);
      box-shadow: 0 0 14px rgba(229, 169, 60, 0.25);
    }

    .search-input-wrapper input::placeholder {
      color: var(--text-dim);
    }

    /* Sub-Selector for specific modes */
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
      background: linear-gradient(135deg, #e5a93c, #c5861b);
      color: #111827;
      border: none;
      border-radius: 10px;
      padding: 0.85rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(229, 169, 60, 0.35);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-study:hover {
      background: linear-gradient(135deg, #f5b74f, #d5962b);
      box-shadow: 0 6px 20px rgba(229, 169, 60, 0.45);
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
      font-size: 0.76rem;
      color: var(--text-muted);
      flex: 1;
    }

    .sample-tag {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 0.25rem 0.6rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sample-tag:hover {
      background: var(--accent-gold-bg);
      border-color: var(--accent-gold);
      color: var(--accent-gold-hover);
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
      font-size: 0.98rem;
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
    }

    .action-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .results-body {
      padding: 2rem;
      font-family: 'Lora', Georgia, serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: #e2e8f0;
    }

    .results-body h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.45rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .results-body h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    .results-body h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.98rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-top: 1.3rem;
      margin-bottom: 0.45rem;
    }

    .results-body p {
      margin-bottom: 1.2rem;
    }

    .results-body ul, .results-body ol {
      margin-left: 1.75rem;
      margin-bottom: 1.2rem;
    }

    .results-body li {
      margin-bottom: 0.4rem;
    }

    .results-body blockquote {
      border-left: 3px solid var(--accent-gold);
      background: var(--accent-gold-bg);
      padding: 0.85rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.9rem;
      color: #cbd5e1;
    }

    .results-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
    }

    .results-body th, .results-body td {
      border: 1px solid var(--surface-border);
      padding: 0.6rem 0.85rem;
      text-align: left;
    }

    .results-body th {
      background: rgba(255, 255, 255, 0.05);
      color: var(--accent-gold);
      font-weight: 700;
    }

    .verse-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      color: var(--accent-gold);
      background: var(--accent-gold-bg);
      border: 1px solid var(--accent-gold-border);
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
      background: rgba(10, 14, 22, 0.96);
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2.5rem;
    }

    .footer-col h4 {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-main);
      margin-bottom: 1rem;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .footer-links a:hover {
      color: var(--accent-gold);
    }

    .footer-desc {
      font-size: 0.82rem;
      color: var(--text-dim);
      line-height: 1.6;
    }

    .footer-bottom {
      border-top: 1px solid var(--surface-border);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .github-link-highlight {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--accent-gold);
      font-weight: 700;
      text-decoration: none;
    }

    .github-link-highlight:hover {
      color: var(--accent-gold-hover);
      text-decoration: underline;
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
          <p>A Companion for Spiritual Growth, Daily Reflection & Learning God's Word</p>
        </div>
      </a>
      <div class="nav-actions">
        <a href="https://github.com/victorgoh/berean-study-suite" class="nav-btn github-btn" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 2px;">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Get Code on GitHub
        </a>
        <a href="/docs" class="nav-btn">⚡ API & Docs</a>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    
    <!-- Hero Search & Action Card -->
    <div class="hero-card">
      <div class="hero-title">
        <h2>A Companion for Studying & Praying Through God’s Word</h2>
        <p>Explore Scripture texts, trusted classical study notes, word meanings, and guided prayers for daily reflection and growth.</p>
      </div>

      <!-- Category Filter Tabs (4 Simple Journeys) -->
      <div class="category-tabs" id="category-tabs">
        <button class="cat-tab active" data-cat="read">📖 Read & Search (5)</button>
        <button class="cat-tab" data-cat="devotion">🕊️ Prayer & Devotion (3)</button>
        <button class="cat-tab" data-cat="study">💡 Study & Teaching (10)</button>
        <button class="cat-tab" data-cat="history">🏛️ Original Words & History (17)</button>
      </div>

      <!-- Study Mode Pills -->
      <div class="mode-pills" id="mode-pills">
        <!-- 1. Read & Search -->
        <div class="mode-pill active" data-cat="read" data-mode="scripture">📜 Read Scripture</div>
        <div class="mode-pill" data-cat="read" data-mode="search">🔍 Search the Bible</div>
        <div class="mode-pill" data-cat="read" data-mode="parallels">⚖️ Gospel Parallels</div>
        <div class="mode-pill" data-cat="read" data-mode="xref">🔗 Cross References</div>
        <div class="mode-pill" data-cat="read" data-mode="daily_reading">📅 Daily Reading Plan</div>

        <!-- 2. Prayer & Devotion -->
        <div class="mode-pill" data-cat="devotion" data-mode="devotional" style="display:none;">🕊️ Daily Devotional</div>
        <div class="mode-pill" data-cat="devotion" data-mode="prayer" style="display:none;">🙏 Scripture Prayer Guide</div>
        <div class="mode-pill" data-cat="devotion" data-mode="promises" style="display:none;">🌈 Promises for Life</div>

        <!-- 3. Study & Teaching -->
        <div class="mode-pill" data-cat="study" data-mode="exegesis" style="display:none;">🔬 Verse-by-Verse Study</div>
        <div class="mode-pill" data-cat="study" data-mode="sermon" style="display:none;">🎙️ Teaching & Sermon Helper</div>
        <div class="mode-pill" data-cat="study" data-mode="lesson" style="display:none;">🏫 Small Group & Sunday School</div>
        <div class="mode-pill" data-cat="study" data-mode="commentary_pack" style="display:none;">💬 Compare Commentaries</div>
        <div class="mode-pill" data-cat="study" data-mode="commentary_single" style="display:none;">✍️ Single Commentary</div>
        <div class="mode-pill" data-cat="study" data-mode="covenant" style="display:none;">👑 Themes Across Scripture</div>
        <div class="mode-pill" data-cat="study" data-mode="topic_pack" style="display:none;">📑 Topical Study Pack</div>
        <div class="mode-pill" data-cat="study" data-mode="topic" style="display:none;">🏷️ Nave's Bible Topics</div>
        <div class="mode-pill" data-cat="study" data-mode="book_analysis" style="display:none;">📚 Book Overview</div>
        <div class="mode-pill" data-cat="study" data-mode="chapter_summary" style="display:none;">📋 Chapter Summary</div>

        <!-- 4. Original Words & History -->
        <div class="mode-pill" data-cat="history" data-mode="word_pack" style="display:none;">🔤 Original Word Meaning</div>
        <div class="mode-pill" data-cat="history" data-mode="lexicon" style="display:none;">🏛️ Lexicon (BDB / Thayer / STEP)</div>
        <div class="mode-pill" data-cat="history" data-mode="morphology" style="display:none;">🧩 Grammar & Syntax</div>
        <div class="mode-pill" data-cat="history" data-mode="interlinear_pack" style="display:none;">📜 Word-by-Word Interlinear</div>
        <div class="mode-pill" data-cat="history" data-mode="interlinear_lookup" style="display:none;">🔍 Inline Interlinear</div>
        <div class="mode-pill" data-cat="history" data-mode="septuagint_pack" style="display:none;">🏛️ Greek Septuagint & Hebrew MT</div>
        <div class="mode-pill" data-cat="history" data-mode="septuagint_lookup" style="display:none;">📜 Septuagint Text</div>
        <div class="mode-pill" data-cat="history" data-mode="ot_in_nt_pack" style="display:none;">🔗 Old Testament in the New</div>
        <div class="mode-pill" data-cat="history" data-mode="ot_quotations" style="display:none;">🔎 OT Quotes & Allusions</div>
        <div class="mode-pill" data-cat="history" data-mode="entities" style="display:none;">👤 Who is Who? (People & Places)</div>
        <div class="mode-pill" data-cat="history" data-mode="units" style="display:none;">⚖️ Coins, Weights & Measures</div>
        <div class="mode-pill" data-cat="history" data-mode="character" style="display:none;">👤 Bible Characters & Family Trees</div>
        <div class="mode-pill" data-cat="history" data-mode="location" style="display:none;">📍 Geography & Maps</div>
        <div class="mode-pill" data-cat="history" data-mode="names" style="display:none;">🏷️ Name Meanings</div>
        <div class="mode-pill" data-cat="history" data-mode="chronology" style="display:none;">⏳ Biblical Timeline</div>
        <div class="mode-pill" data-cat="history" data-mode="dictionary" style="display:none;">📖 Bible Dictionary</div>
        <div class="mode-pill" data-cat="history" data-mode="resources" style="display:none;">📋 Resource Catalog</div>
      </div>

      <!-- Clean Unified Search Input Row -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <input type="text" id="query-input" placeholder="Passage: e.g. John 3:16, Romans 8:28, Psalm 23" value="John 3:16" />
        </div>

        <!-- Commentary Selector -->
        <select id="commentary-select" class="sub-select" style="display:none;">
          <option value="TNotes" selected>Tyndale Open Study Notes (Modern / Contextual)</option>
          <option value="Henry">Matthew Henry (Devotional)</option>
          <option value="Spur">Charles Spurgeon (Treasury of David)</option>
          <option value="MacL">Alexander Maclaren (Expositions)</option>
          <option value="Barnes">Albert Barnes (Notes)</option>
          <option value="Calvin">John Calvin (Reformed)</option>
          <option value="JFB">Jamieson-Fausset-Brown (Critical)</option>
          <option value="KD">Keil & Delitzsch (OT Exegesis)</option>
          <option value="Pulpit">The Pulpit Commentary (Sharded)</option>
          <option value="BI">The Biblical Illustrator</option>
          <option value="Clarke">Adam Clarke</option>
          <option value="Gill">John Gill</option>
          <option value="Wesley">John Wesley</option>
        </select>

        <!-- Dictionary Selector -->
        <select id="dict-select" class="sub-select" style="display:none;">
          <option value="tyndale" selected>Tyndale Open Bible Dictionary (6,000+ Articles)</option>
          <option value="isbe">ISBE Encyclopedia</option>
          <option value="easton">Easton's Bible Dictionary</option>
          <option value="smith">Smith's Bible Dictionary</option>
        </select>

        <button class="btn-study" id="btn-study">
          <span id="btn-icon">📖</span>
          <span id="btn-text">Read Scripture</span>
        </button>
      </div>

      <!-- Panel Footer: Sample Queries on Left, Preferred Translation on Right -->
      <div class="card-footer">
        <div class="inspiration-bar" id="inspiration-bar">
          <span id="inspiration-label">Sample passages:</span>
          <div id="sample-tags-container" style="display:inline-flex; gap:0.4rem; flex-wrap:wrap;"></div>
        </div>

        <div class="pref-version-wrapper" title="Default Bible translation used across queries">
          <span>📖 Translation:</span>
          <select id="pref-version-select" class="pref-version-select">
            <option value="BSB" selected>Berean Standard Bible (BSB)</option>
            <option value="NET">New English Translation (NET)</option>
            <option value="KJV">King James Version (KJV)</option>
            <option value="WEB">World English Bible (WEB)</option>
            <option value="ASV">American Standard Version (ASV)</option>
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
          <span id="latency-tag" style="font-size: 0.74rem; color: var(--text-dim); margin-right: 0.5rem;">—</span>
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
          <h4>About Berean Study Suite</h4>
          <p class="footer-desc">
            An open-source study companion designed to remove friction from reading, understanding, and praying through God's Word. Combines public-domain Scripture translations, 26 classical commentary sets, original Greek and Hebrew lexicons, and Model Context Protocol (MCP) server integration.
          </p>
          <p style="margin-top: 1rem;">
            <a href="https://github.com/victorgoh/berean-study-suite" class="github-link-highlight" target="_blank" rel="noopener noreferrer">
              ⭐ Get the Complete Source Code on GitHub &rarr;
            </a>
          </p>
        </div>

        <!-- Col 2: What Powers This Tool -->
        <div class="footer-col">
          <h4>Biblical & Academic Datasets</h4>
          <ul class="footer-links">
            <li><strong>Scripture:</strong> BSB, NET, KJV, ASV, WEB, OHGB (Hebrew/Greek), LXX</li>
            <li><strong>Study Notes & Commentaries:</strong> Tyndale Open Study Notes (15,000+ verses), Matthew Henry, Spurgeon, Maclaren, Calvin, Barnes, JFB, Keil & Delitzsch</li>
            <li><strong>Original Languages:</strong> STEPBible TBESG/TBESH, Thayer, BDB, LSJ</li>
            <li><strong>Dictionaries & Reference:</strong> Tyndale Open Bible Dictionary (6,000+ articles), Easton's, ISBE Encyclopedia, Nave's Topical, TSK</li>
          </ul>
        </div>

        <!-- Col 3: Source Code & Resources -->
        <div class="footer-col">
          <h4>Project Links & Documentation</h4>
          <ul class="footer-links">
            <li><a href="https://github.com/victorgoh/berean-study-suite" target="_blank" rel="noopener noreferrer">⭐ GitHub Repository (victorgoh/berean-study-suite)</a></li>
            <li><a href="/docs">⚡ Scalar API Reference & Playground</a></li>
            <li><a href="/swagger">📜 Swagger UI Visualizer</a></li>
            <li><a href="/openapi.json">📋 OpenAPI 3.1 Specification</a></li>
            <li><a href="/mcp">📡 Model Context Protocol (MCP) Gateway</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Berean Study Suite. Open-source under the GPL-3.0 License. Biblical texts and commentaries are in the Public Domain or used under open academic licenses.</p>
        <p><a href="https://github.com/victorgoh/berean-study-suite" class="github-link-highlight" target="_blank" rel="noopener noreferrer">github.com/victorgoh/berean-study-suite</a></p>
      </div>
    </div>
  </footer>

  <script>
    // Complete 35-Tool Context Configuration
    const TOOL_CONFIG = {
      // 1. Read & Search
      scripture: {
        endpoint: "/tools/bible_lookup",
        icon: "📜",
        btnLabel: "Read Scripture",
        placeholder: "Passage: e.g. John 3:16, Romans 8:28, Psalm 23",
        defaultQuery: "John 3:16",
        samples: [
          { label: "John 3:16 (God's Love)", query: "John 3:16" },
          { label: "Psalm 23 (The Lord is My Shepherd)", query: "Psalm 23:1-6" },
          { label: "Romans 8:28-39 (More Than Conquerors)", query: "Romans 8:28-39" },
          { label: "Philippians 4:4-8 (Peace of God)", query: "Philippians 4:4-8" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      search: {
        endpoint: "/tools/bible_search",
        icon: "🔍",
        btnLabel: "Search the Bible",
        placeholder: "Keywords: e.g. good shepherd, peace of god, born again",
        defaultQuery: "peace of god",
        samples: [
          { label: "peace of god", query: "peace of god" },
          { label: "good shepherd", query: "good shepherd" },
          { label: "living hope", query: "living hope" },
          { label: "grace and truth", query: "grace and truth" }
        ],
        buildPayload: (q, v) => ({ query: q, version: v, limit: 10 })
      },
      parallels: {
        endpoint: "/tools/parallel_passages",
        icon: "⚖️",
        btnLabel: "Find Gospel Parallels",
        placeholder: "Passage title or event: e.g. Sermon on the Mount, Beatitudes, Feeding 5000",
        defaultQuery: "Beatitudes",
        samples: [
          { label: "Beatitudes", query: "Beatitudes" },
          { label: "The Lord's Prayer", query: "The Lord's Prayer" },
          { label: "Feeding the 5000", query: "Feeding the 5000" },
          { label: "Resurrection", query: "Resurrection" }
        ],
        buildPayload: (q) => ({ query: q })
      },
      xref: {
        endpoint: "/tools/cross_references",
        icon: "🔗",
        btnLabel: "Explore Cross References",
        placeholder: "Passage: e.g. Romans 8:28, John 3:16, Isaiah 53:5",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28", query: "Romans 8:28" },
          { label: "John 3:16", query: "John 3:16" },
          { label: "Isaiah 53:5", query: "Isaiah 53:5" },
          { label: "Psalm 119:105", query: "Psalm 119:105" }
        ],
        buildPayload: (q) => ({ reference: q, limit: 12 })
      },
      daily_reading: {
        endpoint: "/tools/daily_reading",
        icon: "📅",
        btnLabel: "Get Today's Reading",
        placeholder: "Date (YYYY-MM-DD) or leave empty for today",
        defaultQuery: "",
        samples: [
          { label: "Today's Assigned Reading", query: "" }
        ],
        buildPayload: (q, v) => ({ date: q || undefined, version: v, include_text: true })
      },

      // 2. Prayer & Devotion
      devotional: {
        endpoint: "/tools/devotional_study_pack",
        icon: "🕊️",
        btnLabel: "Open Devotional Reflection",
        placeholder: "Devotional text: e.g. John 15:1-8, Psalm 23, Romans 8:31-39",
        defaultQuery: "John 15:1-8",
        samples: [
          { label: "John 15:1-8 (Abiding in the Vine)", query: "John 15:1-8" },
          { label: "Psalm 23 (The Shepherd's Care)", query: "Psalm 23:1-6" },
          { label: "Psalm 46:1-3 (God Our Refuge)", query: "Psalm 46:1-3" },
          { label: "Lamentations 3:22-26 (Great is Thy Faithfulness)", query: "Lamentations 3:22-26" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      prayer: {
        endpoint: "/tools/prayer_guide_study_pack",
        icon: "🙏",
        btnLabel: "Build Scripture Prayer",
        placeholder: "Passage for prayer: e.g. Psalm 51, Ephesians 3:14-21, Colossians 1:9-12",
        defaultQuery: "Psalm 23:1-6",
        samples: [
          { label: "Psalm 23 (Prayer of Trust)", query: "Psalm 23:1-6" },
          { label: "Psalm 51 (Prayer of Repentance)", query: "Psalm 51:1-12" },
          { label: "Ephesians 3:14-21 (Prayer for Spiritual Strength)", query: "Ephesians 3:14-21" },
          { label: "Colossians 1:9-12 (Prayer for Wisdom & Walk)", query: "Colossians 1:9-12" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      promises: {
        endpoint: "/tools/biblical_promises",
        icon: "🌈",
        btnLabel: "Find Scripture Promises",
        placeholder: "Topic or spiritual need: e.g. Peace, Comfort, Strength, Fear, Healing, Hope",
        defaultQuery: "Peace",
        samples: [
          { label: "Peace", query: "Peace" },
          { label: "Comfort in Trouble", query: "Comfort" },
          { label: "Strength in Weakness", query: "Strength" },
          { label: "Freedom from Fear", query: "Fear" },
          { label: "Hope", query: "Hope" }
        ],
        buildPayload: (q, v) => ({ topic: q, version: v })
      },

      // 3. Study & Teaching
      exegesis: {
        endpoint: "/tools/passage_exegesis_pack",
        icon: "🔬",
        btnLabel: "Explore Verse-by-Verse",
        placeholder: "Passage for study: e.g. Romans 8:28-30, John 1:1-5, Ephesians 2:1-10",
        defaultQuery: "Romans 8:28-30",
        samples: [
          { label: "Romans 8:28-30 (God's Purpose)", query: "Romans 8:28-30" },
          { label: "John 1:1-5 (The Word Made Flesh)", query: "John 1:1-5" },
          { label: "Ephesians 2:1-10 (Saved by Grace)", query: "Ephesians 2:1-10" },
          { label: "Genesis 1:1-5 (The Creation)", query: "Genesis 1:1-5" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      sermon: {
        endpoint: "/tools/sermon_study_pack",
        icon: "🎙️",
        btnLabel: "Generate Teaching & Sermon Outline",
        placeholder: "Preaching text: e.g. Romans 8:28-39, Ephesians 2:8-10, Psalm 23",
        defaultQuery: "Ephesians 2:8-10",
        samples: [
          { label: "Ephesians 2:8-10 (By Grace Through Faith)", query: "Ephesians 2:8-10" },
          { label: "Romans 8:28-30 (Called According to Purpose)", query: "Romans 8:28-30" },
          { label: "Matthew 28:18-20 (The Great Commission)", query: "Matthew 28:18-20" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      lesson: {
        endpoint: "/tools/lesson_creator_study_pack",
        icon: "🏫",
        btnLabel: "Create Small Group Lesson",
        placeholder: "Lesson Scripture: e.g. Luke 15:11-32, Acts 2:42-47, Romans 12:1-8",
        defaultQuery: "Luke 15:11-32",
        samples: [
          { label: "Luke 15:11-32 (The Prodigal Son)", query: "Luke 15:11-32" },
          { label: "Acts 2:42-47 (The Early Church)", query: "Acts 2:42-47" },
          { label: "Romans 12:1-8 (Living Sacrifices)", query: "Romans 12:1-8" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      commentary_pack: {
        endpoint: "/tools/commentary_study_pack",
        icon: "💬",
        btnLabel: "Compare Historic Commentaries",
        placeholder: "Passage: e.g. Romans 8:28, John 3:16, Psalm 23:1",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28", query: "Romans 8:28" },
          { label: "John 3:16", query: "John 3:16" },
          { label: "Genesis 1:1", query: "Genesis 1:1" }
        ],
        buildPayload: (q) => ({ reference: q, commentators: ["TNotes", "Henry", "Calvin", "Spur", "Barnes"] })
      },
      commentary_single: {
        endpoint: "/tools/commentary_lookup",
        icon: "✍️",
        btnLabel: "Read Commentary Notes",
        placeholder: "Passage: e.g. Romans 8:28, Psalm 23:1, John 1:1",
        defaultQuery: "Romans 8:28",
        hasCommentarySelect: true,
        samples: [
          { label: "Romans 8:28", query: "Romans 8:28" },
          { label: "Psalm 23:1", query: "Psalm 23:1" },
          { label: "John 1:1", query: "John 1:1" }
        ],
        buildPayload: (q, v, c) => ({ reference: q, version: c || "Henry" })
      },
      covenant: {
        endpoint: "/tools/covenant_theology_pack",
        icon: "👑",
        btnLabel: "Trace Biblical Themes & Covenants",
        placeholder: "Passage: e.g. Genesis 15:1-6, Jeremiah 31:31-34, Hebrews 8:6-13",
        defaultQuery: "Genesis 15:1-6",
        samples: [
          { label: "Genesis 15:1-6 (Abrahamic Promise)", query: "Genesis 15:1-6" },
          { label: "Jeremiah 31:31-34 (New Covenant Promised)", query: "Jeremiah 31:31-34" },
          { label: "Hebrews 8:6-13 (The Better Covenant)", query: "Hebrews 8:6-13" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      topic_pack: {
        endpoint: "/tools/topic_study_pack",
        icon: "📑",
        btnLabel: "Study Bible Topic",
        placeholder: "Topic: e.g. Justification, Grace, Atonement, Forgiveness, Prayer",
        defaultQuery: "Grace",
        samples: [
          { label: "Grace", query: "Grace" },
          { label: "Justification", query: "Justification" },
          { label: "Forgiveness", query: "Forgiveness" },
          { label: "Faith", query: "Faith" }
        ],
        buildPayload: (q, v) => ({ topic: q, version: v })
      },
      topic: {
        endpoint: "/tools/topic_study",
        icon: "🏷️",
        btnLabel: "Look Up in Nave's Topics",
        placeholder: "Topic: e.g. Faith, Joy, Humility, Peace, Resurrection",
        defaultQuery: "Faith",
        samples: [
          { label: "Faith", query: "Faith" },
          { label: "Humility", query: "Humility" },
          { label: "Joy", query: "Joy" }
        ],
        buildPayload: (q) => ({ query: q })
      },
      book_analysis: {
        endpoint: "/tools/book_analysis",
        icon: "📚",
        btnLabel: "Read Book Overview",
        placeholder: "Book name: e.g. Romans, Genesis, Hebrews, Ephesians, Psalms",
        defaultQuery: "Romans",
        samples: [
          { label: "Romans", query: "Romans" },
          { label: "Ephesians", query: "Ephesians" },
          { label: "Genesis", query: "Genesis" },
          { label: "Hebrews", query: "Hebrews" }
        ],
        buildPayload: (q) => ({ book: q })
      },
      chapter_summary: {
        endpoint: "/tools/chapter_summary",
        icon: "📋",
        btnLabel: "Get Chapter Summary",
        placeholder: "Book and Chapter: e.g. Genesis 1, Romans 8, John 3",
        defaultQuery: "Romans 8",
        samples: [
          { label: "Romans 8", query: "Romans 8" },
          { label: "John 3", query: "John 3" },
          { label: "Genesis 1", query: "Genesis 1" }
        ],
        buildPayload: (q) => {
          const parts = q.trim().split(" ");
          const ch = parseInt(parts.pop()) || 1;
          const bk = parts.join(" ") || "Romans";
          return { book: bk, chapter: ch };
        }
      },

      // 4. Original Words & History
      word_pack: {
        endpoint: "/tools/word_study_pack",
        icon: "🔤",
        btnLabel: "Explore Word Meaning",
        placeholder: "Strong's Number: e.g. G26 (Agape), G4102 (Pistis), H7965 (Shalom)",
        defaultQuery: "G26",
        samples: [
          { label: "G26 (Agape • Love)", query: "G26" },
          { label: "G4102 (Pistis • Faith)", query: "G4102" },
          { label: "H7965 (Shalom • Peace)", query: "H7965" },
          { label: "G5485 (Charis • Grace)", query: "G5485" }
        ],
        buildPayload: (q) => ({ strongs_number: q, lexicon: "strongs" })
      },
      lexicon: {
        endpoint: "/tools/lexicon_lookup",
        icon: "🏛️",
        btnLabel: "Look Up Lexicon",
        placeholder: "Strong's Number: e.g. G2889 (Kosmos), H7225 (Reshit)",
        defaultQuery: "G2889",
        samples: [
          { label: "G2889 (Kosmos • World)", query: "G2889" },
          { label: "H7225 (Reshit • Beginning)", query: "H7225" },
          { label: "G3056 (Logos • Word)", query: "G3056" }
        ],
        buildPayload: (q) => ({ strongs_number: q, lexicon: "strongs" })
      },
      morphology: {
        endpoint: "/tools/morphology_lookup",
        icon: "🧩",
        btnLabel: "Inspect Grammar & Syntax",
        placeholder: "Single verse: e.g. John 1:1, Genesis 1:1, Romans 8:28",
        defaultQuery: "John 1:1",
        samples: [
          { label: "John 1:1", query: "John 1:1" },
          { label: "Genesis 1:1", query: "Genesis 1:1" },
          { label: "Romans 8:28", query: "Romans 8:28" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      interlinear_pack: {
        endpoint: "/tools/interlinear_study_pack",
        icon: "📜",
        btnLabel: "Generate Interlinear Study",
        placeholder: "Passage: e.g. Philippians 4:4-8, John 1:1-5, Psalm 23:1-3",
        defaultQuery: "Philippians 4:4-8",
        samples: [
          { label: "Philippians 4:4-8", query: "Philippians 4:4-8" },
          { label: "John 1:1-5", query: "John 1:1-5" },
          { label: "Psalm 23:1-3", query: "Psalm 23:1-3" }
        ],
        buildPayload: (q) => ({ reference: q, display_mode: "inline", glossary_filter: "rare_and_notable" })
      },
      interlinear_lookup: {
        endpoint: "/tools/interlinear_lookup",
        icon: "🔍",
        btnLabel: "View Inline Interlinear",
        placeholder: "Passage: e.g. John 1:1-3, Romans 8:28",
        defaultQuery: "John 1:1-3",
        samples: [
          { label: "John 1:1-3", query: "John 1:1-3" },
          { label: "Romans 8:28", query: "Romans 8:28" }
        ],
        buildPayload: (q) => ({ reference: q, display_mode: "inline" })
      },
      septuagint_pack: {
        endpoint: "/tools/septuagint_study_pack",
        icon: "🏛️",
        btnLabel: "Compare Septuagint & Hebrew",
        placeholder: "Old Testament passage: e.g. Genesis 1:1-5, Psalm 22:16, Isaiah 7:14",
        defaultQuery: "Genesis 1:1-5",
        samples: [
          { label: "Genesis 1:1-5", query: "Genesis 1:1-5" },
          { label: "Psalm 22:16-18", query: "Psalm 22:16-18" },
          { label: "Isaiah 7:14", query: "Isaiah 7:14" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      septuagint_lookup: {
        endpoint: "/tools/septuagint_lookup",
        icon: "📜",
        btnLabel: "Read Greek Septuagint Text",
        placeholder: "Old Testament passage: e.g. Genesis 1:1-3, Psalm 23:1-3",
        defaultQuery: "Genesis 1:1-3",
        samples: [
          { label: "Genesis 1:1-3", query: "Genesis 1:1-3" },
          { label: "Psalm 23:1-3", query: "Psalm 23:1-3" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      ot_in_nt_pack: {
        endpoint: "/tools/ot_in_nt_study_pack",
        icon: "🔗",
        btnLabel: "Trace OT Quotes in New Testament",
        placeholder: "Passage with quotes: e.g. Hebrews 8:8-12, Matthew 1:22-23, Romans 4:1-8",
        defaultQuery: "Hebrews 8:8-12",
        samples: [
          { label: "Hebrews 8:8-12 (Jeremiah 31)", query: "Hebrews 8:8-12" },
          { label: "Matthew 1:22-23 (Isaiah 7:14)", query: "Matthew 1:22-23" },
          { label: "Romans 4:1-8 (Genesis 15:6)", query: "Romans 4:1-8" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v })
      },
      ot_quotations: {
        endpoint: "/tools/ot_quotations_lookup",
        icon: "🔎",
        btnLabel: "Look Up Quotation Links",
        placeholder: "Passage: e.g. Hebrews 8:8, Matthew 1:23, Jeremiah 31:31",
        defaultQuery: "Hebrews 8:8",
        samples: [
          { label: "Hebrews 8:8", query: "Hebrews 8:8" },
          { label: "Matthew 1:23", query: "Matthew 1:23" }
        ],
        buildPayload: (q) => ({ reference: q })
      },
      entities: {
        endpoint: "/tools/entity_disambiguation",
        icon: "👤",
        btnLabel: "Disambiguate Person or Place",
        placeholder: "Biblical name: e.g. Mary, James, John, Zechariah, Herod, Antioch",
        defaultQuery: "Mary",
        samples: [
          { label: "Mary (Mother, Magdalene, Bethany, etc.)", query: "Mary" },
          { label: "James (Son of Zebedee, Lord's Brother, Alphaeus)", query: "James" },
          { label: "Herod (Great, Antipas, Agrippa)", query: "Herod" }
        ],
        buildPayload: (q) => ({ name: q })
      },
      units: {
        endpoint: "/tools/convert_ancient_units",
        icon: "⚖️",
        btnLabel: "Convert Ancient Coins & Measures",
        placeholder: "Ancient unit: e.g. Talent, Shekel, Cubit, Denarius, Ephah, Bath",
        defaultQuery: "Talent",
        samples: [
          { label: "1 Talent (Gold/Silver & Labor Value)", query: "Talent" },
          { label: "1 Denarius (Daily Wage)", query: "Denarius" },
          { label: "1 Cubit (Arm Length)", query: "Cubit" },
          { label: "1 Shekel", query: "Shekel" }
        ],
        buildPayload: (q) => ({ unit: q, amount: 1 })
      },
      character: {
        endpoint: "/tools/character_lookup",
        icon: "👤",
        btnLabel: "View Character Profile & Tree",
        placeholder: "Person name: e.g. David, Abraham, Moses, Paul, Ruth, Peter",
        defaultQuery: "David",
        samples: [
          { label: "David", query: "David" },
          { label: "Abraham", query: "Abraham" },
          { label: "Ruth", query: "Ruth" },
          { label: "Paul", query: "Paul" }
        ],
        buildPayload: (q) => ({ name: q })
      },
      location: {
        endpoint: "/tools/location_lookup",
        icon: "📍",
        btnLabel: "Look Up Biblical Site & Map",
        placeholder: "Place name: e.g. Jerusalem, Bethlehem, Nazareth, Sinai, Jericho",
        defaultQuery: "Jerusalem",
        samples: [
          { label: "Jerusalem", query: "Jerusalem" },
          { label: "Bethlehem", query: "Bethlehem" },
          { label: "Sinai", query: "Sinai" }
        ],
        buildPayload: (q) => ({ location: q })
      },
      names: {
        endpoint: "/tools/bible_names",
        icon: "🏷️",
        btnLabel: "Discover Name Meaning",
        placeholder: "Name: e.g. Abigail, Joshua, Elijah, Emmanuel, Barnabas",
        defaultQuery: "Abigail",
        samples: [
          { label: "Abigail (Father's Joy)", query: "Abigail" },
          { label: "Joshua (The Lord Saves)", query: "Joshua" },
          { label: "Barnabas (Son of Encouragement)", query: "Barnabas" }
        ],
        buildPayload: (q) => ({ query: q })
      },
      chronology: {
        endpoint: "/tools/chronology",
        icon: "⏳",
        btnLabel: "Search Timeline & Era",
        placeholder: "Event or Figure: e.g. David, Exodus, Paul, Temple, Exile",
        defaultQuery: "David",
        samples: [
          { label: "David's Reign", query: "David" },
          { label: "Exodus", query: "Exodus" },
          { label: "Paul's Journeys", query: "Paul" }
        ],
        buildPayload: (q) => ({ query: q })
      },
      dictionary: {
        endpoint: "/tools/theological_dictionary",
        icon: "📖",
        btnLabel: "Look Up in Bible Dictionary",
        placeholder: "Term: e.g. Justification, Covenant, Atonement, Grace, Sanctification",
        defaultQuery: "Justification",
        hasDictSelect: true,
        samples: [
          { label: "Justification", query: "Justification" },
          { label: "Covenant", query: "Covenant" },
          { label: "Grace", query: "Grace" },
          { label: "Atonement", query: "Atonement" }
        ],
        buildPayload: (q, v, c, d) => ({ term: q, source: d || "tyndale" })
      },
      resources: {
        endpoint: "/tools/get_available_resources",
        icon: "📋",
        btnLabel: "List Available Resources",
        placeholder: "Category: 'all', 'bibles', 'commentaries', 'lexicons', or leave empty",
        defaultQuery: "all",
        samples: [
          { label: "All Active Resources", query: "all" },
          { label: "Commentaries", query: "commentaries" },
          { label: "Bible Versions", query: "bibles" }
        ],
        buildPayload: (q) => ({ category: q || "all" })
      }
    };

    let activeMode = "scripture";
    let activeCat = "read";
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
      const cfg = TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture;

      queryInput.placeholder = cfg.placeholder;
      btnText.textContent = cfg.btnLabel;
      btnIcon.textContent = cfg.icon;

      commentarySelect.style.display = cfg.hasCommentarySelect ? "inline-block" : "none";
      dictSelect.style.display = cfg.hasDictSelect ? "inline-block" : "none";

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
      if (!q && activeMode !== "daily_reading" && activeMode !== "resources") return;

      const v = prefVersionSelect.value || "BSB";
      const c = commentarySelect.value;
      const d = dictSelect.value;
      const config = TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture;
      const payload = config.buildPayload(q, v, c, d);

      btnStudy.disabled = true;
      btnIcon.innerHTML = '<div class="spinner"></div>';
      btnText.textContent = "Loading...";
      
      resultsCard.style.display = "block";
      resultsBody.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-muted);"><div class="spinner" style="margin:0 auto 1rem auto; width:24px; height:24px; border-width:3px;"></div>Loading Scripture & Study Notes...</div>';
      resultsHeading.textContent = config.btnLabel + (q ? ": " + q : "");
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

        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (err) {
        resultsBody.innerHTML = '<div style="color:#ef4444; font-weight:bold;">Error fetching study data: ' + err.message + '</div>';
      } finally {
        btnStudy.disabled = false;
        btnIcon.textContent = config.icon;
        btnText.textContent = config.btnLabel;
      }
    }

    // Markdown Formatter
    function formatMarkdown(md) {
      if (!md) return "";
      let html = md;

      // Convert any HTML formatting to Markdown before escaping
      html = html.replace(/<b\b[^>]*>(.*?)<\/b>/gi, "**$1**");
      html = html.replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, "**$1**");
      html = html.replace(/<i\b[^>]*>(.*?)<\/i>/gi, "*$1*");
      html = html.replace(/<em\b[^>]*>(.*?)<\/em>/gi, "*$1*");
      html = html.replace(/<br\s*\/?>/gi, "\n");
      html = html.replace(/<p\b[^>]*>(.*?)<\/p>/gi, "$1\n\n");
      html = html.replace(/<[^>]+>/g, ""); // Strip any unhandled tags

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
      html = html.replace(new RegExp(bt + "([^" + bt + "]+)" + bt, "gim"), '<code style="background:rgba(255,255,255,0.08); padding:0.1rem 0.35rem; border-radius:4px; font-family:monospace; color:var(--accent-gold);">$1</code>');

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
