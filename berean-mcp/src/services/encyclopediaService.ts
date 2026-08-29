import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";

export async function lookupEncyclopedia(
  env: Env,
  term: string,
  source: string = "isbe"
): Promise<{ error?: string; formattedText?: string; title?: string }> {
  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/encyclopedia_index.json");
  if (!index) {
    return { error: "Encyclopedia lookup index (encyclopedia_index.json) not available." };
  }

  const bestMatch = findBestMatch(term, Object.keys(index));
  if (!bestMatch) {
    return { error: `No encyclopedia entry found matching '${term}'.` };
  }

  const paths = index[bestMatch];
  if (!paths || paths.length === 0) {
    return { error: `No article paths found for '${bestMatch}'.` };
  }

  const results: string[] = [];

  for (const path of paths) {
    let content: string | null = null;

    // 1. Try Cloudflare D1
    if (env.REFERENCE_DB) {
      try {
        const stmt = env.REFERENCE_DB.prepare("SELECT content FROM encyclopedia_isbe WHERE path = ? LIMIT 1").bind(path);
        const row = await stmt.first<{ content: string }>();
        if (row && row.content) {
          content = row.content;
        }
      } catch (d1Err) {
        console.warn("D1 encyclopedia query error:", d1Err);
      }
    }

    // 2. Fallback to R2 SQLite
    if (!content && env.BIBLEMATE_DATA) {
      const { db } = await getDatabase(env, "data/encyclopedia.data");
      if (db) {
        const tableName = path.startsWith("ISBE") ? "ISB" : path.slice(0, 3);
        try {
          const stmt = db.prepare(`SELECT content FROM ${tableName} WHERE path = ? LIMIT 1`);
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
    return { error: `Could not retrieve article content for '${bestMatch}' (${paths.join(", ")}).` };
  }

  const formattedText = `# International Standard Bible Encyclopedia (ISBE): ${bestMatch}\n\n` + results.join("\n\n---\n\n");
  return { title: bestMatch, formattedText };
}
