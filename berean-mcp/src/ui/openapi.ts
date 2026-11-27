/**
 * OpenAPI 3.1 description of the REST API (/tools/<name>), generated from the
 * tool registry: every registered tool gets a path, and its request schema is
 * the same Zod schema the MCP server and REST validation use. Only the
 * presentation details below (tag, summary, example) are kept by hand, and
 * scripts/test_tool_registry.ts checks that this table and the registry agree.
 */
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { TOOLS, type ToolDefinition } from "../mcp/toolRegistry.js";

const TAGS = {
  packs: { name: "⚡ Composite Study Packs", description: "Multi-database theological analysis and curriculum synthesis" },
  scripture: { name: "📖 Scripture Texts & Translations", description: "Multi-version Bible text, keyword search, harmony, and daily plans" },
  commentary: { name: "💬 Classical Commentaries & Cross-References", description: "26 classical commentary sets and Treasury of Scripture Knowledge" },
  languages: { name: "🏛 Original Languages & Textual Alignment", description: "Hebrew & Greek lexicons (BDB, Thayer, STEP), morphology, interlinear, Septuagint, and OT-in-NT alignment" },
  theology: { name: "🏷️ Theology & Doctrinal Reference", description: "Theological dictionaries, Nave's Topical Bible, and biblical promises" },
  history: { name: "📜 Historical & Cultural Context", description: "Biblical people, geography, coins and ancient units, chronology, and book structures" },
  system: { name: "System", description: "Catalog discovery, MCP, and server health endpoints" }
} as const;

interface ToolDocs {
  tag: keyof typeof TAGS;
  summary: string;
  /** Description of a successful (200) response. */
  response: string;
  /** Example request body; every key must be an argument of the tool. */
  example: Record<string, unknown>;
}

