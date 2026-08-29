import { lookupBiblePassage, parseReferenceString } from "./bibleService.js";
import { lookupCommentary } from "./commentaryService.js";
import { lookupCrossReferences } from "./xrefService.js";
import { lookupLexiconEntry } from "./lexiconService.js";
import { lookupMorphology } from "./morphologyService.js";
import { lookupDictionary } from "./dictionaryService.js";
import { lookupPromises } from "./promisesService.js";
import { lookupChapterSummary } from "./chapterSummaryService.js";
import { Env } from "../types.js";

export async function getSermonStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB",
  includeXrefs: boolean = true
) {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const maclRes = await lookupCommentary(env, "MacL", reference);
  const simeonRes = await lookupCommentary(env, "HH", reference);
  const biRes = await lookupCommentary(env, "BI", reference);
  const henryRes = await lookupCommentary(env, "Henry", reference);
  const xrefRes = includeXrefs ? await lookupCrossReferences(env, reference, 10) : null;

  let text = `# 🎙️ Sermon Study Pack: ${reference}\n\n`;

  text += `## 1. Scripture Text (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (maclRes.formattedText && !maclRes.error) {
    text += `## 2. Expository Sermon Structure & Gems (Alexander Maclaren)\n`;
    text += maclRes.formattedText + "\n\n";
  }

  if (simeonRes.formattedText && !simeonRes.error) {
    text += `## 3. Homiletical Discourse & Preaching Outline (Charles Simeon - Horae Homileticae)\n`;
    text += simeonRes.formattedText + "\n\n";
  }

  if (biRes.formattedText && !biRes.error) {
    text += `## 4. Sermon Illustrations & Historical Anecdotes (Biblical Illustrator)\n`;
    text += biRes.formattedText + "\n\n";
  }

  if (henryRes.formattedText && !henryRes.error) {
    text += `## 5. Pithy Pastoral Aphorisms & Puritan Insights (Matthew Henry)\n`;
    text += henryRes.formattedText + "\n\n";
  }

  if (xrefRes && xrefRes.formattedText) {
    text += `## 6. Key Cross-References (TSK)\n`;
    text += xrefRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Passionate Evangelist** persona to construct a compelling 3-point homiletical outline, poignant illustrations, and a direct gospel call to faith.\n`;

  return { formattedText: text };
}

export async function getDevotionalStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
) {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const maclRes = await lookupCommentary(env, "MacL", reference);
  const spurRes = await lookupCommentary(env, "Spur", reference);
  const barnesRes = await lookupCommentary(env, "Barnes", reference);
  const henryRes = await lookupCommentary(env, "Henry", reference);
  const promisesRes = await lookupPromises(env, reference, true, version);
  const xrefRes = await lookupCrossReferences(env, reference, 8);

  let text = `# 💖 Comprehensive Devotional Study Pack: ${reference}\n\n`;

  text += `## 1. Scripture for Meditation (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (maclRes.formattedText && !maclRes.error) {
    text += `## 2. Devotional Exposition (Alexander Maclaren)\n`;
    text += maclRes.formattedText + "\n\n";
  }

  if (spurRes.formattedText && !spurRes.error) {
    text += `## 3. Heart Reflections & Meditation (Charles Spurgeon)\n`;
    text += spurRes.formattedText + "\n\n";
  }

  if (barnesRes.formattedText && !barnesRes.error) {
    text += `## 4. Practical Life Applications (Albert Barnes - Remarks)\n`;
    text += barnesRes.formattedText + "\n\n";
  }

  if (henryRes.formattedText && !henryRes.error) {
    text += `## 5. Supporting Pastoral Aphorisms (Matthew Henry)\n`;
    text += henryRes.formattedText + "\n\n";
  }

  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    text += `## 6. Related Biblical Promises & Anchors\n`;
    text += promisesRes.formattedText + "\n\n";
  }

  if (xrefRes && xrefRes.formattedText) {
    text += `## 7. Supporting Cross-References\n`;
    text += xrefRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Compassionate Pastor** persona to draft a 7-section daily devotional with historical insight, keyword meditation, 3 practical action steps, and a 1st-person closing prayer.\n`;

  return { formattedText: text };
}

export async function getPassageExegesisPack(
  env: Env,
  reference: string,
  version: string = "BSB",
  includeOriginal: boolean = true
) {
  const parsed = parseReferenceString(reference);
  const isOT = parsed ? parsed.bookNumber <= 39 : false;

  const bibleRes = await lookupBiblePassage(env, version, reference);
  const originalRes = includeOriginal ? await lookupBiblePassage(env, "OHGB", reference) : null;
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

  let text = `# 🔬 Academic Exegesis Study Pack: ${reference}\n\n`;

  text += `## 1. Primary Translation (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (originalRes && originalRes.formattedText) {
    text += `## 2. Original Language Text (OHGB ${isOT ? "Hebrew/Aramaic" : "Greek"})\n`;
    text += originalRes.formattedText + "\n\n";
  }

  if (morphRes && morphRes.formattedText && !morphRes.error) {
    text += `## 3. Morphological & Grammatical Parsing\n`;
    text += morphRes.formattedText + "\n\n";
  }

  if (primaryScholarRes.formattedText && !primaryScholarRes.error) {
    const scholarName = isOT ? "Keil & Delitzsch (OT Scholarly Commentary)" : "H. A. W. Meyer (CECNT - NT Exegesis)";
    text += `## 4. Critical Grammatical-Historical Exegesis (${scholarName})\n`;
    text += primaryScholarRes.formattedText + "\n\n";
  }

  if (secondaryScholarRes.formattedText && !secondaryScholarRes.error) {
    const scholarName = isOT ? "Adam Clarke (Historical Customs & Philology)" : "Expositor's Greek NT (W. Robertson Nicoll)";
    text += `## 5. Textual & Linguistic Insights (${scholarName})\n`;
    text += secondaryScholarRes.formattedText + "\n\n";
  }

  if (pulpitRes.formattedText && !pulpitRes.error) {
    text += `## 6. Structural Analysis & Critical Backgrounds (The Pulpit Commentary)\n`;
    text += pulpitRes.formattedText + "\n\n";
  }

  if (jfbRes.formattedText && !jfbRes.error) {
    text += `## 7. Exegetical Synthesis (Jamieson-Fausset-Brown)\n`;
    text += jfbRes.formattedText + "\n\n";
  }

  if (xrefRes && xrefRes.formattedText) {
    text += `## 8. Canonical Cross-References\n`;
    text += xrefRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **OT/NT Bible Scholar** persona to write rigorous academic exegesis, resolve textual variants, and unpack original language syntax.\n`;

  return { formattedText: text };
}

export async function getLessonCreatorStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
) {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const summaryRes = await lookupChapterSummary(env, reference);
  const ellicottRes = await lookupCommentary(env, "ECER", reference);
  const ebcRes = await lookupCommentary(env, "EBC", reference);
  const barnesRes = await lookupCommentary(env, "Barnes", reference);
  const xrefRes = await lookupCrossReferences(env, reference, 8);

  let text = `# 🏫 Bible Lesson Creator Study Pack: ${reference}\n\n`;

  text += `## 1. Lesson Scripture (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (summaryRes.formattedText && !summaryRes.error) {
    text += `## 2. Chapter Overview & Contextual Flow\n`;
    text += summaryRes.formattedText + "\n\n";
  }

  if (ellicottRes.formattedText && !ellicottRes.error) {
    text += `## 3. Lay-Accessible Historical & Cultural Context (Charles Ellicott)\n`;
    text += ellicottRes.formattedText + "\n\n";
  }

  if (ebcRes.formattedText && !ebcRes.error) {
    text += `## 4. Expository Essays & Teaching Notes (The Expositor's Bible)\n`;
    text += ebcRes.formattedText + "\n\n";
  }

  if (barnesRes.formattedText && !barnesRes.error) {
    text += `## 5. Practical Lessons & Life Applications (Albert Barnes - Remarks)\n`;
    text += barnesRes.formattedText + "\n\n";
  }

  if (xrefRes && xrefRes.formattedText) {
    text += `## 6. Supporting Scripture Cross-References\n`;
    text += xrefRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Biblical Content Interpreter** or **Bible Teacher** persona to construct small group study guides, Sunday School curricula, and interactive discussion questions.\n`;

  return { formattedText: text };
}

export async function getPrayerGuideStudyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
) {
  const parsed = parseReferenceString(reference);
  const isPsalm = parsed && parsed.bookNumber === 19;

  const bibleRes = await lookupBiblePassage(env, version, reference);
  const devotionalPrayerRes = isPsalm
    ? await lookupCommentary(env, "Spur", reference)
    : await lookupCommentary(env, "Benson", reference);
  const wesleyRes = await lookupCommentary(env, "Wesley", reference);
  const promisesRes = await lookupPromises(env, reference, true, version);

  let text = `# 🙏 Scriptural Prayer Guide Study Pack: ${reference}\n\n`;

  text += `## 1. Scripture for Prayer & Intercession (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (devotionalPrayerRes.formattedText && !devotionalPrayerRes.error) {
    const authorName = isPsalm ? "Charles Spurgeon (Treasury of David)" : "Joseph Benson (Notes on Piety & Grace)";
    text += `## 2. Heart Worship & Spiritual Affections (${authorName})\n`;
    text += devotionalPrayerRes.formattedText + "\n\n";
  }

  if (wesleyRes.formattedText && !wesleyRes.error) {
    text += `## 3. Examination for Personal Holiness & Obedience (John Wesley)\n`;
    text += wesleyRes.formattedText + "\n\n";
  }

  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    text += `## 4. Scriptural Promises to Claim in Prayer\n`;
    text += promisesRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Compassionate Pastor** persona to write personal, first-person prayers ("I", "we") following the ACTS model (Adoration, Confession, Thanksgiving, Supplication).\n`;

  return { formattedText: text };
}

export async function getCovenantTheologyPack(
  env: Env,
  reference: string,
  version: string = "BSB"
) {
  const bibleRes = await lookupBiblePassage(env, version, reference);
  const calvinRes = await lookupCommentary(env, "Calvin", reference);
  const gillRes = await lookupCommentary(env, "Gill", reference);
  const dictRes = await lookupDictionary(env, "Covenant", "isbe");
  const xrefRes = await lookupCrossReferences(env, reference, 12);

  let text = `# 👑 Covenant & Redemptive-Historical Theology Pack: ${reference}\n\n`;

  text += `## 1. Scripture Text (${version})\n`;
  text += (bibleRes.formattedText || bibleRes.error || "No passage retrieved") + "\n\n";

  if (calvinRes.formattedText && !calvinRes.error) {
    text += `## 2. Christ-Centered Covenant Exposition (John Calvin)\n`;
    text += calvinRes.formattedText + "\n\n";
  }

  if (gillRes.formattedText && !gillRes.error) {
    text += `## 3. Rabbinic & Prophetic Fulfillment (John Gill)\n`;
    text += gillRes.formattedText + "\n\n";
  }

  if (dictRes.formattedText && !dictRes.error) {
    text += `## 4. Doctrinal Encyclopedia Insights (ISBE)\n`;
    text += dictRes.formattedText + "\n\n";
  }

  if (xrefRes && xrefRes.formattedText) {
    text += `## 5. Canonical Redemptive-Historical Cross-References\n`;
    text += xrefRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Biblical Theologian** or **Systematic Theologian** persona to trace how Old Testament types, covenants, and promises culminate in Jesus Christ.\n`;

  return { formattedText: text };
}

export async function getWordStudyPack(
  env: Env,
  strongsNumber: string,
  reference?: string,
  lexicon: string = "strongs"
) {
  const parsed = reference ? parseReferenceString(reference) : null;
  const isNT = parsed ? parsed.bookNumber >= 40 : false;

  const lexiconRes = await lookupLexiconEntry(env, strongsNumber, lexicon);
  const morphRes = reference ? await lookupMorphology(env, reference) : null;
  const robRes = reference && isNT ? await lookupCommentary(env, "Rob", reference) : null;
  const vincentRes = reference && isNT ? await lookupCommentary(env, "Vincent", reference) : null;

  let text = `# 🔤 Original Language Word Study Pack: ${strongsNumber}\n\n`;

  text += `## 1. Lexical Definition (${lexicon.toUpperCase()})\n`;
  text += (lexiconRes.formattedText || lexiconRes.error || "No lexicon entry found") + "\n\n";

  if (morphRes && morphRes.formattedText && !morphRes.error) {
    text += `## 2. In-Context Verse Morphology (${reference})\n`;
    text += morphRes.formattedText + "\n\n";
  }

  if (robRes && robRes.formattedText && !robRes.error) {
    text += `## 3. Greek Word Pictures & Syntax (A. T. Robertson)\n`;
    text += robRes.formattedText + "\n\n";
  }

  if (vincentRes && vincentRes.formattedText && !vincentRes.error) {
    text += `## 4. Greek Lexical Nuances & Word Studies (Marvin Vincent)\n`;
    text += vincentRes.formattedText + "\n\n";
  }

  text += `> [!IMPORTANT]\n> **Linguistic Guardrail**: Strictly avoid Illegitimate Totality Transfer. A word's semantic range represents all potential lexical possibilities across the corpus, but the author intends only ONE specific sense in context. Let the immediate syntax, grammar, and discourse context determine the single intended meaning.\n`;

  return { formattedText: text };
}

