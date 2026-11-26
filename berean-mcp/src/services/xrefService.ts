import { getDatabase } from "../db/sqliteEngine.js";
import { parseReferenceString, formatReference } from "./bibleService.js";
import { Env } from "../types.js";
import { dependencyUnavailable, internalError, invalidRequest, notFound, type ServiceErrorFields } from "./errors.js";

interface TskRef {
  ref: string;
  /** Keyword that links a "Reciprocal" reference back to this verse. */
  note?: string;
}

/**
 * Parses the TSK entry HTML into keyword groups:
 * `<p><b>Come:</b> <ref ...>Isa 45:22-25</ref>, ...</p>`. In the "Reciprocal"
 * group each reference is followed by " - keyword".
 */
function parseTskGroups(html: string): { label: string; refs: TskRef[] }[] {
  const groups: { label: string; refs: TskRef[] }[] = [];
  for (const [, label, body] of html.matchAll(/<p><b>([^<]*?):?<\/b>([\s\S]*?)<\/p>/gi)) {
    const refs: TskRef[] = [];
    for (const [, ref, after] of body.matchAll(/<ref[^>]*>([^<]+)<\/ref>([^<]*)/gi)) {
      const note = after.replace(/^\s*-\s*/, "").replace(/[,\s]+$/, "").trim();
      refs.push(note && /^\s*-/.test(after) ? { ref: ref.trim(), note } : { ref: ref.trim() });
    }
    if (refs.length > 0) groups.push({ label: label.trim().replace(/:$/, ""), refs });
  }
  return groups;
}

export async function lookupCrossReferences(
  env: Env,
  reference: string,
  limit: number = 15
): Promise<ServiceErrorFields & { references?: string[]; formattedText?: string }> {
  const parsed = parseReferenceString(reference);
  if (!parsed) {
    return invalidRequest(`Invalid verse reference for cross references: '${reference}'`);
  }

  const { db, error: dbError } = await getDatabase(env, "cross-reference.sqlite");
  if (!db) {
    return dependencyUnavailable(dbError || "Cross-reference database (cross-reference.sqlite) not found in R2.");
  }

  try {
    const stmt = db.prepare("SELECT Information FROM TSKe WHERE Book = ? AND Chapter = ? AND Verse = ? LIMIT 1");
    stmt.bind([parsed.bookNumber, parsed.chapterStart, parsed.verseStart]);

    if (!stmt.step()) {
      stmt.free();
      return notFound(`No cross references found for ${parsed.bookName} ${parsed.chapterStart}:${parsed.verseStart}`);
    }

    const row = stmt.getAsObject() as { Information: string };
    stmt.free();

    const groups = parseTskGroups(row.Information || "");
    const total = groups.reduce((n, g) => n + g.refs.length, 0);
    const max = Math.max(1, Math.floor(limit));

    // Keep TSK's order (keyword groups first, "Reciprocal" last) and stop at the limit.
    const lines: string[] = [];
    const references: string[] = [];
    for (const group of groups) {
      if (references.length >= max) break;
      const shown = group.refs.slice(0, max - references.length);
      references.push(...shown.map((r) => r.ref));
      const items = shown.map((r) => (r.note ? `${r.ref} (${r.note})` : r.ref));
      lines.push(`• **${group.label}:** ${items.join(", ")}`);
    }
    if (references.length < total) {
      lines.push(`\n*Showing ${references.length} of ${total} references.*`);
    }

    return {
      references,
      formattedText: `# Cross References: ${formatReference(parsed)} (TSK)\n\n${lines.join("\n")}`
    };
  } catch (err: any) {
    return internalError("Cross reference lookup", err);
  }
}
