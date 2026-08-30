import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString } from "./bibleService.js";
import { Env } from "../types.js";

export async function lookupCrossReferences(
  env: Env,
  reference: string,
  limit: number = 15
): Promise<{ error?: string; references?: string[]; formattedText?: string }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Invalid verse reference for cross references: '${reference}'` };
  }

  const { db, error: dbError } = await getDatabase(env, "cross-reference.sqlite");
  if (!db) {
    return { error: dbError || "Cross-reference database (cross-reference.sqlite) not found in R2." };
  }

  try {
    const stmt = db.prepare("SELECT Information FROM TSKe WHERE Book = ? AND Chapter = ? AND Verse = ? LIMIT 1");
    stmt.bind([parsed.bookNumber, parsed.chapterStart, parsed.verseStart]);

    if (!stmt.step()) {
      stmt.free();
      return { error: `No cross references found for ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}` };
    }

    const row = stmt.getAsObject() as { Information: string };
    stmt.free();

    const rawHtml = row.Information || "";
    
    // Clean and extract references
    // Match <p><b>Topic:</b> <ref ...>Ref1</ref>, ...</p>
    const cleanText = rawHtml
      .replace(/<h2>.*?<\/h2>/gi, "")
      .replace(/<kjv>[\s\S]*?<\/kjv>/gi, "")
      .replace(/<ref[^>]*>(.*?)<\/ref>/gi, "$1")
      .replace(/<p><b>(.*?)<\/b>/gi, "\n• **$1**")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    return {
      formattedText: `# Cross References: ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart} (TSK)\n\n${cleanText}`
    };
  } catch (err: any) {
    return { error: `Cross reference lookup error: ${err.message}` };
  }
}
