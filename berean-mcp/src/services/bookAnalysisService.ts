import { getDatabase } from "../db/sqliteEngine.js";
import { resolveBookNumber, OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env, BookAnalysisResult } from "../types.js";

function formatBookGuideContent(content: string, detail: "summary" | "full"): string {
  const markdown = cleanHtmlToMarkdown(content || "");
  if (detail !== "summary") return markdown;

  const blocks = markdown.split(/\n\n+/);
  return blocks.map((block, index) => {
    // The summary source alternates a title, field heading, and field value.
    // Add display punctuation only to descriptive values, not bare author names.
    if (index === 0 || index % 2 === 1 || /[.!?…]$/.test(block) || /^[A-Z][A-Za-z.'’-]*(?:\s+[A-Z][A-Za-z.'’-]*){0,3}$/.test(block)) {
      return block;
    }
    return `${block}.`;
  }).join("\n\n");
}

export async function lookupBookAnalysis(
  env: Env,
  bookName: string,
  detail: "summary" | "full" = "summary"
): Promise<{ error?: string; formattedText?: string; result?: BookAnalysisResult }> {
  const bookNum = resolveBookNumber(bookName);
  if (!bookNum) {
    return { error: `Unrecognized book name: '${bookName}'` };
  }

  const officialName = OFFICIAL_BOOK_NAMES[bookNum] || bookName;
  const { db, error: dbError } = await getDatabase(env, "data/tyndale_book_intros.data");
  if (!db) {
    return { error: dbError || "Tyndale Book Guide database (tyndale_book_intros.data) not found in storage." };
  }

  try {
    const stmt = db.prepare("SELECT Title, Content FROM BookGuide WHERE Book = ? AND Detail = ? LIMIT 1");
    stmt.bind([bookNum, detail]);
    const sections: { title: string; content: string }[] = [];
    if (stmt.step()) {
      const row = stmt.getAsObject() as { Title: string; Content: string };
      sections.push({ title: row.Title, content: formatBookGuideContent(row.Content, detail) });
    }
    stmt.free();

    if (sections.length === 0) {
      return { error: `No Tyndale ${detail} book guide found for ${officialName}.` };
    }

    const label = detail === "full" ? "Full Introduction" : "Book Summary";
    const formattedText = `# Book Guide: ${officialName}\n\n## ${label}\n\n${sections[0].content}\n\n---\n*Source: Tyndale Open Study Notes, Tyndale House Publishers (CC BY-SA 4.0)*`;

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
