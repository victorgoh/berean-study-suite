import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env } from "../types.js";

const LEGACY_DICTIONARY_SOURCES: Record<string, { prefix: string; label: string }> = {
  easton: { prefix: "EAS", label: "Easton's Illustrated Bible Dictionary" },
  smith: { prefix: "SBD", label: "Smith's Bible Dictionary" },
  fausset: { prefix: "FAU", label: "Fausset's Bible Dictionary" },
  morrish: { prefix: "MOR", label: "Morrish Bible Dictionary" },
  vine: { prefix: "VNT", label: "Vine's Expository Dictionary of New Testament Words" }
};

const LEGACY_PREFIX_LABELS: Record<string, string> = {
  AMT: "American Tract Society Bible Dictionary",
  BBD: "Bridgeway Bible Dictionary",
  BMC: "Handbook of Bible Manners and Customs",
  BUC: "Buck's Theological Dictionary",
  CBA: "Companion Bible Appendices",
  DRE: "Dictionary of Religion and Ethics",
  EAS: "Easton's Illustrated Bible Dictionary",
  FAU: "Fausset's Bible Dictionary",
  FOS: "Figures of Speech Used in the Bible",
  MOR: "Morrish Bible Dictionary",
  PMD: "Poor Man's Dictionary",
  SBD: "Smith's Bible Dictionary",
  USS: "Ussher Chronology",
  VNT: "Vine's Expository Dictionary of New Testament Words"
};

export async function lookupDictionary(
  env: Env,
  term: string,
  source: string = "tyndale"
): Promise<{ error?: string; formattedText?: string; title?: string; definition?: string }> {
  if (!term || !term.trim()) {
    return { error: "Please provide a term to lookup in the Bible dictionary." };
  }

  const cleanTerm = term.trim();
  const cleanSource = (source || "tyndale").toLowerCase();

  // 1. Try Tyndale Open Bible Dictionary from R2 (Tyndale.dictionary SQLite)
  if (cleanSource === "tyndale") {
    try {
      let { db } = await getDatabase(env, "dictionaries/Tyndale.dictionary");
      if (!db) {
        const alt = await getDatabase(env, "data/dictionaries/Tyndale.dictionary");
        db = alt.db;
      }
      if (db) {
        // Direct exact match on headword or title first
        let stmt = db.prepare("SELECT headword, title, definition, source FROM Dictionary WHERE headword = ? COLLATE NOCASE OR title = ? COLLATE NOCASE LIMIT 1;");
        stmt.bind([cleanTerm, cleanTerm]);
        if (stmt.step()) {
          const row = stmt.getAsObject() as { headword: string; title: string; definition: string; source: string };
          stmt.free();
          const formattedText = `# Bible Dictionary: ${row.title || row.headword}\n\n${row.definition}\n\n---\n*Source: Tyndale Open Bible Dictionary, Tyndale House Publishers (CC BY-SA 4.0)*`;
          return { title: row.title || row.headword, definition: row.definition, formattedText };
        }
        stmt.free();

        // Prefix / substring match
        stmt = db.prepare("SELECT headword, title, definition, source FROM Dictionary WHERE headword LIKE ? COLLATE NOCASE OR title LIKE ? COLLATE NOCASE LIMIT 1;");
        stmt.bind([`%${cleanTerm}%`, `%${cleanTerm}%`]);
        if (stmt.step()) {
          const row = stmt.getAsObject() as { headword: string; title: string; definition: string; source: string };
          stmt.free();
          const formattedText = `# Bible Dictionary: ${row.title || row.headword}\n\n${row.definition}\n\n---\n*Source: Tyndale Open Bible Dictionary, Tyndale House Publishers (CC BY-SA 4.0)*`;
          return { title: row.title || row.headword, definition: row.definition, formattedText };
        }
        stmt.free();
      }
    } catch (err) {
      console.warn("Tyndale dictionary SQLite query error:", err);
    }

    return { error: `No entry found for '${term}' in the Tyndale Open Bible Dictionary.` };
  }

  // 2. Query the combined legacy collection, filtering its stable source prefixes.
  const sourceMeta = LEGACY_DICTIONARY_SOURCES[cleanSource];
  const isCollection = cleanSource === "collection" || cleanSource === "all";
  if (!sourceMeta && !isCollection) {
    return { error: `Unsupported Bible dictionary source: '${source}'.` };
  }

  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/dictionaries_index.json");
  if (!index) {
    return { error: `No Bible dictionary entry found matching '${term}'.` };
  }

  const availableTerms = isCollection
    ? Object.keys(index)
    : Object.keys(index).filter((key) => index[key]?.some((path) => path.startsWith(sourceMeta.prefix)));
  const bestMatch = findBestMatch(cleanTerm, availableTerms);
  if (!bestMatch) {
    const label = isCollection ? "the Classic Bible Dictionary Collection" : sourceMeta.label;
    return { error: `No entry found for '${term}' in ${label}.` };
  }

  const paths = isCollection
    ? index[bestMatch]
    : index[bestMatch].filter((path) => path.startsWith(sourceMeta.prefix));
  if (!paths || paths.length === 0) {
    const label = isCollection ? "the Classic Bible Dictionary Collection" : sourceMeta.label;
    return { error: `No entry found for '${bestMatch}' in ${label}.` };
  }

  const results: Array<{ content: string; sourceLabel: string }> = [];
  const localDictionary = !env.REFERENCE_DB
    ? (await getDatabase(env, "data/dictionary.data")).db
    : null;

  for (const path of paths) {
    let content: string | null = null;

    if (env.REFERENCE_DB) {
      try {
        const stmt = env.REFERENCE_DB.prepare("SELECT content FROM dictionary WHERE path = ? LIMIT 1").bind(path);
        const row = await stmt.first<{ content: string }>();
        if (row && row.content) {
          content = row.content;
        }
      } catch (d1Err) {
        console.warn("D1 dictionary query error:", d1Err);
      }
    }

    if (!content && localDictionary) {
      try {
        const stmt = localDictionary.prepare("SELECT content FROM Dictionary WHERE path = ? LIMIT 1");
        stmt.bind([path]);
        if (stmt.step()) {
          const row = stmt.getAsObject() as { content?: string };
          content = row.content || null;
        }
        stmt.free();
      } catch (localErr) {
        console.warn("Local dictionary query error:", localErr);
      }
    }

    if (content) {
      results.push({
        content: cleanHtmlToMarkdown(content),
        sourceLabel: LEGACY_PREFIX_LABELS[path.slice(0, 3)] || `Legacy dictionary source ${path.slice(0, 3)}`
      });
    }
  }

  if (results.length === 0) {
    return { error: `Could not retrieve dictionary content for '${bestMatch}'.` };
  }

  const formattedText = isCollection
    ? `# Classic Bible Dictionary Collection: ${bestMatch}\n\n` + results
        .map((result) => `## ${result.sourceLabel}\n\n${result.content}\n\n*Source: ${result.sourceLabel}*`)
        .join("\n\n---\n\n")
    : `# ${sourceMeta.label}: ${bestMatch}\n\n${results.map((result) => result.content).join("\n\n---\n\n")}\n\n---\n*Source: ${sourceMeta.label}*`;
  return { title: bestMatch, formattedText };
}
