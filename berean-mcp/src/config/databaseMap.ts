/**
 * Centralized Database and Commentary Registry
 * Provides O(1) alias resolution, metadata, and dynamic schema helpers.
 */

export interface CommentaryMeta {
  key: string;
  name: string;
  author: string;
  scope: "Whole Bible" | "Old Testament" | "New Testament" | "Gospels" | "Selected Books";
  description: string;
  aliases: string[];
  getStoragePath: (bookNumber: number) => string;
}

export interface BibleMeta {
  code: string;
  name: string;
  language: string;
  type: "English Translation" | "Original Language" | "Interlinear";
  description: string;
}

export interface LexiconMeta {
  code: string;
  name: string;
  language: "Hebrew/Aramaic" | "Greek";
  description: string;
}

export const BIBLE_REGISTRY: BibleMeta[] = [
  { code: "BSB", name: "Berean Standard Bible", language: "English", type: "English Translation", description: "Modern, faithful, and scholarly translation based on best Greek and Hebrew manuscripts." },
  { code: "NET", name: "New English Translation", language: "English", type: "English Translation", description: "Scholarly English translation renowned for extensive textual and translation footnotes." },
  { code: "KJV", name: "King James Version (1769)", language: "English", type: "English Translation", description: "Classic historic English translation based on the Textus Receptus." },
  { code: "WEB", name: "World English Bible", language: "English", type: "English Translation", description: "Public domain modern English translation of the Holy Bible." },
  { code: "ASV", name: "American Standard Version (1901)", language: "English", type: "English Translation", description: "Highly literal formal-equivalence American translation." },
  { code: "OHGB", name: "Open Hebrew and Greek Bible", language: "Hebrew / Greek", type: "Original Language", description: "Original Westminster Leningrad Codex (OT) and Greek New Testament (NA28/Nestle1904)." },
  { code: "LXX", name: "Septuagint (Rahlfs / Brenton)", language: "Greek / English", type: "Original Language", description: "Ancient Greek translation of the Old Testament with Brenton English translation and MT divergence notes." },
  { code: "OHGBi", name: "OHGB Interlinear Bible", language: "Hebrew / Greek / English", type: "Interlinear", description: "Word-by-word original language interlinear with Strong's and morphological tags." }
];

export const LEXICON_REGISTRY: LexiconMeta[] = [
  { code: "TBESG", name: "Tyndale Brief Extended Strong's Greek Lexicon", language: "Greek", description: "Modern, scholarly, context-tagged definitions with sub-lemma disambiguation (STEPBible / Tyndale House)." },
  { code: "TBESH", name: "Tyndale Brief Extended Strong's Hebrew Lexicon", language: "Hebrew/Aramaic", description: "Modern, scholarly contextual definitions for Old Testament terms with sub-lemma disambiguation (STEPBible / Tyndale House)." },

  { code: "BDB", name: "Brown-Driver-Briggs Hebrew and English Lexicon", language: "Hebrew/Aramaic", description: "Standard authoritative academic lexicon for Biblical Hebrew and Aramaic." },
  { code: "Thayer", name: "Thayer's Greek-English Lexicon of the New Testament", language: "Greek", description: "Classic comprehensive New Testament Greek lexicon keyed to Strong's numbers." },
  { code: "LSJ", name: "Liddell-Scott-Jones Greek-English Lexicon", language: "Greek", description: "Exhaustive lexicon of Classical and Koine Greek." },
  { code: "TBESH", name: "Theological & Biblical Expository Dictionary", language: "Hebrew/Aramaic", description: "Concise contextual definitions for Old Testament terms." },
  { code: "MCGED", name: "Morphological Concordance & Greek Expository", language: "Greek", description: "Detailed syntactic and inflectional mapping of New Testament Greek." }
];

