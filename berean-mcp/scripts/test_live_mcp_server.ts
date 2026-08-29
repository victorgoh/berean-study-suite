/**
 * Test script executing live queries against the deployed Cloudflare MCP server.
 * Tests all auxiliary data tools via REST endpoints and JSON-RPC over Streamable HTTP.
 * 
 * Usage: npx tsx scripts/test_live_mcp_server.ts
 */

const SERVER_URL = process.env.BEREAN_MCP_URL || "https://berean-mcp.<your-subdomain>.workers.dev";
const API_KEY = "bm_live_wW8ozwpCBL-TNTPmssUHkhSX4C7Z1OUAvI-V9C3T5hM";

interface TestResult {
  tool: string;
  status: number;
  success: boolean;
  preview: string;
}

async function testEndpoint(toolName: string, payload: any): Promise<TestResult> {
  const url = `${SERVER_URL}/tools/${toolName}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify(payload)
    });

    const data = (await res.json().catch(() => ({}))) as any;
    if (res.status === 200 && !data.error) {
      const text = data.formattedText || JSON.stringify(data);
      const preview = text.slice(0, 100).replace(/\n/g, " ");
      return { tool: toolName, status: res.status, success: true, preview };
    } else {
      return {
        tool: toolName,
        status: res.status,
        success: false,
        preview: data.error || `HTTP ${res.status}: ${JSON.stringify(data)}`
      };
    }
  } catch (err: any) {
    return { tool: toolName, status: 0, success: false, preview: err.message };
  }
}

async function runLiveTests() {
  console.log("=".repeat(60));
  console.log(`🌐 Testing Live Cloudflare MCP Server at: ${SERVER_URL}`);
  console.log("=".repeat(60));

  const tests = [
    { name: "bible_lookup", payload: { version: "BSB", reference: "John 3:16" } },
    { name: "bible_search", payload: { version: "BSB", query: "grace", book_filter: "Romans", limit: 3 } },
    { name: "cross_references", payload: { reference: "John 3:16", limit: 5 } },
    { name: "lexicon_lookup", payload: { strongs_number: "G2889", lexicon: "thayer" } },
    { name: "morphology_lookup", payload: { reference: "John 1:1" } },
    { name: "commentary_lookup", payload: { version: "Ryle", reference: "Matthew 5:21" } },
    { name: "commentary_lookup", payload: { version: "Trapp", reference: "Genesis 1:1" } },
    { name: "commentary_lookup", payload: { version: "Bullinger", reference: "Genesis 1:1" } },
    { name: "topic_study", payload: { query: "Justification" } },
    { name: "character_lookup", payload: { name: "David" } },
    { name: "location_lookup", payload: { location: "Jerusalem" } },
    { name: "theological_dictionary", payload: { term: "Covenant", source: "easton" } },
    { name: "parallel_passages", payload: { query: "Sermon on the Mount", include_text: false } },
    { name: "biblical_promises", payload: { topic: "Comfort", include_text: false } },
    { name: "book_analysis", payload: { book: "Romans", section: 0 } },
    { name: "chapter_summary", payload: { book: "Genesis", chapter: 1 } },
    { name: "bible_names", payload: { query: "Abigail" } },
    { name: "chronology", payload: { query: "David" } },
    { name: "daily_reading", payload: { include_text: false } },
    { name: "sermon_study_pack", payload: { reference: "Romans 8:1-4", version: "BSB" } },
    { name: "devotional_study_pack", payload: { reference: "Matthew 5:21-26", version: "BSB" } },
    { name: "passage_exegesis_pack", payload: { reference: "John 1:1-3", version: "BSB" } },
    { name: "word_study_pack", payload: { strongs_number: "G2842", reference: "Philippians 1:5" } },
    { name: "lesson_creator_study_pack", payload: { reference: "Luke 15:11-24", version: "BSB" } },
    { name: "prayer_guide_study_pack", payload: { reference: "Psalm 23", version: "BSB" } },
    { name: "covenant_theology_pack", payload: { reference: "Genesis 15:1-6", version: "BSB" } },
    { name: "commentary_study_pack", payload: { reference: "John 3:16", commentators: ["Ryle", "Trapp", "MacL", "Barnes", "Spur"] } }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    process.stdout.write(`▶ Testing /tools/${t.name}... `);
    const r = await testEndpoint(t.name, t.payload);
    if (r.success) {
      console.log(`✅ Passed: "${r.preview}..."`);
      passed++;
    } else {
      console.log(`❌ Failed: ${r.preview}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🏁 Live Server Results: ${passed} passed, ${failed} failed out of ${tests.length} total.`);
  console.log("=".repeat(60));
}

runLiveTests().catch(console.error);
