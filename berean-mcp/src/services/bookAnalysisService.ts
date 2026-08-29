import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env, BookAnalysisResult } from "../types.js";

const SECTION_NAMES: Record<number, string> = {
  0: "Overview & Introduction",
  1: "Author",
  2: "Date of Writing",
  3: "Historical Background",
  4: "Recipients & Audience",
  5: "Key Themes & Theological Message",
  6: "Literary Structure & Purpose",
  7: "Comprehensive Outline",
  8: "Practical Application",
  9: "Christ in the Book"
};

export async function lookupBookAnalysis(
  env: Env,
  bookName: string,
  section?: number
): Promise<{ error?: string; formattedText?: string; result?: BookAnalysisResult }> {
  const bookNum = resolveBookNumber(bookName);
  if (!bookNum) {
    return { error: `Unrecognized book name: '${bookName}'` };
  }

  const officialName = OFFICIAL_BOOK_NAMES[bookNum] || bookName;
  const { db, error: dbError } = await getDatabase(env, "data/book_analysis.data");
  if (!db) {
    return { error: dbError || "Book analysis database (book_analysis.data) not found in R2." };
  }

  try {
    let sql = "";
    let params: any[] = [];

    if (section !== undefined) {
      sql = "SELECT Section, Content FROM Introduction WHERE Book = ? AND Section = ?";
      params = [bookNum, section];
    } else {
      sql = "SELECT Section, Content FROM Introduction WHERE Book = ? ORDER BY Section ASC";
      params = [bookNum];
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const sections: { title: string; content: string }[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as { Section: number; Content: string };
      const title = SECTION_NAMES[row.Section] || `Section ${row.Section}`;
      sections.push({
        title,
        content: cleanHtmlToMarkdown(row.Content || "")
      });
    }
    stmt.free();

    if (sections.length === 0) {
      return { error: `No book analysis records found for ${officialName}.` };
    }

    const mdBlocks = sections.map((s) => `## ${s.title}\n\n${s.content}`);
    const formattedText = `# Book Analysis & Introduction: ${officialName}\n\n` + mdBlocks.join("\n\n---\n\n");

    return {
      formattedText,
      result: {
        book: officialName,
        sections
      }
    };
  } catch (err: any) {
    return { error: `Book analysis query error: ${err.message}` };
  }
}
