import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString } from "./bibleService.js";
import { lookupLexiconEntry } from "./lexiconService.js";
import { Env, MorphologyWord, StudyPackResponse } from "../types.js";

// Common stop-words for Greek and Hebrew that are excluded from default "rare_and_notable" glossary
const GREEK_COMMON_LEMMAS = new Set([
  "ὁ", "ἡ", "τό", "καί", "δέ", "ἐν", "εἰς", "ἐκ", "ἐξ", "πρός", "αὐτός", "σύ", "ἐγώ", "ὅς", "ὅστις", 
  "οὐ", "οὐκ", "οὐχ", "μή", "γάρ", "ὅτι", "εἰμί", "τε", "διά", "μετά", "περί", "κατά", "ὑπό", "παρά",
  "οὗτος", "ἐκεῖνος", "τις", "τίς", "ὡς", "οὖν", "οὕτως"
]);

const HEBREW_COMMON_LEMMAS = new Set([
  "אֵת", "אֲשֶׁר", "כִּי", "עַל", "אֶל", "בְּ", "לְ", "מִן", "הַ", "כֹּל", "אָמַר", "הוּא", "הִיא",
  "אֲנִי", "אָנֹכִי", "אַתָּה", "זֶה", "זֹאת", "עִם", "לֹא", "אַל", "גַּם", "עַד", "כֹּה", "כַּאֲשֶׁר"
]);

export interface GlossaryEntry {
  index: number;
  wordInText: string;
  lemma: string;
  transliteration: string;
  strongs: string;
  datasetTag: string;
  morphology: string;
  gloss: string;
  definition: string;
}

export interface InterlinearVerse {
  chapter: number;
  verse: number;
  words: {
    word: string;
    transliteration: string;
    gloss: string;
    morphology: string;
    lemma: string;
    strongs?: string;
    glossaryIndex?: number;
  }[];
}

export interface InterlinearResult {
  reference: string;
  bookName: string;
  isOT: boolean;
  verses: InterlinearVerse[];
  glossary: GlossaryEntry[];
}

function extractCanonicalStrongs(raw: string | undefined, isOT: boolean): string {
  if (!raw) return isOT ? "H0000" : "G0000";
  const prefix = isOT ? "H" : "G";
  const m = raw.match(/\b([GH]\d{1,5})\b/i);
  if (m) return m[1].toUpperCase();
  const m2 = raw.match(/(\d{1,5})/);
  if (m2) return `${prefix}${m2[1]}`;
  return `${prefix}0000`;
}

