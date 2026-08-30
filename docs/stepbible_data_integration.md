# 🏛️ STEPBible Data Integration & Deployment Guide

This guide explains how to compile, ingest, and deploy **STEPBible.org datasets** (TBESG/TBESH Lexicons, Tyndale Open Study Notes, Septuagint alignment, and OT in NT citations) into the **Berean Study Suite** for both local offline use and Cloudflare edge deployment.

---

## 1. Overview of STEPBible Datasets

[STEPBible.org](https://www.stepbible.org/) (an initiative of Tyndale House, Cambridge) provides high-quality, academic-grade original language research data under open-access Creative Commons licensing:

| Dataset | Format / Source | Description | Berean Tool Integration |
| :--- | :--- | :--- | :--- |
| **TBESG (Greek)** | Tab-separated TSV / STEPBible GitHub | Translators' Brief Lexicon of Extended Greek Strong's with grammatical parsing, transliterations, and nuanced definitions. | `lexicon_lookup`, `word_study_pack`, `passage_exegesis_pack` |
| **TBESH (Hebrew)** | Tab-separated TSV / STEPBible GitHub | Translators' Brief Lexicon of Extended Hebrew/Aramaic Strong's with root etymologies and lexical senses. | `lexicon_lookup`, `word_study_pack`, `passage_exegesis_pack` |
| **Tyndale Study Notes (TNotes)** | Curated SQLite Commentary | Concise, high-density, historical-grammatical notes by Tyndale House, Cambridge scholars (CC BY-SA 4.0). | `commentary_lookup`, `sermon_study_pack`, `passage_exegesis_pack` |
| **Septuagint (LXX) & Variants** | SQLite & D1 Indexes | Greek Septuagint text, Brenton English translation, and Masoretic-Septuagint textual divergences. | `septuagint_lookup`, `septuagint_study_pack` |
| **OT Quotations in NT** | SQLite & D1 Indexes | Verbatim Hebrew Masoretic, Greek LXX, and Greek NT comparative alignment for apostolic quotations. | `ot_quotations_lookup`, `ot_in_nt_study_pack` |
| **Biblical Entities & Units** | JSON / SQLite Lookup | Disambiguation profiles for biblical persons/places and conversions for ancient currency, weights, and measures. | `entity_disambiguation`, `convert_ancient_units` |

---

## 2. Compiling STEPBible Datasets

All compilation scripts are provided in `berean-mcp/scripts/`:

### A. Compile Greek & Hebrew Lexicons (`prepare_step_lexicon.py`)
Downloads the raw TBESG and TBESH data files directly from the official STEPBible-Data repository, strips raw markup, normalizes Greek/Hebrew typography, and compiles both a standalone SQLite database and a Cloudflare D1 SQL import file:

```bash
cd berean-mcp
python3 scripts/prepare_step_lexicon.py
```

* **Outputs Generated**:
  * `data/lexicons/step_lexicon.sqlite` *(Local / R2 SQLite lookup)*
  * `data/lexicons/step_lexicon_d1.sql` *(Cloudflare D1 batch SQL schema and rows)*

### B. Compile Tyndale Open Study Notes (`prepare_tnotes.py`)
Compiles Tyndale study notes into the standard Berean SQLite commentary format (`Commentary` table with `Book`, `Chapter`, `Verse`, `Content`):

```bash
python3 scripts/prepare_tnotes.py
```

* **Outputs Generated**:
  * `data/commentaries/TNotes.commentary`

### C. Compile Septuagint & OT in NT Datasets
```bash
python3 scripts/prepare_lxx.py
python3 scripts/prepare_ot_in_nt.py
python3 scripts/prepare_entities_and_units.py
```

---

## 3. Deployment Instructions

### Deployment Option 1: Cloudflare Edge (Workers + D1 + R2)

#### Step 1: Import STEPBible Lexicon into Cloudflare D1 (`reference_db`)
The D1 `reference_db` database holds the high-speed index for Strong's and Extended Strong's lookups:

```bash
# Execute against the remote Cloudflare D1 database:
npx wrangler d1 execute biblemate-reference --remote --file=data/lexicons/step_lexicon_d1.sql
```

*(For local D1 development testing, replace `--remote` with `--local`)*

#### Step 2: Upload SQLite Datasets to Cloudflare R2
Upload the compiled commentary and lexicon SQLite files to your Cloudflare R2 bucket (`biblemate-data`):

```bash
# Upload TNotes commentary and auxiliary files
python3 scripts/upload_auxiliary_to_r2.py
```

Or upload a single commentary directly via Wrangler:
```bash
npx wrangler r2 object put biblemate-data/commentaries/cTNotes.commentary --file=data/commentaries/TNotes.commentary --remote
```

#### Step 3: Deploy the Worker
```bash
npm run typecheck
npx wrangler deploy
```

---

### Deployment Option 2: 100% Local & Offline

For local execution with Stdio or Local HTTP on `localhost:7860`:

1. Copy the generated `step_lexicon.sqlite` to `~/.biblemate/data/lexicons/step_lexicon.sqlite` (or `berean-mcp/data/lexicons/step_lexicon.sqlite`).
2. Copy `TNotes.commentary` to `~/.biblemate/data/commentaries/cTNotes.commentary`.
3. Start the MCP server:
   ```bash
   npm run start:stdio
   # or
   npm run start:http
   ```

---

## 4. Verification & Testing

Verify that the STEPBible datasets and tools are functioning correctly:

```bash
cd berean-mcp

# 1. Test STEPBible Lexicon (Greek & Hebrew extended Strong's lookups)
npx tsx scripts/test_step_lexicon.ts

# 2. Test Tyndale Study Notes commentary lookup
npx tsx scripts/test_tnotes.ts

# 3. Test Septuagint & OT in NT engines
npx tsx scripts/test_septuagint.ts
npx tsx scripts/test_ot_in_nt.ts
npx tsx scripts/test_entities_and_units.ts

# 4. Run the full 27+ tool test suite
npm test
```

---

## 5. Usage Examples

### 1. Extended Greek Strong's Lookup (TBESG)
```json
{
  "strongs": "G2889",
  "lexicon": "step"
}
```
*Returns lemma `κόσμος` (kosmos), morphological class, English gloss, and full STEPBible definition.*

### 2. Disambiguated Hebrew Strong's Lookup (TBESH)
```json
{
  "strongs": "H7225G",
  "lexicon": "step"
}
```
*Disambiguates contextual Hebrew senses for `רֵאשִׁית` (reshit).*

### 3. Querying Tyndale Study Notes via `commentary_lookup`
```json
{
  "commentator": "TNotes",
  "reference": "Genesis 1:1"
}
```
*(Also accessible via alias `Tyndale`)*

---

## 6. Licensing & Attribution

* **TBESG & TBESH Lexicons**: Distributed under **Creative Commons Attribution (CC BY 4.0)** by [STEPBible.org](https://www.stepbible.org/).
* **Tyndale Open Study Notes (TNotes)**: Distributed under **Creative Commons Attribution-ShareAlike (CC BY-SA 4.0)** by Tyndale House, Cambridge.
