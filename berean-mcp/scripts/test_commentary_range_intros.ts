import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { lookupCommentary } from "../src/services/commentaryService.js";

const SQL = await initSqlJs();
const sourceDb = new SQL.Database();
sourceDb.run(`
  CREATE TABLE Commentary (
    Book INTEGER NOT NULL,
    Chapter INTEGER NOT NULL,
    VerseStart INTEGER NOT NULL,
    VerseEnd INTEGER NOT NULL,
    Content TEXT NOT NULL
  );
  INSERT INTO Commentary VALUES
    (19, 0, 0, 0, 'Introduction to all the Psalms'),
    (19, 63, 0, 0, 'Introduction to Psalm 63'),
    (19, 63, 1, 12, 'Psalm 63 commentary notes');
`);
const bytes = sourceDb.export();
sourceDb.close();

const env = {
  BIBLEMATE_DATA: {
    async get(key: string) {
      if (key !== "commentaries/cMHCC.commentary") return null;
      return {
        async arrayBuffer() {
          return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        }
      };
    }
  }
} as any;

const fullChapter = await lookupCommentary(env, "MHCC", "Psalm 63");
assert.equal(fullChapter.error, undefined);
assert.match(fullChapter.formattedText || "", /Introduction to Psalm 63/);
assert.match(fullChapter.formattedText || "", /Psalm 63 commentary notes/);
assert.doesNotMatch(fullChapter.formattedText || "", /Introduction to all the Psalms/);

const verseRange = await lookupCommentary(env, "MHCC", "Psalm 63:1-4");
assert.equal(verseRange.error, undefined);
assert.match(verseRange.formattedText || "", /Psalm 63 commentary notes/);
assert.doesNotMatch(verseRange.formattedText || "", /Introduction to Psalm 63/);
assert.doesNotMatch(verseRange.formattedText || "", /Introduction to all the Psalms/);

console.log("Commentary range-introduction regression tests passed.");
