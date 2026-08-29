/**
 * Test script executing live queries against the deployed Cloudflare MCP server.
 * Tests the 5 new Composite Study Pack endpoints.
 */

const SERVER_URL = process.env.BEREAN_MCP_URL || "https://berean-mcp.<your-subdomain>.workers.dev";

async function testStudyPack(name: string, payload: any) {
  const url = `${SERVER_URL}/tools/${name}`;
  console.log(`\n==================================================================`);
  console.log(`🧪 Testing Live Composite Tool: ${name}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  console.log(`==================================================================`);

  const startTime = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const duration = Date.now() - startTime;
  const data = (await res.json().catch(() => ({}))) as any;

  if (res.status === 200 && data.formattedText) {
    console.log(`✅ SUCCESS (${duration}ms) - Status 200 OK`);
    console.log(`--- Response Snippet (First 400 chars) ---`);
    console.log(data.formattedText.slice(0, 400));
    console.log(`...\n--- Total Length: ${data.formattedText.length} characters ---`);
  } else {
    console.error(`❌ FAILED (${duration}ms) - Status ${res.status}:`, data);
  }
}

async function main() {
  console.log(`🚀 Running Live Tests Against: ${SERVER_URL}`);

  // 1. Sermon Study Pack
  await testStudyPack("sermon_study_pack", {
    reference: "Romans 8:1-4",
    version: "NET",
    commentary_version: "Henry",
    include_xrefs: true
  });

  // 2. Word Study Pack
  await testStudyPack("word_study_pack", {
    strongs_number: "G2842",
    reference: "Philippians 1:5",
    lexicon: "thayer"
  });

  // 3. Devotional Study Pack
  await testStudyPack("devotional_study_pack", {
    reference: "Psalm 23",
    version: "NET"
  });

  // 4. Passage Exegesis Pack
  await testStudyPack("passage_exegesis_pack", {
    reference: "John 1:1-3",
    version: "NET",
    include_original: true
  });

  // 5. Topic Study Pack
  await testStudyPack("topic_study_pack", {
    topic: "Justification",
    version: "NET"
  });

  console.log("\n==================================================================");
  console.log("🎉 All Live Composite Study Pack Tests Completed!");
  console.log("==================================================================\n");
}

main().catch(console.error);
