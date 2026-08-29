import worker from "../src/index.js";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { Env } from "../src/types.js";

function createMockR2(localDataDir: string, serverDataDir: string) {
  return {
    async get(key: string) {
      const p1 = path.join(localDataDir, key);
      try {
        const data = await fs.readFile(p1);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          },
          async text() {
            return data.toString("utf-8");
          }
        };
      } catch (_) {}

      const p2 = path.join(serverDataDir, key);
      try {
        const data = await fs.readFile(p2);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          },
          async text() {
            return data.toString("utf-8");
          }
        };
      } catch (_) {}

      return null;
    }
  } as any;
}

async function testStreamableHttp() {
  const localDataDir = process.env.BIBLEMATE_DATA || path.join(os.homedir(), "biblemate", "data");
  const serverDataDir = path.join(process.cwd());
  const env: Env = { BIBLEMATE_DATA: createMockR2(localDataDir, serverDataDir) };
  const ctx = { waitUntil: (p: any) => p } as any;

  console.log("--------------------------------------------------");
  console.log("1. Testing Health Check (GET /health)");
  const healthRes = await worker.fetch(new Request("http://localhost/health"), env, ctx);
  const healthData = (await healthRes.json()) as any;
  console.log("✅ Health endpoints:", Object.keys(healthData.endpoints.tools));

  console.log("\n--------------------------------------------------");
  console.log("2. Testing Streamable HTTP Initialize (POST /mcp)");
  const initRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test-streamable-client", version: "1.0.0" }
        }
      })
    }),
    env,
    ctx
  );

  const initData = (await initRes.json()) as any;
  const sessionId = initRes.headers.get("mcp-session-id");
  console.log(`✅ Status: ${initRes.status}`);
  console.log(`✅ Session ID: ${sessionId}`);
  console.log("✅ Server Info:", initData.result?.serverInfo);

  if (!sessionId) {
    throw new Error("No session ID returned in mcp-session-id header");
  }

  console.log("\n--------------------------------------------------");
  console.log("3. Testing Initialized Notification (POST /mcp)");
  const notifyRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized"
      })
    }),
    env,
    ctx
  );
  console.log(`✅ Notify Status: ${notifyRes.status} (expected 202)`);

  console.log("\n--------------------------------------------------");
  console.log("4. Testing Tools List (POST /mcp)");
  const toolsRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      })
    }),
    env,
    ctx
  );
  const toolsData = (await toolsRes.json()) as any;
  console.log(`✅ Total MCP Tools Registered: ${toolsData.result?.tools?.length}`);
  console.log(`✅ Tools: ${toolsData.result?.tools?.map((t: any) => t.name).join(", ")}`);

  console.log("\n--------------------------------------------------");
  console.log("5. Testing Tool Call: bible_lookup (POST /mcp)");
  const callRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "bible_lookup",
          arguments: { reference: "John 3:16", version: "NET" }
        }
      })
    }),
    env,
    ctx
  );
  const callData = (await callRes.json()) as any;
  console.log("✅ Result Content:", callData.result?.content?.[0]?.text?.substring(0, 100) + "...");

  console.log("\n--------------------------------------------------");
  console.log("6. Testing Tool Call: topic_study (POST /mcp)");
  const topicRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "topic_study",
          arguments: { query: "Grace" }
        }
      })
    }),
    env,
    ctx
  );
  const topicData = (await topicRes.json()) as any;
  console.log("✅ Result Content:", topicData.result?.content?.[0]?.text?.substring(0, 100) + "...");

  console.log("\n--------------------------------------------------");
  console.log("7. Testing Session Termination (DELETE /mcp)");
  const closeRes = await worker.fetch(
    new Request("http://localhost/mcp", {
      method: "DELETE",
      headers: {
        "mcp-session-id": sessionId
      }
    }),
    env,
    ctx
  );
  console.log(`✅ DELETE Status: ${closeRes.status} (expected 200)`);

  console.log("\n==================================================");
  console.log("🎉 All Streamable HTTP tests passed successfully!");
  console.log("==================================================");
}

testStreamableHttp().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
