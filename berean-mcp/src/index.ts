if (typeof (globalThis as any).location === "undefined") {
  (globalThis as any).location = { href: "http://localhost/" };
}
if (typeof (globalThis as any).self === "undefined") {
  (globalThis as any).self = globalThis;
}

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createMcpServer, MCP_TOOL_COUNTS } from "./mcp/server.js";
import { lookupBiblePassage } from "./services/bibleService.js";
import { searchBible } from "./services/searchService.js";
import { lookupCrossReferences } from "./services/xrefService.js";
import { lookupLexiconEntry } from "./services/lexiconService.js";
import { lookupMorphology } from "./services/morphologyService.js";
import { lookupInterlinear } from "./services/interlinearService.js";
import { lookupCommentary } from "./services/commentaryService.js";
import { lookupTopic } from "./services/topicsService.js";
import { lookupCharacter } from "./services/charactersService.js";
import { lookupLocation } from "./services/locationsService.js";
import { lookupDictionary } from "./services/dictionaryService.js";
import { lookupEncyclopedia } from "./services/encyclopediaService.js";
import { lookupParallels } from "./services/parallelsService.js";
import { lookupPromises } from "./services/promisesService.js";
import { lookupBookAnalysis } from "./services/bookAnalysisService.js";
import { lookupChapterSummary } from "./services/chapterSummaryService.js";
import { lookupBibleNames } from "./services/namesService.js";
import { lookupChronology } from "./services/chronologyService.js";
import { getDailyReading } from "./services/dailyReadService.js";
import { getAvailableResources } from "./services/catalogService.js";
import {
  getSermonStudyPack,
  getIllustrationStudyPack,
  getDevotionalStudyPack,
  getPassageExegesisPack,
  getWordStudyPack,
  getTopicStudyPack,
  getCommentaryStudyPack,
  getLessonCreatorStudyPack,
  getPrayerGuideStudyPack,
  getCovenantTheologyPack,
  getInterlinearStudyPack,
  getOtInNtStudyPack,
  lookupOtQuotations,
  getSeptuagintStudyPack,
  lookupSeptuagint
} from "./services/studyPackService.js";
import {
  lookupEntityDisambiguation,
  convertAncientUnits
} from "./services/unitsAndEntitiesService.js";
import { renderExplorerHtml } from "./ui/explorer.js";
import { renderScalarHtml } from "./ui/scalar.js";
import { renderSwaggerHtml } from "./ui/swagger.js";
import { getOpenApiSpec } from "./ui/openapi.js";
import { Env } from "./types.js";

// Keep active transports map in memory (per isolate)
const activeTransports = new Map<string, WebStandardStreamableHTTPServerTransport>();

function jsonResponse(payload: unknown, corsHeaders: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

function restServiceResponse(result: any, corsHeaders: Record<string, string>): Response {
  if (!result?.error) return jsonResponse(result, corsHeaders);
  const message = String(result.error);
  let code = "REQUEST_FAILED";
  let status = 400;
  if (/not found|not available|not installed/i.test(message)) { code = "RESOURCE_UNAVAILABLE"; status = 404; }
  if (/database|R2|D1|storage/i.test(message)) { code = "DEPENDENCY_UNAVAILABLE"; status = 503; }
  if (/query failed|exception|internal/i.test(message)) { code = "INTERNAL_ERROR"; status = 500; }
  return jsonResponse({ error: { code, message, retryable: status >= 500 } }, corsHeaders, status);
}

function rateLimitResponse(corsHeaders: Record<string, string>, retryAfter: number): Response {
  return jsonResponse({
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please retry later.",
      retryable: true
    }
  }, { ...corsHeaders, "Retry-After": String(retryAfter) }, 429);
}

