import { getJsonFromR2 } from "../db/sqliteEngine.js";
import { levenshteinDistance } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";

interface NameEntry {
  name: string;
  meaning: string;
}

export async function lookupBibleNames(
  env: Env,
  query: string
): Promise<{ error?: string; formattedText?: string; matches?: NameEntry[] }> {
  const namesData = await getJsonFromR2<NameEntry[]>(env, "data/lookup/bible_names.json");
  if (!namesData) {
    return { error: "Bible names data (bible_names.json) not available in R2." };
  }

  const queryClean = query.trim().toLowerCase();
  if (!queryClean) {
    return { error: "Search query is required." };
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
    return { error: `No biblical names matching '${query}' were found.` };
  }

  // Sort: exact matches first
  matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === queryClean ? 0 : 1;
    const bExact = b.name.toLowerCase() === queryClean ? 0 : 1;
    return aExact - bExact;
  });

  const lines = matches.slice(0, 30).map((m) => `• **${m.name}**: ${m.meaning}`);
  const formattedText = `# Bible Names: "${query}"\n\n` + lines.join("\n");

  return { matches: matches.slice(0, 30), formattedText };
}
