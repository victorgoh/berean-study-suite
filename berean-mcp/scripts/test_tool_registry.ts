/**
 * Tool registry regression tests: MCP registration, REST routing/validation,
 * error policy, output shape, and drift between the registry and the
 * hand-written OpenAPI spec / Explorer UI.
 *
 * Uses local data (see scripts/lib/localEnv.ts) for the few calls
 * that reach real services (bible_lookup, get_available_resources).
 */
import assert from "node:assert/strict";
import worker from "../src/index.js";
import {
  TOOLS,
  TOOLS_BY_NAME,
  MCP_TOOL_COUNTS,
  mcpToolsForProfile,
  mcpErrorFor,
  applyRestAliases
} from "../src/mcp/toolRegistry.js";
import { getOpenApiSpec } from "../src/ui/openapi.js";
import { renderExplorerHtml } from "../src/ui/explorer.js";
import { Env } from "../src/types.js";
import { createLocalEnv } from "./lib/localEnv.js";

const envFor = (profile?: "ai" | "human") => createLocalEnv({ MCP_PROFILE: profile });
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;

const call = (env: Env, pathname: string, init?: RequestInit) =>
  worker.fetch(new Request(`http://localhost${pathname}`, init), env, ctx);
const rpc = async (env: Env, method: string, params?: unknown) => {
  const res = await call(env, "/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  return (await res.json()) as any;
};
const post = (env: Env, tool: string, body: unknown) =>
  call(env, `/tools/${tool}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

async function main() {
  const names = TOOLS.map((t) => t.name);

  console.log("1. Registry: unique names and derived counts");
  assert.equal(new Set(names).size, names.length, "duplicate tool names");
  assert.equal(TOOLS.length, 36);
  assert.deepEqual(MCP_TOOL_COUNTS, { specialized: 22, studyPacks: 13, ai: 23, human: 36 });

  console.log("2. Drift: OpenAPI paths match the registry exactly");
  const specPaths = Object.keys((getOpenApiSpec("http://localhost") as any).paths)
    .filter((p) => p.startsWith("/tools/"))
    .map((p) => p.slice("/tools/".length))
    .sort();
  assert.deepEqual(specPaths, [...names].sort());

  console.log("3. Drift: every Explorer endpoint is a registered tool");
  const explorerTools = [...renderExplorerHtml("").matchAll(/endpoint:\s*"\/tools\/([a-z_]+)"/g)].map((m) => m[1]);
  assert.ok(explorerTools.length > 0, "no Explorer endpoints found");
  for (const name of explorerTools) assert.ok(TOOLS_BY_NAME.has(name), `Explorer calls unknown tool ${name}`);

  console.log("4. Health lists every tool");
  const health = (await (await call(envFor(), "/health", { headers: { Accept: "application/json" } })).json()) as any;
  assert.deepEqual(Object.keys(health.endpoints.tools).sort(), [...names].sort());

  console.log("5. MCP tools/list respects the profile and adds output_mode");
  for (const profile of ["ai", "human"] as const) {
    const listed = (await rpc(envFor(profile), "tools/list")).result.tools as any[];
    assert.deepEqual(
      listed.map((t) => t.name).sort(),
      mcpToolsForProfile(profile).map((t) => t.name).sort()
    );
    for (const t of listed) assert.ok(t.inputSchema.properties.output_mode, `${t.name} lacks output_mode`);
  }
  assert.equal(mcpToolsForProfile("ai").some((t) => t.tier === "study_pack"), false);

  console.log("6. MCP text is the readable result, not JSON-wrapped");
  for (const output_mode of ["compact", "standard"]) {
    const res = (await rpc(envFor(), "tools/call", { name: "bible_lookup", arguments: { reference: "John 11:35", output_mode } })).result;
    assert.ok(!res.isError, JSON.stringify(res));
    assert.match(res.content[0].text, /^\[John 11:35 \(BSB\)\] Jesus wept\./);
    assert.equal(res.structuredContent.output_mode, output_mode);
    assert.equal(res.structuredContent.content, undefined, "structuredContent must not nest an MCP result");
  }

  console.log("7. MCP error policy");
  const bad = (await rpc(envFor(), "tools/call", { name: "bible_lookup", arguments: { reference: "Notabook 99:99" } })).result;
  assert.equal(bad.isError, true);
  const tool = (name: string) => TOOLS_BY_NAME.get(name)!;
  assert.equal(mcpErrorFor(tool("bible_lookup"), { error: "x" }), "x");
  assert.equal(mcpErrorFor(tool("bible_lookup"), { formattedText: "ok" }), null);
  assert.equal(mcpErrorFor(tool("septuagint_lookup"), { error: "x", formattedText: "partial" }), null);
  assert.equal(mcpErrorFor(tool("septuagint_lookup"), { error: "x" }), "x");
  assert.equal(mcpErrorFor(tool("sermon_study_pack"), { error: "x" }), null);

  console.log("8. REST: legacy aliases still work");
  assert.deepEqual(applyRestAliases(tool("bible_lookup"), { passage: "John 1:1" }), { passage: "John 1:1", reference: "John 1:1" });
  assert.deepEqual(applyRestAliases(tool("bible_lookup"), { reference: "Gen 1:1", passage: "John 1:1" }).reference, "Gen 1:1");
  const aliased = (await (await post(envFor(), "bible_lookup", { passage: "John 11:35" })).json()) as any;
  assert.match(aliased.formattedText, /Jesus wept/);

  console.log("9. REST: validation, JSON, method and unknown-tool errors");
  const missing = await post(envFor(), "bible_lookup", {});
  assert.equal(missing.status, 400);
  const missingBody = (await missing.json()) as any;
  assert.equal(missingBody.error.code, "INVALID_ARGUMENTS");
  assert.match(missingBody.error.message, /reference/);
  const badJson = await call(envFor(), "/tools/bible_lookup", { method: "POST", body: "{nope" });
  assert.equal(badJson.status, 400);
  assert.equal(((await badJson.json()) as any).error.code, "INVALID_JSON");
  assert.equal((await call(envFor(), "/tools/bible_lookup")).status, 405);
  assert.equal((await post(envFor(), "no_such_tool", {})).status, 404);
  assert.equal((await post(envFor(), "book_analysis", { book: "Romans", detail: "bogus" })).status, 400);

  console.log("10. REST: GET catalog works and always includes study packs");
  const catalog = await call(envFor("ai"), "/tools/get_available_resources?category=study_packs");
  assert.equal(catalog.status, 200);
  assert.match(((await catalog.json()) as any).formattedText, /sermon_study_pack/);

  console.log("\n🎉 Tool registry tests passed.");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
