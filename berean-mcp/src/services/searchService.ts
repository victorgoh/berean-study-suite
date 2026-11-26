import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { Env, BibleVerse } from "../types.js";
import { dependencyUnavailable, internalError, invalidRequest, type ServiceErrorFields } from "./errors.js";

export async function searchBible(
  env: Env,
  query: string,
  version: string = "NET",
  bookFilter?: string,
  limit: number = 50
): Promise<ServiceErrorFields & { totalCount?: number; matches?: BibleVerse[]; formattedText?: string }> {
  if (typeof query !== "string" || query.trim().length === 0 || query.length > 200) {
    return invalidRequest("Search query must be between 1 and 200 characters.");
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
    return dependencyUnavailable(dbError || `Bible database for '${ver}' not found in R2.`);
  }

  let bookNum: number | null = null;
  if (bookFilter) {
    bookNum = resolveBookNumber(bookFilter);
    if (!bookNum) {
      return invalidRequest(`Unrecognized book filter: '${bookFilter}'`);
    }
  }

  try {
    // Process search query tokens (support wildcards like * into %)
    const cleanedQuery = query.replace(/\*/g, "%").trim();
    
    const where = bookNum ? "Book = ? AND Scripture LIKE ?" : "Scripture LIKE ?";
    const whereParams: (string | number)[] = bookNum ? [bookNum, `%${cleanedQuery}%`] : [`%${cleanedQuery}%`];

    // Total number of matching verses, independent of the display limit.
    const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM Verses WHERE ${where}`);
    countStmt.bind(whereParams);
    const totalCount = countStmt.step() ? Number((countStmt.getAsObject() as { n: number }).n) : 0;
    countStmt.free();

    const sql = `SELECT Book, Chapter, Verse, Scripture FROM Verses WHERE ${where} ORDER BY Book ASC, Chapter ASC, Verse ASC LIMIT ?`;
    const params: (string | number)[] = [...whereParams, limit];

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
    const scope = `"${query}" in ${ver}${bookFilter ? ` [${bookFilter}]` : ""}`;
    const heading =
      matches.length < totalCount
        ? `Found ${totalCount} matches for ${scope}; showing the first ${matches.length}:`
        : `Found ${totalCount} matches for ${scope}:`;
    const formattedText = `${heading}\n\n` + formattedLines.join("\n");

    return { totalCount, matches, formattedText };
  } catch (err: any) {
    return internalError("Bible search", err);
  }
}
