import { lookupBiblePassage, parseReferenceString } from "./bibleService.js";
import { lookupCommentary } from "./commentaryService.js";
import { lookupCrossReferences } from "./xrefService.js";
import { lookupLexiconEntry } from "./lexiconService.js";
import { lookupMorphology } from "./morphologyService.js";
import { lookupDictionary } from "./dictionaryService.js";
import { lookupPromises } from "./promisesService.js";
import { lookupChapterSummary } from "./chapterSummaryService.js";
import { lookupInterlinear, getInterlinearStudyPack } from "./interlinearService.js";
import { lookupOtQuotations, getOtInNtStudyPack } from "./otInNtService.js";
import { lookupSeptuagint, getSeptuagintStudyPack } from "./septuagintService.js";
import { Env, StudyPackResponse } from "../types.js";

/**
 * Strips outer H1 headers (e.g. `# [Author] Commentary on ...`)
 * when embedding commentary output inside an H2 section.
 */
function cleanEmbeddedCommentary(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^#\s+\[?[^\]\n]+\]?\s+[^\n]+\n+/i, "")
    // Some source entries end with a Markdown horizontal-rule marker. A pack
    // supplies its own section boundary, so leave only meaningful in-content rules.
    .replace(/\n---\s*$/g, "")
    .trim();
}

/**
 * Strips duplicate H3 table headers when embedding morphology output inside an H2 section.
 */
function cleanEmbeddedMorphology(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^###\s+Morphology\s+&\s+Parsing[^\n]+\n+/i, "")
    .trim();
}

/**
 * Strips outer H1 headers from embedded dictionary entries.
 */
function cleanEmbeddedDictionary(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^#\s+Bible\s+Dictionary:[^\n]+\n+/i, "")
    .trim();
}

/**
 * Strips outer H1 headers from embedded biblical promises.
 */
function cleanEmbeddedPromises(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^#\s+Biblical\s+Promises\s+on:[^\n]+\n+/i, "")
    .trim();
}

async function appendExtraCommentators(
  env: Env,
  reference: string,
  extraCommentators: string[] | undefined,
  alreadyFetched: string[],
  sections: Record<string, string>,
  startSectionIdx: number
): Promise<{ text: string; nextSectionIdx: number }> {
  if (!extraCommentators || extraCommentators.length === 0) return { text: "", nextSectionIdx: startSectionIdx };
  let extraText = "";
  let currentIdx = startSectionIdx;

  for (const author of extraCommentators) {
    if (alreadyFetched.map(a => a.toLowerCase()).includes(author.toLowerCase())) continue;
    const res = await lookupCommentary(env, author, reference);
    if (res.formattedText && !res.error) {
      const cleaned = cleanEmbeddedCommentary(res.formattedText);
      sections[`commentary_${author.toLowerCase()}`] = cleaned;
      extraText += `## ${currentIdx++}. Commentary: ${author}\n${cleaned}\n\n`;
    }
  }
  return { text: extraText, nextSectionIdx: currentIdx };
}

export async function getSermonStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
  includeXrefs: boolean = true,
    extraCommentators?: string[]
): Promise<StudyPackResponse> {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const maclRes = await lookupCommentary(env, "MacL", reference);
  const simeonRes = await lookupCommentary(env, "HH", reference);
  const xrefRes = includeXrefs ? await lookupCrossReferences(env, reference, 10) : null;

    
  const sections: Record<string, string> = {};
  let text = `# Sermon Study Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["scripture"] = scriptureText;
  text += `## 1. Scripture Text (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  
  if (maclRes.formattedText && !maclRes.error) {
    const cleaned = cleanEmbeddedCommentary(maclRes.formattedText);
    sections["homiletics_maclaren"] = cleaned;
    text += `## ${sectionIdx++}. Expository Sermon Structure & Gems (Alexander Maclaren)\n${cleaned}\n\n`;
  }

  if (simeonRes.formattedText && !simeonRes.error) {
    const cleaned = cleanEmbeddedCommentary(simeonRes.formattedText);
    sections["homiletics_simeon"] = cleaned;
    text += `## ${sectionIdx++}. Homiletical Discourse & Preaching Outline (Charles Simeon - Horae Homileticae)\n${cleaned}\n\n`;
  }

  if (xrefRes && xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Key Cross-References (TSK)\n${xrefRes.formattedText}\n\n`;
  }

  const fetchedKeys = ["MacL", "HH"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **Passionate Evangelist** persona to construct a compelling 3-point homiletical outline, poignant illustrations, and a direct gospel call to faith.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Sermon Study Pack: ${reference}`,
      reference,
      version,
      
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * An intentionally opt-in, fuller pack for users who specifically want
 * Biblical Illustrator's historical anecdotes and illustration material.
 */
export async function getIllustrationStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
  includeXrefs: boolean = true
): Promise<StudyPackResponse> {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const illustratorRes = await lookupCommentary(env, "BI", reference);
  const xrefRes = includeXrefs ? await lookupCrossReferences(env, reference, 5) : null;

  const sections: Record<string, string> = {};
  let text = `# Illustration Study Pack: ${reference}\n\n`;
  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["scripture"] = scriptureText;
  text += `## 1. Scripture Text (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;
  if (illustratorRes.formattedText && !illustratorRes.error) {
    const cleaned = cleanEmbeddedCommentary(illustratorRes.formattedText);
    sections["illustrations_biblical_illustrator"] = cleaned;
    text += `## ${sectionIdx++}. Sermon Illustrations & Historical Anecdotes (Biblical Illustrator)\n${cleaned}\n\n`;
  }

  if (xrefRes?.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Related Cross-References (TSK)\n${xrefRes.formattedText}\n\n`;
  }

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Illustration Study Pack: ${reference}`,
      reference,
      version,
      timestamp: new Date().toISOString()
    }
  };
}

