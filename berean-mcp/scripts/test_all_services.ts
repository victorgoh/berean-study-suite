/**
 * Comprehensive test script for all 17 Berean MCP services.
 * Tests each service locally with mock R2 / SQLite databases.
 * 
 * Usage: npx tsx scripts/test_all_services.ts
 */

import fs from "fs/promises";
import path from "path";
import os from "os";
import { lookupBiblePassage } from "../src/services/bibleService.js";
import { searchBible } from "../src/services/searchService.js";
import { lookupCrossReferences } from "../src/services/xrefService.js";
import { lookupLexiconEntry } from "../src/services/lexiconService.js";
import { lookupMorphology } from "../src/services/morphologyService.js";
import { lookupCommentary } from "../src/services/commentaryService.js";
import { lookupTopic } from "../src/services/topicsService.js";
import { lookupCharacter } from "../src/services/charactersService.js";
import { lookupLocation } from "../src/services/locationsService.js";
import { lookupDictionary } from "../src/services/dictionaryService.js";
import { lookupEncyclopedia } from "../src/services/encyclopediaService.js";
import { lookupParallels } from "../src/services/parallelsService.js";
import { lookupPromises } from "../src/services/promisesService.js";
import { lookupBookAnalysis } from "../src/services/bookAnalysisService.js";
import { lookupChapterSummary } from "../src/services/chapterSummaryService.js";
import { lookupBibleNames } from "../src/services/namesService.js";
import { lookupChronology } from "../src/services/chronologyService.js";
import { getDailyReading } from "../src/services/dailyReadService.js";
import { Env } from "../src/types.js";

