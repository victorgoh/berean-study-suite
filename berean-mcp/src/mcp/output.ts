/**
 * MCP response policy. The Explorer and REST handlers continue to use the
 * service's full Markdown output; this policy applies only at the MCP tool
 * boundary.
 */
export type McpOutputMode = "compact" | "standard" | "full";

const MAX_CHARS: Record<McpOutputMode, number> = {
  compact: 12000,
  standard: 32000,
  full: 100000
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function trimForStructured(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const copy = { ...value };
  delete copy.formattedText;
  // Composite services keep a second, section-keyed Markdown representation.
  // It is useful to the Explorer but defeats compact MCP output.
  delete copy.sections;
  return copy;
}

function getMode(input: unknown): McpOutputMode {
  if (isRecord(input) && (input.output_mode === "standard" || input.output_mode === "full")) {
    return input.output_mode;
  }
  return "compact";
}

export function normalizeMcpToolResult(result: unknown, input: unknown): Record<string, unknown> {
  if (!isRecord(result)) {
    return { content: [{ type: "text", text: JSON.stringify(result ?? null) }] };
  }

  if (result.isError) return result;

  const mode = getMode(input);
  const structured = trimForStructured(result);
  const rawText = typeof result.formattedText === "string"
    ? result.formattedText
    : typeof result.text === "string" ? result.text : JSON.stringify(structured);
  const maxChars = MAX_CHARS[mode];
  if (rawText.length > maxChars) {
    const message = `The requested resource is too large for ${mode} MCP output (${rawText.length} characters; maximum ${maxChars}).`;
    return {
      isError: true,
      structuredContent: {
        error: {
          code: "RESOURCE_TOO_LARGE",
          message: "The resource is available but was not returned because the complete response exceeds the MCP output limit."
        },
        resource: {
          character_count: rawText.length,
          maximum_characters: maxChars,
          output_mode: mode
        },
        alternatives: [
          "Use the human Explorer for the complete article or Study Pack.",
          "Request a narrower standalone resource."
        ]
      },
      content: [{ type: "text", text: message }]
    };
  }

  const text = rawText;

  const structuredResult = {
    ...(isRecord(structured) ? structured : { value: structured }),
    output_mode: mode,
    metadata: {
      ...(isRecord(result.metadata) ? result.metadata : {}),
      output_mode: mode,
      character_count: text.length,
      truncated: false
    }
  };

  return {
    structuredContent: structuredResult,
    // MCP recommends serialized structured content in a text block for
    // backwards compatibility with clients that do not read structuredContent.
    content: [{ type: "text", text: mode === "compact" ? JSON.stringify(structuredResult) : text }]
  };
}