async function enforceRateLimits(request: Request, url: URL, env: Env, corsHeaders: Record<string, string>): Promise<Response | null> {
  const isApi = url.pathname === "/mcp" || url.pathname.startsWith("/tools/");
  if (!isApi) return null;
  const ip = request.headers.get("CF-Connecting-IP") || "anonymous";
  const expensive = url.pathname === "/mcp" || /(?:commentary|search|study_pack|devotional|sermon|exegesis|word_study|topic_study|prayer|covenant|interlinear|septuagint)/i.test(url.pathname);
  const key = `${ip}:burst`;
  try {
    if (env.MCP_BURST_LIMITER) {
      const burst = await env.MCP_BURST_LIMITER.limit({ key });
      if (!burst.success) return rateLimitResponse(corsHeaders, 30);
    }
    const limiter = expensive ? env.MCP_EXPENSIVE_LIMITER : env.MCP_RATE_LIMITER;
    if (limiter) {
      const result = await limiter.limit({ key: `${ip}:${expensive ? "expensive" : "api"}` });
      if (!result.success) return rateLimitResponse(corsHeaders, expensive ? 120 : 60);
    }
  } catch (error) {
    // Keep local development and emergency deployments available if a binding
    // is temporarily unavailable; Cloudflare WAF remains an outer safeguard.
    console.error("Rate-limit binding error:", error);
  }
  return null;
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id, last-event-id, mcp-protocol-version, x-session-id",
      "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version"
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const limited = await enforceRateLimits(request, url, env, corsHeaders);
    if (limited) return limited;

    // Bound REST request bodies before parsing to protect the Worker from oversized input.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (request.method === "POST" && contentLength > 256 * 1024) {
      return jsonResponse({ error: { code: "REQUEST_TOO_LARGE", message: "Request body exceeds the 256 KiB limit." } }, corsHeaders, 413);
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
          ...corsHeaders
        }
      });
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
      return new Response(renderExplorerHtml(analyticsSnippet), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
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
            tools: {
              get_available_resources: "/tools/get_available_resources",
              sermon_study_pack: "/tools/sermon_study_pack",
              illustration_study_pack: "/tools/illustration_study_pack",
              lesson_creator_study_pack: "/tools/lesson_creator_study_pack",
              devotional_study_pack: "/tools/devotional_study_pack",
              prayer_guide_study_pack: "/tools/prayer_guide_study_pack",
              passage_exegesis_pack: "/tools/passage_exegesis_pack",
              word_study_pack: "/tools/word_study_pack",
              interlinear_study_pack: "/tools/interlinear_study_pack",
              septuagint_study_pack: "/tools/septuagint_study_pack",
              ot_in_nt_study_pack: "/tools/ot_in_nt_study_pack",
              covenant_theology_pack: "/tools/covenant_theology_pack",
              commentary_study_pack: "/tools/commentary_study_pack",
              topic_study_pack: "/tools/topic_study_pack",
              bible_lookup: "/tools/bible_lookup",
              bible_search: "/tools/bible_search",
              parallel_passages: "/tools/parallel_passages",
              daily_reading: "/tools/daily_reading",
              commentary_lookup: "/tools/commentary_lookup",
              cross_references: "/tools/cross_references",
              lexicon_lookup: "/tools/lexicon_lookup",
              morphology_lookup: "/tools/morphology_lookup",
              interlinear_lookup: "/tools/interlinear_lookup",
              septuagint_lookup: "/tools/septuagint_lookup",
              ot_quotations_lookup: "/tools/ot_quotations_lookup",
              theological_dictionary: "/tools/theological_dictionary",
              topic_study: "/tools/topic_study",
              biblical_promises: "/tools/biblical_promises",
              character_lookup: "/tools/character_lookup",
              location_lookup: "/tools/location_lookup",
              entity_disambiguation: "/tools/entity_disambiguation",
              convert_ancient_units: "/tools/convert_ancient_units",
              bible_names: "/tools/bible_names",
              chronology: "/tools/chronology",
              book_analysis: "/tools/book_analysis",
              chapter_summary: "/tools/chapter_summary"
            }
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

    // Public MCP Instance: No API key requirement enforced

    // --- REST Endpoints for Direct / MCP Tool Invocations ---
    if (url.pathname === "/tools/get_available_resources" && (request.method === "POST" || request.method === "GET")) {
      const body = request.method === "POST" ? (await request.json().catch(() => ({}))) as any : {};
      const category = body.category || url.searchParams.get("category") || "all";
      const res = await getAvailableResources(env, { category });
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/bible_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupBiblePassage(env, body.version || "BSB", body.reference || body.passage || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/bible_search" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await searchBible(env, body.query || body.text || "", body.version || "BSB", body.book_filter || body.book, body.limit || 50);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/commentary_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupCommentary(env, body.version || body.commentary || "Henry", body.reference || body.passage || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/cross_references" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupCrossReferences(env, body.reference || body.passage || "", body.limit || 15);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/lexicon_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupLexiconEntry(env, body.strongs_number || body.strongs || body.query || "", body.lexicon || "strongs");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/morphology_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupMorphology(env, body.reference || body.passage || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/topic_study" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupTopic(env, body.query || body.topic || body.term || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/character_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupCharacter(env, body.name || body.query || body.character || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/location_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupLocation(env, body.location || body.query || body.name || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/theological_dictionary" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const term = body.term || body.query || body.word || "";
      const res = body.source === "isbe"
        ? await lookupEncyclopedia(env, term, "isbe")
        : await lookupDictionary(env, term, body.source || "easton");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/parallel_passages" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupParallels(env, body.query || body.reference || body.passage || "", body.include_text ?? true, body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/biblical_promises" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupPromises(env, body.topic || body.category || body.query || "", body.include_text ?? true, body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/book_analysis" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const detail = body.detail === "full" ? "full" : "summary";
      const res = await lookupBookAnalysis(env, body.book || body.query || "", detail);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/chapter_summary" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupChapterSummary(env, body.book || body.query || "", body.chapter || 1);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/bible_names" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupBibleNames(env, body.query || body.name || body.search || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/chronology" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupChronology(env, body.query || body.period || body.event || "");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/daily_reading" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getDailyReading(env, body.date, body.include_text ?? true, body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/sermon_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getSermonStudyPack(env, body.reference || body.passage || "Romans 8:1-4", body.version || "BSB", body.include_xrefs ?? true);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/illustration_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getIllustrationStudyPack(env, body.reference || body.passage || "Romans 8:28", body.version || "BSB", body.include_xrefs ?? true);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/devotional_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getDevotionalStudyPack(env, body.reference || body.passage || "Psalm 23", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/passage_exegesis_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getPassageExegesisPack(env, body.reference || body.passage || "John 1:1-5", body.version || "BSB", body.include_original ?? true);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/word_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getWordStudyPack(env, body.strongs_number || body.strongs || body.query || "G2842", body.reference || body.passage, body.lexicon || "strongs");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/topic_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getTopicStudyPack(env, body.topic || body.query || "Justification", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/commentary_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getCommentaryStudyPack(env, body.reference || body.passage || "Romans 8:28", body.commentators, body.order_mode);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/lesson_creator_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getLessonCreatorStudyPack(env, body.reference || body.passage || "Luke 15:11-32", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/prayer_guide_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getPrayerGuideStudyPack(env, body.reference || body.passage || "Psalm 23", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/covenant_theology_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getCovenantTheologyPack(env, body.reference || body.passage || "Genesis 15", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/interlinear_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getInterlinearStudyPack(env, body.reference || body.passage || "Philippians 4:4-8", body.glossary_filter, body.gloss_color, body.display_mode || body.displayMode);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/interlinear_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupInterlinear(env, body.reference || body.passage || "Philippians 4:4-8", body.glossary_filter, body.gloss_color, body.display_mode || body.displayMode);
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/ot_in_nt_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getOtInNtStudyPack(env, body.reference || body.passage || "Hebrews 8:8-12", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/ot_quotations_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupOtQuotations(env, body.reference || body.passage || "Hebrews 8:8");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/septuagint_study_pack" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await getSeptuagintStudyPack(env, body.reference || body.passage || "Genesis 1:1-5", body.version || "BSB");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/septuagint_lookup" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupSeptuagint(env, body.reference || body.passage || "Genesis 1:1");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/entity_disambiguation" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await lookupEntityDisambiguation(env, body.name || "Mary");
      return restServiceResponse(res, corsHeaders);
    }

    if (url.pathname === "/tools/convert_ancient_units" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;
      const res = await convertAncientUnits(env, body.unit || "Talent", body.amount || 1);
      return restServiceResponse(res, corsHeaders);
    }

    // --- MCP Streamable HTTP endpoint ---
    if (url.pathname === "/mcp") {
      // If a client or browser sends a plain GET request without requesting an SSE stream, return instant JSON status
      if (request.method === "GET") {
        const accept = request.headers.get("accept") || "";
        const sessionId = request.headers.get("mcp-session-id");
        if (!sessionId && !accept.includes("text/event-stream")) {
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
      }

      // Evict oldest transports if Map exceeds 8 active sessions to protect isolate memory
      if (activeTransports.size > 8) {
        const oldestKey = activeTransports.keys().next().value;
        if (oldestKey) {
          try {
            const oldTransport = activeTransports.get(oldestKey);
            oldTransport?.close();
          } catch (_) {}
          activeTransports.delete(oldestKey);
        }
      }

      const sessionId = request.headers.get("mcp-session-id");
      let transport: WebStandardStreamableHTTPServerTransport | undefined;
      let parsedBody: unknown;

      if (request.method === "POST") {
        parsedBody = await request.json().catch(() => ({}));
      }

      if (sessionId && activeTransports.has(sessionId)) {
        transport = activeTransports.get(sessionId)!;
      } else if (!sessionId && request.method === "POST" && isInitializeRequest(parsedBody)) {
        transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (sid) => {
            activeTransports.set(sid, transport!);
          },
          onsessionclosed: (sid) => {
            activeTransports.delete(sid);
          }
        });
        transport.onclose = () => {
          if (transport?.sessionId) {
            activeTransports.delete(transport.sessionId);
          }
        };

        const server = createMcpServer(env);
        await server.connect(transport);
      } else if (sessionId) {
        // Graceful re-hydration for any HTTP method with sessionId across Cloudflare edge isolates
        transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
          enableJsonResponse: true,
          onsessioninitialized: (sid) => {
            activeTransports.set(sid, transport!);
          },
          onsessionclosed: (sid) => {
            activeTransports.delete(sid);
          }
        });
        transport.onclose = () => {
          if (transport?.sessionId) {
            activeTransports.delete(transport.sessionId);
          }
        };

        const server = createMcpServer(env);
        await server.connect(transport);
        activeTransports.set(sessionId, transport);
      } else {
        // Stateless fallback
        transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          enableJsonResponse: true
        });
        const server = createMcpServer(env);
        await server.connect(transport);
      }

      const response = await transport.handleRequest(request, { parsedBody });
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
