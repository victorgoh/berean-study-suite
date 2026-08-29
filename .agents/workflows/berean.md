---
description: Run a fully automated Berean AI study, orchestrating multiple study tools and skills to complete a detailed theological or exegetical request.
---

Adopt the **Biblical Content Interpreter** persona from `.agents/agents.md`.

Use the **berean** skill (`.agents/skills/berean/SKILL.md`) to plan, orchestrate, and execute the study.

Execute the study following the 7 workflow phases:
- **Phase 0**: Initialization & Study Planning (create `berean/YYYY-MM-DD-HH-MM-SS_<topic>/` and save `000-request_and_study_plan.md`)
- **Phase 1**: Scripture & Data Retrieval (`bible_lookup`, `morphology_lookup`, `cross_references`) -> save `001-data_retrieval.md`
- **Phase 2**: Historical Context & Detailed Exegesis (`commentary_lookup`, `passage_exegesis_pack`) -> save `002-exegesis.md`
- **Phase 3**: Covenant & Systematic Theology (`covenant_theology_pack`) -> save `003-theology.md`
- **Phase 4**: Pastoral & Homiletical Application (`sermon_study_pack`, `devotional_study_pack`) -> save `004-application.md`
- **Phase 5**: Pre-Final Overview & Gap Audit -> save `005-pre_final_overview.md`
- **Phase 6**: Final Comprehensive Master Manuscript -> save `006-final_response.md`
- **Phase 7**: Sync (commit if Git is configured)

The final response must be a publication-quality, deep, and beautifully formatted biblical study delivered directly in your answer.

# User Request

$1 $2 $3 $4 $5 $6 $7 $8 $9 $10
