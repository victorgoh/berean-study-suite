import assert from "node:assert/strict";
import worker from "../src/index.js";
import { toolCallsInJsonRpc, toolCost } from "../src/rateLimit.js";
import { Env } from "../src/types.js";
import { createLocalEnv } from "./lib/localEnv.js";


const MCP_HEADERS = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };

/** In-memory stand-in for a Workers RateLimit binding. */
function fakeLimiter(limit: number) {
  const counts = new Map<string, number>();
  return {
    calls: 0,
    async limit({ key }: { key: string }) {
      this.calls++;
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return { success: n <= limit };
    }
  };
}

async function testStreamableHttp() {
  const baseEnv: Env = createLocalEnv();
  const ctx = { waitUntil: (p: any) => p } as any;

  const call = (env: Env, pathname: string, init?: RequestInit) =>
    worker.fetch(new Request(`http://localhost${pathname}`, init), env, ctx);
  const rpc = (env: Env, id: number | null, method: string, params?: unknown, headers: Record<string, string> = {}) =>
    call(env, "/mcp", {
      method: "POST",
      headers: { ...MCP_HEADERS, ...headers },
      body: JSON.stringify({ jsonrpc: "2.0", ...(id === null ? {} : { id }), method, params })
    });

  console.log("1. Health check responds");
  assert.equal((await call(baseEnv, "/health")).status, 200);

  console.log("2. initialize works and issues no session id (stateless)");
  const initRes = await rpc(baseEnv, 1, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "test-streamable-client", version: "1.0.0" }
  });
  assert.equal(initRes.status, 200);
  assert.equal(initRes.headers.get("mcp-session-id"), null);
  assert.equal(((await initRes.json()) as any).result.serverInfo.name, "berean-mcp");

  console.log("3. notifications/initialized is accepted (202)");
  assert.equal((await rpc(baseEnv, null, "notifications/initialized")).status, 202);

  console.log("4. tools/list works without a prior initialize on this isolate");
  const tools = (await (await rpc(baseEnv, 2, "tools/list")).json()) as any;
  assert.ok(tools.result.tools.length > 0);

  console.log("5. A session id from another isolate no longer fails with 'Server not initialized'");
  const stale = await rpc(baseEnv, 3, "tools/list", undefined, { "mcp-session-id": "00000000-0000-0000-0000-000000000000" });
  assert.equal(stale.status, 200, await stale.clone().text());

  console.log("6. Burst of 10 concurrent tools/call requests all succeed");
  const burst = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      rpc(baseEnv, 100 + i, "tools/call", { name: "bible_lookup", arguments: { reference: "John 3:16", version: "KJV" } })
    )
  );
  for (const res of burst) {
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.ok(!data.error, JSON.stringify(data.error));
    assert.match(JSON.stringify(data.result.content), /God so loved/i);
  }

  console.log("7. GET /mcp: plain GET gets status JSON, SSE or session GET gets 405");
  assert.equal((await call(baseEnv, "/mcp", { headers: { Accept: "application/json" } })).status, 200);
  assert.equal((await call(baseEnv, "/mcp", { headers: { Accept: "text/event-stream" } })).status, 405);
  assert.equal((await call(baseEnv, "/mcp", { headers: { Accept: "text/event-stream", "mcp-session-id": "x" } })).status, 405);

  console.log("8. DELETE /mcp returns 405; malformed JSON returns a JSON-RPC parse error");
  assert.equal((await call(baseEnv, "/mcp", { method: "DELETE" })).status, 405);
  const parseErr = await call(baseEnv, "/mcp", { method: "POST", headers: MCP_HEADERS, body: "{nope" });
  assert.equal(parseErr.status, 400);
  assert.equal(((await parseErr.json()) as any).error.code, -32700);

  console.log("9. Tool-call detection and cost classification");
  assert.deepEqual(toolCallsInJsonRpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }), []);
  assert.deepEqual(toolCallsInJsonRpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "bible_lookup" } }), ["bible_lookup"]);
  assert.deepEqual(
    toolCallsInJsonRpc([
      { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "commentary_lookup" } },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/call" }
    ]),
    ["commentary_lookup", "unknown"]
  );
  assert.equal(toolCost("bible_lookup"), "standard");
  assert.equal(toolCost("commentary_lookup"), "expensive");
  assert.equal(toolCost("sermon_study_pack"), "expensive");

  console.log("10. MCP handshake messages do not consume the tool-call budget");
  const standard = fakeLimiter(3);
  const expensive = fakeLimiter(3);
  const burstLimiter = fakeLimiter(1000);
  const limitedEnv = { ...baseEnv, MCP_RATE_LIMITER: standard, MCP_EXPENSIVE_LIMITER: expensive, MCP_BURST_LIMITER: burstLimiter } as unknown as Env;
  for (let i = 0; i < 20; i++) {
    assert.equal((await rpc(limitedEnv, i, i % 2 ? "tools/list" : "ping")).status, 200);
  }
  assert.equal(standard.calls + expensive.calls, 0);
  assert.equal(burstLimiter.calls, 20);

  console.log("11. Tool calls are metered and the 4th gets a JSON-RPC 429 with Retry-After");
  for (let i = 0; i < 3; i++) {
    const ok = await rpc(limitedEnv, 200 + i, "tools/call", { name: "bible_lookup", arguments: { reference: "John 1:1" } });
    assert.equal(ok.status, 200);
  }
  const limited = await rpc(limitedEnv, 299, "tools/call", { name: "bible_lookup", arguments: { reference: "John 1:1" } });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "60");
  const limitedBody = (await limited.json()) as any;
  assert.equal(limitedBody.jsonrpc, "2.0");
  assert.equal(limitedBody.id, 299);
  assert.ok(limitedBody.error.message.includes("Rate limit"));
  assert.equal(expensive.calls, 0, "bible_lookup must use the standard limiter");

  console.log("12. Burst limiter covers every API request, with a 10 s Retry-After");
  const tightBurst = { ...baseEnv, MCP_BURST_LIMITER: fakeLimiter(2) } as unknown as Env;
  assert.equal((await rpc(tightBurst, 1, "ping")).status, 200);
  assert.equal((await rpc(tightBurst, 2, "ping")).status, 200);
  const burstHit = await rpc(tightBurst, 3, "ping");
  assert.equal(burstHit.status, 429);
  assert.equal(burstHit.headers.get("Retry-After"), "10");

  console.log("13. REST tool routes are still metered by tool cost");
  const restStandard = fakeLimiter(1);
  const restEnv = { ...baseEnv, MCP_RATE_LIMITER: restStandard } as unknown as Env;
  const restBody = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: "John 3:16" }) };
  assert.equal((await call(restEnv, "/tools/bible_lookup", restBody)).status, 200);
  const restLimited = await call(restEnv, "/tools/bible_lookup", restBody);
  assert.equal(restLimited.status, 429);
  assert.equal(((await restLimited.json()) as any).error.code, "RATE_LIMITED");

  console.log("14. Optional API key: off by default, enforced on /mcp and /tools/* when API_KEY is set");
  const keyed = { ...baseEnv, API_KEY: "test-secret-123" } as unknown as Env;
  const ping = (headers: Record<string, string> = {}, query = "") =>
    call(keyed, `/mcp${query}`, {
      method: "POST",
      headers: { ...MCP_HEADERS, ...headers },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" })
    });
  const denied = await ping();
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("WWW-Authenticate") ?? "", /^Bearer/);
  assert.equal(((await denied.json()) as any).error.code, -32001);
  assert.equal((await ping({ Authorization: "Bearer wrong-key" })).status, 401);
  assert.equal((await ping({ Authorization: "Bearer test-secret-123" })).status, 200);
  assert.equal((await ping({ Authorization: "test-secret-123" })).status, 200);
  assert.equal((await ping({ "x-api-key": "test-secret-123" })).status, 200);
  assert.equal((await ping({}, "?key=test-secret-123")).status, 200);
  const restDenied = await call(keyed, "/tools/bible_lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: "John 3:16" }) });
  assert.equal(restDenied.status, 401);
  assert.equal(((await restDenied.json()) as any).error.code, "UNAUTHORIZED");
  const restAllowed = await call(keyed, "/tools/bible_lookup", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": "test-secret-123" }, body: JSON.stringify({ reference: "John 3:16" }) });
  assert.equal(restAllowed.status, 200);
  assert.equal((await call(keyed, "/health")).status, 200, "health stays public");
  assert.equal((await call({ ...baseEnv, API_KEY: "  " } as unknown as Env, "/mcp", { method: "POST", headers: MCP_HEADERS, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }) })).status, 200, "a blank API_KEY leaves the API public");

  console.log("\n🎉 All Streamable HTTP + rate-limit + API-key tests passed.");
}

testStreamableHttp().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
