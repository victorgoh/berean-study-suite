/**
 * The morphology dataset marks words that have no separate English rendering
 * with the placeholder "vvv": their sense is folded into a neighbouring word's
 * translation (e.g. ὑμᾶς in Matthew 11:28 is covered by "will give you rest").
 */
const UNTRANSLATED_MARKER = "vvv";

/** The word's own translation, or undefined when it has none (blank or the placeholder). */
export function translationOf(raw: string | null | undefined): string | undefined {
  const text = raw?.trim();
  return !text || text === UNTRANSLATED_MARKER ? undefined : text;
}

/**
 * The Strong's number in a morphology LexicalEntry, e.g. "G2872," → "G2872" and
 * "E70002,H7225," → "H7225" (Hebrew entries also carry an internal E-number).
 */
export function strongsOf(lexicalEntry: string | null | undefined): string | undefined {
  return lexicalEntry?.match(/\b([GH]\d{1,5}[A-Za-z]?)\b/)?.[1]?.toUpperCase();
}
