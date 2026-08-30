# Berean Universal Formatting & Typography Standards
`uri: berean://rules/typography`

These standards govern all MCP tool outputs, composite study packs, and generated theological manuscripts across the **Berean Study Suite**.

---

## 📐 Core Typography & Output Formatting Rules

### 1. Title & Header Hierarchy
* **Clean Plain-Text Headers**: All H1 and H2 headers must use clean, professional plain-text without emoji prefixes (e.g., `# Septuagint (LXX) & Hebrew MT Comparative Study Pack: Genesis 1:1-5`, `# Inline Interlinear Study Pack: Philippians 4:4`, `# Sermon Study Pack: Romans 8:28`).
* **Strict Heading Order**: 
  - H1 (`# ...`) for the primary Study Pack or Tool Title.
  - H2 (`## 1. ...`, `## 2. ...`) for major numbered sections.
  - H3 (`### ...`) for sub-sections or per-verse blocks.
  - H4 (`#### ...`) for detailed commentary or morphological sub-entries.

### 2. Zero Raw LaTeX Math Notation
* **Never** output raw LaTeX formulas or math blocks (e.g. `$\rightarrow$`, `\implies`, `\text{...}`, `$$...$$`).
* Standard Markdown parsers in chat clients and Word export engines do not render LaTeX math reliably in prose.

### 3. Universal Unicode Flow & Arrows
* Always use standard UTF-8 Unicode characters for logical flows, diagrams, and arrows:
  - Use `→` or `-->` instead of `\rightarrow`
  - Use `⇒` or `==>` instead of `\implies`
  - Use `⟵` or `<--` for citations and source links (e.g. `Hebrews 8:8 ⟵ Jeremiah 31:31`)
  - Use `≈` instead of `\approx`
  - Use `•` or `*` for clean bulleted listings
  - Use `▶` for primary section highlight callouts

### 4. No Fragile ASCII Box Art Diagrams
* **Never** output multi-line ASCII box drawings (e.g. `┌──┐`, `└──┘`, multi-column text banners). They break across mobile screens, web viewports, and Microsoft Word exports due to variable-width fonts and line wrapping.
* **Always** use **Native Markdown Tables** for comparisons and **Linear Sequences** (`A → B → C`) for flows.

### 5. Explicit Scripture Translation Tags
* Every quoted verse must be explicitly tagged with its translation version (e.g. `[Romans 8:28 (BSB)]` or `[Genesis 1:1 (NET)]` or `[Hebrews 8:8 (LXX/Brenton)]`).
* Never quote Scripture from memory without verification from the **Berean MCP Server** (`bible_lookup` or composite study packs).

### 6. Clean Cross-Platform Rendering
* All formatting must render cleanly and publication-ready across IDE Markdown previewers, chat interfaces, web browsers, and Pandoc Microsoft Word (`.docx`) exports.
