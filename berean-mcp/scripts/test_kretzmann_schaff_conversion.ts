import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { lookupCommentary } from "../src/services/commentaryService.js";

async function check(file: string, key: string, reference: string, expected: RegExp) {
  const bytes = await fs.readFile(file);
  const env = { BIBLEMATE_DATA: { async get(name: string) {
    if (name !== `commentaries/c${key}.commentary`) return null;
    return { async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
  } } } as any;
  const result = await lookupCommentary(env, key, reference);
  assert.equal(result.error, undefined, result.error);
  assert.match(result.formattedText || "", expected);
  assert.doesNotMatch(result.formattedText || "", /<p>|<span|font-family|Tahoma|Segoe UI/);
}

await check(process.argv[2] || "/private/tmp/cKretzmann.commentary", "Kretzmann", "Genesis 1:1", /Kretzmann|Popular Commentary|God/);
await check(process.argv[3] || "/private/tmp/cSchaff.commentary", "Schaff", "Matthew 1:1", /Schaff|Matthew|Christ/);
console.log("Kretzmann and Schaff conversion regression tests passed.");
