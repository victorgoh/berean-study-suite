import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetAvailableResourcesSchema,
  BibleLookupSchema,
  BibleSearchSchema,
  CommentaryLookupSchema,
  CrossReferenceSchema,
  LexiconLookupSchema,
  MorphologyLookupSchema,
  TopicStudySchema,
  CharacterLookupSchema,
  LocationLookupSchema,
  TheologicalDictionarySchema,
  ParallelPassagesSchema,
  BiblicalPromisesSchema,
  BookAnalysisSchema,
  ChapterSummarySchema,
  BibleNamesSchema,
  ChronologySchema,
  DailyReadingSchema,
  SermonStudyPackSchema,
  IllustrationStudyPackSchema,
  DevotionalStudyPackSchema,
  PassageExegesisPackSchema,
  WordStudyPackSchema,
  TopicStudyPackSchema,
  CommentaryStudyPackSchema,
  LessonCreatorStudyPackSchema,
  PrayerGuideStudyPackSchema,
  CovenantTheologyPackSchema,
  InterlinearLookupSchema,
  InterlinearStudyPackSchema,
  OtQuotationsLookupSchema,
  OtInNtStudyPackSchema,
  SeptuagintLookupSchema,
  SeptuagintStudyPackSchema,
  EntityDisambiguationSchema,
  ConvertAncientUnitsSchema
} from "./tools.js";
import { getAvailableResources } from "../services/catalogService.js";
import { BEREAN_PERSONAS, WORKFLOW_PROMPTS } from "./prompts.js";
import { RESOURCE_DEFINITIONS, getResourceContent } from "./resources.js";
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
import {
  lookupEntityDisambiguation,
  convertAncientUnits
} from "../services/unitsAndEntitiesService.js";
import { Env } from "../types.js";
import { z } from "zod";
import { normalizeMcpToolResult } from "./output.js";
import { OutputModeSchema } from "./tools.js";

