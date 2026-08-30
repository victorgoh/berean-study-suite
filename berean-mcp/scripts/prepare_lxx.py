#!/usr/bin/env python3
"""
Compile Septuagint (LXX) Greek and Brenton English Bible Database
-----------------------------------------------------------------
Creates data/bibles/LXX.bible in standard Berean Bible SQLite format:
Table 'Verses': Book (INTEGER), Chapter (INTEGER), Verse (INTEGER), Scripture (TEXT - Greek), English (TEXT - Brenton)

Includes key Old Testament canonical books and divergence notes.
"""

import os
import sqlite3

# Curated canonical Septuagint benchmark passages with Greek Rahlfs, Brenton English, and MT divergence notes
LXX_CANONICAL_DATA = [
    # --- GENESIS 1 ---
    (1, 1, 1, "Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν.", "In the beginning God made the heaven and the earth.", "Identical in meaning to MT בְּרֵאשִׁית בָּרָא אֱלֹהִים."),
    (1, 1, 2, "ἡ δὲ γῆ ἦν ἀόρατος καὶ ἀκατασκεύαστος, καὶ σκότος ἐπάνω τῆς ἀβύσσου, καὶ πνεῦμα θεοῦ ἐπεφέρετο ἐπάνω τοῦ ὕδατος.", "But the earth was unsightly and unfurnished, and darkness was over the deep, and the Spirit of God moved over the water.", "LXX interprets 'tohu va-vohu' (תֹהוּ וָבֹהוּ) as 'unseen and unformed' (ἀόρατος καὶ ἀκατασκεύαστος)."),
    (1, 1, 3, "καὶ εἶπεν ὁ θεός· Γενηθήτω φῶς. καὶ ἐγένετο φῶς.", "And God said, Let there be light: and there was light.", "Classic fiat creation formula: Γενηθήτω φῶς."),
    (1, 1, 4, "καὶ εἶδεν ὁ θεὸς τὸ φῶς ὅτι καλόν. καὶ διεχώρισεν ὁ θεὸς ἀνὰ μέσον τοῦ φωτὸς καὶ ἀνὰ μέσον τοῦ σκότους.", "And God saw the light that it was good, and God divided between the light and the darkness.", "Translates 'tov' (טוֹב) as 'kalon' (καλόν, beautiful/good)."),
    (1, 1, 5, "καὶ ἐκάλεσεν ὁ θεὸς τὸ φῶς ἡμέραν καὶ τὸ σκότος ἐκάλεσεν νύκτα. καὶ ἐγένετο ἑσπέρα καὶ ἐγένετο πρωΐ, ἡμέρα μία.", "And God called the light Day, and the darkness he called Night, and there was evening and there was morning, the first day.", "Uses 'hēmera mia' (ἡμέρα μία, day one), preserving the Hebrew cardinal 'yom echad' (יוֹם אֶחָד)."),

    # --- GENESIS 4:8 (Famous Variant) ---
    (1, 4, 8, "καὶ εἶπεν Κάιν πρὸς Ἅβελ τὸν ἀδελφὸν αὐτοῦ· Διέλθωμεν εἰς τὸ πεδίον. καὶ ἐγένετο ἐν τῷ εἶναι αὐτοὺς ἐν τῷ πεδίῳ, ἀνέστη Κάιν ἐπὶ Ἅβελ τὸν ἀδελφὸν αὐτοῦ καὶ ἀπέκτεινεν αὐτόν.", "And Cain said to Abel his brother, Let us go out into the plain. And it came to pass that when they were in the plain Cain rose up against Abel his brother, and slew him.", "The Septuagint preserves the spoken phrase missing in the Hebrew MT ('Let us go into the field' / Διέλθωμεν εἰς τὸ πεδίον), also corroborated by the Samaritan Pentateuch, Syriac Peshitta, and Vulgate."),

    # --- EXODUS 1:5 (75 vs 70 souls - Quoted by Stephen in Acts 7:14) ---
    (2, 1, 5, "Ἰωσὴφ δὲ ἦν ἐν Αἰγύπτῳ. ἦσαν δὲ πᾶσαι ψυχαὶ ἐξ Ἰακὼβ πέντε καὶ ἑβδομήκοντα.", "And Joseph was in Egypt. And all the souls that came out of Jacob were seventy-five.", "The LXX reads 75 souls (πέντε καὶ ἑβδομήκοντα), reflecting Joseph's expanded family; quoted verbatim by Stephen in Acts 7:14, corroborated by Dead Sea Scroll 4QExod."),

    # --- EXODUS 3:14 (Divine Name) ---
    (2, 3, 14, "καὶ εἶπεν ὁ θεὸς πρὸς Μωυσῆν· Ἐγώ εἰμι ὁ ὤν. καὶ εἶπεν· Οὕτως ἐρεῖς τοῖς υἱοῖς Ἰσραήλ· Ὁ ὢν ἀπέσταλκέν με πρὸς ὑμᾶς.", "And God spoke to Moses, saying, I am THE BEING; and he said, Thus shall you say to the children of Israel, THE BEING has sent me to you.", "LXX translates 'Ehyeh Asher Ehyeh' (אֶהְיֶה אֲשֶׁר אֶהְיֶה) as 'Egō eimi ho Ōn' (Ἐγώ εἰμι ὁ ὤν, 'I am the Existing One'), the theological backdrop for John 8:58 and Revelation 1:4."),

    # --- DEUTERONOMY 32:43 (Quoted in Hebrews 1:6) ---
    (5, 32, 43, "Εὐφράνθητε, οὐρανοί, ἅμα αὐτῷ, καὶ προσκυνησάτωσαν αὐτῷ πάντες ἄγγελοι θεοῦ·", "Rejoice, ye heavens, with him, and let all the angels of God worship him;", "The LXX includes 'let all the angels of God worship him' (προσκυνησάτωσαν αὐτῷ πάντες ἄγγελοι θεοῦ), which is missing in the Masoretic Text but found in Dead Sea Scroll 4QDeut; quoted verbatim in Hebrews 1:6."),

    # --- PSALM 22 (21 LXX) ---
    (19, 22, 1, "Ὁ θεὸς ὁ θεός μου, πρόσχες μοι· ἵνα τί ἐγκατέλιπές με; μακρὰν ἀπὸ τῆς σωτηρίας μου οἱ λόγοι τῶν παραπτωμάτων μου.", "O God, my God, attend to me: why have you forsaken me? the words of my transgressions are far from my salvation.", "Quoted by Jesus on the cross (Matt 27:46, Mark 15:34)."),
    (19, 22, 16, "ὅτι ἐκύκλωσάν με κύνες πολλοί, συναγωγὴ πονηρευομένων περιέσχον με· ὤρυξαν χεῖράς μου καὶ πόδας μου.", "For many dogs have compassed me: an assembly of the wicked has enclosed me: they pierced my hands and my feet.", "LXX reads 'ōryxan' (ὤρυξαν, 'they pierced/dug') hands and feet, supporting the crucifixion prophecy, whereas MT pointed as 'ka-ari' ('like a lion')."),

    # --- PSALM 40:6 (39:7 LXX - Quoted in Hebrews 10:5) ---
    (19, 40, 6, "θυσίαν καὶ προσφορὰν οὐκ ἠθέλησας, σῶμα δὲ κατηρτίσω μοι· ὁλοκαύτωμα καὶ περὶ ἁμαρτίας οὐκ ᾔτησας.", "Sacrifice and offering you did not desire; but a body you have prepared me: whole burnt offering and sacrifice for sin you did not require.", "LXX reads 'a body you have prepared for me' (σῶμα δὲ κατηρτίσω μοι), where Hebrew MT reads 'ears you have dug for me'; quoted verbatim in Hebrews 10:5."),

    # --- PSALM 110:1 (109:1 LXX) ---
    (19, 110, 1, "Εἶπεν ὁ κύριος τῷ κυρίῳ μου· Κάθου ἐκ δεξιῶν μου, ἕως ἂν θῶ τοὺς ἐχθρούς σου ὑποπόδιον τῶν ποδῶν σου.", "The Lord said to my Lord, Sit thou on my right hand, until I make your enemies your footstool.", "Messianic session; most quoted verse in the NT."),

    # --- ISAIAH 7:14 (Virgin Birth) ---
    (23, 7, 14, "διὰ τοῦτο δώσει κύριος αὐτὸς ὑμῖν σημεῖον· ἰδοὺ ἡ παρθένος ἐν γαστρὶ ἕξει καὶ τέξεται υἱόν, καὶ καλέσεις τὸ ὄνομα αὐτοῦ Ἐμμανουήλ.", "Therefore the Lord himself shall give you a sign; behold, the virgin shall conceive in the womb, and bear a son, and you shall call his name Emmanuel.", "LXX chooses 'hē parthenos' (ἡ παρθένος, the virgin) translating 'ha-almah' (הָעַלְמָה); quoted in Matthew 1:23."),

    # --- ISAIAH 53:7 (Suffering Servant in Acts 8:32-33) ---
    (23, 53, 7, "καὶ αὐτὸς διὰ τὸ κεκακῶσθαι οὐκ ἀνοίγει τὸ στόμα· ὡς πρόβατον ἐπὶ σφαγὴν ἤχθη, καὶ ὡς ἀμνὸς ἐναντίον τοῦ κείροντος αὐτὸν ἄφωνος, οὕτως οὐκ ἀνοίγει τὸ στόμα αὐτοῦ.", "He was led as a sheep to the slaughter, and as a lamb silent before his shearer, so he opens not his mouth.", "Quoted by the Ethiopian Eunuch and explained by Philip in Acts 8:32-33."),

    # --- JEREMIAH 31:31-34 (38:31-34 LXX - New Covenant in Hebrews 8) ---
    (24, 31, 31, "Ἰδοὺ ἡμέραι ἔρχονται, φησὶν κύριος, καὶ διαθήσομαι τῷ οἴκῳ Ἰσραὴλ καὶ τῷ οἴκῳ Ἰούδα διαθήκην καινήν,", "Behold, the days come, says the Lord, when I will make a new covenant with the house of Israel, and with the house of Judah:", "Foundation of New Covenant theology; quoted verbatim in Hebrews 8:8-12.")
]

def build_lxx_database(out_path="data/bibles/LXX.bible"):
    print(f"Building Septuagint (LXX) SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE Verses (
        Book INTEGER,
        Chapter INTEGER,
        Verse INTEGER,
        Scripture TEXT,
        English TEXT,
        Divergence TEXT
    );
    """)
    cur.execute("CREATE INDEX idx_lxx_bcv ON Verses (Book, Chapter, Verse);")

    cur.executemany("""
    INSERT INTO Verses (Book, Chapter, Verse, Scripture, English, Divergence)
    VALUES (?, ?, ?, ?, ?, ?);
    """, LXX_CANONICAL_DATA)

    conn.commit()
    conn.close()
    print(f"✅ Created LXX.bible with {len(LXX_CANONICAL_DATA)} indexed Septuagint records.")

if __name__ == "__main__":
    build_lxx_database()
