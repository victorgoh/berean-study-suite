import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { BEREAN_PERSONAS, WORKFLOW_PROMPTS } from "./prompts.js";
import { RESOURCE_DEFINITIONS, getResourceContent } from "./resources.js";
import { OutputModeSchema } from "./tools.js";
import { normalizeMcpToolResult } from "./output.js";
import { mcpErrorFor, mcpToolsForProfile, type ServiceResult, type ToolDefinition } from "./toolRegistry.js";
import type { ServiceErrorCode } from "../services/errors.js";
import { Env } from "../types.js";
import { z } from "zod";

export { MCP_TOOL_COUNTS } from "./toolRegistry.js";

/**
 * Every Berean tool only reads reference data: no side effects, safe to repeat,
 * and no access to the outside world. Clients use these hints for permissions
 * and retries.
 */
const READ_ONLY_TOOL: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

/** What a client (usually an AI model) should do next for each failure category. */
const ERROR_HINTS: Record<ServiceErrorCode, string> = {
  REQUEST_FAILED: "Check the arguments (reference format, names, source keys) and try again.",
  RESOURCE_UNAVAILABLE: "Nothing matched. Try a different or broader query, another source, or a whole chapter.",
  DEPENDENCY_UNAVAILABLE: "Temporary data-storage problem on the server. Retry later.",
  INTERNAL_ERROR: "Unexpected server error. Retry later."
};

function mcpError(code: ServiceErrorCode, message: string): CallToolResult {
  return { isError: true, content: [{ type: "text", text: `Error (${code}): ${message}\n${ERROR_HINTS[code]}` }] };
}

/** Runs a registry tool and shapes its service result for MCP. */
async function runMcpTool(tool: ToolDefinition, env: Env, args: Record<string, unknown>): Promise<CallToolResult> {
  let result: ServiceResult;
  try {
    result = await tool.run(env, args, { surface: "mcp" });
  } catch (error) {
    console.error(`MCP tool '${tool.name}' failed:`, error);
    return mcpError("INTERNAL_ERROR", `${tool.title} failed due to an internal error.`);
  }
  const message = mcpErrorFor(tool, result);
  if (message) return mcpError(result.errorCode ?? "REQUEST_FAILED", message);
  return normalizeMcpToolResult(result, args) as CallToolResult;
}

/**
 * Sent to clients in the `initialize` result. MCP clients typically give this
 * to the model as guidance on how to use the server as a whole.
 */
export const SERVER_INSTRUCTIONS = [
  "Berean is a read-only Bible study server: Scripture texts, classic public-domain commentaries, Greek and Hebrew lexicons and morphology, Bible dictionaries, cross-references and background resources. It retrieves sources; it does not write interpretations.",
  "Quote Scripture only from bible_lookup (or a tool that returns verse text), never from memory, and give the translation, e.g. [John 3:16 (BSB)].",
  "Call get_available_resources first when you need a valid Bible version, commentary key or lexicon; commentary_lookup takes one commentary per call.",
  "For a word study, call morphology_lookup on the verse to get each word's Strong's number, then call lexicon_lookup with that number.",
  "Long results come in pages: when a response ends with 'Part 1 of N', call the tool again with the same arguments and page: 2. Use output_mode 'full' for larger pages.",
  "Errors begin with a code: REQUEST_FAILED (fix the arguments), RESOURCE_UNAVAILABLE (nothing matched; try another query or source), DEPENDENCY_UNAVAILABLE or INTERNAL_ERROR (retry later).",
  "Cite the source of each commentary, dictionary or lexicon you use."
].join("\n");

export function createMcpServer(env: Env) {
  const server = new McpServer(
    {
      name: "berean-mcp",
      version: "1.0.0"
    },
    { instructions: SERVER_INSTRUCTIONS }
  );

  // --- Register Tools (from the shared registry; study packs only in the human profile) ---
  // Every tool also accepts `output_mode` and `page`, which control response size and paging.
  for (const tool of mcpToolsForProfile(env.MCP_PROFILE)) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: { ...tool.schema, ...OutputModeSchema },
        annotations: { title: tool.title, ...READ_ONLY_TOOL }
      },
      (args) => runMcpTool(tool, env, args)
    );
  }

  // --- Register Prompts (15 Personas & Workflows) ---

  for (const persona of Object.values(BEREAN_PERSONAS)) {
    server.prompt(
      persona.name,
      persona.description,
      {
        topic: z.string().optional().describe("Specific passage or topic to address")
      },
      async ({ topic }) => {
        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: `${persona.instructions}\n\nUser request regarding: ${topic || "general biblical inquiry"}`
              }
            }
          ]
        };
      }
    );
  }

  for (const workflow of Object.values(WORKFLOW_PROMPTS)) {
    server.prompt(
      workflow.name,
      workflow.description,
      workflow.argsSchema,
      async (args: any) => {
        const customInstructions = (workflow as any).instructions;
        const promptBody = customInstructions
          ? `${customInstructions}\n\nUser Arguments: ${JSON.stringify(args || {})}`
          : `Execute workflow '${workflow.name}' with the following input:\n${JSON.stringify(args || {}, null, 2)}`;

        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: promptBody
              }
            }
          ]
        };
      }
    );
  }

  // --- Register Resources ---

  for (const res of RESOURCE_DEFINITIONS) {
    server.resource(
      res.name,
      res.uri,
      async (uri) => {
        const text = getResourceContent(uri.href) || "{}";
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: res.mimeType,
              text
            }
          ]
        };
      }
    );
  }

  return server;
}
