# MCP Server Design Notes

Audience: AI programming agents; human review required.

## REST error contract

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
