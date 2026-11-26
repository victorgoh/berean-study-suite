/**
 * Single source of truth for every Berean tool.
 *
 * Each entry drives:
 *   - MCP tool registration and profile gating (src/mcp/server.ts)
 *   - REST routes under /tools/<name>, with validation and legacy aliases (src/index.ts)
 *   - the /health tool listing and MCP tool counts
 *
 * To add a tool: add one `defineTool(...)` entry below (and its Zod shape in tools.ts).
 * The OpenAPI document (src/ui/openapi.ts) and the Explorer (src/ui/explorer.ts) are
 * still hand-written; scripts/test_tool_registry.ts fails if they drift from this list.
 */
import { z } from "zod";
import * as S from "./tools.js";
import { Env } from "../types.js";
import { getAvailableResources } from "../services/catalogService.js";
import { lookupBiblePassage } from "../services/bibleService.js";
import { searchBible } from "../services/searchService.js";
import { lookupCrossReferences } from "../services/xrefService.js";
import { lookupLexiconEntry } from "../services/lexiconService.js";
import { lookupMorphology } from "../services/morphologyService.js";
import { lookupInterlinear } from "../services/interlinearService.js";
import { lookupCommentary } from "../services/commentaryService.js";
import { lookupTopic } from "../services/topicsService.js";
import { lookupCharacter } from "../services/charactersService.js";
import { lookupLocation } from "../services/locationsService.js";
import { lookupDictionary } from "../services/dictionaryService.js";
import { lookupEncyclopedia } from "../services/encyclopediaService.js";
import { lookupParallels } from "../services/parallelsService.js";
import { lookupPromises } from "../services/promisesService.js";
import { lookupBookAnalysis } from "../services/bookAnalysisService.js";
import { lookupChapterSummary } from "../services/chapterSummaryService.js";
import { lookupBibleNames } from "../services/namesService.js";
import { lookupChronology } from "../services/chronologyService.js";
import { getDailyReading } from "../services/dailyReadService.js";
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
} from "../services/studyPackService.js";
import { lookupEntityDisambiguation, convertAncientUnits } from "../services/unitsAndEntitiesService.js";

/** Minimal shape shared by every service result. REST returns the object verbatim. */
export interface ServiceResult {
  error?: unknown;
  formattedText?: string;
}

/**
 * - catalog: resource discovery, always exposed
 * - study_pack: composite one-shot bundles, exposed over MCP only when MCP_PROFILE=human
 * - specialized: single-engine lookups, always exposed
 */
export type ToolTier = "catalog" | "study_pack" | "specialized";

/**
 * When an MCP call is reported as a tool error (`isError: true`):
 * - on_error: whenever the service returns `error`
 * - on_empty: only when it returns `error` and no text (partial results still succeed)
 * - never: composite packs that always return whatever sections they could build
 */
export type McpErrorPolicy = "on_error" | "on_empty" | "never";

export interface ToolContext {
  surface: "mcp" | "rest";
}

export interface ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  tier: ToolTier;
  /** Zod raw shape for arguments (MCP input schema and REST validation). */
  schema: Shape;
  mcpErrors: McpErrorPolicy;
  /** Legacy REST body keys accepted in place of a canonical argument: { alias: canonical }. */
  restAliases?: Readonly<Record<string, string>>;
  /** HTTP methods accepted on /tools/<name>. Defaults to POST. GET reads the query string. */
  restMethods?: ReadonlyArray<"GET" | "POST">;
  run: (env: Env, args: z.infer<z.ZodObject<Shape>>, ctx: ToolContext) => Promise<ServiceResult>;
}

/** Keeps per-tool argument typing while letting all tools share one array type. */
function defineTool<Shape extends z.ZodRawShape>(def: ToolDefinition<Shape>): ToolDefinition {
  return def as unknown as ToolDefinition;
}

const PASSAGE = { passage: "reference" } as const;

