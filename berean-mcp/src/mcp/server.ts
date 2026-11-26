import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BEREAN_PERSONAS, WORKFLOW_PROMPTS } from "./prompts.js";
import { RESOURCE_DEFINITIONS, getResourceContent } from "./resources.js";
import { OutputModeSchema } from "./tools.js";
import { normalizeMcpToolResult } from "./output.js";
import { mcpErrorFor, mcpToolsForProfile, ToolDefinition } from "./toolRegistry.js";
import { Env } from "../types.js";
import { z } from "zod";

export { MCP_TOOL_COUNTS } from "./toolRegistry.js";

/** Runs a registry tool and shapes its service result for MCP. */
async function runMcpTool(tool: ToolDefinition, env: Env, args: Record<string, unknown>): Promise<CallToolResult> {
  const result = await tool.run(env, args, { surface: "mcp" });
  const error = mcpErrorFor(tool, result);
  if (error) {
    return { isError: true, content: [{ type: "text", text: `Error: ${error}` }] };
  }
  return normalizeMcpToolResult(result, args) as CallToolResult;
}

export function createMcpServer(env: Env) {
  const server = new McpServer({
    name: "berean-mcp",
    version: "1.0.0"
  });

  // --- Register Tools (from the shared registry; study packs only in the human profile) ---
  // Every tool also accepts `output_mode`, which sets the MCP response size budget.
  for (const tool of mcpToolsForProfile(env.MCP_PROFILE)) {
    server.tool(tool.name, tool.description, { ...tool.schema, ...OutputModeSchema }, (args) =>
      runMcpTool(tool, env, args)
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
