#!/usr/bin/env python3
"""
Compile Complete 39-Book Septuagint (LXX) Greek & Brenton English Bible Database
---------------------------------------------------------------------------------
Creates data/bibles/LXX.bible with all ~23,000+ Old Testament verses containing:
- Table 'Verses': Book (INTEGER), Chapter (INTEGER), Verse (INTEGER), Scripture (TEXT - Greek), English (TEXT - Brenton), Divergence (TEXT)
- Table 'Details': Metadata, Title, Description, License
"""

import os
import sqlite3
import urllib.request
import zipfile
import io
import json
import re

# Curated textual divergence notes between Hebrew Masoretic Text (MT) and Greek Septuagint (LXX)
DIVERGENCE_REGISTRY = {
    (1, 1, 2): "LXX interprets 'tohu va-vohu' (תֹהוּ וָבֹהוּ) as 'unseen and unformed' (ἀόρατος καὶ ἀκατασκεύαστος).",
    (1, 4, 8): "The Septuagint preserves the spoken phrase missing in the Hebrew MT ('Let us go into the field' / Διέλθωμεν εἰς τὸ πεδίον), also corroborated by 4QGen, the Samaritan Pentateuch, Syriac Peshitta, and Vulgate.",
    (2, 1, 5): "The LXX reads 75 souls (πέντε καὶ ἑβδομήκοντα), reflecting Joseph's expanded family; quoted verbatim by Stephen in Acts 7:14, corroborated by Dead Sea Scroll 4QExod.",
    (2, 3, 14): "LXX translates 'Ehyeh Asher Ehyeh' (אֶהְיֶה אֲשֶׁר אֶהְיֶה) as 'Egō eimi ho Ōn' (Ἐγώ εἰμι ὁ ὤν, 'I am the Existing One'), the theological backdrop for John 8:58 and Revelation 1:4.",
    (5, 32, 43): "The LXX includes 'let all the angels of God worship him' (προσκυνησάτωσαν αὐτῷ πάντες ἄγγελοι θεοῦ), missing in MT but found in DSS 4QDeut; quoted verbatim in Hebrews 1:6.",
    (19, 22, 16): "LXX reads 'ōryxan' (ὤρυξαν, 'they pierced/dug') hands and feet, supporting the crucifixion prophecy, whereas MT pointed as 'ka-ari' ('like a lion').",
    (19, 40, 6): "LXX reads 'a body you have prepared for me' (σῶμα δὲ κατηρτίσω μοι), where Hebrew MT reads 'ears you have dug for me'; quoted verbatim in Hebrews 10:5.",
    (19, 110, 1): "Classic Messianic session formula (Psalm 109:1 LXX); most quoted verse in the NT.",
    (23, 7, 14): "LXX translates 'ha-almah' (הָעַלְמָה) specifically as 'hē parthenos' (ἡ παρθένος, 'the virgin'); quoted in Matthew 1:23.",
    (23, 53, 7): "Suffering servant led as a sheep to slaughter; quoted by the Ethiopian Eunuch and Philip in Acts 8:32-33.",
    (24, 31, 31): "Foundation of New Covenant theology (Jeremiah 38:31 LXX); quoted verbatim in Hebrews 8:8-12."
}

BOOK_ABBR_MAP = {
    'GEN': 1, 'EXO': 2, 'LEV': 3, 'NUM': 4, 'DEU': 5,
    'JOS': 6, 'JDG': 7, 'RUT': 8, '1SA': 9, '2SA': 10,
    '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14, 'EZR': 15,
    'NEH': 16, 'EST': 17, 'ESG': 17, 'JOB': 18, 'PSA': 19,
    'PRO': 20, 'ECC': 21, 'SNG': 22, 'SOL': 22, 'ISA': 23,
    'JER': 24, 'LAM': 25, 'EZE': 26, 'DAN': 27, 'DNG': 27,
    'HOS': 28, 'JOE': 29, 'AMO': 30, 'OBA': 31, 'JON': 32,
    'MIC': 33, 'NAH': 34, 'HAB': 35, 'ZEP': 36, 'HAG': 37,
    'ZEC': 38, 'MAL': 39
}

BRENTON_NAME_MAP = {
    'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
    'Joshua': 6, 'Judges': 7, 'Ruth': 8, 'I Samuel': 9, 'II Samuel': 10,
    'I Kings': 11, 'II Kings': 12, 'I Chronicles': 13, 'II Chronicles': 14, 'Ezra': 15,
    'Nehemiah': 16, 'Esther (Greek)': 17, 'Job': 18, 'Psalms': 19,
    'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Songs': 22, 'Isaiah': 23,
    'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel (Greek)': 27,
    'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
    'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37,
    'Zechariah': 38, 'Malachi': 39
}

