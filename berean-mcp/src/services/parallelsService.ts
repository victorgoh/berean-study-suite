import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { findBestMatch, decodeHtmlEntities } from "../utils/fuzzyMatch.js";
import { OFFICIAL_BOOK_NAMES } from "../mcp/constants.js";
import { lookupBiblePassage } from "./bibleService.js";
import { Env } from "../types.js";

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

  // Fallback: match standard passage patterns like "Matt 5:1-7:29; Luke 6:20-49"
  if (refs.length === 0) {
    const clean = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (clean) {
      const parts = clean.split(/[,;\n]/).map((p) => p.trim()).filter((p) => p.length > 0);
      refs.push(...parts);
    }
  }

  return refs;
}

export async function lookupParallels(
  env: Env,
  query: string,
  includeScriptureText: boolean = false,
  bibleVersion: string = "NET"
): Promise<{ error?: string; formattedText?: string; title?: string; passages?: string[] }> {
  const index = await getJsonFromR2<Record<string, [string, string][]>>(env, "data/lookup/parallels_index.json");
  if (!index) {
    return { error: "Parallels lookup index (parallels_index.json) not available in R2." };
  }

  const bestMatch = findBestMatch(query, Object.keys(index));
  if (!bestMatch) {
    return { error: `Could not locate parallel passages for '${query}'.` };
  }

  const pairs = index[bestMatch];
  if (!pairs || pairs.length === 0) {
    return { error: `No parallel records found for '${bestMatch}'.` };
  }

  const { db, error: dbError } = await getDatabase(env, "collections3.sqlite");
  if (!db) {
    return { error: dbError || "Collections database (collections3.sqlite) not found in R2." };
  }

  try {
    const allPassages: string[] = [];

    for (const [tool, num] of pairs) {
      const stmt = db.prepare("SELECT Passages FROM PARALLEL WHERE Tool = ? AND Number = ? LIMIT 1");
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
      return { error: `No parallel passages found for '${bestMatch}'.` };
    }

    const title = decodeHtmlEntities(bestMatch);
    const lines: string[] = [];
    lines.push(`# Parallel Passages / Harmony: ${title}\n`);
    lines.push(`**Identified Parallel Accounts**:`);
    for (const p of allPassages) {
      lines.push(`• **${p}**`);
    }

    if (includeScriptureText) {
      lines.push("\n---\n### Scripture Texts:\n");
      for (const p of allPassages) {
        const verseRes = await lookupBiblePassage(env, bibleVersion, p);
        if (verseRes.formattedText) {
          lines.push(verseRes.formattedText + "\n");
        }
      }
    }

    return { title, formattedText: lines.join("\n"), passages: allPassages };
  } catch (err: any) {
    return { error: `Parallel passages query error: ${err.message}` };
  }
}
