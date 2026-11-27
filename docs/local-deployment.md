# Local Deployment

Run `berean-mcp` locally for development, offline use, or a local MCP client.

## Requirements

- Node.js and npm
- Python 3 for optional resource preparation scripts
- Local resource files (SQLite databases and JSON indexes); see [Where local data is read from](#where-local-data-is-read-from)

```bash
cd berean-mcp
npm install
npm run typecheck
```

## Run the server

For a local HTTP/REST and Explorer server:

```bash
npm run start:http
```

For a local stdio MCP server:

```bash
npm run start:stdio
```

For a local MCP client configuration, point the client at the local stdio script:

```json
{
  "mcpServers": {
    "berean-local": {
      "command": "npx",
      "args": ["-y", "tsx", "scripts/run_local_stdio.ts"],
      "cwd": "/path/to/berean-study-suite/berean-mcp"
    }
  }
}
```

The local HTTP server exposes the Explorer at `http://localhost:7860/`, MCP at `/mcp`, and API documentation at `/docs` and `/swagger`. Set `PORT` to use another port (for example `PORT=7861 npm start`). Both local servers use the AI tool profile by default; set `MCP_PROFILE=human` to also expose the Study Pack tools over MCP.

The local server runs the same Worker code as the Cloudflare deployment, so after pulling or changing code, stop it with Ctrl+C and start it again; a running server keeps the code it started with.

## Where local data is read from

In Cloudflare the Worker reads every resource from the `BIBLEMATE_DATA` R2 bucket. Locally, the runners and tests provide a read-only, filesystem-backed stand-in for that bucket (`scripts/lib/localEnv.ts`). A resource key such as `bibles/BSB.bible` is looked up in these directories, in order:

1. `$DATA_DIR`
2. `$BIBLEMATE_DATA`
3. `~/biblemate/data`
4. `./data` and `../data` (relative to where you run the command)
5. `~/.biblemate/data`
6. `~/berean/data`
7. The current directory (for keys such as `data/lookup/*.json`, which live in `berean-mcp/data/lookup`)

Lexicon files are also tried by file name under each directory's `lexicons/` folder. To point everything at one place, set `DATA_DIR`:

```bash
DATA_DIR=/path/to/data npm start
```

Local behavior depends on which SQLite and data files are present. Missing resources should be reported by the relevant service; use the resource manifest and preparation runbook when adding data.

## Verify

```bash
npm run typecheck
npm run test:mcp-http
npm run test:registry
```

| Command | What it checks | Needs local data |
|---|---|---|
| `npm run test:ci` | Typecheck, `test:mcp-http`, `test:registry` and `test:explorer` against the sample Bibles in `test/fixtures`; checks that need the full databases are skipped | None (GitHub Actions runs this) |
| `npm run test:mcp-http` | Stateless `/mcp`, concurrent calls, rate-limit metering (with stand-in limiters) | A few Bible files |
| `npm run test:registry` | Tool registry, MCP tool list and annotations, REST validation and error codes, paging, drift against the OpenAPI spec and Explorer | Bibles, commentaries, cross-references, lexicons |
| `npm run test:phase4`, `test:commentary-ranges`, `test:explorer` | Explorer and commentary behaviour | Some commentaries |
| `npm test` | All of the above plus `test:ecf` | Includes `data/commentaries/cECF_*.commentary` |

GitHub Actions (`.github/workflows/berean-mcp.yml`) runs `npm run test:ci` on every push to `main` and every pull request that touches `berean-mcp/`. The sample Bibles hold a few chapters of BSB, KJV, NET and WEB; rebuild them with `python3 scripts/build_test_fixtures.py` if a test needs another chapter.

`npm test` stops at the first failing step, so it fails early if the ECF commentary shards are not present. Focused service scripts under `scripts/` (for example `npx tsx scripts/test_all_services.ts`) validate individual resources such as STEPBible lexicons or Tyndale Open Study Notes; a test that reports a missing resource usually means that data file is not in the search path above.

See [customization and extension](customization-and-extension.md) for preparing additional resources.