def clean_brenton_text(raw_text):
    """Strips trailing footer text like 'Amos < 9 > Public Domain'."""
    return re.sub(r'\s+[A-Za-z0-9\s\(\)]+<\s*\d+\s*>\s*Public Domain', '', raw_text).strip()

def build_full_lxx_database(out_path="data/bibles/LXX.bible"):
    print(f"Building Complete Septuagint (LXX) SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    # 1. Download Brenton English JSON
    brenton_url = "https://raw.githubusercontent.com/ctatum20/brenton-septuagint-data/main/_complete_brenton.json"
    print("1. Fetching Brenton 1851 English translation...")
    req_brenton = urllib.request.Request(brenton_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_brenton) as resp:
        brenton_json = json.loads(resp.read().decode("utf-8"))

    brenton_verses = {}
    for book_name, chapters in brenton_json.items():
        b_num = BRENTON_NAME_MAP.get(book_name)
        if not b_num:
            continue
        for ch_str, v_list in chapters.items():
            ch = int(ch_str)
            for v_item in v_list:
                v = int(v_item["v"])
                txt = clean_brenton_text(v_item["t"])
                brenton_verses[(b_num, ch, v)] = txt

    print(f"   ✓ Loaded {len(brenton_verses)} Brenton English verses.")

    # 2. Download Greek Septuagint text from eBible
    greek_url = "https://eBible.org/Scriptures/grclxx_vpl.zip"
    print("2. Fetching Greek Septuagint (Rahlfs) VPL text from eBible...")
    req_greek = urllib.request.Request(greek_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_greek) as resp:
        zip_data = resp.read()

    greek_verses = {}
    with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
        with zf.open("grclxx_vpl.txt") as f:
            for line in f.read().decode("utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                # Format: GEN 1:1 text...
                m = re.match(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s+(.+)$", line)
                if m:
                    book_abbr, ch_s, v_s, grk_text = m.groups()
                    b_num = BOOK_ABBR_MAP.get(book_abbr)
                    if b_num:
                        ch = int(ch_s)
                        v = int(v_s)
                        greek_verses[(b_num, ch, v)] = grk_text.strip()

    print(f"   ✓ Loaded {len(greek_verses)} Greek Septuagint verses.")

    # 3. Merge all keys across all canonical books
    all_keys = sorted(list(set(list(greek_verses.keys()) + list(brenton_verses.keys()))))
    print(f"3. Merging and populating SQLite database with {len(all_keys)} verses...")

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE Verses (
        Book INTEGER NOT NULL,
        Chapter INTEGER NOT NULL,
        Verse INTEGER NOT NULL,
        Scripture TEXT NOT NULL,
        English TEXT,
        Divergence TEXT,
        PRIMARY KEY (Book, Chapter, Verse)
    );
    """)

    cur.execute("""
    CREATE TABLE Details (
        Title TEXT,
        Language TEXT,
        Description TEXT,
        License TEXT
    );
    """)

    cur.execute("""
    INSERT INTO Details (Title, Language, Description, License)
    VALUES (
        'Greek Septuagint (LXX) with Brenton English Translation',
        'Greek (Ancient) / English',
        'Complete Old Testament Septuagint Greek text (Rahlfs / Swete) paired with Sir Lancelot C. L. Brenton 1851 English Translation and Masoretic Text (MT) divergence notes.',
        'Public Domain (CC0 / Unrestricted)'
    );
    """)

    rows = []
    for (b, ch, v) in all_keys:
        grk = greek_verses.get((b, ch, v), "")
        eng = brenton_verses.get((b, ch, v), "")
        div = DIVERGENCE_REGISTRY.get((b, ch, v), "")
        rows.append((b, ch, v, grk, eng, div))

    cur.executemany("""
    INSERT INTO Verses (Book, Chapter, Verse, Scripture, English, Divergence)
    VALUES (?, ?, ?, ?, ?, ?);
    """, rows)

    cur.execute("CREATE INDEX IF NOT EXISTS idx_verses_bcv ON Verses (Book, Chapter, Verse);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_verses_bc ON Verses (Book, Chapter, Verse);")

    conn.commit()
    conn.close()

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"✅ Created full Septuagint database at {out_path} ({size_mb:.2f} MB, {len(rows)} verses).")

if __name__ == "__main__":
    build_full_lxx_database()
