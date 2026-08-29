import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "../src/mcp/server.js";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { Env } from "../src/types.js";

// Mock R2 for local filesystem testing
function createLocalR2(localDataDir: string) {
  return {
    async get(key: string) {
      const fullPath = path.join(localDataDir, key);
      try {
        const data = await fs.readFile(fullPath);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          }
        };
      } catch (e) {
        return null;
      }
    }
  } as any;
}

async function main() {
  const localDataDir = process.env.BIBLEMATE_DATA || path.join(os.homedir(), "biblemate", "data");
  const env: Env = {
    BIBLEMATE_DATA: createLocalR2(localDataDir)
  };

  const server = createMcpServer(env);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error running Berean MCP stdio server:", err);
  process.exit(1);
});
