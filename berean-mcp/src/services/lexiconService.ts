import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env } from "../types.js";
import { notFound, type ServiceErrorCode } from "./errors.js";
import type { Database } from "sql.js";

export interface StepLexiconRow {
  strongs: string;
  base_number: string;
  canonical_strongs: string;
  language: string;
  lemma: string;
  transliteration: string;
  morphology: string;
  gloss: string;
  definition: string;
}

/**
 * Some classical entries are only a pointer, e.g. Thayer G4239 πραΰς: "see
 * πρᾷός". Returns the entry it points to (one hop, matched by headword), or
 * null when the entry has real content or the target is missing.
 */
function followSeeReference(db: Database, row: { Topic: string; Definition: string }): { Topic: string; Definition: string } | null {
  const html = row.Definition || "";
  if (html.length > 600) return null;
  const pointer = /see\s*<b>\s*<ref0[^>]*entry="([^"]+)"/i.exec(html);
  if (!pointer) return null;
  const stmt = db.prepare("SELECT Topic, Definition FROM Lexicon WHERE Topic <> ? AND Definition LIKE ? LIMIT 1");
  try {
    // Anchor on the article's own headword ("<div><p><b>G4235 — <ref0 ... entry=\"πρᾷός\">"), not any mention.
    stmt.bind([row.Topic, `<div><p><b>G% — <ref0 class="word" entry="${pointer[1]}">%`]);
    return stmt.step() ? (stmt.getAsObject() as { Topic: string; Definition: string }) : null;
  } finally {
    stmt.free();
  }
}

// ---------------------------------------------------------------------------
// Finding Strong's numbers by word ("agape", "shalom", "αγαπη", "rest")
// ---------------------------------------------------------------------------

/** Built by scripts/build_lexicon_word_index.py from the STEPBible lexicon. */
interface LexiconWordIndex {
  entries: Record<string, [lemma: string, transliteration: string, gloss: string]>;
  /** normalized transliteration or lemma -> Strong's numbers */
  forms: Record<string, string[]>;
  /** English gloss word -> Strong's numbers, best first */
  glosses: Record<string, string[]>;
}

export interface LexiconCandidate {
  strongs: string;
  lemma: string;
  transliteration: string;
  gloss: string;
}

const WORD_INDEX_KEY = "data/lookup/lexicon_words.json";
const GLOSS_STOP_WORDS = new Set(["to", "the", "a", "an", "of", "be", "in", "on", "for", "and", "or", "with", "at", "by", "from", "as", "is", "one", "who", "that"]);

