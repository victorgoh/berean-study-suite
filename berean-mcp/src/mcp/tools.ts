import { z } from "zod";

export const GetAvailableResourcesSchema = {
  category: z.enum(["all", "bibles", "commentaries", "lexicons", "study_packs", "personas", "skills", "workflows", "rules"]).default("all").describe("Filter resources by category: 'all', 'bibles', 'commentaries', 'lexicons', 'study_packs', 'personas', 'skills', 'workflows', 'rules'")
};

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

export const CommentaryLookupSchema = {
  version: z.string().default("Henry").describe("Commentary version or author: 'Henry' (Matthew Henry), 'JFB' (Jamieson-Fausset-Brown), 'Calvin' (John Calvin), 'Barnes' (Albert Barnes), 'MacL' (Alexander Maclaren), 'HH' (Charles Simeon / Horae Homileticae), 'Benson' (Joseph Benson), 'Clarke' (Adam Clarke), 'Gill' (John Gill), 'CECNT' (Meyer NT), 'ECER' (Charles Ellicott), 'BI' (Biblical Illustrator), 'Spur' (Charles Spurgeon), 'Rob' (A. T. Robertson Word Pictures), 'Vincent' (Marvin Vincent Word Studies), 'KD' (Keil & Delitzsch OT), 'Wesley' (John Wesley)"),
  reference: z.string().describe("Passage reference, e.g., 'Romans 8:28', 'John 1:1-5', 'Genesis 1'")
};

export const CrossReferenceSchema = {
  reference: z.string().describe("Passage reference to find cross references for, e.g. 'John 3:16'"),
  limit: z.number().default(15).describe("Maximum number of cross references to return")
};

export const LexiconLookupSchema = {
  strongs_number: z.string().describe("Strong's number (e.g. 'G2889' for Greek kosmos, 'H7225' for Hebrew bereshit)"),
  lexicon: z.string().default("strongs").describe("Lexicon source: 'thayer', 'bdb', 'lsj', 'strongs'")
};

export const MorphologyLookupSchema = {
  reference: z.string().describe("Verse reference to fetch Greek/Hebrew morphological parsing for, e.g., 'John 1:1', 'Genesis 1:1'")
};

export const TopicStudySchema = {
  query: z.string().describe("Topic or doctrine to study, e.g. 'Justification', 'Grace', 'Prayer', 'Faith', 'Baptism'")
};

export const CharacterLookupSchema = {
  name: z.string().describe("Bible character or person name to study, e.g. 'David', 'Abraham', 'Paul', 'Moses', 'Ruth'")
};

export const LocationLookupSchema = {
  location: z.string().describe("Biblical place, city, mountain, or river, e.g. 'Jerusalem', 'Bethlehem', 'Sinai', 'Jordan'")
};

export const TheologicalDictionarySchema = {
  term: z.string().describe("Theological or biblical term to look up, e.g. 'Atonement', 'Covenant', 'Grace', 'Sanctification'"),
  source: z.enum(["easton", "isbe", "smith"]).default("easton").describe("Source: 'easton' (Easton's Bible Dict), 'isbe' (ISBE Encyclopedia), 'smith' (Smith's Bible Dict)")
};

export const ParallelPassagesSchema = {
  query: z.string().describe("Passage title or pericope to find parallels for, e.g. 'Sermon on the Mount', 'Feeding the 5000', 'Ten Commandments'"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of all parallel passages"),
  version: z.string().default("BSB").describe("Bible version for passage retrieval (default: BSB)")
};

export const BiblicalPromisesSchema = {
  topic: z.string().describe("Topic, situation, or need for promises, e.g. 'Comfort', 'Strength', 'Peace', 'Fear', 'Healing'"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of promises"),
  version: z.string().default("BSB").describe("Bible version for passage retrieval (default: BSB)")
};

export const BookAnalysisSchema = {
  book: z.string().describe("Bible book name or abbreviation, e.g. 'Romans', 'Genesis', 'Hebrews', 'Ezra'"),
  section: z.number().optional().describe("Optional section index (0: Overview, 1: Author, 2: Date, 3: Background, 4: Recipients, 5: Themes, 7: Outline)")
};

export const ChapterSummarySchema = {
  book: z.string().describe("Bible book name, e.g. 'Genesis', 'John', 'Romans'"),
  chapter: z.number().default(1).describe("Chapter number (e.g. 1, 3, 8)")
};

export const BibleNamesSchema = {
  query: z.string().describe("Name or keyword to search meanings and origins for, e.g. 'Abigail', 'David', 'Joshua'")
};

export const ChronologySchema = {
  query: z.string().describe("Biblical timeline event or historical period, e.g. 'Exodus', 'David', 'Kings of Judah', 'Paul'")
};

export const DailyReadingSchema = {
  date: z.string().optional().describe("Optional ISO date (YYYY-MM-DD), defaults to today"),
  include_text: z.boolean().default(true).describe("Whether to include the full scripture texts of assigned daily readings"),
  version: z.string().default("BSB").describe("Bible version for scripture text (default: BSB)")
};

export const SermonStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference to prepare a sermon on, e.g. 'Romans 8:1-11', 'Ephesians 2:1-10'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_xrefs: z.boolean().default(true).describe("Whether to include key cross-references")
};

export const DevotionalStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for devotional reflection, e.g. 'Psalm 23', 'John 15:1-8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  topic: z.string().optional().describe("Optional devotional theme or promise topic (e.g. 'Comfort', 'Peace', 'Grace')")
};

export const PassageExegesisPackSchema = {
  reference: z.string().describe("Scripture passage reference for deep scholarly exegesis, e.g. 'John 1:1-5', 'Romans 8:28-39'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_original: z.boolean().default(true).describe("Whether to include original Greek/Hebrew text (OHGB)")
};

export const WordStudyPackSchema = {
  strongs_number: z.string().describe("Strong's number (e.g. 'G2842' for koinonia, 'H7225' for bereshit)"),
  reference: z.string().optional().describe("Optional verse reference for in-context grammatical morphology, e.g. 'Philippians 1:5'"),
  lexicon: z.string().default("strongs").describe("Lexicon source: 'thayer', 'bdb', 'lsj', 'strongs'")
};

export const TopicStudyPackSchema = {
  topic: z.string().describe("Theological or biblical topic to study, e.g. 'Justification', 'Grace', 'Sanctification'"),
  version: z.string().default("BSB").describe("Bible translation version for scripture text (default: BSB)")
};

export const CommentaryStudyPackSchema = {
  reference: z.string().describe("Passage reference to fetch multi-commentary perspectives for, e.g. 'John 3:16', 'Romans 8:28'"),
  commentators: z.array(z.string()).default(["Henry", "JFB", "Calvin", "MacL", "Barnes", "Spur", "HH", "Clarke", "Gill"]).describe("List of commentary versions or authors to include (e.g. ['Henry', 'JFB', 'Calvin', 'MacL', 'Barnes', 'Spur', 'HH', 'Clarke', 'Gill', 'KD', 'CECNT', 'Pulpit'])")
};

export const LessonCreatorStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for Sunday School or small group lesson planning, e.g. 'Luke 15:11-32', 'Acts 2:42-47'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)")
};

export const PrayerGuideStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for prayer and intercession, e.g. 'Psalm 51', 'Ephesians 3:14-21'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  topic: z.string().optional().describe("Optional prayer theme or promise topic (e.g. 'Healing', 'Forgiveness', 'Guidance')")
};

export const CovenantTheologyPackSchema = {
  reference: z.string().describe("Scripture passage reference for redemptive-historical covenant synthesis, e.g. 'Genesis 15', 'Hebrews 8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)")
};

