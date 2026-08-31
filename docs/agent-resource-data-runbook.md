# Bible Resource Inventory, Provenance, and Deployment Runbook

> **TL;DR for humans**
>
> This AI-written runbook explains how the Berean Study Suite should identify, verify, convert, and deploy Bible-related resources. It separates BibleMateData resources from STEPBible/Tyndale resources and flags files whose source or license is uncertain. It covers both local development and Cloudflare storage: **R2** is Cloudflare object storage for resource files, while **D1** is Cloudflare’s serverless SQLite database. Before uploading or redistributing any file, verify its source, license, schema, checksum, and intended destination.
>
> The detailed inventory, commands, manifest structure, validation requirements, and AI prompts below are primarily intended for AI programming agents implementing or maintaining this workflow. Treat unresolved provenance and licensing entries as requiring human review.

## Purpose

This runbook establishes one auditable inventory for resources used by the Berean MCP server. It separates:

1. **BibleMateData** package resources, normally found under `~/biblemate/data/`.
2. **STEPBible** resources, downloaded or generated from STEPBible / Tyndale House sources.
3. **Other or unverified resources**, which must be confirmed before distribution.

The rule is: do not infer provenance from a filename. Every uploaded object needs a source URL, license, source revision/date, SHA-256 checksum, schema version, and destination key.

## Source authorities