/** Must match normalize() in scripts/build_lexicon_word_index.py. */
export function normalizeWord(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** True for input such as G26, G0026, H7965 or H7965G. */
export function isStrongsNumber(text: string): boolean {
  return /^[GH]\d{1,5}[A-Za-z]?$/i.test(text.trim());
}

/** "H7965G" -> "H7965", "G0026" -> "G26". */
function baseStrongs(strongs: string): string {
  const m = /^([GH])0*(\d+)/i.exec(strongs);
  return m ? m[1].toUpperCase() + m[2] : strongs;
}

/**
 * Strong's numbers for a word: exact transliteration/lemma matches first, then
 * English gloss matches. Returns [] when the index is unavailable or nothing matches.
 */
export async function findStrongsForWord(env: Env, word: string): Promise<{ candidates: LexiconCandidate[]; exactForm: boolean }> {
  const index = await getJsonFromR2<LexiconWordIndex>(env, WORD_INDEX_KEY);
  if (!index) return { candidates: [], exactForm: false };
  const form = normalizeWord(word);
  let numbers = index.forms[form] ?? [];
  const exactForm = numbers.length > 0;
  if (!exactForm) {
    const words = word.toLowerCase().split(/[^a-z]+/).filter((w) => w && !GLOSS_STOP_WORDS.has(w));
    numbers = index.glosses[words.join("")] ?? (words[0] ? index.glosses[words[0]] ?? [] : []);
  }
  const candidates = numbers
    .filter((n) => index.entries[n])
    .map((n) => {
      const [lemma, transliteration, gloss] = index.entries[n];
      return { strongs: n, lemma, transliteration, gloss };
    });
  return { candidates, exactForm };
}

function candidateTable(word: string, candidates: LexiconCandidate[]): string {
  const rows = candidates.map((c) => `| ${baseStrongs(c.strongs)} | ${c.lemma} | ${c.transliteration} | ${c.gloss} |`);
  return (
    `# Words matching \u201C${word}\u201D\n\n` +
    `| Strong's | Word | Transliteration | Meaning |\n| :--- | :--- | :--- | :--- |\n` +
    rows.join("\n") +
    `\n\nLook up one of these Strong's numbers for its full entry.`
  );
}

export type LexiconLookupResult = {
  error?: string;
  errorCode?: ServiceErrorCode;
  formattedText?: string;
  definition?: string;
  stepEntries?: StepLexiconRow[];
  classicalDefinition?: string;
  /** Set when a word matched several Strong's numbers; the caller should pick one. */
  candidates?: LexiconCandidate[];
};

/**
 * Standardized Original Language Lexicon Lookup
 * Queries modern STEPBible TBESG (Greek) and TBESH (Hebrew) with sub-lemma disambiguation,
 * with optional side-by-side classical Thayer / BDB / LSJ entries.
 * Accepts a Strong's number, or a word (transliteration, Greek/Hebrew lemma or English),
 * which is resolved through the word index first.
 */
export async function lookupLexiconEntry(
  env: Env,
  strongsNumber: string,
  lexicon: string = "step"
): Promise<LexiconLookupResult> {
  const input = strongsNumber.trim();
  if (input && !isStrongsNumber(input) && !/^\d+$/.test(input)) {
    const { candidates, exactForm } = await findStrongsForWord(env, input);
    const bases = [...new Set(candidates.map((c) => baseStrongs(c.strongs)))];
    if (exactForm && bases.length === 1) {
      const result = await lookupLexiconEntry(env, bases[0], lexicon);
      const c = candidates[0];
      const note = `*\u201C${input}\u201D is ${bases[0]} ${c.lemma} (${c.transliteration}, \u201C${c.gloss}\u201D).*\n\n`;
      return result.formattedText ? { ...result, formattedText: note + result.formattedText } : result;
    }
    if (candidates.length > 0) {
      return { candidates, formattedText: candidateTable(input, candidates) };
    }
    return notFound(
      `No Strong's number found for '${input}'. Try a Strong's number such as G26 or H7965, a transliteration such as 'agape', or an English word such as 'love'.`
    );
  }

  const rawKey = strongsNumber.trim();
  const cleanKey = rawKey.toUpperCase();
  const isHebrew = cleanKey.startsWith("H") || /[\u0590-\u05FF]/.test(rawKey);
  const isGreek = cleanKey.startsWith("G") || /[\u0370-\u03FF\u1F00-\u1FFF]/.test(rawKey);
  const numOnly = cleanKey.replace(/^[GH]/, "").replace(/[A-Z]+$/, "");
  const basePrefix = isHebrew ? "H" : "G";
  const baseKey = `${basePrefix}${numOnly}`;
  const paddedKey = numOnly.length < 4 ? `${basePrefix}${numOnly.padStart(4, "0")}` : cleanKey;

  const targetLexicon = (lexicon || "step").toLowerCase();
  const includeClassical = targetLexicon === "all" || targetLexicon === "thayer" || targetLexicon === "bdb" || targetLexicon === "lsj";
  const includeStep = targetLexicon === "step" || targetLexicon === "all" || targetLexicon === "tbesg" || targetLexicon === "tbesh" || targetLexicon === "strongs";

  let stepEntries: StepLexiconRow[] = [];
  let classicalDef: string | null = null;
  let classicalName = isHebrew ? "Brown-Driver-Briggs (BDB)" : targetLexicon.includes("lsj") ? "Liddell-Scott-Jones (LSJ)" : "Thayer Greek Lexicon";

  // 1. STEP TBESG / TBESH Lookup (from D1 or R2/local fallback)
  if (includeStep) {
    // 1a. Try Cloudflare D1
    if (env.REFERENCE_DB) {
      try {
        const stmt = env.REFERENCE_DB.prepare(
          "SELECT strongs, base_number, canonical_strongs, language, lemma, transliteration, morphology, gloss, definition FROM lexicon_step WHERE strongs = ? OR base_number = ? OR canonical_strongs = ? OR lemma = ? ORDER BY strongs ASC"
        ).bind(cleanKey, baseKey, paddedKey, rawKey);
        const { results } = await stmt.all<StepLexiconRow>();
        if (results && results.length > 0) {
          stepEntries = results;
        }
      } catch (d1Err: any) {
        console.warn("D1 lexicon_step query failed, checking fallback:", d1Err.message);
      }
    }

    // 1b. Fallback to SQLite database in R2 / local
    if (stepEntries.length === 0) {
      const { db } = await getDatabase(env, "lexicons/step_lexicon.sqlite");
      if (db) {
        try {
          const stmt = db.prepare(
            "SELECT strongs, base_number, canonical_strongs, language, lemma, transliteration, morphology, gloss, definition FROM lexicon_step WHERE strongs = ? OR base_number = ? OR canonical_strongs = ? OR lemma = ? ORDER BY strongs ASC"
          );
          stmt.bind([cleanKey, baseKey, paddedKey, rawKey]);
          while (stmt.step()) {
            stepEntries.push(stmt.getAsObject() as unknown as StepLexiconRow);
          }
          stmt.free();
        } catch (dbErr: any) {
          console.warn("SQLite step_lexicon query error:", dbErr.message);
        }
      }
    }
  }

  // 2. Classical Lexicon Lookup (BDB / Thayer / LSJ)
  if (includeClassical || stepEntries.length === 0) {
    // 2a. Hebrew BDB via D1
    if (isHebrew && env.REFERENCE_DB && !targetLexicon.includes("lsj")) {
      try {
        const stmt = env.REFERENCE_DB.prepare(
          "SELECT Topic, Definition FROM lexicon_bdb WHERE Topic = ? OR Topic = ? LIMIT 1"
        ).bind(cleanKey, numOnly);
        const row = await stmt.first<{ Topic: string; Definition: string }>();
        if (row && row.Definition) {
          classicalDef = cleanHtmlToMarkdown(row.Definition);
        }
      } catch (d1Err: any) {
        console.warn("D1 Hebrew BDB query fallback:", d1Err.message);
      }
    }

    // 2b. Greek Thayer/LSJ or Hebrew BDB via R2/local SQLite
    if (!classicalDef) {
      let lexiconFile = isHebrew ? "lexicons/BDB.lexicon" : targetLexicon.includes("lsj") ? "lexicons/LSJ.lexicon" : "lexicons/Thayer.lexicon";
      const { db } = await getDatabase(env, lexiconFile);
      if (db) {
        try {
          const stmt = db.prepare("SELECT Topic, Definition FROM Lexicon WHERE Topic = ? OR Topic = ? LIMIT 1");
          stmt.bind([cleanKey, numOnly]);
          if (stmt.step()) {
            const row = stmt.getAsObject() as { Topic: string; Definition: string };
            classicalDef = cleanHtmlToMarkdown(row.Definition || "");
            const target = followSeeReference(db, row);
            if (target) {
              classicalDef += `\n\n---\n\n` + cleanHtmlToMarkdown(target.Definition);
            }
          }
          stmt.free();
        } catch (err: any) {
          console.warn(`Classical lexicon query error (${lexiconFile}):`, err.message);
        }
      }
    }
  }

  // 3. If neither produced results, return error
  if (stepEntries.length === 0 && !classicalDef) {
    return notFound(`Lexicon entry not found for '${strongsNumber}' in requested lexicons (${targetLexicon}).`);
  }

  // 4. Format Combined Markdown
  const markdownParts: string[] = [];

  if (stepEntries.length > 0) {
    const primary = stepEntries[0];
    const datasetTag = primary.language.includes("Greek") ? "TBESG (STEPBible.org, CC BY 4.0)" : "TBESH (STEPBible.org, CC BY 4.0)";

    markdownParts.push(`# Original Language Lexicon: ${primary.strongs} (${primary.lemma} • *${primary.transliteration}*)`);
    markdownParts.push(`* **Language:** ${primary.language}`);
    markdownParts.push(`* **Part of Speech:** \`${primary.morphology}\``);
    markdownParts.push(`* **Gloss:** **${primary.gloss}**`);
    markdownParts.push(`* **Data Source:** ${datasetTag}`);
    markdownParts.push("");

    if (stepEntries.length === 1) {
      markdownParts.push("### Modern Contextual Definition & Senses:");
      markdownParts.push(primary.definition);
    } else {
      markdownParts.push(`### Disambiguated Sub-Entries (${stepEntries.length} distinct roots/senses):`);
      for (const entry of stepEntries) {
        markdownParts.push(`#### **${entry.strongs}** — ${entry.lemma} (*${entry.transliteration}*) — \`${entry.morphology}\``);
        markdownParts.push(`* **Contextual Gloss:** **${entry.gloss}**`);
        markdownParts.push(entry.definition);
        markdownParts.push("");
      }
    }
  }

  if (classicalDef && (includeClassical || stepEntries.length === 0)) {
    if (stepEntries.length > 0) {
      markdownParts.push("\n---");
      markdownParts.push(`### Classical Historical Lexicon (${classicalName}):`);
    } else {
      markdownParts.push(`# Classical Historical Lexicon: ${cleanKey} (${classicalName})`);
    }
    markdownParts.push(classicalDef);
  }

  const formattedText = markdownParts.join("\n");
  const primaryDef = stepEntries.length > 0 ? stepEntries[0].definition : classicalDef || "";

  return {
    formattedText,
    definition: primaryDef,
    stepEntries: stepEntries.length > 0 ? stepEntries : undefined,
    classicalDefinition: classicalDef || undefined
  };
}
