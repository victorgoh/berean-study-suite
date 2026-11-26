import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString } from "./bibleService.js";
import { Env, MorphologyWord } from "../types.js";
import { strongsOf, translationOf } from "../utils/morphology.js";
import { dependencyUnavailable, internalError, invalidRequest, notFound, type ServiceErrorFields } from "./errors.js";

export async function lookupMorphology(
  env: Env,
  reference: string
): Promise<ServiceErrorFields & { formattedText?: string; words?: MorphologyWord[] }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return invalidRequest(`Invalid reference for morphology lookup: '${reference}'`);
  }

  let words: MorphologyWord[] = [];

  // 1. Preferred path: Query Cloudflare D1
  if (env.MORPHOLOGY_DB) {
    try {
      const stmt = env.MORPHOLOGY_DB.prepare(
        "SELECT Word, LexicalEntry, Transliteration, Gloss, Morphology, Lexeme, Translation FROM morphology WHERE Book = ? AND Chapter = ? AND Verse = ? ORDER BY WordID ASC"
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
          "SELECT Word, LexicalEntry, Transliteration, Gloss, Morphology, Lexeme, Translation FROM morphology WHERE Book = ? AND Chapter = ? AND Verse = ? ORDER BY WordID ASC"
        );
        stmt.bind([parsed.bookNumber, parsed.chapterStart, parsed.verseStart]);
        while (stmt.step()) {
          words.push(stmt.getAsObject() as any);
        }
        stmt.free();
      } catch (sqlErr: any) {
        return internalError("Morphology query", sqlErr);
      }
    } else if (!env.MORPHOLOGY_DB) {
      return dependencyUnavailable(dbError || "Morphology database not available.");
    }
  }

  words = words.map(({ LexicalEntry, ...w }) => ({
    ...w,
    Strongs: strongsOf(LexicalEntry),
    Translation: translationOf(w.Translation)
  }));

  if (words.length === 0) {
    return notFound(`No morphology records found for ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}`);
  }

  const tableRows = words.map((w) =>
    `| ${w.Word || ""} | ${w.Transliteration || ""} | ${w.Gloss || w.Translation || ""} | ${w.Morphology || ""} | ${w.Lexeme || ""} | ${w.Strongs || ""} |`
  );

  const formattedText =
    `# Morphology & Parsing: ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}\n\n` +
    `| Original | Transliteration | Gloss/Meaning | Morphology | Lemma | Strong's |\n` +
    `| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    tableRows.join("\n");

  return { words, formattedText };
}
