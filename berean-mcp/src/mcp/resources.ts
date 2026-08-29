import { OFFICIAL_BOOK_NAMES } from "./constants.js";
import { BEREAN_PERSONAS } from "./prompts.js";

export const RESOURCE_DEFINITIONS = [
  {
    uri: "berean://rules/typography",
    name: "Universal Formatting & Typography Standards",
    description: "Universal standards: zero raw LaTeX math, standard Unicode symbols (→, ⇒, ▶), no fragile ASCII boxes, explicit Scripture translation tags [Romans 8:28 (BSB)], clean Docx rendering.",
    mimeType: "text/markdown"
  },
  {
    uri: "berean://skills/berean",
    name: "Berean Autonomous Exegesis & Synthesis Skill",
    description: "Structured multi-phase research pipeline: Planning, Scripture & Morphology Retrieval, Exegesis, Covenant Theology, Pastoral Application, and Master Final Manuscript.",
    mimeType: "text/markdown"
  },
  {
    uri: "berean://skills/berean-plus",
    name: "Berean-Plus Dynamic Phased Audit Skill",
    description: "Dynamic goal-oriented research workflow with dynamic persona matching and quality audit checkpoints between phases.",
    mimeType: "text/markdown"
  },
  {
    uri: "berean://workflows/image",
    name: "Biblical Visual & Image Generation Workflow",
    description: "Guidelines and prompt crafting methodology for generating high-resolution biblical illustrations, sermon backgrounds, and visual aids.",
    mimeType: "text/markdown"
  },
  {
    uri: "berean://workflows/docx",
    name: "Publication & Word Document (.docx) Export Workflow",
    description: "Standards and commands for compiling markdown study manuscripts into styled Microsoft Word documents via Pandoc.",
    mimeType: "text/markdown"
  },
  {
    uri: "berean://personas/all",
    name: "The 15 AI Theological Personas Directory",
    description: "Complete operational instructions and hermeneutical profiles for all 15 specialized theological personas.",
    mimeType: "application/json"
  },
  {
    uri: "berean://canon/protestant",
    name: "Protestant Bible Canon",
    description: "Full list of 66 Protestant Bible books with canonical indices and testament classification.",
    mimeType: "application/json"
  },
  {
    uri: "berean://reading-plans/mcheyne",
    name: "Robert Murray M'Cheyne Reading Plan",
    description: "Daily Scripture reading plan covering the Old Testament once and the New Testament and Psalms twice a year.",
    mimeType: "application/json"
  }
];

