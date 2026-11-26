# MCP Server Design Notes

Audience: AI programming agents; human review required.

## MCP response contract

Every MCP tool accepts two optional arguments that control response size:

- `output_mode` sets the size of one response: `compact` (about 12,000
  characters, the default), `standard` (about 32,000) or `full` (about
  100,000).
- `page` selects which part of a long result to return, starting at 1.

The text block always carries the readable Markdown result. When a result also
has machine-readable fields (for example `verses` from `bible_lookup`), they are
sent in `structuredContent` with `metadata.output_mode`,
`metadata.character_count` and `metadata.truncated`. Results that are only
Markdown are sent as text alone, because some clients (including Claude's apps)
show the model `structuredContent` instead of the text whenever it is present.

Results are never refused or silently cut for being long. A result larger than
the selected budget is split into pages at paragraph boundaries; each page ends
with a note such as "Part 1 of 3 of this result. To continue, call this tool
again with the same arguments and page: 2." Paged responses omit
`structuredContent`, which would repeat the same content. Asking for a page that
does not exist returns an error.

Tool errors start with the service error code and a hint, for example
`Error (RESOURCE_UNAVAILABLE): No verses found for Genesis 50:99 in BSB`,
followed by what to try next. The codes are the same as the REST codes below.
Every tool is annotated as read-only, non-destructive, idempotent and closed-world
(`readOnlyHint`, `destructiveHint: false`, `idempotentHint`, `openWorldHint: false`)
and has a short `title`.

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
| Output style | Full and readable | Markdown in size-bounded pages, plus structured data where available |
| Primary goal | Comprehensive research | Focused evidence retrieval |

Study Packs intentionally combine multiple sources and are optimized for human
reading. They should not be included in an AI-facing tool catalog
because their responses can consume substantial context and tokens. The AI
profile should expose granular lookup tools and allow the caller to select one
preferred commentary. This is an interface policy, not a restriction on the
underlying resource collection.

## Tool registry

Every tool is defined once in `berean-mcp/src/mcp/toolRegistry.ts`: name, title,
description, tier (catalog, study pack or specialized), Zod argument schema
(`src/mcp/tools.ts`), MCP error policy, legacy REST argument aliases and the
handler. That single list drives MCP registration and profile filtering, the
REST routes, the `/health` tool list and the MCP tool counts. The OpenAPI
document (`src/ui/openapi.ts`) and the Explorer configuration are still written
by hand; `npm run test:registry` fails if either lists a tool the registry does
not.

## Stateless MCP transport

`/mcp` implements Streamable HTTP without sessions. Each `POST` gets its own MCP
server and transport and no `mcp-session-id` is issued; a session id sent by a
client is ignored. This is deliberate: Cloudflare spreads requests across
isolates, so in-memory sessions created on one isolate are unknown on the next
and the MCP SDK rejects them with "Server not initialized".

- `POST /mcp`: JSON-RPC requests, answered as JSON. Malformed JSON returns
  JSON-RPC error `-32700`.
- `GET /mcp` with `Accept: text/event-stream` or a session id: `405` (no
  standalone event stream is offered, which the specification allows).
- Plain `GET /mcp` (for example from a browser): a short JSON status.
- `DELETE /mcp`: `405`, since there are no sessions to end.

## REST error contract

REST tool endpoints return HTTP status codes that reflect the outcome. MCP protocol responses remain MCP-compatible and are not changed by this REST contract.

Successful requests return HTTP `200` with the service result. Failures use this envelope:

```json
{
  "error": {
    "code": "REQUEST_FAILED",
    "message": "Could not parse passage reference: \"not a reference\"",
    "retryable": false
  }
}
```

Standard mappings are:

| Condition | Status | Code |
|---|---:|---|
| Body is not a JSON object | 400 | `INVALID_JSON` |
| Missing or wrong API key (only when `API_KEY` is set) | 401 | `UNAUTHORIZED` |
| Arguments fail the tool's schema (e.g. missing `reference`) | 400 | `INVALID_ARGUMENTS` |
| Unusable reference, query, source key or other input | 400 | `REQUEST_FAILED` |
| Valid request, but nothing matches it | 404 | `RESOURCE_UNAVAILABLE` |
| Unknown tool name | 404 | `UNKNOWN_TOOL` |
| Wrong HTTP method for the tool | 405 | `METHOD_NOT_ALLOWED` |
| Request body too large | 413 | `REQUEST_TOO_LARGE` |
| Rate limit exceeded | 429 | `RATE_LIMITED` |
| Unexpected service failure | 500 | `INTERNAL_ERROR` |
| R2/D1 dependency unavailable | 503 | `DEPENDENCY_UNAVAILABLE` |

`retryable` is `true` for 5xx responses. REST arguments are validated against
the same Zod schemas as MCP after legacy aliases are applied (for example
`passage` is accepted for `reference`); missing required arguments are rejected
rather than replaced by defaults.

Services report failures with a typed `errorCode` using the helpers in
`berean-mcp/src/services/errors.ts` (`invalidRequest`, `notFound`,
`dependencyUnavailable`, `internalError`). `restServiceResponse()` maps the code
straight to the status above; an untagged error is treated as `REQUEST_FAILED`.
`internalError` logs the underlying exception and returns a stable message, so
stack traces and SQL text never reach clients. New services should use these
helpers rather than plain `{ error }` objects.

Optional missing datasets should produce a controlled resource-unavailable response. They must not crash the Worker or make unrelated features unavailable.

## Optional API key

Deployments are public by default. Setting an `API_KEY` Worker secret
(`npx wrangler secret put API_KEY`) turns on the gate in
`berean-mcp/src/auth.ts`: every request to `/mcp` and `/tools/*` must then carry
the key, compared in constant time, as one of:

1. `Authorization: Bearer <key>` (a bare `Authorization: <key>` also works)
2. `x-api-key: <key>`
3. `?key=<key>` on the URL, for clients that cannot set headers (query strings
   can appear in logs, so prefer a header)

A missing or wrong key returns `401` with `WWW-Authenticate: Bearer`: a JSON-RPC
error (code `-32001`) on `/mcp`, or the REST envelope with code `UNAUTHORIZED` on
`/tools/*`. Health checks, `/openapi.json`, `/docs`, `/swagger` and the Explorer
page stay public, but the Explorer's own tool calls send no key, so it cannot
load results on a key-protected deployment. A blank secret leaves the API public.
The key check runs before rate limiting.

## Anonymous rate limiting

The Worker applies Cloudflare Rate Limiting bindings (`berean-mcp/src/rateLimit.ts`)
to `/mcp` and `/tools/*` when deployed. Limits are per connecting IP and are set
in `wrangler.jsonc` (see `wrangler.jsonc.example`):

| Binding | Default | What counts |
|---|---|---|
| `MCP_BURST_LIMITER` | 50 per 10 seconds | every `/mcp` and `/tools/*` request, including MCP handshake messages |
| `MCP_RATE_LIMITER` | 120 per minute | each standard tool call |
| `MCP_EXPENSIVE_LIMITER` | 40 per minute | each call to a commentary, search, interlinear, Septuagint or study-pack tool |

Only real work is metered by the per-minute limits: a REST `/tools/<name>`
request or an MCP `tools/call`. MCP protocol messages (`initialize`,
`notifications/*`, `tools/list`, `prompts/list`, `resources/list`, `ping`) count
only toward the burst limit, so a client's handshake does not use up its
tool-call budget. Hosted MCP clients such as claude.ai and ChatGPT reach the
server from shared egress IPs, which is why the limits are generous.

Exceeded limits return HTTP `429` with `Retry-After` (10 seconds for the burst
limit, 60 for the others). REST responses use the `RATE_LIMITED` envelope above;
MCP responses use a JSON-RPC error (code `-32029`) carrying the request id. The
bindings are optional: without them (for example locally) nothing is limited.