export const TOOLS: readonly ToolDefinition[] = [
  // ===========================================================================
  // Catalog
  // ===========================================================================
  defineTool({
    name: "get_available_resources",
    tier: "catalog",
    description:
      "List all available Bible translations, classical commentary sets, original language lexicons, study packs, and personas in this Berean MCP instance.",
    schema: S.GetAvailableResourcesSchema,
    mcpErrors: "on_error",
    restMethods: ["GET", "POST"],
    run: (env, { category }, ctx) =>
      getAvailableResources(env, {
        category,
        // REST always serves every tool; MCP lists study packs only in the human profile.
        includeStudyPacks: ctx.surface === "rest" || env.MCP_PROFILE === "human"
      })
  }),

  // ===========================================================================
  // Study packs (human profile on MCP; always on REST)
  // ===========================================================================
  defineTool({
    name: "sermon_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles scripture text, historical commentaries, and cross-references for sermon preparation in a single one-shot response.",
    schema: S.SermonStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getSermonStudyPack(env, a.reference, a.version, a.include_xrefs, a.extra_commentators)
  }),
  defineTool({
    name: "illustration_study_pack",
    tier: "study_pack",
    description:
      "Opt-in fuller pack for Biblical Illustrator anecdotes and sermon illustrations, with Scripture and a few cross-references.",
    schema: S.IllustrationStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getIllustrationStudyPack(env, a.reference, a.version, a.include_xrefs)
  }),
  defineTool({
    name: "lesson_creator_study_pack",
    tier: "study_pack",
    description:
      "Focused teaching pack with Scripture, a sourced chapter opening, Ellicott's historical context, and cross-references.",
    schema: S.LessonCreatorStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getLessonCreatorStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "devotional_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles scripture text, meditation cross-references, and biblical promises for devotional reflections in a single one-shot response.",
    schema: S.DevotionalStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getDevotionalStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "prayer_guide_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles scripture text, Spurgeon/Benson adoration, Wesley examination, and biblical promises for 1st-person ACTS prayer.",
    schema: S.PrayerGuideStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getPrayerGuideStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "passage_exegesis_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles primary translation, original Hebrew/Greek text (OHGB), morphological parsing, and historical commentaries for scholarly exegesis.",
    schema: S.PassageExegesisPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getPassageExegesisPack(env, a.reference, a.version, a.include_original, a.extra_commentators)
  }),
  defineTool({
    name: "word_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles Strong's lexicon definition, in-context morphological parsing, and linguistic guardrails against totality transfer.",
    schema: S.WordStudyPackSchema,
    mcpErrors: "never",
    restAliases: { strongs: "strongs_number", query: "strongs_number", ...PASSAGE },
    run: (env, a) => getWordStudyPack(env, a.strongs_number, a.reference, a.lexicon)
  }),
  defineTool({
    name: "interlinear_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that generates an inline Greek/Hebrew to English word-by-word interlinear with continuous verse layout, grammatical parsing, and original language glossary.",
    schema: S.InterlinearStudyPackSchema,
    mcpErrors: "on_error",
    restAliases: { ...PASSAGE, displayMode: "display_mode" },
    run: (env, a) => getInterlinearStudyPack(env, a.reference, a.glossary_filter, a.gloss_color, a.display_mode)
  }),
  defineTool({
    name: "septuagint_study_pack",
    tier: "study_pack",
    description:
      "Comprehensive composite study pack analyzing the Greek Septuagint (LXX), Brenton English translation, Dead Sea Scrolls textual variants, and Hebrew Masoretic Text comparative exegesis.",
    schema: S.SeptuagintStudyPackSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => getSeptuagintStudyPack(env, a.reference, a.version)
  }),
  defineTool({
    name: "ot_in_nt_study_pack",
    tier: "study_pack",
    description:
      "Comprehensive composite study pack analyzing Old Testament quotations and allusions in the New Testament with verbatim Hebrew MT, Greek LXX, and Greek NT alignment, apostolic hermeneutics, and Christological fulfillment.",
    schema: S.OtInNtStudyPackSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => getOtInNtStudyPack(env, a.reference, a.version)
  }),
  defineTool({
    name: "covenant_theology_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles scripture text, John Calvin's Christocentric exposition, John Gill's rabbinic/prophetic insights, ISBE articles, and canonical cross-references.",
    schema: S.CovenantTheologyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getCovenantTheologyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "commentary_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that retrieves multiple biblical commentaries (e.g. Tyndale Open Study Notes, Matthew Henry, JFB, Calvin, Maclaren, Barnes, Spurgeon) for a passage in a single request with priority ordering.",
    schema: S.CommentaryStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getCommentaryStudyPack(env, a.reference, a.commentators, a.order_mode)
  }),
  defineTool({
    name: "topic_study_pack",
    tier: "study_pack",
    description:
      "High-speed composite tool that bundles theological dictionary definitions and scriptural promises for topical and doctrinal studies.",
    schema: S.TopicStudyPackSchema,
    mcpErrors: "never",
    restAliases: { query: "topic" },
    run: (env, a) => getTopicStudyPack(env, a.topic, a.version)
  }),

  // ===========================================================================
  // Specialized single-engine tools
  // ===========================================================================
  // --- Scripture texts & translations ---
  defineTool({
    name: "bible_lookup",
    tier: "specialized",
    description: "Retrieve Bible verses from verified biblical translations (e.g. NET, KJV, ASV, WEB, BBE, OHGB).",
    schema: S.BibleLookupSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupBiblePassage(env, a.version, a.reference)
  }),
  defineTool({
    name: "bible_search",
    tier: "specialized",
    description:
      "Search for words or phrases in one or all books across Bible translations with wildcard and boolean support.",
    schema: S.BibleSearchSchema,
    mcpErrors: "on_error",
    restAliases: { text: "query", book: "book_filter" },
    run: (env, a) => searchBible(env, a.query, a.version, a.book_filter, a.limit)
  }),
  defineTool({
    name: "parallel_passages",
    tier: "specialized",
    description: "Retrieve and compare Gospel harmonies and Old/New Testament parallel passages and pericopes.",
    schema: S.ParallelPassagesSchema,
    mcpErrors: "on_error",
    restAliases: { reference: "query", passage: "query" },
    run: (env, a) => lookupParallels(env, a.query, a.include_text, a.version)
  }),
  defineTool({
    name: "daily_reading",
    tier: "specialized",
    description:
      "Retrieve scheduled daily Bible readings for today or any specified date, complete with full scripture passages.",
    schema: S.DailyReadingSchema,
    mcpErrors: "on_error",
    run: (env, a) => getDailyReading(env, a.date, a.include_text, a.version)
  }),

  // --- Commentaries & cross-references ---
  defineTool({
    name: "commentary_lookup",
    tier: "specialized",
    description:
      "Retrieve any registered historical, expository, or patristic biblical commentary. Call get_available_resources(category=commentaries) for current keys, aliases, scope, and descriptions.",
    schema: S.CommentaryLookupSchema,
    mcpErrors: "on_error",
    restAliases: { commentary: "version", ...PASSAGE },
    run: (env, a) => lookupCommentary(env, a.version, a.reference)
  }),
  defineTool({
    name: "cross_references",
    tier: "specialized",
    description:
      "Retrieve rich inter-biblical cross references linking OT and NT scriptures (Treasury of Scripture Knowledge).",
    schema: S.CrossReferenceSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupCrossReferences(env, a.reference, a.limit)
  }),

  // --- Original languages & textual alignment ---
  defineTool({
    name: "lexicon_lookup",
    tier: "specialized",
    description:
      "Look up definitions, Strong's concordance data, and lexical domains for Greek and Hebrew words (Thayer, BDB, LSJ).",
    schema: S.LexiconLookupSchema,
    mcpErrors: "on_error",
    restAliases: { strongs: "strongs_number", query: "strongs_number" },
    run: (env, a) => lookupLexiconEntry(env, a.strongs_number, a.lexicon)
  }),
  defineTool({
    name: "morphology_lookup",
    tier: "specialized",
    description:
      "Parse original Hebrew / Greek morphology, grammar, verb tenses, syntactical cases, and transliterations for a verse.",
    schema: S.MorphologyLookupSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupMorphology(env, a.reference)
  }),
  defineTool({
    name: "interlinear_lookup",
    tier: "specialized",
    description:
      "Generate an inline word-by-word Greek/Hebrew to English interlinear with continuous verse layout and an automated glossary of rare/notable words at the bottom.",
    schema: S.InterlinearLookupSchema,
    mcpErrors: "on_error",
    restAliases: { ...PASSAGE, displayMode: "display_mode" },
    run: (env, a) => lookupInterlinear(env, a.reference, a.glossary_filter, a.gloss_color, a.display_mode)
  }),
  defineTool({
    name: "septuagint_lookup",
    tier: "specialized",
    description:
      "Look up Greek Septuagint (LXX) text, Brenton English translation, and textual divergence notes for any Old Testament passage.",
    schema: S.SeptuagintLookupSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => lookupSeptuagint(env, a.reference)
  }),
  defineTool({
    name: "ot_quotations_lookup",
    tier: "specialized",
    description:
      "Look up Old Testament quotations, citations, allusions, and Septuagint bridge references for any NT or OT passage.",
    schema: S.OtQuotationsLookupSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => lookupOtQuotations(env, a.reference)
  }),

  // --- Theology, doctrine & devotion ---
  defineTool({
    name: "theological_dictionary",
    tier: "specialized",
    description:
      "Look up source-labelled articles and definitions from Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the combined classic reference collection.",
    schema: S.TheologicalDictionarySchema,
    mcpErrors: "on_error",
    restAliases: { query: "term", word: "term" },
    run: (env, a) => (a.source === "isbe" ? lookupEncyclopedia(env, a.term, a.source) : lookupDictionary(env, a.term, a.source))
  }),
  defineTool({
    name: "topic_study",
    tier: "specialized",
    description:
      "Topical Bible study retrieving comprehensive scripture outlines and doctrinal subtopics (Nave's / Torrey Topical datasets).",
    schema: S.TopicStudySchema,
    mcpErrors: "on_error",
    restAliases: { topic: "query", term: "query" },
    run: (env, a) => lookupTopic(env, a.query)
  }),
  defineTool({
    name: "biblical_promises",
    tier: "specialized",
    description: "Retrieve categorized biblical promises and scriptures for specific life situations and spiritual needs.",
    schema: S.BiblicalPromisesSchema,
    mcpErrors: "on_error",
    restAliases: { category: "topic", query: "topic" },
    run: (env, a) => lookupPromises(env, a.topic, a.include_text, a.version)
  }),

  // --- People, places, history & culture ---
  defineTool({
    name: "character_lookup",
    tier: "specialized",
    description:
      "Retrieve rich biographical data, parental ancestry, KJV occurrences, and visual ASCII family & relationship trees for Bible figures.",
    schema: S.CharacterLookupSchema,
    mcpErrors: "on_error",
    restAliases: { query: "name", character: "name" },
    run: (env, a) => lookupCharacter(env, a.name)
  }),
  defineTool({
    name: "location_lookup",
    tier: "specialized",
    description:
      "Retrieve geographical coordinates, live Google Map links, and historical-archaeological descriptions of Bible places.",
    schema: S.LocationLookupSchema,
    mcpErrors: "on_error",
    restAliases: { query: "location", name: "location" },
    run: (env, a) => lookupLocation(env, a.location)
  }),
  defineTool({
    name: "entity_disambiguation",
    tier: "specialized",
    description:
      "Disambiguate biblical persons or locations sharing identical names (e.g. Mary, James, John, Zechariah, Herod), returning exact identities, lineages, roles, and biblical passages.",
    schema: S.EntityDisambiguationSchema,
    mcpErrors: "on_empty",
    run: (env, a) => lookupEntityDisambiguation(env, a.name)
  }),
  defineTool({
    name: "convert_ancient_units",
    tier: "specialized",
    description:
      "Convert ancient biblical weights (Talent, Shekel, Mina), dry/liquid measurements (Cor, Ephah, Bath, Hin, Omer), distances (Cubit, Span, Stadion), and currencies (Denarius, Drachma, Stater, Talent, Mite) into modern metric, imperial, and labor-wage purchasing power.",
    schema: S.ConvertAncientUnitsSchema,
    mcpErrors: "on_empty",
    run: (env, a) => convertAncientUnits(env, a.unit, a.amount)
  }),
  defineTool({
    name: "bible_names",
    tier: "specialized",
    description: "Look up meanings, linguistic origins, and occurrences of biblical names.",
    schema: S.BibleNamesSchema,
    mcpErrors: "on_error",
    restAliases: { name: "query", search: "query" },
    run: (env, a) => lookupBibleNames(env, a.query)
  }),
  defineTool({
    name: "chronology",
    tier: "specialized",
    description:
      "Search biblical chronology, timelines, date spans, and sequencing of historical events (Kings of Israel/Judah, Paul).",
    schema: S.ChronologySchema,
    mcpErrors: "on_error",
    restAliases: { period: "query", event: "query" },
    run: (env, a) => lookupChronology(env, a.query)
  }),
  defineTool({
    name: "book_analysis",
    tier: "specialized",
    description: "Retrieve a source-attributed Tyndale Open Study Notes book summary or full introduction.",
    schema: S.BookAnalysisSchema,
    mcpErrors: "on_error",
    restAliases: { query: "book" },
    run: (env, a) => lookupBookAnalysis(env, a.book, a.detail)
  }),
  defineTool({
    name: "chapter_summary",
    tier: "specialized",
    description: "Retrieve Adam Clarke's source-attributed chapter-opening synopsis for any Bible chapter.",
    schema: S.ChapterSummarySchema,
    mcpErrors: "on_error",
    restAliases: { query: "book" },
    run: (env, a) => lookupChapterSummary(env, a.book, a.chapter)
  })
];

