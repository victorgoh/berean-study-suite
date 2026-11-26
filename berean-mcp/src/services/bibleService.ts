import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES, CHAPTER_COUNTS } from "../mcp/constants.js";
import { Env, BibleVerse } from "../types.js";
import { dependencyUnavailable, internalError, invalidRequest, notFound, type ServiceErrorFields } from "./errors.js";

export interface ParsedReference {
  bookName: string;
  bookNumber: number;
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
}

export function parseReferenceString(refStr: string): ParsedReference | null {
  if (typeof refStr !== "string" || refStr.length > 200) return null;
  const trimmed = refStr.trim();

  // Pattern 1: Book C:V-C:V (e.g., Matt 5:1-7:27)
  const m1 = trimmed.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/);
  if (m1) {
    const bookNum = resolveBookNumber(m1[1]);
    if (!bookNum) return null;
    const result = {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: parseInt(m1[2], 10),
      verseStart: parseInt(m1[3], 10),
      chapterEnd: parseInt(m1[4], 10),
      verseEnd: parseInt(m1[5], 10)
    };
    if (result.chapterEnd - result.chapterStart > 20) return null;
    return result;
  }

  // Pattern 2: Book C:V-V (e.g., John 3:16-18)
  const m2 = trimmed.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)$/);
  if (m2) {
    const bookNum = resolveBookNumber(m2[1]);
    if (!bookNum) return null;
    const ch = parseInt(m2[2], 10);
    const result = {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: ch,
      verseStart: parseInt(m2[3], 10),
      chapterEnd: ch,
      verseEnd: parseInt(m2[4], 10)
    };
    if (result.verseEnd - result.verseStart > 500) return null;
    return result;
  }

  // Pattern 3: Book C:V (e.g., John 3:16)
  const m3 = trimmed.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)$/);
  if (m3) {
    const bookNum = resolveBookNumber(m3[1]);
    if (!bookNum) return null;
    const ch = parseInt(m3[2], 10);
    const v = parseInt(m3[3], 10);
    return {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: ch,
      verseStart: v,
      chapterEnd: ch,
      verseEnd: v
    };
  }

  // Pattern 4: Book C (Full Chapter, e.g., Romans 8 or Psalm 23)
  const m4 = trimmed.match(/^(.+?)\s+(\d+)$/);
  if (m4) {
    const bookNum = resolveBookNumber(m4[1]);
    if (!bookNum) return null;
    const ch = parseInt(m4[2], 10);
    return {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: ch,
      verseStart: 1,
      chapterEnd: ch,
      verseEnd: 999
    };
  }

  return null;
}

/**
 * Canonical display form of a parsed reference, e.g. "John 3:16", "John 3:16-18",
 * "Matthew 5:1-7:27" or "Psalm 23" (whole chapter). Abbreviations are expanded.
 */
export function formatReference(ref: ParsedReference): string {
  const { bookName, chapterStart, verseStart, chapterEnd, verseEnd } = ref;
  if (chapterStart !== chapterEnd) return `${bookName} ${chapterStart}:${verseStart}-${chapterEnd}:${verseEnd}`;
  if (verseStart === 1 && verseEnd === 999) return `${bookName} ${chapterStart}`;
  if (verseStart === verseEnd) return `${bookName} ${chapterStart}:${verseStart}`;
  return `${bookName} ${chapterStart}:${verseStart}-${verseEnd}`;
}

export interface ChapterNavigation {
  previous?: string;
  next?: string;
}

/** The chapters before and after a passage, crossing book boundaries (Malachi 4 → Matthew 1). */
export function chapterNavigation(ref: ParsedReference): ChapterNavigation {
  const nav: ChapterNavigation = {};
  if (ref.chapterStart > 1) nav.previous = `${ref.bookName} ${ref.chapterStart - 1}`;
  else if (ref.bookNumber > 1) nav.previous = `${OFFICIAL_BOOK_NAMES[ref.bookNumber - 1]} ${CHAPTER_COUNTS[ref.bookNumber - 1]}`;
  if (ref.chapterEnd < (CHAPTER_COUNTS[ref.bookNumber] ?? 0)) nav.next = `${ref.bookName} ${ref.chapterEnd + 1}`;
  else if (ref.bookNumber < 66) nav.next = `${OFFICIAL_BOOK_NAMES[ref.bookNumber + 1]} 1`;
  return nav;
}

