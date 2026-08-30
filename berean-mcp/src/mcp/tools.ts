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
  version: z.string().default("Henry").describe("Commentary version or author: 'Guzik' (David Guzik - Enduring Word), 'Everett' (Gary Everett Study Notes), 'Utley' (Bob Utley), 'Ironside' (H.A. Ironside), 'Morgan' (G. Campbell Morgan), 'FBMeyer' (F.B. Meyer), 'EGNT' (Expositor's Greek NT), 'Henry' (Matthew Henry), 'JFB' (Jamieson-Fausset-Brown), 'Calvin' (John Calvin), 'Barnes' (Albert Barnes), 'MacL' (Alexander Maclaren), 'HH' (Charles Simeon), 'Gill' (John Gill), 'Alford' (Henry Alford Greek NT), 'Bullinger' (Companion Bible), 'Trapp' (John Trapp), 'Ryle' (J.C. Ryle), 'KD' (Keil & Delitzsch), 'Rob' (A.T. Robertson), 'Vincent' (Marvin Vincent), 'Spur' (Charles Spurgeon), 'Wesley' (John Wesley), 'Clarke' (Adam Clarke), 'Benson' (Joseph Benson), 'ECER' (Charles Ellicott), 'EBC' (Expositor's Bible), 'BI' (Biblical Illustrator), 'Pulpit' (The Pulpit Commentary), or any custom commentary name/key"),
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
  include_xrefs: z.boolean().default(true).describe("Whether to include key cross-references"),
  include_continuationist: z.boolean().default(false).describe("Dynamically include modern continuationist / spirit-filled expository commentary (David Guzik, Gary Everett)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically, e.g. ['Guzik', 'Everett', 'Calvin']")
};

export const DevotionalStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for devotional reflection, e.g. 'Psalm 23', 'John 15:1-8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_continuationist: z.boolean().default(false).describe("Dynamically include continuationist / spirit-led devotional reflections (David Guzik, Gary Everett)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically")
};

export const PassageExegesisPackSchema = {
  reference: z.string().describe("Scripture passage reference for deep scholarly exegesis, e.g. 'John 1:1-5', 'Romans 8:28-39'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_original: z.boolean().default(true).describe("Whether to include original Greek/Hebrew text (OHGB)"),
  include_continuationist: z.boolean().default(false).describe("Dynamically include continuationist / thematic structure commentary (David Guzik, Gary Everett)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically")
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
  reference: z.string().describe("Passage reference to fetch multi-commentary perspectives for, e.g. 'John 3:16', 'Romans 8:28', 'Genesis 1:1'"),
  commentators: z.array(z.string()).optional().describe("Optional list of commentary versions or authors to include (e.g. ['TNotes', 'Guzik', 'Calvin', 'Henry', 'Gill', 'JFB', 'Barnes', 'Clarke'])"),
  order_mode: z.enum(["modern_first", "classic_first", "custom"]).default("modern_first").describe("Ordering priority: 'modern_first' (TNotes/Guzik/Barnes before classic puritans), 'classic_first' (Calvin/Gill/Henry first), or 'custom' (strict order of provided array)")
};

export const LessonCreatorStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for Sunday School or small group lesson planning, e.g. 'Luke 15:11-32', 'Acts 2:42-47'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically")
};

export const PrayerGuideStudyPackSchema = {
  reference: z.string().describe("Scripture passage reference for prayer and intercession, e.g. 'Psalm 51', 'Ephesians 3:14-21'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_continuationist: z.boolean().default(false).describe("Dynamically include continuationist / spirit-led intercession, faith, and prayer insights (David Guzik, Gary Everett)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically")
};

export const CovenantTheologyPackSchema = {
  reference: z.string().describe("Scripture passage reference for redemptive-historical covenant synthesis, e.g. 'Genesis 15', 'Hebrews 8'"),
  version: z.string().default("BSB").describe("Bible translation version (default: BSB)"),
  include_continuationist: z.boolean().default(false).describe("Dynamically include New Covenant Spirit empowerment and continuationist theological perspectives (David Guzik, Gary Everett)"),
  extra_commentators: z.array(z.string()).optional().describe("Optional additional commentators to bundle dynamically")
};

export const InterlinearLookupSchema = {
  reference: z.string().describe("Passage reference, e.g., 'Philippians 4:4-8', 'John 1:1-5', 'Psalm 23'"),
  glossary_filter: z.enum(["rare_and_notable", "all_words", "none"]).default("rare_and_notable").describe("Filter mode for glossary entries at the bottom: 'rare_and_notable' (default), 'all_words', or 'none'"),
  gloss_color: z.string().default("#888888").describe("HTML hex color code for the inline English gloss (default: '#888888')")
};

export const InterlinearStudyPackSchema = {
  reference: z.string().describe("Passage reference for original language interlinear analysis, e.g., 'Philippians 4:4-8', 'John 1:1-5', 'Psalm 23'"),
  glossary_filter: z.enum(["rare_and_notable", "all_words", "none"]).default("rare_and_notable").describe("Filter mode for glossary entries at the bottom: 'rare_and_notable' (default), 'all_words', or 'none'"),
  gloss_color: z.string().default("#888888").describe("HTML hex color code for the inline English gloss (default: '#888888')")
};

export const OtQuotationsLookupSchema = {
  reference: z.string().describe("New Testament or Old Testament passage reference to check for cross-testament citations, e.g., 'Hebrews 8:8', 'Matthew 1:23', 'Jeremiah 31:31', 'Isaiah 7:14', 'Romans 4:3'")
};

export const OtInNtStudyPackSchema = {
  reference: z.string().describe("Passage reference for apostolic hermeneutics and OT-in-NT fulfillment exegesis, e.g., 'Hebrews 8:8-12', 'Matthew 1:22-23', 'Romans 4:1-8', 'Galatians 3:10-14', '1 Peter 2:4-10'"),
  version: z.string().default("BSB").describe("Bible translation version for English text (default: BSB)")
};

export const SeptuagintLookupSchema = {
  reference: z.string().describe("Old Testament Scripture reference for Septuagint Greek lookup, e.g., 'Genesis 1:1-5', 'Genesis 4:8', 'Exodus 3:14', 'Psalm 22:16', 'Isaiah 7:14'")
};

export const SeptuagintStudyPackSchema = {
  reference: z.string().describe("Old Testament passage reference for Septuagint and Hebrew MT comparative study, e.g., 'Genesis 1:1-5', 'Exodus 1:1-7', 'Psalm 40:1-8', 'Isaiah 7:10-17'"),
  version: z.string().default("BSB").describe("Bible translation version for standard English text (default: BSB)")
};

export const EntityDisambiguationSchema = {
  name: z.string().describe("Biblical name to disambiguate across identical persons or locations, e.g., 'Mary', 'James', 'John', 'Zechariah', 'Herod', 'Antioch'")
};

export const ConvertAncientUnitsSchema = {
  unit: z.string().describe("Biblical weight, measurement, or currency unit to convert, e.g., 'Talent', 'Shekel', 'Cubit', 'Denarius', 'Ephah', 'Bath', 'Span', 'Omer', 'Mite'"),
  amount: z.number().default(1).describe("Quantity/amount of the specified ancient unit (default: 1)")
};



