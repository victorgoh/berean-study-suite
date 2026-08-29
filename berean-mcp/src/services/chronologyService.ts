import { getJsonFromR2 } from "../db/sqliteEngine.js";
import { Env } from "../types.js";

export async function lookupChronology(
  env: Env,
  query: string
): Promise<{ error?: string; formattedText?: string; sectionMatches?: Record<string, string[]> }> {
  const chronoData = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/chronology.json");
  if (!chronoData) {
    return { error: "Chronology dataset (chronology.json) not available in R2." };
  }

  const queryClean = query.trim().toLowerCase();
  const tokens = queryClean.split(/\s+/).filter((t) => t.length >= 2);

  const matchedSections: Record<string, string[]> = {};
  let totalMatches = 0;

  for (const [secName, lines] of Object.entries(chronoData)) {
    const matchingLines = lines.filter((l) => {
      const lLower = l.toLowerCase();
      return tokens.some((t) => lLower.includes(t));
    });

    if (matchingLines.length > 0) {
      matchedSections[secName] = matchingLines;
      totalMatches += matchingLines.length;
    }
  }

  if (totalMatches === 0) {
    return { error: `No chronological events matching '${query}' were found.` };
  }

  const mdBlocks: string[] = [];
  mdBlocks.push(`# Biblical Chronology Search: "${query}"\n`);

  for (const [secName, lines] of Object.entries(matchedSections)) {
    mdBlocks.push(`### ${secName}\n`);
    for (const l of lines) {
      mdBlocks.push(`• ${l}`);
    }
    mdBlocks.push("");
  }

  return { sectionMatches: matchedSections, formattedText: mdBlocks.join("\n") };
}
