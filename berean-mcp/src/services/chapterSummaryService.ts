import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env, ChapterSummaryResult } from "../types.js";

export async function lookupChapterSummary(
  env: Env,
  bookName: string,
  chapter: number = 1
): Promise<{ error?: string; formattedText?: string; result?: ChapterSummaryResult }> {
  const bookNum = resolveBookNumber(bookName);
  if (!bookNum) {
    return { error: `Unrecognized book name: '${bookName}'` };
  }

  const officialName = OFFICIAL_BOOK_NAMES[bookNum] || bookName;
  const { db, error: dbError } = await getDatabase(env, "data/chapter_summary.data");
  if (!db) {
    return { error: dbError || "Chapter summary database (chapter_summary.data) not found in R2." };
  }

  try {
    const stmt = db.prepare("SELECT Content FROM Summary WHERE Book = ? AND Chapter = ? LIMIT 1");
    stmt.bind([bookNum, chapter]);

    if (!stmt.step()) {
      stmt.free();
      return { error: `No chapter summary found for ${officialName} chapter ${chapter}.` };
    }

    const row = stmt.getAsObject() as { Content: string };
    stmt.free();

    const summaryText = cleanHtmlToMarkdown(row.Content || "");
    const formattedText = `# Chapter Summary & Outline: ${officialName} Chapter ${chapter}\n\n${summaryText}`;

    return {
      formattedText,
      result: {
        book: officialName,
        chapter,
        summaryText
      }
    };
  } catch (err: any) {
    return { error: `Chapter summary query error: ${err.message}` };
  }
}
