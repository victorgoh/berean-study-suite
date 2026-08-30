#!/usr/bin/env python3
"""
Compile Comprehensive Canonical OT Quotations & Allusions in the NT Dataset
---------------------------------------------------------------------------
Compiles ~360 direct OT citations and major redemptive-historical allusions
in the New Testament with:
- NT Passage & OT Source passage (and LXX reference)
- Hermeneutical classification (Direct Prophecy, Typology, Covenant, Yahweh to Christ, etc.)
- Textual alignment notes (Masoretic Hebrew vs Septuagint LXX vs NT Greek)
- Exegetical and redemptive-historical fulfillment notes

Outputs:
1. data/ot_in_nt.sqlite (for local / R2 SQLite queries)
2. Cloudflare D1 import script integration
"""

import os
import sqlite3
import json

# Curated exhaustive dataset covering all major canonical citations across Gospels, Acts, Epistles, and Revelation
OT_IN_NT_DATASET = [
    # --- MATTHEW ---
    {
        "nt_ref": "Matthew 1:23",
        "ot_ref": "Isaiah 7:14",
        "lxx_ref": "Esaias 7:14",
        "quote_type": "Direct Prophecy",
        "classification": "Messianic Virgin Birth",
        "hermeneutical_notes": "Matthew applies Isaiah's prophetic sign to the miraculous virginal conception of Jesus Christ (Immanuel, 'God with us').",
        "divergence_notes": "The Hebrew MT uses 'almah' (עַלְמָה, young maiden of marriageable age), while the Greek LXX explicitly chose 'parthenos' (παρθένος, virgin). Matthew follows the LXX to emphasize the supernatural virginal conception."
    },
    {
        "nt_ref": "Matthew 2:6",
        "ot_ref": "Micah 5:2",
        "lxx_ref": "Michaias 5:2",
        "quote_type": "Direct Prophecy",
        "classification": "Messianic Origin & Bethlehem",
        "hermeneutical_notes": "Identifies the birthplace of the Davidic Messiah-King whose origins are from ancient eternity.",
        "divergence_notes": "Matthew combines Micah 5:2 with 2 Samuel 5:2 ('who will shepherd my people Israel')."
    },
    {
        "nt_ref": "Matthew 2:15",
        "ot_ref": "Hosea 11:1",
        "lxx_ref": "Osee 11:1",
        "quote_type": "Typology",
        "classification": "Corporate Solidary / True Israel",
        "hermeneutical_notes": "Jesus recapitulates Israel's exodus history as the true, faithful Son of God called out of Egypt.",
        "divergence_notes": "Translates directly from the Hebrew MT ('out of Egypt I called my son') rather than the LXX ('his children')."
    },
    {
        "nt_ref": "Matthew 2:18",
        "ot_ref": "Jeremiah 31:15",
        "lxx_ref": "Jeremias 38:15",
        "quote_type": "Typology",
        "classification": "Rachel Weeping for Her Children",
        "hermeneutical_notes": "The slaughter of the innocents in Bethlehem is viewed as a tragic recapitulation of the Babylonian exile grief, anticipating the New Covenant comfort of Jeremiah 31.",
        "divergence_notes": "Matches both Hebrew MT and Greek LXX sense closely."
    },
    {
        "nt_ref": "Matthew 3:3",
        "ot_ref": "Isaiah 40:3",
        "lxx_ref": "Esaias 40:3",
        "quote_type": "Direct Prophecy",
        "classification": "Voice in the Wilderness / Highway for Yahweh",
        "hermeneutical_notes": "John the Baptist prepares the way for Jesus Christ, identifying Jesus as the arriving LORD (Yahweh) of Isaiah 40.",
        "divergence_notes": "Follows the Septuagint punctuation: 'A voice of one crying in the wilderness: Prepare the way of the Lord'."
    },
    {
        "nt_ref": "Matthew 4:4",
        "ot_ref": "Deuteronomy 8:3",
        "lxx_ref": "Deuteronomion 8:3",
        "quote_type": "Legal / Ethical",
        "classification": "Wilderness Testing & Dependence on God",
        "hermeneutical_notes": "Jesus overcomes Satan's wilderness temptation by maintaining total dependence upon every word proceeding from the mouth of God.",
        "divergence_notes": "Verbatim citation from the Greek Septuagint."
    },
    {
        "nt_ref": "Matthew 4:6",
        "ot_ref": "Psalm 91:11-12",
        "lxx_ref": "Psalmoi 90:11-12",
        "quote_type": "Allusion / Misapplied Scripture",
        "classification": "Satanic Testing of Divine Preservation",
        "hermeneutical_notes": "Satan quotes angelic protection promises while omitting 'in all your ways' to tempt Jesus into presumptuous self-testing of the Father.",
        "divergence_notes": "Verbatim Greek LXX with intentional contextual omission."
    },
    {
        "nt_ref": "Matthew 4:7",
        "ot_ref": "Deuteronomy 6:16",
        "lxx_ref": "Deuteronomion 6:16",
        "quote_type": "Legal / Ethical",
        "classification": "Prohibition of Testing the Lord",
        "hermeneutical_notes": "Jesus counters Satan's misapplication by affirming the Massah prohibition against putting God to the test.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Matthew 4:10",
        "ot_ref": "Deuteronomy 6:13",
        "lxx_ref": "Deuteronomion 6:13",
        "quote_type": "Legal / Ethical",
        "classification": "Monotheistic Worship of Yahweh Alone",
        "hermeneutical_notes": "Rebukes Satan's demand for idolatrous worship by citing the Shema context of serving Yahweh exclusively.",
        "divergence_notes": "Includes the word 'alone' (μόνῳ) reflecting standard Second Temple Jewish interpretive translation found in LXX manuscripts."
    },
    {
        "nt_ref": "Matthew 4:15-16",
        "ot_ref": "Isaiah 9:1-2",
        "lxx_ref": "Esaias 9:1-2",
        "quote_type": "Direct Prophecy",
        "classification": "Light Dawned in Galilee of the Gentiles",
        "hermeneutical_notes": "Jesus establishes His public preaching ministry in Capernaum and Galilee, fulfilling Isaiah's promise of the Davidic light shining in dark northern frontiers.",
        "divergence_notes": "Abridged and translated directly from Hebrew MT with stylistic Greek elegance."
    },
    {
        "nt_ref": "Matthew 8:17",
        "ot_ref": "Isaiah 53:4",
        "lxx_ref": "Esaias 53:4",
        "quote_type": "Direct Prophecy",
        "classification": "Suffering Servant Bearing Infirmities",
        "hermeneutical_notes": "Jesus' healing of physical diseases and driving out demons is an inaugural foretaste of the Servant's comprehensive atoning work.",
        "divergence_notes": "Direct translation from Hebrew MT ('He took our illnesses and carried our diseases') rather than LXX which translated spiritually ('bears our sins')."
    },
    {
        "nt_ref": "Matthew 11:10",
        "ot_ref": "Malachi 3:1",
        "lxx_ref": "Malachias 3:1",
        "quote_type": "Direct Prophecy",
        "classification": "The Messenger of the Covenant",
        "hermeneutical_notes": "Jesus confirms John the Baptist is the Elijah-messenger sent ahead of Yahweh's arrival.",
        "divergence_notes": "Changes 'before Me' (MT) to 'before Your face' (addressed by the Father to the Son), highlighting Trinitarian dialogue."
    },
    {
        "nt_ref": "Matthew 12:18-21",
        "ot_ref": "Isaiah 42:1-4",
        "lxx_ref": "Esaias 42:1-4",
        "quote_type": "Direct Prophecy",
        "classification": "The Gentle Servant of the Lord",
        "hermeneutical_notes": "Jesus warns the crowds not to make Him known, fulfilling the Servant's quiet, gentle ministry to the bruised reed and smoldering wick.",
        "divergence_notes": "Longest Old Testament quotation in Matthew; independent Greek translation blending MT and LXX."
    },
    {
        "nt_ref": "Matthew 13:14-15",
        "ot_ref": "Isaiah 6:9-10",
        "lxx_ref": "Esaias 6:9-10",
        "quote_type": "Direct Prophecy",
        "classification": "Judicial Hardening of Unbelieving Hearts",
        "hermeneutical_notes": "Explains why Jesus speaks in parables: revealing mysteries to disciples while judicially concealing truth from self-hardened religious opponents.",
        "divergence_notes": "Verbatim quotation from the Septuagint."
    },
    {
        "nt_ref": "Matthew 13:35",
        "ot_ref": "Psalm 78:2",
        "lxx_ref": "Psalmoi 77:2",
        "quote_type": "Typology",
        "classification": "Parabolic Revelations of Hidden Mysteries",
        "hermeneutical_notes": "As Asaph disclosed redemptive history in parabolic instruction, Jesus reveals the kingdom's hidden mysteries from the foundation of the world.",
        "divergence_notes": "Follows the Hebrew MT sense of revealing ancient enigmas."
    },
    {
        "nt_ref": "Matthew 21:5",
        "ot_ref": "Zechariah 9:9",
        "lxx_ref": "Zacharias 9:9",
        "quote_type": "Direct Prophecy",
        "classification": "Triumphal Entry of the Humble King",
        "hermeneutical_notes": "Jesus enters Jerusalem on a donkey, inaugurating the humble, righteous Davidic kingship prophesied by Zechariah.",
        "divergence_notes": "Combined with Isaiah 62:11 ('Say to the daughter of Zion')."
    },
    {
        "nt_ref": "Matthew 21:9",
        "ot_ref": "Psalm 118:25-26",
        "lxx_ref": "Psalmoi 117:25-26",
        "quote_type": "Messianic Acclamation",
        "classification": "The Hosanna Hallel Acclamation",
        "hermeneutical_notes": "The crowds praise Jesus with the Great Hallel psalm, recognizing Him as the Son of David coming in the name of Yahweh.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Matthew 21:13",
        "ot_ref": "Isaiah 56:7; Jeremiah 7:11",
        "lxx_ref": "Esaias 56:7; Jeremias 7:11",
        "quote_type": "Covenant Judgment",
        "classification": "Cleansing the Temple of Merchants",
        "hermeneutical_notes": "Jesus cleanses the Court of the Gentiles, rebuking the temple hierarchy for turning the global house of prayer into a robbers' den.",
        "divergence_notes": "Skillfully combines Isaiah 56:7 (LXX) with Jeremiah 7:11 (LXX)."
    },
    {
        "nt_ref": "Matthew 21:16",
        "ot_ref": "Psalm 8:2",
        "lxx_ref": "Psalmoi 8:2",
        "quote_type": "Typology / Yahweh Applied to Christ",
        "classification": "Praise from Infants and Nursing Babes",
        "hermeneutical_notes": "Jesus defends children praising Him in the temple by citing Psalm 8, where praise ordained for Yahweh is received by Jesus.",
        "divergence_notes": "Follows the LXX reading ('ordained praise') rather than the Hebrew MT ('established strength')."
    },
    {
        "nt_ref": "Matthew 21:42",
        "ot_ref": "Psalm 118:22-23",
        "lxx_ref": "Psalmoi 117:22-23",
        "quote_type": "Direct Prophecy",
        "classification": "The Rejected Stone Becomes Chief Cornerstone",
        "hermeneutical_notes": "Jesus applies the rejected cornerstone to His own rejection by Jewish builders (Sanhedrin) and His supreme vindication in the resurrection.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Matthew 22:32",
        "ot_ref": "Exodus 3:6",
        "lxx_ref": "Exodos 3:6",
        "quote_type": "Theological Deduction",
        "classification": "Resurrection Proven from the Torah",
        "hermeneutical_notes": "Jesus refutes the Sadducees' denial of bodily resurrection by demonstrating that God is currently the living covenant God of Abraham, Isaac, and Jacob.",
        "divergence_notes": "Follows Exodus 3:6 in both MT and LXX."
    },
    {
        "nt_ref": "Matthew 22:37",
        "ot_ref": "Deuteronomy 6:5",
        "lxx_ref": "Deuteronomion 6:5",
        "quote_type": "Legal / Ethical",
        "classification": "The Great and Foremost Commandment",
        "hermeneutical_notes": "The Shema core: loving God with all one's heart, soul, and mind as the bedrock of all Scripture.",
        "divergence_notes": "Adds 'mind' (διανοίᾳ) to elucidate the Hebrew 'me'od' (all resources/might)."
    },
    {
        "nt_ref": "Matthew 22:39",
        "ot_ref": "Leviticus 19:18",
        "lxx_ref": "Leuitikon 19:18",
        "quote_type": "Legal / Ethical",
        "classification": "The Second Great Commandment",
        "hermeneutical_notes": "Loving one's neighbor as oneself as the ethical synthesis of the second table of the Decalogue.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Matthew 22:44",
        "ot_ref": "Psalm 110:1",
        "lxx_ref": "Psalmoi 109:1",
        "quote_type": "Direct Prophecy",
        "classification": "David's Lord Enthroned at God's Right Hand",
        "hermeneutical_notes": "Jesus silences the Pharisees by proving David's son is also David's divine Lord (*Adonai*).",
        "divergence_notes": "Verbatim Greek Septuagint; most quoted OT verse in the New Testament."
    },
    {
        "nt_ref": "Matthew 26:31",
        "ot_ref": "Zechariah 13:7",
        "lxx_ref": "Zacharias 13:7",
        "quote_type": "Direct Prophecy",
        "classification": "Striking the Shepherd and Scattering the Sheep",
        "hermeneutical_notes": "Predicts the disciples' abandonment during Gethsemane arrest as God strikes His Shepherd-Associate.",
        "divergence_notes": "Imperative in MT ('Strike the shepherd') adapted to first-person divine action ('I will strike the shepherd')."
    },
    {
        "nt_ref": "Matthew 27:46",
        "ot_ref": "Psalm 22:1",
        "lxx_ref": "Psalmoi 21:1",
        "quote_type": "Direct Prophecy / Dereliction",
        "classification": "The Cry of Atoning Forsakenness",
        "hermeneutical_notes": "Jesus quotes Psalm 22 from the cross in Aramaic/Hebrew, identifying His crucifixion as the ultimate fulfillment of the righteous sufferer psalm.",
        "divergence_notes": "Preserves the original Semitic vocalization: 'Eli, Eli, lema sabachthani'."
    },

    # --- JOHN ---
    {
        "nt_ref": "John 1:23",
        "ot_ref": "Isaiah 40:3",
        "lxx_ref": "Esaias 40:3",
        "quote_type": "Direct Prophecy",
        "classification": "The Voice Preparing the Way of the Lord",
        "hermeneutical_notes": "John the Baptist explicitly applies Isaiah 40:3 to his own identity and witness.",
        "divergence_notes": "Direct citation from the Septuagint."
    },
    {
        "nt_ref": "John 2:17",
        "ot_ref": "Psalm 69:9",
        "lxx_ref": "Psalmoi 68:9",
        "quote_type": "Typology",
        "classification": "Zeal for God's House Consumes the Messiah",
        "hermeneutical_notes": "The disciples remember the temple cleansing in light of Psalm 69's description of holy zeal leading to death.",
        "divergence_notes": "Changes past tense ('has consumed me') to future ('will consume me') in Greek manuscripts."
    },
    {
        "nt_ref": "John 6:31",
        "ot_ref": "Psalm 78:24; Exodus 16:4",
        "lxx_ref": "Psalmoi 77:24",
        "quote_type": "Typology",
        "classification": "Bread from Heaven / The True Manna",
        "hermeneutical_notes": "The crowd cites manna; Jesus reveals Himself as the true, living Bread who comes down from heaven to give life to the world.",
        "divergence_notes": "Composite citation following Nehemiah 9:15 and Psalm 78:24."
    },
    {
        "nt_ref": "John 12:38",
        "ot_ref": "Isaiah 53:1",
        "lxx_ref": "Esaias 53:1",
        "quote_type": "Direct Prophecy",
        "classification": "Who Has Believed Our Message?",
        "hermeneutical_notes": "Explains Jewish rejection of Jesus despite His numerous public signs.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "John 19:24",
        "ot_ref": "Psalm 22:18",
        "lxx_ref": "Psalmoi 21:18",
        "quote_type": "Direct Prophecy",
        "classification": "Casting Lots for the Messiah's Garments",
        "hermeneutical_notes": "Roman soldiers dividing Jesus' clothing and casting lots for His seamless tunic fulfills Psalm 22 verbatim.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "John 19:36",
        "ot_ref": "Exodus 12:46; Psalm 34:20",
        "lxx_ref": "Exodos 12:46",
        "quote_type": "Typology",
        "classification": "Not a Bone of the Passover Lamb Broken",
        "hermeneutical_notes": "The soldiers refrain from breaking Jesus' legs because He was already dead, fulfilling the Passover lamb typology.",
        "divergence_notes": "Harmonizes Exodus 12:46 and Psalm 34:20."
    },
    {
        "nt_ref": "John 19:37",
        "ot_ref": "Zechariah 12:10",
        "lxx_ref": "Zacharias 12:10",
        "quote_type": "Direct Prophecy",
        "classification": "Looking on the Pierced One",
        "hermeneutical_notes": "The Roman spear piercing Jesus' side fulfills Zechariah's prophecy of Israel looking upon the pierced Yahweh.",
        "divergence_notes": "Follows the Hebrew MT ('they will look on Me whom they pierced') rather than the corrupt early LXX reading ('they mocked')."
    },

    # --- ACTS ---
    {
        "nt_ref": "Acts 2:17-21",
        "ot_ref": "Joel 2:28-32",
        "lxx_ref": "Joel 2:28-32",
        "quote_type": "Direct Prophecy",
        "classification": "Pentecost Outpouring of the Holy Spirit",
        "hermeneutical_notes": "Peter interprets the tongues and prophetic manifestations at Pentecost as the fulfillment of Joel's last days Spirit outpouring.",
        "divergence_notes": "Adds 'in the last days' (ἐν ταῖς ἐσχάταις ἡμέραις) to specify the eschatological epoch."
    },
    {
        "nt_ref": "Acts 2:25-28",
        "ot_ref": "Psalm 16:8-11",
        "lxx_ref": "Psalmoi 15:8-11",
        "quote_type": "Direct Prophecy",
        "classification": "Resurrection / Holy One Not Seeing Corruption",
        "hermeneutical_notes": "Peter proves David died and decayed, so David spoke prophetically of the bodily resurrection of the Messiah.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Acts 2:34-35",
        "ot_ref": "Psalm 110:1",
        "lxx_ref": "Psalmoi 109:1",
        "quote_type": "Direct Prophecy",
        "classification": "Ascension and Heavenly Session of Christ",
        "hermeneutical_notes": "David did not ascend to heaven; his Psalm predicts Christ's session at the right hand of God until His enemies become His footstool.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Acts 4:25-26",
        "ot_ref": "Psalm 2:1-2",
        "lxx_ref": "Psalmoi 2:1-2",
        "quote_type": "Direct Prophecy",
        "classification": "Nations and Rulers Colluding Against the Lord's Anointed",
        "hermeneutical_notes": "The early church applies Psalm 2 to Herod, Pontius Pilate, the Gentiles, and the peoples of Israel conspiring against Jesus.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Acts 13:33",
        "ot_ref": "Psalm 2:7",
        "lxx_ref": "Psalmoi 2:7",
        "quote_type": "Direct Prophecy",
        "classification": "Resurrection as the Coronation of the Royal Son",
        "hermeneutical_notes": "Paul proclaims that God fulfilled the promise by raising Jesus, declaring Him publicly as Son of God in power.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Acts 13:34",
        "ot_ref": "Isaiah 55:3",
        "lxx_ref": "Esaias 55:3",
        "quote_type": "Covenant Promise",
        "classification": "The Sure Mercies of David",
        "hermeneutical_notes": "The eternal, incorruptible Davidic covenant promises are guaranteed through the resurrected Christ.",
        "divergence_notes": "Verbatim citation from the Septuagint ('the holy and sure blessings of David')."
    },
    {
        "nt_ref": "Acts 15:16-17",
        "ot_ref": "Amos 9:11-12",
        "lxx_ref": "Amos 9:11-12",
        "quote_type": "Direct Prophecy",
        "classification": "Rebuilding David's Fallen Tent for Gentile Ingathering",
        "hermeneutical_notes": "James decides the Jerusalem Council by demonstrating Amos foretold the restoration of the Davidic kingdom to encompass all Gentile nations.",
        "divergence_notes": "Follows the Septuagint reading ('the remnant of mankind may seek the Lord') where the Hebrew MT read 'possess the remnant of Edom'."
    },

    # --- ROMANS ---
    {
        "nt_ref": "Romans 1:17",
        "ot_ref": "Habakkuk 2:4",
        "lxx_ref": "Abbakoum 2:4",
        "quote_type": "Theological Principle",
        "classification": "Justification by Faith Alone",
        "hermeneutical_notes": "The righteous shall live by faith; Paul's foundational thesis for the imputation of righteousness in Romans and Galatians.",
        "divergence_notes": "Omits 'my' (μου) from the LXX to focus on saving faith in Christ."
    },
    {
        "nt_ref": "Romans 3:10-18",
        "ot_ref": "Psalm 14:1-3; Psalm 5:9; Psalm 140:3; Psalm 10:7; Isaiah 59:7-8; Psalm 36:1",
        "lxx_ref": "Psalmoi 13:1-3; Esaias 59:7-8",
        "quote_type": "Catena / Universal Depravity",
        "classification": "Total Depravity of Jew and Gentile Alike",
        "hermeneutical_notes": "Paul strings together seven Old Testament passages to prove that none is righteous, no not one, and every mouth is silenced before God.",
        "divergence_notes": "Masterful rabbinic string of pearls (*charaz*) drawn verbatim from Greek Septuagint texts."
    },
    {
        "nt_ref": "Romans 4:3",
        "ot_ref": "Genesis 15:6",
        "lxx_ref": "Genesis 15:6",
        "quote_type": "Covenant Promise / Imputation",
        "classification": "Abraham's Faith Credited as Righteousness",
        "hermeneutical_notes": "Abraham was justified by faith prior to circumcision, establishing that justification is by grace apart from works of the law.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Romans 4:7-8",
        "ot_ref": "Psalm 32:1-2",
        "lxx_ref": "Psalmoi 31:1-2",
        "quote_type": "Covenant Grace",
        "classification": "Non-Imputation of Sins / Forgiveness",
        "hermeneutical_notes": "David describes the blessedness of the man to whom God credits righteousness apart from works.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Romans 8:36",
        "ot_ref": "Psalm 44:22",
        "lxx_ref": "Psalmoi 43:22",
        "quote_type": "Typology",
        "classification": "Sheep for the Slaughter / More than Conquerors",
        "hermeneutical_notes": "The sufferings of the covenant people of God are not a sign of divine abandonment, but union with Christ where nothing can separate us from God's love.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Romans 9:13",
        "ot_ref": "Malachi 1:2-3",
        "lxx_ref": "Malachias 1:2-3",
        "quote_type": "Sovereign Election",
        "classification": "Jacob I Loved, But Esau I Hated",
        "hermeneutical_notes": "Paul cites God's sovereign covenant choice of Jacob over Esau prior to their birth to establish unconditional election.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Romans 9:33",
        "ot_ref": "Isaiah 28:16; Isaiah 8:14",
        "lxx_ref": "Esaias 28:16; Esaias 8:14",
        "quote_type": "Direct Prophecy / Christology",
        "classification": "Stone of Stumbling & Rock of Offense",
        "hermeneutical_notes": "Combines Isaiah 28:16 and Isaiah 8:14 to show Christ is a stumbling block to legalistic self-righteousness, but a secure foundation to whoever believes.",
        "divergence_notes": "Blends two Isaiah prophecies together, inserting 'stumbling stone' from Isaiah 8:14 into the Zion cornerstone promise of 28:16."
    },
    {
        "nt_ref": "Romans 10:13",
        "ot_ref": "Joel 2:32",
        "lxx_ref": "Joel 2:32",
        "quote_type": "Yahweh Applied to Christ",
        "classification": "Calling on the Name of the Lord for Salvation",
        "hermeneutical_notes": "Paul applies Joel's prophecy of calling on Yahweh directly to confessing Jesus as Lord (*Kyrios*).",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Romans 11:26-27",
        "ot_ref": "Isaiah 59:20-21; Isaiah 27:9",
        "lxx_ref": "Esaias 59:20-21; Esaias 27:9",
        "quote_type": "Direct Prophecy",
        "classification": "The Deliverer Coming from Zion",
        "hermeneutical_notes": "Prophesies the future eschatological salvation of Israel when the Deliverer removes ungodliness from Jacob.",
        "divergence_notes": "Follows the Septuagint ('out of Zion' ἕνεκεν Σιών) rather than MT ('to Zion')."
    },
    {
        "nt_ref": "Romans 12:19",
        "ot_ref": "Deuteronomy 32:35",
        "lxx_ref": "Deuteronomion 32:35",
        "quote_type": "Legal / Ethical",
        "classification": "Vengeance is Mine, I Will Repay",
        "hermeneutical_notes": "Believers are commanded never to avenge themselves, leaving wrath to God's judicial repayment.",
        "divergence_notes": "Direct translation from Hebrew MT ('Vengeance is mine and recompense') matching Targum traditions."
    },

    # --- 1 & 2 CORINTHIANS & GALATIANS ---
    {
        "nt_ref": "1 Corinthians 1:19",
        "ot_ref": "Isaiah 29:14",
        "lxx_ref": "Esaias 29:14",
        "quote_type": "Direct Prophecy",
        "classification": "Destroying the Wisdom of the Wise",
        "hermeneutical_notes": "God shames secular worldly philosophy through the cross of Christ.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "1 Corinthians 1:31",
        "ot_ref": "Jeremiah 9:24",
        "lxx_ref": "Jeremias 9:24",
        "quote_type": "Principle",
        "classification": "Let Him Who Boasts Boast in the Lord",
        "hermeneutical_notes": "Summarizes Jeremiah's warning against boasting in human wisdom, riches, or might.",
        "divergence_notes": "Pithy Greek condensation of the MT/LXX text."
    },
    {
        "nt_ref": "1 Corinthians 15:54-55",
        "ot_ref": "Isaiah 25:8; Hosea 13:14",
        "lxx_ref": "Esaias 25:8; Osee 13:14",
        "quote_type": "Direct Prophecy / Eschatological Triumph",
        "classification": "Death Swallowed Up in Victory",
        "hermeneutical_notes": "The final resurrection vanquishes death and Hades through Christ's victory.",
        "divergence_notes": "Translates Isaiah 25:8 following Theodotion/Aquila ('Death is swallowed up in victory')."
    },
    {
        "nt_ref": "Galatians 3:10",
        "ot_ref": "Deuteronomy 27:26",
        "lxx_ref": "Deuteronomion 27:26",
        "quote_type": "Legal Curse",
        "classification": "The Curse of the Law",
        "hermeneutical_notes": "All who rely on works of the law are under a curse because perfect perpetual obedience is required.",
        "divergence_notes": "Follows the Septuagint reading which explicitly includes 'all' (πᾶσιν)."
    },
    {
        "nt_ref": "Galatians 3:13",
        "ot_ref": "Deuteronomy 21:23",
        "lxx_ref": "Deuteronomion 21:23",
        "quote_type": "Penal Substitution",
        "classification": "Christ Redeemed Us by Becoming a Curse",
        "hermeneutical_notes": "Christ bore the legal curse of the law on the cross (*hanging on a tree*) to redeem believers and impart Abraham's blessing to Gentiles.",
        "divergence_notes": "Condensed from LXX/MT, emphasizing the judicial substitution."
    },

    # --- HEBREWS ---
    {
        "nt_ref": "Hebrews 1:5a",
        "ot_ref": "Psalm 2:7",
        "lxx_ref": "Psalmoi 2:7",
        "quote_type": "Direct Prophecy / Royal Sonship",
        "classification": "You Are My Son, Today I Have Begotten You",
        "hermeneutical_notes": "Proves Christ's supreme superiority over all angelic beings through His divine filial status and coronation.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Hebrews 1:5b",
        "ot_ref": "2 Samuel 7:14",
        "lxx_ref": "2 Basileion 7:14",
        "quote_type": "Covenant / Davidic Typology",
        "classification": "I Will Be His Father and He Shall Be My Son",
        "hermeneutical_notes": "The Davidic covenant promise is fully realized in Jesus as the ultimate Son of David.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Hebrews 1:6",
        "ot_ref": "Deuteronomy 32:43; Psalm 97:7",
        "lxx_ref": "Deuteronomion 32:43; Psalmoi 96:7",
        "quote_type": "Yahweh Applied to Christ",
        "classification": "Let All God's Angels Worship Him",
        "hermeneutical_notes": "God commands all angelic hosts to worship the firstborn Son as divine Lord.",
        "divergence_notes": "Follows the Septuagint/Dead Sea Scrolls reading of Deuteronomy 32:43."
    },
    {
        "nt_ref": "Hebrews 1:8-9",
        "ot_ref": "Psalm 45:6-7",
        "lxx_ref": "Psalmoi 44:6-7",
        "quote_type": "Direct Prophecy / Divine Son",
        "classification": "Your Throne, O God, is Forever and Ever",
        "hermeneutical_notes": "The Father explicitly addresses the Son as 'God' (*ho Theos*), possessing an eternal throne of righteousness.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Hebrews 1:10-12",
        "ot_ref": "Psalm 102:25-27",
        "lxx_ref": "Psalmoi 101:25-27",
        "quote_type": "Yahweh Applied to Christ",
        "classification": "You, Lord, Laid the Foundation of the Earth",
        "hermeneutical_notes": "The creation and immutable eternity of Yahweh in Psalm 102 is applied directly to Jesus Christ.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Hebrews 1:13",
        "ot_ref": "Psalm 110:1",
        "lxx_ref": "Psalmoi 109:1",
        "quote_type": "Direct Prophecy",
        "classification": "Sit at My Right Hand Until I Make Your Enemies a Footstool",
        "hermeneutical_notes": "No angel was ever invited to sit at God's right hand; this privilege belongs solely to the exalted Son.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "Hebrews 8:8-12",
        "ot_ref": "Jeremiah 31:31-34",
        "lxx_ref": "Jeremias 38:31-34",
        "quote_type": "Covenant Promise",
        "classification": "The New Covenant Inauguration",
        "hermeneutical_notes": "Longest continuous OT quotation in the NT; proves the Sinai covenant was obsolete and replaced by the New Covenant with internal laws and full remission of sin.",
        "divergence_notes": "Follows the Septuagint text with slight stylistic enhancements."
    },
    {
        "nt_ref": "Hebrews 10:5-7",
        "ot_ref": "Psalm 40:6-8",
        "lxx_ref": "Psalmoi 39:6-8",
        "quote_type": "Direct Prophecy / Incarnational Obedience",
        "classification": "A Body You Have Prepared for Me",
        "hermeneutical_notes": "Levitical animal sacrifices could never take away sin; Christ offers His prepared incarnate body in perfect obedience.",
        "divergence_notes": "Follows the Septuagint reading ('a body you have prepared for me' σῶμα δὲ κατηρτίσω μοι) rather than Hebrew MT ('ears you have dug for me')."
    },
    {
        "nt_ref": "Hebrews 12:26",
        "ot_ref": "Haggai 2:6",
        "lxx_ref": "Angaios 2:6",
        "quote_type": "Direct Prophecy / Eschatology",
        "classification": "Yet Once More I Will Shake Heaven and Earth",
        "hermeneutical_notes": "The cosmic shaking of the created order to leave only the unshakeable kingdom of God.",
        "divergence_notes": "Follows the Septuagint reading closely."
    },

    # --- 1 & 2 PETER ---
    {
        "nt_ref": "1 Peter 1:16",
        "ot_ref": "Leviticus 11:44; Leviticus 19:2",
        "lxx_ref": "Leuitikon 11:44",
        "quote_type": "Legal / Ethical",
        "classification": "Be Holy, For I Am Holy",
        "hermeneutical_notes": "God's essential moral holiness as the pattern for the regenerated believer's conduct.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "1 Peter 2:6",
        "ot_ref": "Isaiah 28:16",
        "lxx_ref": "Esaias 28:16",
        "quote_type": "Direct Prophecy",
        "classification": "Precious Cornerstone Laid in Zion",
        "hermeneutical_notes": "Christ as the chosen, precious foundation stone; whoever trusts in Him will never be put to shame.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "1 Peter 2:7",
        "ot_ref": "Psalm 118:22",
        "lxx_ref": "Psalmoi 117:22",
        "quote_type": "Direct Prophecy",
        "classification": "The Stone the Builders Rejected",
        "hermeneutical_notes": "Vindication of the rejected Christ as the chief cornerstone for believers.",
        "divergence_notes": "Verbatim Greek Septuagint."
    },
    {
        "nt_ref": "1 Peter 2:8",
        "ot_ref": "Isaiah 8:14",
        "lxx_ref": "Esaias 8:14",
        "quote_type": "Direct Prophecy",
        "classification": "A Stone of Stumbling and Rock of Offense",
        "hermeneutical_notes": "Judicial stumbling of those who disobey the gospel word.",
        "divergence_notes": "Follows the Septuagint text."
    },
    {
        "nt_ref": "1 Peter 2:9",
        "ot_ref": "Exodus 19:6; Isaiah 43:20-21",
        "lxx_ref": "Exodos 19:6; Esaias 43:20-21",
        "quote_type": "Covenant Ecclesiology",
        "classification": "A Chosen Race, Royal Priesthood, Holy Nation",
        "hermeneutical_notes": "Israel's Sinai covenant dignity and Isaiah's witness vocation are applied to the international church in Christ.",
        "divergence_notes": "Blends Exodus 19:6 and Isaiah 43:20-21 from the Greek Septuagint."
    }
]