export async function getDevotionalStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
    extraCommentators?: string[],
  topic?: string
): Promise<StudyPackResponse> {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const tnotesRes = await lookupCommentary(env, "TNotes", reference);
  const henryRes = await lookupCommentary(env, "MHCC", reference);
      const promisesRes = topic ? await lookupPromises(env, topic, true, version) : null;
  const xrefRes = await lookupCrossReferences(env, reference, 8);

  const sections: Record<string, string> = {};
  let text = `# Devotional Study Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["scripture"] = scriptureText;
  text += `## 1. Scripture for Meditation (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  if (tnotesRes.formattedText && !tnotesRes.error) {
    const cleaned = cleanEmbeddedCommentary(tnotesRes.formattedText);
    sections["context_tyndale_study_notes"] = cleaned;
    text += `## ${sectionIdx++}. Concise Historical & Contextual Notes (Tyndale Open Study Notes)\n${cleaned}\n\n`;
  }

  if (henryRes.formattedText && !henryRes.error) {
    const cleaned = cleanEmbeddedCommentary(henryRes.formattedText);
    sections["pastoral_henry_concise"] = cleaned;
    text += `## ${sectionIdx++}. Supporting Pastoral Reflections (Matthew Henry Concise Commentary)\n${cleaned}\n\n`;
  }

  
  
  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    const cleaned = cleanEmbeddedPromises(promisesRes.formattedText);
    sections["promises"] = cleaned;
    text += `## ${sectionIdx++}. Related Biblical Promises (${topic})\n${cleaned}\n\n`;
  }

  if (xrefRes && xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Supporting Cross-References\n${xrefRes.formattedText}\n\n`;
  }

  const fetchedKeys = ["TNotes", "MHCC"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **Compassionate Pastor** persona to draft a 7-section daily devotional with historical insight, keyword meditation, 3 practical action steps, and a 1st-person closing prayer.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Devotional Study Pack: ${reference}`,
      reference,
      version,
      topic,
      
      timestamp: new Date().toISOString()
    }
  };
}

