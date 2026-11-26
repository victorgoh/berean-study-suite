import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { findBestMatch, decodeHtmlEntities } from "../utils/fuzzyMatch.js";
import { OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { lookupBiblePassage } from "./bibleService.js";
import { Env } from "../types.js";
import { dependencyUnavailable, internalError, notFound, type ServiceErrorFields } from "./errors.js";

function decodeBcvArgs(args: number[]): string | null {
  if (args.length === 3) {
    const [bookNum, chap, verse] = args;
    if (bookNum < OFFICIAL_BOOK_NAMES.length) {
      return `${OFFICIAL_BOOK_NAMES[bookNum]} ${chap}:${verse}`;
    }
  } else if (args.length === 5) {
    const [bookNum, cStart, vStart, cEnd, vEnd] = args;
    if (bookNum < OFFICIAL_BOOK_NAMES.length) {
      const book = OFFICIAL_BOOK_NAMES[bookNum];
      if (cStart === cEnd) {
        return `${book} ${cStart}:${vStart}-${vEnd}`;
      } else {
        return `${book} ${cStart}:${vStart}-${cEnd}:${vEnd}`;
      }
    }
  }
  return null;
}

function parsePassageRefs(html: string): string[] {
  const refs: string[] = [];
  const refMatches = [...html.matchAll(/onclick=["']bcv\(([^)]+)\)["']/gi)];

  for (const m of refMatches) {
    const rawArgs = m[1].split(",").map((a) => parseInt(a.trim(), 10));
    const decoded = decodeBcvArgs(rawArgs);
    if (decoded) refs.push(decoded);
  }

  // Fallback
  if (refs.length === 0) {
    const clean = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (clean) {
      const parts = clean.split(/[,;\n]/).map((p) => p.trim()).filter((p) => p.length > 0);
      refs.push(...parts);
    }
  }

  return refs;
}

/**
 * Everyday feelings and needs, mapped to the situational topics in the index
 * ("When you are afraid", "When you worry", ...). Without this, a query such as
 * "Fear" fuzzy-matches the shortest title containing the word ("GRACE TO FEAR
 * GOD"), which is a different subject.
 */
const SITUATION_TOPICS: Record<string, string> = {
  fear: "When you are afraid", fears: "When you are afraid", afraid: "When you are afraid",
  scared: "When you are afraid", frightened: "When you are afraid",
  worry: "When you worry", worried: "When you worry", worries: "When you worry",
  anxiety: "[19] Promises to Those Who are Anxious and Afraid", anxious: "[19] Promises to Those Who are Anxious and Afraid",
  despair: "When you are in despair", hopeless: "When you are in despair", depression: "When you are in despair", depressed: "When you are in despair",
  crisis: "When you are in crisis",
  discouraged: "When you are discouraged", discouragement: "When you are discouraged",
  sad: "When you are sad", sadness: "When you are sad", grief: "When you are sad", sorrow: "When you are sad", grieving: "When you are sad",
  doubt: "When you doubt", doubts: "When you doubt", doubting: "When you doubt",
  trouble: "When you are in troubles", troubles: "When you are in troubles",
  frustrated: "When you are frustrated", frustration: "When you are frustrated",
  danger: "When you are in dangers", dangers: "When you are in dangers",
  lonely: "When you are lonely", loneliness: "When you are lonely", alone: "When you are lonely",
  justice: "When you need justice", injustice: "When you need justice",
  tired: "When you are tired", weary: "When you are tired", exhausted: "When you are tired", weariness: "When you are tired",
  betrayed: "When you are betrayed", betrayal: "When you are betrayed",
  tempted: "When you are tempted", temptation: "When you are tempted",
  lost: "When you are lost"
};

/** Exact topic names win; then everyday feelings; then fuzzy matching. */
function matchPromiseTopic(query: string, topics: string[]): string | null {
  const q = query.trim().toLowerCase();
  const exact = topics.find((t) => decodeHtmlEntities(t).toLowerCase() === q);
  if (exact) return exact;
  const situation = SITUATION_TOPICS[q];
  if (situation && topics.includes(situation)) return situation;
  return findBestMatch(query, topics);
}

export async function lookupPromises(
  env: Env,
  topic: string,
  includeScriptureText: boolean = false,
  bibleVersion: string = "NET"
): Promise<ServiceErrorFields & { formattedText?: string; topic?: string; passages?: string[] }> {
  const index = await getJsonFromR2<Record<string, [string, string][]>>(env, "data/lookup/promises_index.json");
  if (!index) {
    return dependencyUnavailable("Promises lookup index (promises_index.json) not available in R2.");
  }

  const bestMatch = matchPromiseTopic(topic, Object.keys(index));
  if (!bestMatch) {
    return notFound(`Could not locate biblical promises for topic '${topic}'.`);
  }

  const pairs = index[bestMatch];
  if (!pairs || pairs.length === 0) {
    return notFound(`No promise records found for '${bestMatch}'.`);
  }

  const { db, error: dbError } = await getDatabase(env, "collections3.sqlite");
  if (!db) {
    return dependencyUnavailable(dbError || "Collections database (collections3.sqlite) not found in R2.");
  }

  try {
    const allPassages: string[] = [];

    for (const [tool, num] of pairs) {
      const stmt = db.prepare("SELECT Passages FROM PROMISES WHERE Tool = ? AND Number = ? LIMIT 1");
      stmt.bind([parseInt(tool, 10), parseInt(num, 10)]);
      if (stmt.step()) {
        const row = stmt.getAsObject() as { Passages: string };
        const parsed = parsePassageRefs(row.Passages || "");
        for (const p of parsed) {
          if (!allPassages.includes(p)) allPassages.push(p);
        }
      }
      stmt.free();
    }

    if (allPassages.length === 0) {
      return notFound(`No biblical promise passages found for '${bestMatch}'.`);
    }

    const title = decodeHtmlEntities(bestMatch);
    const lines: string[] = [];
    lines.push(`# Biblical Promises: ${title}\n`);

    if (includeScriptureText) {
      lines.push("### Scripture Promises\n");
      for (const p of allPassages) {
        const verseRes = await lookupBiblePassage(env, bibleVersion, p);
        if (verseRes.formattedText) {
          lines.push(verseRes.formattedText + "\n");
        }
      }
    } else {
      lines.push("**Scripture Promises**:");
      for (const p of allPassages) {
        lines.push(`• **${p}**`);
      }
    }

    return { topic: title, formattedText: lines.join("\n"), passages: allPassages };
  } catch (err: any) {
    return internalError("Biblical promises query", err);
  }
}
