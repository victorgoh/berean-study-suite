# MCP Server Design Notes

Audience: AI programming agents; human review required.

## REST error contract

## MCP response contract

MCP tool calls use compact output by default to reduce context-window usage. A
tool may accept `output_mode` with these values:

- `compact`: bounded, structured output for AI processing (default)
- `standard`: structured output with a larger readable text rendering
- `full`: comprehensive human-readable rendering, subject to the server limit

MCP results expose `structuredContent` and also include serialized structured
JSON in a text content block for compatibility with clients that do not consume
`structuredContent`. Responses include `metadata.output_mode`,
`metadata.character_count`, and `metadata.truncated`. Responses are never
silently truncated. If a complete resource exceeds the selected limit, the
server returns `RESOURCE_TOO_LARGE` and identifies the resource size and
available alternatives. These are application conventions built on MCP's
standard `structuredContent` result field; they are not MCP-defined names.

## Human Explorer and AI tool profiles

The human Explorer and AI-facing MCP interface have different content policies:

The MCP server uses `MCP_PROFILE` to control tool exposure. The default is
`ai`; set `MCP_PROFILE=human` only for a human-oriented MCP connection that
needs Study Packs. The Explorer's REST routes are unaffected by this setting.
The sanitized Wrangler template declares `MCP_PROFILE=ai`; a human-oriented
MCP deployment must explicitly override that variable.

| Capability | Human Explorer | AI MCP interface |
|---|---|---|
| Multiple commentaries | Allowed for comparison | One commentary per request by default |
| Preferred commentary | Optional | Supported through the commentary parameter |
| Study Packs | Available | Not exposed by default |
| Output style | Full and readable | Compact and structured |
| Primary goal | Comprehensive research | Focused evidence retrieval |

Study Packs intentionally combine multiple sources and are optimized for human
reading. They should not be included in an AI-facing tool catalog
because their responses can consume substantial context and tokens. The AI
profile should expose granular lookup tools and allow the caller to select one
preferred commentary. This is an interface policy, not a restriction on the
underlying resource collection.

REST tool endpoints return HTTP status codes that reflect the outcome. MCP protocol responses remain MCP-compatible and are not changed by this REST contract.

Successful requests return HTTP `200` with the service result. Failures use this envelope:

```json
{
  "error": {
    "code": "INVALID_REFERENCE",
    "message": "Could not parse passage reference.",
    "retryable": false
  }
}
```

Standard mappings are:

| Condition | Status | Code |
|---|---:|---|
| Invalid JSON, reference, query, or resource identifier | 400 | `REQUEST_FAILED` or a specific validation code |
| Resource or passage unavailable | 404 | `RESOURCE_UNAVAILABLE` |
| R2/D1 dependency unavailable | 503 | `DEPENDENCY_UNAVAILABLE` |
| Request body too large | 413 | `REQUEST_TOO_LARGE` |
| Unexpected service failure | 500 | `INTERNAL_ERROR` |

The REST adapter centralizes error mapping in `restServiceResponse()` so services can continue returning their existing result shape during migration. New services should return structured errors with an explicit code, status, and retryability rather than relying on message matching.

Optional missing datasets should produce a controlled resource-unavailable response. They must not crash the Worker or make unrelated features unavailable.

## Anonymous rate limiting

The Worker applies Cloudflare Rate Limiting bindings to `/mcp` and `/tools/*` when deployed:

- 15 requests per 10 seconds per connecting IP (burst protection)
- 60 requests per minute per connecting IP for normal API traffic
- 15 requests per minute per connecting IP for MCP, commentary, search, and composite study-pack traffic

Exceeded limits return HTTP `429` with a JSON `RATE_LIMITED` error and `Retry-After`. The bindings are optional during local development; Cloudflare WAF rate-limiting rules should be added at the zone edge for broader distributed protection.
