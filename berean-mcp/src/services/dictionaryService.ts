import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";

export async function lookupDictionary(
  env: Env,
  term: string,
  source: string = "easton"
): Promise<{ error?: string; formattedText?: string; title?: string }> {
  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/dictionaries_index.json");
  if (!index) {
    return { error: "Bible dictionary index (dictionaries_index.json) not available." };
  }

  const bestMatch = findBestMatch(term, Object.keys(index));
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

    // 1. Try Cloudflare D1
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

    // 2. Fallback to R2 / local SQLite
    if (!content && env.BIBLEMATE_DATA) {
      const { db } = await getDatabase(env, "data/dictionary.data");
      if (db) {
        try {
          const stmt = db.prepare("SELECT content FROM Dictionary WHERE path = ? LIMIT 1");
          stmt.bind([path]);
          if (stmt.step()) {
            content = (stmt.getAsObject() as any).content;
          }
          stmt.free();
        } catch (_) {}
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
