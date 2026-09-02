import { z } from "zod";
import { COMMENTARIES_LIST, LEXICON_REGISTRY } from "../config/databaseMap.js";

// MCP clients may omit this field; the server defaults to compact output.
// It is included in the shared tool shape as the rollout expands across the
// tool catalog.
export const OutputModeSchema = {
  output_mode: z.enum(["compact", "standard", "full"]).default("compact").describe(
    "Response detail: compact minimizes AI context usage, standard is balanced, and full is comprehensive for human reading."
  )
};

// =========================================================================
// TIER 0: RESOURCE CATALOG & DISCOVERY
// =========================================================================

export const GetAvailableResourcesSchema = {
  category: z.enum(["all", "bibles", "commentaries", "lexicons", "study_packs", "personas", "skills", "workflows", "rules"]).default("all").describe("Filter resources by category: 'all', 'bibles', 'commentaries', 'lexicons', 'study_packs', 'personas', 'skills', 'workflows', 'rules'")
};

// =========================================================================
// TIER 1: HIGH-SPEED COMPOSITE STUDY PACKS (One-Shot Multi-Engine Endpoints)
// =========================================================================

// --- Ministry, Homiletics & Practical Application ---

export const SermonStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference to prepare a sermon on, e.g. 'Romans 8:1-11', 'Ephesians 2:1-10'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_xrefs: z.boolean().default(true).describe("Whether to include key cross-references"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional available commentators to bundle dynamically, e.g. ['MacL', 'HH', 'Calvin', 'Henry', 'Barnes', 'Spur']")
};

export const IllustrationStudyPackSchema = {
  reference: z.string().describe("Scripture passage for historical anecdotes and sermon illustrations, e.g. 'Romans 8:28', 'Psalm 23:1'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_xrefs: z.boolean().default(true).describe("Whether to include a short list of related cross-references")
};

export const LessonCreatorStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for Sunday School or small group lesson planning, e.g. 'Luke 15:11-32', 'Acts 2:42-47'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional available commentators to bundle dynamically, e.g. ['Barnes', 'ECER', 'Henry']")
};

export const DevotionalStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for devotional reflection, e.g. 'Psalm 23', 'John 15:1-8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional available commentators to bundle dynamically, e.g. ['Spur', 'MacL', 'Henry']")
};

export const PrayerGuideStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for prayer and intercession, e.g. 'Psalm 51', 'Ephesians 3:14-21'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional available commentators to bundle dynamically, e.g. ['Spur', 'Henry', 'Benson']")
};

// --- Scholarly Exegesis & Original Languages ---

