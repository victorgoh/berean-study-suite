# Customization and Extension

Customize the project by changing the resource catalog, adding data, extending services, or adapting the Explorer.

## Add resources

Bible versions, commentaries, lexicons, dictionaries, and related datasets should be converted into the SQLite schema expected by the corresponding service. Record the source, license, storage key, and validation result in the resource manifest before deployment.

See:

- [Academic datasets and provenance](shared-academic-datasets.md)
- [Resource data runbook](agent-resource-data-runbook.md)
- [STEPBible integration guide](agent-stepbible-data-integration.md)

## Extend the server

- Add a service for the new data shape. Report failures with the typed helpers in `src/services/errors.ts` (`invalidRequest`, `notFound`, `dependencyUnavailable`, `internalError`) so REST and MCP return the right status and error code.
- Add the argument schema to `src/mcp/tools.ts` and one `defineTool(...)` entry to `src/mcp/toolRegistry.ts` with a title, a plain description of what the tool returns, its tier (`specialized` or `study_pack`), its MCP error policy and the handler. That entry registers the MCP tool, the REST route and the `/health` listing; tool counts are derived from it.
- Add a `TOOL_DOCS` entry (tag, summary, example request) in `src/ui/openapi.ts`; the OpenAPI path and request schema are generated from the registry. If humans should see the tool, add it to the Explorer configuration as well. `npm run test:registry` fails if either drifts from the registry.
- Add the resource to catalog discovery.
- Define exact missing-resource and missing-reference behavior.
- Keep focused lookups separate from human-oriented Study Packs.
- Add tests and run `npm run typecheck` and `npm run test:registry` before deployment. Tests that need only a few chapters of Scripture can use the sample Bibles in `test/fixtures`, so they also run in GitHub Actions (`npm run test:ci`); guard checks that need the full databases with `FULL_DATA`.

## Extend the interface

Update the Explorer configuration when exposing a new endpoint to human users. Assign the tool to a reader-oriented category and mark specialist tools for the secondary **More study tools** list. Keep payload construction, contextual guidance, URL-state restoration, and missing-result behavior consistent with existing tools.

Keep the Explorer accessible: colours come from the theme tokens at the top of `src/ui/explorer.ts` (text needs 4.5:1 contrast and form borders and focus outlines 3:1, in both themes; `npm run test:explorer` checks this), every control needs a visible label or `aria-label`, and pop-ups must work from the keyboard and return focus when closed.

Run `npm run test:explorer` after changing Explorer structure, tool metadata, request handling, result controls, or print behavior. Avoid hard-coded tool counts in documentation; clients should discover the active catalog through MCP `tools/list` or `get_available_resources`.

## Ideas for optional extensions

Possible extensions include custom Bible versions or commentaries, additional MCP tools, semantic search, presentation-generation workflows, audio generation, or personal-notes integration. Each extension should be scoped separately, respect source licensing, and avoid turning the retrieval server into the AI composition layer.

Example request for a custom commentary:

> Convert this permitted source into the project's commentary SQLite schema, record its provenance and license, register it in the resource catalog, add a focused lookup test, and prepare it for local use before proposing any Cloudflare upload.
