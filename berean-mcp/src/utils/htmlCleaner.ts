/**
 * HTML to clean Markdown converter for Berean dataset entries.
 */

import { decodeHtmlEntities } from "./fuzzyMatch.js";

export function htmlTableToMarkdown(html: string): string {
  return html.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rowParts = tableContent.split(/<tr\b[^>]*>/i).slice(1);
    const rows: string[][] = [];

    for (const rowData of rowParts) {
      const cellMatches = [...rowData.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
      const cells = cellMatches.map((m) =>
        m[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      );
      if (cells.some((c) => c.length > 0)) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return "";

    const colCount = Math.max(...rows.map((r) => r.length));
    if (colCount === 1) {
      return "\n\n" + rows.map((r) => r[0]).join("\n\n") + "\n\n";
    }

    const paddedRows = rows.map((r) => {
      while (r.length < colCount) r.push("");
      return r;
    });

    const header = "| " + paddedRows[0].join(" | ") + " |";
    const divider = "| " + Array(colCount).fill("---").join(" | ") + " |";
    const body = paddedRows.slice(1).map((r) => "| " + r.join(" | ") + " |");

    return "\n\n" + [header, divider, ...body].join("\n") + "\n\n";
  });
}

export function cleanHtmlToMarkdown(html: string, options: { removeH2Title?: boolean } = {}): string {
  if (!html) return "";

  let t = html;

  // 1. Strip script and style blocks
  t = t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  t = t.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  t = t.replace(/<hide\b[^<]*(?:(?!<\/hide>)<[^<]*)*<\/hide>/gi, "");

  // 2. Convert tables
  t = htmlTableToMarkdown(t);

  // 3. Handle H2 titles
  if (options.removeH2Title) {
    t = t.replace(/<h2\b[^>]*>.*?<\/h2>/gi, "");
  } else {
    t = t.replace(/<h2\b[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  }

  // 4. Handle section headers (font color="brown" in characters / locations)
  t = t.replace(/<font color="brown"><b>(.*?)<\/b><\/font>/gi, "\n\n### $1\n\n");

  // 5. Convert lists
  t = t.replace(/<li\b[^>]*>/gi, "\n- ");
  t = t.replace(/<\/li>/gi, "");
  t = t.replace(/<\/?ul\b[^>]*>/gi, "\n");

  // 6. Strip <ref ...> tags but keep text
  t = t.replace(/<ref\s+onclick="[^"]+">(.*?)<\/ref>/gi, "$1");
  t = t.replace(/<ref\s+onclick='[^']+']'>(.*?)<\/ref>/gi, "$1");
  t = t.replace(/<ref[^>]*>(.*?)<\/ref>/gi, "$1");

  // 7. Bold and italics
  t = t.replace(/<\/?(?:b|strong)>/gi, "**");
  t = t.replace(/<\/?(?:i|em)>/gi, "*");

  // 8. Block tags to newlines
  t = t.replace(/<\/?div\b[^>]*>/gi, "\n");
  t = t.replace(/<\/?p\b[^>]*>/gi, "\n\n");
  t = t.replace(/<br\s*\/?>/gi, "\n");
  t = t.replace(/<hr\s*\/?>/gi, "\n---\n");

  // 9. Strip any other HTML tags
  t = t.replace(/<[^>]+>/g, "");

  // 10. Decode entities
  t = decodeHtmlEntities(t);

  // 11. Normalize multiple newlines
  t = t
    .split("\n")
    .map((l) => l.trim())
    .filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n")
    .trim();

  return t;
}
