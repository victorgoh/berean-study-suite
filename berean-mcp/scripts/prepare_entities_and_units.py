#!/usr/bin/env python3
"""
Compile Biblical Entity Disambiguation and Ancient Weights/Measures/Currency Database
--------------------------------------------------------------------------------------
Creates data/entities_units.sqlite with two high-speed indexed tables:
1. 'entities': Disambiguates figures and places sharing identical names in Scripture.
2. 'units': Standardized conversion ratios and purchasing power for biblical metrology.
"""

import os
import sqlite3

# Curated exhaustive disambiguation registry for the most frequently confused biblical figures and locations
DISAMBIGUATED_ENTITIES = [
    # --- MARY (6 distinct individuals) ---
    {
        "name": "Mary",
        "disambiguation_key": "Mary_Mother_of_Jesus",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία (Maria)",
        "role_era": "Mother of the Lord Jesus Christ; Wife of Joseph of Nazareth",
        "relationships": "Wife of Joseph; Mother of Jesus, James, Joseph, Judas, Simon; Relative of Elizabeth",
        "key_passages": "Matthew 1:18-25; Luke 1:26-56; Luke 2:1-52; John 19:25-27; Acts 1:14",
        "summary": "The virgin chosen by God to conceive and bear Jesus Christ through the Holy Spirit. Stood at the cross and was present with the apostles in the upper room at Pentecost."
    },
    {
        "name": "Mary",
        "disambiguation_key": "Mary_Magdalene",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία ἡ Μαγδαληνή",
        "role_era": "Disciple from Magdala; First witness to the Resurrection",
        "relationships": "Follower and patroness of Jesus' ministry",
        "key_passages": "Matthew 27:56; Mark 16:1-9; Luke 8:2; John 20:1-18",
        "summary": "Delivered from seven demons by Jesus; supported His ministry financially; witnessed the crucifixion and was the first to see the risen Christ."
    },
    {
        "name": "Mary",
        "disambiguation_key": "Mary_of_Bethany",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία",
        "role_era": "Sister of Martha and Lazarus; Devoted disciple",
        "relationships": "Sister of Martha and Lazarus",
        "key_passages": "Luke 10:38-42; John 11:1-45; John 12:1-8",
        "summary": "Sat at Jesus' feet to hear His word ('chosen the better part') and anointed Jesus' feet with expensive nard prior to His burial."
    },
    {
        "name": "Mary",
        "disambiguation_key": "Mary_Wife_of_Clopas",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία ἡ τοῦ Κλωπᾶ",
        "role_era": "Follower of Jesus; Witness of the crucifixion",
        "relationships": "Wife of Clopas; Mother of James the younger and Joses",
        "key_passages": "Matthew 27:56; Mark 15:40; John 19:25",
        "summary": "Stood near the cross of Jesus alongside Mary His mother and Mary Magdalene."
    },
    {
        "name": "Mary",
        "disambiguation_key": "Mary_Mother_of_John_Mark",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία",
        "role_era": "Early Church patroness in Jerusalem",
        "relationships": "Mother of John Mark (author of Mark's Gospel); Relative of Barnabas",
        "key_passages": "Acts 12:12; Colossians 4:10",
        "summary": "Provided her house in Jerusalem as a primary meeting and prayer center for the early church where Peter went after his miraculous prison escape."
    },
    {
        "name": "Mary",
        "disambiguation_key": "Mary_of_Rome",
        "entity_type": "Person",
        "strongs": "G3137",
        "original_lemma": "Μαρία",
        "role_era": "Christian worker in the Roman church",
        "relationships": "Co-worker commended by Paul",
        "key_passages": "Romans 16:6",
        "summary": "Commended by Paul in his greeting to Rome as one who 'worked very hard for you'."
    },

    # --- JAMES (4 distinct individuals) ---
    {
        "name": "James",
        "disambiguation_key": "James_Son_of_Zebedee",
        "entity_type": "Person",
        "strongs": "G2385",
        "original_lemma": "Ἰάκωβος (Iakōbos)",
        "role_era": "Apostle; Inner circle of Jesus; First apostolic martyr",
        "relationships": "Son of Zebedee; Brother of the Apostle John ('Sons of Thunder')",
        "key_passages": "Matthew 4:21-22; Matthew 17:1; Mark 3:17; Mark 14:33; Acts 12:1-2",
        "summary": "One of the three inner-circle disciples (Peter, James, John) present at the Transfiguration, Jairus' daughter, and Gethsemane. Martyred by Herod Agrippa I with the sword."
    },
    {
        "name": "James",
        "disambiguation_key": "James_Son_of_Alphaeus",
        "entity_type": "Person",
        "strongs": "G2385",
        "original_lemma": "Ἰάκωβος ὁ τοῦ Ἁλφαίου",
        "role_era": "Apostle of Jesus Christ (James the Younger / Less)",
        "relationships": "Son of Alphaeus (and Mary); Brother of Joses",
        "key_passages": "Matthew 10:3; Mark 3:18; Mark 15:40; Acts 1:13",
        "summary": "One of the Twelve Apostles chosen by Jesus to proclaim the kingdom."
    },
    {
        "name": "James",
        "disambiguation_key": "James_Brother_of_Jesus",
        "entity_type": "Person",
        "strongs": "G2385",
        "original_lemma": "Ἰάκωβος ὁ ἀδελφὸς τοῦ Κυρίου",
        "role_era": "Leader of the Jerusalem Church; Author of the Epistle of James",
        "relationships": "Half-brother of Jesus; Brother of Jude, Joses, Simon",
        "key_passages": "Matthew 13:55; 1 Corinthians 15:7; Galatians 1:19; Galatians 2:9; Acts 15:13-21; James 1:1",
        "summary": "Initially skeptical during Jesus' earthly ministry, came to saving faith after seeing the risen Christ. Presided over the Jerusalem Council in Acts 15 and authored the Epistle of James."
    },
    {
        "name": "James",
        "disambiguation_key": "James_Father_of_Judas",
        "entity_type": "Person",
        "strongs": "G2385",
        "original_lemma": "Ἰάκωβος",
        "role_era": "Father of an Apostle",
        "relationships": "Father of Judas not Iscariot (Thaddaeus / Lebbaeus)",
        "key_passages": "Luke 6:16; Acts 1:13",
        "summary": "Identified in the apostolic lists to distinguish the faithful apostle Judas from Judas Iscariot."
    },

    # --- JOHN (5 distinct individuals) ---
    {
        "name": "John",
        "disambiguation_key": "John_the_Baptist",
        "entity_type": "Person",
        "strongs": "G2491",
        "original_lemma": "Ἰωάννης ὁ Βαπτιστής",
        "role_era": "Prophet; Forerunner of the Messiah",
        "relationships": "Son of Zechariah and Elizabeth; Relative of Jesus",
        "key_passages": "Matthew 3:1-17; Matthew 11:7-14; Luke 1:5-80; John 1:19-36; Matthew 14:1-12",
        "summary": "The Elijah-prophet who prepared the way of the Lord, preached baptism of repentance, baptized Jesus in the Jordan, and was martyred by Herod Antipas."
    },
    {
        "name": "John",
        "disambiguation_key": "John_the_Apostle",
        "entity_type": "Person",
        "strongs": "G2491",
        "original_lemma": "Ἰωάννης ὁ Ἀπόστολος",
        "role_era": "Apostle; 'Beloved Disciple'; Author of Gospel, 1-3 John, Revelation",
        "relationships": "Son of Zebedee; Brother of James; Business partner of Simon Peter",
        "key_passages": "Matthew 4:21; John 13:23; John 19:26; John 20:2; Acts 3:1-11; Revelation 1:1-9",
        "summary": "Inner-circle apostle, reclined on Jesus' chest at the Last Supper, cared for Jesus' mother Mary, exiled to Patmos where he received the Apocalypse."
    },
    {
        "name": "John",
        "disambiguation_key": "John_Mark",
        "entity_type": "Person",
        "strongs": "G2491 / G3138",
        "original_lemma": "Ἰωάννης ὁ ἐπικαλούμενος Μᾶρκος",
        "role_era": "Evangelist; Companion of Paul, Barnabas, and Peter",
        "relationships": "Son of Mary of Jerusalem; Cousin of Barnabas",
        "key_passages": "Acts 12:12, 25; Acts 13:13; Acts 15:37-39; 2 Timothy 4:11; 1 Peter 5:13",
        "summary": "Accompanied Paul and Barnabas; later reconciled with Paul ('useful to me for ministry') and recorded Peter's preaching in the Gospel of Mark."
    },

    # --- ZECHARIAH (5 key individuals among the 30+ in Scripture) ---
    {
        "name": "Zechariah",
        "disambiguation_key": "Zechariah_the_Prophet",
        "entity_type": "Person",
        "strongs": "H2148",
        "original_lemma": "זְכַרְיָה (Zekharyah)",
        "role_era": "Post-exilic Minor Prophet & Priest (c. 520 BC)",
        "relationships": "Son of Berechiah, son of Iddo",
        "key_passages": "Zechariah 1:1; Ezra 5:1; Ezra 6:14; Nehemiah 12:16",
        "summary": "Contemporary of Haggai who encouraged the rebuilding of the Second Temple; prophesied extensively about the Messianic King (Zech 9:9 humble entry; Zech 11:12-13 thirty pieces of silver; Zech 12:10 pierced one)."
    },
    {
        "name": "Zechariah",
        "disambiguation_key": "Zechariah_Priest_Father_of_John_the_Baptist",
        "entity_type": "Person",
        "strongs": "G2197",
        "original_lemma": "Ζαχαρίας (Zacharias)",
        "role_era": "Priest of the division of Abijah (1st century BC)",
        "relationships": "Husband of Elizabeth; Father of John the Baptist",
        "key_passages": "Luke 1:5-79",
        "summary": "Righteous priest who received the angelic annunciation of John's birth from Gabriel in the temple; authored the Benedictus prophecy (Luke 1:67-79)."
    },
    {
        "name": "Zechariah",
        "disambiguation_key": "Zechariah_Son_of_Jehoiada",
        "entity_type": "Person",
        "strongs": "H2148",
        "original_lemma": "זְכַרְיָהוּ בֶן־יְהוֹיָדָע",
        "role_era": "Priest & Martyr in Judah (c. 825 BC)",
        "relationships": "Son of High Priest Jehoiada",
        "key_passages": "2 Chronicles 24:20-22; Matthew 23:35; Luke 11:51",
        "summary": "Confronted King Joash and the people for apostasy; stoned to death in the temple court ('May the LORD see and avenge'). Jesus cites him as the final OT canonical martyr."
    },
    {
        "name": "Zechariah",
        "disambiguation_key": "Zechariah_King_of_Israel",
        "entity_type": "Person",
        "strongs": "H2148",
        "original_lemma": "זְכַרְיָהוּ מֶלֶךְ יִשְׂרָאֵל",
        "role_era": "King of Northern Israel (c. 753 BC)",
        "relationships": "Son of Jeroboam II; Great-great-grandson of Jehu",
        "key_passages": "2 Kings 14:29; 2 Kings 15:8-12",
        "summary": "Reigned for only 6 months before being assassinated by Shallum, fulfilling God's promise that Jehu's dynasty would last four generations."
    },

    # --- HEROD (4 distinct rulers) ---
    {
        "name": "Herod",
        "disambiguation_key": "Herod_the_Great",
        "entity_type": "Person / Ruler",
        "strongs": "G2264",
        "original_lemma": "Ἡρῴδης ὁ Μέγας",
        "role_era": "King of Judea (37 BC – 4 BC); Idumean client king under Rome",
        "relationships": "Father of Archelaus, Antipas, and Philip",
        "key_passages": "Matthew 2:1-22; Luke 1:5",
        "summary": "Master builder (remodeled Jerusalem Temple, Masada, Caesarea Maritima); ordered the slaughter of the male infants in Bethlehem upon hearing of the birth of the King of the Jews."
    },
    {
        "name": "Herod",
        "disambiguation_key": "Herod_Antipas",
        "entity_type": "Person / Ruler",
        "strongs": "G2264",
        "original_lemma": "Ἡρῴδης Ἀντίπας",
        "role_era": "Tetrarch of Galilee and Perea (4 BC – AD 39)",
        "relationships": "Son of Herod the Great; Illegally married Herodias",
        "key_passages": "Matthew 14:1-12; Mark 6:14-29; Luke 9:7-9; Luke 13:31-32; Luke 23:6-12",
        "summary": "Executed John the Baptist for rebuking his marriage to Herodias; called 'that fox' by Jesus; mocked and questioned Jesus during His trial."
    },
    {
        "name": "Herod",
        "disambiguation_key": "Herod_Agrippa_I",
        "entity_type": "Person / Ruler",
        "strongs": "G2264",
        "original_lemma": "Ἡρῴδης Ἀγρίππας Α΄",
        "role_era": "King of Judea (AD 41 – AD 44)",
        "relationships": "Grandson of Herod the Great; Father of Agrippa II and Bernice",
        "key_passages": "Acts 12:1-24",
        "summary": "Persecuted the early church, executed James the brother of John, and imprisoned Peter; struck down by an angel and eaten by worms after accepting divine worship at Caesarea."
    },
    {
        "name": "Herod",
        "disambiguation_key": "Herod_Agrippa_II",
        "entity_type": "Person / Ruler",
        "strongs": "G2264",
        "original_lemma": "Ἡρῴδης Ἀγρίππας Β΄",
        "role_era": "King of Northern Territories (AD 50 – AD 93)",
        "relationships": "Son of Herod Agrippa I; Brother of Bernice and Drusilla",
        "key_passages": "Acts 25:13 – 26:32",
        "summary": "Heard Paul's defense at Caesarea alongside Festus, remarking 'In a short time would you persuade me to be a Christian?' and stated Paul could have been freed if he hadn't appealed to Caesar."
    }
]

