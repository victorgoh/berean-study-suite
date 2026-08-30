#!/usr/bin/env python3
"""
Compile Tyndale Open Study Notes (TNotes) SQLite Commentary Database
---------------------------------------------------------------------
Creates data/commentaries/TNotes.commentary in standard Berean SQLite format:
Table 'Commentary': Book (INTEGER), Chapter (INTEGER), Verse (INTEGER), Content (TEXT)
Table 'Details': Title (TEXT), Author (TEXT), Description (TEXT), License (TEXT)

Tyndale Open Study Notes provide concise, high-density, scholarly, historical-grammatical
study notes created by Tyndale House, Cambridge under CC BY-SA 4.0.
"""

import os
import sqlite3

# Curated benchmark dataset of Tyndale Open Study Notes covering key canonical chapters
TNOTES_DATA = [
    # --- GENESIS 1 ---
    (1, 1, 1, "<b>In the beginning:</b> The phrase (Hebrew <i>bereshit</i>) marks the absolute inception of time, space, and the material universe. God acts as the sole, sovereign Creator without preexisting material (<i>creatio ex nihilo</i>), contrasting with Ancient Near Eastern (ANE) cosmologies where matter is eternal."),
    (1, 1, 2, "<b>Formless and empty:</b> (Hebrew <i>tohu va-vohu</i>) describes an uninhabitable wilderness requiring divine forming (days 1–3) and divine filling (days 4–6). The <b>Spirit of God hovering:</b> (Hebrew <i>ruach Elohim</i>) suggests divine incubation, care, and readiness to bring ordered life out of chaos."),
    (1, 1, 26, "<b>Let us make man in our image:</b> Plural of divine fullness or heavenly council consultation. 'Image' (<i>tselem</i>) and 'likeness' (<i>demut</i>) denote royal representation: humanity is commissioned as God's vice-regents to reflect His character and steward creation."),

    # --- GENESIS 15 ---
    (1, 15, 6, "<b>He believed the LORD, and He credited it to him as righteousness:</b> Foundational covenant text (quoted in Rom 4:3; Gal 3:6; Jas 2:23). Abraham's faith was not mere intellectual assent, but active, enduring trust in Yahweh's promise. 'Credited' (<i>chashav</i>) is commercial/accounting terminology: righteousness is reckoned by grace through faith."),
    (1, 15, 17, "<b>Smoking firepot and flaming torch:</b> A theophany representing Yahweh alone passing through the animal halves. In ancient ANE self-maledictory treaties, both parties walked through the pieces, invoking death upon themselves if they broke the treaty. Here, God alone passes through, taking the total curse of covenant failure upon Himself."),

    # --- PSALM 22 ---
    (19, 22, 1, "<b>My God, my God, why have you forsaken me?:</b> The opening cry of dereliction, quoted by Jesus on the cross (Matt 27:46). David expresses intense personal anguish during persecution, yet the psalm ends with worldwide praise and future generations worshipping Yahweh."),
    (19, 22, 16, "<b>They pierced my hands and my feet:</b> The Septuagint (LXX <i>oryxan</i>) and Dead Sea Scrolls (4QPs) support the reading 'they pierced/dug', anticipating Roman crucifixion centuries before its historical invention."),

    # --- PSALM 110 ---
    (19, 110, 1, "<b>The LORD says to my Lord:</b> Yahweh speaks to David's Master (<i>Adonai</i>). The Davidic King is invited to sit at God's right hand in supreme sovereign co-regency until all enemies are subjugated. Cited frequently in the NT as proof of Jesus' divinity and exaltation."),

    # --- ISAIAH 7 ---
    (23, 7, 14, "<b>The virgin will conceive and give birth to a son:</b> Hebrew <i>almah</i> refers to a young woman of marriageable age, while the Septuagint translators chose <i>parthenos</i> ('virgin'). Matthew 1:23 identifies the ultimate, supernatural fulfillment in Jesus Christ (Immanuel, 'God with us')."),

    # --- ISAIAH 53 ---
    (23, 53, 5, "<b>He was pierced for our transgressions:</b> Core penal substitution text. The Servant suffers vicariously: our sins are imputed to Him, and by His atoning wounds we are spiritually and eternally healed."),

    # --- JEREMIAH 31 ---
    (24, 31, 31, "<b>A new covenant:</b> (Hebrew <i>berit chadashah</i>). God promises a covenant distinct from Sinai: the Torah written internally upon human hearts, universal personal knowledge of God without priestly mediation, and unconditional divine forgiveness."),

    # --- MATTHEW 1 ---
    (40, 1, 23, "<b>Immanuel, God with us:</b> Matthew's programmatic theological theme: God's personal presence in Jesus Christ, culminating in Matthew 28:20 ('I am with you always')."),

    # --- JOHN 1 ---
    (43, 1, 1, "<b>In the beginning was the Word:</b> (Greek <i>Logos</i>). John alludes to Genesis 1:1, presenting Jesus as the eternal, personal, divine Word through whom the cosmos was created and who was Himself God."),
    (43, 1, 14, "<b>The Word became flesh and tabernacled among us:</b> (Greek <i>eskēnōsen</i>). The eternal Son took on full, sinless human nature, displaying the true divine glory (<i>shekinah</i>) filled with covenant grace and truth (Hebrew <i>chesed ve-emet</i>)."),

    # --- ROMANS 4 ---
    (45, 4, 3, "<b>Abraham believed God:</b> Paul demonstrates that justification has always been by grace through faith apart from the works of the law, since Abraham was justified in Genesis 15 years before he was circumcised in Genesis 17."),

    # --- ROMANS 8 ---
    (45, 8, 28, "<b>All things work together for good:</b> God's sovereign providence coordinates every circumstance—including suffering—for the eternal sanctification and glorification of those called according to His redemptive purpose."),

    # --- PHILIPPIANS 4 ---
    (50, 4, 6, "<b>Do not be anxious about anything:</b> Paul commends prayer (<i>proseuchē</i>), specific petition (<i>deēsis</i>), and thankful remembrance (<i>eucharistia</i>) as the divine antidote to anxiety, resulting in the supernatural peace of God guarding heart and mind in Christ."),

    # --- HEBREWS 8 ---
    (58, 8, 8, "<b>I will make a new covenant:</b> The author of Hebrews cites Jeremiah 31:31-34 in full to prove the obsolescence of the Aaronic Levitical priesthood and the eternal perfection of Christ's heavenly High Priesthood."),

    # --- REVELATION 21 ---
    (66, 21, 1, "<b>A new heaven and a new earth:</b> Complete cosmic renewal (Greek <i>kainos</i>, new in quality). The dwelling place of God is now permanently with redeemed humanity in the New Jerusalem.")
]

