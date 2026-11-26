/**
 * Clean-up for imported reference texts (character, place and topical data).
 * The sources carry leftovers from their original HTML apps: misspellings,
 * "Click for more details" lines, book names bolded apart from their verse,
 * sentences joined without a space, and ALL-CAPS headings.
 */

const SOURCE_TYPOS: Array<[RegExp, string]> = [
  [/\bOcurrence\b/g, "Occurrence"],
  [/\bOccurence\b/g, "Occurrence"],
  [/\bOccurences\b/g, "Occurrences"],
  [/\bHabbakkuk\b/g, "Habakkuk"]
];

/** Words kept in capitals when an ALL-CAPS heading is converted to sentence case. */
const KEEP_UPPER = new Set(["LORD", "GOD", "I", "II", "III", "BC", "AD", "NT", "OT"]);

function sentenceCase(text: string): string {
  let first = true;
  return text.replace(/[A-Z][A-Z'’]*/g, (word) => {
    if (KEEP_UPPER.has(word)) return word;
    const lowered = word.toLowerCase();
    if (first) {
      first = false;
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    }
    return lowered;
  });
}

export function tidySourceText(markdown: string): string {
  let text = markdown;
  for (const [pattern, replacement] of SOURCE_TYPOS) text = text.replace(pattern, replacement);
  return (
    text
      // Leftover link text from the source app.
      .replace(/^\s*Click for more details\s*$/gim, "")
      // "**Ruth** 4:17" -> "Ruth 4:17" so the reference reads (and links) as one.
      .replace(/\*\*((?:[1-3] ?)?[A-Z][a-z]+(?: of [A-Z][a-z]+)?)\*\* (\d{1,3}:\d)/g, "$1 $2")
      // "portions:The early" / "1085.The" -> add the missing space between sentences.
      .replace(/([a-z0-9)"'”\]])([.:;])([A-Z][a-z])/g, "$1$2 $3")
      // "are,1. Kahn" -> "are, 1. Kahn"
      .replace(/([a-z]),(\d)/g, "$1, $2")
      // "* Attributed to God*" -> "*Attributed to God*"
      .replace(/^\*\s+([^*\n]+?)\s*\*$/gm, "*$1*")
      // ALL-CAPS heading lines (optionally in * or **) -> sentence case.
      .replace(/^(\**)([A-Z][A-Z ,'’\-]{3,}[A-Z])(\**)$/gm, (_m, open: string, words: string, close: string) =>
        words.includes(" ") ? open + sentenceCase(words) + close : open + words + close
      )
      .replace(/\n{3,}/g, "\n\n")
  );
}
