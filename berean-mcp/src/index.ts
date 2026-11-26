import "./polyfills.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer, MCP_TOOL_COUNTS } from "./mcp/server.js";
import { TOOLS, TOOLS_BY_NAME, validateRestArgs, formatValidationError, runTool, type ServiceResult } from "./mcp/toolRegistry.js";
import { HTTP_STATUS_FOR_ERROR, type ServiceErrorCode } from "./services/errors.js";
import { renderExplorerHtml } from "./ui/explorer.js";
import { renderScalarHtml } from "./ui/scalar.js";
import { renderSwaggerHtml } from "./ui/swagger.js";
import { getOpenApiSpec } from "./ui/openapi.js";
import { Env } from "./types.js";
import { checkRateLimits, toolCallsInJsonRpc } from "./rateLimit.js";
import { isAuthorized } from "./auth.js";

function jsonResponse(payload: unknown, corsHeaders: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

/**
 * Returns a service result as REST JSON. Failures use the service's typed
 * `errorCode` for the HTTP status; an untagged error is treated as a bad request.
 */
function restServiceResponse(result: ServiceResult, corsHeaders: Record<string, string>): Response {
  if (!result.error) return jsonResponse(result, corsHeaders);
  const code: ServiceErrorCode = result.errorCode ?? "REQUEST_FAILED";
  const status = HTTP_STATUS_FOR_ERROR[code];
  return jsonResponse({ error: { code, message: String(result.error), retryable: status >= 500 } }, corsHeaders, status);
}

function rateLimitResponse(corsHeaders: Record<string, string>, retryAfter: number, jsonRpcId?: unknown): Response {
  const headers = { ...corsHeaders, "Retry-After": String(retryAfter) };
  if (jsonRpcId !== undefined) {
    // MCP clients expect a JSON-RPC envelope even on HTTP errors.
    return jsonResponse({
      jsonrpc: "2.0",
      id: jsonRpcId,
      error: { code: -32029, message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`, data: { retryable: true, retryAfter } }
    }, headers, 429);
  }
  return jsonResponse({
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please retry later.",
      retryable: true
    }
  }, headers, 429);
}

function jsonRpcErrorResponse(corsHeaders: Record<string, string>, status: number, code: number, message: string, extra: Record<string, string> = {}): Response {
  return jsonResponse({ jsonrpc: "2.0", id: null, error: { code, message } }, { ...corsHeaders, ...extra }, status);
}

/** Single JSON-RPC message id (for error envelopes); null for batches or missing ids. */
function jsonRpcIdOf(body: unknown): unknown {
  return body && typeof body === "object" && !Array.isArray(body) && "id" in body ? (body as { id: unknown }).id : null;
}

/**
 * REST access to a registry tool. Arguments are validated with the tool's Zod
 * schema after legacy aliases (e.g. `passage` for `reference`) are applied.
 */
async function handleRestTool(request: Request, url: URL, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const tool = TOOLS_BY_NAME.get(url.pathname.slice("/tools/".length));
  if (!tool) {
    return jsonResponse({ error: { code: "UNKNOWN_TOOL", message: "Unknown tool.", retryable: false } }, corsHeaders, 404);
  }

  const methods = tool.restMethods ?? ["POST"];
  if (!methods.includes(request.method as "GET" | "POST")) {
    return jsonResponse(
      { error: { code: "METHOD_NOT_ALLOWED", message: `Use ${methods.join(" or ")} for /tools/${tool.name}.`, retryable: false } },
      { ...corsHeaders, Allow: methods.join(", ") },
      405
    );
  }

  let input: Record<string, unknown> = {};
  if (request.method === "GET") {
    input = Object.fromEntries(url.searchParams);
  } else {
    const raw = await request.text();
    if (raw.trim()) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
        input = parsed as Record<string, unknown>;
      } catch {
        return jsonResponse({ error: { code: "INVALID_JSON", message: "Request body must be a JSON object.", retryable: false } }, corsHeaders, 400);
      }
    }
  }

  const parsed = validateRestArgs(tool, input);
  if (!parsed.success) {
    return jsonResponse(
      { error: { code: "INVALID_ARGUMENTS", message: formatValidationError(parsed.error), retryable: false } },
      corsHeaders,
      400
    );
  }

  try {
    const { result, cached } = await runTool(tool, env, parsed.data, { surface: "rest" });
    return restServiceResponse(result, { ...corsHeaders, "X-Berean-Cache": cached ? "hit" : "miss" });
  } catch (error) {
    console.error(`REST tool '${tool.name}' failed:`, error);
    return jsonResponse({ error: { code: "INTERNAL_ERROR", message: "Internal error while running the tool.", retryable: true } }, corsHeaders, 500);
  }
}

async function checkResourceAvailability(env: Env): Promise<Record<string, string>> {
  const resources: Record<string, string> = {};
  const bucket = env.BIBLEMATE_DATA || env.BEREAN_DATA;
  resources.r2_binding = bucket ? "available" : "missing";

  if (bucket) {
    for (const [name, key] of [["bible_index", "data/lookup/bible_names.json"], ["bible_text", "bibles/BSB.bible"]] as const) {
      try {
        resources[name] = (await bucket.head(key)) ? "available" : "missing";
      } catch (_) {
        resources[name] = "error";
      }
    }
  }

  for (const [name, database] of [["morphology_d1", env.MORPHOLOGY_DB], ["reference_d1", env.REFERENCE_DB]] as const) {
    if (!database) {
      resources[name] = "missing";
      continue;
    }
    try {
      await database.prepare("SELECT 1 AS ok").first();
      resources[name] = "available";
    } catch (_) {
      resources[name] = "error";
    }
  }
  return resources;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, mcp-session-id, last-event-id, mcp-protocol-version, x-session-id",
      "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version, X-Berean-Cache"
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Bound request bodies before parsing to protect the Worker from oversized input.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (request.method === "POST" && contentLength > 256 * 1024) {
      return jsonResponse({ error: { code: "REQUEST_TOO_LARGE", message: "Request body exceeds the 256 KiB limit." } }, corsHeaders, 413);
    }

    // Optional API key (src/auth.ts): only enforced when an API_KEY secret is set,
    // and only on the API surfaces. Pages and health checks stay public.
    const isToolRoute = url.pathname.startsWith("/tools/");
    const isApiRoute = isToolRoute || url.pathname === "/mcp";
    if (isApiRoute && !isAuthorized(request, url, env)) {
      const challenge = { "WWW-Authenticate": 'Bearer realm="berean-mcp"' };
      return url.pathname === "/mcp"
        ? jsonRpcErrorResponse(corsHeaders, 401, -32001, "Unauthorized: missing or invalid API key.", challenge)
        : jsonResponse(
            { error: { code: "UNAUTHORIZED", message: "Missing or invalid API key.", retryable: false } },
            { ...corsHeaders, ...challenge },
            401
          );
    }

    // MCP POST bodies are parsed up front so rate limiting can tell tool calls
    // apart from protocol messages (initialize, tools/list, notifications, ...).
    let mcpBody: unknown;
    if (url.pathname === "/mcp" && request.method === "POST") {
      try {
        mcpBody = await request.json();
      } catch {
        return jsonRpcErrorResponse(corsHeaders, 400, -32700, "Parse error: request body must be valid JSON.");
      }
    }

    if (isApiRoute) {
      const clientKey = request.headers.get("CF-Connecting-IP") || "anonymous";
      const toolNames = isToolRoute ? [url.pathname.slice("/tools/".length)] : toolCallsInJsonRpc(mcpBody);
      const limited = await checkRateLimits(env, clientKey, toolNames);
      if (limited) {
        return rateLimitResponse(corsHeaders, limited.retryAfter, url.pathname === "/mcp" ? jsonRpcIdOf(mcpBody) : undefined);
      }
    }

    // Deployment-aware health endpoints. Liveness is dependency-free.
    if (url.pathname === "/health/live") {
      return jsonResponse({ status: "ok", check: "live", name: "berean-mcp", environment: env.ENVIRONMENT || "unknown" }, corsHeaders);
    }

    if (url.pathname === "/health/ready") {
      const checks = {
        r2_binding: Boolean(env.BIBLEMATE_DATA || env.BEREAN_DATA),
        morphology_d1: Boolean(env.MORPHOLOGY_DB),
        reference_d1: Boolean(env.REFERENCE_DB)
      };
      const ready = Object.values(checks).every(Boolean);
      return jsonResponse({ status: ready ? "ready" : "not_ready", check: "ready", checks }, corsHeaders, ready ? 200 : 503);
    }

    if (url.pathname === "/health/resources") {
      const resources = await checkResourceAvailability(env);
      const ready = ["r2_binding", "morphology_d1", "reference_d1"].every((key) => resources[key] === "available");
      return jsonResponse({ status: ready ? "ready" : "degraded", check: "resources", resources }, corsHeaders, ready ? 200 : 503);
    }

    // OpenAPI 3.1 JSON Specification
    if (url.pathname === "/openapi.json") {
      const spec = getOpenApiSpec(url.origin);
      return new Response(JSON.stringify(spec, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders
        }
      });
    }

    // Search engines: index the Explorer and docs, not the API endpoints.
    if (url.pathname === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /mcp\nSitemap: ${url.origin}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } }
      );
    }
    if (url.pathname === "/sitemap.xml") {
      const pages = ["/", "/docs"].map((path) => `  <url><loc>${url.origin}${path}</loc></url>`).join("\n");
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages}\n</urlset>\n`,
        { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=86400" } }
      );
    }

    const analyticsSnippet = env.ANALYTICS_SNIPPET || (env.CF_BEACON_TOKEN ? `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${env.CF_BEACON_TOKEN}"}'></script><!-- End Cloudflare Web Analytics -->` : "");

    // Swagger UI Explorer (/swagger)
    if (url.pathname === "/swagger") {
      return new Response(renderSwaggerHtml(analyticsSnippet), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    // Technical Scalar API Playground (/docs, /scalar, /playground)
    if (url.pathname === "/docs" || url.pathname === "/scalar" || url.pathname === "/playground") {
      return new Response(renderScalarHtml(analyticsSnippet), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    // Reader-Friendly Bible Study Explorer (/ or /study or /app)
    const acceptHeader = request.headers.get("Accept") || "";
    const isBrowserHtmlRequest = acceptHeader.includes("text/html") || acceptHeader.includes("*/*");
    if (url.pathname === "/study" || url.pathname === "/app" || (url.pathname === "/" && isBrowserHtmlRequest && !acceptHeader.startsWith("application/json"))) {
      return new Response(renderExplorerHtml(analyticsSnippet, url.origin), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Same page for everyone; "/" also serves JSON health, so vary on Accept.
          "Cache-Control": "public, max-age=300",
          Vary: "Accept",
          ...corsHeaders
        }
      });
    }

    // Health check JSON endpoint (/health or JSON request to /)
    if (url.pathname === "/health" || url.pathname === "/status" || url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          name: "berean-mcp",
          version: "1.0.0",
          protocols: ["mcp-streamable-http", "mcp-jsonrpc", "rest-openapi"],
          endpoints: {
            study_explorer: "/",
            scalar_docs: "/docs",
            swagger_playground: "/swagger",
            mcp: "/mcp",
            openapi: "/openapi.json",
            tools: Object.fromEntries(TOOLS.map((tool) => [tool.name, `/tools/${tool.name}`]))
          }
        }, null, 2),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Public instance: no API key is required; rate limits apply (see rateLimit.ts).

    // --- REST tool endpoints: POST /tools/<name> (GET where a tool allows it) ---
    if (url.pathname.startsWith("/tools/")) {
      return handleRestTool(request, url, env, corsHeaders);
    }

    // --- MCP Streamable HTTP endpoint (stateless) ---
    // Cloudflare spreads requests across isolates, so in-memory MCP sessions
    // cannot be shared: a session created on one isolate is unknown on the next
    // and the SDK rejects it with "Server not initialized". Every POST therefore
    // gets its own server + transport, and no session id is issued or required.
    if (url.pathname === "/mcp") {
      if (request.method === "GET") {
        const accept = request.headers.get("accept") || "";
        // No standalone SSE stream is offered; the spec allows 405 here.
        if (accept.includes("text/event-stream") || request.headers.get("mcp-session-id")) {
          return new Response("Method Not Allowed", {
            status: 405,
            headers: { "Allow": "POST, OPTIONS", ...corsHeaders }
          });
        }

        // A plain GET (e.g. a browser) gets an instant JSON status.
        return new Response(JSON.stringify({
          status: "Berean MCP Server Online",
          protocol: "Model Context Protocol (MCP) Streamable HTTP",
          endpoint: "/mcp",
          instructions: "Send JSON-RPC 2.0 POST requests to /mcp with standard initialize or tool calls.",
          toolsCount: env.MCP_PROFILE === "human" ? MCP_TOOL_COUNTS.human : MCP_TOOL_COUNTS.ai,
          studyPacksCount: env.MCP_PROFILE === "human" ? MCP_TOOL_COUNTS.studyPacks : 0,
          specializedToolsCount: MCP_TOOL_COUNTS.specialized,
          profile: env.MCP_PROFILE || "ai"
        }, null, 2), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method !== "POST") {
        // DELETE (session termination) is meaningless without sessions.
        return jsonRpcErrorResponse(corsHeaders, 405, -32000, "Method not allowed. This MCP server is stateless; use POST.", { "Allow": "GET, POST, OPTIONS" });
      }

      const server = createMcpServer(env);
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });

      try {
        await server.connect(transport);
        const response = await transport.handleRequest(request, { parsedBody: mcpBody });
        const responseHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      } catch (error) {
        console.error("MCP request failed:", error);
        return jsonRpcErrorResponse(corsHeaders, 500, -32603, "Internal server error.");
      } finally {
        await server.close().catch(() => {});
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
