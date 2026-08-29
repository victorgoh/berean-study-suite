import { getDatabase, getJsonFromR2 } from "../db/sqliteEngine.js";
import { cleanHtmlToMarkdown } from "../utils/htmlCleaner.js";
import { findBestMatch } from "../utils/fuzzyMatch.js";
import { Env, CharacterResult } from "../types.js";

function getRelationshipTree(peopleDb: any, code: string, name: string): string {
  if (!code.startsWith("BP")) return "";
  const personId = parseInt(code.slice(2), 10);
  if (isNaN(personId)) return "";

  try {
    const pStmt = peopleDb.prepare("SELECT DISTINCT Name, Sex FROM PEOPLE WHERE PersonID = ? LIMIT 1");
    pStmt.bind([personId]);
    if (!pStmt.step()) {
      pStmt.free();
      return "";
    }
    const pRow = pStmt.getAsObject() as { Name: string; Sex: string };
    pStmt.free();

    const mainName = pRow.Name || name;
    const mainSex = pRow.Sex || "M";

    // Direct relations
    const rStmt = peopleDb.prepare(
      "SELECT RelatedPersonID, Relationship FROM PEOPLERELATIONSHIP WHERE PersonID = ? AND Relationship != '[Reference]'"
    );
    rStmt.bind([personId]);

    const relations: any[] = [];
    while (rStmt.step()) {
      relations.push(rStmt.getAsObject());
    }
    rStmt.free();

    if (relations.length === 0) return "";

    const categories: Record<string, string[]> = {
      Parents: [],
      Spouse: [],
      Siblings: [],
      Children: [],
      Others: []
    };

    for (const r of relations) {
      const pid = r.RelatedPersonID;
      const relLabel = (r.Relationship || "").toLowerCase();

      const nameStmt = peopleDb.prepare("SELECT DISTINCT Name, Sex FROM PEOPLE WHERE PersonID = ? LIMIT 1");
      nameStmt.bind([pid]);
      let rName = `Person ${pid}`;
      let rSex = "";
      if (nameStmt.step()) {
        const nr = nameStmt.getAsObject() as { Name: string; Sex: string };
        rName = nr.Name;
        rSex = nr.Sex;
      }
      nameStmt.free();

      const line = `${r.Relationship || "Related"}: ${rName} (${rSex}, Code: \`BP${pid}\`)`;

      if (relLabel.includes("father") || relLabel.includes("mother")) {
        categories.Parents.push(line);
      } else if (relLabel.includes("wife") || relLabel.includes("husband") || relLabel.includes("spouse")) {
        categories.Spouse.push(line);
      } else if (relLabel.includes("brother") || relLabel.includes("sister")) {
        categories.Siblings.push(line);
      } else if (relLabel.includes("son") || relLabel.includes("daughter") || relLabel.includes("child")) {
        categories.Children.push(line);
      } else {
        categories.Others.push(line);
      }
    }

    const treeLines: string[] = [];
    treeLines.push("\n### Family & Relationship Tree\n```");
    treeLines.push(`${mainName} (${mainSex}, Code: \`BP${personId}\`)`);

    const nonEmpties = Object.entries(categories).filter(([_, list]) => list.length > 0);
    nonEmpties.forEach(([catName, members], cIdx) => {
      const isLastCat = cIdx === nonEmpties.length - 1;
      const catPrefix = isLastCat ? "└── " : "├── ";
      treeLines.push(`${catPrefix}${catName}`);

      const childIndent = isLastCat ? "    " : "│   ";
      members.forEach((m, mIdx) => {
        const isLastMem = mIdx === members.length - 1;
        const memPrefix = isLastMem ? "└── " : "├── ";
        treeLines.push(`${childIndent}${memPrefix}${m}`);
      });
    });

    treeLines.push("```\n");
    return treeLines.join("\n");
  } catch (_) {
    return "";
  }
}

export async function lookupCharacter(
  env: Env,
  nameQuery: string
): Promise<{ error?: string; formattedText?: string; character?: string; results?: CharacterResult[] }> {
  const index = await getJsonFromR2<Record<string, string[]>>(env, "data/lookup/exlbp_index.json");
  if (!index) {
    return { error: "Character lookup index (exlbp_index.json) not available in R2." };
  }

  const bestMatch = findBestMatch(nameQuery, Object.keys(index));
  if (!bestMatch) {
    return { error: `Could not locate a matching Bible character for '${nameQuery}'.` };
  }

  const codes = index[bestMatch];
  if (!codes || codes.length === 0) {
    return { error: `No character code records found for '${bestMatch}'.` };
  }

  const { db, error: dbError } = await getDatabase(env, "data/exlb3.data");
  if (!db) {
    return { error: dbError || "Character database (exlb3.data) not found in R2." };
  }

  const { db: peopleDb } = await getDatabase(env, "data/biblePeople.data");

  const results: CharacterResult[] = [];
  const mdParts: string[] = [];

  try {
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const stmt = db.prepare("SELECT content FROM exlbp WHERE path = ? LIMIT 1");
      stmt.bind([code]);

      let entryMd = "";
      if (stmt.step()) {
        const row = stmt.getAsObject() as { content: string };
        entryMd = cleanHtmlToMarkdown(row.content || "", { removeH2Title: true });
      } else {
        entryMd = `*(No database record content found for \`${code}\`)*`;
      }
      stmt.free();

      let treeMd = "";
      if (peopleDb) {
        treeMd = getRelationshipTree(peopleDb, code, bestMatch);
      }

      results.push({ name: bestMatch, code, content: entryMd, familyTree: treeMd });

      if (codes.length > 1) {
        mdParts.push(`\n## Individual ${i + 1} (Code: \`${code}\`)\n`);
      } else {
        mdParts.push(`\n**Entry Code**: \`${code}\`\n`);
      }

      mdParts.push(entryMd);
      if (treeMd) {
        mdParts.push(treeMd);
      }
    }

    const formattedText = `# Bible Character Study: ${bestMatch}\n\n` + mdParts.join("\n\n");
    return { character: bestMatch, formattedText, results };
  } catch (err: any) {
    return { error: `Character study query error: ${err.message}` };
  }
}
