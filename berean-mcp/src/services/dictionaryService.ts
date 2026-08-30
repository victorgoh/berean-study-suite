import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";

export async function lookupDictionary(
  env: Env,
  term: string,
  source: string = "tyndale"
): Promise<{ error?: string; formattedText?: string; title?: string; definition?: string }> {
  if (!term || !term.trim()) {
    return { error: "Please provide a term to lookup in the Bible dictionary." };
  }

  const cleanTerm = term.trim();

  // 1. Try Tyndale Open Bible Dictionary from R2 (Tyndale.dictionary SQLite)
  if (source === "tyndale" || source === "all" || !source) {
    try {
      let { db } = await getDatabase(env, "dictionaries/Tyndale.dictionary");
      if (!db) {
        const alt = await getDatabase(env, "data/dictionaries/Tyndale.dictionary");
        db = alt.db;
      }
      if (db) {
        // Direct exact match on headword or title first
        let stmt = db.prepare("SELECT headword, title, definition, source FROM Dictionary WHERE headword = ? COLLATE NOCASE OR title = ? COLLATE NOCASE LIMIT 1;");
        stmt.bind([cleanTerm, cleanTerm]);
        if (stmt.step()) {
          const row = stmt.getAsObject() as { headword: string; title: string; definition: string; source: string };
          stmt.free();
          const formattedText = `# Bible Dictionary: ${row.title || row.headword}\n\n${row.definition}\n\n---\n*Source: Tyndale Open Bible Dictionary, Tyndale House Publishers (CC BY-SA 4.0)*`;
          return { title: row.title || row.headword, definition: row.definition, formattedText };
        }
        stmt.free();

        // Prefix / substring match
        stmt = db.prepare("SELECT headword, title, definition, source FROM Dictionary WHERE headword LIKE ? COLLATE NOCASE OR title LIKE ? COLLATE NOCASE LIMIT 1;");
        stmt.bind([`%${cleanTerm}%`, `%${cleanTerm}%`]);
        if (stmt.step()) {
          const row = stmt.getAsObject() as { headword: string; title: string; definition: string; source: string };
          stmt.free();
          const formattedText = `# Bible Dictionary: ${row.title || row.headword}\n\n${row.definition}\n\n---\n*Source: Tyndale Open Bible Dictionary, Tyndale House Publishers (CC BY-SA 4.0)*`;
          return { title: row.title || row.headword, definition: row.definition, formattedText };
        }
        stmt.free();
      }
    } catch (err) {
      console.warn("Tyndale dictionary SQLite query error:", err);
    }
  }

  // 2. Fallback to Legacy / Easton Dictionary Index if not found in Tyndale
  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/dictionaries_index.json");
  if (!index) {
    return { error: `No Bible dictionary entry found matching '${term}'.` };
  }

  const bestMatch = findBestMatch(cleanTerm, Object.keys(index));
  if (!bestMatch) {
    return { error: `No Bible dictionary entry found matching '${term}'.` };
  }

  const paths = index[bestMatch];
  if (!paths || paths.length === 0) {
    return { error: `No dictionary records found for '${bestMatch}'.` };
  }

  const results: string[] = [];

  for (const path of paths) {
    let content: string | null = null;

    if (env.REFERENCE_DB) {
      try {
        const stmt = env.REFERENCE_DB.prepare("SELECT content FROM dictionary WHERE path = ? LIMIT 1").bind(path);
        const row = await stmt.first<{ content: string }>();
        if (row && row.content) {
          content = row.content;
        }
      } catch (d1Err) {
        console.warn("D1 dictionary query error:", d1Err);
      }
    }

    if (content) {
      results.push(cleanHtmlToMarkdown(content));
    }
  }

  if (results.length === 0) {
    return { error: `Could not retrieve dictionary content for '${bestMatch}'.` };
  }

  const formattedText = `# Bible Dictionary: ${bestMatch}\n\n` + results.join("\n\n---\n\n");
  return { title: bestMatch, formattedText };
}
