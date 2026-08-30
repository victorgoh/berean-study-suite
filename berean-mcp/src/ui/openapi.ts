/**
 * Complete OpenAPI 3.1.0 Specification for Berean MCP Server
 * Auto-documents all 26 exegesis tools and composite study packs
 */

export function getOpenApiSpec(serverUrl: string = "https://berean-mcp.victorgoh.workers.dev"): object {
  return {
    openapi: "3.1.0",
    info: {
      title: "Berean MCP Server — Universal Bible Exegesis Engine",
      version: "1.0.0",
      description: "Enterprise-grade biblical exegesis API and Model Context Protocol (MCP) server powered by in-memory WASM SQLite, 26 classical public-domain commentary sets, and original Greek/Hebrew datasets.\n\nEcosystem repository: [https://github.com/victorgoh/berean-study-suite](https://github.com/victorgoh/berean-study-suite)",
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
      { name: "📖 Scripture & Exegesis", description: "Multi-version Bible text, keyword search, commentaries, and harmony" },
      { name: "🏛 Original Languages", description: "Hebrew & Greek lexicons (BDB, Thayer) and morphological syntax parsing" },
      { name: "📚 Topical & Reference", description: "Theological dictionaries, Nave's Topical Bible, promises, and biographical trees" },
      { name: "System", description: "MCP and server health endpoints" }
    ],
    paths: {
      "/tools/bible_lookup": {
        post: {
          tags: ["📖 Scripture & Exegesis"],
          summary: "Bible Verse & Passage Lookup",
          description: "Retrieve verses from public domain Bible translations (BSB, NET, KJV, WEB, ASV, OHGB Hebrew/Greek).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 3:16", description: "Scripture reference (e.g. 'John 3:16', 'Romans 8:28-30')" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV", "OHGB"], default: "BSB", description: "Bible translation version" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Passage text and formatted output" }
          }
        }
      },
      "/tools/bible_search": {
        post: {
          tags: ["📖 Scripture & Exegesis"],
          summary: "Full-Text Scripture Search",
          description: "Search the Bible for keywords or phrases across OT and NT.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string", example: "covenant of peace", description: "Search terms or phrase" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV"], default: "BSB" },
                    limit: { type: "integer", default: 10, description: "Maximum matches to return" }
                  },
                  required: ["query"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Search results with verse citations" }
          }
        }
      },
      "/tools/commentary_lookup": {
        post: {
          tags: ["📖 Scripture & Exegesis"],
          summary: "Classical Commentary Lookup",
          description: "Access 26 public-domain classical commentary sets (Matthew Henry, Jamieson-Fausset-Brown, Calvin, Spurgeon, Barnes, McLaren, etc.).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28", description: "Scripture reference" },
                    commentary: { 
                      type: "string", 
                      enum: ["Henry", "JFB", "Calvin", "MacL", "Barnes", "Spur", "HH", "Clarke", "Gill", "KD", "CECNT", "Pulpit", "Poole", "Trapp", "Wesley", "Benson", "Geneva", "Scofield", "Ryle", "Darby", "Bullinger", "EBC", "ECER", "Rob", "Vincent", "DBS"], 
                      default: "Henry",
                      description: "Commentary abbreviation"
                    }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Commentary exposition text" }
          }
        }
      },
      "/tools/cross_references": {
        post: {
          tags: ["📖 Scripture & Exegesis"],
          summary: "Treasury of Scripture Knowledge (TSK) Cross References",
          description: "Look up verified canonical cross-references from the Treasury of Scripture Knowledge.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28" },
                    limit: { type: "integer", default: 12 }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Cross-reference list" }
          }
        }
      },
      "/tools/parallel_passages": {
        post: {
          tags: ["📖 Scripture & Exegesis"],
          summary: "Gospel Parallels & Historical Harmony",
          description: "Find parallel events and synoptic Gospel harmonies matching a passage or topic.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Matthew 4:1-11", description: "Scripture reference or event title (e.g. 'Temptation of Jesus')" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Identified parallel passages and synoptic columns" }
          }
        }
      },
      "/tools/sermon_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Sermon Preparation Study Pack",
          description: "Comprehensive preaching study pack integrating Scripture, Spurgeon/MacLaren expositions, Nave's topical links, and TSK cross-references.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Psalm 23:1", description: "Sermon preaching text" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Complete sermon preparation bundle" }
          }
        }
      },
      "/tools/devotional_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Daily Devotional & Quiet Time Study Pack",
          description: "Generates rich personal quiet time study notes bundling Scripture, Maclaren exposition, Spurgeon adoration, Barnes practical remarks, Henry aphorisms, and Biblical promises.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Psalm 23:1-3", description: "Scripture passage for quiet time meditation" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "WEB", "ASV", "OHGB"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Devotional study pack output" }
          }
        }
      },
      "/tools/prayer_guide_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Scriptural Prayer Guide Study Pack",
          description: "Builds a devotional ACTS prayer guide using Scripture text, Spurgeon/Benson piety reflections, Wesley holiness examination, and covenant promises.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Psalm 51:1-12", description: "Scripture passage for prayer meditation" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "OHGB"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Scriptural prayer guide output" }
          }
        }
      },
      "/tools/lesson_creator_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Bible Lesson & Small Group Curriculum Pack",
          description: "Generates teaching outlines, discussion questions, background context (Ellicott), and practical applications (Barnes).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Luke 15:11-32", description: "Lesson Scripture passage" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "OHGB"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Lesson creator curriculum pack" }
          }
        }
      },
      "/tools/passage_exegesis_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Passage Exegesis Study Pack",
          description: "Academic exegesis pack integrating original language text, morphological parsing, Meyer (CECNT) / Keil & Delitzsch scholarly commentary, and Pulpit critical backgrounds.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Exegesis data pack" }
          }
        }
      },
      "/tools/covenant_theology_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Covenant & Redemptive-Historical Theology Pack",
          description: "Traces redemptive covenant progression with Calvin and Gill commentary, ISBE Covenant dictionary, and canonical cross references.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 15:6" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV", "OHGB"], default: "BSB" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Covenant theology study pack" }
          }
        }
      },
      "/tools/word_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Original Language Word Study Pack",
          description: "Lexical definitions (Thayer/BDB), Strong's concordances, and A.T. Robertson Word Pictures.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    strongs: { type: "string", example: "G26", description: "Strong's Concordance Number (e.g. G26, H1254)" },
                    reference: { type: "string", example: "John 3:16", description: "Optional reference context" }
                  },
                  required: ["strongs"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Word study pack" }
          }
        }
      },
      "/tools/topic_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Topical & Doctrinal Study Pack",
          description: "Systematic theological definitions (Easton) and scriptural anchor promises.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string", example: "Justification" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV"], default: "BSB" }
                  },
                  required: ["topic"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Topical study pack" }
          }
        }
      },
      "/tools/commentary_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs"],
          summary: "Multi-Commentary Comparative Pack",
          description: "Synthesizes multi-commentary side-by-side analysis for a passage.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Romans 8:28" },
                    commentators: {
                      type: "array",
                      items: { type: "string" },
                      default: ["Henry", "JFB", "Calvin", "MacL", "Barnes", "Spur"]
                    }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Comparative commentary compilation" }
          }
        }
      },
      "/tools/interlinear_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs", "🏛 Original Languages"],
          summary: "Original Language Interlinear Study Pack",
          description: "Generate an inline word-by-word Greek/Hebrew to English interlinear with continuous verse layout, grammatical parsing tags, and an automated lexical glossary.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    glossary_filter: { type: "string", enum: ["rare_and_notable", "all", "none"], default: "rare_and_notable", description: "Glossary filter mode" },
                    gloss_color: { type: "string", default: "#777777", description: "HTML hex color code for the English gloss (default: '#777777')" },
                    display_mode: { type: "string", enum: ["inline", "ruby", "table"], default: "inline", description: "Interlinear display layout mode: 'inline' (default), 'ruby' (stacked), or 'table' (structured grid)" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Standardized interlinear study pack bundle" }
          }
        }
      },
      "/tools/interlinear_lookup": {
        post: {
          tags: ["🏛 Original Languages"],
          summary: "Inline Interlinear Lookup (Alias)",
          description: "Word-by-word original language interlinear lookup with in-line glosses.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Philippians 4:4-8" },
                    glossary_filter: { type: "string", enum: ["rare_and_notable", "all_words", "none"], default: "rare_and_notable" },
                    gloss_color: { type: "string", default: "#888888" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Interlinear output" }
          }
        }
      },
      "/tools/ot_in_nt_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs", "📜 Exegesis & Theology"],
          summary: "Apostolic Hermeneutics & OT-in-NT Fulfillment Study Pack",
          description: "Comprehensive composite study pack analyzing Old Testament quotations and allusions in the New Testament with verbatim Hebrew MT, Greek LXX, and Greek NT comparative alignment.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Hebrews 8:8-12", description: "Passage reference containing OT citation or allusion" },
                    version: { type: "string", default: "BSB", description: "Bible translation version for English text" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Standardized OT-in-NT fulfillment study pack bundle" }
          }
        }
      },
      "/tools/ot_quotations_lookup": {
        post: {
          tags: ["📜 Exegesis & Theology", "🔗 Cross References"],
          summary: "OT Quotations & Allusions Lookup Engine",
          description: "Look up Old Testament quotations, citations, allusions, and Septuagint bridge references for any NT or OT passage.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Hebrews 8:8", description: "Passage reference to check for cross-testament citations" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "OT/NT quotation records and alignment data" }
          }
        }
      },
      "/tools/septuagint_study_pack": {
        post: {
          tags: ["⚡ Composite Study Packs", "🏛 Original Languages"],
          summary: "Greek Septuagint & Hebrew MT Comparative Study Pack",
          description: "Comprehensive composite study pack analyzing the Greek Septuagint (LXX), Brenton English translation, Dead Sea Scrolls textual variants, and Hebrew Masoretic Text comparative exegesis.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 1:1-5", description: "Old Testament Scripture reference" },
                    version: { type: "string", default: "BSB", description: "Bible translation version for standard English text" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Standardized Septuagint study pack bundle" }
          }
        }
      },
      "/tools/septuagint_lookup": {
        post: {
          tags: ["🏛 Original Languages"],
          summary: "Septuagint Greek & Brenton English Lookup",
          description: "Look up Greek Septuagint (LXX) text, Brenton English translation, and textual divergence notes for any Old Testament passage.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "Genesis 1:1", description: "Old Testament passage reference" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Septuagint Greek and Brenton English verses" }
          }
        }
      },
      "/tools/entity_disambiguation": {
        post: {
          tags: ["👤 Biblical People & Places"],
          summary: "Biblical Entity Disambiguation Engine",
          description: "Disambiguate biblical persons or locations sharing identical names (e.g. Mary, James, John, Zechariah, Herod), returning exact identities, lineages, roles, and biblical passages.",
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
          responses: {
            "200": { description: "Disambiguated entity records" }
          }
        }
      },
      "/tools/convert_ancient_units": {
        post: {
          tags: ["🏛 Original Languages", "⚖️ Biblical Metrology"],
          summary: "Ancient Biblical Units & Currency Converter",
          description: "Convert ancient biblical weights (Talent, Shekel, Mina), dry/liquid measurements (Cor, Ephah, Bath, Hin, Omer), distances (Cubit, Span, Stadion), and currencies (Denarius, Drachma, Stater, Talent, Mite) into modern metric, imperial, and labor-wage purchasing power.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    unit: { type: "string", example: "Talent", description: "Biblical unit to convert" },
                    amount: { type: "number", default: 1, description: "Quantity of the specified unit" }
                  },
                  required: ["unit"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Converted metric, imperial, and purchasing power equivalents" }
          }
        }
      },
      "/tools/lexicon_lookup": {
        post: {
          tags: ["🏛 Original Languages"],
          summary: "Greek (Thayer) & Hebrew (BDB) Lexicon Lookup",
          description: "Detailed original language definitions and etymological roots.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    strongs: { type: "string", example: "G26", description: "Strong's number (e.g. G26, H1254)" }
                  },
                  required: ["strongs"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Lexicon article" }
          }
        }
      },
      "/tools/morphology_lookup": {
        post: {
          tags: ["🏛 Original Languages"],
          summary: "Grammatical & Morphological Syntax Parsing",
          description: "Word-by-word grammatical tagging (part of speech, case, tense, voice, mood, gender).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reference: { type: "string", example: "John 1:1" }
                  },
                  required: ["reference"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Morphological breakdown table" }
          }
        }
      },
      "/tools/theological_dictionary": {
        post: {
          tags: ["🏛 Original Languages"],
          summary: "Theological Dictionary (TBESH / MCGED)",
          description: "Expositions from Theological Wordbook and Classic Greek/Hebrew Dictionaries.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    term: { type: "string", example: "Grace" },
                    dictionary: { type: "string", enum: ["all", "tbesh", "mcged"], default: "all" }
                  },
                  required: ["term"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Theological dictionary entry" }
          }
        }
      },
      "/tools/topic_study": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Nave's Topical Bible Theme Lookup",
          description: "Categorized biblical themes, topics, and classified Scripture verse lists.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string", example: "Love" }
                  },
                  required: ["topic"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Nave's Topical Bible entry" }
          }
        }
      },
      "/tools/biblical_promises": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Categorized Biblical Promises",
          description: "Find scriptural promises by topic, emotion, or covenant category.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category: { type: "string", example: "Peace" },
                    version: { type: "string", enum: ["BSB", "NET", "KJV"], default: "BSB" }
                  },
                  required: ["category"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Scriptural promises" }
          }
        }
      },
      "/tools/character_lookup": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Biblical Character Biographies & Lineages",
          description: "Look up biographical summaries, family trees, and pivotal life events for biblical figures.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "David" }
                  },
                  required: ["name"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Biographical summary" }
          }
        }
      },
      "/tools/location_lookup": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Biblical Geography & Locations",
          description: "Geographical coordinates, historical significance, and biblical mentions.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    location: { type: "string", example: "Jerusalem" }
                  },
                  required: ["location"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Geographical profile" }
          }
        }
      },
      "/tools/book_analysis": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Book Analysis & Structural Overview",
          description: "Authorship, dating, historical occasion, major theological themes, and canonical outline.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    book: { type: "string", example: "Romans" }
                  },
                  required: ["book"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Book introduction and outline" }
          }
        }
      },
      "/tools/chapter_summary": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Chapter Summary & Outline",
          description: "Concise summary and sectional outline of any biblical chapter.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    book: { type: "string", example: "John" },
                    chapter: { type: "integer", example: 1 }
                  },
                  required: ["book", "chapter"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Chapter outline" }
          }
        }
      },
      "/tools/bible_names": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Bible Names & Etymologies",
          description: "Find meanings and language etymologies of biblical names.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Immanuel" }
                  },
                  required: ["name"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Name etymology and definition" }
          }
        }
      },
      "/tools/chronology": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Biblical Chronology & Historical Timelines",
          description: "Timelines of biblical events and epochs (Patriarchs, Exodus, Monarchy, Life of Christ, etc.).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    period: { type: "string", example: "Patriarchs" }
                  },
                  required: ["period"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Chronological timeline" }
          }
        }
      },
      "/tools/daily_reading": {
        post: {
          tags: ["📚 Topical & Reference"],
          summary: "Daily Canonical Reading Plan",
          description: "Canonical reading plan for days 1 to 365.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    day: { type: "integer", default: 1, example: 1 }
                  },
                  required: ["day"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Daily readings" }
          }
        }
      },
      "/tools/get_available_resources": {
        post: {
          tags: ["📚 Topical & Reference"],
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
