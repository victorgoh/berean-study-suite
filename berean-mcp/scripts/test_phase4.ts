import assert from "node:assert/strict";
import { parseReferenceString } from "../src/services/bibleService.js";
import worker from "../src/index.js";
import { getAvailableResources } from "../src/services/catalogService.js";

const context = {} as ExecutionContext;
const env = {
  ENVIRONMENT: "test",
  BIBLEMATE_DATA: { head: async (key: string) => key === "data/lookup/bible_names.json" || key === "bibles/BSB.bible" ? {} : null } as any,
  MORPHOLOGY_DB: { prepare: () => ({ first: async () => ({ ok: 1 }) }) } as any,
  REFERENCE_DB: { prepare: () => ({ first: async () => ({ ok: 1 }) }) } as any
};

assert.equal(parseReferenceString("John 3:16")?.bookNumber, 43);
assert.equal(parseReferenceString("x".repeat(201)), null);
assert.equal(parseReferenceString("John 1:1-25:1"), null);

const aiCatalog = await getAvailableResources(env as any, { includeStudyPacks: false });
assert.equal(aiCatalog.catalog?.study_packs, undefined);
const humanCatalog = await getAvailableResources(env as any, { includeStudyPacks: true });
assert.ok((humanCatalog.catalog?.study_packs?.length || 0) > 0);

const live = await worker.fetch(new Request("https://test/health/live"), env, context);
assert.equal(live.status, 200);
assert.equal((await live.json() as any).check, "live");

const ready = await worker.fetch(new Request("https://test/health/ready"), env, context);
assert.equal(ready.status, 200);

const resources = await worker.fetch(new Request("https://test/health/resources"), env, context);
assert.equal(resources.status, 200);
assert.equal((await resources.json() as any).resources.bible_text, "available");

const notReady = await worker.fetch(new Request("https://test/health/ready"), { ENVIRONMENT: "test" } as any, context);
assert.equal(notReady.status, 503);

const invalid = await worker.fetch(new Request("https://test/tools/bible_lookup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ version: "BSB", reference: "not a passage" })
}), env, context);
assert.equal(invalid.status, 400);
assert.equal((await invalid.json() as any).error.code, "REQUEST_FAILED");

console.log("Phase 4 smoke tests passed.");
