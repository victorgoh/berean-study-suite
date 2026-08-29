# Universal Berean Scripture & Study Rules

> [!IMPORTANT]
> **Universal Scripture Retrieval Rule**: Whenever you or any agent persona need to quote, reference, or compare Bible verse content in a response, you **MUST** run the `berean` MCP server (`bible_lookup` or composite study pack tools) to retrieve the exact verse text. Do not quote scripture passages from memory. This ensures absolute accuracy and consistency.

> [!IMPORTANT]
> **Universal Study Output Saving Rule**: Whenever you execute any Bible-related study, sermon, devotional, or analysis, you **MUST** save the complete final study output to a file in the `berean/` directory using the `write_to_file` tool.
> - Filename format: `berean/berean_YYYY-MM-DD-HH-MM-SS_<descriptive_name>.md`.
> - Always confirm the exact path of the saved file to the user in your final chat response.

---

## ⚡ High-Speed MCP Study Packs

When fulfilling user requests, prioritize the high-speed composite MCP tools:
- **`/sermon`**: Call `bible_lookup` / `sermon_study_pack` (Scripture + Morgan + Simeon + Biblical Illustrator + Trapp + Xrefs).
- **`/devotion`**: Call `devotional_study_pack` (Scripture + Maclaren + Ryle/Spurgeon/Meyer + Barnes + Promises).
- **`/insights`**: Call `passage_exegesis_pack` (BSB + OHGB Greek/Hebrew + Morphology + KD/Meyer + Alford + Bullinger).
- **`/theology`**: Call `covenant_theology_pack` (Calvin + Gill + ISBE + Canonical Xrefs).
- **`/prayer`**: Call `prayer_guide_study_pack` (Spurgeon/Ryle + Wesley + Promises for 1st-person ACTS prayer).
- **`/lesson`**: Call `lesson_creator_study_pack` (Ellicott + Ironside + Barnes Remarks + Chapter Summary).
- **`/study`**: Call `commentary_study_pack` (Custom multi-commentary bundler across 29 commentators).
