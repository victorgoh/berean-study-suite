import { getDatabase } from "../db/sqliteEngine.js";
import { Env } from "../types.js";

export interface DisambiguatedEntity {
  id?: number;
  name: string;
  disambiguation_key: string;
  entity_type: string;
  strongs?: string;
  original_lemma?: string;
  role_era: string;
  relationships?: string;
  key_passages: string;
  summary: string;
}

export interface BiblicalUnit {
  id?: number;
  unit_name: string;
  category: string;
  testament: string;
  hebrew_greek: string;
  standard_ratio: string;
  metric_equivalent: string;
  imperial_equivalent: string;
  purchasing_power_context: string;
}

/**
 * Look up and disambiguate biblical individuals or places sharing identical names.
 */
export async function lookupEntityDisambiguation(
  env: Env,
  name: string
): Promise<{
  error?: string;
  formattedText?: string;
  entities?: DisambiguatedEntity[];
}> {
  const cleanName = name.trim();
  if (!cleanName) {
    return { error: "Entity name parameter is required." };
  }

  let entities: DisambiguatedEntity[] = [];

  // 1. Try Cloudflare D1
  if (env.REFERENCE_DB) {
    try {
      const stmt = env.REFERENCE_DB.prepare(
        `SELECT id, name, disambiguation_key, entity_type, strongs, original_lemma, role_era, relationships, key_passages, summary
         FROM entities
         WHERE name LIKE ? OR disambiguation_key LIKE ?`
      ).bind(`%${cleanName}%`, `%${cleanName}%`);
      const { results } = await stmt.all<DisambiguatedEntity>();
      if (results && results.length > 0) {
        entities = results;
      }
    } catch (d1Err: any) {
      console.warn("D1 entities query failed, falling back to SQLite:", d1Err.message);
    }
  }

  // 2. SQLite fallback
  if (entities.length === 0) {
    const { db } = await getDatabase(env, "entities_units.sqlite");
    if (db) {
      try {
        const stmt = db.prepare(
          `SELECT id, name, disambiguation_key, entity_type, strongs, original_lemma, role_era, relationships, key_passages, summary
           FROM entities
           WHERE name LIKE ? OR disambiguation_key LIKE ?`
        );
        stmt.bind([`%${cleanName}%`, `%${cleanName}%`]);
        while (stmt.step()) {
          entities.push(stmt.getAsObject() as unknown as DisambiguatedEntity);
        }
        stmt.free();
      } catch (dbErr: any) {
        console.warn("SQLite entities query error:", dbErr.message);
      }
    }
  }

  if (entities.length === 0) {
    return {
      error: `No disambiguated entities found for '${cleanName}'.`,
      formattedText: `# Entity Disambiguation: ${cleanName}\n\n*No specific disambiguation records found for '${cleanName}'.*`
    };
  }

  const markdownLines: string[] = [];
  markdownLines.push(`# Biblical Entity Disambiguation: "${cleanName}" (${entities.length} Distinct Figures Found)\n`);

  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    markdownLines.push(`### ${i + 1}. ${e.disambiguation_key.replace(/_/g, " ")}`);
    markdownLines.push(`* **Type / Era:** ${e.entity_type} — *${e.role_era}*`);
    if (e.original_lemma) markdownLines.push(`* **Original Lemma:** ${e.original_lemma} (${e.strongs || "—"})`);
    if (e.relationships) markdownLines.push(`* **Lineage & Relationships:** ${e.relationships}`);
    markdownLines.push(`* **Key Biblical Passages:** \`${e.key_passages}\``);
    markdownLines.push(`* **Biographical Overview:** ${e.summary}`);
    markdownLines.push("");
  }

  return {
    formattedText: markdownLines.join("\n"),
    entities
  };
}

/**
 * Convert biblical weights, liquid/dry measures, lengths, and currencies into modern equivalents.
 */
export async function convertAncientUnits(
  env: Env,
  unitName: string,
  amount: number = 1
): Promise<{
  error?: string;
  formattedText?: string;
  units?: BiblicalUnit[];
}> {
  const cleanUnit = unitName.trim();
  if (!cleanUnit) {
    return { error: "Unit name parameter is required." };
  }

  let units: BiblicalUnit[] = [];

  // 1. Try Cloudflare D1
  if (env.REFERENCE_DB) {
    try {
      const stmt = env.REFERENCE_DB.prepare(
        `SELECT id, unit_name, category, testament, hebrew_greek, standard_ratio, metric_equivalent, imperial_equivalent, purchasing_power_context
         FROM units
         WHERE unit_name LIKE ? OR category LIKE ?`
      ).bind(`%${cleanUnit}%`, `%${cleanUnit}%`);
      const { results } = await stmt.all<BiblicalUnit>();
      if (results && results.length > 0) {
        units = results;
      }
    } catch (d1Err: any) {
      console.warn("D1 units query failed, falling back to SQLite:", d1Err.message);
    }
  }

  // 2. SQLite fallback
  if (units.length === 0) {
    const { db } = await getDatabase(env, "entities_units.sqlite");
    if (db) {
      try {
        const stmt = db.prepare(
          `SELECT id, unit_name, category, testament, hebrew_greek, standard_ratio, metric_equivalent, imperial_equivalent, purchasing_power_context
           FROM units
           WHERE unit_name LIKE ? OR category LIKE ?`
        );
        stmt.bind([`%${cleanUnit}%`, `%${cleanUnit}%`]);
        while (stmt.step()) {
          units.push(stmt.getAsObject() as unknown as BiblicalUnit);
        }
        stmt.free();
      } catch (dbErr: any) {
        console.warn("SQLite units query error:", dbErr.message);
      }
    }
  }

  if (units.length === 0) {
    return {
      error: `No biblical units found matching '${cleanUnit}'.`,
      formattedText: `# Biblical Unit Converter: ${cleanUnit}\n\n*No biblical weights, measures, or currency units found for '${cleanUnit}'.*`
    };
  }

  const markdownLines: string[] = [];
  markdownLines.push(`# Biblical Metrology & Unit Converter: ${amount > 1 ? `${amount} ` : ""}${cleanUnit}\n`);

  for (const u of units) {
    markdownLines.push(`### **${u.unit_name}** (${u.category} • *${u.testament}*)`);
    markdownLines.push(`* **Hebrew/Greek Term:** ${u.hebrew_greek}`);
    markdownLines.push(`* **Ancient Ratio:** ${u.standard_ratio}`);
    markdownLines.push(`* **Modern Metric Equivalent:** **${amount > 1 ? `${amount} × ` : ""}${u.metric_equivalent}**`);
    markdownLines.push(`* **Modern US Imperial Equivalent:** **${amount > 1 ? `${amount} × ` : ""}${u.imperial_equivalent}**`);
    markdownLines.push(`* **Historical & Purchasing Power Context:** ${u.purchasing_power_context}`);
    markdownLines.push("");
  }

  return {
    formattedText: markdownLines.join("\n"),
    units
  };
}