export async function getPassageExegesisPack(
  env: Env,
  reference: string,
  version: string = "BSB",
  includeOriginal: boolean = true,
    extraCommentators?: string[]
): Promise<StudyPackResponse> {
  const parsed = parseReferenceString(reference);
  const isOT = parsed ? parsed.bookNumber <= 39 : false;

  const bibleRes = await lookupBiblePassage(env, version, reference);
  const originalRes = includeOriginal ? await lookupBiblePassage(env, "OHGB", reference) : null;
  const lxxRes = (includeOriginal && isOT) ? await lookupSeptuagint(env, reference) : null;
  const morphRes = await lookupMorphology(env, reference);
  const primaryScholarRes = isOT
    ? await lookupCommentary(env, "KD", reference)
    : await lookupCommentary(env, "CECNT", reference);
  const secondaryScholarRes = isOT
    ? await lookupCommentary(env, "Clarke", reference)
    : await lookupCommentary(env, "EGNT", reference);
  const pulpitRes = await lookupCommentary(env, "Pulpit", reference);
  const jfbRes = await lookupCommentary(env, "JFB", reference);
    const xrefRes = await lookupCrossReferences(env, reference, 10);

  const sections: Record<string, string> = {};
  let text = `# Passage Exegesis Study Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["primary_translation"] = scriptureText;
  text += `## 1. Primary Translation (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  if (originalRes && originalRes.formattedText && !originalRes.error) {
    sections["original_language_text"] = originalRes.formattedText;
    text += `## ${sectionIdx++}. Original Language Text (OHGB ${isOT ? "Hebrew/Aramaic" : "Greek"})\n${originalRes.formattedText}\n\n`;
  }

  if (lxxRes && lxxRes.verses && lxxRes.verses.length > 0) {
    const lxxText = lxxRes.verses.map(v => `**[${v.chapter}:${v.verse}]** ${v.greek}\n*Brenton:* *"${v.english}"*${v.divergence ? `\n> 🔍 *MT Note:* ${v.divergence}` : ""}`).join("\n\n");
    sections["septuagint_greek_text"] = lxxText;
    text += `## ${sectionIdx++}. Greek Septuagint Text & Ancient Variants (LXX / Rahlfs)\n${lxxText}\n\n`;
  }

  if (morphRes && morphRes.formattedText && !morphRes.error) {
    const cleaned = cleanEmbeddedMorphology(morphRes.formattedText);
    sections["morphology"] = cleaned;
    text += `## ${sectionIdx++}. Morphological & Grammatical Parsing\n${cleaned}\n\n`;
  }

  if (primaryScholarRes.formattedText && !primaryScholarRes.error) {
    const scholarName = isOT ? "Keil & Delitzsch (OT Scholarly Commentary)" : "H. A. W. Meyer (CECNT - NT Exegesis)";
    const cleaned = cleanEmbeddedCommentary(primaryScholarRes.formattedText);
    sections["critical_exegesis_primary"] = cleaned;
    text += `## ${sectionIdx++}. Critical Grammatical-Historical Exegesis (${scholarName})\n${cleaned}\n\n`;
  }

  if (secondaryScholarRes.formattedText && !secondaryScholarRes.error) {
    const scholarName = isOT ? "Adam Clarke (Historical Customs & Philology)" : "Expositor's Greek NT (W. Robertson Nicoll)";
    const cleaned = cleanEmbeddedCommentary(secondaryScholarRes.formattedText);
    sections["linguistic_insights_secondary"] = cleaned;
    text += `## ${sectionIdx++}. Textual & Linguistic Insights (${scholarName})\n${cleaned}\n\n`;
  }

  if (pulpitRes.formattedText && !pulpitRes.error) {
    const cleaned = cleanEmbeddedCommentary(pulpitRes.formattedText);
    sections["structural_analysis_pulpit"] = cleaned;
    text += `## ${sectionIdx++}. Structural Analysis & Critical Backgrounds (The Pulpit Commentary)\n${cleaned}\n\n`;
  }

  if (jfbRes.formattedText && !jfbRes.error) {
    const cleaned = cleanEmbeddedCommentary(jfbRes.formattedText);
    sections["exegetical_synthesis_jfb"] = cleaned;
    text += `## ${sectionIdx++}. Exegetical Synthesis (Jamieson-Fausset-Brown)\n${cleaned}\n\n`;
  }

  
  if (xrefRes && xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Canonical Cross-References\n${xrefRes.formattedText}\n\n`;
  }

  const fetchedKeys = [isOT ? "KD" : "CECNT", isOT ? "Clarke" : "EGNT", "Pulpit", "JFB"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **OT/NT Bible Scholar** persona to write rigorous academic exegesis, resolve textual variants, and unpack original language syntax.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Academic Exegesis Study Pack: ${reference}`,
      reference,
      version,
      language: isOT ? "Hebrew/Aramaic" : "Greek",
      
      timestamp: new Date().toISOString()
    }
  };
}

