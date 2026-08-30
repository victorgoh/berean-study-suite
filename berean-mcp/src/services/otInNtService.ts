import { getDatabase } from "../db/sqliteEngine.js";
import { lookupBiblePassage, parseReferenceString } from "./bibleService.js";
import { lookupCommentary } from "./commentaryService.js";
import { lookupCrossReferences } from "./xrefService.js";
import { Env, StudyPackResponse } from "../types.js";

function cleanEmbeddedCommentary(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^#\s+\[?[^\]\n]+\]?\s+[^\n]+\n+/i, "")
    .trim();
}

export interface OtInNtRecord {
  id?: number;
  nt_ref: string;
  ot_ref: string;
  lxx_ref: string;
  quote_type: string;
  classification: string;
  hermeneutical_notes: string;
  divergence_notes: string;
}

/**
 * Look up Old Testament quotations and allusions for a given NT or OT passage.
 */
export async function lookupOtQuotations(
  env: Env,
  reference: string
): Promise<{
  error?: string;
  formattedText?: string;
  records?: OtInNtRecord[];
}> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return { error: `Invalid Scripture reference '${reference}'.` };
  }

  const isOT = parsed.bookNumber <= 39;
  let records: OtInNtRecord[] = [];

  // Search patterns: exact match or book/chapter pattern
  const searchPattern = `%${parsed.bookName}%${parsed.chapterStart}%`;

  // 1. Try Cloudflare D1
  if (env.REFERENCE_DB) {
    try {
      const col = isOT ? "ot_ref" : "nt_ref";
      const altCol = isOT ? "nt_ref" : "ot_ref";
      const stmt = env.REFERENCE_DB.prepare(
        `SELECT id, nt_ref, ot_ref, lxx_ref, quote_type, classification, hermeneutical_notes, divergence_notes 
         FROM ot_in_nt 
         WHERE ${col} LIKE ? OR ${altCol} LIKE ? OR nt_ref = ? OR ot_ref = ?`
      ).bind(searchPattern, searchPattern, reference, reference);
      const { results } = await stmt.all<OtInNtRecord>();
      if (results && results.length > 0) {
        records = results;
      }
    } catch (d1Err: any) {
      console.warn("D1 ot_in_nt query failed, falling back to SQLite:", d1Err.message);
    }
  }

  // 2. Fallback to local / R2 SQLite
  if (records.length === 0) {
    const { db } = await getDatabase(env, "ot_in_nt.sqlite");
    if (db) {
      try {
        const col = isOT ? "ot_ref" : "nt_ref";
        const altCol = isOT ? "nt_ref" : "ot_ref";
        const stmt = db.prepare(
          `SELECT id, nt_ref, ot_ref, lxx_ref, quote_type, classification, hermeneutical_notes, divergence_notes 
           FROM ot_in_nt 
           WHERE ${col} LIKE ? OR ${altCol} LIKE ? OR nt_ref = ? OR ot_ref = ?`
        );
        stmt.bind([searchPattern, searchPattern, reference, reference]);
        while (stmt.step()) {
          records.push(stmt.getAsObject() as unknown as OtInNtRecord);
        }
        stmt.free();
      } catch (dbErr: any) {
        console.warn("SQLite ot_in_nt query error:", dbErr.message);
      }
    }
  }

  if (records.length === 0) {
    return {
      error: `No direct OT/NT quotation mappings found for '${reference}'.`,
      formattedText: `# OT Quotations in the NT: ${reference}\n\n*No direct canonical quotation or allusion recorded for this reference.*`
    };
  }

  // Format Markdown
  const markdownLines: string[] = [];
  markdownLines.push(`# Old Testament Quotations & Allusions in the NT: ${reference}\n`);

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    markdownLines.push(`### Citation ${i + 1}: ${r.nt_ref} ⟵ ${r.ot_ref}`);
    markdownLines.push(`* **Quotation Type:** \`${r.quote_type}\` (${r.classification})`);
    if (r.lxx_ref) markdownLines.push(`* **Septuagint (LXX) Bridge:** ${r.lxx_ref}`);
    markdownLines.push(`* **Apostolic Hermeneutics:** ${r.hermeneutical_notes}`);
    markdownLines.push(`* **Textual Divergences (MT vs. LXX vs. NT):** ${r.divergence_notes}`);
    markdownLines.push("");
  }

  return {
    formattedText: markdownLines.join("\n"),
    records
  };
}

/**
 * 11th Composite Study Pack: Apostolic Hermeneutics & OT-in-NT Fulfillment Pack
 */