/** Presentation details per tool, in documentation order. */
export const TOOL_DOCS: Readonly<Record<string, ToolDocs>> = {
  get_available_resources: { tag: "system", summary: "List Available Resources & Catalog", response: "Resource catalog", example: {} },
  sermon_study_pack: { tag: "packs", summary: "Sermon & Homiletics Study Pack", response: "Complete sermon preparation bundle", example: { reference: "Romans 8:28-30" } },
  illustration_study_pack: { tag: "packs", summary: "Biblical Illustrator Study Pack", response: "Biblical Illustrator source material", example: { reference: "Romans 8:28" } },
  lesson_creator_study_pack: { tag: "packs", summary: "Lesson Creator & Teaching Study Pack", response: "Curriculum and discussion package", example: { reference: "Luke 15:11-32" } },
  devotional_study_pack: { tag: "packs", summary: "Devotional Study Pack", response: "Pastoral and devotional meditation notes", example: { reference: "Psalm 23:1-6" } },
  prayer_guide_study_pack: { tag: "packs", summary: "Scripture Prayer Guide Study Pack", response: "Scriptural prayer guide", example: { reference: "Ephesians 3:14-21" } },
  passage_exegesis_pack: { tag: "packs", summary: "Passage Exegesis Study Pack", response: "Exegetical analysis package", example: { reference: "Romans 8:28-30" } },
  word_study_pack: { tag: "packs", summary: "Original Word Study Pack", response: "Lexical and philological analysis", example: { strongs_number: "G26" } },
  interlinear_study_pack: { tag: "packs", summary: "Continuous Interlinear Study Pack", response: "Interlinear text and glossary", example: { reference: "Philippians 4:4-8" } },
  septuagint_study_pack: { tag: "packs", summary: "Septuagint (LXX) Comparative Study Pack", response: "LXX vs Hebrew comparative analysis", example: { reference: "Genesis 1:1-5" } },
  ot_in_nt_study_pack: { tag: "packs", summary: "Old Testament in New Testament Study Pack", response: "OT in NT comparative alignment", example: { reference: "Hebrews 8:8-12" } },
  covenant_theology_pack: { tag: "packs", summary: "Covenant Theology Study Pack", response: "Covenant theology analysis package", example: { reference: "Genesis 15:1-6" } },
  commentary_study_pack: { tag: "packs", summary: "Multi-Commentary Comparative Study Pack", response: "Side-by-side commentary synthesis", example: { reference: "Romans 8:28", commentators: ["Henry", "JFB", "Calvin", "Spur"] } },
  topic_study_pack: { tag: "packs", summary: "Topical Study Pack", response: "Topical research bundle", example: { topic: "Grace" } },
  bible_lookup: { tag: "scripture", summary: "Bible Verse & Passage Lookup", response: "Passage text and formatted output", example: { reference: "John 3:16" } },
  compare_translations: { tag: "scripture", summary: "Compare Translations", response: "Verses with each translation's text", example: { reference: "John 3:16" } },
  bible_search: { tag: "scripture", summary: "Full-Text Scripture Search", response: "Search results with matching verses", example: { query: "peace of God", book_filter: "Philippians" } },
  parallel_passages: { tag: "scripture", summary: "Parallel Passages & Gospel Harmony", response: "Parallel passage comparisons", example: { query: "Beatitudes" } },
  daily_reading: { tag: "scripture", summary: "Daily Bible Reading Plan", response: "Daily reading schedule and Scripture", example: { date: "2026-08-30" } },
  commentary_lookup: { tag: "commentary", summary: "Classical Commentary Lookup", response: "Commentary text", example: { reference: "John 1:1", version: "Henry" } },
  cross_references: { tag: "commentary", summary: "Treasury of Scripture Knowledge (TSK) Cross-References", response: "List of cross-references", example: { reference: "John 3:16" } },
  lexicon_lookup: { tag: "languages", summary: "Greek & Hebrew Lexicon Lookup", response: "Lexicon definition entry", example: { strongs_number: "G26" } },
  morphology_lookup: { tag: "languages", summary: "Original Language Verse Morphology", response: "Word-by-word syntax parsing", example: { reference: "John 1:1" } },
  interlinear_lookup: { tag: "languages", summary: "Inline Word-by-Word Interlinear Lookup", response: "Interlinear text", example: { reference: "John 1:1-3" } },
  septuagint_lookup: { tag: "languages", summary: "Greek Septuagint (LXX) & Brenton Lookup", response: "Septuagint verses and notes", example: { reference: "Genesis 1:1" } },
  ot_quotations_lookup: { tag: "languages", summary: "Old Testament Quotations & Allusions Lookup", response: "Quotation mapping and comparative citations", example: { reference: "Hebrews 8:8" } },
  theological_dictionary: { tag: "theology", summary: "Theological Dictionary & Encyclopedia", response: "Theological article entry", example: { term: "Covenant" } },
  topic_study: { tag: "theology", summary: "Topical Concordance Lookup", response: "Topical concordance verses", example: { query: "Faith" } },
  biblical_promises: { tag: "theology", summary: "Biblical Promises for Faith & Prayer", response: "Promises with Scripture text", example: { topic: "Peace" } },
  character_lookup: { tag: "history", summary: "Biblical Character Profiles & Genealogies", response: "Character profile and family tree", example: { name: "David" } },
  location_lookup: { tag: "history", summary: "Biblical Geography & GPS Coordinates", response: "Location details with coordinates", example: { location: "Jerusalem" } },
  entity_disambiguation: { tag: "history", summary: "Biblical Entity Disambiguation", response: "Disambiguated entity profiles and distinctions", example: { name: "Mary" } },
  convert_ancient_units: { tag: "history", summary: "Ancient Coins, Weights & Measures Converter", response: "Converted modern equivalents and economic context", example: { unit: "Talent" } },
  bible_names: { tag: "history", summary: "Bible Name Meanings & Etymologies", response: "Name meaning and etymology", example: { query: "Joshua" } },
  chronology: { tag: "history", summary: "Biblical Timelines & Historical Eras", response: "Chronological events and dates", example: { query: "Exodus" } },
  book_analysis: { tag: "history", summary: "Tyndale Book Guide", response: "Source-attributed Tyndale book guide", example: { book: "Romans" } },
  chapter_summary: { tag: "history", summary: "Adam Clarke Chapter Summary", response: "Chapter summary", example: { book: "Romans", chapter: 8 } },};

const ERROR_SCHEMA = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string", enum: ["REQUEST_FAILED", "RESOURCE_UNAVAILABLE", "DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR", "RATE_LIMITED"] },
        message: { type: "string" },
        retryable: { type: "boolean" }
      },
      required: ["code", "message", "retryable"]
    }
  },
  required: ["error"]
};

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
});

/** Responses every tool can return besides 200. */
const ERROR_RESPONSES = {
  "400": errorResponse("REQUEST_FAILED: invalid arguments (reference format, names, source keys)"),
  "404": errorResponse("RESOURCE_UNAVAILABLE: nothing matched the query"),
  "429": errorResponse("RATE_LIMITED: too many requests; see the Retry-After header"),
  "500": errorResponse("INTERNAL_ERROR: unexpected server error"),
  "503": errorResponse("DEPENDENCY_UNAVAILABLE: a data store is temporarily unavailable")
};

