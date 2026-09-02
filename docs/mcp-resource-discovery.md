# MCP Resource Discovery

AI agents should discover the current resource identifiers before making source-specific calls.

1. Call `get_available_resources` with `category: "commentaries"` or `category: "lexicons"`.
2. Use the returned canonical `key`/`code` or any returned alias.
3. Use the tool schemas from `tools/list` for exact parameter names.

## Resource parameters

| Tool | Required parameter | Resource-selection parameter |
| --- | --- | --- |
| `commentary_lookup` | `reference` | `version` |
| `commentary_study_pack` | `reference` | `commentators` (array) |
| `lexicon_lookup` | `strongs_number` | `lexicon` |
| `theological_dictionary` | `term` | `source` |

`get_available_resources` returns commentary aliases, scope, and descriptions, so agents should not rely on a hard-coded commentary list. For example, `ECF` and `Catena` are current commentary keys.

Example:

```json
{"category":"commentaries"}
```

Then call:

```json
{"reference":"Psalm 63:1","version":"ECF"}
```
