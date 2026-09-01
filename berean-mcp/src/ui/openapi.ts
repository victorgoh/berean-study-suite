/**
 * Complete OpenAPI 3.1.0 Specification for Berean MCP Server
 * Auto-documents the currently configured biblical study tools and composite study packs
 */

export function getOpenApiSpec(serverUrl: string = "https://berean-mcp.victorgoh.workers.dev"): object {
  return {
    openapi: "3.1.0",
    info: {
      title: "Berean MCP Server — Biblical Study & Exegesis API",
      version: "1.0.0",
      description: "Open-source biblical study API and Model Context Protocol (MCP) server providing access to public-domain translations, 26 classical commentary sets, original Greek and Hebrew lexicons, and cross-reference datasets.\n\nEcosystem repository: [https://github.com/victorgoh/berean-study-suite](https://github.com/victorgoh/berean-study-suite)",
      contact: {
        name: "Berean AI Study Suite",
        url: "https://github.com/victorgoh/berean-study-suite"
      }
    },
    servers: [
      {
        url: serverUrl,
        description: "Current Server Instance"
      },
      {
        url: "http://localhost:8787",
        description: "Local Development Server"
      }
    ],
    tags: [
      { name: "⚡ Composite Study Packs", description: "Multi-database theological analysis and curriculum synthesis" },
      { name: "📖 Scripture Texts & Translations", description: "Multi-version Bible text, keyword search, harmony, and daily plans" },
      { name: "💬 Classical Commentaries & Cross-References", description: "26 classical commentary sets and Treasury of Scripture Knowledge" },
      { name: "🏛 Original Languages & Textual Alignment", description: "Hebrew & Greek lexicons (BDB, Thayer, STEP), morphology, interlinear, Septuagint, and OT-in-NT alignment" },
      { name: "🏷️ Theology & Doctrinal Reference", description: "Theological dictionaries, Nave's Topical Bible, and biblical promises" },
      { name: "📜 Historical & Cultural Context", description: "Biblical people, geography, coins and ancient units, chronology, and book structures" },
      { name: "System", description: "Catalog discovery, MCP, and server health endpoints" }
    ],
    paths: {
      // --- TIER 0: Catalog Discovery ---
      "/tools/get_available_resources": {
        post: {
          tags: ["System"],
          summary: "List Available Resources & Catalog",
          description: "Discover all available Bibles, commentary sets, dictionaries, study packs, and AI personas.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category: { type: "string", enum: ["all", "bibles", "commentaries", "lexicons", "dictionaries"], default: "all" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Resource catalog" }
          }
        }
      },

      // --- TIER 1: Composite Study Packs ---
      "/tools/sermon_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Sermon & Homiletics Study Pack",
          description: "Focused bundle of Scripture, Alexander Maclaren, Charles Simeon outlines, and cross-references. Use illustration_study_pack when fuller Biblical Illustrator material is wanted.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28-30", description: "Preaching scripture passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Complete sermon preparation bundle" } }
        }
      },
      "/tools/illustration_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Biblical Illustrator Study Pack",
          description: "An explicit, fuller pack of Biblical Illustrator historical anecdotes and sermon illustrations, with Scripture and a short cross-reference list.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28", description: "Scripture passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" },
                    include_xrefs: { type: "boolean", default: true }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Biblical Illustrator source material" } }
        }
      },
      "/tools/lesson_creator_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Lesson Creator & Teaching Study Pack",
          description: "Focused bundle of Scripture, a sourced chapter opening, Charles Ellicott, and cross-references for teachers.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Luke 15:11-32", description: "Lesson scripture passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Curriculum and discussion package" } }
        }
      },
      "/tools/devotional_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Devotional Study Pack",
          description: "Bundles Scripture, Maclaren, Spurgeon (Treasury of David), Albert Barnes, Matthew Henry, and Biblical Promises.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Psalm 23:1-6", description: "Devotional scripture passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Pastoral and devotional meditation notes" } }
        }
      },
      "/tools/prayer_guide_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Scripture Prayer Guide Study Pack",
          description: "Bundles Scripture, Spurgeon/Benson adoration, Wesley examination, and promises for first-person ACTS prayer.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Ephesians 3:14-21", description: "Passage for prayer reflection" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Scriptural prayer guide" } }
        }
      },
      "/tools/passage_exegesis_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Passage Exegesis Study Pack",
          description: "Bundles Primary Translation, OHGB Original Greek/Hebrew, Keil & Delitzsch / H.A.W. Meyer, Expositor's Greek NT, Pulpit Commentary, and JFB.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28-30", description: "Passage for exegesis" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Exegetical analysis package" } }
        }
      },
      "/tools/word_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Original Word Study Pack",
          description: "Bundles Strong's/Thayer/BDB Lexicons, In-Context Morphology, and A.T. Robertson / Marvin Vincent Word Studies.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    strongs_number: { type: "string", example: "G26", description: "Strong's number (e.g. 'G26', 'H1254')" },
                    lexicon: { type: "string", enum: ["strongs", "thayer", "bdb", "lsj", "step", "all"], default: "strongs" }
                  },
                  required: ["strongs_number"]
                }
              }
            }
          },
          responses: { "200": { description: "Lexical and philological analysis" } }
        }
      },
      "/tools/interlinear_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Continuous Interlinear Study Pack",
          description: "Inline Greek/Hebrew to English word-by-word interlinear with continuous verse layout, grammatical parsing tags, and an automated lexical glossary.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Philippians 4:4-8", description: "Scripture reference" },
                    glossary_filter: { type: "string", enum: ["all_words", "rare_and_notable", "none"], default: "rare_and_notable" },
                    gloss_color: { type: "boolean", default: true },
                    display_mode: { type: "string", enum: ["inline", "ruby", "table"], default: "inline" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Interlinear text and glossary" } }
        }
      },
      "/tools/septuagint_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Septuagint (LXX) Comparative Study Pack",
          description: "Greek Septuagint (LXX) text, Brenton English translation, Dead Sea Scrolls textual variants, and Hebrew Masoretic Text comparative exegesis.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 1:1-5", description: "Old Testament passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "LXX vs Hebrew comparative analysis" } }
        }
      },
      "/tools/ot_in_nt_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Old Testament in New Testament Study Pack",
          description: "Apostolic hermeneutics and Old Testament quotations/allusions in the New Testament with verbatim Hebrew MT, Greek LXX, and Greek NT comparative alignment.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Hebrews 8:8-12", description: "New Testament passage with OT quotations" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "OT in NT comparative alignment" } }
        }
      },
      "/tools/covenant_theology_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Covenant Theology Study Pack",
          description: "Redemptive covenants throughout Scripture with John Calvin, John Gill, and ISBE Encyclopedia insights.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 15:1-6", description: "Passage for covenant analysis" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Covenant theology analysis package" } }
        }
      },
      "/tools/commentary_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Multi-Commentary Comparative Study Pack",
          description: "Dynamic multi-commentary bundler allowing custom multi-perspective lookups across any subset of the 26 available commentators in a single call.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28", description: "Scripture reference" },
                    commentators: {
                      type: "array",
                      items: { type: "string" },
                      example: ["Henry", "JFB", "Calvin", "Spur"],
                      description: "List of commentary aliases"
                    }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Side-by-side commentary synthesis" } }
        }
      },
      "/tools/topic_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Topical Study Pack",
          description: "Bundles Nave's Topical Concordance, Torrey's New Topical Textbook, Easton's Bible Dictionary, and cross-references.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string", example: "Grace", description: "Biblical topic name" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["topic"]
                }
              }
            }
          },
          responses: { "200": { description: "Topical research bundle" } }
        }
      },

      // --- TIER 2: Specialized Single-Engine Tools ---
      // Group A: Scripture Texts & Translations
      "/tools/bible_lookup": {
        post: {
          tags: ["📖 Scripture Texts & Translations"],
          summary: "Bible Verse & Passage Lookup",
          description: "Retrieve verses from public domain Bible translations (BSB, NET, KJV, WEB, ASV, OHGB Hebrew/Greek, LXX).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 3:16", description: "Scripture reference" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV", "OHGB", "LXX"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Passage text and formatted output" } }
        }
      },
      "/tools/bible_search": {
        post: {
          tags: ["📖 Scripture Texts & Translations"],
          summary: "Full-Text Scripture Search",
          description: "Search the Bible for keywords or phrases across OT and NT.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "peace of God", description: "Search query" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV", "OHGB"], default: "BSB" },
                    book_filter: { type: "string", example: "Philippians", description: "Optional single book filter" },
                    limit: { type: "integer", default: 20 }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: { "200": { description: "Search results with matching verses" } }
        }
      },
      "/tools/parallel_passages": {
        post: {
          tags: ["📖 Scripture Texts & Translations"],
          summary: "Parallel Passages & Gospel Harmony",
          description: "Look up synoptic Gospel parallels and cross-testament narrative harmonies.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "Beatitudes", description: "Passage reference or event name" }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: { "200": { description: "Parallel passage comparisons" } }
        }
      },
      "/tools/daily_reading": {
        post: {
          tags: ["📖 Scripture Texts & Translations"],
          summary: "Daily Bible Reading Plan",
          description: "Retrieve scheduled readings from the 365-day whole-Bible reading plan with embedded text.",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    date: { type: "string", example: "2026-08-30", description: "Date in YYYY-MM-DD format (defaults to today)" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" },
                    include_text: { type: "boolean", default: true }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Daily reading schedule and Scripture" } }
        }
      },

      // Group B: Classical Commentaries & Cross-References
      "/tools/commentary_lookup": {
        post: {
          tags: ["💬 Classical Commentaries & Cross-References"],
          summary: "Classical Commentary Lookup",
          description: "Access 26 classical public-domain commentary sets and Tyndale Open Study Notes.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 1:1", description: "Scripture reference" },
                    version: { type: "string", example: "Henry", description: "Commentator identifier or alias" }
                  },
                  required: ["reference", "version"]
                }
              }
            }
          },
          responses: { "200": { description: "Commentary text" } }
        }
      },
      "/tools/cross_references": {
        post: {
          tags: ["💬 Classical Commentaries & Cross-References"],
          summary: "Treasury of Scripture Knowledge (TSK) Cross-References",
          description: "Retrieve cross-references for any Bible verse.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 3:16", description: "Verse reference" },
                    limit: { type: "integer", default: 15 }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "List of cross-references" } }
        }
      },

      // Group C: Original Languages & Textual Alignment
      "/tools/lexicon_lookup": {
        post: {
          tags: ["🏛 Original Languages & Textual Alignment"],
          summary: "Greek & Hebrew Lexicon Lookup",
          description: "Retrieve Strong's, TBESG/TBESH, Thayer's Greek, Brown-Driver-Briggs (BDB) Hebrew, or LSJ definitions.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    strongs_number: { type: "string", example: "G26", description: "Strong's number" },
                    lexicon: { type: "string", enum: ["strongs", "thayer", "bdb", "lsj", "step", "all"], default: "strongs" }
                  },
                  required: ["strongs_number"]
                }
              }
            }
          },
          responses: { "200": { description: "Lexicon definition entry" } }
        }
      },
      "/tools/morphology_lookup": {
        post: {
          tags: ["🏛 Original Languages & Textual Alignment"],
          summary: "Original Language Verse Morphology",
          description: "Retrieve word-by-word morphological parsing and Strong's numbers for Greek NT or Hebrew OT verses.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 1:1", description: "Single verse reference" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Word-by-word syntax parsing" } }
        }
      },
      "/tools/interlinear_lookup": {
        post: {
          tags: ["🏛 Original Languages & Textual Alignment"],
          summary: "Inline Word-by-Word Interlinear Lookup",
          description: "Retrieve continuous word-by-word Greek/Hebrew interlinear text.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 1:1-3", description: "Scripture reference" },
                    display_mode: { type: "string", enum: ["inline", "ruby", "table"], default: "inline" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Interlinear text" } }
        }
      },
      "/tools/septuagint_lookup": {
        post: {
          tags: ["🏛 Original Languages & Textual Alignment"],
          summary: "Greek Septuagint (LXX) & Brenton Lookup",
          description: "Look up Greek Septuagint (LXX) text, Brenton English translation, and textual divergence notes.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 1:1", description: "Old Testament passage" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Septuagint verses and notes" } }
        }
      },
      "/tools/ot_quotations_lookup": {
        post: {
          tags: ["🏛 Original Languages & Textual Alignment"],
          summary: "Old Testament Quotations & Allusions Lookup",
          description: "Look up Old Testament quotations, citations, allusions, and Septuagint bridge references.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Hebrews 8:8", description: "Passage reference" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: { "200": { description: "Quotation mapping and comparative citations" } }
        }
      },

      // Group D: Theology, Doctrines & Devotional Tools
      "/tools/theological_dictionary": {
        post: {
          tags: ["🏷️ Theology & Doctrinal Reference"],
          summary: "Theological Dictionary & Encyclopedia",
          description: "Search Tyndale, ISBE, Easton's, Smith's, Fausset's, Morrish, Vine's, or the combined classic reference collection. Explicit source requests do not silently fall back to another source.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    term: { type: "string", example: "Covenant", description: "Theological term or concept" },
                    source: { type: "string", enum: ["tyndale", "isbe", "easton", "smith", "fausset", "morrish", "vine", "collection"], default: "tyndale" }
                  },
                  required: ["term"]
                }
              }
            }
          },
          responses: { "200": { description: "Theological article entry" } }
        }
      },
      "/tools/topic_study": {
        post: {
          tags: ["🏷️ Theology & Doctrinal Reference"],
          summary: "Topical Concordance Lookup",
          description: "Search Nave's Topical Bible and Torrey's New Topical Textbook.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "Faith", description: "Topic keyword" }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: { "200": { description: "Topical concordance verses" } }
        }
      },
      "/tools/biblical_promises": {
        post: {
          tags: ["🏷️ Theology & Doctrinal Reference"],
          summary: "Biblical Promises for Faith & Prayer",
          description: "Retrieve topic-indexed biblical promises for encouragement and devotion.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string", example: "Peace", description: "Promise category" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" }
                  },
                  required: ["topic"]
                }
              }
            }
          },
          responses: { "200": { description: "Promises with Scripture text" } }
        }
      },

      // Group E: Historical, Geographical & Cultural Backgrounds
      "/tools/character_lookup": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Biblical Character Profiles & Genealogies",
          description: "Biographical details, scripture references, and ASCII relationship family trees.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "David", description: "Character name" }
                  },
                  required: ["name"]
                }
              }
            }
          },
          responses: { "200": { description: "Character profile and family tree" } }
        }
      },
      "/tools/location_lookup": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Biblical Geography & GPS Coordinates",
          description: "Geographical descriptions, GPS coordinates, and Google Maps links.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    location: { type: "string", example: "Jerusalem", description: "Place or site name" }
                  },
                  required: ["location"]
                }
              }
            }
          },
          responses: { "200": { description: "Location details with coordinates" } }
        }
      },
      "/tools/entity_disambiguation": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Biblical Entity Disambiguation",
          description: "Disambiguate biblical persons or locations sharing identical names (e.g. Mary, James, John, Zechariah, Herod).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Mary", description: "Biblical name to disambiguate" }
                  },
                  required: ["name"]
                }
              }
            }
          },
          responses: { "200": { description: "Disambiguated entity profiles and distinctions" } }
        }
      },
      "/tools/convert_ancient_units": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Ancient Coins, Weights & Measures Converter",
          description: "Convert ancient biblical weights, measures, distances, and currencies into modern metric, imperial, and labor purchasing power.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    unit: { type: "string", example: "Talent", description: "Ancient unit name" },
                    amount: { type: "number", default: 1, description: "Numeric quantity" }
                  },
                  required: ["unit"]
                }
              }
            }
          },
          responses: { "200": { description: "Converted modern equivalents and economic context" } }
        }
      },
      "/tools/bible_names": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Bible Name Meanings & Etymologies",
          description: "Etymology, original Hebrew/Greek roots, and spiritual significance of biblical names.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "Joshua", description: "Name to look up" }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: { "200": { description: "Name meaning and etymology" } }
        }
      },
      "/tools/chronology": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Biblical Timelines & Historical Eras",
          description: "Chronological timelines, historical periods, and biblical events.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "Exodus", description: "Event, figure, or era" }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: { "200": { description: "Chronological events and dates" } }
        }
      },
      "/tools/book_analysis": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Tyndale Book Guide",
          description: "Source-attributed concise or full book introductions from Tyndale Open Study Notes.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    book: { type: "string", example: "Romans", description: "Book name" },
                    detail: { type: "string", enum: ["summary", "full"], default: "summary", description: "Concise summary or full introduction" }
                  },
                  required: ["book"]
                }
              }
            }
          },
          responses: { "200": { description: "Source-attributed Tyndale book guide" } }
        }
      },
      "/tools/chapter_summary": {
        post: {
          tags: ["📜 Historical & Cultural Context"],
          summary: "Adam Clarke Chapter Summary",
          description: "Source-attributed chapter-opening synopsis from Adam Clarke's Commentary on the Bible.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    book: { type: "string", example: "Romans", description: "Book name" },
                    chapter: { type: "integer", example: 8, description: "Chapter number" }
                  },
                  required: ["book", "chapter"]
                }
              }
            }
          },
          responses: { "200": { description: "Chapter summary" } }
        }
      },

      // --- System Endpoints ---
      "/mcp": {
        get: {
          tags: ["System"],
          summary: "MCP Streamable HTTP Gateway",
          description: "Connect AI clients (Claude Desktop, Cursor, Antigravity) via JSON-RPC 2.0 or EventSource SSE stream.",
          responses: {
            "200": { description: "MCP Status or Streamable SSE connection" }
          }
        },
        post: {
          tags: ["System"],
          summary: "MCP JSON-RPC 2.0 Messages",
          description: "Execute MCP tools, prompts, and resources via JSON-RPC.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string", example: "2.0" },
                    id: { type: "integer", example: 1 },
                    method: { type: "string", example: "tools/list" },
                    params: { type: "object" }
                  },
                  required: ["jsonrpc", "method"]
                }
              }
            }
          },
          responses: {
            "200": { description: "MCP JSON-RPC response" }
          }
        }
      },
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health Check",
          description: "Server health and active capabilities.",
          responses: {
            "200": { description: "Health status" }
          }
        }
      }
    }
  };
}
