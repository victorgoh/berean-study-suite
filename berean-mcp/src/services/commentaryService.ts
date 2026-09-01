import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString, ParsedReference } from "./bibleService.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { resolveCommentary } from "../config/databaseMap.js";
import { Env, CommentaryResult } from "../types.js";

function extractFromVidTags(text: string, book: number, chapter: number, targetVerses: Set<number>): string {
  const pattern = /<vid\s+id=["']v(\d+)\.(\d+)\.(\d+)["'][^>]*>[\s\S]*?<\/vid>/gi;
  const matches: { start: number; end: number; verse: number }[] = [];

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const b = parseInt(match[1], 10);
    const c = parseInt(match[2], 10);
    const v = parseInt(match[3], 10);
    if (b === book && c === chapter) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        verse: v
      });
    }
  }

  if (matches.length === 0) return "";

  const segments: { verses: number[]; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const startPos = matches[i].end;
    const endPos = i < matches.length - 1 ? matches[i + 1].start : text.length;
    segments.push({
      verses: [matches[i].verse],
      text: text.slice(startPos, endPos)
    });
  }

  const mergedSegments: { verses: number[]; text: string }[] = [];
  let pendingVerses: number[] = [];

  for (const seg of segments) {
    const textContent = seg.text.replace(/<[^>]+>/g, "").trim();
    if (!textContent) {
      pendingVerses.push(...seg.verses);
    } else {
      const currentVerses = [...pendingVerses, ...seg.verses];
      mergedSegments.push({
        verses: currentVerses,
        text: seg.text
      });
      pendingVerses = [];
    }
  }

  if (pendingVerses.length > 0 && mergedSegments.length > 0) {
    mergedSegments[mergedSegments.length - 1].verses.push(...pendingVerses);
  }

  const matchingTexts: string[] = [];
  for (const seg of mergedSegments) {
    const hasTarget = seg.verses.some((v) => targetVerses.has(v));
    if (hasTarget) {
      const cleaned = cleanHtmlToMarkdown(seg.text);
      if (cleaned) {
        const sortedVs = Array.from(new Set(seg.verses)).sort((a, b) => a - b);
        const vsStr = sortedVs.join(",");
        matchingTexts.push(`[Commentary for Verse(s) ${vsStr}]:\n${cleaned}`);
      }
    }
  }

  return matchingTexts.join("\n\n");
}

export async function lookupCommentary(
  env: Env,
  version: string = "Henry",
  reference: string
): Promise<{ error?: string; formattedText?: string; result?: CommentaryResult }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Invalid passage reference for commentary: "${reference}"` };
  }

  const meta = resolveCommentary(version);
  if (!meta) {
    return { error: `Unknown commentary '${version}'. Choose a registered commentary from get_available_resources.` };
  }

  const cleanVer = meta.key;
  let storagePath = meta.getStoragePath(parsed.bookNumber);

  let { db, error: dbError } = await getDatabase(env, storagePath);
  
  // Flexible fallback: if cName.commentary fails, try Name.commentary or cName.sqlite
  if (!db) {
    const fallbackKeys = [
      `commentaries/${cleanVer}.commentary`,
      `commentaries/c${cleanVer}.sqlite`,
      `commentaries/${cleanVer}.sqlite`,
      `commentaries/${cleanVer}.db`
    ];
    for (const altKey of fallbackKeys) {
      const res = await getDatabase(env, altKey);
      if (res.db) {
        db = res.db;
        dbError = undefined;
        storagePath = altKey;
        break;
      }
    }
  }

  if (!db) {
    return { error: dbError || `Commentary database for '${cleanVer}' not found in storage (${storagePath}).` };
  }

  try {
    const tableInfoStmt = db.prepare("PRAGMA table_info(Commentary)");
    const cols: string[] = [];
    while (tableInfoStmt.step()) {
      cols.push((tableInfoStmt.getAsObject() as any).name);
    }
    tableInfoStmt.free();

    const hasVerse = cols.includes("Verse");
    const textCol = cols.includes("Content") ? "Content" : cols.includes("Scripture") ? "Scripture" : cols[cols.length - 1];

    let sql = "";
    let params: any[] = [];

    if (hasVerse) {
      sql = `SELECT Chapter, Verse, ${textCol} as Text FROM Commentary WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? ORDER BY Chapter, Verse`;
      params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd];
    } else {
      sql = `SELECT Chapter, ${textCol} as Text FROM Commentary WHERE Book = ? AND Chapter = ? LIMIT 1`;
      params = [parsed.bookNumber, parsed.chapterStart];
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const rows: { Chapter: number; Verse?: number; Text: string }[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as any);
    }
    stmt.free();

    if (rows.length === 0) {
      return {
        error: `VERSE_NOT_FOUND: No commentary found in c${cleanVer} for ${parsed.bookName} ${reference}. Request the chapter explicitly or choose another commentary.`
      };
    }

    let commentaryOutput = "";

    if (hasVerse) {
      commentaryOutput = rows
        .map((r) => `### ${parsed.bookName} ${r.Chapter}:${r.Verse}\n\n` + cleanHtmlToMarkdown(r.Text))
        .join("\n\n---\n\n");
    } else {
      // Full chapter commentary or parse <vid> tags if specific verses requested
      const rawChapterText = rows[0].Text || "";
      if (parsed.verseStart > 1 || parsed.verseEnd < 999) {
        const targetSet = new Set<number>();
        for (let v = parsed.verseStart; v <= parsed.verseEnd; v++) targetSet.add(v);
        const filtered = extractFromVidTags(rawChapterText, parsed.bookNumber, parsed.chapterStart, targetSet);
        if (filtered) {
          commentaryOutput = filtered;
        } else {
          commentaryOutput = cleanHtmlToMarkdown(rawChapterText);
        }
      } else {
        commentaryOutput = cleanHtmlToMarkdown(rawChapterText);
      }
    }

    const formattedText = `# [${cleanVer}] Commentary on ${parsed.bookName} ${reference}\n\n` + commentaryOutput;

    return {
      formattedText,
      result: {
        book: parsed.bookName,
        chapter: parsed.chapterStart,
        verses: `${parsed.verseStart}-${parsed.verseEnd}`,
        version: cleanVer,
        commentaryText: commentaryOutput
      }
    };
  } catch (err: any) {
    return { error: `Commentary query error: ${err.message}` };
  }
}