export async function getLessonCreatorStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
    extraCommentators?: string[]
): Promise<StudyPackResponse> {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const parsedReference = parseReferenceString(reference);
  const summaryRes = parsedReference
    ? await lookupChapterSummary(env, parsedReference.bookName, parsedReference.chapterStart)
    : { error: "Could not identify a chapter for the chapter-opening synopsis." };
  const ellicottRes = await lookupCommentary(env, "ECER", reference);
  const xrefRes = await lookupCrossReferences(env, reference, 8);

  const sections: Record<string, string> = {};
  let text = `# Lesson Creator Study Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["lesson_scripture"] = scriptureText;
  text += `## 1. Lesson Scripture (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  if (summaryRes.formattedText && !summaryRes.error) {
    sections["chapter_overview"] = summaryRes.formattedText;
    text += `## ${sectionIdx++}. Chapter Overview & Contextual Flow\n${summaryRes.formattedText}\n\n`;
  }

  
  if (ellicottRes.formattedText && !ellicottRes.error) {
    const cleaned = cleanEmbeddedCommentary(ellicottRes.formattedText);
    sections["context_ellicott"] = cleaned;
    text += `## ${sectionIdx++}. Lay-Accessible Historical & Cultural Context (Charles Ellicott)\n${cleaned}\n\n`;
  }

  if (xrefRes && xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Supporting Scripture Cross-References\n${xrefRes.formattedText}\n\n`;
  }

  const fetchedKeys = ["ECER"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **Biblical Content Interpreter** or **Bible Teacher** persona to construct small group study guides, Sunday School curricula, and interactive discussion questions.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Bible Lesson Creator Study Pack: ${reference}`,
      reference,
      version,
      
      timestamp: new Date().toISOString()
    }
  };
}

export async function getPrayerGuideStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
    extraCommentators?: string[],
  topic?: string
): Promise<StudyPackResponse> {
  const parsed = parseReferenceString(reference);
  const isPsalm = parsed && parsed.bookNumber === 19;

  const bibleRes = await lookupBiblePassage(env, version, reference);
  const devotionalPrayerRes = isPsalm
    ? await lookupCommentary(env, "MHCC", reference)
    : await lookupCommentary(env, "Benson", reference);
  const wesleyRes = await lookupCommentary(env, "Wesley", reference);
      const promisesRes = topic ? await lookupPromises(env, topic, true, version) : null;

  const sections: Record<string, string> = {};
  let text = `# Prayer Guide Study Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["prayer_scripture"] = scriptureText;
  text += `## 1. Scripture for Prayer & Intercession (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  if (devotionalPrayerRes.formattedText && !devotionalPrayerRes.error) {
    const authorName = isPsalm ? "Matthew Henry Concise Commentary" : "Joseph Benson (Notes on Piety)";
    const cleaned = cleanEmbeddedCommentary(devotionalPrayerRes.formattedText);
    sections["worship_affections"] = cleaned;
    text += `## ${sectionIdx++}. Heart Worship & Spiritual Affections (${authorName})\n${cleaned}\n\n`;
  }

  if (wesleyRes.formattedText && !wesleyRes.error) {
    const cleaned = cleanEmbeddedCommentary(wesleyRes.formattedText);
    sections["personal_holiness_wesley"] = cleaned;
    text += `## ${sectionIdx++}. Examination for Personal Holiness & Obedience (John Wesley)\n${cleaned}\n\n`;
  }

  
  
  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    const cleaned = cleanEmbeddedPromises(promisesRes.formattedText);
    sections["promises"] = cleaned;
    text += `## ${sectionIdx++}. Scriptural Promises to Claim in Prayer (${topic})\n${cleaned}\n\n`;
  }

  const fetchedKeys = ["Wesley", isPsalm ? "MHCC" : "Benson"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **Compassionate Pastor** persona to write personal, first-person prayers ("I", "we") following the ACTS model (Adoration, Confession, Thanksgiving, Supplication).\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Scriptural Prayer Guide Study Pack: ${reference}`,
      reference,
      version,
      topic,
      
      timestamp: new Date().toISOString()
    }
  };
}

export async function getCovenantTheologyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
    extraCommentators?: string[]
): Promise<StudyPackResponse> {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const calvinRes = await lookupCommentary(env, "Calvin", reference);
    const gillRes = await lookupCommentary(env, "Gill", reference);
      const dictRes = await lookupDictionary(env, "Covenant", "isbe");
  const otQuoteRes = await lookupOtQuotations(env, reference);
  const xrefRes = await lookupCrossReferences(env, reference, 12);

  const sections: Record<string, string> = {};
  let text = `# Covenant Theology Pack: ${reference}\n\n`;

  const scriptureText = bibleRes.formattedText || bibleRes.error || "No passage retrieved";
  sections["scripture"] = scriptureText;
  text += `## 1. Scripture Text (${version})\n${scriptureText}\n\n`;

  let sectionIdx = 2;

  if (otQuoteRes.records && otQuoteRes.records.length > 0) {
    const quoteSummary = otQuoteRes.records.map(r => 
      `* **${r.nt_ref} ⟵ ${r.ot_ref}** (${r.quote_type} • *${r.classification}*)\n  *Apostolic Hermeneutics:* ${r.hermeneutical_notes}`
    ).join("\n\n");
    sections["covenant_source_alignment"] = quoteSummary;
    text += `## ${sectionIdx++}. Underlying OT Covenant Source & Quotation Alignment\n${quoteSummary}\n\n`;
  }

  if (calvinRes.formattedText && !calvinRes.error) {
    const cleaned = cleanEmbeddedCommentary(calvinRes.formattedText);
    sections["covenant_calvin"] = cleaned;
    text += `## ${sectionIdx++}. Christ-Centered Covenant Exposition (John Calvin)\n${cleaned}\n\n`;
  }

  
  if (gillRes.formattedText && !gillRes.error) {
    const cleaned = cleanEmbeddedCommentary(gillRes.formattedText);
    sections["rabbinic_gill"] = cleaned;
    text += `## ${sectionIdx++}. Rabbinic & Prophetic Fulfillment (John Gill)\n${cleaned}\n\n`;
  }

  
  
  if (dictRes.formattedText && !dictRes.error) {
    const cleaned = cleanEmbeddedDictionary(dictRes.formattedText);
    sections["theological_dictionary_isbe"] = cleaned;
    text += `## ${sectionIdx++}. Doctrinal Encyclopedia Insights (ISBE)\n${cleaned}\n\n`;
  }

  if (xrefRes && xrefRes.formattedText && !xrefRes.error) {
    sections["cross_references"] = xrefRes.formattedText;
    text += `## ${sectionIdx++}. Canonical Redemptive-Historical Cross-References\n${xrefRes.formattedText}\n\n`;
  }

  const fetchedKeys = ["Calvin", "Gill"];
  const extra = await appendExtraCommentators(env, reference, extraCommentators, fetchedKeys, sections, sectionIdx);
  text += extra.text;

  const tip = `> [!TIP]\n> Use this data pack with the **Biblical Theologian** or **Systematic Theologian** persona to trace how Old Testament types, covenants, and promises culminate in Jesus Christ.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Covenant & Redemptive-Historical Theology Pack: ${reference}`,
      reference,
      version,
      
      timestamp: new Date().toISOString()
    }
  };
}

