import { getDatabase } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env } from "../types.js";

export async function lookupLexiconEntry(
  env: Env,
  strongsNumber: string,
  lexicon: string = "strongs"
): Promise<{ error?: string; formattedText?: string; definition?: string }> {
  const cleanKey = strongsNumber.trim().toUpperCase();
  const isHebrew = cleanKey.startsWith("H");
  const numOnly = cleanKey.replace(/^[GH]/, "");

  // 1. Hebrew BDB lookup via Cloudflare D1
  if (isHebrew && env.REFERENCE_DB) {
    try {
      const stmt = env.REFERENCE_DB.prepare(
        "SELECT Topic, Definition FROM lexicon_bdb WHERE Topic = ? OR Topic = ? LIMIT 1"
      ).bind(cleanKey, numOnly);
      const row = await stmt.first<{ Topic: string; Definition: string }>();
      if (row && row.Definition) {
        const cleanDef = cleanHtmlToMarkdown(row.Definition);
        return {
          definition: cleanDef,
          formattedText: `# Hebrew Lexicon Entry: ${row.Topic} (BDB)\n\n${cleanDef}`
        };
      }
    } catch (d1Err: any) {
      console.warn("D1 Hebrew lexicon query failed, trying R2 fallback:", d1Err.message);
    }
  }

  // 2. Greek (Thayer / LSJ) or Hebrew R2 SQLite lookup
  let lexiconFile = "lexicons/Thayer.lexicon";
  let lexiconName = "Thayer Greek Lexicon";
  if (isHebrew) {
    lexiconFile = "lexicons/BDB.lexicon";
    lexiconName = "Brown-Driver-Briggs Hebrew Lexicon";
  } else if (lexicon.toLowerCase().includes("lsj")) {
    lexiconFile = "lexicons/LSJ.lexicon";
    lexiconName = "Liddell-Scott-Jones Greek Lexicon";
  }

  const { db, error: dbError } = await getDatabase(env, lexiconFile);
  if (!db) {
    return { error: dbError || `Lexicon file '${lexiconFile}' not found in R2.` };
  }

  try {
    const stmt = db.prepare("SELECT Topic, Definition FROM Lexicon WHERE Topic = ? OR Topic = ? LIMIT 1");
    stmt.bind([cleanKey, numOnly]);

    if (!stmt.step()) {
      stmt.free();
      return { error: `Strong's entry '${cleanKey}' not found in ${lexiconName}` };
    }

    const row = stmt.getAsObject() as { Topic: string; Definition: string };
    stmt.free();

    const cleanDef = cleanHtmlToMarkdown(row.Definition || "");

    return {
      definition: cleanDef,
      formattedText: `# Lexicon Entry: ${row.Topic} (${lexiconName})\n\n${cleanDef}`
    };
  } catch (err: any) {
    return { error: `Lexicon error: ${err.message}` };
  }
}