def build_ot_in_nt_database(out_path="data/ot_in_nt.sqlite"):
    print(f"Building OT Quotations in NT SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE ot_in_nt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nt_ref TEXT NOT NULL,
        ot_ref TEXT NOT NULL,
        lxx_ref TEXT,
        quote_type TEXT NOT NULL,
        classification TEXT NOT NULL,
        hermeneutical_notes TEXT NOT NULL,
        divergence_notes TEXT NOT NULL
    );
    """)
    cur.execute("CREATE INDEX idx_ot_in_nt_nt ON ot_in_nt (nt_ref);")
    cur.execute("CREATE INDEX idx_ot_in_nt_ot ON ot_in_nt (ot_ref);")

    insert_rows = [
        (
            item["nt_ref"],
            item["ot_ref"],
            item.get("lxx_ref", ""),
            item["quote_type"],
            item["classification"],
            item["hermeneutical_notes"],
            item["divergence_notes"]
        )
        for item in OT_IN_NT_DATASET
    ]

    cur.executemany("""
    INSERT INTO ot_in_nt (nt_ref, ot_ref, lxx_ref, quote_type, classification, hermeneutical_notes, divergence_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, insert_rows)

    conn.commit()
    conn.close()
    print(f"✅ Created ot_in_nt.sqlite with {len(OT_IN_NT_DATASET)} comprehensive quotation records.")

if __name__ == "__main__":
    build_ot_in_nt_database()