function requestSchema(tool: ToolDefinition, example: Record<string, unknown>): Record<string, unknown> {
  const schema = zodToJsonSchema(z.object(tool.schema), { target: "openApi3", $refStrategy: "none" }) as Record<string, any>;
  // REST also accepts legacy argument names (restAliases), so extra keys are allowed.
  delete schema.additionalProperties;
  for (const [key, value] of Object.entries(example)) {
    if (schema.properties?.[key]) schema.properties[key].example = value;
  }
  return schema;
}

function toolPath(tool: ToolDefinition): Record<string, unknown> {
  const docs = TOOL_DOCS[tool.name];
  const base = {
    tags: [TAGS[docs?.tag ?? "system"].name],
    operationId: tool.name,
    summary: docs?.summary ?? tool.title,
    description: tool.description,
    responses: { "200": { description: docs?.response ?? "Tool result" }, ...ERROR_RESPONSES }
  };
  const schema = requestSchema(tool, docs?.example ?? {});
  const methods = tool.restMethods ?? ["POST"];
  const path: Record<string, unknown> = {};
  if (methods.includes("POST")) {
    const required = Array.isArray(schema.required) && schema.required.length > 0;
    path.post = {
      ...base,
      requestBody: { required, content: { "application/json": { schema } } }
    };
  }
  if (methods.includes("GET")) {
    const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
    const required = new Set((schema.required as string[] | undefined) ?? []);
    path.get = {
      ...base,
      operationId: `${tool.name}_get`,
      parameters: Object.entries(properties).map(([name, property]) => ({
        name,
        in: "query",
        required: required.has(name),
        description: property.description,
        schema: { ...property, description: undefined }
      }))
    };
  }
  return path;
}

const SYSTEM_PATHS = {
  "/mcp": {
    get: {
      tags: [TAGS.system.name],
      summary: "MCP Streamable HTTP Gateway",
      description: "Connect AI clients (Claude Desktop, Cursor, Antigravity) via JSON-RPC 2.0 or EventSource SSE stream.",
      responses: { "200": { description: "MCP Status or Streamable SSE connection" } }
    },
    post: {
      tags: [TAGS.system.name],
      summary: "MCP JSON-RPC 2.0 Messages",
      description: "Execute MCP tools, prompts, and resources via JSON-RPC.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jsonrpc: { type: "string", example: "2.0" },
                id: { type: "integer", example: 1 },
                method: { type: "string", example: "tools/list" },
                params: { type: "object" }
              },
              required: ["jsonrpc", "method"]
            }
          }
        }
      },
      responses: { "200": { description: "MCP JSON-RPC response" } }
    }
  },
  "/health": {
    get: {
      tags: [TAGS.system.name],
      summary: "Health Check",
      description: "Server health and active capabilities.",
      responses: { "200": { description: "Health status" } }
    }
  }
};

/** Registry tools in documentation order (TOOL_DOCS order, then any others). */
function documentedTools(): ToolDefinition[] {
  const order = Object.keys(TOOL_DOCS);
  const rank = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
  return [...TOOLS].sort((a, b) => rank(a.name) - rank(b.name));
}

let cachedPaths: Record<string, unknown> | undefined;

export function getOpenApiSpec(serverUrl: string = "https://berean-mcp.victorgoh.workers.dev"): object {
  cachedPaths ??= {
    ...Object.fromEntries(documentedTools().map((tool) => [`/tools/${tool.name}`, toolPath(tool)])),
    ...SYSTEM_PATHS
  };
  return {
    openapi: "3.1.0",
    info: {
      title: "Berean MCP Server — Biblical Study & Exegesis API",
      version: "1.0.0",
      description: "Open-source biblical study API and Model Context Protocol (MCP) server providing access to public-domain translations, 26 classical commentary sets, original Greek and Hebrew lexicons, and cross-reference datasets.\n\nEcosystem repository: [https://github.com/victorgoh/berean-study-suite](https://github.com/victorgoh/berean-study-suite)",
      contact: {
        name: "Berean AI Study Suite",
        url: "https://github.com/victorgoh/berean-study-suite"
      }
    },
    servers: [
      { url: serverUrl, description: "Current Server Instance" },
      { url: "http://localhost:8787", description: "Local Development Server" }
    ],
    tags: Object.values(TAGS),
    paths: cachedPaths,
    components: { schemas: { Error: ERROR_SCHEMA } }
  };
}
