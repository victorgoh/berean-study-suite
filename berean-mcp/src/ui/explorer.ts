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
      --bg: #f7f7f5;
      --surface: #ffffff;
      --surface-border: #deded8;
      --surface-hover: #f1f1ed;
      --accent-gold: #30302d;
      --accent-gold-hover: #111110;
      --accent-gold-bg: #eeeeea;
      --accent-gold-border: #bdbdb6;
      --text-main: #242421;
      --text-muted: #666660;
      --text-dim: #85857e;
      --input-bg: #ffffff;
      --card-radius: 10px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Header */
    header {
      border-bottom: 1px solid var(--surface-border);
      background: rgba(255,255,255,.94);
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
      display: flex;
      align-items: center;
      color: var(--text-main);
    }

    .brand-title h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: var(--text-main);
    }

    .brand-title p {
      font-size: 0.74rem;
      color: var(--text-muted);
      letter-spacing: 0.01em;
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
      text-align: left;
      max-width: none;
      margin: 0;
      width: 100%;
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
      font: inherit;
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

    .query-summary {
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: var(--card-radius);
      color: var(--text-muted);
      display: none;
      font-size: 0.84rem;
      gap: 1rem;
      justify-content: space-between;
      padding: 0.75rem 1rem;
    }

    .query-summary.visible { display: flex; }
    .query-summary strong { color: var(--text-main); font-weight: 700; }

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
      flex-wrap: wrap;
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

    .section-action { display: none; }
    .section-action.visible { display: inline-flex; }

    .results-body {
      padding: 2rem;
      font-family: 'Lora', Georgia, serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: #e2e8f0;
    }

    .results-body > p,
    .results-body > blockquote,
    .study-pack-section-content {
      max-width: 76ch;
    }

    .result-contents {
      background: var(--surface-hover);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0 0 1.5rem;
      max-width: 76ch;
      padding: 0.7rem 0.9rem;
    }

    .result-contents summary {
      color: var(--text-main);
      cursor: pointer;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .result-contents nav {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.7rem;
    }

    .result-contents a {
      color: var(--text-muted);
      font-size: 0.8rem;
      line-height: 1.4;
      text-decoration: none;
    }

    .result-contents a:hover { color: var(--text-main); text-decoration: underline; }

    .result-message {
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0 auto;
      max-width: 680px;
      padding: 1.25rem;
      text-align: center;
    }

    .result-message h2 { margin: 0 0 0.45rem; }
    .result-message p { color: var(--text-muted); margin-bottom: 0.9rem; }

    .results-bottom-actions {
      display: none;
      justify-content: center;
      padding: 0 2rem 1.5rem;
    }

    .results-bottom-actions.visible { display: flex; }

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

    .results-body h4,
    .results-body h5,
    .results-body h6 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-main);
      margin-top: 1.1rem;
      margin-bottom: 0.4rem;
      line-height: 1.45;
    }

    .results-body h4 { font-size: 0.94rem; font-weight: 700; }
    .results-body h5 { font-size: 0.9rem; font-weight: 650; }
    .results-body h6 { font-size: 0.86rem; font-weight: 600; color: var(--text-muted); }

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

    .markdown-table-wrap {
      max-width: 100%;
      overflow-x: auto;
    }

    /* Study packs can combine several independent resources. Keep each one
       navigable without discarding the complete source material. */
    .study-pack-toggle {
      background: transparent;
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font: 600 0.76rem/1 'Plus Jakarta Sans', sans-serif;
    }

    .study-pack-toggle:hover { background: var(--surface-hover); color: var(--text-main); }

    .study-pack-section {
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      margin: 0.8rem 0;
      overflow: hidden;
      background: var(--surface);
    }

    .study-pack-section-header {
      align-items: center;
      display: flex;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      gap: 0.7rem;
      justify-content: space-between;
      padding: 0.8rem 1rem;
    }

    .study-pack-section.is-expanded .study-pack-section-header {
      background: var(--surface-hover);
      border-bottom: 1px solid var(--surface-border);
    }
    .study-pack-toggle { min-width: 1.8rem; padding: 0.35rem; }
    .study-pack-section.is-collapsed .study-pack-section-content { display: none; }
    .study-pack-section-content { padding: 0.25rem 1rem 0.2rem; }
    .study-pack-section-content > :first-child { margin-top: 0.9rem; }
    .study-pack-section-content h1,
    .study-pack-section-content h2 { display: none; }

    .cat-tab:focus-visible,
    .tool-option:focus-visible,
    .tool-more-toggle:focus-visible,
    .sample-tag:focus-visible,
    .search-input-wrapper input:focus-visible,
    .sub-select:focus-visible,
    .pref-version-select:focus-visible,
    .btn-study:focus-visible,
    .action-btn:focus-visible,
    .study-pack-toggle:focus-visible,
    .footer-links a:focus-visible,
    .result-contents a:focus-visible {
      outline: 3px solid #555550;
      outline-offset: 2px;
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

    /* Simple, reader-focused footer */
    .site-footer {
      border-top: 1px solid var(--surface-border);
      background: rgba(10, 14, 22, 0.96);
      backdrop-filter: blur(16px);
      padding: 2.25rem 1.5rem 1.5rem;
      margin-top: auto;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .footer-container {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .footer-title {
      font-family: 'Lora', Georgia, serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem 1.1rem;
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
      font-size: 0.86rem;
      color: var(--text-dim);
      line-height: 1.6;
    }

    .footer-guidance {
      border-left: 3px solid var(--accent-gold-border);
      padding-left: 0.8rem;
    }

    .footer-bottom {
      border-top: 1px solid var(--surface-border);
      padding-top: 1rem;
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    /* Results-first Explorer presentation. */
    .brand-logo { color: var(--text-main); }
    .brand-title h1, .hero-title h2, .results-body h1, .results-body h3 { color: var(--text-main); }
    .brand-title p, .hero-title p { color: var(--text-muted); }
    main { max-width: 1040px; padding-top: 2.5rem; }
    .hero-card { background: var(--surface); border-color: var(--surface-border); box-shadow: 0 4px 18px rgba(0,0,0,.04); backdrop-filter: none; padding: 1.5rem; gap: 1rem; }
    .hero-title { text-align: left; max-width: none; margin: 0; width: 100%; }
    .hero-title h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; }
    .category-tabs { position: relative; justify-content: flex-start; border-bottom: 0; padding-bottom: 0; gap: .35rem; }
    .cat-tab { color: var(--text-muted); border-color: transparent; border-radius: 6px; padding: .45rem .7rem; font-weight: 600; }
    .cat-tab:hover, .cat-tab.active { color: var(--text-main); background: var(--surface-hover); border-color: var(--surface-border); }
    .mode-pills { display: none !important; }
    .tool-popover { display: none; position: absolute; z-index: 20; top: calc(100% + .35rem); left: 0; min-width: 250px; max-width: min(500px, 94vw); padding: .35rem; background: #fff; border: 1px solid var(--surface-border); border-radius: 8px; box-shadow: 0 10px 24px rgba(0,0,0,.10); opacity: 0; transform: translateY(-4px); transition: opacity .16s ease, transform .16s ease; }
    .tool-popover.open { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); opacity: 1; transform: translateY(0); }
    .tool-option, .tool-more-toggle { border: 0; background: transparent; color: var(--text-muted); text-align: left; padding: .55rem .65rem; border-radius: 5px; font: 500 .78rem/1.25 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
    .tool-option:hover, .tool-option.active, .tool-more-toggle:hover { background: var(--surface-hover); color: var(--text-main); }
    .tool-more-toggle { border-top: 1px solid var(--surface-border); border-radius: 0; font-weight: 700; grid-column: 1 / -1; margin-top: .2rem; padding-top: .7rem; }
    .tool-help { color: var(--text-muted); font-size: .79rem; line-height: 1.5; min-height: 1.2em; }
    .search-row { margin-top: .3rem; }
    .search-input-wrapper input, .sub-select { color: var(--text-main); border-color: var(--surface-border); background: var(--input-bg); border-radius: 7px; }
    .search-input-wrapper input:focus { border-color: #777770; box-shadow: 0 0 0 3px rgba(48,48,45,.10); }
    .sub-select option { background: #fff; color: var(--text-main); }
    .btn-study { background: #30302d; color: #fff; border-radius: 7px; box-shadow: none; }
    .btn-study:hover { background: #111110; box-shadow: none; transform: none; }
    .card-footer { border-color: var(--surface-border); }
    .pref-version-wrapper, .sample-tag { background: transparent; border-color: var(--surface-border); color: var(--text-muted); }
    .pref-version-select { color: var(--text-main); }
    .pref-version-select option { background: #fff; color: var(--text-main); }
    .sample-tag:hover { background: var(--surface-hover); border-color: var(--accent-gold-border); color: var(--text-main); }
    .results-card { background: #fff; border-color: var(--surface-border); box-shadow: 0 4px 18px rgba(0,0,0,.04); backdrop-filter: none; }
    .results-header { background: #fafaf8; border-color: var(--surface-border); }
    .results-title, .results-body { color: var(--text-main); }
    .action-btn { background: transparent; border-color: var(--surface-border); color: var(--text-muted); }
    .action-btn:hover { color: var(--text-main); background: var(--surface-hover); border-color: var(--accent-gold-border); }
    .results-body h2, .results-body th, .verse-badge { color: var(--text-main); }
    .results-body blockquote, .verse-badge { background: var(--surface-hover); border-color: var(--accent-gold-border); }
    .results-body th, .results-body td { border-color: var(--surface-border); }
    .site-footer { background: #f1f1ed; border-color: var(--surface-border); }
    .footer-title { color: var(--text-main); }
    .footer-links a { color: var(--text-muted); }
    @media (max-width: 640px) {
      .category-tabs { position: static; }
      .tool-popover {
        border-radius: 12px 12px 0 0;
        bottom: 0;
        box-shadow: 0 -12px 36px rgba(0,0,0,.18);
        left: 0;
        max-height: 72vh;
        max-width: none;
        overflow-y: auto;
        padding: .75rem;
        position: fixed;
        right: 0;
        top: auto;
        transform: translateY(8px);
        width: 100%;
        z-index: 100;
      }
      .tool-popover.open { grid-template-columns: 1fr; transform: translateY(0); }
      .hero-card { padding: 1rem; }
      .search-row { align-items: stretch; }
      .search-input-wrapper { min-width: 100%; }
      .sub-select, .btn-study { width: 100%; }
      .btn-study { justify-content: center; }
      .query-summary { align-items: flex-start; flex-direction: column; }
      .results-header { align-items: flex-start; }
      .results-body { padding: 1.25rem; }
    }

    @media print {
      @page { margin: 16mm; }

      body {
        display: block;
        background: #fff;
        color: #000;
      }

      body > header,
      body > main > .hero-card,
      body > main > .query-summary,
      body > footer,
      .results-actions,
      .results-bottom-actions,
      .result-contents,
      .study-pack-toggle {
        display: none !important;
      }

      main {
        display: block;
        max-width: none;
        margin: 0;
        padding: 0;
      }

      .results-card {
        display: block !important;
        margin: 0;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        background: #fff;
      }

      .results-header {
        padding: 0 0 0.75rem;
        border-bottom: 1px solid #bbb;
        color: #000;
      }

      .results-body {
        padding: 1rem 0 0;
        color: #000;
      }

      .results-body h1,
      .results-body h2,
      .results-body h3,
      .results-body h4,
      .results-body h5,
      .results-body h6,
      .results-title,
      .verse-badge {
        color: #000;
      }

      .study-pack-section,
      .study-pack-section.is-expanded,
      .study-pack-section.is-collapsed {
        border-color: #bbb;
        background: #fff;
        break-inside: auto;
      }

      .study-pack-section-header,
      .study-pack-section.is-expanded .study-pack-section-header {
        background: #f5f5f5;
        border-bottom: 1px solid #bbb;
        color: #000;
      }

      .study-pack-section.is-collapsed .study-pack-section-content {
        display: block !important;
      }

      .study-pack-section-content,
      .results-body blockquote,
      .verse-badge {
        background: #fff;
        border-color: #bbb;
      }

      .markdown-table-wrap { overflow: visible; }
      .results-body th, .results-body td { border-color: #999; }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="header-container">
      <a href="/study" class="brand">
        <div class="brand-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H11v17H6.5A2.5 2.5 0 0 0 4 21.5z"/>
            <path d="M20 4.5A2.5 2.5 0 0 0 17.5 2H13v17h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>
          </svg>
        </div>
        <div class="brand-title">
          <h1>Berean Bible Study Explorer</h1>
          <p>A Companion for Spiritual Growth, Daily Reflection & Learning God's Word</p>
        </div>
      </a>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    
    <!-- Hero Search & Action Card -->
    <div class="hero-card" id="search-panel">
      <div class="hero-title">
        <h2>Explore a passage</h2>
        <p>Choose a starting point, then open more tools only when you need them.</p>
      </div>

      <!-- Categories reveal their tools on hover, focus, or click. -->
      <div class="category-tabs" id="category-tabs">
        <button class="cat-tab active" data-cat="passage" aria-expanded="false" aria-haspopup="menu" aria-controls="tool-popover">Passage</button>
        <button class="cat-tab" data-cat="reflection" aria-expanded="false" aria-haspopup="menu" aria-controls="tool-popover">Reflection</button>
        <button class="cat-tab" data-cat="study" aria-expanded="false" aria-haspopup="menu" aria-controls="tool-popover">Commentary</button>
        <button class="cat-tab" data-cat="words" aria-expanded="false" aria-haspopup="menu" aria-controls="tool-popover">Original Words</button>
        <button class="cat-tab" data-cat="background" aria-expanded="false" aria-haspopup="menu" aria-controls="tool-popover">Background</button>
        <div class="tool-popover" id="tool-popover" role="menu" aria-label="Study tools"></div>
      </div>

      <p class="tool-help" id="tool-help">Enter a verse or passage to read it in your preferred translation.</p>

      <!-- Study Mode Pills -->
      <div class="mode-pills" id="mode-pills">
        <!-- Passage -->
        <div class="mode-pill active" data-cat="passage" data-mode="scripture">Read Scripture</div>
        <div class="mode-pill" data-cat="passage" data-mode="search">Search the Bible</div>
        <div class="mode-pill" data-cat="passage" data-mode="xref">Cross References</div>
        <div class="mode-pill" data-cat="passage" data-mode="parallels">Gospel Parallels</div>
        <div class="mode-pill" data-cat="passage" data-mode="daily_reading" data-tier="more">Daily Reading Plan</div>

        <!-- Reflection -->
        <div class="mode-pill" data-cat="reflection" data-mode="devotional">Daily Devotional</div>
        <div class="mode-pill" data-cat="reflection" data-mode="prayer">Scripture Prayer Guide</div>
        <div class="mode-pill" data-cat="reflection" data-mode="promises">Promises for Life</div>

        <!-- Commentary and study -->
        <div class="mode-pill" data-cat="study" data-mode="exegesis">Verse-by-Verse Study</div>
        <div class="mode-pill" data-cat="study" data-mode="commentary_single">Single Commentary</div>
        <div class="mode-pill" data-cat="study" data-mode="commentary_pack">Compare Commentaries</div>
        <div class="mode-pill" data-cat="study" data-mode="book_analysis">Book Guide</div>
        <div class="mode-pill" data-cat="study" data-mode="chapter_summary">Chapter Summary</div>
        <div class="mode-pill" data-cat="study" data-mode="lesson" data-tier="more">Small Group & Sunday School</div>
        <div class="mode-pill" data-cat="study" data-mode="sermon" data-tier="more">Teaching & Sermon Helper</div>
        <div class="mode-pill" data-cat="study" data-mode="illustrations" data-tier="more">Sermon Illustrations</div>
        <div class="mode-pill" data-cat="study" data-mode="covenant" data-tier="more">Themes Across Scripture</div>
        <div class="mode-pill" data-cat="study" data-mode="topic_pack" data-tier="more">Topical Study Pack</div>
        <div class="mode-pill" data-cat="study" data-mode="topic" data-tier="more">Bible Topics</div>

        <!-- Original words -->
        <div class="mode-pill" data-cat="words" data-mode="word_pack">Original Word Meaning</div>
        <div class="mode-pill" data-cat="words" data-mode="lexicon">Lexicon Lookup</div>
        <div class="mode-pill" data-cat="words" data-mode="morphology">Grammar & Syntax</div>
        <div class="mode-pill" data-cat="words" data-mode="interlinear_pack">Word-by-Word Interlinear</div>
        <div class="mode-pill" data-cat="words" data-mode="interlinear_lookup" data-tier="more">Inline Interlinear</div>
        <div class="mode-pill" data-cat="words" data-mode="septuagint_pack" data-tier="more">Greek Septuagint & Hebrew MT</div>
        <div class="mode-pill" data-cat="words" data-mode="septuagint_lookup" data-tier="more">Septuagint Text</div>

        <!-- Historical and cultural background -->
        <div class="mode-pill" data-cat="background" data-mode="dictionary">Bible Dictionary</div>
        <div class="mode-pill" data-cat="background" data-mode="entities">People & Places</div>
        <div class="mode-pill" data-cat="background" data-mode="character">Bible Characters</div>
        <div class="mode-pill" data-cat="background" data-mode="location">Biblical Places</div>
        <div class="mode-pill" data-cat="background" data-mode="chronology">Biblical Timeline</div>
        <div class="mode-pill" data-cat="background" data-mode="ot_in_nt_pack" data-tier="more">Old Testament in the New</div>
        <div class="mode-pill" data-cat="background" data-mode="ot_quotations" data-tier="more">OT Quotes & Allusions</div>
        <div class="mode-pill" data-cat="background" data-mode="units" data-tier="more">Coins, Weights & Measures</div>
        <div class="mode-pill" data-cat="background" data-mode="names" data-tier="more">Name Meanings</div>
        <div class="mode-pill" data-cat="background" data-mode="resources" data-tier="more">Resource Catalog</div>
      </div>

      <!-- Clean Unified Search Input Row -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <label class="sr-only" id="query-label" for="query-input">Passage, word, topic, person, or place</label>
          <input type="text" id="query-input" aria-labelledby="query-label" placeholder="Passage: e.g. John 3:16, Romans 8:28, Psalm 23" autocomplete="off" />
        </div>

        <!-- Commentary Selector -->
        <label class="sr-only" for="commentary-select">Preferred commentary</label>
        <select id="commentary-select" class="sub-select" aria-label="Preferred commentary" style="display:none;">
          <option value="TNotes" selected>Tyndale Open Study Notes (Modern / Contextual)</option>
          <option value="Henry">Matthew Henry (Devotional)</option>
          <option value="Spur">Charles Spurgeon (Treasury of David)</option>
          <option value="MacL">Alexander Maclaren (Expositions)</option>
          <option value="Barnes">Albert Barnes (Notes)</option>
          <option value="Calvin">John Calvin (Reformed)</option>
          <option value="JFB">Jamieson-Fausset-Brown (Critical)</option>
          <option value="KD">Keil & Delitzsch (OT Exegesis)</option>
          <option value="Lange">John Peter Lange (Comprehensive)</option>
          <option value="Pulpit">The Pulpit Commentary</option>
          <option value="ECF">Early Church Fathers Commentary</option>
          <option value="Catena">St Thomas Aquinas' Catena Aurea</option>
          <option value="BI">The Biblical Illustrator</option>
          <option value="Clarke">Adam Clarke</option>
          <option value="Gill">John Gill</option>
          <option value="Wesley">John Wesley</option>
        </select>

        <!-- Dictionary Selector -->
        <label class="sr-only" for="dict-select">Dictionary collection</label>
        <select id="dict-select" class="sub-select" aria-label="Dictionary collection" style="display:none;">
          <optgroup label="General Bible Dictionaries">
            <option value="tyndale" selected>Tyndale Open Bible Dictionary</option>
            <option value="easton">Easton's Bible Dictionary</option>
            <option value="smith">Smith's Bible Dictionary</option>
            <option value="fausset">Fausset's Bible Dictionary</option>
            <option value="morrish">Morrish Bible Dictionary</option>
          </optgroup>
          <optgroup label="Word Studies">
            <option value="vine">Vine's New Testament Words</option>
          </optgroup>
          <optgroup label="Encyclopedias">
            <option value="isbe">ISBE Encyclopedia</option>
          </optgroup>
          <optgroup label="Combined Search">
            <option value="collection">Classic Bible Dictionary Collection</option>
          </optgroup>
        </select>

        <button class="btn-study" id="btn-study">
          <span id="btn-text">Read Scripture</span>
        </button>
      </div>

      <!-- Panel Footer: Sample Queries on Left, Preferred Translation on Right -->
      <div class="card-footer">
        <div class="inspiration-bar" id="inspiration-bar">
          <span id="inspiration-label">Try:</span>
          <div id="sample-tags-container" style="display:inline-flex; gap:0.4rem; flex-wrap:wrap;"></div>
        </div>

        <div class="pref-version-wrapper" title="Default Bible translation used across queries">
          <label for="pref-version-select">Translation:</label>
          <select id="pref-version-select" class="pref-version-select" aria-label="Preferred Bible translation">
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

    <div class="query-summary" id="query-summary" aria-live="polite">
      <span id="query-summary-text"></span>
      <button type="button" class="action-btn" id="btn-change-search">Change search</button>
    </div>

    <!-- Results Display Card -->
    <div class="results-card" id="results-card" role="region" aria-labelledby="results-heading" aria-busy="false">
      <div class="results-header">
        <div class="results-title">
          <span id="results-heading">Study Results</span>
        </div>
        <div class="results-actions">
          <button type="button" class="action-btn section-action" id="btn-expand-all">Expand all</button>
          <button type="button" class="action-btn section-action" id="btn-collapse-all">Collapse all</button>
          <button type="button" class="action-btn" id="btn-copy">Copy results</button>
          <button type="button" class="action-btn" id="btn-share">Copy link</button>
          <button type="button" class="action-btn" id="btn-print">Print</button>
        </div>
      </div>
      <div class="sr-only" id="result-status" role="status" aria-live="polite"></div>
      <div class="results-body" id="results-body" tabindex="-1">
        <!-- Rendered Biblical Content -->
      </div>
      <div class="results-bottom-actions" id="results-bottom-actions">
        <button type="button" class="action-btn" id="btn-result-top">Back to results top</button>
      </div>
    </div>

  </main>

  <!-- Reader-focused project footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <h2 class="footer-title">About Berean Study Suite</h2>
      <p class="footer-desc">
        Explore a Bible passage alongside study notes, commentaries, dictionaries, and original-language helps—all gathered in one place.
      </p>
      <p class="footer-desc footer-guidance">
        This is a study companion, not a replacement for personal Bible reading, prayer, or thoughtful discussion. Read each passage in context and compare the perspectives offered by different sources.
      </p>
      <nav class="footer-links" aria-label="Helpful information">
        <a href="https://github.com/victorgoh/berean-study-suite/blob/main/docs/human-user-guide.md" target="_blank" rel="noopener noreferrer">How to use this study tool</a>
        <a href="https://github.com/victorgoh/berean-study-suite/blob/main/docs/data-sources-and-provenance.md" target="_blank" rel="noopener noreferrer">Study sources and credits</a>
        <a href="https://github.com/victorgoh/berean-study-suite" target="_blank" rel="noopener noreferrer">About the project</a>
      </nav>

      <div class="footer-bottom">
        <p>Study materials remain the work of their original authors and publishers and are credited in the source information.</p>
      </div>
    </div>
  </footer>

  <script>
    // Complete tool context configuration
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
      illustrations: {
        endpoint: "/tools/illustration_study_pack",
        icon: "💡",
        btnLabel: "Find Sermon Illustrations",
        placeholder: "Passage for illustrations: e.g. Romans 8:28, Psalm 23:1, Luke 15:11-32",
        defaultQuery: "Romans 8:28",
        samples: [
          { label: "Romans 8:28 (God's Purpose)", query: "Romans 8:28" },
          { label: "Psalm 23:1 (The Shepherd)", query: "Psalm 23:1" },
          { label: "Luke 15:11-32 (The Prodigal Son)", query: "Luke 15:11-32" }
        ],
        buildPayload: (q, v) => ({ reference: q, version: v, include_xrefs: true })
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
        buildPayload: (q) => ({ reference: q, commentators: ["TNotes", "Henry", "Calvin", "Barnes"] })
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
        btnLabel: "Read Book Guide",
        placeholder: "Book name: e.g. Romans, Genesis, Hebrews, Ephesians, Psalms",
        defaultQuery: "Romans",
        samples: [
          { label: "Romans", query: "Romans" },
          { label: "Ephesians", query: "Ephesians" },
          { label: "Genesis", query: "Genesis" },
          { label: "Hebrews", query: "Hebrews" }
        ],
        buildPayload: (q) => ({ book: q, detail: "summary" })
      },
      chapter_summary: {
        endpoint: "/tools/chapter_summary",
        icon: "📋",
        btnLabel: "Read Chapter Summary",
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
        btnLabel: "Look Up in Bible Dictionary Collection",
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

    const TOOL_HELP = {
      scripture: "Enter a verse or passage to read it in your preferred translation.",
      search: "Enter a word or phrase to find where it appears in Scripture.",
      xref: "Enter a verse to find related passages and biblical connections.",
      devotional: "Enter a passage to gather concise material for reflection and prayer.",
      prayer: "Enter a passage to build a Scripture-centered prayer guide.",
      exegesis: "Enter a passage for a structured verse-by-verse study.",
      commentary_single: "Enter a passage and choose one commentary source.",
      commentary_pack: "Enter a passage to compare selected commentary perspectives.",
      book_analysis: "Enter a Bible book name for its summary, themes, and introduction.",
      chapter_summary: "Enter a chapter such as Romans 8 for a concise guide.",
      word_pack: "Enter a verse to examine important words in their original-language context.",
      lexicon: "Enter a Strong's number such as G26 or H2617.",
      morphology: "Enter a verse to inspect the grammatical form of its original words.",
      interlinear_pack: "Enter a verse or short passage for word-by-word language study.",
      dictionary: "Enter a person, place, practice, object, or theological term.",
      entities: "Enter a name or place to distinguish related biblical people and locations.",
      character: "Enter a person's name to explore their biblical background.",
      location: "Enter a biblical place to explore its setting and significance.",
      chronology: "Enter a person or event to place it in its biblical period."
    };

    let activeMode = "scripture";
    let lastRenderedMarkdown = "";
    let currentCategoryTab = null;
    let activeRequestController = null;
    let requestSequence = 0;
    const REQUEST_TIMEOUT_MS = 60000;

    const queryInput = document.getElementById("query-input");
    const prefVersionSelect = document.getElementById("pref-version-select");
    const commentarySelect = document.getElementById("commentary-select");
    const dictSelect = document.getElementById("dict-select");
    const btnStudy = document.getElementById("btn-study");
    const btnText = document.getElementById("btn-text");
    const catTabs = document.querySelectorAll(".cat-tab");
    const modePills = document.querySelectorAll(".mode-pill");
    const toolPopover = document.getElementById("tool-popover");
    const searchPanel = document.getElementById("search-panel");
    const querySummary = document.getElementById("query-summary");
    const querySummaryText = document.getElementById("query-summary-text");
    const toolHelp = document.getElementById("tool-help");
    const resultsCard = document.getElementById("results-card");
    const resultsBody = document.getElementById("results-body");
    const resultsHeading = document.getElementById("results-heading");
    const resultStatus = document.getElementById("result-status");
    const btnCopy = document.getElementById("btn-copy");
    const btnShare = document.getElementById("btn-share");
    const btnPrint = document.getElementById("btn-print");
    const btnExpandAll = document.getElementById("btn-expand-all");
    const btnCollapseAll = document.getElementById("btn-collapse-all");
    const btnChangeSearch = document.getElementById("btn-change-search");
    const btnResultTop = document.getElementById("btn-result-top");
    const resultsBottomActions = document.getElementById("results-bottom-actions");
    const sampleTagsContainer = document.getElementById("sample-tags-container");

    // Load / Save Preferred Bible Version from localStorage
    const savedVersion = localStorage.getItem("berean_preferred_version");
    if (savedVersion) {
      prefVersionSelect.value = savedVersion;
    }
    prefVersionSelect.addEventListener("change", () => {
      localStorage.setItem("berean_preferred_version", prefVersionSelect.value);
    });

    function setSelectValue(select, value) {
      if (!value) return;
      const exists = Array.from(select.options).some(option => option.value === value);
      if (exists) select.value = value;
    }

    function categoryForMode(mode) {
      const pill = Array.from(modePills).find(item => item.getAttribute("data-mode") === mode);
      return pill ? pill.getAttribute("data-cat") : "passage";
    }

    function restoreUrlState() {
      const params = new URLSearchParams(window.location.search);
      const requestedMode = params.get("tool");
      if (requestedMode && TOOL_CONFIG[requestedMode]) activeMode = requestedMode;
      queryInput.value = params.get("q") || "";
      setSelectValue(prefVersionSelect, params.get("translation"));
      setSelectValue(commentarySelect, params.get("commentary"));
      setSelectValue(dictSelect, params.get("dictionary"));

      const category = categoryForMode(activeMode);
      catTabs.forEach(tab => tab.classList.toggle("active", tab.getAttribute("data-cat") === category));
      modePills.forEach(pill => pill.classList.toggle("active", pill.getAttribute("data-mode") === activeMode));
    }

    function updateUrlState(query = queryInput.value.trim()) {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("tool", activeMode);
      if (query) url.searchParams.set("q", query);
      url.searchParams.set("translation", prefVersionSelect.value || "BSB");
      const config = TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture;
      if (config.hasCommentarySelect) url.searchParams.set("commentary", commentarySelect.value);
      if (config.hasDictSelect) url.searchParams.set("dictionary", dictSelect.value);
      window.history.replaceState(null, "", url);
      return url.toString();
    }

    function cancelActiveRequest() {
      requestSequence += 1;
      if (activeRequestController) activeRequestController.abort();
      activeRequestController = null;
      resultsCard.setAttribute("aria-busy", "false");
      btnStudy.disabled = false;
      btnText.textContent = (TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture).btnLabel;
    }

    // Update Contextual UI Controls & Samples for the Active Mode
    function updateContextualControls() {
      const cfg = TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture;

      queryInput.placeholder = cfg.placeholder;
      btnText.textContent = cfg.btnLabel;
      toolHelp.textContent = TOOL_HELP[activeMode] || ("Use the field below to " + cfg.btnLabel.toLowerCase() + ".");

      commentarySelect.style.display = cfg.hasCommentarySelect ? "inline-block" : "none";
      dictSelect.style.display = cfg.hasDictSelect ? "inline-block" : "none";

      sampleTagsContainer.innerHTML = "";
      if (cfg.samples && cfg.samples.length > 0) {
        cfg.samples.forEach(s => {
          const tag = document.createElement("button");
          tag.type = "button";
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

    function closeToolPopover(returnFocus = false) {
      toolPopover.classList.remove("open");
      catTabs.forEach(tab => tab.setAttribute("aria-expanded", "false"));
      if (returnFocus && currentCategoryTab) currentCategoryTab.focus();
    }

    function selectMode(mode, category) {
      cancelActiveRequest();
      activeMode = mode;
      catTabs.forEach(tab => tab.classList.toggle("active", tab.getAttribute("data-cat") === category));
      modePills.forEach(p => p.classList.toggle("active", p.getAttribute("data-mode") === mode));
      updateContextualControls();
      closeToolPopover();
      queryInput.focus();
    }

    function createToolOption(pill, category, hidden = false) {
      const mode = pill.getAttribute("data-mode");
      const option = document.createElement("button");
      option.type = "button";
      option.className = "tool-option" + (mode === activeMode ? " active" : "");
      option.setAttribute("role", "menuitem");
      option.textContent = pill.textContent.trim();
      option.hidden = hidden;
      option.addEventListener("click", () => selectMode(mode, category));
      toolPopover.appendChild(option);
      return option;
    }

    function visibleToolMenuItems() {
      return Array.from(toolPopover.querySelectorAll(".tool-option:not([hidden]), .tool-more-toggle:not([hidden])"));
    }

    function positionToolPopover(tab) {
      if (!tab) return;
      if (window.matchMedia("(max-width: 640px)").matches) {
        toolPopover.style.left = "0px";
        toolPopover.style.right = "0px";
        return;
      }

      const parent = tab.parentElement;
      const panelWidth = toolPopover.offsetWidth;
      const availableWidth = parent.clientWidth;
      const alignedLeft = tab.offsetLeft;
      const constrainedLeft = Math.max(0, Math.min(alignedLeft, availableWidth - panelWidth));
      toolPopover.style.left = constrainedLeft + "px";
      toolPopover.style.right = "auto";
    }

    function openToolPopover(category, tab, focusFirst = false) {
      const choices = Array.from(modePills).filter(pill => pill.getAttribute("data-cat") === category);
      const primaryChoices = choices.filter(pill => pill.getAttribute("data-tier") !== "more");
      const moreChoices = choices.filter(pill => pill.getAttribute("data-tier") === "more");
      const showMoreInitially = moreChoices.some(pill => pill.getAttribute("data-mode") === activeMode);
      toolPopover.innerHTML = "";
      currentCategoryTab = tab;
      primaryChoices.forEach(pill => createToolOption(pill, category));

      if (moreChoices.length > 0) {
        const moreToggle = document.createElement("button");
        moreToggle.type = "button";
        moreToggle.className = "tool-more-toggle";
        moreToggle.setAttribute("role", "menuitem");
        moreToggle.setAttribute("aria-expanded", String(showMoreInitially));
        moreToggle.textContent = "More study tools";
        moreToggle.hidden = showMoreInitially;
        toolPopover.appendChild(moreToggle);

        const moreOptions = moreChoices.map(pill => createToolOption(pill, category, !showMoreInitially));
        moreToggle.addEventListener("click", () => {
          moreToggle.setAttribute("aria-expanded", "true");
          moreToggle.hidden = true;
          moreOptions.forEach(option => { option.hidden = false; });
          if (moreOptions[0]) moreOptions[0].focus();
        });
      }

      catTabs.forEach(item => item.setAttribute("aria-expanded", item === tab ? "true" : "false"));
      toolPopover.classList.add("open");
      positionToolPopover(tab);
      if (focusFirst) {
        const firstItem = visibleToolMenuItems()[0];
        if (firstItem) firstItem.focus();
      }
    }

    catTabs.forEach(tab => {
      const category = tab.getAttribute("data-cat");
      tab.addEventListener("mouseenter", () => openToolPopover(category, tab));
      tab.addEventListener("focus", () => openToolPopover(category, tab));
      tab.addEventListener("click", () => {
        if (toolPopover.classList.contains("open") && tab.getAttribute("aria-expanded") === "true") closeToolPopover();
        else openToolPopover(category, tab);
      });
      tab.addEventListener("keydown", event => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openToolPopover(category, tab, true);
        }
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const tabs = Array.from(catTabs);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex = (tabs.indexOf(tab) + direction + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
        }
      });
    });

    toolPopover.addEventListener("keydown", event => {
      const items = visibleToolMenuItems();
      const currentIndex = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeToolPopover(true);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || items.length === 0) return;
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = items.length - 1;
      if (event.key === "ArrowDown") nextIndex = (currentIndex + 1 + items.length) % items.length;
      if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
      items[nextIndex].focus();
    });

    document.addEventListener("click", (event) => {
      if (!document.getElementById("category-tabs").contains(event.target)) closeToolPopover();
    });
    window.addEventListener("resize", () => {
      if (toolPopover.classList.contains("open")) positionToolPopover(currentCategoryTab);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toolPopover.classList.contains("open")) closeToolPopover(true);
    });

    function setStatus(message) {
      resultStatus.textContent = "";
      window.setTimeout(() => { resultStatus.textContent = message; }, 10);
    }

    function selectedOptionText(select) {
      const option = select.options[select.selectedIndex];
      return option ? option.textContent.trim() : "";
    }

    function requestSummary(config, q, payload) {
      const parts = [config.btnLabel];
      if (q) parts.push(q);
      if (config.hasCommentarySelect) parts.push(selectedOptionText(commentarySelect));
      if (config.hasDictSelect) parts.push(selectedOptionText(dictSelect));
      if (Object.prototype.hasOwnProperty.call(payload, "version") && payload.version === prefVersionSelect.value) {
        parts.push(prefVersionSelect.value);
      }
      return parts.filter(Boolean).join(" · ");
    }

    function showSearchPanel() {
      searchPanel.hidden = false;
      querySummary.classList.remove("visible");
      window.setTimeout(() => {
        searchPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        queryInput.focus();
      }, 10);
    }

    function showResultsView(summary) {
      querySummaryText.textContent = summary;
      querySummary.classList.add("visible");
      searchPanel.hidden = true;
    }

    function showResultError(title, message) {
      const wrapper = document.createElement("div");
      wrapper.className = "result-message";
      const heading = document.createElement("h2");
      heading.textContent = title;
      const detail = document.createElement("p");
      detail.textContent = message;
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "action-btn";
      retry.textContent = "Try again";
      retry.addEventListener("click", executeStudy);
      wrapper.append(heading, detail, retry);
      resultsBody.replaceChildren(wrapper);
      resultsBottomActions.classList.remove("visible");
      btnExpandAll.classList.remove("visible");
      btnCollapseAll.classList.remove("visible");
      setStatus(title + ". " + message);
    }

    function classifyError(error) {
      const message = error && error.message ? error.message : "The request could not be completed.";
      if (error && error.status === 404 || /not found|no entry|no matching/i.test(message)) {
        return ["No matching result", "Check the passage or spelling, choose another source, and try again."];
      }
      if (error && error.status === 400 || /invalid|required|reference/i.test(message)) {
        return ["Check your search", message];
      }
      if (error && error.status >= 500) {
        return ["Resource temporarily unavailable", "This study resource could not be reached. Please try again shortly."];
      }
      return ["Unable to load results", "Please check your connection and try again."];
    }

    // Execute Study Request
    async function executeStudy() {
      const q = queryInput.value.trim();
      if (!q && activeMode !== "daily_reading" && activeMode !== "resources") {
        setStatus("Enter a passage, word, topic, person, or place to continue.");
        queryInput.focus();
        return;
      }

      const v = prefVersionSelect.value || "BSB";
      const c = commentarySelect.value;
      const d = dictSelect.value;
      const config = TOOL_CONFIG[activeMode] || TOOL_CONFIG.scripture;
      const payload = config.buildPayload(q, v, c, d);
      cancelActiveRequest();
      const requestId = ++requestSequence;
      const controller = new AbortController();
      activeRequestController = controller;
      let requestTimedOut = false;
      const timeoutId = window.setTimeout(() => {
        requestTimedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      btnStudy.disabled = true;
      btnText.textContent = "Loading...";
      
      resultsCard.style.display = "block";
      resultsCard.setAttribute("aria-busy", "true");
      resultsBody.innerHTML = '<div class="result-message"><div class="spinner" style="margin:0 auto 1rem; width:24px; height:24px; border-width:3px;"></div><p>Gathering your study results…</p></div>';
      resultsHeading.textContent = config.btnLabel + (q ? ": " + q : "");
      resultsBottomActions.classList.remove("visible");
      btnExpandAll.classList.remove("visible");
      btnCollapseAll.classList.remove("visible");
      setStatus("Loading " + config.btnLabel.toLowerCase() + " results.");

      try {
        const res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        if (requestId !== requestSequence) return;

        const text = await res.text();
        if (requestId !== requestSequence) return;
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { text: text };
        }

        const responseError = parsed && parsed.error
          ? (typeof parsed.error === "string" ? parsed.error : (parsed.error.message || parsed.error.code || JSON.stringify(parsed.error)))
          : "";
        if (!res.ok || responseError) {
          const requestError = new Error(responseError || "The request returned status " + res.status + ".");
          requestError.status = res.status;
          throw requestError;
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
        } else {
          md = JSON.stringify(parsed, null, 2);
        }

        lastRenderedMarkdown = md;
        // Treat every Explorer tool whose endpoint is a study pack as a
        // sectioned result, even if an HTTP adapter omits optional metadata.
        const isSectionedResult = config.endpoint.includes("_pack") ||
          (activeMode === "dictionary" && d === "collection");
        resultsBody.innerHTML = isSectionedResult
          ? formatStudyPackMarkdown(md)
          : formatMarkdown(md);

        enhanceResultNavigation(isSectionedResult, md);
        showResultsView(requestSummary(config, q, payload));
        updateUrlState(q);
        setStatus("Results loaded for " + (q || config.btnLabel) + ".");

        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        resultsBody.focus({ preventScroll: true });

      } catch (err) {
        if (requestId !== requestSequence) return;
        if (err && err.name === "AbortError" && requestTimedOut) {
          showResultError("Request took too long", "This resource did not respond within one minute. Try again or choose a more focused lookup.");
          return;
        }
        const errorDisplay = classifyError(err);
        showResultError(errorDisplay[0], errorDisplay[1]);
      } finally {
        window.clearTimeout(timeoutId);
        if (requestId !== requestSequence) return;
        activeRequestController = null;
        resultsCard.setAttribute("aria-busy", "false");
        btnStudy.disabled = false;
        btnText.textContent = config.btnLabel;
      }
    }

    function enhanceResultNavigation(isSectionedResult, markdown) {
      const sections = resultsBody.querySelectorAll(".study-pack-section");
      const hasSections = isSectionedResult && sections.length > 0;
      btnExpandAll.classList.toggle("visible", hasSections);
      btnCollapseAll.classList.toggle("visible", hasSections);

      if (!hasSections && markdown.length >= 4000) {
        const headings = Array.from(resultsBody.querySelectorAll("h2, h3, h4"))
          .filter(heading => heading.textContent.trim())
          .slice(0, 16);
        if (headings.length >= 3) {
          const contents = document.createElement("details");
          contents.className = "result-contents";
          const summary = document.createElement("summary");
          summary.textContent = "Contents";
          const nav = document.createElement("nav");
          nav.setAttribute("aria-label", "Result contents");
          headings.forEach((heading, index) => {
            const id = "result-section-" + (index + 1);
            heading.id = id;
            const link = document.createElement("a");
            link.href = "#" + id;
            link.textContent = heading.textContent.trim();
            nav.appendChild(link);
          });
          contents.append(summary, nav);
          resultsBody.insertBefore(contents, resultsBody.firstChild);
        }
      }

      resultsBottomActions.classList.toggle("visible", markdown.length >= 5000 || sections.length >= 4);
    }

    function escapeAttribute(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    // Markdown Formatter
    function formatStudyPackMarkdown(md) {
      const sectionPattern = /^##\\s+(.+)$/gm;
      const matches = Array.from(md.matchAll(sectionPattern));
      if (matches.length === 0) return formatMarkdown(md);

      const leading = md.slice(0, matches[0].index).trim();
      let html = leading ? formatMarkdown(leading) : "";

      matches.forEach((match, index) => {
        const title = match[1].trim();
        const contentStart = (match.index || 0) + match[0].length;
        const contentEnd = index + 1 < matches.length
          ? (matches[index + 1].index || md.length)
          : md.length;
        const content = md.slice(contentStart, contentEnd).trim();
        const expanded = index === 0 || /(^|\\s)1\\.|scripture/i.test(title);
        const stateClass = expanded ? "is-expanded" : "is-collapsed";
        const icon = expanded ? "−" : "+";
        const expandedState = expanded ? "true" : "false";

        html += '<div class="study-pack-section ' + stateClass + '">' +
          '<div class="study-pack-section-header">' +
          '<span>' + formatMarkdown(title).replace(/^<p>|<\\/p>$/g, "") + '</span>' +
          '<button type="button" class="study-pack-toggle" data-action="toggle-section" aria-expanded="' + expandedState + '" aria-label="' + escapeAttribute("Toggle " + title) + '">' + icon + '</button>' +
          '</div>' +
          '<div class="study-pack-section-content">' + formatMarkdown(content) + '</div>' +
          '</div>';
      });

      return html;
    }

    function toggleStudyPackSection(button) {
      const section = button.closest(".study-pack-section");
      const isExpanded = section.classList.contains("is-expanded");
      section.classList.toggle("is-expanded", !isExpanded);
      section.classList.toggle("is-collapsed", isExpanded);
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.textContent = isExpanded ? "+" : "−";
    }

    function setAllStudyPackSections(expanded) {
      document.querySelectorAll(".study-pack-section").forEach(section => {
        section.classList.toggle("is-expanded", expanded);
        section.classList.toggle("is-collapsed", !expanded);
        const button = section.querySelector(".study-pack-toggle");
        if (button) {
          button.setAttribute("aria-expanded", String(expanded));
          button.textContent = expanded ? "−" : "+";
        }
      });
    }

    resultsBody.addEventListener("click", event => {
      const toggle = event.target.closest('[data-action="toggle-section"]');
      if (toggle && resultsBody.contains(toggle)) toggleStudyPackSection(toggle);
    });

    function renderMarkdownTables(markdown) {
      const lines = markdown.split("\\n");
      const rendered = [];

      const cells = (line) => line.trim().slice(1, -1).split("|").map(cell => cell.trim());
      const isDivider = (line) => line.trim().startsWith("|") && line.trim().endsWith("|") &&
        cells(line).every(cell => /^:?-{3,}:?$/.test(cell));

      for (let index = 0; index < lines.length; index++) {
        if (!lines[index].trim().startsWith("|") || !lines[index].trim().endsWith("|") || !isDivider(lines[index + 1] || "")) {
          rendered.push(lines[index]);
          continue;
        }

        const headerCells = cells(lines[index]);
        const bodyRows = [];
        index += 2;
        while (index < lines.length && lines[index].trim().startsWith("|") && lines[index].trim().endsWith("|")) {
          bodyRows.push(cells(lines[index]));
          index++;
        }
        index--;

        const header = headerCells.map(cell => "<th>" + cell + "</th>").join("");
        const body = bodyRows.map(row => "<tr>" + row.map(cell => "<td>" + cell + "</td>").join("") + "</tr>").join("");
        rendered.push('<div class="markdown-table-wrap"><table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table></div>');
      }

      return rendered.join("\\n");
    }

    function formatMarkdown(md) {
      if (!md) return "";
      let html = md;
      const B = String.fromCharCode(92);

      // Convert any HTML formatting to Markdown before escaping
      html = html.replace(new RegExp("<b" + B + "b[^>]*>(.*?)<" + B + "/b>", "gi"), "**$1**");
      html = html.replace(new RegExp("<strong" + B + "b[^>]*>(.*?)<" + B + "/strong>", "gi"), "**$1**");
      html = html.replace(new RegExp("<i" + B + "b[^>]*>(.*?)<" + B + "/i>", "gi"), "*$1*");
      html = html.replace(new RegExp("<em" + B + "b[^>]*>(.*?)<" + B + "/em>", "gi"), "*$1*");
      html = html.replace(new RegExp("<br" + B + "s*" + B + "/?>", "gi"), "\\n");
      html = html.replace(new RegExp("<p" + B + "b[^>]*>(.*?)<" + B + "/p>", "gi"), "$1\\n\\n");
      html = html.replace(/<[^>]+>/g, ""); // Strip any unhandled tags

      // Escape HTML
      html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Tables are used by morphology and several reference-oriented tools.
      html = renderMarkdownTables(html);

      // Scripture Tag Highlighting [Romans 8:28 (BSB)]
      html = html.replace(new RegExp(B + "[([0-9a-zA-Z" + B + "s]+ " + B + "d+:" + B + "d+(?:-" + B + "d+)?(?:" + B + "s*" + B + "([A-Za-z0-9]+" + B + "))?)]", "g"), '<span class="verse-badge">[$1]</span>');

      // Alerts
      html = html.replace(new RegExp("&gt; " + B + "[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)" + B + "]" + B + "s*" + B + "n&gt; (.*?)(?=" + B + "n" + B + "n|" + B + "n$|$)", "gs"), (m, type, content) => {
        return '<blockquote class="alert alert-' + type.toLowerCase() + '"><strong>' + type + ':</strong> ' + content.replace(new RegExp(B + "n&gt; ", "g"), ' ') + '</blockquote>';
      });

      // Headers
      html = html.replace(/^###### +(.*$)/gim, '<h6>$1</h6>');
      html = html.replace(/^##### +(.*$)/gim, '<h5>$1</h5>');
      html = html.replace(/^#### +(.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      html = html.replace(/^#{4,6} *$/gim, '');

      // Bold & Italic
      html = html.replace(new RegExp(B + "\\\\*\\\\*\\\\*(.*?)\\\\*\\\\*\\\\*", "gim"), '<strong><em>$1</em></strong>');
      html = html.replace(new RegExp(B + "\\\\*\\\\*(.*?)\\\\*\\\\*", "gim"), '<strong>$1</strong>');
      html = html.replace(new RegExp(B + "\\\\*(.*?)\\\\*", "gim"), '<em>$1</em>');

      // Lists
      html = html.replace(/^• (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
      html = html.replace(/(?:^<li>.*<\\/li>\\n?)+/gim, match => '<ul>' + match.replace(/\\n/g, '') + '</ul>\\n');

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

    // Result actions
    btnCopy.addEventListener("click", async () => {
      if (!lastRenderedMarkdown) return;
      const orig = btnCopy.textContent;
      try {
        await navigator.clipboard.writeText(lastRenderedMarkdown);
        btnCopy.textContent = "Copied";
        setStatus("Results copied to the clipboard.");
      } catch {
        btnCopy.textContent = "Copy failed";
        setStatus("The results could not be copied. Select the text and copy it manually.");
      }
      setTimeout(() => { btnCopy.textContent = orig; }, 1800);
    });

    btnShare.addEventListener("click", async () => {
      const original = btnShare.textContent;
      const shareUrl = updateUrlState();
      try {
        await navigator.clipboard.writeText(shareUrl);
        btnShare.textContent = "Link copied";
        setStatus("A link to this search setup was copied.");
      } catch {
        btnShare.textContent = "Copy failed";
        setStatus("The link could not be copied. Copy it from the browser address bar.");
      }
      window.setTimeout(() => { btnShare.textContent = original; }, 1800);
    });

    btnPrint.addEventListener("click", () => window.print());
    btnExpandAll.addEventListener("click", () => setAllStudyPackSections(true));
    btnCollapseAll.addEventListener("click", () => setAllStudyPackSections(false));
    btnChangeSearch.addEventListener("click", showSearchPanel);
    btnResultTop.addEventListener("click", () => resultsCard.scrollIntoView({ behavior: "smooth", block: "start" }));

    // Enter Key to Study
    queryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeStudy();
      }
    });

    btnStudy.addEventListener("click", executeStudy);

    window.addEventListener("popstate", () => {
      cancelActiveRequest();
      restoreUrlState();
      updateContextualControls();
      searchPanel.hidden = false;
      querySummary.classList.remove("visible");
      resultsCard.style.display = "none";
      lastRenderedMarkdown = "";
    });

    // Initial setup on load
    restoreUrlState();
    updateContextualControls();
  </script>
</body>
</html>`;
}
