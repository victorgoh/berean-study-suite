import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch, decodeHtmlEntities } from "../utils/fuzzyMatch.js";
import { Env, TopicResult } from "../types.js";

export async function lookupTopic(
  env: Env,
  topicQuery: string
): Promise<{ error?: string; formattedText?: string; topic?: string; results?: TopicResult[] }> {
  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/exlbt_index.json");
  if (!index) {
    return { error: "Topic lookup index (exlbt_index.json) not available in R2." };
  }

  const bestMatch = findBestMatch(topicQuery, Object.keys(index));
  if (!bestMatch) {
    return { error: `Could not locate a matching Bible topic for '${topicQuery}'.` };
  }

  const codes = index[bestMatch];
  if (!codes || codes.length === 0) {
    return { error: `No topic code records found for '${bestMatch}'.` };
  }

  const { db, error: dbError } = await getDatabase(env, "data/exlb3.data");
  if (!db) {
    return { error: dbError || "Topic database (exlb3.data) not found in R2." };
  }

  const results: TopicResult[] = [];
  const mdParts: string[] = [];

  try {
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const stmt = db.prepare("SELECT content FROM exlbt WHERE path = ? LIMIT 1");
      stmt.bind([code]);

      let entryMd = "";
      if (stmt.step()) {
        const row = stmt.getAsObject() as { content: string };
        entryMd = cleanHtmlToMarkdown(row.content || "");
      } else {
        entryMd = `*(No database record content found for \`${code}\`)*`;
      }
      stmt.free();

      results.push({ topic: bestMatch, code, content: entryMd });

      if (codes.length > 1) {
        mdParts.push(`\n## Subtopic ${i + 1} (Code: \`${code}\`)\n`);
      }
      mdParts.push(entryMd);
    }

    const decodedTitle = decodeHtmlEntities(bestMatch);
    const formattedText = `# Topic Study: ${decodedTitle}\n\n` + mdParts.join("\n\n");

    return { topic: decodedTitle, formattedText, results };
  } catch (err: any) {
    return { error: `Topic study query error: ${err.message}` };
  }
}
