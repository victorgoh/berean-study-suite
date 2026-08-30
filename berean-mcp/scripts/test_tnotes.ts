import { lookupCommentary } from "../src/services/commentaryService.js";
import { getCommentaryStudyPack } from "../src/services/studyPackService.js";

const mockEnv: any = {};

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Testing Tyndale Open Study Notes (TNotes) & Priority Ordering");
  console.log("==================================================================\n");

  // 1. Direct lookupCommentary on Genesis 1:1 with key 'TNotes'
  console.log("▶ 1. Testing lookupCommentary on Genesis 1:1 with key 'TNotes'...");
  const genRes = await lookupCommentary(mockEnv, "TNotes", "Genesis 1:1");
  if (genRes.error) {
    console.error("❌ TNotes lookup failed:", genRes.error);
    process.exit(1);
  }
  if (!genRes.formattedText?.includes("In the beginning") || !genRes.formattedText?.includes("creatio ex nihilo")) {
    console.error("❌ Output missing expected Tyndale House notes content");
    process.exit(1);
  }
  console.log("✅ Genesis 1:1 TNotes Direct Lookup Passed!\n");

  // 2. Alias resolution: 'tyndale' and 'ton'
  console.log("▶ 2. Testing alias resolution 'tyndale' on John 1:1...");
  const johnRes = await lookupCommentary(mockEnv, "tyndale", "John 1:1");
  if (johnRes.error || !johnRes.formattedText?.includes("Logos")) {
    console.error("❌ Alias 'tyndale' lookup failed");
    process.exit(1);
  }
  console.log("✅ Alias 'tyndale' -> TNotes Resolution Passed!\n");

  // 3. Modern Priority Ordering in commentary_study_pack
  console.log("▶ 3. Testing commentary_study_pack with 'modern_first' orderMode on Genesis 1:1...");
  const modernRes = await getCommentaryStudyPack(mockEnv, "Genesis 1:1", undefined, "modern_first");
  const firstSection = modernRes.formattedText.split("\n\n")[1];
  console.log("First section header:", firstSection);
  if (!modernRes.formattedText.includes("## 1. TNotes Commentary")) {
    console.error("❌ Expected TNotes to be first in 'modern_first' mode");
    process.exit(1);
  }
  console.log("✅ Modern Priority Ordering (TNotes first) Passed!\n");

  // 4. Classic Priority Ordering in commentary_study_pack
  console.log("▶ 4. Testing commentary_study_pack with 'classic_first' orderMode on Genesis 1:1...");
  const classicRes = await getCommentaryStudyPack(mockEnv, "Genesis 1:1", undefined, "classic_first");
  if (!classicRes.formattedText.includes("## 1. Calvin Commentary")) {
    console.error("❌ Expected Calvin to be first in 'classic_first' mode");
    process.exit(1);
  }
  console.log("✅ Classic Priority Ordering (Calvin first) Passed!\n");

  // 5. Custom Commentary Selection with TNotes
  console.log("▶ 5. Testing custom commentary list ['TNotes', 'Calvin', 'Gill'] on Genesis 15:6...");
  const customRes = await getCommentaryStudyPack(mockEnv, "Genesis 15:6", ["TNotes", "Calvin", "Gill"], "custom");
  if (!customRes.sections?.["tnotes"] || !customRes.sections?.["calvin"] || !customRes.sections?.["gill"]) {
    console.error("❌ Missing expected commentary sections in custom list");
    process.exit(1);
  }
  console.log("✅ Custom Commentary List with TNotes Passed!\n");

  console.log("==================================================================");
  console.log("🎉 All Phase 4 TNotes & Commentary Ordering Tests Passed!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