export function createMcpServer(env: Env) {
  const baseServer = new McpServer({
    name: "berean-mcp",
    version: "1.0.0"
  });

  // Apply the MCP response policy once at the registration boundary. This
  // keeps all tools consistent without changing the underlying REST/Explorer
  // presentation paths.
  const server = new Proxy(baseServer, {
    get(target, property, receiver) {
      if (property === "tool") {
        return (...args: any[]) => {
          const callbackIndex = args.length - 1;
          const callback = args[callbackIndex];
          if (typeof callback !== "function") return (target as any).tool(...args);
          // Add the shared option to every tool without repeating it in all
          // individual Zod input-shape declarations.
          if (args.length >= 3 && args[2] && typeof args[2] === "object") {
            args[2] = { ...args[2], ...OutputModeSchema };
          }
          args[callbackIndex] = async (input: unknown, ...rest: unknown[]) => {
            const result = await callback(input, ...rest);
            return normalizeMcpToolResult(result, input);
          };
          return (target as any).tool(...args);
        };
      }
      return Reflect.get(target, property, receiver);
    }
  }) as McpServer;

  const exposeStudyPacks = env.MCP_PROFILE === "human";

  // --- Register Tools ---

  // =========================================================================
  // TIER 0: RESOURCE CATALOG & DISCOVERY
  // =========================================================================

  // 1. Resource Catalog Discovery
  server.tool(
    "get_available_resources",
    "List all available Bible translations, classical commentary sets, original language lexicons, study packs, and personas in this Berean MCP instance.",
    GetAvailableResourcesSchema,
    async ({ category }) => {
      const res = await getAvailableResources(env, {
        category,
        includeStudyPacks: env.MCP_PROFILE === "human"
      });
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // =========================================================================
  if (exposeStudyPacks) {
  // TIER 1: HUMAN-ORIENTED COMPOSITE STUDY PACKS (One-Shot Multi-Engine Endpoints)
  // =========================================================================

  // --- Ministry, Homiletics & Practical Application ---

  // 2. Sermon Study Pack
  server.tool(
    "sermon_study_pack",
    "High-speed composite tool that bundles scripture text, historical commentaries, and cross-references for sermon preparation in a single one-shot response.",
    SermonStudyPackSchema,
    async ({ reference, version, include_xrefs }) => {
      const res = await getSermonStudyPack(env, reference, version, include_xrefs);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  server.tool(
    "illustration_study_pack",
    "Opt-in fuller pack for Biblical Illustrator anecdotes and sermon illustrations, with Scripture and a few cross-references.",
    IllustrationStudyPackSchema,
    async ({ reference, version, include_xrefs }) => {
      const res = await getIllustrationStudyPack(env, reference, version, include_xrefs);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 3. Lesson Creator Study Pack (Sunday School & Small Groups)
  server.tool(
    "lesson_creator_study_pack",
    "Focused teaching pack with Scripture, a sourced chapter opening, Ellicott's historical context, and cross-references.",
    LessonCreatorStudyPackSchema,
    async ({ reference, version }) => {
      const res = await getLessonCreatorStudyPack(env, reference, version);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 4. Devotional Study Pack
  server.tool(
    "devotional_study_pack",
    "High-speed composite tool that bundles scripture text, meditation cross-references, and biblical promises for devotional reflections in a single one-shot response.",
    DevotionalStudyPackSchema,
    async ({ reference, version }) => {
      const res = await getDevotionalStudyPack(env, reference, version);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 5. Prayer Guide Study Pack (Scriptural Intercession)
  server.tool(
    "prayer_guide_study_pack",
    "High-speed composite tool that bundles scripture text, Spurgeon/Benson adoration, Wesley examination, and biblical promises for 1st-person ACTS prayer.",
    PrayerGuideStudyPackSchema,
    async ({ reference, version }) => {
      const res = await getPrayerGuideStudyPack(env, reference, version);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Scholarly Exegesis & Original Languages ---

  // 6. Passage Exegesis Pack
  server.tool(
    "passage_exegesis_pack",
    "High-speed composite tool that bundles primary translation, original Hebrew/Greek text (OHGB), morphological parsing, and historical commentaries for scholarly exegesis.",
    PassageExegesisPackSchema,
    async ({ reference, version, include_original }) => {
      const res = await getPassageExegesisPack(env, reference, version, include_original);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 7. Word Study Pack
  server.tool(
    "word_study_pack",
    "High-speed composite tool that bundles Strong's lexicon definition, in-context morphological parsing, and linguistic guardrails against totality transfer.",
    WordStudyPackSchema,
    async ({ strongs_number, reference, lexicon }) => {
      const res = await getWordStudyPack(env, strongs_number, reference, lexicon);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 8. Interlinear Study Pack (Original Language Syntax & Glosses)
  server.tool(
    "interlinear_study_pack",
    "High-speed composite tool that generates an inline Greek/Hebrew to English word-by-word interlinear with continuous verse layout, grammatical parsing, and original language glossary.",
    InterlinearStudyPackSchema,
    async ({ reference, glossary_filter, gloss_color, display_mode }) => {
      const res = await getInterlinearStudyPack(env, reference, glossary_filter, gloss_color, display_mode);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Textual Criticism & Canonical Hermeneutics ---

  // 9. Greek Septuagint Study Pack (12th Composite Pack)
  server.tool(
    "septuagint_study_pack",
    "Comprehensive composite study pack analyzing the Greek Septuagint (LXX), Brenton English translation, Dead Sea Scrolls textual variants, and Hebrew Masoretic Text comparative exegesis.",
    SeptuagintStudyPackSchema,
    async ({ reference, version }) => {
      const res = await getSeptuagintStudyPack(env, reference, version);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 10. OT-in-NT Study Pack (11th Composite Pack)
  server.tool(
    "ot_in_nt_study_pack",
    "Comprehensive composite study pack analyzing Old Testament quotations and allusions in the New Testament with verbatim Hebrew MT, Greek LXX, and Greek NT alignment, apostolic hermeneutics, and Christological fulfillment.",
    OtInNtStudyPackSchema,
    async ({ reference, version }) => {
      const res = await getOtInNtStudyPack(env, reference, version);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Systematic & Redemptive-Historical Synthesis ---

  // 11. Covenant Theology Pack (Redemptive-Historical Synthesis)
  server.tool(
    "covenant_theology_pack",
    "High-speed composite tool that bundles scripture text, John Calvin's Christocentric exposition, John Gill's rabbinic/prophetic insights, ISBE articles, and canonical cross-references.",
    CovenantTheologyPackSchema,
    async ({ reference, version }) => {
      const res = await getCovenantTheologyPack(env, reference, version);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 12. Commentary Study Pack (Multi-Commentary Bundler)
  server.tool(
    "commentary_study_pack",
    "High-speed composite tool that retrieves multiple biblical commentaries (e.g. Tyndale Open Study Notes, Matthew Henry, JFB, Calvin, Maclaren, Barnes, Spurgeon) for a passage in a single request with priority ordering.",
    CommentaryStudyPackSchema,
    async ({ reference, commentators, order_mode }) => {
      const res = await getCommentaryStudyPack(env, reference, commentators, order_mode);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 13. Topic Study Pack
  server.tool(
    "topic_study_pack",
    "High-speed composite tool that bundles theological dictionary definitions and scriptural promises for topical and doctrinal studies.",
    TopicStudyPackSchema,
    async ({ topic, version }) => {
      const res = await getTopicStudyPack(env, topic, version);
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // =========================================================================
  }

  // TIER 2: SPECIALIZED SINGLE-ENGINE TOOLS (Granular Academic Engines)
  // =========================================================================

  // --- Group A: Scripture Texts & Translations ---

  // 14. Bible Lookup
  server.tool(
    "bible_lookup",
    "Retrieve Bible verses from verified biblical translations (e.g. NET, KJV, ASV, WEB, BBE, OHGB).",
    BibleLookupSchema,
    async ({ version, reference }) => {
      const res = await lookupBiblePassage(env, version, reference);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 15. Bible Search
  server.tool(
    "bible_search",
    "Search for words or phrases in one or all books across Bible translations with wildcard and boolean support.",
    BibleSearchSchema,
    async ({ query, version, book_filter, limit }) => {
      const res = await searchBible(env, query, version, book_filter, limit);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 16. Parallel Passages
  server.tool(
    "parallel_passages",
    "Retrieve and compare Gospel harmonies and Old/New Testament parallel passages and pericopes.",
    ParallelPassagesSchema,
    async ({ query, include_text, version }) => {
      const res = await lookupParallels(env, query, include_text, version);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 17. Daily Reading
  server.tool(
    "daily_reading",
    "Retrieve scheduled daily Bible readings for today or any specified date, complete with full scripture passages.",
    DailyReadingSchema,
    async ({ date, include_text, version }) => {
      const res = await getDailyReading(env, date, include_text, version);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Group B: Classical Commentaries & Cross-References ---

  // 18. Commentary Lookup
  server.tool(
    "commentary_lookup",
    "Retrieve historical and expository biblical commentaries (Matthew Henry, Jamieson-Fausset-Brown, John Calvin) for passages.",
    CommentaryLookupSchema,
    async ({ version, reference }) => {
      const res = await lookupCommentary(env, version, reference);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 19. Cross References
  server.tool(
    "cross_references",
    "Retrieve rich inter-biblical cross references linking OT and NT scriptures (Treasury of Scripture Knowledge).",
    CrossReferenceSchema,
    async ({ reference, limit }) => {
      const res = await lookupCrossReferences(env, reference, limit);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Group C: Original Languages & Textual Alignment ---

  // 20. Lexicon Lookup
  server.tool(
    "lexicon_lookup",
    "Look up definitions, Strong's concordance data, and lexical domains for Greek and Hebrew words (Thayer, BDB, LSJ).",
    LexiconLookupSchema,
    async ({ strongs_number, lexicon }) => {
      const res = await lookupLexiconEntry(env, strongs_number, lexicon);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 21. Morphology Lookup
  server.tool(
    "morphology_lookup",
    "Parse original Hebrew / Greek morphology, grammar, verb tenses, syntactical cases, and transliterations for a verse.",
    MorphologyLookupSchema,
    async ({ reference }) => {
      const res = await lookupMorphology(env, reference);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 22. Inline Interlinear Lookup
  server.tool(
    "interlinear_lookup",
    "Generate an inline word-by-word Greek/Hebrew to English interlinear with continuous verse layout and an automated glossary of rare/notable words at the bottom.",
    InterlinearLookupSchema,
    async ({ reference, glossary_filter, gloss_color, display_mode }) => {
      const res = await lookupInterlinear(env, reference, glossary_filter, gloss_color, display_mode);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 23. Septuagint Greek & Brenton English Lookup
  server.tool(
    "septuagint_lookup",
    "Look up Greek Septuagint (LXX) text, Brenton English translation, and textual divergence notes for any Old Testament passage.",
    SeptuagintLookupSchema,
    async ({ reference }) => {
      const res = await lookupSeptuagint(env, reference);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 24. OT Quotations & Allusions Lookup Engine
  server.tool(
    "ot_quotations_lookup",
    "Look up Old Testament quotations, citations, allusions, and Septuagint bridge references for any NT or OT passage.",
    OtQuotationsLookupSchema,
    async ({ reference }) => {
      const res = await lookupOtQuotations(env, reference);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Group D: Theology, Doctrines & Devotional Tools ---

  // 25. Theological Dictionary & Encyclopedia
  server.tool(
    "theological_dictionary",
    "Look up source-labelled articles and definitions from Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the combined classic reference collection.",
    TheologicalDictionarySchema,
    async ({ term, source }) => {
      let res;
      if (source === "isbe") {
        res = await lookupEncyclopedia(env, term, source);
      } else {
        res = await lookupDictionary(env, term, source);
      }
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 26. Topic Study
  server.tool(
    "topic_study",
    "Topical Bible study retrieving comprehensive scripture outlines and doctrinal subtopics (Nave's / Torrey Topical datasets).",
    TopicStudySchema,
    async ({ query }) => {
      const res = await lookupTopic(env, query);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 27. Biblical Promises
  server.tool(
    "biblical_promises",
    "Retrieve categorized biblical promises and scriptures for specific life situations and spiritual needs.",
    BiblicalPromisesSchema,
    async ({ topic, include_text, version }) => {
      const res = await lookupPromises(env, topic, include_text, version);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Group E: Historical, Geographical & Cultural Backgrounds ---

  // 28. Character Lookup
  server.tool(
    "character_lookup",
    "Retrieve rich biographical data, parental ancestry, KJV occurrences, and visual ASCII family & relationship trees for Bible figures.",
    CharacterLookupSchema,
    async ({ name }) => {
      const res = await lookupCharacter(env, name);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 29. Location Lookup
  server.tool(
    "location_lookup",
    "Retrieve geographical coordinates, live Google Map links, and historical-archaeological descriptions of Bible places.",
    LocationLookupSchema,
    async ({ location }) => {
      const res = await lookupLocation(env, location);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 30. Biblical Entity Disambiguation Engine
  server.tool(
    "entity_disambiguation",
    "Disambiguate biblical persons or locations sharing identical names (e.g. Mary, James, John, Zechariah, Herod), returning exact identities, lineages, roles, and biblical passages.",
    EntityDisambiguationSchema,
    async ({ name }) => {
      const res = await lookupEntityDisambiguation(env, name);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 31. Ancient Biblical Units & Currency Converter
  server.tool(
    "convert_ancient_units",
    "Convert ancient biblical weights (Talent, Shekel, Mina), dry/liquid measurements (Cor, Ephah, Bath, Hin, Omer), distances (Cubit, Span, Stadion), and currencies (Denarius, Drachma, Stater, Talent, Mite) into modern metric, imperial, and labor-wage purchasing power.",
    ConvertAncientUnitsSchema,
    async ({ unit, amount }) => {
      const res = await convertAncientUnits(env, unit, amount);
      if (res.error && !res.formattedText) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 32. Bible Names
  server.tool(
    "bible_names",
    "Look up meanings, linguistic origins, and occurrences of biblical names.",
    BibleNamesSchema,
    async ({ query }) => {
      const res = await lookupBibleNames(env, query);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 33. Chronology
  server.tool(
    "chronology",
    "Search biblical chronology, timelines, date spans, and sequencing of historical events (Kings of Israel/Judah, Paul).",
    ChronologySchema,
    async ({ query }) => {
      const res = await lookupChronology(env, query);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 34. Source-attributed Book Guide
  server.tool(
    "book_analysis",
    "Retrieve a source-attributed Tyndale Open Study Notes book summary or full introduction.",
    BookAnalysisSchema,
    async ({ book, detail }) => {
      const res = await lookupBookAnalysis(env, book, detail);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // 35. Source-attributed Chapter Summary
  server.tool(
    "chapter_summary",
    "Retrieve Adam Clarke's source-attributed chapter-opening synopsis for any Bible chapter.",
    ChapterSummarySchema,
    async ({ book, chapter }) => {
      const res = await lookupChapterSummary(env, book, chapter);
      if (res.error) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
      }
      return { content: [{ type: "text" as const, text: res.formattedText || "" }] };
    }
  );

  // --- Register Prompts (15 Personas & Workflows) ---

  for (const [key, persona] of Object.entries(BEREAN_PERSONAS)) {
    server.prompt(
      persona.name,
      persona.description,
      {
        topic: z.string().optional().describe("Specific passage or topic to address")
      },
      async ({ topic }) => {
        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: `${persona.instructions}\n\nUser request regarding: ${topic || "general biblical inquiry"}`
              }
            }
          ]
        };
      }
    );
  }

  for (const [key, workflow] of Object.entries(WORKFLOW_PROMPTS)) {
    server.prompt(
      workflow.name,
      workflow.description,
      workflow.argsSchema,
      async (args: any) => {
        const customInstructions = (workflow as any).instructions;
        const promptBody = customInstructions
          ? `${customInstructions}\n\nUser Arguments: ${JSON.stringify(args || {})}`
          : `Execute workflow '${workflow.name}' with the following input:\n${JSON.stringify(args || {}, null, 2)}`;

        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: promptBody
              }
            }
          ]
        };
      }
    );
  }

  // --- Register Resources ---

  for (const res of RESOURCE_DEFINITIONS) {
    server.resource(
      res.name,
      res.uri,
      async (uri) => {
        const text = getResourceContent(uri.href) || "{}";
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: res.mimeType,
              text
            }
          ]
        };
      }
    );
  }

  return server;
}
