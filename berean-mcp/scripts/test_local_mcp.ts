import fs from "fs/promises";
import path from "path";
import os from "os";
import { lookupBiblePassage } from "../src/services/bibleService.js";
import { searchBible } from "../src/services/searchService.js";
import { lookupCrossReferences } from "../src/services/xrefService.js";
import { lookupLexiconEntry } from "../src/services/lexiconService.js";
import { lookupMorphology } from "../src/services/morphologyService.js";
import { Env } from "../src/types.js";

// Mock R2 Bucket that reads from local ~/biblemate/data
function createMockR2(localDataDir: string) {
  return {
    async get(key: string) {
      const fullPath = path.join(localDataDir, key);
      try {
        const data = await fs.readFile(fullPath);
        return {
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          }
        };
      } catch (e) {
        return null;
      }
    }
  } as any;
}

async function runLocalTests() {
  const localDataDir = path.join(os.homedir(), "biblemate", "data");
  console.log(`Testing MCP services with local data at: ${localDataDir}\n`);

  const mockEnv: Env = {
    BIBLEMATE_DATA: createMockR2(localDataDir)
  };

  // 1. Test Bible Lookup
  console.log("--------------------------------------------------");
  console.log("1. Testing bible_lookup: NET John 3:16-18");
  const lookupRes = await lookupBiblePassage(mockEnv, "NET", "John 3:16-18");
  if (lookupRes.error) {
    console.error("❌ Bible Lookup Error:", lookupRes.error);
  } else {
    console.log("✅ Bible Lookup Result:\n" + lookupRes.formattedText);
  }

  // 2. Test Bible Search
  console.log("\n--------------------------------------------------");
  console.log("2. Testing bible_search: 'grace' in Ephesians (NET)");
  const searchRes = await searchBible(mockEnv, "grace", "NET", "Ephesians", 5);
  if (searchRes.error) {
    console.error("❌ Bible Search Error:", searchRes.error);
  } else {
    console.log("✅ Bible Search Result:\n" + searchRes.formattedText);
  }

  // 3. Test Cross References
  console.log("\n--------------------------------------------------");
  console.log("3. Testing cross_references: John 3:16");
  const xrefRes = await lookupCrossReferences(mockEnv, "John 3:16", 10);
  if (xrefRes.error) {
    console.error("❌ Cross Reference Error:", xrefRes.error);
  } else {
    console.log("✅ Cross References Result:\n" + xrefRes.formattedText?.slice(0, 300) + "...\n");
  }

  // 4. Test Lexicon Lookup
  console.log("--------------------------------------------------");
  console.log("4. Testing lexicon_lookup: G2889 (kosmos)");
  const lexRes = await lookupLexiconEntry(mockEnv, "G2889", "thayer");
  if (lexRes.error) {
    console.error("❌ Lexicon Error:", lexRes.error);
  } else {
    console.log("✅ Lexicon Result:\n" + lexRes.formattedText?.slice(0, 300) + "...\n");
  }

  // 5. Test Morphology Lookup
  console.log("--------------------------------------------------");
  console.log("5. Testing morphology_lookup: John 1:1");
  const morphRes = await lookupMorphology(mockEnv, "John 1:1");
  if (morphRes.error) {
    console.error("❌ Morphology Error:", morphRes.error);
  } else {
    console.log("✅ Morphology Result:\n" + morphRes.formattedText);
  }

  console.log("\n==================================================");
  console.log("🎉 All local MCP service tests executed!");
  console.log("==================================================");
}

runLocalTests().catch(console.error);
