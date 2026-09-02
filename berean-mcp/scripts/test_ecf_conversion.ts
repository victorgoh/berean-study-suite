import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { lookupCommentary } from "../src/services/commentaryService.js";

const path = process.argv[2] || "/private/tmp/cECF.commentary";
const single = !path.includes("{sharded}");
const files = single ? new Map([["commentaries/cECF.commentary", path]]) : new Map([
  ["commentaries/cECF_1.commentary", path.replace("{sharded}", "1")],
  ["commentaries/cECF_2.commentary", path.replace("{sharded}", "2")],
  ["commentaries/cECF_3.commentary", path.replace("{sharded}", "3")],
  ["commentaries/cECF_4.commentary", path.replace("{sharded}", "4")],
]);
const bytesByKey = new Map<string, Buffer>();
for (const [key, file] of files) bytesByKey.set(key, await fs.readFile(file));
const env = {
  BIBLEMATE_DATA: {
    async get(key: string) {
      const bytes = bytesByKey.get(key);
      if (!bytes) return null;
      return { async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
    }
  }
} as any;

for (const [reference, expected] of [["Psalm 63:1", "Augustine"], ["Deuteronomy 6:4", "commentary"]] as const) {
  const result = await lookupCommentary(env, "ECF", reference);
  assert.equal(result.error, undefined, `${reference}: ${result.error}`);
  assert.ok((result.formattedText || "").length > 80, `${reference} returned too little content`);
  if (reference === "Psalm 63:1") assert.match(result.formattedText || "", new RegExp(expected));
  assert.doesNotMatch(result.formattedText || "", /<p>|<br|font-family|Tahoma|Segoe UI/);
}
console.log("ECF conversion regression tests passed.");
