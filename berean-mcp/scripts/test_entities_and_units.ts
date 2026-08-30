import { lookupEntityDisambiguation, convertAncientUnits } from "../src/services/unitsAndEntitiesService.js";

const mockEnv: any = {};

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Testing Biblical Entity Disambiguation & Ancient Units Suite");
  console.log("==================================================================\n");

  // 1. Test lookupEntityDisambiguation on 'Mary'
  console.log("▶ 1. Testing lookupEntityDisambiguation on 'Mary'...");
  const maryRes = await lookupEntityDisambiguation(mockEnv, "Mary");
  if (maryRes.error) {
    console.error("❌ Mary disambiguation failed:", maryRes.error);
    process.exit(1);
  }
  console.log("Found Mary figures:", maryRes.entities?.length);
  if (!maryRes.formattedText?.includes("Mary Magdalene") || !maryRes.formattedText?.includes("Mary of Bethany")) {
    console.error("❌ Output missing expected Mary figures");
    process.exit(1);
  }
  console.log("✅ 'Mary' Disambiguation (6 distinct figures) Passed!\n");

  // 2. Test lookupEntityDisambiguation on 'Herod'
  console.log("▶ 2. Testing lookupEntityDisambiguation on 'Herod'...");
  const herodRes = await lookupEntityDisambiguation(mockEnv, "Herod");
  if (herodRes.error || !herodRes.formattedText?.includes("Herod the Great") || !herodRes.formattedText?.includes("Herod Antipas")) {
    console.error("❌ Herod disambiguation failed");
    process.exit(1);
  }
  console.log("✅ 'Herod' Disambiguation (4 rulers) Passed!\n");

  // 3. Test convertAncientUnits on 'Talent' (amount = 1)
  console.log("▶ 3. Testing convertAncientUnits on 1 Talent...");
  const talentRes = await convertAncientUnits(mockEnv, "Talent", 1);
  if (talentRes.error || !talentRes.formattedText?.includes("34.2 kg") || !talentRes.formattedText?.includes("6,000")) {
    console.error("❌ 1 Talent conversion failed");
    process.exit(1);
  }
  console.log("✅ 1 Talent Conversion & Purchasing Power Passed!\n");

  // 4. Test convertAncientUnits on 'Talent' with multiplier (amount = 5)
  console.log("▶ 4. Testing convertAncientUnits on 5 Talents...");
  const fiveTalentRes = await convertAncientUnits(mockEnv, "Talent", 5);
  if (fiveTalentRes.error || !fiveTalentRes.formattedText?.includes("5 × 34.2 kg")) {
    console.error("❌ 5 Talents multiplier conversion failed");
    process.exit(1);
  }
  console.log("✅ Multiplier (5 Talents) Conversion Passed!\n");

  // 5. Test convertAncientUnits on 'Cubit' (Length)
  console.log("▶ 5. Testing convertAncientUnits on 'Cubit'...");
  const cubitRes = await convertAncientUnits(mockEnv, "Cubit", 1);
  if (cubitRes.error || !cubitRes.formattedText?.includes("45.7 cm") || !cubitRes.formattedText?.includes("18.0 inches")) {
    console.error("❌ Cubit conversion failed");
    process.exit(1);
  }
  console.log("✅ Cubit Length Conversion Passed!\n");

  // 6. Test convertAncientUnits on 'Denarius' (Currency)
  console.log("▶ 6. Testing convertAncientUnits on 'Denarius'...");
  const denariusRes = await convertAncientUnits(mockEnv, "Denarius", 1);
  if (denariusRes.error || !denariusRes.formattedText?.includes("daily wage for a common day-laborer")) {
    console.error("❌ Denarius purchasing power conversion failed");
    process.exit(1);
  }
  console.log("✅ Denarius Currency & Labor Conversion Passed!\n");

  console.log("==================================================================");
  console.log("🎉 All Phase 5 Entities & Ancient Units Tests Passed!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
