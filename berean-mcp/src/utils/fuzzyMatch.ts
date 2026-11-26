/**
 * Fuzzy matching utilities using Levenshtein distance.
 */

export function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) {
    return levenshteinDistance(s2, s1);
  }
  if (s2.length === 0) {
    return s1.length;
  }

  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&", apos: "'", quot: '"', lt: "<", gt: ">", nbsp: " ",
  lsquo: "‘", rsquo: "’", sbquo: "‚", ldquo: "“", rdquo: "”", bdquo: "„",
  mdash: "—", ndash: "–", hellip: "…", middot: "·", bull: "•",
  laquo: "«", raquo: "»", oelig: "œ", aelig: "æ", szlig: "ß", yuml: "ÿ",
  copy: "©", reg: "®", trade: "™",
  deg: "°", plusmn: "±", times: "×", divide: "÷", para: "¶", sect: "§"
};

const LEGACY_WINDOWS_1252: Record<string, string> = {
  "\u0085": "…", "\u0091": "‘", "\u0092": "’", "\u0093": "“", "\u0094": "”",
  "\u0095": "•", "\u0096": "–", "\u0097": "—"
};

function decodeCodePoint(value: string, radix: number, original: string): string {
  const codePoint = Number.parseInt(value, radix);
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
    return original;
  }
  return String.fromCodePoint(codePoint);
}

/** Decode source HTML entities, then compose combining Greek/Hebrew diacritics. */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (original, value) => decodeCodePoint(value, 16, original))
    .replace(/&#(\d+);/g, (original, value) => decodeCodePoint(value, 10, original))
    .replace(/&([a-z][a-z0-9]+);/gi, (original, name) => HTML_ENTITIES[name.toLowerCase()] ?? original)
    .replace(/[\u0085\u0091-\u0097]/g, (character) => LEGACY_WINDOWS_1252[character] ?? character)
    .replace(/\u00a0/g, " ")
    .normalize("NFC");
}

/**
 * True when `phrase` occurs in `text` as whole words: "the book of romans"
 * contains "romans", but "grace" does not contain "race".
 */
function containsWholeWords(text: string, phrase: string): boolean {
  if (!phrase) return false;
  let from = 0;
  while (true) {
    const at = text.indexOf(phrase, from);
    if (at < 0) return false;
    const before = at === 0 ? "" : text[at - 1];
    const after = text[at + phrase.length] ?? "";
    if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) return true;
    from = at + 1;
  }
}

/** The names an index key stands for: the last step of a "a > b" path, split on "/" alternatives. */
function exactNames(cleanedKey: string): string[] {
  const steps = cleanedKey.split(">");
  return steps[steps.length - 1].split("/").map((name) => name.trim());
}

/** True when `match` is only a spelling near-miss for `query` (not equal, not containing it as a word). */
export function isNearMiss(query: string, match: string, keyTransform?: (raw: string) => string): boolean {
  const q = query.trim().toLowerCase();
  const m = (keyTransform ? keyTransform(match) : decodeHtmlEntities(match)).toLowerCase();
  return !exactNames(m).includes(q) && !containsWholeWords(m, q) && !containsWholeWords(q, m) && !m.includes(q);
}

export function findBestMatch(
  query: string,
  candidates: string[],
  keyTransform?: (raw: string) => string
): string | null {
  const queryClean = query.trim().toLowerCase();
  if (!queryClean) return null;

  const transform = keyTransform || ((k) => decodeHtmlEntities(k).toLowerCase());

  // 1a. Exact match on the whole entry ("Humility" before "... > Humility").
  for (const raw of candidates) {
    if (transform(raw).toLowerCase() === queryClean) return raw;
  }
  // 1b. Entries can be a path ("Topic > Subtopic"), whose last step is the
  // entry's name, and a name can list alternatives ("Saul/Paul/Mercurius");
  // any one alternative of the last step matching exactly counts.
  for (const raw of candidates) {
    if (exactNames(transform(raw).toLowerCase()).includes(queryClean)) return raw;
  }

  // 2. Substring containment match
  const partials: string[] = [];
  for (const raw of candidates) {
    const cleaned = transform(raw).toLowerCase();
    const parts = cleaned.split(/[>/]/).map((p) => p.trim());
    const leaf = parts[parts.length - 1] || "";

    if (cleaned.includes(queryClean) || (leaf && leaf.includes(queryClean))) {
      partials.push(raw);
    } else if (containsWholeWords(queryClean, cleaned) || (leaf && containsWholeWords(queryClean, leaf))) {
      if (leaf.length >= 4 || cleaned.length >= 4) {
        partials.push(raw);
      }
    }
  }

  if (partials.length === 1) {
    return partials[0];
  } else if (partials.length > 1) {
    // Prefer entries containing the query as a whole word ("Paul" in "Saul/Paul")
    // over a mere substring ("Paul" in "Paulus"), then the shortest.
    const wholeWord = (raw: string) => (containsWholeWords(transform(raw).toLowerCase(), queryClean) ? 0 : 1);
    partials.sort((a, b) => wholeWord(a) - wholeWord(b) || transform(a).length - transform(b).length);
    return partials[0];
  }

  // 3. Levenshtein fuzzy distance
  let bestMatch: string | null = null;
  let minDistance = 9999;

  for (const raw of candidates) {
    const cleaned = transform(raw).toLowerCase();
    const parts = cleaned.split(/[>/]/).map((p) => p.trim());
    const targets = [cleaned, ...parts];

    for (const target of targets) {
      // A near-miss spelling must start with the same letter: "abrahm" can
      // match "abraham", but "grace" must not match "race".
      if (!target || target[0] !== queryClean[0]) continue;
      const dist = levenshteinDistance(queryClean, target);
      // On a tie, prefer the shorter entry ("Humility" over "... > Humility").
      if (dist < minDistance || (dist === minDistance && bestMatch !== null && cleaned.length < transform(bestMatch).length)) {
        minDistance = dist;
        bestMatch = raw;
      }
    }
  }

  let threshold = 2;
  if (queryClean.length <= 4) {
    threshold = 1;
  } else if (queryClean.length > 8) {
    threshold = 3;
  }

  if (minDistance <= threshold) {
    return bestMatch;
  }

  return null;
}
