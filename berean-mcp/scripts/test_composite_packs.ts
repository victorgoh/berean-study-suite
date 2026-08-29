import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.env.BEREAN_MCP_URL || "https://berean-mcp.<your-subdomain>.workers.dev/mcp";

async function main() {
  console.log("==================================================================");
  console.log(`📡 Connecting to Live Berean MCP Server: ${SERVER_URL}`);
  console.log("==================================================================\n");

  const transport = new StreamableHTTPClientTransport(
    new URL(SERVER_URL)
  );

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: { prompts: {}, tools: {}, resources: {} } }
  );

  await client.connect(transport);
  console.log("✅ MCP Client connected successfully!\n");

  // 1. List Tools
  console.log("--- 1. Testing tools/list ---");
  const toolsRes = await client.listTools();
  console.log(`Total tools returned: ${toolsRes.tools.length}`);
  const toolNames = toolsRes.tools.map(t => t.name);
  console.log("Available tools:", toolNames.join(", "));
  console.log("\n");

  // 2. List Prompts (Personas & Workflows)
  console.log("--- 2. Testing prompts/list ---");
  const promptsRes = await client.listPrompts();
  console.log(`Total prompts/personas returned: ${promptsRes.prompts.length}`);
  const promptNames = promptsRes.prompts.map(p => p.name);
  console.log("Available prompts:", promptNames.join(", "));
  console.log("\n");

  // 3. Test sermon_study_pack
  console.log("--- 3. Testing Tool: sermon_study_pack (Romans 8:1-4) ---");
  const sermonRes: any = await client.callTool({
    name: "sermon_study_pack",
    arguments: {
      reference: "Romans 8:1-4",
      version: "NET",
      commentary_version: "Henry",
      include_xrefs: true
    }
  });
  console.log("Response Preview:\n" + sermonRes.content[0].text.slice(0, 400) + "...\n");

  // 4. Test word_study_pack
  console.log("--- 4. Testing Tool: word_study_pack (G2842 with Phil 1:5) ---");
  const wordRes: any = await client.callTool({
    name: "word_study_pack",
    arguments: {
      strongs_number: "G2842",
      reference: "Philippians 1:5",
      lexicon: "strongs"
    }
  });
  console.log("Response Preview:\n" + wordRes.content[0].text.slice(0, 400) + "...\n");

  // 5. Test devotional_study_pack
  console.log("--- 5. Testing Tool: devotional_study_pack (Psalm 23) ---");
  const devRes: any = await client.callTool({
    name: "devotional_study_pack",
    arguments: {
      reference: "Psalm 23",
      version: "NET"
    }
  });
  console.log("Response Preview:\n" + devRes.content[0].text.slice(0, 400) + "...\n");

  // 6. Test passage_exegesis_pack
  console.log("--- 6. Testing Tool: passage_exegesis_pack (John 1:1-3) ---");
  const exegesisRes: any = await client.callTool({
    name: "passage_exegesis_pack",
    arguments: {
      reference: "John 1:1-3",
      version: "NET",
      include_original: true
    }
  });
  console.log("Response Preview:\n" + exegesisRes.content[0].text.slice(0, 400) + "...\n");

  console.log("==================================================================");
  console.log("🎉 All Live MCP Server Tests Completed Successfully!");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