# Standardized Ancient Biblical Metrology Database (Weights, Measures, Lengths, Currency)
BIBLICAL_UNITS_DATA = [
    # --- WEIGHTS ---
    {
        "unit_name": "Talent (Weight)",
        "category": "Weight",
        "testament": "OT / NT",
        "hebrew_greek": "כִּכָּר (Kikkar) / τάλαντον (Talanton)",
        "standard_ratio": "1 Talent = 60 Minas = 3,000 Shekels",
        "metric_equivalent": "34.2 kg (75.4 lbs)",
        "imperial_equivalent": "75.4 lbs",
        "purchasing_power_context": "The heaviest biblical weight unit; used for measuring gold, silver, and heavy metals. In silver, equivalent to ~6,000 days (20 years) of manual labor."
    },
    {
        "unit_name": "Mina",
        "category": "Weight",
        "testament": "OT / NT",
        "hebrew_greek": "מָנֶה (Maneh) / μνᾶ (Mna)",
        "standard_ratio": "1 Mina = 50 Shekels (OT) / 100 Drachmas (NT) = 1/60 Talent",
        "metric_equivalent": "570 grams (1.26 lbs)",
        "imperial_equivalent": "1.26 lbs (20.1 oz)",
        "purchasing_power_context": "In the NT (Parable of the Minas), 1 mina of silver was worth 100 denarii/drachmas (~100 days of manual labor wages)."
    },
    {
        "unit_name": "Shekel (Weight)",
        "category": "Weight",
        "testament": "OT",
        "hebrew_greek": "שֶׁקֶל (Sheqel)",
        "standard_ratio": "1 Shekel = 2 Bekas = 20 Gerahs",
        "metric_equivalent": "11.4 grams (0.4 oz)",
        "imperial_equivalent": "0.402 oz",
        "purchasing_power_context": "Standard Hebrew baseline weight unit; sanctuary shekel used for temple taxation and redemption of the firstborn."
    },
    {
        "unit_name": "Beka (Half-Shekel)",
        "category": "Weight",
        "testament": "OT",
        "hebrew_greek": "בֶּקַע (Beqa)",
        "standard_ratio": "1 Beka = 1/2 Shekel = 10 Gerahs",
        "metric_equivalent": "5.7 grams (0.2 oz)",
        "imperial_equivalent": "0.201 oz",
        "purchasing_power_context": "Exact per-person poll tax required of every adult male for the construction and upkeep of the tabernacle (Exod 38:26)."
    },
    {
        "unit_name": "Gerah",
        "category": "Weight",
        "testament": "OT",
        "hebrew_greek": "גֵּרָה (Gerah)",
        "standard_ratio": "1 Gerah = 1/20 Shekel",
        "metric_equivalent": "0.57 grams (8.8 grains)",
        "imperial_equivalent": "0.02 oz",
        "purchasing_power_context": "Smallest standard Hebrew weight unit, equal to the weight of a carob seed or barley grain."
    },

    # --- LENGTHS ---
    {
        "unit_name": "Cubit",
        "category": "Length",
        "testament": "OT / NT",
        "hebrew_greek": "אַמָּה (Ammah) / πῆχυς (Pēchys)",
        "standard_ratio": "1 Cubit = 2 Spans = 6 Handbreadths = 18 Inches",
        "metric_equivalent": "45.7 cm (0.457 m)",
        "imperial_equivalent": "18.0 inches (1.5 feet)",
        "purchasing_power_context": "Distance from the elbow to the tip of the middle finger. (Royal Egyptian/Babylonian cubit was ~20.6 inches / 7 handbreadths, used in Ezekiel 40:5)."
    },
    {
        "unit_name": "Span",
        "category": "Length",
        "testament": "OT",
        "hebrew_greek": "זֶרֶת (Zeret)",
        "standard_ratio": "1 Span = 1/2 Cubit = 3 Handbreadths",
        "metric_equivalent": "22.8 cm",
        "imperial_equivalent": "9.0 inches",
        "purchasing_power_context": "Width of the outstretched hand from thumb tip to little finger tip. Used for the High Priest's breastplate (Exod 28:16) and Goliath's height description."
    },
    {
        "unit_name": "Handbreadth",
        "category": "Length",
        "testament": "OT",
        "hebrew_greek": "טֶפַח (Tefach)",
        "standard_ratio": "1 Handbreadth = 1/6 Cubit = 4 Fingers",
        "metric_equivalent": "7.6 cm",
        "imperial_equivalent": "3.0 inches",
        "purchasing_power_context": "Width of the four fingers across the palm. Used for the thickness of the bronze sea in Solomon's Temple (1 Kings 7:26)."
    },
    {
        "unit_name": "Stadion (Furlong)",
        "category": "Length",
        "testament": "NT",
        "hebrew_greek": "στάδιον (Stadion)",
        "standard_ratio": "1 Stadion = 400 Cubits = 600 Greek Feet",
        "metric_equivalent": "185 meters",
        "imperial_equivalent": "607 feet (1/8 mile)",
        "purchasing_power_context": "Standard Greco-Roman distance for athletic tracks and city measurements (e.g. Emmaus was 60 stadia / ~7 miles from Jerusalem; New Jerusalem was 12,000 stadia in Rev 21:16)."
    },
    {
        "unit_name": "Sabbath Day's Journey",
        "category": "Length",
        "testament": "NT",
        "hebrew_greek": "σαββάτου ὁδός (Sabbatou Hodos)",
        "standard_ratio": "2,000 Cubits (based on Joshua 3:4 tabernacle distance)",
        "metric_equivalent": "914 meters (~0.91 km)",
        "imperial_equivalent": "3,000 feet (~0.57 miles)",
        "purchasing_power_context": "Maximum distance allowed for travel on the Sabbath under Second Temple rabbinic halakhah (Acts 1:12)."
    },

    # --- DRY MEASURES ---
    {
        "unit_name": "Cor / Homer",
        "category": "Dry Measure",
        "testament": "OT / NT",
        "hebrew_greek": "חֹמֶר (Chomer) / כֹּר (Kor) / κόρος (Koros)",
        "standard_ratio": "1 Cor/Homer = 10 Ephahs = 100 Omers",
        "metric_equivalent": "220 liters (6.24 bushels)",
        "imperial_equivalent": "58.1 US dry gallons (6.24 bushels)",
        "purchasing_power_context": "Standard donkey-load of grain. In the NT Parable of the Dishonest Manager (Luke 16:7), 100 cors of wheat represented the yield of ~100 acres."
    },
    {
        "unit_name": "Ephah",
        "category": "Dry Measure",
        "testament": "OT",
        "hebrew_greek": "אֵיפָה (Ephah)",
        "standard_ratio": "1 Ephah = 3 Seahs = 10 Omers = 1/10 Homer",
        "metric_equivalent": "22.0 liters",
        "imperial_equivalent": "5.81 US dry gallons (0.62 bushels)",
        "purchasing_power_context": "Standard Hebrew dry measure for flour and barley. A full bushel basket of grain."
    },
    {
        "unit_name": "Omer",
        "category": "Dry Measure",
        "testament": "OT",
        "hebrew_greek": "עֹמֶר (Omer)",
        "standard_ratio": "1 Omer = 1/10 Ephah",
        "metric_equivalent": "2.2 liters",
        "imperial_equivalent": "2.32 US dry quarts",
        "purchasing_power_context": "Daily manna ration gathered per person in the wilderness (Exod 16:16); adequate daily grain sustenance for one adult."
    },

    # --- LIQUID MEASURES ---
    {
        "unit_name": "Bath",
        "category": "Liquid Measure",
        "testament": "OT / NT",
        "hebrew_greek": "בַּת (Bat) / βάτος (Batos)",
        "standard_ratio": "1 Bath = 6 Hins = 72 Logs = Liquid equivalent of 1 Ephah",
        "metric_equivalent": "22.0 liters",
        "imperial_equivalent": "5.81 US liquid gallons",
        "purchasing_power_context": "Standard Hebrew liquid unit for wine and olive oil (Luke 16:6 100 baths of oil)."
    },
    {
        "unit_name": "Hin",
        "category": "Liquid Measure",
        "testament": "OT",
        "hebrew_greek": "הִין (Hin)",
        "standard_ratio": "1 Hin = 1/6 Bath = 12 Logs",
        "metric_equivalent": "3.67 liters",
        "imperial_equivalent": "0.97 US liquid gallons (3.88 quarts)",
        "purchasing_power_context": "Used for sacrificial libations of wine and oil in the Levitical offerings (Exod 29:40)."
    },
    {
        "unit_name": "Log",
        "category": "Liquid Measure",
        "testament": "OT",
        "hebrew_greek": "לֹג (Log)",
        "standard_ratio": "1 Log = 1/12 Hin = 1/72 Bath",
        "metric_equivalent": "0.31 liters (305 ml)",
        "imperial_equivalent": "0.65 US pints (10.3 fl oz)",
        "purchasing_power_context": "Smallest Hebrew liquid measure, used for the oil in the cleansing ritual of the leper (Lev 14:10)."
    },

    # --- CURRENCY & COINAGE ---
    {
        "unit_name": "Denarius",
        "category": "Currency",
        "testament": "NT",
        "hebrew_greek": "δηνάριον (Dēnarion)",
        "standard_ratio": "1 Denarius = 1 Roman silver coin (approx. 3.85g silver)",
        "metric_equivalent": "3.85 grams of 95% silver",
        "imperial_equivalent": "0.136 oz silver",
        "purchasing_power_context": "Standard daily wage for a common day-laborer or Roman soldier (Matt 20:2). Good Samaritan gave the innkeeper 2 denarii (~2 days lodging/food)."
    },
    {
        "unit_name": "Drachma",
        "category": "Currency",
        "testament": "NT",
        "hebrew_greek": "δραχμή (Drachmē)",
        "standard_ratio": "1 Drachma = Greek silver coin equivalent to 1 Roman Denarius",
        "metric_equivalent": "3.4 - 3.8 grams silver",
        "imperial_equivalent": "0.13 oz silver",
        "purchasing_power_context": "Standard Greek daily laborer wage (Luke 15:8 Parable of the Lost Coin)."
    },
    {
        "unit_name": "Shekel (Coin) / Tetradrachm / Stater",
        "category": "Currency",
        "testament": "OT / NT",
        "hebrew_greek": "שֶׁקֶל (Sheqel) / στατήρ (Statēr)",
        "standard_ratio": "1 Tyrian Shekel / Stater = 4 Drachmas = 4 Denarii",
        "metric_equivalent": "14.2 grams silver (Tyrian standard)",
        "imperial_equivalent": "0.5 oz silver",
        "purchasing_power_context": "Annual temple tax was 1/2 shekel (didrachm) per adult male. In Matthew 17:27, the stater found in the fish's mouth paid the tax for both Jesus and Peter."
    },
    {
        "unit_name": "Talent (Currency)",
        "category": "Currency",
        "testament": "NT",
        "hebrew_greek": "τάλαντον (Talanton)",
        "standard_ratio": "1 Talent = 6,000 Denarii / Drachmas",
        "metric_equivalent": "Approx. 23 - 30 kg silver",
        "imperial_equivalent": "50 - 66 lbs silver",
        "purchasing_power_context": "Astronomical sum representing ~20 years (6,000 days) of continuous daily wages for an ordinary laborer. The unmerciful servant owed 10,000 talents (~200,000 years of labor—an unpayable human debt)."
    },
    {
        "unit_name": "Lepton (Mite)",
        "category": "Currency",
        "testament": "NT",
        "hebrew_greek": "λεπτόν (Lepton)",
        "standard_ratio": "1 Lepton = 1/2 Quadrans = 1/128 Denarius",
        "metric_equivalent": "Tiny bronze coin (approx. 1.5 - 2.0 grams bronze)",
        "imperial_equivalent": "Small copper coin",
        "purchasing_power_context": "Smallest coin in circulation in Judea. In Mark 12:42, the poor widow gave two lepta ('which make a penny / quadrans'), representing all she had to live on."
    }
]

