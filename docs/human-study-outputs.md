# Study Outputs Reference Guide

For pastors, theologians, and biblical scholars, having instant access to editable, permanent files is essential. Unlike standard chat assistants where research disappears when the session ends or gets buried in temporary artifact caches, the **Berean Study Suite** generates research directly in your chat response and can save study manuscripts, sermon outlines, high-resolution visual aids, and publication-ready Microsoft Word (`.docx`) documents to your workspace.

---

## 📁 On-Demand Output Organization

When you save studies, generate images, or export manuscripts, files are organized neatly on-demand:

```
workspace-root/
├── [study-name].md                 # Standalone study manuscripts
├── studies/                        # (Optional) Grouped research folders
│   └── YYYY-MM-DD-HH-MM-SS_topic/  # Multi-phase orchestrated studies
│       ├── 000-study_plan.md
│       ├── 001-exegesis.md
│       ├── 002-theology.md
│       ├── 003-application.md
│       └── 004-final_response.md
├── images/                         # (Auto-created) Generated biblical illustrations
│   └── YYYY-MM-DD-HH-MM-SS_description.png
└── export/                         # (Auto-created) Word document exports (.docx)
    └── YYYY-MM-DD-HH-MM-SS_document.docx
```

---

## ✍️ How Outputs Are Saved & Formatted

### 1. Direct Chat Delivery & Standalone Manuscripts
Every study deliverable is formatted according to strict **Berean Typography Standards** (`berean://rules/typography`):
- **Zero Raw LaTeX Math**: Uses standard Unicode symbols (`→`, `⇒`, `▶`, `≈`) instead of raw math syntax (`\rightarrow`).
- **No Fragile ASCII Boxes**: Uses standard Markdown tables and linear flows for mobile and Word export compatibility.
- **Explicit Translation Tags**: All quotes are explicitly tagged (e.g. `[Romans 8:28 (BSB)]`).

### 2. Multi-Phase Orchestrated Studies (`/berean` & `/berean-plus`)
When executing a full multi-phase study via `/berean` or `/berean-plus`, each research phase is documented step-by-step:
- **Phase 1**: Strategic Planning & Dynamic Scoping
- **Phase 2**: Linguistic, Textual & Exegetical Deep-Dive (Greek/Hebrew morphology, lexicons, classical commentators)
- **Phase 3**: Covenantal & Redemptive-Historical Synthesis (Typology, Christocentric progression)
- **Phase 4**: Pastoral, Cultural & Homiletical Integration (Small group questions, 1st-person ACTS prayers)
- **Phase 5**: Final Comprehensive Publication-Quality Manuscript

### 3. AI Biblical Illustrations (`/image`)
When generating illustrations for sermon slides, bulletin covers, or study guides:
- **Format**: `images/YYYY-MM-DD-HH-MM-SS_description.png` (or widescreen 16:9)
- **Visual Standards**: Governed by `berean://workflows/image` (historically faithful Ancient Near East architecture, reverent lighting, zero caricatures).

### 4. Word Document Export (`/docx`)
To convert any Markdown study output into a styled Microsoft Word document:
```bash
/docx my_study_manuscript.md
```
- **Format**: `export/YYYY-MM-DD-HH-MM-SS_description.docx`
- **Quality**: Compiles cleanly with Pandoc or python-docx, preserving headings, blockquotes, and tables for immediate church printing and sharing.

---

## 🛠️ Benefits for Pastoral & Scholarly Workflows

1. **Fully Editable Text**: All study manuscripts are standard Markdown (`.md`). You can open them in any editor (Antigravity, Cursor, VS Code, Obsidian) to modify outlines, add personal annotations, or build personal study vaults.
2. **Local-First & Offline Access**: All files are written directly to your local drive, ensuring permanent offline access.
3. **One-Command Word Conversion (`/docx`)**: Instantly bridge the gap between AI markdown research and professional church document printing.