export const PassageExegesisPackSchema = {
  reference: z.string().describe("Scripture passage reference for deep scholarly exegesis, e.g. 'John 1:1-5', 'Romans 8:28-39'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_original: z.boolean().default(true).describe("Whether to include original Greek/Hebrew text (OHGB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional public domain commentators to bundle dynamically, e.g. ['CECNT', 'EGNT', 'KD', 'JFB']")
};

export const WordStudyPackSchema = {
  strongs_number: z.string().describe("Strong's number (e.g. 'G2842' for koinonia, 'H7225' for bereshit)"),
  reference: z.string().optional().describe("Optional verse reference for in-context grammatical morphology, e.g. 'Philippians 1:5'"),
  lexicon: z.string().default("strongs").describe("Lexicon source: 'thayer', 'bdb', 'lsj', 'strongs'")
};

export const InterlinearStudyPackSchema = {
  reference: z.string().describe("Passage reference for original language interlinear analysis, e.g., 'Philippians 4:4-8', 'John 1:1-5', 'Psalm 23'"),
  glossary_filter: z.enum(["rare_and_notable", "all", "none"]).default("rare_and_notable").describe("Filter mode for glossary entries at the bottom: 'rare_and_notable' (default), 'all', or 'none'"),
  gloss_color: z.string().default("#777777").describe("HTML hex color code for the English gloss (default: '#777777' for dark/light contrast)"),
  display_mode: z.enum(["inline", "ruby", "table"]).default("inline").describe("Interlinear visual layout mode: 'inline' (default: continuous text with adaptive grey gloss and small alphabetic footnote tags), 'ruby' (stacked text with English underneath original word), or 'table' (word-by-word structured table)")
};

// --- Textual Criticism & Canonical Hermeneutics ---

export const SeptuagintStudyPackSchema = {
  reference: z.string().describe("Old Testament passage reference for Septuagint and Hebrew MT comparative study, e.g., 'Genesis 1:1-5', 'Exodus 1:1-7', 'Psalm 40:1-8', 'Isaiah 7:10-17'"),
  version: z.string().default("BSB").describe("Bible translation version for standard English text (default: BSB)")
};

export const OtInNtStudyPackSchema = {
  reference: z.string().describe("Passage reference for apostolic hermeneutics and OT-in-NT fulfillment exegesis, e.g., 'Hebrews 8:8-12', 'Matthew 1:22-23', 'Romans 4:1-8', 'Galatians 3:10-14', '1 Peter 2:4-10'"),
  version: z.string().default("BSB").describe("Bible translation version for English text (default: BSB)")
};

// --- Systematic & Redemptive-Historical Synthesis ---

export const CovenantTheologyPackSchema = {
  reference: z.string().describe("Scripture passage reference for redemptive-historical covenant synthesis, e.g. 'Genesis 15', 'Hebrews 8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional available commentators to bundle dynamically, e.g. ['Calvin', 'Gill', 'Henry']")
};

export const CommentaryStudyPackSchema = {
  reference: z.string().describe("Passage reference to fetch multi-commentary perspectives for, e.g. 'John 3:16', 'Romans 8:28', 'Genesis 1:1'"),
  commentators: z.array(z.string()).optional().describe("Optional list of commentary versions or authors to include (e.g. ['TNotes', 'Henry', 'Calvin', 'Gill', 'JFB', 'Barnes', 'Clarke', 'Spur', 'MacL'])"),
  order_mode: z.enum(["modern_first", "classic_first", "custom"]).default("modern_first").describe("Ordering priority: 'modern_first' (Tyndale Open Study Notes / Barnes before classic puritans), 'classic_first' (Calvin/Gill/Henry first), or 'custom' (strict order of provided array)")
};

export const TopicStudyPackSchema = {
  topic: z.string().describe("Theological or biblical topic to study, e.g. 'Justification', 'Grace', 'Sanctification'"),
  version: z.string().default("BSB").describe("Bible translation version for scripture text (default: BSB)")
};

// =========================================================================
// TIER 2: SPECIALIZED SINGLE-ENGINE TOOLS (Granular Academic Engines)
// =========================================================================

// --- Group A: Scripture Texts & Translations ---

export const BibleLookupSchema = {
  version: z.string().default("BSB").describe("Bible version abbreviation, e.g. BSB, NET, KJV, ASV, WEB, BBE, OHGB"),
  reference: z.string().describe("Passage reference, e.g., 'John 3:16', 'Romans 8:28-30', 'Genesis 1:1-5'")
};

export const BibleSearchSchema = {
  query: z.string().describe("Word or phrase to search for. Supports wildcards (*) and combinations (+, |)"),
  version: z.string().default("BSB").describe("Bible version to search in, e.g. BSB, NET, KJV, WEB"),
  book_filter: z.string().optional().describe("Optional book name to restrict search, e.g., 'Romans', 'Genesis'"),
  limit: z.number().default(50).describe("Maximum number of matching verses to return")
};

export const ParallelPassagesSchema = {
  query: z.string().describe("Passage title or pericope to find parallels for, e.g. 'Sermon on the Mount', 'Feeding the 5000', 'Ten Commandments'"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of all parallel passages"),
  version: z.string().default("BSB").describe("Bible version for passage retrieval (default: BSB)")
};

export const DailyReadingSchema = {
  date: z.string().optional().describe("Optional ISO date (YYYY-MM-DD), defaults to today"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of assigned daily readings"),
  version: z.string().default("BSB").describe("Bible version for scripture text (default: BSB)")
};

// --- Group B: Classical Commentaries & Cross-References ---

export const CommentaryLookupSchema = {
  version: z.string().default("Henry").describe(`Commentary resource key or alias. Query get_available_resources(category=commentaries) for the current catalog. Canonical keys: ${COMMENTARIES_LIST.map(c => c.key).join(", ")}. Scope and aliases are returned by the catalog.`),
  reference: z.string().describe("Passage reference, e.g., 'Romans 8:28', 'John 1:1-5', 'Genesis 1'")
};

export const CrossReferenceSchema = {
  reference: z.string().describe("Passage reference to find cross references for, e.g. 'John 3:16'"),
  limit: z.number().default(15).describe("Maximum number of cross references to return")
};

// --- Group C: Original Languages & Textual Alignment ---

export const LexiconLookupSchema = {
  strongs_number: z.string().describe("Strong's number (e.g. 'G2889' for Greek kosmos, 'H7225' for Hebrew bereshit)"),
  lexicon: z.string().default("strongs").describe(`Lexicon source key or alias. Available canonical keys: ${LEXICON_REGISTRY.map(l => l.code).join(", ")}; runtime aliases include step, thayer, bdb, lsj, strongs, and all.`)
};

export const MorphologyLookupSchema = {
  reference: z.string().describe("Verse reference to fetch Greek/Hebrew morphological parsing for, e.g., 'John 1:1', 'Genesis 1:1'")
};

export const InterlinearLookupSchema = {
  reference: z.string().describe("Passage reference, e.g., 'Philippians 4:4-8', 'John 1:1-5', 'Psalm 23'"),
  glossary_filter: z.enum(["rare_and_notable", "all", "none"]).default("rare_and_notable").describe("Filter mode for glossary entries at the bottom: 'rare_and_notable' (default), 'all', or 'none'"),
  gloss_color: z.string().default("#777777").describe("HTML hex color code for the English gloss (default: '#777777' for dark/light contrast)"),
  display_mode: z.enum(["inline", "ruby", "table"]).default("inline").describe("Interlinear visual layout mode: 'inline' (default: continuous text with adaptive grey gloss and small alphabetic footnote tags), 'ruby' (stacked text with English underneath original word), or 'table' (word-by-word structured table)")
};

export const SeptuagintLookupSchema = {
  reference: z.string().describe("Old Testament Scripture reference for Septuagint Greek lookup, e.g., 'Genesis 1:1-5', 'Genesis 4:8', 'Exodus 3:14', 'Psalm 22:16', 'Isaiah 7:14'")
};

export const OtQuotationsLookupSchema = {
  reference: z.string().describe("New Testament or Old Testament passage reference to check for cross-testament citations, e.g., 'Hebrews 8:8', 'Matthew 1:23', 'Jeremiah 31:31', 'Isaiah 7:14', 'Romans 4:3'")
};

// --- Group D: Theology, Doctrines & Devotional Tools ---

export const TheologicalDictionarySchema = {
  term: z.string().describe("Theological or biblical term to look up, e.g. 'Atonement', 'Covenant', 'Grace', 'Justification', 'Sanctification'"),
  source: z.enum(["tyndale", "isbe", "easton", "smith", "fausset", "morrish", "vine", "collection"]).default("tyndale").describe("Source: 'tyndale' (default), 'isbe', 'easton', 'smith', 'fausset', 'morrish', 'vine', or 'collection' (combined classic references)")
};

export const TopicStudySchema = {
  query: z.string().describe("Topic or doctrine to study, e.g. 'Justification', 'Grace', 'Prayer', 'Faith', 'Baptism'")
};

export const BiblicalPromisesSchema = {
  topic: z.string().describe("Topic, situation, or need for promises, e.g. 'Comfort', 'Strength', 'Peace', 'Fear', 'Healing'"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of promises"),
  version: z.string().default("BSB").describe("Bible version for passage retrieval (default: BSB)")
};

// --- Group E: Historical, Geographical & Cultural Backgrounds ---

export const CharacterLookupSchema = {
  name: z.string().describe("Bible character or person name to study, e.g. 'David', 'Abraham', 'Paul', 'Moses', 'Ruth'")
};

export const LocationLookupSchema = {
  location: z.string().describe("Biblical place, city, mountain, or river, e.g. 'Jerusalem', 'Bethlehem', 'Sinai', 'Jordan'")
};

export const EntityDisambiguationSchema = {
  name: z.string().describe("Biblical name to disambiguate across identical persons or locations, e.g., 'Mary', 'James', 'John', 'Zechariah', 'Herod', 'Antioch'")
};

export const ConvertAncientUnitsSchema = {
  unit: z.string().describe("Biblical weight, measurement, or currency unit to convert, e.g., 'Talent', 'Shekel', 'Cubit', 'Denarius', 'Ephah', 'Bath', 'Span', 'Omer', 'Mite'"),
  amount: z.number().default(1).describe("Quantity/amount of the specified ancient unit (default: 1)")
};

export const BibleNamesSchema = {
  query: z.string().describe("Name or keyword to search meanings and origins for, e.g. 'Abigail', 'David', 'Joshua'")
};

export const ChronologySchema = {
  query: z.string().describe("Biblical timeline event or historical period, e.g. 'Exodus', 'David', 'Kings of Judah', 'Paul'")
};

export const BookAnalysisSchema = {
  book: z.string().describe("Bible book name or abbreviation, e.g. 'Romans', 'Genesis', 'Hebrews', 'Ezra'"),
  detail: z.enum(["summary", "full"]).default("summary").describe("Use 'summary' for the concise Tyndale book guide or 'full' for the complete Tyndale introduction.")
};

export const ChapterSummarySchema = {
  book: z.string().describe("Bible book name, e.g. 'Genesis', 'John', 'Romans'"),
  chapter: z.number().default(1).describe("Chapter number (e.g. 1, 3, 8)")
};
