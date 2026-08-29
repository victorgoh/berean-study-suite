import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { findBestMatch, decodeHtmlEntities } from "../utils/fuzzyMatch.js";
import { OFFICIAL_BOOK_NAMES, raw_mappings } from "../mcp/constants.js";
import { lookupBiblePassage } from "./bibleService.js";
import { Env } from "../types.js";

const STOP_WORDS = new Set([
  "parallels",
  "parallel",
  "passages",
  "passage",
  "harmony",
  "account",
  "accounts",
  "story",
  "of",
  "the",
  "in",
  "and",
  "a",
  "an",
  "to",
  "for",
  "by",
  "with"
]);

function extractScriptureRef(query: string): { bookNum: number; chapter?: number; rawRef: string } | null {
  const refRegex = /([1-3]?\s*[a-zA-Z]+)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?/g;
  let match: RegExpExecArray | null;
  while ((match = refRegex.exec(query)) !== null) {
    const bookStr = match[1].toLowerCase().replace(/\s+/g, " ").trim();
    const chapter = match[2] ? parseInt(match[2], 10) : undefined;
    for (const [numStr, aliases] of Object.entries(raw_mappings)) {
      if (aliases.includes(bookStr)) {
        return { bookNum: parseInt(numStr, 10), chapter, rawRef: match[0].trim() };
      }
    }
  }
  return null;
}

function scoreTitleMatch(title: string, tokens: string[]): number {
  const tLower = title.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (tLower.includes(t)) {
      score += 15 + t.length;
    } else if (t.length >= 4) {
      const root = t.slice(0, 4);
      if (tLower.includes(root)) {
        score += 8;
      }
    }
  }
  return score;
}

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

  // Fallback: match standard passage patterns
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

  const { db, error: dbError } = await getDatabase(env, "collections3.sqlite");
  if (!db) {
    return { error: dbError || "Collections database (collections3.sqlite) not found in R2." };
  }

  const queryClean = query.trim().toLowerCase();
  const scripRef = extractScriptureRef(query);

  // Build reverse map for tool:num -> title
  const reverseMap = new Map<string, string>();
  for (const [title, pairs] of Object.entries(index)) {
    for (const [tool, num] of pairs) {
      if (!reverseMap.has(`${tool}:${num}`)) {
        reverseMap.set(`${tool}:${num}`, title);
      }
    }
  }

  let selectedTitle: string | null = null;
  let targetPairs: [string, string][] = [];

  // Strategy 1: Direct Passage Matching if query contains a scripture reference (e.g. "Matthew 4:1-11", "Matt 28:1-10")
  if (scripRef && scripRef.chapter !== undefined) {
    try {
      const stmt = db.prepare(
        "SELECT Tool, Number, Passages FROM PARALLEL WHERE Passages LIKE ? OR Passages LIKE ? LIMIT 50"
      );
      stmt.bind([
        `%bcv(${scripRef.bookNum},${scripRef.chapter},%`,
        `%bcv(${scripRef.bookNum}, ${scripRef.chapter},%`
      ]);

      const rows: { Tool: number; Number: number; Passages: string }[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as { Tool: number; Number: number; Passages: string });
      }
      stmt.free();

      // Find the row that actually contains the target book and chapter
      for (const row of rows) {
        const parsed = parsePassageRefs(row.Passages || "");
        const bookName = OFFICIAL_BOOK_NAMES[scripRef.bookNum];
        const matchesRef = parsed.some((p) => {
          if (!p.startsWith(bookName)) return false;
          return p.includes(` ${scripRef.chapter}:`) || p.startsWith(`${bookName} ${scripRef.chapter}`);
        });

        if (matchesRef) {
          const key = `${row.Tool}:${row.Number}`;
          selectedTitle = reverseMap.get(key) || `Parallel for ${scripRef.rawRef}`;
          targetPairs = [[String(row.Tool), String(row.Number)]];
          break;
        }
      }
    } catch {
      // Fall through to title scoring
    }
  }

  // Strategy 2: Title token scoring (e.g. "temptation", "resurrection", "the three temptations of jesus")
  if (targetPairs.length === 0) {
    const rawTokens = queryClean
      .replace(/[^a-z0-9:\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

    if (rawTokens.length > 0) {
      const scored = Object.keys(index)
        .map((k) => ({ key: k, score: scoreTitleMatch(k, rawTokens) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0 && scored[0].score >= 8) {
        selectedTitle = scored[0].key;
        targetPairs = index[selectedTitle] || [];
      }
    }
  }

  // Strategy 3: Standard fuzzy match fallback
  if (!selectedTitle || targetPairs.length === 0) {
    const bestMatch = findBestMatch(query, Object.keys(index));
    if (bestMatch && index[bestMatch]) {
      selectedTitle = bestMatch;
      targetPairs = index[bestMatch];
    }
  }

  if (!selectedTitle || targetPairs.length === 0) {
    return { error: `Could not locate parallel passages for '${query}'.` };
  }

  try {
    const allPassages: string[] = [];

    for (const [tool, num] of targetPairs) {
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
      return { error: `No parallel passages found for '${selectedTitle}'.` };
    }

    const title = decodeHtmlEntities(selectedTitle);
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