export async function getWordStudyPack(
  env: Env,
  strongsNumber: string,
  reference?: string,
  lexicon: string = "strongs"
): Promise<StudyPackResponse> {
  const parsed = reference ? parseReferenceString(reference) : null;
  const isNT = parsed ? parsed.bookNumber >= 40 : false;

  const lexiconRes = await lookupLexiconEntry(env, strongsNumber, lexicon);
  const morphRes = reference ? await lookupMorphology(env, reference) : null;
  const robRes = reference && isNT ? await lookupCommentary(env, "Rob", reference) : null;
  const vincentRes = reference && isNT ? await lookupCommentary(env, "Vincent", reference) : null;

  const sections: Record<string, string> = {};
  let text = `# Word Study Pack: ${strongsNumber}\n\n`;

  const lexDef = lexiconRes.formattedText || lexiconRes.error || "No lexicon entry found";
  sections["lexical_definition"] = lexDef;
  text += `## 1. Lexical Definition (${lexicon.toUpperCase()})\n${lexDef}\n\n`;

  let sectionIdx = 2;

  if (morphRes && morphRes.formattedText && !morphRes.error) {
    const cleaned = cleanEmbeddedMorphology(morphRes.formattedText);
    sections["verse_morphology"] = cleaned;
    text += `## ${sectionIdx++}. In-Context Verse Morphology (${reference})\n${cleaned}\n\n`;
  }

  if (robRes && robRes.formattedText && !robRes.error) {
    const cleaned = cleanEmbeddedCommentary(robRes.formattedText);
    sections["word_pictures_robertson"] = cleaned;
    text += `## ${sectionIdx++}. Greek Word Pictures & Syntax (A. T. Robertson)\n${cleaned}\n\n`;
  }

  if (vincentRes && vincentRes.formattedText && !vincentRes.error) {
    const cleaned = cleanEmbeddedCommentary(vincentRes.formattedText);
    sections["word_studies_vincent"] = cleaned;
    text += `## ${sectionIdx++}. Greek Lexical Nuances & Word Studies (Marvin Vincent)\n${cleaned}\n\n`;
  }

  const tip = `> [!IMPORTANT]\n> **Linguistic Guardrail**: Strictly avoid Illegitimate Totality Transfer. A word's semantic range represents all potential lexical possibilities across the corpus, but the author intends only ONE specific sense in context. Let the immediate syntax, grammar, and discourse context determine the single intended meaning.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Original Language Word Study Pack: ${strongsNumber}`,
      strongsNumber,
      reference,
      lexicon,
      timestamp: new Date().toISOString()
    }
  };
}