def build_entities_and_units_database(out_path="data/entities_units.sqlite"):
    print(f"Building Biblical Entities & Units SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()

    # 1. Entities table
    cur.execute("""
    CREATE TABLE entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        disambiguation_key TEXT NOT NULL UNIQUE,
        entity_type TEXT NOT NULL,
        strongs TEXT,
        original_lemma TEXT,
        role_era TEXT NOT NULL,
        relationships TEXT,
        key_passages TEXT NOT NULL,
        summary TEXT NOT NULL
    );
    """)
    cur.execute("CREATE INDEX idx_entities_name ON entities (name);")
    cur.execute("CREATE INDEX idx_entities_key ON entities (disambiguation_key);")

    # 2. Units table
    cur.execute("""
    CREATE TABLE units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_name TEXT NOT NULL,
        category TEXT NOT NULL,
        testament TEXT NOT NULL,
        hebrew_greek TEXT NOT NULL,
        standard_ratio TEXT NOT NULL,
        metric_equivalent TEXT NOT NULL,
        imperial_equivalent TEXT NOT NULL,
        purchasing_power_context TEXT NOT NULL
    );
    """)
    cur.execute("CREATE INDEX idx_units_name ON units (unit_name);")
    cur.execute("CREATE INDEX idx_units_category ON units (category);")

    # Populate entities
    entity_rows = [
        (
            e["name"],
            e["disambiguation_key"],
            e["entity_type"],
            e.get("strongs", ""),
            e.get("original_lemma", ""),
            e["role_era"],
            e.get("relationships", ""),
            e["key_passages"],
            e["summary"]
        )
        for e in DISAMBIGUATED_ENTITIES
    ]
    cur.executemany("""
    INSERT INTO entities (name, disambiguation_key, entity_type, strongs, original_lemma, role_era, relationships, key_passages, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, entity_rows)

    # Populate units
    unit_rows = [
        (
            u["unit_name"],
            u["category"],
            u["testament"],
            u["hebrew_greek"],
            u["standard_ratio"],
            u["metric_equivalent"],
            u["imperial_equivalent"],
            u["purchasing_power_context"]
        )
        for u in BIBLICAL_UNITS_DATA
    ]
    cur.executemany("""
    INSERT INTO units (unit_name, category, testament, hebrew_greek, standard_ratio, metric_equivalent, imperial_equivalent, purchasing_power_context)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, unit_rows)

    conn.commit()
    conn.close()
    print(f"✅ Created entities_units.sqlite with {len(DISAMBIGUATED_ENTITIES)} disambiguated entities and {len(BIBLICAL_UNITS_DATA)} metrology units.")

if __name__ == "__main__":
    build_entities_and_units_database()