| Source | Canonical source to record | Typical license / review |
|---|---|---|
| BibleMateData | BibleMateData package/distribution actually used by the project; record package version, archive checksum, and download URL | Verify package-level redistribution terms; do not assume every bundled file has the same license |
| STEPBible | [STEPBible](https://www.stepbible.org/) and [STEPBible-Data](https://github.com/STEPBible/STEPBible-Data) | Record the exact dataset license and required attribution; current project documentation identifies Tyndale datasets as CC BY / CC BY-SA |
| Other | The actual upstream source, not the converter or mirror | Flag for manual legal/provenance review |

## Available module catalogs

- [Bible versions available](https://github.com/eliranwong/UniqueBible/wiki/Bible-Modules)
- [Commentaries available](https://github.com/eliranwong/UniqueBible/wiki/Commentary-Modules)

## Initial inventory and classification

The following is the starting manifest inferred from the current repository, registry, and upload scripts. It is a planning inventory, not proof that every object currently exists in R2.

### BibleMateData package candidates

These are referenced by `upload_auxiliary_to_r2.py`, `sync_data_to_r2.py`, or the runtime’s `~/biblemate/data` fallback and should be reconciled against the actual BibleMateData package:

| Local relative path | R2 key | Runtime feature | Status |
|---|---|---|---|
| `bibles/*.bible` | `bibles/<file>` | Bible lookup / search | BibleMateData candidate; verify exact package source |
| `data/exlb3.data` | `data/exlb3.data` | Topics / encyclopedia fallback | BibleMateData candidate; verify |
| `data/biblePeople.data` | `data/biblePeople.data` | Character lookup | BibleMateData candidate; verify |
| `data/book_analysis.data` | `data/book_analysis.data` | Book analysis | BibleMateData candidate; verify |
| `data/chapter_summary.data` | `data/chapter_summary.data` | Chapter summaries | BibleMateData candidate; verify |
| `collections3.sqlite` | `collections3.sqlite` | Promises / collections | BibleMateData candidate; verify |
| `data/lookup/*.json` | same R2 key | Topic, character, dictionary, encyclopedia, parallel, promise, name, chronology, daily reading indexes | BibleMateData candidate; verify |
| `commentaries/c*.commentary` | same R2 key | Commentary lookup | BibleMateData candidate; verify each file’s original source/license |
| `commentaries/TNotes.commentary` / `cTNotes.commentary` | same R2 key | Tyndale notes | Likely STEPBible/Tyndale; do not classify as BibleMateData without package manifest evidence |

### STEPBible / Tyndale candidates

| Resource | Local output | R2 or D1 destination | Status |
|---|---|---|---|
| TBESG + TBESH | `data/lexicons/step_lexicon.sqlite` | R2 fallback and/or D1 `step_lexicon` | STEPBible; prepare with `prepare_step_lexicon.py` |
| TBESG + TBESH D1 export | `data/lexicons/step_lexicon_d1.sql` | Remote D1 `biblemate-reference` | STEPBible; generated derivative, not an independent source |
| Tyndale Open Study Notes | `data/commentaries/TNotes.commentary` | `commentaries/TNotes.commentary` | STEPBible/Tyndale; prepare with `prepare_tnotes.py` |
| Tyndale Open Bible Dictionary | `data/dictionaries/Tyndale.dictionary` or package-specific equivalent | `data/dictionaries/Tyndale.dictionary` | STEPBible/Tyndale; verify exact filename and license |
| Entities and ancient units | generated JSON/SQLite outputs from `prepare_entities_and_units.py` | R2 and/or D1 | STEPBible/Tyndale candidate; record exact upstream files |
| LXX / OT-in-NT alignment | outputs from `prepare_lxx.py` and `prepare_ot_in_nt.py` | `bibles/LXX.bible` and reference keys | Provenance must be verified per input; do not automatically label all outputs STEPBible |

### Flagged: not demonstrably from BibleMateData or STEPBible

These need an explicit source record before being treated as either source:

| Resource | Why flagged |
|---|---|
| Classic commentaries (`cHenry`, `cCalvin`, `cGill`, `cBarnes`, `cMacL`, `cLange`, etc.) | The code lists them as public-domain works, but the exact digital edition/source and transformation history are not recorded |
| `Thayer`, `BDB`, `LSJ`, `MCGED`, `TBESH-D` | Registry entries do not establish which upstream editions produced the deployed files; several are not STEPBible datasets |
| `TNotes` | It is associated with STEPBible/Tyndale in documentation, but must be separated from unrelated BibleMateData package files and documented with its exact upstream release |
| LXX, Brenton, OHGB, OHGBi, morphology and cross-reference databases | Current code/docs do not give a complete source manifest for each artifact |

## Committed manifests

Commit the manifests and metadata, not large source databases. Use one authoritative JSON file with records like:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-08-31T00:00:00Z",
  "resources": [
    {
      "id": "bible-version-example",
      "sourceFamily": "<biblematedata|stepbible|other>",
      "sourceName": "<translation-or-edition-name>",
      "sourceUrl": "<exact-source-url>",
      "sourceRevision": "<commit-or-release>",
      "license": "Public domain (verify upstream metadata)",
      "localPath": "data/bibles/<CODE>.bible",
      "r2Key": "bibles/<CODE>.bible",
      "d1Database": null,
      "required": false,
      "sizeBytes": 0,
      "sha256": "<sha256>",
      "schema": "Verses(Book,Chapter,Verse,Scripture); Details(...)"
    }
  ]
}
```

Maintain two generated status views from the same manifest:

- `docs/agent-resource-manifest.json`: committed desired inventory and provenance.
- `docs/resource_status.local.json`: generated local presence/checksum report; do not commit if it contains machine-specific paths.
- `docs/resource_status.r2.json`: generated remote R2/D1 presence/checksum report; commit only if it contains no secrets and is intentionally used as a deployment record.

For each resource, distinguish `sourceFamily`, `sourceVerified`, `licenseVerified`, `required`, `localPresent`, `r2Present`, and `d1Present`. A missing optional file must not make the Worker fail.

## Preparation workflow

### Local-only Phase 2 commands

The repository includes a safe, manifest-driven local validator. These commands inspect local files, calculate checksums, run SQLite integrity checks, and print an R2 upload plan. They do not upload to R2, import into D1, delete files, or deploy Workers.

```bash
cd berean-mcp
npm run data:status
npm run data:validate
npm run data:upload-plan
```

Set `BEREAN_DATA_DIR` when the data lives outside the repository. Resources marked `needsReview` are intentionally skipped from the upload plan until a human verifies their provenance and license. A future remote uploader should consume the same manifest and require explicit human approval.

### Local preparation

1. Obtain the BibleMateData package and record its archive checksum and package version.
2. Obtain STEPBible source files from the official sources and record commit/release identifiers.
3. Run the existing preparation scripts where applicable:

   ```bash
   cd berean-mcp
   python3 scripts/prepare_step_lexicon.py
   python3 scripts/prepare_tnotes.py
   python3 scripts/prepare_lxx.py
   python3 scripts/prepare_ot_in_nt.py
   python3 scripts/prepare_entities_and_units.py
   ```

4. Convert every imported dataset to SQLite with explicit primary keys, indexes, UTF-8 text, and a metadata table containing source, license, version, and checksum.
5. Validate the SQLite output:

   ```bash
   sqlite3 data/lexicons/step_lexicon.sqlite 'PRAGMA integrity_check;'
   sqlite3 data/lexicons/step_lexicon.sqlite '.tables'
   npm run typecheck
   ```

6. Place local runtime files under the configured data root. Prefer one explicit variable, for example `BEREAN_DATA_DIR`, rather than relying on a mixture of `~/biblemate/data`, `.biblemate/data`, and repository-relative paths.

### Cloudflare preparation and upload

1. Run a manifest validator against the local data root.
2. Upload only records marked `upload: true` and only when `sourceVerified` and `licenseVerified` are true.
3. Use `--remote` for every production R2/D1 operation.
4. Upload SQLite files to R2 using their manifest keys.
5. Import only the D1-specific SQL outputs into the correct remote D1 database.
6. Download or HEAD-check every uploaded object and compare size/checksum where supported.
7. Run feature smoke tests against the deployed Worker.

Example commands:

```bash
npx wrangler r2 object put biblemate-data/<r2-key> --file=<local-file> --remote
npx wrangler d1 execute biblemate-reference --remote --file=<generated-sql>
npm run typecheck
npx wrangler deploy
```

Do not use the broad sync script for production until it is changed to require `--remote`, accept the manifest, and fail on required-file omissions.

## SQLite conversion requirements

Every converter should:

- preserve source text exactly unless normalization is documented;
- use stable numeric book IDs and a checked-in book map;
- define primary keys and indexes for the service query pattern;
- use parameterized inserts and transactions;
- reject duplicate or malformed verse/article keys;
- write a metadata table with source, URL, license, revision, generated-at, and input checksum;
- emit a conversion report with row counts, skipped rows, and warnings;
- run `PRAGMA integrity_check` and representative lookup tests.

For Bible text, the existing runtime-compatible minimum is:

```sql
CREATE TABLE Verses (
  Book INTEGER NOT NULL,
  Chapter INTEGER NOT NULL,
  Verse INTEGER NOT NULL,
  Scripture TEXT NOT NULL,
  PRIMARY KEY (Book, Chapter, Verse)
);
CREATE INDEX idx_verses_bcv ON Verses(Book, Chapter, Verse);
```

For commentary, preserve the schema expected by `commentaryService.ts`; do not invent a new schema without updating the service and tests together.

## AI prompts for database creation

### Bible text converter

> Convert the supplied Bible source into a SQLite database for the Berean MCP server. Do not paraphrase, summarize, modernize, or silently normalize the text. Map every verse to the canonical 1–66 numeric book ID using the supplied book map. Create `Verses(Book INTEGER, Chapter INTEGER, Verse INTEGER, Scripture TEXT, PRIMARY KEY(Book,Chapter,Verse))`, an index on `(Book,Chapter,Verse)`, and a `Details` table containing title, language, edition, source URL, source revision, license, input SHA-256, and generated timestamp. Reject duplicates, missing keys, invalid book IDs, and empty verse text. Produce a conversion report with counts by book and a list of all rejected rows. Run SQLite integrity checks and test Genesis 1:1, Psalm 23:1, John 3:16, and Revelation 22:21.

### Commentary converter

> Convert the supplied commentary source into the exact SQLite schema consumed by `berean-mcp/src/services/commentaryService.ts`. Preserve the original wording and attribution. Map references to canonical numeric Book/Chapter/Verse keys, support verse ranges according to the existing service behavior, add indexes for the lookup path, and add a metadata table containing title, author, source URL, edition/revision, license, input checksum, and generated timestamp. Do not fabricate commentary for missing verses. Report all unmapped references, duplicate keys, skipped records, and row counts. Run representative lookups for Genesis 1:1, Psalm 23:1, John 3:16, and Romans 8:28.

### STEPBible lexicon converter

> Convert the official STEPBible TBESG and TBESH source files into a normalized SQLite database and a separate D1-compatible SQL export. Preserve Strong’s identifiers, sub-lemmas, original-language text, transliteration, morphology, glosses, definitions, and attribution. Keep Greek and Hebrew entries distinguishable, preserve one-to-many senses, use stable keys and indexes for Strong’s lookup, record the exact STEPBible repository commit and license in metadata, and never merge conflicting entries silently. Produce row counts, collision reports, checksum metadata, SQLite integrity results, and sample lookups for G2889 and H7225G.

### Manifest and provenance auditor

> Inspect the supplied files and create a resource manifest. For every file, calculate size and SHA-256, identify its format and schema, determine the actual upstream source from accompanying metadata or repository history, classify it as BibleMateData, STEPBible/Tyndale, or OTHER/UNVERIFIED, and explain the evidence. Never infer provenance only from filenames. Mark missing source URLs, licenses, revisions, or attribution as `needs_review: true`. Generate separate local and remote deployment records without including secrets.

## Additional recommendations

Add these items to the implementation plan:

1. **Manifest-driven deployment CLI**: `data:validate`, `data:upload`, `data:verify`, and `data:status` commands.
2. **Required versus optional feature contracts**: the Worker starts with optional datasets missing; each feature returns a clear “resource unavailable” response.
3. **Remote health endpoint**: report resource IDs and availability, never credentials or private paths.
4. **Checksum and rollback policy**: upload immutable versioned keys, then update a small manifest pointer; retain the previous known-good set.
5. **Schema migrations**: version SQLite schemas and reject incompatible files before upload.
6. **License and attribution bundle**: publish `THIRD_PARTY_NOTICES.md` and retain each dataset’s license beside its manifest record.
7. **Size and memory gates**: record file sizes and shard large commentaries before Worker deployment; the current loader buffers SQLite objects in memory.
8. **CI smoke tests**: test one Bible, commentary, dictionary, lexicon, D1, and R2 lookup on every deployment.
9. **Security checks**: ensure R2 remains private, D1 is only reachable through intended Worker routes, and API authentication is tested separately from CORS.
10. **Source refresh schedule**: document when each dataset should be re-downloaded and how changes are reviewed.
