import { lookupLexiconEntry } from "../src/services/lexiconService.js";
import { getWordStudyPack } from "../src/services/studyPackService.js";

// Mock environment with D1 support
const mockD1Database: any = {
  prepare: (query: string) => ({
    bind: (...params: any[]) => ({
      first: async () => {
        if (query.includes("lexicon_bdb")) {
          return {
            Topic: params[0],
            Definition: "<b>רֵאשִׁית</b> (reshit) 1. beginning, chief part, choice part."
          };
        }
        return null;
      },
      all: async () => {
        if (query.includes("lexicon_step")) {
          const key = params[0] || params[1] || "";
          if (key.startsWith("H")) {
            return {
              results: [
                {
                  strongs: "H7225G",
                  base_number: "H7225",
                  canonical_strongs: "H7225",
                  language: "Hebrew/Aramaic",
                  lemma: "רֵאשִׁית",
                  transliteration: "reshit",
                  morphology: "H:N-F",
                  gloss: "first: beginning",
                  definition: "1. first, beginning, chief part, choice part."
                }
              ]
            };
          }
          return {
            results: [
              {
                strongs: "G2889",
                base_number: "G2889",
                canonical_strongs: "G2889",
                language: "Greek",
                lemma: "κόσμος",
                transliteration: "kosmos",
                morphology: "G:N-M",
                gloss: "world",
                definition: "1. an apt and harmonious arrangement or constitution, order.\n2. ornament, decoration.\n3. the world, universe."
              }
            ]
          };
        }
        return { results: [] };
      }
    })
  })
};

const mockEnv: any = {
  REFERENCE_DB: mockD1Database
};

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Testing STEPBible TBESG & TBESH Lexicon Integration");
  console.log("==================================================================\n");

  // 1. Greek Word Test: G2889 (kosmos) from SQLite Fallback / D1
  console.log("▶ 1. Testing Greek G2889 (kosmos)...");
  const greekRes = await lookupLexiconEntry(mockEnv, "G2889", "step");
  if (greekRes.error) {
    console.error("❌ Greek lookup failed:", greekRes.error);
    process.exit(1);
  }
  console.log("Formatted output preview:\n", greekRes.formattedText?.slice(0, 300));
  if (!greekRes.formattedText?.includes("TBESG") || !greekRes.formattedText?.includes("κόσμος")) {
    console.error("❌ Output missing expected TBESG tag or Greek lemma");
    process.exit(1);
  }
  console.log("✅ Greek G2889 Test Passed!\n");

  // 2. Hebrew Disambiguated Word Test: H7225 (reshit with sub-lemmas from SQLite)
  console.log("▶ 2. Testing Hebrew H7225 (reshit from SQLite step_lexicon)...");
  const emptyEnv: any = {};
  const hebrewRes = await lookupLexiconEntry(emptyEnv, "H7225", "step");
  if (hebrewRes.error) {
    console.error("❌ Hebrew lookup failed:", hebrewRes.error);
    process.exit(1);
  }
  console.log("Formatted output preview:\n", hebrewRes.formattedText?.slice(0, 300));
  if (!hebrewRes.formattedText?.includes("TBESH") || !hebrewRes.formattedText?.includes("רֵאשִׁית")) {
    console.error("❌ Output missing expected TBESH tag or Hebrew lemma");
    process.exit(1);
  }
  console.log("✅ Hebrew H7225 Test Passed!\n");

  // 3. Word Study Pack with STEP Lexicon & Morphology
  console.log("▶ 3. Testing Word Study Pack on G2842 (Philippians 1:5)...");
  const packRes = await getWordStudyPack(emptyEnv, "G2842", "Philippians 1:5", "step");
  console.log("Study Pack Title:", packRes.metadata?.title);
  console.log("Sections present:", Object.keys(packRes.sections || {}));
  if (!packRes.formattedText.includes("TBESG") || !packRes.sections?.["lexical_definition"]) {
    console.error("❌ Word Study Pack missing TBESG integration");
    process.exit(1);
  }
  console.log("✅ Word Study Pack Test Passed!\n");

  // 4. Combined 'all' Lexicon Mode (Modern STEP + Classical BDB / D1)
  console.log("▶ 4. Testing 'all' mode on H7225 (STEP + BDB)...");
  const allRes = await lookupLexiconEntry(mockEnv, "H7225", "all");
  if (!allRes.formattedText?.includes("TBESH") || !allRes.formattedText?.includes("BDB")) {
    console.error("❌ 'all' mode missing either TBESH or BDB");
    process.exit(1);
  }
  console.log("✅ Combined 'all' Lexicon Mode Test Passed!\n");

  console.log("==================================================================");
  console.log("🎉 All STEPBible Lexicon Integration Tests Passed Successfully!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
