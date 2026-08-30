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
      Gloss: "[the] Lord",
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

  console.log("▶ Testing NT Interlinear Study Pack: Philippians 4:4...");
  const ntRes = await getInterlinearStudyPack(mockEnvNt, "Philippians 4:4");

  console.log("Title in formatted text:", ntRes.formattedText.split("\n")[0]);
  if (!ntRes.formattedText.includes("# 📜 Inline Interlinear Study Pack: Philippians 4:4")) {
    throw new Error("❌ NT Title format mismatch");
  }
  if (!ntRes.formattedText.includes("## 1. Inline Interlinear Text (Greek & Glosses)")) {
    throw new Error("❌ Section 1 header mismatch");
  }
  if (!ntRes.formattedText.includes("## 2. Original Language Glossary & Lexical Entries")) {
    throw new Error("❌ Section 2 glossary header mismatch");
  }
  if (!ntRes.formattedText.includes("> [!TIP]")) {
    throw new Error("❌ Missing persona callout alert tip");
  }
  if (!ntRes.sections || !ntRes.sections["interlinear_text"] || !ntRes.sections["glossary"]) {
    throw new Error("❌ Missing sections keys (interlinear_text or glossary)");
  }
  if (
    !ntRes.metadata ||
    ntRes.metadata.language !== "Greek" ||
    ntRes.metadata.isOT !== false ||
    !ntRes.metadata.timestamp
  ) {
    throw new Error("❌ Metadata mismatch for NT");
  }
  if (!ntRes.result || ntRes.result.verses.length !== 1 || ntRes.result.glossary.length === 0) {
    throw new Error("❌ Structured result object mismatch");
  }
  console.log("✅ NT Test Passed!\n");

  // Mock D1 database for OT (Genesis 1:1)
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

  console.log("▶ Testing OT Interlinear Study Pack: Genesis 1:1...");
  const otRes = await lookupInterlinear(mockEnvOt, "Genesis 1:1");

  console.log("Title in formatted text:", otRes.formattedText.split("\n")[0]);
  if (!otRes.formattedText.includes("# 📜 Inline Interlinear Study Pack: Genesis 1:1")) {
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
  console.log(ntRes.formattedText.slice(0, 500));
  console.log("...\n");

  console.log("--- Sections Keys ---");
  console.log(Object.keys(ntRes.sections || {}));
  console.log("\n--- Metadata ---");
  console.log(JSON.stringify(ntRes.metadata, null, 2));

  console.log("\n==================================================================");
  console.log("🎉 All Interlinear Study Pack Unit Tests Passed Successfully!");
  console.log("==================================================================");
}

runUnitTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
