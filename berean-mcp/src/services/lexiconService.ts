import { getDatabase } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { Env } from "../types.js";

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
 * Standardized Original Language Lexicon Lookup
 * Queries modern STEPBible TBESG (Greek) and TBESH (Hebrew) with sub-lemma disambiguation,
 * with optional side-by-side classical Thayer / BDB / LSJ entries.
 */
export async function lookupLexiconEntry(
  env: Env,
  strongsNumber: string,
  lexicon: string = "step"
): Promise<{
  error?: string;
  formattedText?: string;
  definition?: string;
  stepEntries?: StepLexiconRow[];
  classicalDefinition?: string;
}> {
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
    return { error: `Lexicon entry not found for '${strongsNumber}' in requested lexicons (${targetLexicon}).` };
  }

  // 4. Format Combined Markdown
  const markdownParts: string[] = [];

  if (stepEntries.length > 0) {
    const primary = stepEntries[0];
    const datasetTag = primary.language.includes("Greek") ? "TBESG (STEPBible.org, CC BY 4.0)" : "TBESH (STEPBible.org, CC BY 4.0)";

    markdownParts.push(`# 🏛️ Original Language Lexicon: ${primary.strongs} (${primary.lemma} • *${primary.transliteration}*)`);
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
        markdownParts.push(`#### 📌 **${entry.strongs}** — ${entry.lemma} (*${entry.transliteration}*) — \`${entry.morphology}\``);
        markdownParts.push(`* **Contextual Gloss:** **${entry.gloss}**`);
        markdownParts.push(entry.definition);
        markdownParts.push("");
      }
    }
  }

  if (classicalDef && (includeClassical || stepEntries.length === 0)) {
    if (stepEntries.length > 0) {
      markdownParts.push("\n---");
      markdownParts.push(`### 📚 Classical Historical Lexicon (${classicalName}):`);
    } else {
      markdownParts.push(`# 📚 Classical Historical Lexicon: ${cleanKey} (${classicalName})`);
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
