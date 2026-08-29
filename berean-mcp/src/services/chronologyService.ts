import { getJsonFromR2 } from "../db/sqliteEngine.js";
import { Env } from "../types.js";

const PERIOD_SYNONYMS: Record<string, string[]> = {
  patriarch: ["abram", "abraham", "sarah", "sarai", "isaac", "jacob", "esau", "joseph", "ishmael", "rebekah", "leah", "rachel", "gen 11", "gen 12", "gen 15", "gen 17", "gen 21", "gen 25", "gen 28", "gen 29", "gen 35", "gen 37", "gen 41", "gen 47", "gen 50"],
  patriarchs: ["abram", "abraham", "sarah", "sarai", "isaac", "jacob", "esau", "joseph", "ishmael", "rebekah", "leah", "rachel", "gen 11", "gen 12", "gen 15", "gen 17", "gen 21", "gen 25", "gen 28", "gen 29", "gen 35", "gen 37", "gen 41", "gen 47", "gen 50"],
  patriachs: ["abram", "abraham", "sarah", "sarai", "isaac", "jacob", "esau", "joseph", "ishmael", "rebekah", "leah", "rachel", "gen 11", "gen 12", "gen 15", "gen 17", "gen 21", "gen 25", "gen 28", "gen 29", "gen 35", "gen 37", "gen 41", "gen 47", "gen 50"],
  patriarchal: ["abram", "abraham", "sarah", "sarai", "isaac", "jacob", "esau", "joseph"],
  genesis: ["abram", "abraham", "sarah", "isaac", "jacob", "joseph", "gen "],
  exodus: ["moses", "aaron", "miriam", "pharaoh", "plagues", "tabernacle", "sinai", "wilderness", "red sea", "kadesh", "exod", "lev", "num", "deut"],
  wilderness: ["kadesh", "sinai", "wilderness", "tabernacle", "jordan", "manna", "num 20", "deut 2"],
  conquest: ["joshua", "canaan", "jericho", "promised land", "hebron", "caleb", "josh"],
  judges: ["othniel", "ehud", "deborah", "barak", "gideon", "abimelech", "tola", "jair", "jephthah", "ibzan", "elon", "abdon", "samson", "judg"],
  monarchy: ["saul", "david", "solomon", "temple", "jerusalem", "samuel", "1 sam", "2 sam", "1 kgs", "1 chr"],
  "united monarchy": ["saul", "david", "solomon", "temple"],
  "divided monarchy": ["kings of israel", "kings of judah", "jeroboam", "rehoboam", "asa", "jehoshabeath", "hezekiah", "josiah", "ahab", "jehu"],
  exile: ["babylon", "nebuchadnezzar", "captivity", "exile", "586 bc", "722 bc", "cyrus", "jerusalem destroyed"],
  postexilic: ["cyrus", "zerubbabel", "ezra", "nehemiah", "esther", "temple rebuilt", "hag", "zech", "mal"],
  "life of christ": ["jesus", "christ", "birth of jesus", "baptism", "crucifixion", "resurrection", "gospel", "herod", "pilate", "nazareth", "bethlehem", "calvary", "ad 30", "ad 33"],
  gospels: ["jesus", "christ", "birth", "crucifixion", "resurrection", "disciples", "galilee", "jerusalem"],
  "early church": ["pentecost", "acts", "paul", "stephen", "peter", "antioch", "corinth", "ephesus", "rome", "journey"],
  paul: ["paul", "saul", "damascus", "corinth", "ephesus", "philippi", "rome", "tarsus", "galatia", "thessalonica", "colossae", "acts"]
};

export async function lookupChronology(
  env: Env,
  query: string
): Promise<{ error?: string; formattedText?: string; sectionMatches?: Record<string, string[]> }> {
  const chronoData = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/chronology.json");
  if (!chronoData) {
    return { error: "Chronology dataset (chronology.json) not available in R2." };
  }

  const queryClean = query.trim().toLowerCase();
  if (!queryClean) {
    return { error: "Chronology search query is required." };
  }

  const rawTokens = queryClean.split(/\s+/).filter((t) => t.length >= 2);
  const searchTerms = new Set<string>(rawTokens);
  searchTerms.add(queryClean);

  // Expand with historical period keywords
  for (const [periodKey, mappedTerms] of Object.entries(PERIOD_SYNONYMS)) {
    if (queryClean === periodKey || queryClean.includes(periodKey) || rawTokens.includes(periodKey)) {
      for (const term of mappedTerms) {
        searchTerms.add(term);
      }
    }
  }

  const termList = Array.from(searchTerms);
  const matchedSections: Record<string, string[]> = {};
  let totalMatches = 0;

  for (const [secName, lines] of Object.entries(chronoData)) {
    const secLower = secName.toLowerCase();
    const isSectionNameMatch = termList.some((t) => secLower.includes(t));

    let matchingLines = lines.filter((l) => {
      const lLower = l.toLowerCase();
      return termList.some((t) => {
        if (t === "joseph") {
          return /\bjoseph\b/i.test(lLower.replace(/josephus/gi, ""));
        }
        if (t.length <= 4) {
          const regex = new RegExp(`\\b${t}\\b`, "i");
          return regex.test(lLower);
        }
        return lLower.includes(t);
      });
    });

    // If the section title matched directly and no specific lines matched, return the section
    if (matchingLines.length === 0 && isSectionNameMatch) {
      matchingLines = lines.slice(0, 50);
    }

    if (matchingLines.length > 0) {
      matchedSections[secName] = matchingLines;
      totalMatches += matchingLines.length;
    }
  }

  if (totalMatches === 0) {
    return { error: `No chronological events matching '${query}' were found.` };
  }

  const mdBlocks: string[] = [];
  mdBlocks.push(`# Biblical Chronology: "${query}"\n`);

  for (const [secName, lines] of Object.entries(matchedSections)) {
    mdBlocks.push(`### ${secName} (${lines.length} events)\n`);
    for (const l of lines) {
      mdBlocks.push(`• ${l}`);
    }
    mdBlocks.push("");
  }

  return { sectionMatches: matchedSections, formattedText: mdBlocks.join("\n") };
}
