# Local Deployment

Run `berean-mcp` locally for development, offline use, or a local MCP client.

## Requirements

- Node.js and npm
- Python 3 for optional resource preparation scripts
- Local resource databases under `berean-mcp/data/`

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

The local HTTP server exposes the Explorer at `http://localhost:7860/`, MCP at `/mcp`, and API documentation at `/docs` and `/swagger`.

Local behavior depends on which SQLite and data files are present. Missing resources should be reported by the relevant service; use the resource manifest and preparation runbook when adding data.

## Verify

```bash
npm run typecheck
npm run test:phase4
```

Focused service scripts under `scripts/` can be used when validating a specific resource, such as STEPBible lexicons or Tyndale Open Study Notes.

See [customization and extension](customization-and-extension.md) for preparing additional resources.
