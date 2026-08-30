import { lookupInterlinear, getInterlinearStudyPack } from "../src/services/interlinearService.js";
import { Env, MorphologyWord } from "../src/types.js";

async function runUnitTests() {
  console.log("==================================================================");
  console.log("🧪 Running Interlinear Study Pack Service Unit Tests");
  console.log("==================================================================\n");

  // Mock D1 database for NT (Philippians 4:4)
  const mockNtWords: MorphologyWord[] = [
    {
      Book: 50,
      Chapter: 4,
      Verse: 4,
      Word: "Χαίρετε",
      LexicalEntry: "G5463",
      Morphology: "V-PAM-2P",
      Lexeme: "χαίρω",
      Transliteration: "Chairete",
      Gloss: "Rejoice",
      Translation: "Rejoice"
    },
    {
      Book: 50,
      Chapter: 4,
      Verse: 4,
      Word: "ἐν",
      LexicalEntry: "G1722",
      Morphology: "PREP",
      Lexeme: "ἐν",
      Transliteration: "en",
      Gloss: "in",
      Translation: "in"
    },
    {
      Book: 50,
      Chapter: 4,
      Verse: 4,
      Word: "Κυρίῳ",
      LexicalEntry: "G2962",
      Morphology: "N-DSM",
      Lexeme: "κύριος",
      Transliteration: "Kyriō",
      Gloss: "Lord",
      Translation: "Lord"
    },
    {
      Book: 50,
      Chapter: 4,
      Verse: 4,
      Word: "πάντοτε",
      LexicalEntry: "G3842",
      Morphology: "ADV",
      Lexeme: "πάντοτε",
      Transliteration: "pantote",
      Gloss: "always",
      Translation: "always"
    }
  ];

  const mockD1Nt: any = {
    prepare(query: string) {
      return {
        bind(...args: any[]) {
          return {
            async all() {
              return { results: mockNtWords };
            }
          };
        }
      };
    }
  };

  const mockEnvNt: Env = {
    MORPHOLOGY_DB: mockD1Nt
  };

  // 1. Test NT Inline Mode (Default) with Alphabetic Labels & No Brackets on English words
  console.log("▶ 1. Testing NT Interlinear Study Pack (Inline Mode with Alpha Labels): Philippians 4:4...");
  const ntInlineRes = await getInterlinearStudyPack(mockEnvNt, "Philippians 4:4", "rare_and_notable", "#3b7a57", "inline");

  console.log("Title in formatted text:", ntInlineRes.formattedText.split("\n")[0]);
  if (!ntInlineRes.formattedText.includes("# Inline Interlinear Study Pack: Philippians 4:4")) {
    throw new Error("❌ Title format mismatch");
  }
  if (!ntInlineRes.formattedText.includes("## 1. Inline Interlinear Text (Greek & Glosses)")) {
    throw new Error("❌ Section 1 header mismatch");
  }
  if (!ntInlineRes.formattedText.includes("## 2. Original Language Glossary & Lexical Entries")) {
    throw new Error("❌ Section 2 glossary header mismatch");
  }
  if (!ntInlineRes.formattedText.includes(">a<") || !ntInlineRes.formattedText.includes("#entry-a")) {
    throw new Error("❌ Missing alphabetic reference label 'a'");
  }
  if (!ntInlineRes.metadata || ntInlineRes.metadata.language !== "Greek" || ntInlineRes.metadata.isOT !== false) {
    throw new Error("❌ Metadata mismatch for NT");
  }
  console.log("✅ NT Inline Mode with Alpha Labels Passed!\n");

  // 2. Test NT Ruby Stacking Mode
  console.log("▶ 2. Testing NT Interlinear Study Pack (Ruby Stacking Mode)...");
  const ntRubyRes = await getInterlinearStudyPack(mockEnvNt, "Philippians 4:4", "rare_and_notable", "#3b7a57", "ruby");
  if (!ntRubyRes.formattedText.includes("<ruby") || !ntRubyRes.formattedText.includes("<rt")) {
    throw new Error("❌ Missing <ruby> or <rt> tags in ruby mode");
  }
  console.log("✅ NT Ruby Stacking Mode Passed!\n");

  // 3. Test NT Table Grid Mode
  console.log("▶ 3. Testing NT Interlinear Study Pack (Table Grid Mode)...");
  const ntTableRes = await getInterlinearStudyPack(mockEnvNt, "Philippians 4:4", "rare_and_notable", "#3b7a57", "table");
  if (!ntTableRes.formattedText.includes("| Original | Transliteration | Translation | Parsing | Lexicon |")) {
    throw new Error("❌ Missing Markdown table header in table mode");
  }
  console.log("✅ NT Table Grid Mode Passed!\n");

  // 4. Test OT (Genesis 1:1)
  const mockOtWords: MorphologyWord[] = [
    {
      Book: 1,
      Chapter: 1,
      Verse: 1,
      Word: "בְּרֵאשִׁ֖ית",
      LexicalEntry: "H7225",
      Morphology: "HR/Ncfsa",
      Lexeme: "רֵאשִׁית",
      Transliteration: "be·re·Shit",
      Gloss: "In the beginning",
      Translation: "In the beginning"
    },
    {
      Book: 1,
      Chapter: 1,
      Verse: 1,
      Word: "בָּרָ֣א",
      LexicalEntry: "H1254",
      Morphology: "HVqp3ms",
      Lexeme: "בָּרָא",
      Transliteration: "ba·Ra",
      Gloss: "created",
      Translation: "created"
    },
    {
      Book: 1,
      Chapter: 1,
      Verse: 1,
      Word: "אֱלֹהִ֑ים",
      LexicalEntry: "H0430",
      Morphology: "HNcmpa",
      Lexeme: "אֱלֹהִים",
      Transliteration: "E·lo·Him",
      Gloss: "God",
      Translation: "God"
    }
  ];

  const mockD1Ot: any = {
    prepare(query: string) {
      return {
        bind(...args: any[]) {
          return {
            async all() {
              return { results: mockOtWords };
            }
          };
        }
      };
    }
  };

  const mockEnvOt: Env = {
    MORPHOLOGY_DB: mockD1Ot
  };

  console.log("▶ 4. Testing OT Interlinear Study Pack: Genesis 1:1...");
  const otRes = await lookupInterlinear(mockEnvOt, "Genesis 1:1");

  console.log("Title in formatted text:", otRes.formattedText.split("\n")[0]);
  if (!otRes.formattedText.includes("# Inline Interlinear Study Pack: Genesis 1:1")) {
    throw new Error("❌ OT Title format mismatch");
  }
  if (!otRes.formattedText.includes("## 1. Inline Interlinear Text (Hebrew/Aramaic & Glosses)")) {
    throw new Error("❌ OT Section 1 header mismatch");
  }
  if (!otRes.formattedText.includes("## 2. Original Language Glossary & Lexical Entries")) {
    throw new Error("❌ OT Section 2 glossary header mismatch");
  }
  if (!otRes.metadata || otRes.metadata.language !== "Hebrew/Aramaic" || otRes.metadata.isOT !== true) {
    throw new Error("❌ Metadata mismatch for OT");
  }
  console.log("✅ OT Test Passed!\n");

  console.log("--- Output Sample (First 500 characters) ---");
  console.log(ntInlineRes.formattedText.slice(0, 500));
  console.log("...\n");

  console.log("--- Sections Keys ---");
  console.log(Object.keys(ntInlineRes.sections || {}));
  console.log("\n--- Metadata ---");
  console.log(JSON.stringify(ntInlineRes.metadata, null, 2));

  console.log("\n==================================================================");
  console.log("🎉 All Interlinear Study Pack Unit Tests Passed Successfully!");
  console.log("==================================================================");
}

runUnitTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
