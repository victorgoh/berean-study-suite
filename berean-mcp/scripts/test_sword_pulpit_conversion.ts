import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { lookupCommentary } from "../src/services/commentaryService.js";

const root = process.argv[2] || "/private/tmp/sipulpit-converted";
const env = {
  BIBLEMATE_DATA: {
    async get(key: string) {
      const file = path.join(root, path.basename(key));
      try {
        const bytes = await fs.readFile(file);
        return { async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
      } catch {
        return null;
      }
    }
  }
} as any;

for (const [reference, expected] of [
  ["Psalm 63", "God’s protection"],
  ["Psalm 63:5", "marrow and fatness"],
  ["Genesis 1:1", "In the beginning"],
  ["Matthew 1:1", "genealogy"]
] as const) {
  const result = await lookupCommentary(env, "Pulpit", reference);
  assert.equal(result.error, undefined, `${reference}: ${result.error || "unexpected error"}`);
  const text = result.formattedText || "";
  assert.match(text, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), reference);
  assert.doesNotMatch(text, /Tahoma|Segoe UI|font-family|God"s|David"s/, `${reference}: formatting artifacts`);
}

for (const reference of ["Numbers 29", "Numbers 31", "Numbers 34", "Numbers 35", "Deuteronomy 6", "Judges 21", "2 Kings 24"]) {
  const result = await lookupCommentary(env, "Pulpit", reference);
  assert.equal(result.error, undefined, `${reference}: ${result.error || "unexpected error"}`);
  assert.ok((result.formattedText || "").length > 100, `${reference}: expected restored legacy content`);
  assert.doesNotMatch(result.formattedText || "", /Tahoma|Segoe UI|font-family|God"s|David"s/, `${reference}: formatting artifacts`);
}

console.log(`SWORD Pulpit conversion regression tests passed (${root}).`);
