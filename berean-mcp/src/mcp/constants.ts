export const OFFICIAL_BOOK_NAMES: string[] = [
  "", // Index 0 empty
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
  "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude",
  "Revelation"
];

export const raw_mappings: Record<number, string[]> = {
  1: ["genesis", "gen", "ge", "gn"],
  2: ["exodus", "exod", "exo", "ex"],
  3: ["leviticus", "lev", "le", "lv"],
  4: ["numbers", "num", "nu", "nm", "nb"],
  5: ["deuteronomy", "deut", "de", "dt"],
  6: ["joshua", "josh", "jos", "js"],
  7: ["judges", "judg", "jdg", "jg", "jgs"],
  8: ["ruth", "rut", "ru"],
  9: ["1 samuel", "1 sam", "1 sa", "1s", "i samuel", "i sam", "1sam", "1sa"],
  10: ["2 samuel", "2 sam", "2 sa", "2s", "ii samuel", "ii sam", "2sam", "2sa"],
  11: ["1 kings", "1 ki", "1 kgs", "1 k", "1k", "i kings", "i ki", "1kings", "1ki", "1kgs"],
  12: ["2 kings", "2 ki", "2 kgs", "2 k", "2k", "ii kings", "ii ki", "2kings", "2ki", "2kgs"],
  13: ["1 chronicles", "1 chr", "1 ch", "1chron", "1ch", "1chr"],
  14: ["2 chronicles", "2 chr", "2 ch", "2chron", "2ch", "2chr"],
  15: ["ezra", "ezr", "ez"],
  16: ["nehemiah", "neh", "ne"],
  17: ["esther", "esth", "est", "es"],
  18: ["job", "jb"],
  19: ["psalms", "psalm", "ps", "psa", "pss"],
  20: ["proverbs", "prov", "pro", "pr", "pv"],
  21: ["ecclesiastes", "eccles", "ecc", "ec"],
  22: ["song of solomon", "song of songs", "song", "so", "sng", "canticles", "cant"],
  23: ["isaiah", "isa", "is"],
  24: ["jeremiah", "jer", "je", "jr"],
  25: ["lamentations", "lam", "la"],
  26: ["ezekiel", "ezek", "eze", "ek"],
  27: ["daniel", "dan", "da", "dn"],
  28: ["hosea", "hos", "ho"],
  29: ["joel", "joe", "jl"],
  30: ["amos", "amo", "am"],
  31: ["obadiah", "obad", "oba", "ob"],
  32: ["jonah", "jon", "jnh"],
  33: ["micah", "mic", "mc"],
  34: ["nahum", "nah", "na"],
  35: ["habakkuk", "hab", "hb"],
  36: ["zephaniah", "zeph", "zep", "zp"],
  37: ["haggai", "hagg", "hag", "hg"],
  38: ["zechariah", "zech", "zec", "zc"],
  39: ["malachi", "mal", "ml"],
  40: ["matthew", "matt", "mat", "mt"],
  41: ["mark", "mrk", "mk"],
  42: ["luke", "luk", "lk"],
  43: ["john", "joh", "jhn", "jn"],
  44: ["acts", "act", "ac"],
  45: ["romans", "rom", "rm", "ro"],
  46: ["1 corinthians", "1 cor", "1 co", "1c", "i corinthians", "i cor", "1cor", "1co"],
  47: ["2 corinthians", "2 cor", "2 co", "2c", "ii corinthians", "ii cor", "2cor", "2co"],
  48: ["galatians", "gal", "ga"],
  49: ["ephesians", "eph", "ep"],
  50: ["philippians", "phil", "php", "pp"],
  51: ["colossians", "col", "co"],
  52: ["1 thessalonians", "1 thess", "1 th", "1ts", "i thessalonians", "i thess", "1thess", "1th", "1the"],
  53: ["2 thessalonians", "2 thess", "2 th", "2ts", "ii thessalonians", "ii thess", "2thess", "2th", "2the"],
  54: ["1 timothy", "1 tim", "1 ti", "1t", "i timothy", "i tim", "1tim", "1ti"],
  55: ["2 timothy", "2 tim", "2 ti", "2t", "ii timothy", "ii tim", "2tim", "2ti"],
  56: ["titus", "tit", "ti", "ts"],
  57: ["philemon", "philem", "phm", "pm"],
  58: ["hebrews", "heb", "he"],
  59: ["james", "jas", "jm"],
  60: ["1 peter", "1 pet", "1 pe", "1 pt", "1p", "i peter", "i pet", "1pet", "1pe", "1pt"],
  61: ["2 peter", "2 pet", "2 pe", "2 pt", "2p", "ii peter", "ii pet", "2pet", "2pe", "2pt"],
  62: ["1 john", "1 jn", "1 joh", "1 jhn", "1j", "i john", "i jn", "1john", "1jn", "1jhn", "1joh"],
  63: ["2 john", "2 jn", "2 joh", "2 jhn", "2j", "ii john", "ii jn", "2john", "2jn", "2jhn", "2joh"],
  64: ["3 john", "3 jn", "3 joh", "3 jhn", "3j", "iii john", "iii jn", "3john", "3jn", "3jhn", "3joh"],
  65: ["jude", "jud", "jd"],
  66: ["revelation", "rev", "re", "the revelation"]
};

export const BOOK_MAP: Record<string, number> = {};
for (const [bookNumStr, aliases] of Object.entries(raw_mappings)) {
  const bookNum = parseInt(bookNumStr, 10);
  BOOK_MAP[OFFICIAL_BOOK_NAMES[bookNum].toLowerCase()] = bookNum;
  for (const alias of aliases) {
    BOOK_MAP[alias] = bookNum;
  }
}

export function resolveBookNumber(name: string): number | null {
  const clean = name.trim().toLowerCase();
  return BOOK_MAP[clean] || null;
}
