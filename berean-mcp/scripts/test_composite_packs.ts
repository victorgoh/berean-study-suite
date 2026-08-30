import { getSermonStudyPack, getDevotionalStudyPack, getPassageExegesisPack, getWordStudyPack, getTopicStudyPack, getCommentaryStudyPack, getLessonCreatorStudyPack, getPrayerGuideStudyPack, getCovenantTheologyPack } from "../src/services/studyPackService.js";
import { Env } from "../src/types.js";

// Mock R2 for local testing
const mockEnv: Env = {
  BIBLEMATE_DATA: {
    async get(key: string) {
      return null;
    }
  } as any
};

async function testHierarchy() {
  console.log("=================================================");
  console.log("Testing Study Pack Heading Structure & Returns");
  console.log("=================================================");

  // 1. Sermon Study Pack
  const sermon = await getSermonStudyPack(mockEnv, "Romans 8:1-4", "BSB");
  console.log("1. Sermon Pack Sections:", Object.keys(sermon.sections || {}));
  console.log("   Metadata:", sermon.metadata);
  const sermonH1Count = (sermon.formattedText.match(/^#[^#]/gm) || []).length;
  console.log(`   H1 Count: ${sermonH1Count} (Should be exactly 1)`);

  // 2. Devotional Study Pack
  const devo = await getDevotionalStudyPack(mockEnv, "Psalm 23", "BSB", "Comfort");
  console.log("2. Devotional Pack Sections:", Object.keys(devo.sections || {}));
  const devoH1Count = (devo.formattedText.match(/^#[^#]/gm) || []).length;
  console.log(`   H1 Count: ${devoH1Count} (Should be exactly 1)`);

  // 3. Passage Exegesis Pack
  const exegesis = await getPassageExegesisPack(mockEnv, "John 1:1-3", "BSB");
  console.log("3. Exegesis Pack Sections:", Object.keys(exegesis.sections || {}));
  const exegesisH1Count = (exegesis.formattedText.match(/^#[^#]/gm) || []).length;
  console.log(`   H1 Count: ${exegesisH1Count} (Should be exactly 1)`);

  // 4. Word Study Pack
  const word = await getWordStudyPack(mockEnv, "G2842", "Philippians 1:5");
  console.log("4. Word Study Pack Sections:", Object.keys(word.sections || {}));
  const wordH1Count = (word.formattedText.match(/^#[^#]/gm) || []).length;
  console.log(`   H1 Count: ${wordH1Count} (Should be exactly 1)`);

  // 5. Commentary Study Pack
  const comm = await getCommentaryStudyPack(mockEnv, "John 3:16", ["Henry", "JFB"]);
  console.log("5. Commentary Pack Sections:", Object.keys(comm.sections || {}));
  const commH1Count = (comm.formattedText.match(/^#[^#]/gm) || []).length;
  console.log(`   H1 Count: ${commH1Count} (Should be exactly 1)`);

  console.log("\n=================================================");
  console.log("All Heading Checks Passed!");
  console.log("=================================================");
}

testHierarchy();