export async function getTopicStudyPack(
  env: Env,
  topic: string,
  version: string = "BSB"
): Promise<StudyPackResponse> {
  const dictRes = await lookupDictionary(env, topic, "tyndale");
  const promisesRes = await lookupPromises(env, topic, true, version);

  const sections: Record<string, string> = {};
  let text = `# Topical Study Pack: ${topic}\n\n`;

  const dictText = dictRes.formattedText || dictRes.error || "No dictionary entry found";
  sections["theological_definition"] = dictText;
  text += `## 1. Theological Dictionary Definition\n${dictText}\n\n`;

  let sectionIdx = 2;

  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    const cleaned = cleanEmbeddedPromises(promisesRes.formattedText);
    sections["scriptural_promises"] = cleaned;
    text += `## ${sectionIdx++}. Relevant Biblical Promises & Scriptural Anchors\n${cleaned}\n\n`;
  }

  const tip = `> [!TIP]\n> Use this data pack with the **Systematic Theologian** or **Verse Scripter** persona to construct a scripturally-anchored doctrinal exposition.\n`;
  text += tip;

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Topical & Doctrinal Study Pack: ${topic}`,
      topic,
      version,
      timestamp: new Date().toISOString()
    }
  };
}

export async function getCommentaryStudyPack(
  env: Env,
  reference: string,
  commentators?: string[],
  orderMode: "modern_first" | "classic_first" | "custom" = "modern_first"
): Promise<StudyPackResponse> {
  const MODERN_PRIORITY = ["TNotes", "Barnes", "MacL", "Calvin", "Gill", "Henry", "JFB"];
  const CLASSIC_PRIORITY = ["Calvin", "Gill", "Henry", "JFB", "TNotes", "Barnes", "MacL"];

  let list: string[];
  if (Array.isArray(commentators) && commentators.length > 0) {
    list = [...commentators];
    if (orderMode === "modern_first") {
      list.sort((a, b) => {
        const idxA = MODERN_PRIORITY.findIndex(k => k.toLowerCase() === a.toLowerCase());
        const idxB = MODERN_PRIORITY.findIndex(k => k.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    } else if (orderMode === "classic_first") {
      list.sort((a, b) => {
        const idxA = CLASSIC_PRIORITY.findIndex(k => k.toLowerCase() === a.toLowerCase());
        const idxB = CLASSIC_PRIORITY.findIndex(k => k.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }
  } else {
    list = orderMode === "classic_first" 
      ? ["Calvin", "Henry", "JFB", "Gill"]
      : ["TNotes", "Calvin", "Henry", "JFB"];
  }

  const sections: Record<string, string> = {};
  let text = `# Commentary Study Pack: ${reference}\n\n`;
  const commentaryMap: Record<string, any> = {};

  let sectionIdx = 1;

  for (const ver of list) {
    const res = await lookupCommentary(env, ver, reference);
    commentaryMap[ver] = res.result || { error: res.error };

    text += `## ${sectionIdx++}. ${ver} Commentary\n\n`;
    if (res.formattedText) {
      const cleaned = cleanEmbeddedCommentary(res.formattedText);
      sections[ver.toLowerCase()] = cleaned;
      text += cleaned + "\n\n";
    } else if (res.error) {
      sections[ver.toLowerCase()] = `Notice: ${res.error}`;
      text += `*Notice: ${res.error}*\n\n`;
    } else {
      sections[ver.toLowerCase()] = "No commentary found for this reference.";
      text += "*No commentary found for this reference.*\n\n";
    }
  }

  return {
    formattedText: text,
    sections,
    metadata: {
      title: `Commentary Study Pack: ${reference}`,
      reference,
      orderMode,
      commentators: list,
      commentaries: commentaryMap,
      timestamp: new Date().toISOString()
    }
  };
}

export { 
  getInterlinearStudyPack, 
  lookupInterlinear, 
  getOtInNtStudyPack, 
  lookupOtQuotations,
  getSeptuagintStudyPack,
  lookupSeptuagint
};
