/**
 * MCP response policy. The Explorer and REST handlers keep the service's full
 * Markdown output; this policy applies only at the MCP tool boundary.
 *
 * Each output_mode sets a character budget for one response. A result that
 * does not fit is never refused: it is split into pages at paragraph
 * boundaries, the requested page is returned, and a footer tells the client
 * how to fetch the next one (same arguments plus `page`).
 */
export type McpOutputMode = "compact" | "standard" | "full";

const MAX_CHARS: Record<McpOutputMode, number> = {
  compact: 12000,
  standard: 32000,
  full: 100000
};

/** Room kept free on every page for the continuation footer. */
const FOOTER_RESERVE = 400;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function trimForStructured(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const copy = { ...value };
  delete copy.formattedText;
  // Composite services keep a second, section-keyed Markdown representation.
  // It is useful to the Explorer but duplicates the text for MCP clients.
  delete copy.sections;
  // Appended to the MCP text instead (see appendAiNote).
  delete copy.aiNote;
  return copy;
}

function getMode(input: unknown): McpOutputMode {
  if (isRecord(input) && (input.output_mode === "standard" || input.output_mode === "full")) {
    return input.output_mode;
  }
  return "compact";
}

function getPage(input: unknown): number {
  const page = isRecord(input) ? Number(input.page) : NaN;
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function hasData(structured: unknown): boolean {
  return isRecord(structured)
    ? Object.entries(structured).some(([key, value]) => key !== "metadata" && value !== undefined)
    : structured !== undefined;
}

/**
 * Splits text into pages of at most `size` characters, preferring paragraph
 * breaks, then line breaks, and only cutting mid-line when a single line is
 * longer than a page. Deterministic, so page N is stable across calls.
 */
export function paginateText(text: string, size: number): string[] {
  const pages: string[] = [];
  let rest = text;
  while (rest.length > size) {
    const window = rest.slice(0, size);
    let cut = window.lastIndexOf("\n\n");
    if (cut < size / 2) cut = window.lastIndexOf("\n");
    if (cut < size / 2) cut = size;
    pages.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).replace(/^\n+/, "");
  }
  if (rest.length > 0 || pages.length === 0) pages.push(rest);
  return pages;
}

function continuationFooter(page: number, total: number, mode: McpOutputMode): string {
  const parts = [`Part ${page} of ${total} of this result.`];
  if (page < total) {
    parts.push(`To continue, call this tool again with the same arguments and page: ${page + 1}.`);
    if (mode !== "full") parts.push(`Use output_mode "full" for larger pages.`);
  }
  return `\n\n---\n*${parts.join(" ")}*`;
}

export function normalizeMcpToolResult(result: unknown, input: unknown): Record<string, unknown> {
  if (!isRecord(result)) {
    return { content: [{ type: "text", text: JSON.stringify(result ?? null) }] };
  }
  if (result.isError) return result;

  const mode = getMode(input);
  const budget = MAX_CHARS[mode];
  const structured = trimForStructured(result);
  const baseText =
    typeof result.formattedText === "string"
      ? result.formattedText
      : typeof result.text === "string"
        ? result.text
        : JSON.stringify(structured);
  // Study packs carry a suggestion meant only for AI assistants (src/utils/aiNote.ts).
  const text =
    typeof result.aiNote === "string" && result.aiNote
      ? `${baseText.trimEnd()}\n\n> **Note for AI assistants:** ${result.aiNote}`
      : baseText;

  // Long result: return one page of text. Structured data is left out because
  // it usually repeats the same content and would blow the budget.
  if (text.length > budget) {
    const pages = paginateText(text, budget - FOOTER_RESERVE);
    const page = getPage(input);
    if (page > pages.length) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error (REQUEST_FAILED): page ${page} does not exist; this result has ${pages.length} page(s) in ${mode} mode.`
          }
        ]
      };
    }
    return { content: [{ type: "text", text: pages[page - 1] + continuationFooter(page, pages.length, mode) }] };
  }

  // Some MCP clients (including Claude's apps) show the model structuredContent
  // instead of the text block whenever it is present. If a service returned
  // nothing but Markdown, or the structured copy would push the response over
  // budget, send the text alone.
  const structuredSize = hasData(structured) ? JSON.stringify(structured).length : 0;
  if (structuredSize === 0 || text.length + structuredSize > budget) {
    return { content: [{ type: "text", text }] };
  }

  return {
    structuredContent: {
      ...(isRecord(structured) ? structured : { value: structured }),
      output_mode: mode,
      metadata: {
        ...(isRecord(result.metadata) ? result.metadata : {}),
        output_mode: mode,
        character_count: text.length,
        truncated: false
      }
    },
    // The text block always carries the readable Markdown. Output modes only set
    // the size budget; machine-readable fields travel in structuredContent.
    content: [{ type: "text", text }]
  };
}
