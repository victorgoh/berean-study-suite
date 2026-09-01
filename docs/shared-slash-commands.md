# Slash Commands & Workflows Reference Guide

The **Berean Study Suite** operates on a pure, zero-overhead MCP architecture. You can trigger focused research and comprehensive studies using natural language prompts (or the optional UI slash shortcuts in Antigravity). The available tools depend on the configured MCP profile; use `tools/list` or `get_available_resources` for the authoritative current catalog.

---

## ⚡ Core Antigravity Slash Commands

These 4 workflows provide fast, dedicated access to the primary study engines and document utilities:

| Command | Purpose | Assigned Persona | Example Usage |
| :--- | :--- | :--- | :--- |
| **`/berean`** | Runs a complete, structured 7-phase expository study pipeline. | *Biblical Content Interpreter* / *Master Biblical Writer* | `/berean Romans 8:28-39` |
| **`/berean-plus`** | Advanced dynamically audited study with dynamic quality gates and persona rotation. | *Study Quality Auditor* / *Berean-Plus Orchestrator* | `/berean-plus Exegesis of Isaiah 53` |
| **`/image`** | Generates high-resolution biblical illustrations and sermon slide backgrounds. | *Verse Scripter* | `/image Moses and the parting of the Red Sea` |
| **`/docx`** | Converts any markdown study manuscript into a styled Microsoft Word (`.docx`) file. | *Master Biblical Writer* | `/docx berean_romans_8.md` |

---

## 🛠️ Instant Workspace Commands (`berean init` & `berean check`)

You can execute these setup and diagnostic commands directly in chat in any project:

| Prompt | Purpose | Execution Details |
| :--- | :--- | :--- |
| **`berean init`** | Installs slash shortcuts in the active workspace. | Inspects project, creates `.agents/workflows/`, and writes `/berean`, `/berean-plus`, `/docx`, and `/image`. |
| **`berean check`** | Diagnoses workspace health and MCP connection. | Verifies connectivity to the Berean MCP Server and confirms workspace configuration. |

---

## 📦 9 High-Speed Composite Study Packs

When you execute `/berean`, `/berean-plus`, or ask free-form study questions, the AI directly invokes these single-turn study pack tools from the **Berean MCP Server**:

| Study Pack | Description & Included Datasets |
| :--- | :--- |
| **`passage_exegesis_pack`** | Detailed academic exegesis: Greek/Hebrew text, morphology, Keil & Delitzsch (`KD`), H. A. W. Meyer (`CECNT`), Expositor's Greek NT (`EGNT`), Clarke, The Pulpit Commentary, and JFB. |
| **`sermon_study_pack`** | Focused preaching & homiletics: Scripture, Alexander Maclaren, Charles Simeon (Horae Homileticae), and TSK cross-references. |
| **`illustration_study_pack`** | Opt-in Biblical Illustrator historical anecdotes and sermon illustrations. Its fuller source content is kept out of the default sermon pack. |
| **`covenant_theology_pack`** | Redemptive-historical covenant progression: John Calvin, John Gill prophecy, ISBE Encyclopedia, and 12 TSK cross-references. |
| **`lesson_creator_study_pack`** | Focused Bible teaching & small groups: Scripture text, a sourced chapter opening, Charles Ellicott, and cross-references. |
| **`devotional_study_pack`** | Concise pastoral meditation: Scripture text, Tyndale Open Study Notes, Matthew Henry Concise Commentary, and supporting cross-references. |
| **`prayer_guide_study_pack`** | Scriptural intercession: Scripture text, Charles Spurgeon adoration, Joseph Benson, John Wesley examination, and promises. |
| **`word_study_pack`** | Deep word study: Strong's Concordance, Brown-Driver-Briggs (BDB), Thayer's Greek Lexicon, A. T. Robertson, and Marvin Vincent. |
| **`topic_study_pack`** | Systematic topical study: Easton's Bible Dictionary, Nave's Topical definitions, and biblical promises. |
| **`commentary_study_pack`** | Multi-commentator comparison: Synthesizes custom commentators side-by-side on any passage. |

---

## 📖 18 Specialized Single-Engine Berean MCP Tools

For specific queries, the agent can call any of the 18 individual MCP tools:

### 1. Scripture & Translations
- **`bible_lookup`**: Retrieve passages from BSB, NET, KJV, or OHGB (Original Hebrew/Greek).
- **`bible_search`**: Search for keywords across the Old and New Testaments.
- **`cross_references`**: Retrieve Treasury of Scripture Knowledge (TSK) ranked references.
- **`parallel_passages`**: Side-by-side Gospel parallels, OT parallels, and prophecy fulfillments.
- **`daily_reading`**: 365-day whole-Bible reading schedules with automatic Scripture embedding.

### 2. Commentaries (Classical Public Domain Sets in `biblematedata`)
- **`commentary_lookup`**: Query any commentator (e.g. `Henry`, `JFB`, `Calvin`, `Gill`, `MacL`, `Barnes`, `Spur`, `Clarke`, `Wesley`, `Benson`, `Pulpit`, `EGNT`, `CECNT`, `ECER`, `EBC`, `KD`, `Lange`, `Rob`, `Vincent`, `Whedon`, `CBSC`, `Brooks`, `PHC`, `HH`, `BI`).

### 3. Linguistics & Morphology
- **`morphology_lookup`**: Word-by-word grammatical tagging, lemma roots, transliterations, and glosses.
- **`lexicon_lookup`**: Comprehensive definitions from Strong's, Brown-Driver-Briggs (BDB), and Thayer.

### 4. Topical, Historical & Contextual Reference
- **`topic_study`**: Search Nave's Topical Bible and Torrey's New Topical Textbook.
- **`character_lookup`**: Biographical details, family lineage, and biblical milestones.
- **`location_lookup`**: Geographical coordinates, ancient names, and archaeological significance.
- **`theological_dictionary`**: Query Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the source-labelled Classic Bible Dictionary Collection. Explicit source requests do not silently fall back to another source.
- **`book_analysis`**: Source-attributed Tyndale Open Study Notes book summaries and full introductions.
- **`chapter_summary`**: Source-attributed Adam Clarke chapter-opening synopsis.
- **`biblical_promises`**: Thematic promises categorized by spiritual need.
- **`bible_names`**: Etymological meanings and origins of biblical names.
- **`chronology`**: Biblical timelines, kings chronology, and historical genealogies.
- **`get_available_resources`**: Real-time listing of active bibles, commentaries, lexicons, study packs, personas, skills, workflows, and rules.
