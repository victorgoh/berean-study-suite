import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env, LocationResult } from "../types.js";

export async function lookupLocation(
  env: Env,
  locationQuery: string
): Promise<{ error?: string; formattedText?: string; location?: string; result?: LocationResult }> {
  const index = await getJsonFromR2<Record<string, [string, string, string]>>(env, "data/lookup/locations_index.json");
  if (!index) {
    return { error: "Location lookup index (locations_index.json) not available in R2." };
  }

  const bestMatch = findBestMatch(locationQuery, Object.keys(index));
  if (!bestMatch) {
    return { error: `Could not locate a matching Bible location for '${locationQuery}'.` };
  }

  const entry = index[bestMatch];
  if (!entry) {
    return { error: `No coordinates found for '${bestMatch}'.` };
  }

  const [code, latStr, lonStr] = entry;
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const mapUrl = `https://maps.google.com/?q=${lat},${lon}&z=10`;

  const { db, error: dbError } = await getDatabase(env, "data/exlb3.data");
  if (!db) {
    return { error: dbError || "Location database (exlb3.data) not found in R2." };
  }

  try {
    const stmt = db.prepare("SELECT content FROM exlbl WHERE path = ? LIMIT 1");
    stmt.bind([code]);

    let desc = "";
    if (stmt.step()) {
      const row = stmt.getAsObject() as { content: string };
      desc = cleanHtmlToMarkdown(row.content || "", { removeH2Title: true })
        // The canonical map link is rendered below from the authoritative coordinates.
        // Remove legacy links embedded in imported location descriptions to avoid duplicates.
        .replace(/\[Click HERE for a Live Google Map\](?:\([^)]*\))?/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } else {
      desc = "*(No detailed historical database entry found)*";
    }
    stmt.free();

    const formattedText =
      `# Bible Location Study: ${bestMatch}\n\n` +
      `**Coordinates**: Latitude \`${lat}\`, Longitude \`${lon}\`\n` +
      `**Map Link**: [Click HERE for a Live Google Map](${mapUrl})\n\n` +
      `### Historical & Archaeological Description\n\n` +
      desc;

    const locResult: LocationResult = {
      name: bestMatch,
      code,
      latitude: lat,
      longitude: lon,
      googleMapUrl: mapUrl,
      description: desc
    };

    return { location: bestMatch, formattedText, result: locResult };
  } catch (err: any) {
    return { error: `Location query error: ${err.message}` };
  }
}
