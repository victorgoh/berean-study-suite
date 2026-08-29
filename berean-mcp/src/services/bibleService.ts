import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { Env, BibleVerse } from "../types.js";

export interface ParsedReference {
  bookName: string;
  bookNumber: number;
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
}

export function parseReferenceString(refStr: string): ParsedReference | null {
  const trimmed = refStr.trim();

  // Pattern 1: Book C:V-C:V (e.g., Matt 5:1-7:27)
  const m1 = trimmed.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/);
  if (m1) {
    const bookNum = resolveBookNumber(m1[1]);
    if (!bookNum) return null;
    return {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: parseInt(m1[2], 10),
      verseStart: parseInt(m1[3], 10),
      chapterEnd: parseInt(m1[4], 10),
      verseEnd: parseInt(m1[5], 10)
    };
  }

  // Pattern 2: Book C:V-V (e.g., John 3:16-18)
  const m2 = trimmed.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)$/);
  if (m2) {
    const bookNum = resolveBookNumber(m2[1]);
    if (!bookNum) return null;
    const ch = parseInt(m2[2], 10);
    return {
      bookName: OFFICIAL_BOOK_NAMES[bookNum],
      bookNumber: bookNum,
      chapterStart: ch,
      verseStart: parseInt(m2[3], 10),
      chapterEnd: ch,
      verseEnd: parseInt(m2[4], 10)
    };
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

export async function lookupBiblePassage(
  env: Env,
  version: string,
  reference: string
): Promise<{ error?: string; verses?: BibleVerse[]; formattedText?: string }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Could not parse passage reference: "${reference}"` };
  }

  const ver = version.toUpperCase();
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
    return { error: dbError || `Bible translation database not found for '${ver}' (path: ${r2Key})` };
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
      return { error: `No verses found for ${parsed.bookName} ${reference} in ${ver}` };
    }

    const formattedLines = verses.map(v => `[${v.book} ${v.chapter}:${v.verse} (${ver})] ${v.text}`);
    const formattedText = formattedLines.join("\n");

    return { verses, formattedText };
  } catch (err: any) {
    return { error: `Query failed: ${err.message}` };
  }
}
