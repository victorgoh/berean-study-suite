import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "../src/mcp/server.js";
import { Env } from "../src/types.js";
import { createLocalEnv } from "./lib/localEnv.js";

async function main() {
  const env: Env = createLocalEnv({
    MCP_PROFILE: process.env.MCP_PROFILE === "human" ? "human" : undefined
  });

  const server = createMcpServer(env);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error running Berean MCP stdio server:", err);
  process.exit(1);
});