export async function getTopicStudyPack(
  env: Env,
  topic: string,
  version: string = "BSB"
) {
  const dictRes = await lookupDictionary(env, topic, "easton");
  const promisesRes = await lookupPromises(env, topic, true, version);

  let text = `# 📚 Topical & Doctrinal Study Pack: ${topic}\n\n`;

  text += `## 1. Theological Dictionary Definition\n`;
  text += (dictRes.formattedText || dictRes.error || "No dictionary entry found") + "\n\n";

  if (promisesRes && promisesRes.formattedText && !promisesRes.error) {
    text += `## 2. Relevant Biblical Promises & Scriptural Anchors\n`;
    text += promisesRes.formattedText + "\n\n";
  }

  text += `> [!TIP]\n> Use this data pack with the **Systematic Theologian** or **Verse Scripter** persona to construct a scripturally-anchored doctrinal exposition.\n`;

  return { formattedText: text };
}

export async function getCommentaryStudyPack(
  env: Env,
  reference: string,
  commentators: string[] = ["Henry", "JFB", "Calvin"]
) {
  const list = Array.isArray(commentators) && commentators.length > 0
    ? commentators
    : ["Henry", "JFB", "Calvin"];

  let text = `# 📖 Commentary Study Pack: ${reference}\n\n`;
  const commentaryMap: Record<string, any> = {};

  for (const ver of list) {
    const res = await lookupCommentary(env, ver, reference);
    commentaryMap[ver] = res.result || { error: res.error };

    text += `## ${ver} Commentary\n\n`;
    if (res.formattedText) {
      text += res.formattedText + "\n\n";
    } else if (res.error) {
      text += `*Notice: ${res.error}*\n\n`;
    } else {
      text += "*No commentary found for this reference.*\n\n";
    }
    text += "---\n\n";
  }

  return {
    formattedText: text,
    result: {
      reference,
      commentaries: commentaryMap
    }
  };
}