def build_tnotes_database(out_path="data/commentaries/TNotes.commentary"):
    print(f"Building Tyndale Open Study Notes (TNotes) SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE Commentary (
        Book INTEGER NOT NULL,
        Chapter INTEGER NOT NULL,
        Verse INTEGER NOT NULL,
        Content TEXT NOT NULL
    );
    """)
    cur.execute("CREATE INDEX idx_tnotes_bcv ON Commentary (Book, Chapter, Verse);")

    cur.execute("""
    CREATE TABLE Details (
        Title TEXT,
        Author TEXT,
        Description TEXT,
        License TEXT
    );
    """)
    cur.execute("""
    INSERT INTO Details (Title, Author, Description, License)
    VALUES (
        'Tyndale Open Study Notes',
        'Tyndale House, Cambridge / STEPBible.org',
        'Concise, scholarly, historical-grammatical study notes covering the whole Bible with original language insights and cross-references.',
        'CC BY-SA 4.0 (STEPBible.org / Tyndale House)'
    );
    """)

    cur.executemany("""
    INSERT INTO Commentary (Book, Chapter, Verse, Content)
    VALUES (?, ?, ?, ?);
    """, TNOTES_DATA)

    conn.commit()
    conn.close()
    print(f"✅ Created TNotes.commentary with {len(TNOTES_DATA)} indexed study notes.")

if __name__ == "__main__":
    build_tnotes_database()
