import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { lookupCommentary } from "../src/services/commentaryService.js";

const path = process.argv[2] || "/private/tmp/cCatena.commentary";
const bytes = await fs.readFile(path);
const env = { BIBLEMATE_DATA: { async get(key: string) {
  if (key !== "commentaries/cCatena.commentary") return null;
  return { async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
} } } as any;
const matthew = await lookupCommentary(env, "Catena", "Matthew 1:1");
assert.equal(matthew.error, undefined, matthew.error);
assert.match(matthew.formattedText || "", /Aquinas|Jerome|Augustine|Chrys/);
assert.doesNotMatch(matthew.formattedText || "", /<p>|<span|font-family|Tahoma|Segoe UI/);
const psalm = await lookupCommentary(env, "Catena", "Psalm 63:1");
assert.match(psalm.error || "", /No commentary found|not found/i);
console.log("Catena Aurea conversion regression tests passed.");
