import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString } from "./bibleService.js";
import { Env, MorphologyWord } from "../types.js";

export async function lookupMorphology(
  env: Env,
  reference: string
): Promise<{ error?: string; formattedText?: string; words?: MorphologyWord[] }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Invalid reference for morphology lookup: '${reference}'` };
  }

  let words: MorphologyWord[] = [];

  // 1. Preferred path: Query Cloudflare D1
  if (env.MORPHOLOGY_DB) {
    try {
      const stmt = env.MORPHOLOGY_DB.prepare(
        "SELECT Word, Transliteration, Gloss, Morphology, Lexeme, Translation FROM morphology WHERE Book = ? AND Chapter = ? AND Verse = ? ORDER BY WordID ASC"
      ).bind(parsed.bookNumber, parsed.chapterStart, parsed.verseStart);
      const res = await stmt.all<MorphologyWord>();
      words = res.results || [];
    } catch (d1Err: any) {
      console.warn("D1 morphology query failed, falling back to SQLite:", d1Err.message);
    }
  }

  // 2. Fallback path (Local development with mock R2 / sql.js)
  if (words.length === 0 && env.BIBLEMATE_DATA) {
    const { db, error: dbError } = await getDatabase(env, "morphology.sqlite");
    if (db) {
      try {
        const stmt = db.prepare(
          "SELECT Word, Transliteration, Gloss, Morphology, Lexeme, Translation FROM morphology WHERE Book = ? AND Chapter = ? AND Verse = ? ORDER BY WordID ASC"
        );
        stmt.bind([parsed.bookNumber, parsed.chapterStart, parsed.verseStart]);
        while (stmt.step()) {
          words.push(stmt.getAsObject() as any);
        }
        stmt.free();
      } catch (sqlErr: any) {
        return { error: `Morphology query error: ${sqlErr.message}` };
      }
    } else if (!env.MORPHOLOGY_DB) {
      return { error: dbError || "Morphology database not available." };
    }
  }

  if (words.length === 0) {
    return { error: `No morphology records found for ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}` };
  }

  const tableRows = words.map((w) =>
    `| ${w.Word || ""} | ${w.Transliteration || ""} | ${w.Gloss || w.Translation || ""} | ${w.Morphology || ""} | ${w.Lexeme || ""} |`
  );

  const formattedText =
    `# Morphology & Parsing: ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}\n\n` +
    `| Original | Transliteration | Gloss/Meaning | Morphology | Lemma |\n` +
    `| :--- | :--- | :--- | :--- | :--- |\n` +
    tableRows.join("\n");

  return { words, formattedText };
}