export const TOOLS_BY_NAME: ReadonlyMap<string, ToolDefinition> = new Map(TOOLS.map((t) => [t.name, t]));

/** Tools exposed over MCP for a profile. REST always exposes every tool. */
export function mcpToolsForProfile(profile: Env["MCP_PROFILE"]): ToolDefinition[] {
  return TOOLS.filter((t) => t.tier !== "study_pack" || profile === "human");
}

const countTier = (tier: ToolTier) => TOOLS.filter((t) => t.tier === tier).length;

/** Derived from the registry so health/discovery metadata can never drift. */
export const MCP_TOOL_COUNTS = {
  specialized: countTier("specialized"),
  studyPacks: countTier("study_pack"),
  ai: mcpToolsForProfile("ai").length,
  human: mcpToolsForProfile("human").length
} as const;

// -----------------------------------------------------------------------------
// REST argument handling
// -----------------------------------------------------------------------------

const VALIDATORS: ReadonlyMap<string, z.ZodObject<z.ZodRawShape>> = new Map(
  TOOLS.map((t) => [t.name, z.object(t.schema)])
);

const isBlank = (value: unknown) => value === undefined || value === null || value === "";

/** Copies legacy alias keys onto canonical argument names when the canonical one is blank. */
export function applyRestAliases(tool: ToolDefinition, input: Record<string, unknown>): Record<string, unknown> {
  if (!tool.restAliases) return input;
  const args = { ...input };
  for (const [alias, canonical] of Object.entries(tool.restAliases)) {
    if (isBlank(args[canonical]) && !isBlank(args[alias])) args[canonical] = args[alias];
  }
  return args;
}

export function validateRestArgs(tool: ToolDefinition, input: Record<string, unknown>) {
  return VALIDATORS.get(tool.name)!.safeParse(applyRestAliases(tool, input));
}

/** Short, client-safe description of a Zod validation failure. */
export function formatValidationError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.length ? i.path.join(".") : "input"}: ${i.message}`).join("; ");
}

// -----------------------------------------------------------------------------
// MCP error policy
// -----------------------------------------------------------------------------

/** Returns the error message to report as an MCP tool error, or null when the call succeeded. */
export function mcpErrorFor(tool: ToolDefinition, result: ServiceResult): string | null {
  if (!result.error || tool.mcpErrors === "never") return null;
  if (tool.mcpErrors === "on_empty" && result.formattedText) return null;
  return String(result.error);
}
