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
import { internalError } from "../src/services/errors.js";
import { paginateText, normalizeMcpToolResult } from "../src/mcp/output.js";
import { tidyNameMeaning } from "../src/services/namesService.js";
import { translationOf } from "../src/utils/morphology.js";
import { formatReference, parseReferenceString } from "../src/services/bibleService.js";
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
  assert.equal(TOOLS.length, 37);
  assert.deepEqual(MCP_TOOL_COUNTS, { specialized: 23, studyPacks: 13, ai: 24, human: 37 });

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
    for (const t of listed) {
      assert.ok(t.inputSchema.properties.output_mode, `${t.name} lacks output_mode`);
      assert.ok(t.inputSchema.properties.page, `${t.name} lacks page`);
      assert.ok(t.title && t.annotations?.title === t.title, `${t.name} lacks a title`);
      assert.equal(t.annotations.readOnlyHint, true, `${t.name} must be marked read-only`);
      assert.equal(t.annotations.destructiveHint, false);
      assert.equal(t.annotations.idempotentHint, true);
      assert.equal(t.annotations.openWorldHint, false);
      assert.doesNotMatch(t.description, /High-speed|BBE/, `${t.name} description`);
    }
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
  assert.match(bad.content[0].text, /^Error \(REQUEST_FAILED\): .+\nCheck the arguments/);
  const none = (await rpc(envFor(), "tools/call", { name: "bible_lookup", arguments: { reference: "Genesis 50:99" } })).result;
  assert.match(none.content[0].text, /^Error \(RESOURCE_UNAVAILABLE\): No verses found for Genesis 50:99/);
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

  console.log("11. REST: typed service errors map to documented HTTP codes");
  const expectError = async (res: Response, status: number, code: string) => {
    assert.equal(res.status, status);
    const body = (await res.json()) as any;
    assert.equal(body.error.code, code);
    assert.equal(body.error.retryable, status >= 500);
    return body.error.message as string;
  };
  await expectError(await post(envFor(), "bible_lookup", { reference: "not a reference" }), 400, "REQUEST_FAILED");
  await expectError(await post(envFor(), "septuagint_lookup", { reference: "John 3:16" }), 400, "REQUEST_FAILED");
  await expectError(await post(envFor(), "bible_lookup", { reference: "Genesis 50:99" }), 404, "RESOURCE_UNAVAILABLE");
  const noStorage = { ...envFor(), BIBLEMATE_DATA: undefined } as unknown as Env;
  await expectError(await post(noStorage, "cross_references", { reference: "John 3:16" }), 503, "DEPENDENCY_UNAVAILABLE");

  console.log("12. Internal errors never expose the underlying message");
  const quietConsole = console.error;
  console.error = () => {};
  const internal = internalError("Commentary query", new Error("SQLITE_ERROR: no such table: Secret"));
  console.error = quietConsole;
  assert.equal(internal.errorCode, "INTERNAL_ERROR");
  assert.doesNotMatch(internal.error, /SQLITE|Secret/);

  console.log("13. References are shown once, in canonical form");
  const fmt = (ref: string) => formatReference(parseReferenceString(ref)!);
  assert.equal(fmt("Jn 3:16"), "John 3:16");
  assert.equal(fmt("John 3:16-18"), "John 3:16-18");
  assert.equal(fmt("Matt 5:1-7:27"), "Matthew 5:1-7:27");
  assert.equal(fmt("Psalm 23"), "Psalms 23");
  const missingVerse = (await (await post(envFor(), "bible_lookup", { reference: "Genesis 50:99" })).json()) as any;
  assert.equal(missingVerse.error.message, "No verses found for Genesis 50:99 in BSB");
  const henry = (await (await post(envFor(), "commentary_lookup", { reference: "John 3:16", version: "Henry" })).json()) as any;
  if (henry.formattedText) assert.match(henry.formattedText, /^# \[Henry\] Commentary on John 3:16\n/);

  console.log("14. Text-only results are sent as text, not as empty structured content");
  const textOnly = normalizeMcpToolResult({ formattedText: "# Heading\n\nBody" }, {}) as any;
  assert.equal(textOnly.structuredContent, undefined, "no structuredContent when there is no structured data");
  assert.equal(textOnly.content[0].text, "# Heading\n\nBody");
  const xref = (await rpc(envFor(), "tools/call", { name: "cross_references", arguments: { reference: "Matthew 11:28", limit: 5 } })).result;
  assert.ok(!xref.isError, JSON.stringify(xref));
  assert.match(xref.content[0].text, /Cross References: Matthew 11:28/);
  assert.equal(xref.structuredContent.references.length, 5, "cross_references now sends its reference list");
  const verses = (await rpc(envFor(), "tools/call", { name: "bible_lookup", arguments: { reference: "John 11:35" } })).result;
  assert.ok(Array.isArray(verses.structuredContent.verses), "structured data is still sent when present");

  console.log("15. Long results are paged instead of refused");
  const sample = Array.from({ length: 40 }, (_, i) => `Paragraph ${i} ` + "word ".repeat(60)).join("\n\n");
  const samplePages = paginateText(sample, 1000);
  assert.ok(samplePages.length > 1);
  for (const pg of samplePages) assert.ok(pg.length <= 1000);
  assert.equal(samplePages.join("").replace(/\s+/g, ""), sample.replace(/\s+/g, ""), "pages must cover all text");
  const callTopic = async (args: Record<string, unknown>) =>
    (await rpc(envFor(), "tools/call", { name: "topic_study", arguments: { query: "Prayer", ...args } })).result;
  const first = await callTopic({});
  assert.ok(!first.isError, first.content?.[0]?.text?.slice(0, 200));
  const match = /Part 1 of (\d+) of this result\..*page: 2/.exec(first.content[0].text);
  assert.ok(match, "first page must say how to continue");
  const total = Number(match[1]);
  assert.ok(first.content[0].text.length <= 12000);
  const last = await callTopic({ page: total });
  assert.match(last.content[0].text, new RegExp(`Part ${total} of ${total} of this result\\.\\*$`));
  const beyond = await callTopic({ page: total + 1 });
  assert.equal(beyond.isError, true);
  assert.match(beyond.content[0].text, /^Error \(REQUEST_FAILED\): page \d+ does not exist/);
  const full = await callTopic({ output_mode: "full" });
  assert.ok(!full.isError);

  console.log("16. Result-quality fixes");
  const restJson = async (tool: string, body: unknown) => (await (await post(envFor(), tool, body)).json()) as any;
  assert.equal((await restJson("biblical_promises", { topic: "Fear", include_text: false })).topic, "When you are afraid");
  assert.equal((await restJson("biblical_promises", { topic: "Worry", include_text: false })).topic, "When you worry");
  assert.equal((await restJson("biblical_promises", { topic: "Peace", include_text: false })).topic, "PEACE", "exact topic names still win");
  const xr = await restJson("cross_references", { reference: "Matthew 11:28", limit: 5 });
  assert.equal(xr.references.length, 5);
  assert.match(xr.formattedText, /Showing 5 of \d+ references/);
  const barnes = await restJson("commentary_lookup", { reference: "Romans 8", version: "Barnes" });
  assert.match(barnes.formattedText, /^# \[Barnes\] Commentary on Romans 8\n\nThis chapter/, "no stray 0 before the introduction");
  assert.equal(barnes.result.verses, undefined);
  assert.equal((await restJson("commentary_lookup", { reference: "Romans 8:28", version: "Barnes" })).result.verses, "28");
  assert.equal(tidyNameMeaning("The Father'S Joy"), "The Father's Joy");
  assert.equal(tidyNameMeaning("A Teacher; Lofty; Mountain Of Strength"), "A Teacher; Lofty; Mountain of Strength");
  assert.equal(tidyNameMeaning("Uncle, Or Father'S Brother"), "Uncle, or Father's Brother");
  const praus = await restJson("lexicon_lookup", { strongs_number: "G4239", lexicon: "thayer" });
  assert.match(praus.classicalDefinition, /see \*\*πρᾷός\*\*[\s\S]*G4235 — πρᾷός/, "Thayer pointer entries are followed");
  assert.equal(translationOf("vvv"), undefined);
  assert.equal(translationOf(" rest "), "rest");
  const morph = await restJson("morphology_lookup", { reference: "Matthew 11:28" });
  assert.ok(!JSON.stringify(morph).includes('"vvv"'), "placeholder translations are not exposed");

  console.log("17. Priority-1 fixes from the Explorer/MCP audit");
  const restJ = async (tool: string, body: unknown) => {
    const res = await post(envFor(), tool, body);
    return { status: res.status, body: (await res.json()) as any };
  };
  // AI-only notes stay out of REST/Explorer results but reach MCP clients.
  const devo = await restJ("devotional_study_pack", { reference: "Matthew 11:28-30" });
  assert.equal(devo.status, 200);
  assert.doesNotMatch(devo.body.formattedText, /persona|\[!TIP\]/i, "reader-facing text has no AI tip");
  assert.match(devo.body.aiNote, /Compassionate Pastor/);
  const devoMcp = (await rpc(envFor("human"), "tools/call", { name: "devotional_study_pack", arguments: { reference: "Matthew 11:28-30", output_mode: "full" } })).result;
  assert.match(devoMcp.content[0].text, /Note for AI assistants:\*\* Use this data pack with the \*\*Compassionate Pastor\*\*/);
  assert.doesNotMatch((await restJ("cross_references", { reference: "Matthew 11:28", limit: 3 })).body.formattedText, /Increase limit/);
  // Search reports the real total, not the display limit.
  const search = (await restJ("bible_search", { query: "weary", limit: 3 })).body;
  assert.equal(search.matches.length, 3);
  assert.ok(search.totalCount > 3, `totalCount ${search.totalCount}`);
  assert.match(search.formattedText, new RegExp(`^Found ${search.totalCount} matches .*; showing the first 3:`));
  // MCP clients get usage instructions when they connect.
  const init = await rpc(envFor(), "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.match(init.result.instructions, /bible_lookup/);
  assert.match(init.result.instructions, /page: 2/);
  // Morphology exposes Strong's numbers.
  const morphWords = (await restJ("morphology_lookup", { reference: "Matthew 11:28" })).body.words as any[];
  assert.equal(morphWords.find((w) => w.Lexeme === "ἀναπαύω")?.Strongs, "G373");
  assert.ok(morphWords.every((w) => !("LexicalEntry" in w)), "raw LexicalEntry is not exposed");
  // A word study with no lexicon entry is an error, with a hint for non-Strong's input.
  const ws = await restJ("word_study_pack", { strongs_number: "xyzzyq" });
  assert.equal(ws.status, 404);
  assert.match(ws.body.error.message, /Strong's number such as G26/);
  const wsMcp = (await rpc(envFor("human"), "tools/call", { name: "word_study_pack", arguments: { strongs_number: "xyzzyq" } })).result;
  assert.equal(wsMcp.isError, true);
  assert.equal((await restJ("word_study_pack", { strongs_number: "G373" })).status, 200);

  console.log("18. Words instead of Strong's numbers");
  const agape = await restJ("lexicon_lookup", { strongs_number: "agape" });
  assert.equal(agape.status, 200);
  assert.match(agape.body.formattedText.normalize("NFC"), /^\*\u201Cagape\u201D is G26 \S+ \(agap\S+, \u201Clove\u201D\)/);
  assert.equal((await restJ("lexicon_lookup", { strongs_number: "αγαπη" })).status, 200, "unaccented Greek lemma");
  const shalom = (await restJ("lexicon_lookup", { strongs_number: "shalom" })).body;
  assert.match(shalom.formattedText, /H7965/, "Hebrew variants collapse to their base number");
  const rest = (await restJ("lexicon_lookup", { strongs_number: "rest" })).body;
  assert.ok(rest.candidates.length > 1);
  assert.match(rest.formattedText, /^# Words matching \u201Crest\u201D[\s\S]*\| G372 \| /);
  const restPack = await restJ("word_study_pack", { strongs_number: "rest" });
  assert.equal(restPack.status, 200);
  assert.ok(restPack.body.result.candidates.length > 1, "word study offers a choice for an ambiguous word");
  const agapePack = (await restJ("word_study_pack", { strongs_number: "agape" })).body;
  assert.match(agapePack.formattedText, /Lexical Definition[\s\S]*G26/);
  assert.equal((await restJ("lexicon_lookup", { strongs_number: "G26" })).status, 200, "Strong's numbers still work");

  console.log("19. Compare translations");
  const cmp = await restJ("compare_translations", { reference: "John 11:35" });
  assert.equal(cmp.status, 200);
  assert.deepEqual(cmp.body.versions, ["BSB", "KJV", "NET", "WEB"]);
  assert.equal(cmp.body.verses.length, 1);
  assert.match(cmp.body.verses[0].texts.KJV, /Jesus wept/);
  assert.match(cmp.body.formattedText, /^# Compare Translations: John 11:35[\s\S]*\*\*BSB\*\* — Jesus wept\./);
  assert.equal((await restJ("compare_translations", { reference: "John 3:16", versions: ["BSB", "KJV", "NET", "WEB", "ASV"] })).status, 400, "at most four");
  assert.equal((await restJ("compare_translations", { reference: "not a passage" })).status, 400);
  const pair = (await restJ("compare_translations", { reference: "Psalm 23:1-2", versions: ["KJV", "BSB"] })).body;
  assert.deepEqual(pair.versions, ["KJV", "BSB"]);
  assert.equal(pair.verses.length, 2);

  console.log("\n🎉 Tool registry tests passed.");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
