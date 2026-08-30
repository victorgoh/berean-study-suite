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

/**
 * Converts a 1-based index into an alphabetical label:
 * 1 -> a, 2 -> b, ..., 26 -> z, 27 -> aa, 28 -> ab, etc.
 */
export function getAlphaLabel(index: number): string {
  let label = "";
  let n = index - 1;
  while (n >= 0) {
    label = String.fromCharCode(97 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label || "a";
}

export interface GlossaryEntry {
  index: number;
  alphaLabel: string;
  wordInText: string;
  lemma: string;
  transliteration: string;
  strongs: string;
  datasetTag: string;
  morphology: string;
  stepMorphology?: string;
  gloss: string;
  definition: string;
  subEntries?: {
    strongs: string;
    lemma: string;
    transliteration: string;
    morphology: string;
    gloss: string;
    definition: string;
  }[];
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
    alphaLabel?: string;
  }[];
}

export interface InterlinearResult {
  reference: string;
  bookName: string;
  isOT: boolean;
  displayMode: "inline" | "ruby" | "table";
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

/**
 * Enhanced Interlinear Study Pack Service
 * Utilizes STEPBible TBESG & TBESH lexicons for original language parsing,
 * contextual glosses, disambiguated roots, and customizable display modes (inline, ruby, table).
 */
export async function lookupInterlinear(
  env: Env,
  reference: string,
  glossaryFilter: "rare_and_notable" | "all" | "none" = "rare_and_notable",
  glossColor: string = "#777777",
  displayMode: "inline" | "ruby" | "table" = "inline"
): Promise<StudyPackResponse & { result?: InterlinearResult }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return {
      formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: Could not parse reference '${reference}'.*`,
      sections: { error: `Invalid biblical reference '${reference}'` }
    };
  }

  const isOT = parsed.bookNumber <= 39;
  const dbFile = isOT ? "morphology/OTMorph.sqlite" : "morphology/NTMorph.sqlite";

  // 1. First attempt D1 morphology query
  let rawWords: MorphologyWord[] = [];
  let d1Success = false;

  if (env && env.MORPHOLOGY_DB) {
    try {
      let d1Sql = "";
      let d1Params: (number | string)[] = [];

      if (parsed.chapterStart === parsed.chapterEnd) {
        d1Sql = `SELECT * FROM morphology WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? ORDER BY WordID ASC, Chapter ASC, Verse ASC`;
        d1Params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd];
      } else {
        d1Sql = `SELECT * FROM morphology WHERE Book = ? AND ((Chapter = ? AND Verse >= ?) OR (Chapter > ? AND Chapter < ?) OR (Chapter = ? AND Verse <= ?)) ORDER BY WordID ASC, Chapter ASC, Verse ASC`;
        d1Params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.chapterStart, parsed.chapterEnd, parsed.chapterEnd, parsed.verseEnd];
      }

      const stmt = env.MORPHOLOGY_DB.prepare(d1Sql).bind(...d1Params);
      const d1Result = await stmt.all<MorphologyWord>();
      if (d1Result.results && d1Result.results.length > 0) {
        rawWords = d1Result.results;
        d1Success = true;
      }
    } catch (d1Err: any) {
      console.warn("D1 morphology query fallback in interlinear service:", d1Err.message);
    }
  }

  // 2. Fallback to R2/SQLite if D1 didn't return rows
  if (!d1Success) {
    const { db, error: dbError } = await getDatabase(env, dbFile);
    if (!db) {
      return {
        formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error: Morphology database unavailable (${dbError || dbFile}).*`,
        sections: { error: dbError || "Morphology database unavailable" }
      };
    }

    try {
      let sql: string;
      let params: (number | string)[];

      if (parsed.chapterStart === parsed.chapterEnd) {
        sql = `SELECT * FROM Words WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? ORDER BY Chapter ASC, Verse ASC, ID ASC`;
        params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd];
      } else {
        sql = `SELECT * FROM Words WHERE Book = ? AND ((Chapter = ? AND Verse >= ?) OR (Chapter > ? AND Chapter < ?) OR (Chapter = ? AND Verse <= ?)) ORDER BY Chapter ASC, Verse ASC, ID ASC`;
        params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.chapterStart, parsed.chapterEnd, parsed.chapterEnd, parsed.verseEnd];
      }

      const stmt = db.prepare(sql);
      stmt.bind(params);

      while (stmt.step()) {
        rawWords.push(stmt.getAsObject() as unknown as MorphologyWord);
      }
      stmt.free();
    } catch (err: any) {
      return {
        formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*Error executing interlinear query: ${err.message}*`,
        sections: { error: err.message }
      };
    }
  }

  if (rawWords.length === 0) {
    return {
      formattedText: `# Inline Interlinear Study Pack: ${reference}\n\n*No original language interlinear records found for ${reference}.*`,
      sections: { error: "No interlinear records found" }
    };
  }

  // 3. Group words by Verse (Chapter:Verse)
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
        const alphaLabel = getAlphaLabel(entryCounter);

        glossaryEntries.push({
          index: entryCounter,
          alphaLabel,
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

    // Fetch rich lexicon definitions for glossary entries using modern TBESG / TBESH
    for (const entry of glossaryEntries) {
      if (entry.strongs && entry.strongs !== "G0000" && entry.strongs !== "H0000") {
        try {
          const lexRes = await lookupLexiconEntry(env, entry.strongs, "step");
          if (lexRes.stepEntries && lexRes.stepEntries.length > 0) {
            const primary = lexRes.stepEntries[0];
            if (primary.gloss) entry.gloss = primary.gloss;
            if (primary.transliteration) entry.transliteration = primary.transliteration;
            if (primary.morphology) entry.stepMorphology = primary.morphology;
            entry.subEntries = lexRes.stepEntries;

            if (lexRes.stepEntries.length === 1) {
              entry.definition = primary.definition.trim();
            } else {
              entry.definition = lexRes.stepEntries.map(sub => 
                `* **${sub.strongs}** (${sub.lemma} • *${sub.transliteration}* — \`${sub.morphology}\`): **${sub.gloss}**\n${sub.definition.split("\n").map(l => `  ${l}`).join("\n")}`
              ).join("\n\n");
            }
          } else if (lexRes.definition && !lexRes.error) {
            entry.definition = lexRes.definition.trim();
          }
        } catch {
          // Keep definition empty if lookup fails
        }
      }
    }
  }

  // 5. Build structured result and Markdown formatted text based on displayMode
  const structuredVerses: InterlinearVerse[] = [];
  const verseMarkdownBlocks: string[] = [];

  for (const [key, wordsInVerse] of versesMap.entries()) {
    const [cStr, vStr] = key.split(":");
    const c = parseInt(cStr, 10);
    const v = parseInt(vStr, 10);

    const structuredWords = [];
    const inlineWordSpans: string[] = [];
    const tableRows: string[] = [];

    for (const w of wordsInVerse) {
      const lemma = (w.Lexeme || w.Word || "").trim();
      const glossIndex = lemmaToEntryMap.get(lemma);
      const alpha = glossIndex ? getAlphaLabel(glossIndex) : undefined;
      const bsbTranslation = (w.Translation !== undefined && w.Translation !== null && w.Translation.trim() !== "")
        ? w.Translation.trim()
        : (w.Gloss || "").trim();

      structuredWords.push({
        word: w.Word,
        transliteration: w.Transliteration || "",
        gloss: bsbTranslation,
        morphology: w.Morphology || "",
        lemma,
        strongs: w.LexicalEntry,
        glossaryIndex: glossIndex,
        alphaLabel: alpha
      });

      const anchorSup = alpha
        ? `<sup><a href="#entry-${alpha}" style="font-size: 0.68em; color: #888888; text-decoration: none;">${alpha}</a></sup>`
        : "";

      if (displayMode === "ruby") {
        // Ruby stacking: English word with increased size and distinct color beneath original language
        if (bsbTranslation) {
          inlineWordSpans.push(`<ruby style="margin-right: 0.35em;">**${w.Word}**<rt style="font-size: 0.85em; color: ${glossColor}; font-weight: normal;">${bsbTranslation}</rt></ruby>${anchorSup}`);
        } else {
          inlineWordSpans.push(`**${w.Word}**${anchorSup}`);
        }
      } else if (displayMode === "table") {
        // Tabular row
        const lexTag = alpha ? `[\`${extractCanonicalStrongs(w.LexicalEntry, isOT)}\` (${alpha})](#entry-${alpha})` : `\`${extractCanonicalStrongs(w.LexicalEntry, isOT)}\``;
        tableRows.push(`| **${w.Word}** | *${w.Transliteration || ""}* | <span style="color: ${glossColor};">${bsbTranslation}</span> | \`${w.Morphology || ""}\` | ${lexTag} |`);
      } else {
        // Default "inline" mode: No brackets on english words, color differentiation, small pure alphabetic label
        if (bsbTranslation) {
          inlineWordSpans.push(`**${w.Word}**${anchorSup} <span style="color: ${glossColor}; font-size: 0.9em;">${bsbTranslation}</span>`);
        } else {
          inlineWordSpans.push(`**${w.Word}**${anchorSup}`);
        }
      }
    }

    structuredVerses.push({
      chapter: c,
      verse: v,
      words: structuredWords
    });

    if (displayMode === "table") {
      let tBlock = `### Verse ${v}\n\n`;
      tBlock += `| Original | Transliteration | Translation | Parsing | Lexicon |\n`;
      tBlock += `| :--- | :--- | :--- | :--- | :--- |\n`;
      tBlock += tableRows.join("\n");
      verseMarkdownBlocks.push(tBlock);
    } else {
      verseMarkdownBlocks.push(`**[${v}]** ` + inlineWordSpans.join(" "));
    }
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
      glossaryText += `<a id="entry-${g.alphaLabel}"></a>\n`;
      glossaryText += `* <sup>**${g.alphaLabel}**</sup> **${g.lemma}** (*${g.transliteration}*) — \`${g.datasetTag}\` *(in text: **${g.wordInText}**)*  \n`;
      
      const morphParts: string[] = [];
      if (g.morphology) morphParts.push(`Parsing: \`${g.morphology}\``);
      if (g.stepMorphology) morphParts.push(`POS: \`${g.stepMorphology}\``);
      if (morphParts.length > 0) {
        glossaryText += `  * **Grammar:** ${morphParts.join(" • ")}  \n`;
      }
      
      glossaryText += `  * **Standard Gloss:** **${g.gloss}**  \n`;
      
      if (g.subEntries && g.subEntries.length > 1) {
        glossaryText += `  * **Disambiguated Roots & Contextual Senses (${g.subEntries.length} sub-entries):**  \n`;
        for (const sub of g.subEntries) {
          glossaryText += `    * **${sub.strongs}** — *${sub.gloss}*: ${sub.definition.replace(/\n+/g, " ").trim()}  \n`;
        }
      } else if (g.definition) {
        glossaryText += `  * **STEP Contextual Senses & Definition:**\n`;
        const indentedDef = g.definition.split("\n").map(line => `    ${line}`).join("\n");
        glossaryText += `${indentedDef}\n`;
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
    displayMode,
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
      displayMode,
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
