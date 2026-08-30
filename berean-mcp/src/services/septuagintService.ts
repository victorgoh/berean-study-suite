import { getDatabase } from "../db/sqliteEngine.js";
import { lookupBiblePassage, parseReferenceString } from "./bibleService.js";
import { lookupCommentary } from "./commentaryService.js";
import { lookupCrossReferences } from "./xrefService.js";
import { lookupOtQuotations } from "./otInNtService.js";
import { Env, StudyPackResponse } from "../types.js";

function cleanEmbeddedCommentary(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^#\s+\[?[^\]\n]+\]?\s+[^\n]+\n+/i, "")
    .trim();
}

export interface LxxVerse {
  book: string;
  book_number: number;
  chapter: number;
  verse: number;
  greek: string;
  english: string;
  divergence?: string;
}

/**
 * Look up Septuagint (LXX) Greek and Brenton English verses.
 */
export async function lookupSeptuagint(
  env: Env,
  reference: string
): Promise<{
  error?: string;
  formattedText?: string;
  verses?: LxxVerse[];
}> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Invalid Scripture reference '${reference}'.` };
  }

  if (parsed.bookNumber > 39) {
    return { error: `The Septuagint (LXX) covers the Old Testament (Books 1-39). '${parsed.bookName}' is in the New Testament.` };
  }

  const { db, error: dbError } = await getDatabase(env, "bibles/LXX.bible");
  if (!db) {
    return { error: dbError || "Septuagint database (LXX.bible) not found." };
  }

  try {
    let sql: string;
    let params: (number | string)[];

    if (parsed.chapterStart === parsed.chapterEnd) {
      sql = `SELECT Book, Chapter, Verse, Scripture, English, Divergence FROM Verses WHERE Book = ? AND Chapter = ? AND Verse >= ? AND Verse <= ? ORDER BY Verse ASC`;
      params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.verseEnd];
    } else {
      sql = `SELECT Book, Chapter, Verse, Scripture, English, Divergence FROM Verses WHERE Book = ? AND ((Chapter = ? AND Verse >= ?) OR (Chapter > ? AND Chapter < ?) OR (Chapter = ? AND Verse <= ?)) ORDER BY Chapter ASC, Verse ASC`;
      params = [parsed.bookNumber, parsed.chapterStart, parsed.verseStart, parsed.chapterStart, parsed.chapterEnd, parsed.chapterEnd, parsed.verseEnd];
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const verses: LxxVerse[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      verses.push({
        book: parsed.bookName,
        book_number: row.Book,
        chapter: row.Chapter,
        verse: row.Verse,
        greek: (row.Scripture || "").trim(),
        english: (row.English || "").trim(),
        divergence: row.Divergence ? row.Divergence.trim() : undefined
      });
    }
    stmt.free();

    if (verses.length === 0) {
      return {
        error: `No Septuagint (LXX) records found for ${reference}.`,
        formattedText: `# Septuagint (LXX): ${reference}\n\n*No specific LXX entry recorded for this passage.*`
      };
    }

    const markdownLines: string[] = [];
    markdownLines.push(`# Greek Septuagint (LXX) & Brenton English: ${reference}\n`);

    for (const v of verses) {
      markdownLines.push(`**[${v.chapter}:${v.verse}]** **${v.greek}**`);
      markdownLines.push(`*English (Brenton):* *"${v.english}"*`);
      if (v.divergence) {
        markdownLines.push(`> 🔍 **MT Divergence:** ${v.divergence}`);
      }
      markdownLines.push("");
    }

    return {
      formattedText: markdownLines.join("\n"),
      verses
    };
  } catch (err: any) {
    return { error: `Septuagint lookup error: ${err.message}` };
  }
}

/**
 * 12th Composite Study Pack: Greek Septuagint & Hebrew MT Comparative Exegesis Pack
 */
