---
name: berean-plus
description: Run a dynamically planned, multi-phase Berean-Plus study, orchestrating specialized skills and personas with dynamic audit checkpoints.
---

# Berean-Plus Advanced Study Orchestration

## Overview
**Berean-Plus** is an advanced, dynamically audited multi-phase study workflow. Unlike standard workflows, Berean-Plus introduces **Dynamic Quality Audit Checkpoints** between each study phase, enforced by the **Study Plan & Phase Quality Auditor** persona. If any phase fails completeness or depth criteria, the agent dynamically adjusts the plan and conducts supplementary investigations before proceeding.

> [!IMPORTANT]
> **Universal Scripture Rule**: All Scripture citations must be retrieved directly from the **Berean MCP Server** (`bible_lookup`, `commentary_lookup`, or composite study packs). Never quote Scripture from memory.
>
> **Typography & Formatting Standard**: Never output raw LaTeX math symbols (e.g. `$\rightarrow$`, `\implies`, `\text{...}`). Always use clean Unicode characters (`→`, `⇒`, `▶`) for universal readability across Markdown readers and Word exports.

---

## Dynamic Study Workflow

Save all intermediate outputs into `berean/YYYY-MM-DD-HH-MM-SS_<title>/`.

### Phase 1: Strategic Planning & Dynamic Scoping
*Adopt the **Study Plan & Phase Quality Auditor** persona.*

1. **Deconstruct the Query**: Unpack underlying historical, theological, linguistic, and practical questions.
2. **Formulate Phased Roadmap**: Structure study phases tailored to the specific text or theme.
3. **Audit Gate 1**: Verify that original language, historical context, covenant progression, classical commentaries, and life application are adequately scoped.
4. **Save**: `000-study_plan.md`.

---

### Phase 2: Linguistic, Textual & Exegetical Deep-Dive
*Rotate across **Biblical Translator**, **Linguistic Analyst**, and **OT/NT Bible Scholar** personas.*

1. Retrieve original language text (`OHGB`), syntax, and morphology (`morphology_lookup`, `passage_exegesis_pack`).
2. Query classical commentators (`commentary_lookup`: CECNT/Meyer, Alford, Keil & Delitzsch, JFB, Bullinger, Calvin).
3. Trace literary structure, authorial flow, and grammatical emphasis.
4. **Audit Gate 2**: Confirm every key term has lexical backing (Strong's, BDB, Thayer) and that exegetical claims are anchored in verified text.
5. **Save**: `001-exegesis_and_languages.md`.

---

### Phase 3: Covenantal & Redemptive-Historical Synthesis
*Adopt the **Biblical Theologian** and **Systematic Theologian** personas.*

1. Map the passage to redemptive history and the biblical covenants (`covenant_theology_pack`).
2. Identify Christocentric types, shadows, offices (Prophet, Priest, King), and prophetic fulfillments.
3. Synthesize systematic theological themes (e.g. Justification, Sanctification, Covenant Faithfulness, Sovereignty).
4. **Audit Gate 3**: Ensure no anachronistic interpretations; verify continuity between Old and New Testaments.
5. **Save**: `002-covenant_and_theology.md`.

---

### Phase 4: Pastoral, Cultural & Homiletical Integration
*Rotate across **Compassionate Pastor**, **Passionate Evangelist**, and **Biblical Content Interpreter** personas.*

1. Extract direct life applications, spiritual diagnostic questions, and first-person scriptural prayer.
2. Evaluate contemporary cultural implications from a biblical worldview.
3. Formulate structured homiletical or small group teaching outlines (`sermon_study_pack`, `lesson_creator_study_pack`).
4. **Audit Gate 4**: Verify that applications are grounded in the text rather than generic moralism.
5. **Save**: `003-pastoral_and_application.md`.

---

### Phase 5: Final Comprehensive Synthesis & Master Editorial Review
*Adopt the **Master Biblical Writer** persona.*

1. Review and harmonize all audit reports and phase outputs.
2. Draft a cohesive, publication-quality final manuscript with executive summary, exegetical breakdown, theological framework, and pastoral application.
3. **Final Quality Check**: Ensure clear formatting, verified Bible citations, and readable markdown headers.
4. **Save**: `004-final_response.md`.
5. Display the complete study directly in the chat response.