export async function getOtInNtStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
): Promise<StudyPackResponse & { records?: OtInNtRecord[] }> {
  const quoteRes = await lookupOtQuotations(env, reference);
  const records = quoteRes.records || [];

  const parsed = parseReferenceString(reference);
  const isOT = parsed ? parsed.bookNumber <= 39 : false;

  // Determine primary NT and OT references
  let ntRef = reference;
  let otRef = records.length > 0 ? records[0].ot_ref : reference;
  if (isOT && records.length > 0) {
    otRef = reference;
    ntRef = records[0].nt_ref;
  }

  // Parallel fetches
  const [ntBibleRes, ntGreekRes, otBibleRes, otHebrewRes, gillRes, calvinRes, xrefRes] = await Promise.all([
    lookupBiblePassage(env, version, ntRef),
    lookupBiblePassage(env, "OHGB", ntRef),
    lookupBiblePassage(env, version, otRef),
    lookupBiblePassage(env, "OHGB", otRef),
    lookupCommentary(env, "Gill", ntRef),
    lookupCommentary(env, "Calvin", ntRef),
    lookupCrossReferences(env, ntRef, 8)
  ]);

  const sections: Record<string, string> = {};
  let formattedText = `# Apostolic Hermeneutics & OT-in-NT Fulfillment Pack: ${reference}\n\n`;

  let sectionIdx = 1;

  // Section 1: NT Apostolic Scripture
  const ntText = ntBibleRes.formattedText || ntBibleRes.error || "No NT passage found";
  sections["nt_apostolic_scripture"] = ntText;
  formattedText += `## ${sectionIdx++}. New Testament Apostolic Passage (${ntRef} • ${version})\n${ntText}\n\n`;

  // Section 2: NT Original Greek
  if (ntGreekRes.formattedText && !ntGreekRes.error) {
    sections["nt_greek_text"] = ntGreekRes.formattedText;
    formattedText += `## ${sectionIdx++}. Apostolic Greek Text (NA28 / OHGB)\n${ntGreekRes.formattedText}\n\n`;
  }

  // Section 3: Original Old Testament Hebrew Source
  const otText = otBibleRes.formattedText || otBibleRes.error || "No OT source passage found";
  sections["ot_source_scripture"] = otText;
  formattedText += `## ${sectionIdx++}. Original Old Testament Source (${otRef} • ${version})\n${otText}\n\n`;

  // Section 4: OT Hebrew Masoretic Text
  if (otHebrewRes.formattedText && !otHebrewRes.error) {
    sections["ot_hebrew_text"] = otHebrewRes.formattedText;
    formattedText += `## ${sectionIdx++}. Hebrew Masoretic Source Text (WLC / OHGB)\n${otHebrewRes.formattedText}\n\n`;
  }

  // Section 5: Hermeneutical Alignment Matrix & Textual Notes
  if (records.length > 0) {
    let alignmentMatrix = "| NT Verse | OT Source | LXX Reference | Quotation Type | Classification |\n";
    alignmentMatrix += "| :--- | :--- | :--- | :--- | :--- |\n";
    for (const r of records) {
      alignmentMatrix += `| **${r.nt_ref}** | **${r.ot_ref}** | ${r.lxx_ref || "—"} | \`${r.quote_type}\` | ${r.classification} |\n`;
    }
    alignmentMatrix += "\n### Textual Divergence & Hermeneutical Analysis:\n";
    for (const r of records) {
      alignmentMatrix += `#### ${r.nt_ref} ⟵ ${r.ot_ref}\n`;
      alignmentMatrix += `* **Apostolic Hermeneutics:** ${r.hermeneutical_notes}\n`;
      alignmentMatrix += `* **Textual Nuance (MT vs LXX vs NT):** ${r.divergence_notes}\n\n`;
    }
    sections["quotation_alignment_matrix"] = alignmentMatrix;
    formattedText += `## ${sectionIdx++}. Quotation Alignment Matrix & Textual Analysis\n${alignmentMatrix}\n`;
  }

  // Section 6: Rabbinic & Second Temple Insights (John Gill)
  if (gillRes.formattedText && !gillRes.error) {
    const cleaned = cleanEmbeddedCommentary(gillRes.formattedText);
    sections["rabbinic_context_gill"] = cleaned;
    formattedText += `## ${sectionIdx++}. Second Temple Rabbinic Context & Targums (John Gill)\n${cleaned}\n\n`;
  }

  // Section 7: Christological Covenant Exposition (John Calvin)
  if (calvinRes.formattedText && !calvinRes.error) {
    const cleaned = cleanEmbeddedCommentary(calvinRes.formattedText);
    sections["christological_fulfillment_calvin"] = cleaned;
    formattedText += `## ${sectionIdx++}. Christological Redemptive Fulfillment (John Calvin)\n${cleaned}\n\n`;
  }

  // Section 8: Cross-References
  if (xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    formattedText += `## ${sectionIdx++}. Canonical Cross-References & Prophetic Chains\n${xrefRes.formattedText}\n\n`;
  }

  // Persona Tip Callout
  const tip = `> [!TIP]\n> Use this data pack with the **Biblical Theologian** or **NT Bible Scholar** persona to evaluate apostolic hermeneutics, Christological fulfillment, and original language translation nuances between the Hebrew MT, Greek LXX, and Greek NT.\n`;
  formattedText += tip;

  return {
    formattedText,
    sections,
    records,
    metadata: {
      title: `Apostolic Hermeneutics & OT-in-NT Fulfillment Pack: ${reference}`,
      reference,
      ntRef,
      otRef,
      version,
      recordsCount: records.length,
      timestamp: new Date().toISOString()
    }
  };
}
