import { lookupOtQuotations, getOtInNtStudyPack } from "../src/services/otInNtService.js";
import { getCovenantTheologyPack } from "../src/services/studyPackService.js";

const mockEnv: any = {};

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Testing OT Quotations in NT & Apostolic Hermeneutics Suite");
  console.log("==================================================================\n");

  // 1. Test lookupOtQuotations on NT passage (Hebrews 8:8)
  console.log("▶ 1. Testing lookupOtQuotations on Hebrews 8:8...");
  const hebRes = await lookupOtQuotations(mockEnv, "Hebrews 8:8");
  if (hebRes.error) {
    console.error("❌ Lookup failed:", hebRes.error);
    process.exit(1);
  }
  console.log("Found records:", hebRes.records?.length);
  if (!hebRes.formattedText?.includes("Jeremiah 31:31-34") || !hebRes.formattedText?.includes("New Covenant")) {
    console.error("❌ Output missing expected Jeremiah 31 New Covenant citation");
    process.exit(1);
  }
  console.log("✅ Hebrews 8:8 -> Jeremiah 31:31 Quotation Lookup Passed!\n");

  // 2. Test lookupOtQuotations on Matthew 1:23 (Isaiah 7:14)
  console.log("▶ 2. Testing lookupOtQuotations on Matthew 1:23...");
  const mattRes = await lookupOtQuotations(mockEnv, "Matthew 1:23");
  if (mattRes.error || !mattRes.formattedText?.includes("Isaiah 7:14")) {
    console.error("❌ Matthew 1:23 lookup failed");
    process.exit(1);
  }
  if (!mattRes.formattedText?.includes("parthenos") && !mattRes.formattedText?.includes("παρθένος")) {
    console.error("❌ Missing Greek parthenos divergence note");
    process.exit(1);
  }
  console.log("✅ Matthew 1:23 -> Isaiah 7:14 Virgin Birth Passed!\n");

  // 3. Test lookupOtQuotations on OT Source (Genesis 15:6)
  console.log("▶ 3. Testing lookupOtQuotations on OT source Genesis 15:6...");
  const genRes = await lookupOtQuotations(mockEnv, "Genesis 15:6");
  if (genRes.error || !genRes.formattedText?.includes("Romans 4:3")) {
    console.error("❌ Genesis 15:6 reverse OT lookup failed");
    process.exit(1);
  }
  console.log("✅ Genesis 15:6 -> Romans 4:3 Reverse Lookup Passed!\n");

  // 4. Test 11th Composite Study Pack: ot_in_nt_study_pack on Hebrews 8:8-12
  console.log("▶ 4. Testing ot_in_nt_study_pack on Hebrews 8:8-12...");
  const packRes = await getOtInNtStudyPack(mockEnv, "Hebrews 8:8-12", "BSB");
  console.log("Title in formatted text:", packRes.formattedText.split("\n")[0]);
  console.log("Sections present:", Object.keys(packRes.sections || {}));

  if (!packRes.formattedText.includes("# Apostolic Hermeneutics & OT-in-NT Fulfillment Pack: Hebrews 8:8-12")) {
    console.error("❌ Title header mismatch in ot_in_nt_study_pack");
    process.exit(1);
  }
  if (!packRes.sections?.["nt_apostolic_scripture"] || !packRes.sections?.["quotation_alignment_matrix"]) {
    console.error("❌ Missing essential sections in ot_in_nt_study_pack");
    process.exit(1);
  }
  if (!packRes.formattedText.includes("> [!TIP]")) {
    console.error("❌ Missing persona callout alert tip");
    process.exit(1);
  }
  console.log("✅ 11th Composite Study Pack (ot_in_nt_study_pack) Passed!\n");

  // 5. Test Enhanced Covenant Theology Pack auto-injection on Hebrews 8
  console.log("▶ 5. Testing Enhanced covenant_theology_pack auto-injection on Hebrews 8...");
  const covRes = await getCovenantTheologyPack(mockEnv, "Hebrews 8", "BSB");
  if (!covRes.sections?.["covenant_source_alignment"]) {
    console.error("❌ Covenant Theology Pack missing covenant_source_alignment section");
    process.exit(1);
  }
  console.log("✅ Enhanced Covenant Theology Pack Passed!\n");

  console.log("==================================================================");
  console.log("🎉 All Phase 2 OT Quotations in NT Tests Passed Successfully!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