export function getResourceContent(uri: string): string | null {
  if (uri === "berean://rules/typography") {
    return `# Berean Universal Formatting & Typography Standards

## 📐 Formatting Rules for All Study Outputs & Manuscripts

1. **Zero Raw LaTeX Math Notation**:
   - **Never** output raw LaTeX formulas or math blocks (e.g. \`$\\rightarrow$\`, \`\\implies\`, \`\\text{...}\`, \`$$...$$\`).
2. **Universal Unicode Symbols**:
   - Always use standard Unicode characters for logical flows, diagrams, and arrows:
     - Use \`→\` or \`-->\` instead of \`\\rightarrow\`
     - Use \`⇒\` or \`==>\` instead of \`\\implies\`
     - Use \`≈\` instead of \`\\approx\`
     - Use \`▶\` for primary bullet highlights
3. **No Fragile ASCII Box Art Diagrams**:
   - **Never** output multi-line ASCII box drawings (e.g. \`┌──┐\`, \`└──┘\`, multi-column text banners). They break across mobile screens and Microsoft Word exports due to line wrapping.
   - **Always** use **Native Markdown Tables** for comparisons and **Linear Sequences** (\`**A** → **B** → **C**\`) for flows.
4. **Explicit Scripture Translation Tags**:
   - Every quoted verse must be explicitly tagged with its translation version (e.g. \`[Romans 8:28 (BSB)]\` or \`[Genesis 1:1 (NET)]\`).
   - Never quote Scripture from memory without verification from the **Berean MCP Server** (\`bible_lookup\` or composite study packs).
5. **Clean Cross-Platform Rendering**:
   - Formatting must look crisp and publication-ready across all Markdown viewers, IDEs, and Microsoft Word (\`/docx\`) exports.
`;
  }

  if (uri === "berean://skills/berean") {
    return `# Berean Study Orchestration Specification

## Overview
Structured, multi-phase biblical research pipeline producing publication-quality theological manuscripts.

### Fast-Path MCP Routing Matrix
- **Passage Exegesis**: \`passage_exegesis_pack\` + \`morphology_lookup\` + \`commentary_lookup\`
- **Covenant & Redemptive**: \`covenant_theology_pack\` + \`parallel_passages\`
- **Sermon & Homiletics**: \`sermon_study_pack\` + \`biblical_promises\`
- **Topical / Systematic**: \`topic_study_pack\` + \`theological_dictionary\`
- **Biographical / Character**: \`character_lookup\` + \`location_lookup\` + \`chronology\`
- **Small Group / Lesson**: \`lesson_creator_study_pack\` + \`bible_lookup\`

### Workflow Phases
1. **Phase 0: Initialization & Master Plan** — Extract boundaries, choose routing pack, define study roadmap.
2. **Phase 1: Scripture & Linguistic Data Retrieval** — Retrieve text (BSB, NET, KJV), Greek/Hebrew morphology (\`morphology_lookup\`), and TSK cross-references.
3. **Phase 2: Historical Context & Exegetical Synthesis** — Analyze syntax, authorial occasion, cultural background, and classical commentaries (Calvin, Meyer, Keil & Delitzsch).
4. **Phase 3: Covenant & Systematic Theology** — Redemptive-historical covenants (Abrahamic, Mosaic, Davidic, New), Christocentric typology, and systematic doctrines.
5. **Phase 4: Pastoral, Cultural & Homiletical Application** — Life application principles, 3-5 small group questions, and 1st-person scriptural prayer.
6. **Phase 5: Pre-Final Gap Audit** — Verify all user questions and sub-topics are comprehensively addressed.
7. **Phase 6: Final Master Study Manuscript** — Synthesize all phases adopting the *Master Biblical Writer* persona into a publication-ready deliverable.
`;
  }

  if (uri === "berean://skills/berean-plus") {
    return `# Berean-Plus Dynamic Phased Audit Specification

## Overview
Dynamic, goal-oriented research workflow with **Dynamic Quality Audit Checkpoints** between each study phase, enforced by the **Study Plan & Phase Quality Auditor** persona.

### Dynamic Phases & Quality Gates
1. **Phase 1: Strategic Planning & Dynamic Scoping**
   - Deconstruct query into historical, linguistic, theological, and pastoral sub-questions.
   - *Audit Gate 1*: Verify all dimensions are properly scoped.
2. **Phase 2: Linguistic, Textual & Exegetical Deep-Dive**
   - Query \`passage_exegesis_pack\` / \`morphology_lookup\` and classical commentaries.
   - *Audit Gate 2*: Confirm every key term has lexical backing (Strong's, BDB, Thayer) and avoid totality transfer.
3. **Phase 3: Covenantal & Redemptive-Historical Synthesis**
   - Query \`covenant_theology_pack\`. Trace Christocentric progression from OT shadows to NT fulfillment.
   - *Audit Gate 3*: Ensure historical-canonical continuity between Old and New Testaments.
4. **Phase 4: Pastoral, Cultural & Homiletical Integration**
   - Formulate diagnostic heart questions, practical applications, and 1st-person prayer.
   - *Audit Gate 4*: Ground applications directly in the text rather than generic moralism.
5. **Phase 5: Final Comprehensive Synthesis & Master Editorial Review**
   - Adopt the *Master Biblical Writer* persona to harmonize findings into a publication-quality manuscript.
`;
  }

  if (uri === "berean://workflows/image") {
    return `# Biblical Visual & Image Generation Workflow

## Objective
Generate historically faithful, reverent, and aesthetically rich biblical illustrations, archaeological site reconstructions, and sermon slide visuals.

## Guidelines
1. **Historical & Theological Reverence**: Maintain historical accuracy in Ancient Near East architecture, attire, and geography.
2. **Visual Lighting & Atmosphere**: Use volumetric lighting, chiaroscuro, cinematic depth of field, and rich color palettes.
3. **Composition**: Ensure clean focal points suitable for presentation slides or study manuscripts.
4. **Integration**: Reference the generated image in your study manuscript using standard markdown links.
`;
  }

  if (uri === "berean://workflows/docx") {
    return `# Microsoft Word (.docx) Export Workflow

## Objective
Compile markdown study manuscripts into styled, publication-ready Microsoft Word documents.

## Standards
1. **Native Markdown Tables**: Ensure all tables use standard markdown syntax without unescaped pipes or broken rows.
2. **Standard Headings**: Use proper H1 (#), H2 (##), and H3 (###) hierarchy.
3. **Typography**: Ensure no raw LaTeX math blocks; use standard Unicode symbols (→, ⇒, •).
4. **Scripture Tags**: Verify all quotes have explicit version tags (e.g. \`[Romans 8:28 (BSB)]\`).
5. **Execution**: Run \`pandoc <input.md> -o <output.docx>\` or the \`/docx\` workflow command.
`;
  }

  if (uri === "berean://personas/all") {
    return JSON.stringify({
      total_personas: Object.keys(BEREAN_PERSONAS).length,
      personas: Object.values(BEREAN_PERSONAS).map(p => ({
        name: p.name,
        description: p.description,
        instructions: p.instructions
      }))
    }, null, 2);
  }

  if (uri === "berean://canon/protestant") {
    const books = OFFICIAL_BOOK_NAMES.slice(1).map((name, idx) => ({
      book_number: idx + 1,
      name,
      testament: idx + 1 <= 39 ? "Old Testament" : "New Testament"
    }));
    return JSON.stringify({ canon: "Protestant", total_books: 66, books }, null, 2);
  }
  
  if (uri === "berean://reading-plans/mcheyne") {
    return JSON.stringify({
      name: "M'Cheyne Daily Bible Reading Plan",
      description: "Classic 4-reading daily plan covering OT once, NT/Psalms twice."
    }, null, 2);
  }

  return null;
}

