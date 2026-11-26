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
