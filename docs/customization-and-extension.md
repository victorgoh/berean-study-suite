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

Update the Explorer configuration when exposing a new endpoint to human users. Avoid hard-coded tool counts; clients should discover the active catalog through MCP `tools/list` or `get_available_resources`.
