import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { Env, BibleVerse } from "../types.js";

export async function searchBible(
  env: Env,
  query: string,
  version: string = "NET",
  bookFilter?: string,
  limit: number = 50
): Promise<{ error?: string; totalCount?: number; matches?: BibleVerse[]; formattedText?: string }> {
  if (typeof query !== "string" || query.trim().length === 0 || query.length > 200) {
    return { error: "Search query must be between 1 and 200 characters." };
  }
  limit = Math.min(Math.max(Number.isFinite(limit) ? Math.floor(limit) : 50, 1), 100);
  let ver = version.toUpperCase();
  if (ver === "OHGBI" || ver === "OHGB-I" || ver === "INTERLINEAR") {
    ver = "OHGB";
  }
  let r2Key = `bibles/${ver}.bible`;
  let { db, error: dbError } = await getDatabase(env, r2Key);

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
    return { error: dbError || `Bible database for '${ver}' not found in R2.` };
  }

  let bookNum: number | null = null;
  if (bookFilter) {
    bookNum = resolveBookNumber(bookFilter);
    if (!bookNum) {
      return { error: `Unrecognized book filter: '${bookFilter}'` };
    }
  }

  try {
    // Process search query tokens (support wildcards like * into %)
    const cleanedQuery = query.replace(/\*/g, "%").trim();
    
    let sql = "SELECT Book, Chapter, Verse, Scripture FROM Verses WHERE ";
    const params: (string | number)[] = [];

    if (bookNum) {
      sql += "Book = ? AND ";
      params.push(bookNum);
    }

    sql += "Scripture LIKE ? ORDER BY Book ASC, Chapter ASC, Verse ASC LIMIT ?";
    params.push(`%${cleanedQuery}%`, limit);

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const matches: BibleVerse[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      matches.push({
        book: OFFICIAL_BOOK_NAMES[row.Book] || `Book ${row.Book}`,
        book_number: row.Book,
        chapter: row.Chapter,
        verse: row.Verse,
        text: row.Scripture.trim(),
        version: ver
      });
    }
    stmt.free();

    const formattedLines = matches.map(m => `• ${m.book} ${m.chapter}:${m.verse} (${ver}): ${m.text}`);
    const formattedText = `Found ${matches.length} matches for "${query}" in ${ver}${bookFilter ? ` [${bookFilter}]` : ""}:\n\n` + formattedLines.join("\n");

    return { totalCount: matches.length, matches, formattedText };
  } catch (err: any) {
    return { error: `Search error: ${err.message}` };
  }
}
