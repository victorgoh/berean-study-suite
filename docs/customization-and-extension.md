# Customization and Extension

Customize the project by changing the resource catalog, adding data, extending services, or adapting the Explorer.

## Add resources

Bible versions, commentaries, lexicons, dictionaries, and related datasets should be converted into the SQLite schema expected by the corresponding service. Record the source, license, storage key, and validation result in the resource manifest before deployment.

See:

- [Academic datasets and provenance](shared-academic-datasets.md)
- [Resource data runbook](agent-resource-data-runbook.md)
- [STEPBible integration guide](agent-stepbible-data-integration.md)

## Extend the server

- Add a service for the new data shape.
- Add a schema and tool registration.
- Add the resource to catalog discovery.
- Define exact missing-resource and missing-reference behavior.
- Keep focused lookups separate from human-oriented Study Packs.
- Add tests and run `npm run typecheck` before deployment.

## Extend the interface

Update the Explorer configuration when exposing a new endpoint to human users. Assign the tool to a reader-oriented category and mark specialist tools for the secondary **More study tools** list. Keep payload construction, contextual guidance, URL-state restoration, and missing-result behavior consistent with existing tools.

Run `npm run test:explorer` after changing Explorer structure, tool metadata, request handling, result controls, or print behavior. Avoid hard-coded tool counts in documentation; clients should discover the active catalog through MCP `tools/list` or `get_available_resources`.

## Ideas for optional extensions

Possible extensions include custom Bible versions or commentaries, additional MCP tools, semantic search, presentation-generation workflows, audio generation, or personal-notes integration. Each extension should be scoped separately, respect source licensing, and avoid turning the retrieval server into the AI composition layer.

Example request for a custom commentary:

> Convert this permitted source into the project's commentary SQLite schema, record its provenance and license, register it in the resource catalog, add a focused lookup test, and prepare it for local use before proposing any Cloudflare upload.