export async function getSeptuagintStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
): Promise<StudyPackResponse & { lxxVerses?: LxxVerse[] }> {
  const parsed = parseReferenceString(reference);
  if (!parsed || parsed.bookNumber > 39) {
    return {
      formattedText: `# Septuagint Study Pack: ${reference}\n\n*Error: The Septuagint (LXX) covers the Old Testament (Books 1-39). '${reference}' is a New Testament passage.*`,
      sections: { error: "Old Testament reference required for Septuagint study pack." }
    };
  }

  // Parallel fetches
  const [bibleRes, hebrewRes, lxxRes, kdRes, clarkeRes, otQuotesRes, xrefRes] = await Promise.all([
    lookupBiblePassage(env, version, reference),
    lookupBiblePassage(env, "OHGB", reference),
    lookupSeptuagint(env, reference),
    lookupCommentary(env, "KD", reference),
    lookupCommentary(env, "Clarke", reference),
    lookupOtQuotations(env, reference),
    lookupCrossReferences(env, reference, 8)
  ]);

  const sections: Record<string, string> = {};
  let formattedText = `# Septuagint (LXX) & Hebrew MT Comparative Study Pack: ${reference}\n\n`;

  let sectionIdx = 1;

  // Section 1: Modern English Translation
  const engText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["primary_scripture"] = engText;
  formattedText += `## ${sectionIdx++}. Standard Scripture Text (${reference} • ${version})\n${engText}\n\n`;

  // Section 2: Hebrew Masoretic Text (WLC)
  if (hebrewRes.formattedText && !hebrewRes.error) {
    sections["hebrew_masoretic_text"] = hebrewRes.formattedText;
    formattedText += `## ${sectionIdx++}. Hebrew Masoretic Text (Westminster Leningrad Codex / OHGB)\n${hebrewRes.formattedText}\n\n`;
  }

  // Section 3: Greek Septuagint (LXX) Text
  const lxxVerses = lxxRes.verses || [];
  if (lxxVerses.length > 0) {
    const lxxGreekBlock = lxxVerses.map(v => `**[${v.chapter}:${v.verse}]** ${v.greek}`).join("\n\n");
    sections["greek_septuagint_text"] = lxxGreekBlock;
    formattedText += `## ${sectionIdx++}. Greek Septuagint Text (Rahlfs / Swete LXX)\n${lxxGreekBlock}\n\n`;

    // Section 4: Brenton English Translation
    const brentonBlock = lxxVerses.map(v => `**[${v.chapter}:${v.verse}]** *"${v.english}"*`).join("\n\n");
    sections["brenton_english_translation"] = brentonBlock;
    formattedText += `## ${sectionIdx++}. Brenton English Septuagint Translation\n${brentonBlock}\n\n`;

    // Section 5: Comparative Alignment & Divergences
    let divergenceBlock = "| Verse | Septuagint Reading | Brenton Translation | Textual / Dead Sea Scrolls Context |\n";
    divergenceBlock += "| :--- | :--- | :--- | :--- |\n";
    for (const v of lxxVerses) {
      divergenceBlock += `| **${v.chapter}:${v.verse}** | ${v.greek.slice(0, 40)}... | *"${v.english.slice(0, 40)}..."* | ${v.divergence || "Matches MT sense"} |\n`;
    }
    sections["textual_divergence_matrix"] = divergenceBlock;
    formattedText += `## ${sectionIdx++}. Textual Divergence Matrix & Translation Nuances\n${divergenceBlock}\n\n`;
  }

  // Section 6: NT Apostolic Citations (if any)
  if (otQuotesRes.records && otQuotesRes.records.length > 0) {
    const quoteBlock = otQuotesRes.records.map(r =>
      `* **${r.nt_ref}** quotes this passage:\n  *Quotation Type:* \`${r.quote_type}\` (${r.classification})\n  *Apostolic Hermeneutics:* ${r.hermeneutical_notes}\n  *Textual Divergence:* ${r.divergence_notes}`
    ).join("\n\n");
    sections["nt_apostolic_citations"] = quoteBlock;
    formattedText += `## ${sectionIdx++}. New Testament Apostolic Quotations & Applications\n${quoteBlock}\n\n`;
  }

  // Section 7: Hebrew Grammar & Semitic Commentary (Keil & Delitzsch)
  if (kdRes.formattedText && !kdRes.error) {
    const cleaned = cleanEmbeddedCommentary(kdRes.formattedText);
    sections["hebrew_exegesis_kd"] = cleaned;
    formattedText += `## ${sectionIdx++}. Hebrew Grammatical Exegesis (Keil & Delitzsch)\n${cleaned}\n\n`;
  }

  // Section 8: Semitic Linguistics & Customs (Adam Clarke)
  if (clarkeRes.formattedText && !clarkeRes.error) {
    const cleaned = cleanEmbeddedCommentary(clarkeRes.formattedText);
    sections["linguistic_insights_clarke"] = cleaned;
    formattedText += `## ${sectionIdx++}. Semitic Linguistics & Historical Customs (Adam Clarke)\n${cleaned}\n\n`;
  }

  // Section 9: Cross-References
  if (xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    formattedText += `## ${sectionIdx++}. Canonical Cross-References\n${xrefRes.formattedText}\n\n`;
  }

  // Persona Callout Tip
  const tip = `> [!TIP]\n> Use this data pack with the **Bible Textual Critic** or **OT Bible Scholar** persona to examine how Second Temple Jewish translators rendered Hebrew idioms into Koine Greek and how these readings influenced the New Testament writers.\n`;
  formattedText += tip;

  return {
    formattedText,
    sections,
    lxxVerses,
    metadata: {
      title: `Septuagint & Hebrew MT Comparative Study Pack: ${reference}`,
      reference,
      version,
      lxxVersesCount: lxxVerses.length,
      timestamp: new Date().toISOString()
    }
  };
}