export async function lookupInterlinear(
  env: Env,
  reference: string,
  glossaryFilter: "rare_and_notable" | "all_words" | "none" = "rare_and_notable",
  glossColor: string = "#888888"
): Promise<StudyPackResponse & { result?: InterlinearResult }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    const errorMsg = `Invalid passage reference for interlinear lookup: '${reference}'`;
    return {
      error: errorMsg,
      formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: ${errorMsg}*\n`,
      sections: { error: errorMsg },
      metadata: {
        title: `Inline Interlinear Study Pack: ${reference}`,
        reference,
        timestamp: new Date().toISOString()
      }
    };
  }

  const isOT = parsed.bookNumber <= 39;
  let rawWords: MorphologyWord[] = [];

  // 1. Query Cloudflare D1 (biblemate-morphology)
  if (env.MORPHOLOGY_DB) {
    try {
      const stmt = env.MORPHOLOGY_DB.prepare(
        `SELECT WordID, Book, Chapter, Verse, Word, LexicalEntry, Morphology, Lexeme, Transliteration, Gloss, Translation 
         FROM morphology 
         WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? 
         ORDER BY Chapter ASC, Verse ASC, WordID ASC`
      ).bind(parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd);
      const res = await stmt.all<MorphologyWord>();
      rawWords = res.results || [];
    } catch (d1Err: any) {
      console.warn("D1 morphology query failed, falling back to SQLite:", d1Err.message);
    }
  }

  // 2. Fallback path (R2 / SQLite)
  if (rawWords.length === 0 && env.BEREAN_DATA) {
    const { db, error: dbError } = await getDatabase(env, "morphology.sqlite");
    if (db) {
      try {
        const stmt = db.prepare(
          `SELECT WordID, Book, Chapter, Verse, Word, LexicalEntry, Morphology, Lexeme, Transliteration, Gloss, Translation 
           FROM morphology 
           WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? 
           ORDER BY Chapter ASC, Verse ASC, WordID ASC`
        );
        stmt.bind([parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd]);
        while (stmt.step()) {
          rawWords.push(stmt.getAsObject() as any);
        }
        stmt.free();
      } catch (sqlErr: any) {
        const errorMsg = `Morphology query error: ${sqlErr.message}`;
        return {
          error: errorMsg,
          formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: ${errorMsg}*\n`,
          sections: { error: errorMsg },
          metadata: {
            title: `Inline Interlinear Study Pack: ${reference}`,
            reference,
            language: isOT ? "Hebrew/Aramaic" : "Greek",
            isOT,
            timestamp: new Date().toISOString()
          }
        };
      }
    } else if (!env.MORPHOLOGY_DB) {
      const errorMsg = dbError || "Morphology database not available.";
      return {
        error: errorMsg,
        formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: ${errorMsg}*\n`,
        sections: { error: errorMsg },
        metadata: {
          title: `Inline Interlinear Study Pack: ${reference}`,
          reference,
          language: isOT ? "Hebrew/Aramaic" : "Greek",
          isOT,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  if (rawWords.length === 0) {
    const errorMsg = `No morphology records found for ${parsed.bookName} ${reference}.`;
    return {
      error: errorMsg,
      formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: ${errorMsg}*\n`,
      sections: { error: errorMsg },
      metadata: {
        title: `Inline Interlinear Study Pack: ${reference}`,
        reference,
        language: isOT ? "Hebrew/Aramaic" : "Greek",
        isOT,
        timestamp: new Date().toISOString()
      }
    };
  }

  // 3. Group words by verse
  const versesMap = new Map<string, MorphologyWord[]>();
  for (const w of rawWords) {
    const key = `${w.Chapter}:${w.Verse}`;
    if (!versesMap.has(key)) {
      versesMap.set(key, []);
    }
    versesMap.get(key)!.push(w);
  }

  // 4. Select words for Glossary & Lexical Entries
  const glossaryEntries: GlossaryEntry[] = [];
  const lemmaToEntryMap = new Map<string, number>();

  if (glossaryFilter !== "none") {
    let entryCounter = 1;
    for (const w of rawWords) {
      const lemma = (w.Lexeme || w.Word || "").trim();
      if (!lemma) continue;

      if (glossaryFilter === "rare_and_notable") {
        const isCommon = isOT ? HEBREW_COMMON_LEMMAS.has(lemma) : GREEK_COMMON_LEMMAS.has(lemma);
        if (isCommon) continue;
      }

      if (!lemmaToEntryMap.has(lemma)) {
        lemmaToEntryMap.set(lemma, entryCounter);

        const standardizedStrongs = extractCanonicalStrongs(w.LexicalEntry, isOT);
        const datasetTag = isOT ? `[${standardizedStrongs} • TBESH]` : `[${standardizedStrongs} • TBESG]`;

        glossaryEntries.push({
          index: entryCounter,
          wordInText: w.Word,
          lemma,
          transliteration: w.Transliteration || "",
          strongs: standardizedStrongs,
          datasetTag,
          morphology: w.Morphology || "",
          gloss: w.Gloss || w.Translation || "",
          definition: ""
        });

        entryCounter++;
      }
    }

    // Fetch lexicon definitions for glossary entries using modern TBESG / TBESH
    for (const entry of glossaryEntries) {
      if (entry.strongs && entry.strongs !== "G0000" && entry.strongs !== "H0000") {
        try {
          const lexRes = await lookupLexiconEntry(env, entry.strongs, "step");
          if (lexRes.definition && !lexRes.error) {
            const firstPara = lexRes.definition.split("\n\n")[0].replace(/^###.*?\n/, "").trim();
            entry.definition = firstPara.length > 250 ? firstPara.slice(0, 247) + "..." : firstPara;
          }
        } catch {
          // Keep definition empty if lookup fails
        }
      }
    }
  }

  // 5. Build structured result and Markdown formatted text
  const structuredVerses: InterlinearVerse[] = [];
  const verseMarkdownBlocks: string[] = [];

  for (const [key, wordsInVerse] of versesMap.entries()) {
    const [cStr, vStr] = key.split(":");
    const c = parseInt(cStr, 10);
    const v = parseInt(vStr, 10);

    const structuredWords = [];
    const inlineWordSpans = [];

    for (const w of wordsInVerse) {
      const lemma = (w.Lexeme || w.Word || "").trim();
      const glossIndex = lemmaToEntryMap.get(lemma);
      const gloss = w.Gloss || w.Translation || "";

      structuredWords.push({
        word: w.Word,
        transliteration: w.Transliteration || "",
        gloss,
        morphology: w.Morphology || "",
        lemma,
        strongs: w.LexicalEntry,
        glossaryIndex: glossIndex
      });

      const anchorSup = glossIndex ? `<sup>[${glossIndex}](#entry-${glossIndex})</sup>` : "";
      inlineWordSpans.push(`**${w.Word}**${anchorSup} <span style="color: ${glossColor};">${gloss}</span>`);
    }

    structuredVerses.push({
      chapter: c,
      verse: v,
      words: structuredWords
    });

    verseMarkdownBlocks.push(`**[${v}]** ` + inlineWordSpans.join(" "));
  }

  // 6. Build the Complete Formatted Markdown Output conforming to Composite Study Pack standards
  const sections: Record<string, string> = {};
  let formattedText = `# Inline Interlinear Study Pack: ${reference}\n\n`;

  let sectionIdx = 1;
  const interlinearText = verseMarkdownBlocks.join("\n\n");
  sections["interlinear_text"] = interlinearText;
  formattedText += `## ${sectionIdx++}. Inline Interlinear Text (${isOT ? "Hebrew/Aramaic" : "Greek"} & Glosses)\n${interlinearText}\n\n`;

  if (glossaryEntries.length > 0) {
    let glossaryText = "";
    for (const g of glossaryEntries) {
      glossaryText += `<a id="entry-${g.index}"></a>\n`;
      glossaryText += `* <sup>**[${g.index}]**</sup> **${g.lemma}** (*${g.transliteration}*) — \`${g.datasetTag}\` *(in text: **${g.wordInText}**)*  \n`;
      if (g.morphology) {
        glossaryText += `  * **Parsing:** ${g.morphology}  \n`;
      }
      glossaryText += `  * **Gloss:** *${g.gloss}*  \n`;
      if (g.definition) {
        glossaryText += `  * **Lexical Definition:** ${g.definition}  \n`;
      }
      glossaryText += `\n`;
    }
    const cleanGlossary = glossaryText.trim();
    sections["glossary"] = cleanGlossary;
    formattedText += `## ${sectionIdx++}. Original Language Glossary & Lexical Entries\n${cleanGlossary}\n\n`;
  }

  const tip = `> [!TIP]\n> Use this data pack with the **Biblical Linguistic Analyst** or **Biblical Translator** persona to evaluate syntax, word order, verbal aspect, and discourse flow in the original biblical languages.\n`;
  formattedText += tip;

  const result: InterlinearResult = {
    reference,
    bookName: parsed.bookName,
    isOT,
    verses: structuredVerses,
    glossary: glossaryEntries
  };

  return {
    formattedText,
    sections,
    metadata: {
      title: `Inline Interlinear Study Pack: ${reference}`,
      reference,
      bookName: parsed.bookName,
      language: isOT ? "Hebrew/Aramaic" : "Greek",
      isOT,
      glossaryFilter,
      glossColor,
      versesCount: structuredVerses.length,
      glossaryCount: glossaryEntries.length,
      timestamp: new Date().toISOString()
    },
    result
  };
}

/**
 * Standardized alias for lookupInterlinear as a composite study pack.
 */
export const getInterlinearStudyPack = lookupInterlinear;
