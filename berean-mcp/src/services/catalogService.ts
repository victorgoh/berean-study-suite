import { BIBLE_REGISTRY, COMMENTARIES_LIST, LEXICON_REGISTRY } from "../config/databaseMap.js";
import { RESOURCE_DEFINITIONS } from "../mcp/resources.js";
import { WORKFLOW_PROMPTS } from "../mcp/prompts.js";
import { Env } from "../types.js";

export interface ResourceCatalogOptions {
  category?: "all" | "bibles" | "commentaries" | "lexicons" | "study_packs" | "personas" | "skills" | "workflows" | "rules";
}

export async function getAvailableResources(
  env: Env,
  options: ResourceCatalogOptions = { category: "all" }
): Promise<{ error?: string; catalog?: any; formattedText?: string }> {
  const cat = options.category || "all";

  const studyPacks = [
    { name: "passage_exegesis_pack", description: "Comprehensive verse-by-verse exegesis with Greek/Hebrew, morphology, Keil & Delitzsch / Meyer, Expositor's Greek NT, and JFB." },
    { name: "sermon_study_pack", description: "Preaching outline, Maclaren homiletics, Charles Simeon, Biblical Illustrator, Matthew Henry, and cross-references." },
    { name: "devotional_study_pack", description: "Pastoral reflection with Spurgeon, Maclaren, Albert Barnes, Matthew Henry, and 1st-person ACTS prayer." },
    { name: "word_study_pack", description: "Lexical definitions (Thayer/BDB/LSJ), syntactic morphology, and A.T. Robertson / Marvin Vincent word studies." },
    { name: "topic_study_pack", description: "Topical concordance, systematic theology definitions, and full scripture passages." },
    { name: "commentary_study_pack", description: "Multi-commentary synthesis across custom subsets of the available commentators." },
    { name: "lesson_creator_study_pack", description: "Teaching outlines, discussion questions, Albert Barnes, and Ellicott for teachers." },
    { name: "prayer_guide_study_pack", description: "Scriptural adoration, confession, thanksgiving, supplication, and biblical promises." },
    { name: "covenant_theology_pack", description: "Redemptive-historical covenant progression, John Calvin, John Gill, and canonical narrative synthesis." }
  ];

  const personas = [
    { name: "ot-bible-scholar", focus: "Old Testament Hebrew grammar, syntax, Ancient Near East background" },
    { name: "nt-bible-scholar", focus: "New Testament Koine Greek, Second Temple Judaism, rhetorical structures" },
    { name: "biblical-linguistic-analyst", focus: "Lexical semantics, discourse analysis, morphology, avoiding root fallacies" },
    { name: "biblical-theologian", focus: "Redemptive-historical storyline, covenant progression, Christocentric typology" },
    { name: "systematic-theologian", focus: "Doctrinal synthesis (Theology Proper, Christology, Soteriology, Eschatology)" },
    { name: "passionate-evangelist", focus: "Warm, gospel-centered, salvation-focused evangelistic appeal (Billy Graham style)" },
    { name: "compassionate-pastor", focus: "Gentle pastoral care, personal applications, 1st-person prayers" },
    { name: "context-analyst-david", focus: "Psalms contextualized in David's life stages in 1 & 2 Samuel" },
    { name: "master-biblical-writer", focus: "Synthesizing multi-phase research into publication-quality final responses" },
    { name: "study-quality-auditor", focus: "Auditing studies against hermeneutical standards and scripture accuracy" },
    { name: "biblical-translator", focus: "Word-by-word original language mapping, transliterations, poetic English" },
    { name: "bible-textual-critic", focus: "Manuscript lineages (MT, LXX, NA28), translation comparison, textual variants" },
    { name: "verse-scripter", focus: "Concise scripture indexing, citation accuracy, formatting" },
    { name: "biblical-content-interpreter", focus: "Evaluating news, contemporary culture, and philosophy through a biblical lens" },
    { name: "berean-plus-orchestrator", focus: "Dynamic multi-phase study orchestration with phase quality checkpoints" }
  ];

  const skills = [
    {
      name: "berean",
      uri: "berean://skills/berean",
      description: "Structured multi-phase research pipeline: Planning, Scripture & Morphology Retrieval, Exegesis, Covenant Theology, Pastoral Application, and Master Final Manuscript."
    },
    {
      name: "berean-plus",
      uri: "berean://skills/berean-plus",
      description: "Dynamic goal-oriented research workflow with dynamic persona matching and quality audit checkpoints between phases."
    }
  ];

  const workflows = Object.values(WORKFLOW_PROMPTS).map(w => ({
    name: w.name,
    description: w.description
  }));

  const rules = [
    {
      name: "typography",
      uri: "berean://rules/typography",
      description: "Universal standards: zero raw LaTeX math notation, standard Unicode characters (→, ⇒, ▶), no fragile ASCII box diagrams, explicit Scripture translation tags [Romans 8:28 (BSB)], clean docx rendering."
    }
  ];

  const catalog: any = {};
  const sections: string[] = [];

  if (cat === "all" || cat === "bibles") {
    catalog.bibles = BIBLE_REGISTRY;
    sections.push(`### 📖 Available Bible Translations (${BIBLE_REGISTRY.length})\n` +
      BIBLE_REGISTRY.map(b => `- **${b.code}** (${b.name}): ${b.description} [${b.type}]`).join("\n"));
  }

  if (cat === "all" || cat === "commentaries") {
    catalog.commentaries = COMMENTARIES_LIST.map(c => ({
      key: c.key,
      name: c.name,
      author: c.author,
      scope: c.scope,
      description: c.description
    }));
    sections.push(`### 💬 Available Commentary Sets (${COMMENTARIES_LIST.length})\n` +
      COMMENTARIES_LIST.map(c => `- **${c.key}** — *${c.name}* [${c.scope}]: ${c.description}`).join("\n"));
  }

  if (cat === "all" || cat === "lexicons") {
    catalog.lexicons = LEXICON_REGISTRY;
    sections.push(`### 🏛️ Original Language Lexicons (${LEXICON_REGISTRY.length})\n` +
      LEXICON_REGISTRY.map(l => `- **${l.code}** (${l.name}) [${l.language}]: ${l.description}`).join("\n"));
  }

  if (cat === "all" || cat === "study_packs") {
    catalog.study_packs = studyPacks;
    sections.push(`### ⚡ Composite Study Packs (${studyPacks.length})\n` +
      studyPacks.map(p => `- **\`${p.name}\`**: ${p.description}`).join("\n"));
  }

  if (cat === "all" || cat === "personas") {
    catalog.personas = personas;
    sections.push(`### 🎭 Study Personas (${personas.length})\n` +
      personas.map(p => `- **${p.name}**: ${p.focus}`).join("\n"));
  }

  if (cat === "all" || cat === "skills") {
    catalog.skills = skills;
    sections.push(`### 🧠 Autonomous Skills & Pipelines (${skills.length})\n` +
      skills.map(s => `- **${s.name}** (\`${s.uri}\`): ${s.description}`).join("\n"));
  }

  if (cat === "all" || cat === "workflows") {
    catalog.workflows = workflows;
    sections.push(`### 📋 Workflows & Prompts (${workflows.length})\n` +
      workflows.map(w => `- **${w.name}**: ${w.description}`).join("\n"));
  }

  if (cat === "all" || cat === "rules") {
    catalog.rules = rules;
    sections.push(`### 📐 Formatting & Typography Rules (${rules.length})\n` +
      rules.map(r => `- **${r.name}** (\`${r.uri}\`): ${r.description}`).join("\n"));
  }

  const formattedText = `# Berean MCP Resource Catalog\n\n` + sections.join("\n\n---\n\n");

  return { catalog, formattedText };
}

