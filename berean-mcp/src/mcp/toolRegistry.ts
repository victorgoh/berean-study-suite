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
import type { ServiceErrorCode } from "../services/errors.js";
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
  /** Typed failure category; REST maps it to an HTTP status (see services/errors.ts). */
  errorCode?: ServiceErrorCode;
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
  /** Short human-readable name shown by MCP clients. */
  title: string;
  /** What the tool returns and when to use it; models choose tools from this text. */
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
    title: "Resource Catalog",
    tier: "catalog",
    description:
      "List the Bible translations, commentaries, lexicons, study packs and personas this server offers, with their keys and aliases. Call this first when you need a valid version, commentary or lexicon key.",
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
    title: "Sermon Study Pack",
    tier: "study_pack",
    description:
      "One-call sermon preparation for a passage: Scripture text, Alexander Maclaren's expositions, Charles Simeon's Horae Homileticae outlines and cross-references. Add more commentators with extra_commentators.",
    schema: S.SermonStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getSermonStudyPack(env, a.reference, a.version, a.include_xrefs, a.extra_commentators)
  }),
  defineTool({
    name: "illustration_study_pack",
    title: "Illustration Study Pack",
    tier: "study_pack",
    description:
      "Sermon illustrations and anecdotes from the Biblical Illustrator for a passage, with the Scripture text and a few cross-references. Output is often long; use page to read it in parts.",
    schema: S.IllustrationStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getIllustrationStudyPack(env, a.reference, a.version, a.include_xrefs)
  }),
  defineTool({
    name: "lesson_creator_study_pack",
    title: "Lesson Creator Pack",
    tier: "study_pack",
    description:
      "Material for a Sunday school or small-group lesson: Scripture text, Adam Clarke's chapter-opening synopsis, Ellicott's historical commentary and cross-references.",
    schema: S.LessonCreatorStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getLessonCreatorStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "devotional_study_pack",
    title: "Devotional Study Pack",
    tier: "study_pack",
    description:
      "Devotional material for a passage: Scripture text, Tyndale Open Study Notes, Matthew Henry's Concise Commentary, related biblical promises and cross-references.",
    schema: S.DevotionalStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getDevotionalStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "prayer_guide_study_pack",
    title: "Prayer Guide Pack",
    tier: "study_pack",
    description:
      "Material for praying through a passage: Scripture text, Joseph Benson, John Wesley and Matthew Henry's Concise Commentary, plus related biblical promises.",
    schema: S.PrayerGuideStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getPrayerGuideStudyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "passage_exegesis_pack",
    title: "Passage Exegesis Pack",
    tier: "study_pack",
    description:
      "Scholarly exegesis of a passage: translation plus original Hebrew/Greek text, morphology, the Septuagint for Old Testament passages, technical commentaries (Keil & Delitzsch, Meyer, Expositor's Greek NT, JFB, Clarke, Pulpit) and cross-references.",
    schema: S.PassageExegesisPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getPassageExegesisPack(env, a.reference, a.version, a.include_original, a.extra_commentators)
  }),
  defineTool({
    name: "word_study_pack",
    title: "Word Study Pack",
    tier: "study_pack",
    description:
      "Study one Greek or Hebrew word by Strong's number: lexicon definitions; with a reference, its parsing in that verse, plus A. T. Robertson and Marvin Vincent's notes for New Testament verses.",
    schema: S.WordStudyPackSchema,
    mcpErrors: "never",
    restAliases: { strongs: "strongs_number", query: "strongs_number", ...PASSAGE },
    run: (env, a) => getWordStudyPack(env, a.strongs_number, a.reference, a.lexicon)
  }),
  defineTool({
    name: "interlinear_study_pack",
    title: "Interlinear Study Pack",
    tier: "study_pack",
    description:
      "Word-by-word Greek or Hebrew interlinear for a passage with English glosses, parsing and a glossary of notable words. Choose inline, ruby or table layout with display_mode.",
    schema: S.InterlinearStudyPackSchema,
    mcpErrors: "on_error",
    restAliases: { ...PASSAGE, displayMode: "display_mode" },
    run: (env, a) => getInterlinearStudyPack(env, a.reference, a.glossary_filter, a.gloss_color, a.display_mode)
  }),
  defineTool({
    name: "septuagint_study_pack",
    title: "Septuagint Study Pack",
    tier: "study_pack",
    description:
      "Compare an Old Testament passage across the Hebrew Masoretic Text, the Greek Septuagint (with Brenton's English) and a modern translation, with Keil & Delitzsch, Clarke and New Testament quotations. Old Testament references only.",
    schema: S.SeptuagintStudyPackSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => getSeptuagintStudyPack(env, a.reference, a.version)
  }),
  defineTool({
    name: "ot_in_nt_study_pack",
    title: "OT in NT Study Pack",
    tier: "study_pack",
    description:
      "How the New Testament quotes or alludes to the Old Testament at a passage: aligned NT Greek, Hebrew text, Septuagint and translation, with Calvin, Gill and cross-references.",
    schema: S.OtInNtStudyPackSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => getOtInNtStudyPack(env, a.reference, a.version)
  }),
  defineTool({
    name: "covenant_theology_pack",
    title: "Covenant Theology Pack",
    tier: "study_pack",
    description:
      "Covenant and redemptive-history study of a passage: Scripture text, John Calvin, John Gill, the ISBE encyclopedia article on covenant, Old Testament quotations and cross-references.",
    schema: S.CovenantTheologyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getCovenantTheologyPack(env, a.reference, a.version, a.extra_commentators)
  }),
  defineTool({
    name: "commentary_study_pack",
    title: "Commentary Study Pack",
    tier: "study_pack",
    description:
      "Several commentaries on one passage in a single call. Pass commentators to choose which (keys from get_available_resources); order_mode sets modern-first or classic-first order. Output is often long; use page to read it in parts.",
    schema: S.CommentaryStudyPackSchema,
    mcpErrors: "never",
    restAliases: PASSAGE,
    run: (env, a) => getCommentaryStudyPack(env, a.reference, a.commentators, a.order_mode)
  }),
  defineTool({
    name: "topic_study_pack",
    title: "Topic Study Pack",
    tier: "study_pack",
    description:
      "One-call topical study: the Tyndale Bible Dictionary article on the topic plus related biblical promises with full Scripture text.",
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
    title: "Bible Lookup",
    tier: "specialized",
    description:
      "Get the text of a verse, range or whole chapter in a chosen translation (default BSB). Accepts references like 'John 3:16', 'Romans 8:28-30', 'Matt 5:1-7:27' or 'Psalm 23'. Always use this to quote Scripture rather than quoting from memory.",
    schema: S.BibleLookupSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupBiblePassage(env, a.version, a.reference)
  }),
  defineTool({
    name: "bible_search",
    title: "Bible Search",
    tier: "specialized",
    description:
      "Find verses containing a word or phrase in one translation, optionally limited to one book. Supports * wildcards and + (and) / | (or). Returns matching verses with references.",
    schema: S.BibleSearchSchema,
    mcpErrors: "on_error",
    restAliases: { text: "query", book: "book_filter" },
    run: (env, a) => searchBible(env, a.query, a.version, a.book_filter, a.limit)
  }),
  defineTool({
    name: "parallel_passages",
    title: "Parallel Passages",
    tier: "specialized",
    description:
      "Find parallel accounts of an event or teaching (for example Gospel harmonies such as 'Feeding the 5000' or 'Sermon on the Mount'), optionally with the full text of each passage.",
    schema: S.ParallelPassagesSchema,
    mcpErrors: "on_error",
    restAliases: { reference: "query", passage: "query" },
    run: (env, a) => lookupParallels(env, a.query, a.include_text, a.version)
  }),
  defineTool({
    name: "daily_reading",
    title: "Daily Reading",
    tier: "specialized",
    description:
      "The Bible reading plan's passages for today or a given date (YYYY-MM-DD), optionally with full Scripture text.",
    schema: S.DailyReadingSchema,
    mcpErrors: "on_error",
    run: (env, a) => getDailyReading(env, a.date, a.include_text, a.version)
  }),

  // --- Commentaries & cross-references ---
  defineTool({
    name: "commentary_lookup",
    title: "Commentary Lookup",
    tier: "specialized",
    description:
      "One commentary's notes on a passage. Choose the commentary with version (default Matthew Henry); call get_available_resources with category 'commentaries' for valid keys. If a verse has no note, try the whole chapter.",
    schema: S.CommentaryLookupSchema,
    mcpErrors: "on_error",
    restAliases: { commentary: "version", ...PASSAGE },
    run: (env, a) => lookupCommentary(env, a.version, a.reference)
  }),
  defineTool({
    name: "cross_references",
    title: "Cross References",
    tier: "specialized",
    description:
      "Related passages for a verse from the Treasury of Scripture Knowledge, grouped by the word or phrase they connect to.",
    schema: S.CrossReferenceSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupCrossReferences(env, a.reference, a.limit)
  }),

  // --- Original languages & textual alignment ---
  defineTool({
    name: "lexicon_lookup",
    title: "Lexicon Lookup",
    tier: "specialized",
    description:
      "Definition of a Greek or Hebrew word by Strong's number (e.g. G26, H7225), from Thayer, BDB, LSJ or STEPBible lexicons. Set lexicon to choose a source, or 'all'.",
    schema: S.LexiconLookupSchema,
    mcpErrors: "on_error",
    restAliases: { strongs: "strongs_number", query: "strongs_number" },
    run: (env, a) => lookupLexiconEntry(env, a.strongs_number, a.lexicon)
  }),
  defineTool({
    name: "morphology_lookup",
    title: "Morphology Lookup",
    tier: "specialized",
    description:
      "Word-by-word Greek or Hebrew parsing for a verse: original word, lemma, transliteration, gloss, and grammar (tense, voice, mood, case, number).",
    schema: S.MorphologyLookupSchema,
    mcpErrors: "on_error",
    restAliases: PASSAGE,
    run: (env, a) => lookupMorphology(env, a.reference)
  }),
  defineTool({
    name: "interlinear_lookup",
    title: "Interlinear Lookup",
    tier: "specialized",
    description:
      "Word-by-word Greek or Hebrew interlinear for a passage, with English glosses and a glossary of notable words. Choose inline, ruby or table layout with display_mode.",
    schema: S.InterlinearLookupSchema,
    mcpErrors: "on_error",
    restAliases: { ...PASSAGE, displayMode: "display_mode" },
    run: (env, a) => lookupInterlinear(env, a.reference, a.glossary_filter, a.gloss_color, a.display_mode)
  }),
  defineTool({
    name: "septuagint_lookup",
    title: "Septuagint Lookup",
    tier: "specialized",
    description:
      "Greek Septuagint (LXX) text with Brenton's English translation and notes on where it differs from the Hebrew, for an Old Testament passage.",
    schema: S.SeptuagintLookupSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => lookupSeptuagint(env, a.reference)
  }),
  defineTool({
    name: "ot_quotations_lookup",
    title: "OT Quotations Lookup",
    tier: "specialized",
    description:
      "Old Testament passages quoted or alluded to at a New Testament reference (or New Testament uses of an Old Testament passage), including Septuagint links.",
    schema: S.OtQuotationsLookupSchema,
    mcpErrors: "on_empty",
    restAliases: PASSAGE,
    run: (env, a) => lookupOtQuotations(env, a.reference)
  }),

  // --- Theology, doctrine & devotion ---
  defineTool({
    name: "theological_dictionary",
    title: "Bible Dictionary",
    tier: "specialized",
    description:
      "A dictionary or encyclopedia article on a biblical or theological term. Sources: tyndale (default), isbe, easton, smith, fausset, morrish, vine, or collection (several classic sources). Articles can be long; use page to read in parts.",
    schema: S.TheologicalDictionarySchema,
    mcpErrors: "on_error",
    restAliases: { query: "term", word: "term" },
    run: (env, a) => (a.source === "isbe" ? lookupEncyclopedia(env, a.term, a.source) : lookupDictionary(env, a.term, a.source))
  }),
  defineTool({
    name: "topic_study",
    title: "Topical Index",
    tier: "specialized",
    description:
      "Topical Bible index for a subject (Nave's/Torrey style): subtopics with their Scripture references. Common topics are long; use page to read in parts.",
    schema: S.TopicStudySchema,
    mcpErrors: "on_error",
    restAliases: { topic: "query", term: "query" },
    run: (env, a) => lookupTopic(env, a.query)
  }),
  defineTool({
    name: "biblical_promises",
    title: "Biblical Promises",
    tier: "specialized",
    description:
      "Bible promises for a life situation or need (e.g. 'Peace', 'Fear', 'Strength'), optionally with the full text of each passage.",
    schema: S.BiblicalPromisesSchema,
    mcpErrors: "on_error",
    restAliases: { category: "topic", query: "topic" },
    run: (env, a) => lookupPromises(env, a.topic, a.include_text, a.version)
  }),

  // --- People, places, history & culture ---
  defineTool({
    name: "character_lookup",
    title: "Bible Character",
    tier: "specialized",
    description:
      "Biography of a person in the Bible: description, family relationships and key passages, with a family tree.",
    schema: S.CharacterLookupSchema,
    mcpErrors: "on_error",
    restAliases: { query: "name", character: "name" },
    run: (env, a) => lookupCharacter(env, a.name)
  }),
  defineTool({
    name: "location_lookup",
    title: "Bible Location",
    tier: "specialized",
    description:
      "A biblical place: coordinates, a map link, and a historical and archaeological description.",
    schema: S.LocationLookupSchema,
    mcpErrors: "on_error",
    restAliases: { query: "location", name: "location" },
    run: (env, a) => lookupLocation(env, a.location)
  }),
  defineTool({
    name: "entity_disambiguation",
    title: "Name Disambiguation",
    tier: "specialized",
    description:
      "Tell apart different people or places that share a name (e.g. Mary, James, John, Herod), with each one's identity, family, role and key passages.",
    schema: S.EntityDisambiguationSchema,
    mcpErrors: "on_empty",
    run: (env, a) => lookupEntityDisambiguation(env, a.name)
  }),
  defineTool({
    name: "convert_ancient_units",
    title: "Ancient Unit Converter",
    tier: "specialized",
    description:
      "Convert a biblical weight, measure, distance or coin (e.g. talent, shekel, cubit, ephah, denarius) to modern metric and imperial units, with an indication of its value in wages.",
    schema: S.ConvertAncientUnitsSchema,
    mcpErrors: "on_empty",
    run: (env, a) => convertAncientUnits(env, a.unit, a.amount)
  }),
  defineTool({
    name: "bible_names",
    title: "Bible Names",
    tier: "specialized",
    description:
      "Meaning and origin of a biblical name.",
    schema: S.BibleNamesSchema,
    mcpErrors: "on_error",
    restAliases: { name: "query", search: "query" },
    run: (env, a) => lookupBibleNames(env, a.query)
  }),
  defineTool({
    name: "chronology",
    title: "Bible Chronology",
    tier: "specialized",
    description:
      "Dated events from a biblical timeline matching a person, period or event (e.g. 'David', 'Exodus', 'Kings of Judah').",
    schema: S.ChronologySchema,
    mcpErrors: "on_error",
    restAliases: { period: "query", event: "query" },
    run: (env, a) => lookupChronology(env, a.query)
  }),
  defineTool({
    name: "book_analysis",
    title: "Book Introduction",
    tier: "specialized",
    description:
      "Introduction to a Bible book from the Tyndale Open Study Notes: purpose, author, date and setting. Set detail to 'full' for the complete introduction.",
    schema: S.BookAnalysisSchema,
    mcpErrors: "on_error",
    restAliases: { query: "book" },
    run: (env, a) => lookupBookAnalysis(env, a.book, a.detail)
  }),
  defineTool({
    name: "chapter_summary",
    title: "Chapter Summary",
    tier: "specialized",
    description:
      "Adam Clarke's synopsis at the opening of a Bible chapter, summarising its contents.",
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
