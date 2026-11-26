import { getJsonFromR2 } from "../db/sqliteEngine.js";
import { levenshteinDistance } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";
import { dependencyUnavailable, invalidRequest, notFound, type ServiceErrorFields } from "./errors.js";

interface NameEntry {
  name: string;
  meaning: string;
}

/** Words the source data capitalised mechanically ("Mountain Of Strength"). */
const MINOR_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with"]);

/**
 * Tidies the source's mechanical Title Case without rewriting it: fixes the
 * possessive ("Father'S" → "Father's") and lowers minor words inside each
 * semicolon-separated meaning ("Mountain Of Strength" → "Mountain of Strength",
 * "Uncle, Or Father'S Brother" → "Uncle, or Father's Brother").
 */
export function tidyNameMeaning(meaning: string): string {
  return meaning
    .replace(/(\w)['’]S\b/g, "$1's")
    .split(/(;\s*)/)
    .map((phrase) =>
      phrase.replace(/(?<=\S\s+)([A-Z][a-z]*)\b/g, (word) => (MINOR_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word))
    )
    .join("");
}

export async function lookupBibleNames(
  env: Env,
  query: string
): Promise<ServiceErrorFields & { formattedText?: string; matches?: NameEntry[] }> {
  const namesData = await getJsonFromR2<NameEntry[]>(env, "data/lookup/bible_names.json");
  if (!namesData) {
    return dependencyUnavailable("Bible names data (bible_names.json) not available in R2.");
  }

  const queryClean = query.trim().toLowerCase();
  if (!queryClean) {
    return invalidRequest("Search query is required.");
  }

  const tokens = queryClean.split(/\s+/).filter((t) => t.length >= 2);
  const matches: NameEntry[] = [];

  for (const entry of namesData) {
    const nameLower = entry.name.toLowerCase();
    const meaningLower = entry.meaning.toLowerCase();

    // Exact or substring match
    const exact = nameLower === queryClean;
    const sub = tokens.some((t) => nameLower.includes(t) || meaningLower.includes(t));
    const fuzzy = levenshteinDistance(queryClean, nameLower) <= (queryClean.length <= 4 ? 1 : 2);

    if (exact || sub || fuzzy) {
      matches.push(entry);
    }
  }

  if (matches.length === 0) {
    return notFound(`No biblical names matching '${query}' were found.`);
  }

  // Sort: exact matches first
  matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === queryClean ? 0 : 1;
    const bExact = b.name.toLowerCase() === queryClean ? 0 : 1;
    return aExact - bExact;
  });

  const shown = matches.slice(0, 30).map((m) => ({ ...m, meaning: tidyNameMeaning(m.meaning) }));
  const lines = shown.map((m) => `• **${m.name}**: ${m.meaning}`);
  const formattedText = `# Bible Names: "${query}"\n\n` + lines.join("\n");

  return { matches: shown, formattedText };
}
