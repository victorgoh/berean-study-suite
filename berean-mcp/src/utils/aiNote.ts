/**
 * Study packs carry a short suggestion for AI assistants (which persona to use
 * and what to write). It belongs in MCP responses only: readers of the Explorer
 * and REST clients should not see "Use this data pack with the ... persona".
 * Services return it as `aiNote`; src/mcp/output.ts appends it for MCP.
 */
export function aiNoteFrom(markdownTip: string): string {
  return markdownTip
    .replace(/^>\s*\[!TIP\]\s*\n?/i, "")
    .replace(/^>\s?/gm, "")
    .trim();
}