export async function lookupBiblePassage(
  env: Env,
  version: string,
  reference: string
): Promise<ServiceErrorFields & { verses?: BibleVerse[]; formattedText?: string; navigation?: ChapterNavigation }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return invalidRequest(`Could not parse passage reference: "${reference}"`);
  }

  let ver = version.toUpperCase();
  if (ver === "OHGBI" || ver === "OHGB-I" || ver === "INTERLINEAR") {
    ver = "OHGB";
  }
  let r2Key = `bibles/${ver}.bible`;
  let { db, error: dbError } = await getDatabase(env, r2Key);

  // Flexible fallback: if BSB.bible fails, try BSB.sqlite, BSB.db, bsb.bible
  if (!db) {
    const fallbackKeys = [
      `bibles/${ver}.sqlite`,
      `bibles/${ver}.db`,
      `bibles/${version.toLowerCase()}.bible`,
      `bibles/${version.toLowerCase()}.sqlite`
    ];
    for (const altKey of fallbackKeys) {
      const res = await getDatabase(env, altKey);
      if (res.db) {
        db = res.db;
        dbError = undefined;
        r2Key = altKey;
        break;
      }
    }
  }

  if (!db) {
    return dependencyUnavailable(dbError || `Bible translation database not found for '${ver}' (path: ${r2Key})`);
  }

  try {
    // Dynamic table name detection: prioritize Verses over Bible/Scripture
    let tableName = "Verses";
    try {
      const tblStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name='Verses' OR name='Bible' OR name='Scripture') ORDER BY CASE WHEN name='Verses' THEN 1 WHEN name='Bible' THEN 2 ELSE 3 END ASC LIMIT 1");
      if (tblStmt.step()) {
        tableName = (tblStmt.getAsObject() as any).name || "Verses";
      }
      tblStmt.free();
    } catch (_) {}

    let sql: string;
    let params: (number | string)[];

    if (parsed.chapterStart === parsed.chapterEnd) {
      sql = `SELECT Book, Chapter, Verse, Scripture FROM ${tableName} WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? ORDER BY Verse ASC`;
      params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd];
    } else {
      sql = `SELECT Book, Chapter, Verse, Scripture FROM ${tableName} WHERE Book = ? AND ((Chapter = ? AND Verse >= ?) OR (Chapter > ? AND Chapter < ?) OR (Chapter = ? AND Verse <= ?)) ORDER BY Chapter ASC, Verse ASC`;
      params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.chapterStart, parsed.chapterEnd, parsed.chapterEnd, parsed.verseEnd];
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const verses: BibleVerse[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      verses.push({
        book: OFFICIAL_BOOK_NAMES[row.Book] || parsed.bookName,
        book_number: row.Book,
        chapter: row.Chapter,
        verse: row.Verse,
        text: row.Scripture.trim(),
        version: ver
      });
    }
    stmt.free();

    if (verses.length === 0) {
      return notFound(`No verses found for ${formatReference(parsed)} in ${ver}`);
    }

    const formattedLines = verses.map(v => `[${v.book} ${v.chapter}:${v.verse} (${ver})] ${v.text}`);
    const formattedText = formattedLines.join("\n");

    return { verses, formattedText, navigation: chapterNavigation(parsed) };
  } catch (err: any) {
    return internalError("Bible passage query", err);
  }
}

const COMPARE_DEFAULT_VERSIONS = ["BSB", "KJV", "NET", "WEB"];
const COMPARE_MAX_VERSIONS = 4;
const COMPARE_MAX_VERSES = 40;

export interface ComparedVerse {
  reference: string;
  texts: Record<string, string>;
}

/**
 * A passage verse by verse in several translations. Versions are fetched one
 * after another (each opens its own Bible file), so the count is capped.
 */
export async function compareTranslations(
  env: Env,
  reference: string,
  versions: string[] = COMPARE_DEFAULT_VERSIONS
): Promise<ServiceErrorFields & { formattedText?: string; versions?: string[]; verses?: ComparedVerse[] }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return invalidRequest(`Could not parse passage reference: "${reference}"`);
  }
  const wanted = [...new Set((versions.length ? versions : COMPARE_DEFAULT_VERSIONS).map((v) => v.trim().toUpperCase()).filter(Boolean))];
  if (wanted.length > COMPARE_MAX_VERSIONS) {
    return invalidRequest(`Compare at most ${COMPARE_MAX_VERSIONS} translations at a time.`);
  }

  const rows = new Map<string, ComparedVerse>();
  const shown: string[] = [];
  const failed: string[] = [];
  for (const version of wanted) {
    const res = await lookupBiblePassage(env, version, reference);
    if (!res.verses || res.verses.length === 0) {
      failed.push(version);
      continue;
    }
    shown.push(version);
    for (const v of res.verses) {
      const key = `${v.book} ${v.chapter}:${v.verse}`;
      const row = rows.get(key) ?? { reference: key, texts: {} };
      row.texts[version] = v.text.trim();
      rows.set(key, row);
    }
  }
  if (shown.length === 0) {
    return notFound(`No verses found for ${formatReference(parsed)} in ${wanted.join(", ")}.`);
  }

  const verses = [...rows.values()];
  const listed = verses.slice(0, COMPARE_MAX_VERSES);
  const lines = [`# Compare Translations: ${formatReference(parsed)}`, "", `*${shown.join(" · ")}*`, ""];
  for (const verse of listed) {
    lines.push(`### ${verse.reference}`);
    for (const version of shown) {
      if (verse.texts[version]) lines.push(`**${version}** — ${verse.texts[version]}`, "");
    }
  }
  if (verses.length > listed.length) {
    lines.push(`*Showing the first ${listed.length} of ${verses.length} verses; compare a shorter passage to see the rest.*`);
  }
  if (failed.length > 0) {
    lines.push(`*Not available for this passage: ${failed.join(", ")}.*`);
  }
  return { formattedText: lines.join("\n").trimEnd(), versions: shown, verses: listed };
}
