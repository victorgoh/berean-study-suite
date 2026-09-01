import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env, ChapterSummaryResult } from "../types.js";

const CLARKE_STORAGE_PATH = "commentaries/cClarke.commentary";

function extractChapterOpening(html: string, book: number, chapter: number): string {
  const openingMarker = new RegExp(
    `<vid\\s+id=["']v${book}\\.${chapter}\\.0["'][^>]*>[\\s\\S]*?<\\/vid>`,
    "i"
  );
  const opening = openingMarker.exec(html);
  if (!opening) return "";

  const afterOpening = html.slice(opening.index + opening[0].length);
  const nextVerseMarker = /<vid\s+id=["']v\d+\.\d+\.[1-9]\d*["'][^>]*>/i.exec(afterOpening);
  return afterOpening.slice(0, nextVerseMarker?.index).replace(/<hr\b[^>]*>\s*$/i, "").trim();
}

/**
 * Returns Adam Clarke's supplied chapter-opening synopsis. This is a direct,
 * deterministic source extraction rather than a generated chapter summary.
 */
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
  const { db, error: dbError } = await getDatabase(env, CLARKE_STORAGE_PATH);
  if (!db) {
    return { error: dbError || "Adam Clarke commentary database is not available in storage." };
  }

  try {
    const stmt = db.prepare("SELECT Scripture FROM Commentary WHERE Book = ? AND Chapter = ? LIMIT 1");
    stmt.bind([bookNum, chapter]);
    if (!stmt.step()) {
      stmt.free();
      return { error: `No Adam Clarke chapter entry found for ${officialName} chapter ${chapter}.` };
    }

    const row = stmt.getAsObject() as { Scripture: string };
    stmt.free();
    const summaryText = cleanHtmlToMarkdown(extractChapterOpening(row.Scripture || "", bookNum, chapter));
    if (!summaryText) {
      return { error: `No Adam Clarke chapter-opening synopsis found for ${officialName} chapter ${chapter}.` };
    }

    const formattedText = `# Chapter Summary: ${officialName} Chapter ${chapter}\n\n${summaryText}\n\n---\n*Source: Adam Clarke's Commentary on the Bible (public domain).*`;
    return {
      formattedText,
      result: { book: officialName, chapter, summaryText }
    };
  } catch (err: any) {
    return { error: `Chapter summary query error: ${err.message}` };
  }
}