function createMockR2(localDataDir: string, serverDataDir: string) {
  return {
    async get(key: string) {
      // 1. Try local data dir
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

      // 2. Try server data dir (e.g. data/lookup/*.json)
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

import {
  getSermonStudyPack,
  getDevotionalStudyPack,
  getPassageExegesisPack,
  getWordStudyPack,
  getTopicStudyPack,
  getCommentaryStudyPack,
  getLessonCreatorStudyPack,
  getPrayerGuideStudyPack,
  getCovenantTheologyPack
} from "../src/services/studyPackService.js";

async function runAllTests() {
  const localDataDir = path.join(os.homedir(), "biblemate", "data");
  const serverDataDir = path.join(process.cwd());

  console.log("=" * 60);
  console.log("🧪 Testing All 18 Granular Tools & 8 Composite Study Packs Locally");
  console.log(`   Data directory: ${localDataDir}`);
  console.log("=" * 60);

  const mockEnv: Env = {
    BIBLEMATE_DATA: createMockR2(localDataDir, serverDataDir)
  };

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<any>) {
    process.stdout.write(`▶ Testing ${name}... `);
    try {
      const res = await fn();
      if (res.error) {
        console.log(`❌ Failed: ${res.error}`);
        failed++;
      } else {
        const snippet = (res.formattedText || "").slice(0, 80).replace(/\n/g, " ");
        console.log(`✅ Passed (${(res.formattedText || "").length} chars): "${snippet}..."`);
        passed++;
      }
    } catch (err: any) {
      console.log(`❌ Exception: ${err.message}`);
      failed++;
    }
  }

  console.log("\n--- SECTION 1: Granular MCP Tools ---");

  // 1. Bible Lookup
  await test("1. bible_lookup (NET John 3:16)", () =>
    lookupBiblePassage(mockEnv, "NET", "John 3:16")
  );

  // 2. Bible Search
  await test("2. bible_search ('grace' in Romans)", () =>
    searchBible(mockEnv, "grace", "NET", "Romans", 3)
  );

  // 3. Cross References
  await test("3. cross_references (John 3:16)", () =>
    lookupCrossReferences(mockEnv, "John 3:16", 5)
  );

  // 4. Lexicon Lookup (Greek)
  await test("4. lexicon_lookup (Greek G2889 kosmos)", () =>
    lookupLexiconEntry(mockEnv, "G2889", "thayer")
  );

  // 5. Lexicon Lookup (Hebrew fallback)
  await test("5. lexicon_lookup (Hebrew H7225 bereshit)", () =>
    lookupLexiconEntry(mockEnv, "H7225", "bdb")
  );

  // 6. Commentary Lookup (JFB on Romans 8:28)
  await test("6. commentary_lookup (JFB on Romans 8:28)", () =>
    lookupCommentary(mockEnv, "JFB", "Romans 8:28")
  );

  // 7. Topic Study
  await test("7. topic_study ('Justification')", () =>
    lookupTopic(mockEnv, "Justification")
  );

  // 8. Character Lookup
  await test("8. character_lookup ('David')", () =>
    lookupCharacter(mockEnv, "David")
  );

  // 9. Location Lookup
  await test("9. location_lookup ('Jerusalem')", () =>
    lookupLocation(mockEnv, "Jerusalem")
  );

  // 10. Theological Dictionary (Easton)
  await test("10. theological_dictionary ('Covenant')", () =>
    lookupDictionary(mockEnv, "Covenant", "easton")
  );

  // 11. Theological Dictionary (ISBE Encyclopedia)
  await test("11. theological_dictionary (ISBE 'Atonement')", () =>
    lookupEncyclopedia(mockEnv, "Atonement", "isbe")
  );

  // 12. Parallel Passages
  await test("12. parallel_passages ('Sermon on the Mount')", () =>
    lookupParallels(mockEnv, "Sermon on the Mount", false)
  );

  // 13. Biblical Promises
  await test("13. biblical_promises ('Comfort')", () =>
    lookupPromises(mockEnv, "Comfort", false)
  );

  // 14. Book Analysis
  await test("14. book_analysis ('Romans')", () =>
    lookupBookAnalysis(mockEnv, "Romans", 0)
  );

  // 15. Chapter Summary
  await test("15. chapter_summary ('Genesis' 1)", () =>
    lookupChapterSummary(mockEnv, "Genesis", 1)
  );

  // 16. Bible Names
  await test("16. bible_names ('Abigail')", () =>
    lookupBibleNames(mockEnv, "Abigail")
  );

  // 17. Chronology
  await test("17. chronology ('David')", () =>
    lookupChronology(mockEnv, "David")
  );

  // 18. Daily Reading
  await test("18. daily_reading (Today)", () =>
    getDailyReading(mockEnv, undefined, true, "NET")
  );

  console.log("\n--- SECTION 2: Composite Study Packs ---");

  // 19. Sermon Study Pack
  await test("19. sermon_study_pack (Romans 8:28)", () =>
    getSermonStudyPack(mockEnv, "Romans 8:28", "BSB", "Henry", true)
  );

  // 20. Devotional Study Pack
  await test("20. devotional_study_pack (Psalm 23:1-3)", () =>
    getDevotionalStudyPack(mockEnv, "Psalm 23:1-3", "BSB", "Spur", true)
  );

  // 21. Passage Exegesis Pack
  await test("21. passage_exegesis_pack (John 1:1-3)", () =>
    getPassageExegesisPack(mockEnv, "John 1:1-3", "BSB", true)
  );

  // 22. Word Study Pack
  await test("22. word_study_pack (G2842 koinonia)", () =>
    getWordStudyPack(mockEnv, "G2842", "Philippians 1:5", "thayer")
  );

  // 23. Topic Study Pack
  await test("23. topic_study_pack ('Grace')", () =>
    getTopicStudyPack(mockEnv, "Grace", 5, "BSB")
  );

  // 24. Commentary Study Pack
  await test("24. commentary_study_pack (Romans 8:28 with Henry, JFB, Calvin)", () =>
    getCommentaryStudyPack(mockEnv, "Romans 8:28", ["Henry", "JFB", "Calvin"], "BSB")
  );

  // 25. Lesson Creator Study Pack
  await test("25. lesson_creator_study_pack (James 1:2-5)", () =>
    getLessonCreatorStudyPack(mockEnv, "James 1:2-5", "BSB", 10)
  );

  // 26. Prayer Guide Study Pack
  await test("26. prayer_guide_study_pack (Psalm 103:1-5)", () =>
    getPrayerGuideStudyPack(mockEnv, "Psalm 103:1-5", "BSB", "Spur")
  );

  // 27. Covenant Theology Pack
  await test("27. covenant_theology_pack (Genesis 15:1-6)", () =>
    getCovenantTheologyPack(mockEnv, "Genesis 15:1-6", "BSB", true)
  );

  console.log("\n" + "=" * 60);
  console.log(`🏁 Final Local Test Results: ${passed} passed, ${failed} failed.`);
  console.log("=" * 60);
}

runAllTests().catch(console.error);
