import { lookupSeptuagint, getSeptuagintStudyPack } from "../src/services/septuagintService.js";
import { lookupBiblePassage } from "../src/services/bibleService.js";
import { getPassageExegesisPack } from "../src/services/studyPackService.js";

const mockEnv: any = {};

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Testing Septuagint (LXX) Text, Morphology & Study Pack Suite");
  console.log("==================================================================\n");

  // 1. Test lookupSeptuagint on Genesis 1:1-5
  console.log("▶ 1. Testing lookupSeptuagint on Genesis 1:1-5...");
  const genRes = await lookupSeptuagint(mockEnv, "Genesis 1:1-5");
  if (genRes.error) {
    console.error("❌ Lookup failed:", genRes.error);
    process.exit(1);
  }
  console.log("Verses count:", genRes.verses?.length);
  if (!genRes.formattedText?.includes("ἀρχῇ ἐποίησεν") || !genRes.formattedText?.includes("Brenton")) {
    console.error("❌ Output missing Greek Septuagint or Brenton translation text");
    process.exit(1);
  }
  console.log("✅ Genesis 1:1-5 Septuagint Lookup Passed!\n");

  // 2. Test lookupSeptuagint on Genesis 4:8 variant
  console.log("▶ 2. Testing lookupSeptuagint on Genesis 4:8 variant...");
  const cainRes = await lookupSeptuagint(mockEnv, "Genesis 4:8");
  if (cainRes.error || !cainRes.formattedText?.includes("Διέλθωμεν εἰς τὸ πεδίον")) {
    console.error("❌ Missing Cain and Abel field variant in Genesis 4:8");
    process.exit(1);
  }
  if (!cainRes.formattedText?.includes("Samaritan Pentateuch")) {
    console.error("❌ Missing textual divergence notes");
    process.exit(1);
  }
  console.log("✅ Genesis 4:8 Septuagint Variant & MT Divergence Passed!\n");

  // 3. Test generic lookupBiblePassage with version 'LXX'
  console.log("▶ 3. Testing lookupBiblePassage with version 'LXX' on Genesis 1:1-3...");
  const bibleRes = await lookupBiblePassage(mockEnv, "LXX", "Genesis 1:1-3");
  if (bibleRes.error || !bibleRes.formattedText?.includes("ἀρχῇ")) {
    console.error("❌ lookupBiblePassage failed for LXX");
    process.exit(1);
  }
  console.log("✅ Universal Bible Lookup for LXX Passed!\n");

  // 4. Test 12th Composite Study Pack: septuagint_study_pack on Genesis 1:1-5
  console.log("▶ 4. Testing septuagint_study_pack on Genesis 1:1-5...");
  const packRes = await getSeptuagintStudyPack(mockEnv, "Genesis 1:1-5", "BSB");
  console.log("Title in formatted text:", packRes.formattedText.split("\n")[0]);
  console.log("Sections present:", Object.keys(packRes.sections || {}));

  if (!packRes.formattedText.includes("# Septuagint (LXX) & Hebrew MT Comparative Study Pack: Genesis 1:1-5")) {
    console.error("❌ Header title mismatch in septuagint_study_pack");
    process.exit(1);
  }
  if (!packRes.sections?.["greek_septuagint_text"] || !packRes.sections?.["textual_divergence_matrix"]) {
    console.error("❌ Missing essential sections in septuagint_study_pack");
    process.exit(1);
  }
  console.log("✅ 12th Composite Study Pack (septuagint_study_pack) Passed!\n");

  // 5. Test Enhanced passage_exegesis_pack auto-injecting Septuagint on Genesis 1:1
  console.log("▶ 5. Testing passage_exegesis_pack Septuagint inclusion on Genesis 1:1...");
  const exegesisRes = await getPassageExegesisPack(mockEnv, "Genesis 1:1", "BSB", true);
  if (!exegesisRes.sections?.["septuagint_greek_text"]) {
    console.error("❌ passage_exegesis_pack did not auto-inject Septuagint for OT passage");
    process.exit(1);
  }
  console.log("✅ Enhanced Academic Exegesis Pack with Septuagint Passed!\n");

  console.log("==================================================================");
  console.log("🎉 All Phase 3 Septuagint (LXX) Tests Passed Successfully!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