export const COMMENTARIES_LIST: CommentaryMeta[] = [
  {
    key: "TNotes",
    name: "Tyndale Open Study Notes",
    author: "Tyndale House, Cambridge / STEPBible.org",
    scope: "Whole Bible",
    description: "Modern, concise, high-density study notes with original language, historical, and Ancient Near Eastern background (CC BY-SA 4.0).",
    aliases: ["tnotes", "tyndale", "tyndalenotes", "tyndaleopenstudynotes", "ton"],
    getStoragePath: () => "commentaries/TNotes.commentary"
  },

  {
    key: "Henry",
    name: "Matthew Henry's Modern English Commentary on the Whole Bible",
    author: "Matthew Henry; modern-English rearrangement by STEPBible.org",
    scope: "Whole Bible",
    description: "Modern-English, verse-by-verse arrangement of Matthew Henry's full commentary (STEP Bible, CC BY 4.0).",
    aliases: ["henry", "chenry", "matthew henry"],
    getStoragePath: () => "commentaries/normalized/cHenry.commentary"
  },
  {
    key: "MHCC",
    name: "Matthew Henry's Concise Commentary on the Whole Bible",
    author: "Matthew Henry",
    scope: "Whole Bible",
    description: "Concise, practical commentary for passage-level reflection and study. Public-domain text; digital-source attribution retained.",
    aliases: ["mhcc", "mhenry concise", "matthew henry concise", "henry concise"],
    getStoragePath: () => "commentaries/cMHCC.commentary"
  },
  {
    key: "JFB",
    name: "Jamieson-Fausset-Brown Bible Commentary",
    author: "Robert Jamieson, A. R. Fausset, David Brown",
    scope: "Whole Bible",
    description: "Concise, balanced grammatical and historical exposition of every verse in Scripture.",
    aliases: ["jfb", "cjfb", "jamieson", "fausset", "brown"],
    getStoragePath: () => "commentaries/normalized/cJFB.commentary"
  },
  {
    key: "Calvin",
    name: "John Calvin's Commentaries",
    author: "John Calvin",
    scope: "Whole Bible",
    description: "Reformational exegesis with crystalline theological precision and Christocentric covenant focus.",
    aliases: ["calvin", "ccalvin", "john calvin"],
    getStoragePath: () => "commentaries/normalized/cCalvin.commentary"
  },
  {
    key: "Gill",
    name: "John Gill's Exposition of the Entire Bible",
    author: "John Gill",
    scope: "Whole Bible",
    description: "Exhaustive Reformed Baptist commentary featuring deep Second Temple rabbinic context.",
    aliases: ["gill", "cgill", "john gill"],
    getStoragePath: () => "commentaries/normalized/cGill.commentary"
  },
  {
    key: "Barnes",
    name: "Albert Barnes' Notes on the Old and New Testaments",
    author: "Albert Barnes",
    scope: "Whole Bible",
    description: "Clear verse-by-verse notes specifically highlighting practical lessons for teaching.",
    aliases: ["barnes", "cbarnes", "albert barnes"],
    getStoragePath: () => "commentaries/normalized/cBarnes.commentary"
  },
  {
    key: "Benson",
    name: "Joseph Benson's Commentary on the Old and New Testaments",
    author: "Joseph Benson",
    scope: "Whole Bible",
    description: "Early Methodist commentary focusing on holy living, personal examination, and pastoral devotion.",
    aliases: ["benson", "cbenson", "joseph benson"],
    getStoragePath: () => "commentaries/normalized/cBenson.commentary"
  },
  {
    key: "Clarke",
    name: "Adam Clarke's Commentary on the Bible",
    author: "Adam Clarke",
    scope: "Whole Bible",
    description: "Scholarly commentary with deep insights into Semitic customs, linguistics, and archaeology.",
    aliases: ["clarke", "cclarke", "adam clarke"],
    getStoragePath: () => "commentaries/normalized/cClarke.commentary"
  },
  {
    key: "MacL",
    name: "Alexander Maclaren's Expositions of Holy Scripture",
    author: "Alexander Maclaren",
    scope: "Whole Bible",
    description: "Known as the Prince of Expository Preachers; vivid structural homiletical gems.",
    aliases: ["macl", "cmacl", "maclaren", "alexander maclaren"],
    getStoragePath: () => "commentaries/cMacL.commentary"
  },
  {
    key: "HH",
    name: "Charles Simeon's Horae Homileticae",
    author: "Charles Simeon",
    scope: "Whole Bible",
    description: "Over 2,500 structured sermon outlines and expository discourses covering every book.",
    aliases: ["hh", "chh", "simeon", "charles simeon", "horae"],
    getStoragePath: () => "commentaries/cHH.commentary"
  },
  {
    key: "EGNT",
    name: "The Expositor's Greek New Testament",
    author: "W. Robertson Nicoll",
    scope: "New Testament",
    description: "Detailed critical and grammatical commentary on the Greek text of the New Testament.",
    aliases: ["egnt", "cegnt", "expositors greek", "expositor greek"],
    getStoragePath: () => "commentaries/normalized/cEGNT.commentary"
  },
  {
    key: "CECNT",
    name: "H. A. W. Meyer's Critical and Exegetical Commentary",
    author: "H. A. W. Meyer",
    scope: "New Testament",
    description: "Authoritative academic grammatical and linguistic commentary on the Greek New Testament.",
    aliases: ["cecnt", "ccecnt", "meyer nt", "haw meyer"],
    getStoragePath: () => "commentaries/cCECNT.commentary"
  },
  {
    key: "Spur",
    name: "Charles Spurgeon's Treasury of David & Expositions",
    author: "Charles Spurgeon",
    scope: "Whole Bible",
    description: "The Prince of Preachers on the Psalms, Gospels, and Epistles; evangelistic fire and imagery.",
    aliases: ["spur", "cspur", "spurgeon", "charles spurgeon"],
    getStoragePath: () => "commentaries/cSpur.commentary"
  },
  {
    key: "Rob",
    name: "A. T. Robertson's Word Pictures in the New Testament",
    author: "A. T. Robertson",
    scope: "New Testament",
    description: "World-renowned Koine Greek syntax, idiomatic nuances, and vivid word-level analysis.",
    aliases: ["rob", "crob", "robertson", "word pictures"],
    getStoragePath: () => "commentaries/normalized/cRob.commentary"
  },
  {
    key: "Vincent",
    name: "Marvin Vincent's Word Studies in the New Testament",
    author: "Marvin Vincent",
    scope: "New Testament",
    description: "Deep exploration of Greek etymology, cultural imagery, and literary nuances in the NT.",
    aliases: ["vincent", "cvincent", "word studies"],
    getStoragePath: () => "commentaries/normalized/cVincent.commentary"
  },
  {
    key: "Wesley",
    name: "John Wesley's Explanatory Notes on the Whole Bible",
    author: "John Wesley",
    scope: "Whole Bible",
    description: "Pithy, direct notes focused on heart holiness, grace, and practical obedience.",
    aliases: ["wesley", "cwesley", "john wesley"],
    getStoragePath: () => "commentaries/normalized/cWesley.commentary"
  },
  {
    key: "Whedon",
    name: "Daniel Whedon's Commentary on the Old and New Testaments",
    author: "Daniel Whedon",
    scope: "Whole Bible",
    description: "Classic 19th-century Wesleyan-Arminian biblical commentary with logical rigor.",
    aliases: ["whedon", "cwhedon", "daniel whedon"],
    getStoragePath: () => "commentaries/cWhedon.commentary"
  },
  {
    key: "ECER",
    name: "Charles Ellicott's Commentary for English Readers",
    author: "Charles Ellicott",
    scope: "Whole Bible",
    description: "Clear, lay-accessible commentary synthesizing critical scholarship with reverent faith.",
    aliases: ["ecer", "cecer", "ellicott", "charles ellicott"],
    getStoragePath: () => "commentaries/normalized/cECER.commentary"
  },
  {
    key: "EBC",
    name: "The Expositor's Bible",
    author: "W. Robertson Nicoll",
    scope: "Whole Bible",
    description: "In-depth expository essays and theological chapter lectures by renowned 19th-century scholars.",
    aliases: ["ebc", "cebc", "expositor", "expositors bible"],
    getStoragePath: () => "commentaries/cEBC.commentary"
  },
  {
    key: "KD",
    name: "Keil and Delitzsch Biblical Commentary on the Old Testament",
    author: "C. F. Keil, Franz Delitzsch",
    scope: "Old Testament",
    description: "Gold standard classical academic commentary on Biblical Hebrew grammar, syntax, and Ancient Near East history.",
    aliases: ["kd", "ckd", "keil", "delitzsch", "keil delitzsch"],
    getStoragePath: () => "commentaries/normalized/cKD.commentary"
  },
  {
    key: "Lange",
    name: "John Peter Lange's Commentary on the Holy Scriptures",
    author: "John Peter Lange",
    scope: "Whole Bible",
    description: "Comprehensive tri-fold analysis covering Exegetical/Critical, Doctrinal/Ethical, and Homiletical/Pastoral.",
    aliases: ["lange", "clange", "john peter lange"],
    getStoragePath: () => "commentaries/normalized/cLange.commentary"
  },
  {
    key: "BI",
    name: "The Biblical Illustrator",
    author: "Joseph S. Exell",
    scope: "Whole Bible",
    description: "Massive repository of thousands of sermons, sermon anecdotes, illustrations, and expository notes.",
    aliases: ["bi", "cbi", "biblical illustrator", "illustrator"],
    getStoragePath: (bookNumber: number) => {
      if (bookNumber <= 17) return "commentaries/normalized/cBI_1.commentary";
      if (bookNumber <= 39) return "commentaries/normalized/cBI_2.commentary";
      if (bookNumber <= 44) return "commentaries/normalized/cBI_3.commentary";
      return "commentaries/normalized/cBI_4.commentary";
    }
  },
  {
    key: "Pulpit",
    name: "The Pulpit Commentary",
    author: "H. D. M. Spence, Joseph S. Exell",
    scope: "Whole Bible",
    description: "Monumental 77-volume collection providing historical introductions, verse-by-verse exegesis, and multiple homiletic outlines.",
    aliases: ["pulpit", "cpulpit", "the pulpit commentary", "pulpit commentary"],
    getStoragePath: (bookNumber: number) => {
      if (bookNumber <= 17) return "commentaries/cPulpit_1.commentary";
      if (bookNumber <= 39) return "commentaries/cPulpit_2.commentary";
      if (bookNumber <= 44) return "commentaries/cPulpit_3.commentary";
      return "commentaries/cPulpit_4.commentary";
    }
  },
  {
    key: "ECF",
    name: "Early Church Fathers Commentary",
    author: "SermonIndex.net / Church Fathers",
    scope: "Whole Bible",
    description: "Patristic commentary from Augustine, Chrysostom, Bede, Jerome, Origen, and many other early church writers.",
    aliases: ["ecf", "cecf", "early church fathers", "church fathers"],
    getStoragePath: (bookNumber: number) => {
      if (bookNumber <= 17) return "commentaries/cECF_1.commentary";
      if (bookNumber <= 39) return "commentaries/cECF_2.commentary";
      if (bookNumber <= 56) return "commentaries/cECF_3.commentary";
      return "commentaries/cECF_4.commentary";
    }
  },
  {
    key: "Catena",
    name: "St Thomas Aquinas' Catena Aurea",
    author: "St Thomas Aquinas, compiled from the Church Fathers",
    scope: "Gospels",
    description: "Patristic running commentary on Matthew, Mark, Luke, and John, compiled by Thomas Aquinas.",
    aliases: ["catena", "catena aurea", "golden chain", "ccatena"],
    getStoragePath: () => "commentaries/cCatena.commentary"
  },
  {
    key: "Kretzmann",
    name: "Paul E. Kretzmann's Popular Commentary",
    author: "Paul E. Kretzmann",
    scope: "Whole Bible",
    description: "Clear, practical Lutheran exposition of the Old and New Testaments for teachers and lay readers.",
    aliases: ["kretzmann", "popular kretzmann", "popular commentary"],
    getStoragePath: () => "commentaries/cKretzmann.commentary"
  },
  {
    key: "Schaff",
    name: "Schaff's Popular Commentary on the New Testament",
    author: "Philip Schaff and contributors",
    scope: "New Testament",
    description: "Concise historical and exegetical commentary on the New Testament for educated lay readers.",
    aliases: ["schaff", "cschaff", "schaff popular commentary"],
    getStoragePath: () => "commentaries/cSchaff.commentary"
  }
];

// O(1) Fast Lookup Map for all aliases
const ALIAS_MAP = new Map<string, CommentaryMeta>();
for (const item of COMMENTARIES_LIST) {
  ALIAS_MAP.set(item.key.toLowerCase(), item);
  for (const alias of item.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), item);
  }
}

/**
 * Resolves any commentary alias or raw string into canonical Commentary metadata in O(1) time.
 */
export function resolveCommentary(input: string): CommentaryMeta | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase();
  
  // 1. Direct Map lookup
  if (ALIAS_MAP.has(clean)) {
    return ALIAS_MAP.get(clean)!;
  }
  
  // 2. Prefix 'c' strip attempt (e.g. "cCalvin" -> "calvin")
  if (clean.startsWith("c") && clean.length > 2) {
    const stripped = clean.slice(1);
    if (ALIAS_MAP.has(stripped)) {
      return ALIAS_MAP.get(stripped)!;
    }
  }

  // 3. Substring match fallback across canonical keys
  for (const item of COMMENTARIES_LIST) {
    if (clean.includes(item.key.toLowerCase()) || clean.includes(item.author.toLowerCase())) {
      return item;
    }
  }

  return null;
}
