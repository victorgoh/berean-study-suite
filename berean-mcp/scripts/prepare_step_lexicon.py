#!/usr/bin/env python3
"""
Fetch and Prepare STEPBible TBESG (Greek) and TBESH (Hebrew) Lexicons
--------------------------------------------------------------------
Downloads raw tab-separated lexicon files from STEPBible-Data GitHub repository,
normalizes formatting into Markdown, and compiles:
1. SQLite database: data/lexicons/step_lexicon.sqlite (for local / R2 use)
2. Cloudflare D1 SQL: data/lexicons/step_lexicon_d1.sql (for D1 reference DB)

License of dataset: Creative Commons Attribution (CC BY 4.0) by STEPBible.org
"""

import os
import re
import sys
import sqlite3
import urllib.request
import argparse

TBESG_URL = "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Greek%20-%20STEPBible.org%20CC%20BY.txt"
TBESH_URL = "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew%20-%20STEPBible.org%20CC%20BY.txt"

def clean_html(text):
    if not text:
        return ""
    t = text.strip()
    # Normalize break tags to newlines
    t = re.sub(r'<br\s*/?>', '\n', t, flags=re.IGNORECASE)
    t = re.sub(r'<BR\s*/?>', '\n', t)
    # Convert bold / italic tags
    t = re.sub(r'<b>(.*?)</b>', r'**\1**', t, flags=re.IGNORECASE)
    t = re.sub(r'<i>(.*?)</i>', r'*\1*', t, flags=re.IGNORECASE)
    # Remove XML/HTML tags like <ref=...>, </ref>, etc.
    t = re.sub(r'<[^>]+>', '', t)
    # Clean up multiple spaces / underscores
    t = re.sub(r'__+', '• ', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()

def download_file(url, local_dest):
    print(f"Downloading {os.path.basename(local_dest)} from STEPBible...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (BereanStudySuite)'})
    with urllib.request.urlopen(req) as resp, open(local_dest, 'wb') as out:
        out.write(resp.read())
    size_mb = os.path.getsize(local_dest) / (1024 * 1024)
    print(f"✓ Downloaded {os.path.basename(local_dest)} ({size_mb:.2f} MB)")

def parse_tbesg(filepath):
    print(f"Parsing Greek TBESG from {filepath}...")
    records = []
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        in_data = False
        for line in f:
            line = line.rstrip('\r\n')
            if not line or line.startswith('$') or line.startswith('#'):
                continue
            cols = line.split('\t')
            if len(cols) >= 7 and cols[0] == 'eStrong':
                in_data = True
                continue
            if not in_data:
                continue
            if len(cols) < 7:
                continue

            estrong = cols[0].strip().upper()
            dstrong_raw = cols[1].strip()
            # extract clean dstrong (e.g. G0001G)
            dstrong_match = re.match(r'^([GH]\d+[A-Z]*)', dstrong_raw)
            dstrong = dstrong_match.group(1).upper() if dstrong_match else estrong
            ustrong = cols[2].strip().upper() if len(cols) > 2 else estrong
            greek = cols[3].strip() if len(cols) > 3 else ""
            translit = cols[4].strip() if len(cols) > 4 else ""
            morph = cols[5].strip() if len(cols) > 5 else ""
            gloss = cols[6].strip() if len(cols) > 6 else ""
            meaning_raw = cols[7].strip() if len(cols) > 7 else ""
            meaning = clean_html(meaning_raw) or gloss

            # Normalize base number without leading zeros (e.g. G1, G2889)
            m_num = re.search(r'\d+', estrong)
            num_val = int(m_num.group(0)) if m_num else 0
            base_number = f"G{num_val}"

            records.append({
                "strongs": dstrong if dstrong else estrong,
                "base_number": base_number,
                "canonical_strongs": estrong,
                "language": "Greek",
                "lemma": greek,
                "transliteration": translit,
                "morphology": morph,
                "gloss": gloss,
                "definition": meaning
            })
    print(f"✓ Parsed {len(records)} Greek TBESG records.")
    return records

def parse_tbesh(filepath):
    print(f"Parsing Hebrew TBESH from {filepath}...")
    records = []
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        in_data = False
        for line in f:
            line = line.rstrip('\r\n')
            if not line or line.startswith('$') or line.startswith('#'):
                continue
            cols = line.split('\t')
            if len(cols) >= 7 and (cols[0] == 'eStrong' or cols[0] == 'eStrong#'):
                in_data = True
                continue
            if not in_data:
                continue
            if len(cols) < 7:
                continue

            estrong = cols[0].strip().upper()
            dstrong_raw = cols[1].strip()
            dstrong_match = re.match(r'^([GH]\d+[A-Z]*)', dstrong_raw)
            dstrong = dstrong_match.group(1).upper() if dstrong_match else estrong
            ustrong = cols[2].strip().upper() if len(cols) > 2 else estrong
            hebrew = cols[3].strip() if len(cols) > 3 else ""
            translit = cols[4].strip() if len(cols) > 4 else ""
            morph = cols[5].strip() if len(cols) > 5 else ""
            gloss = cols[6].strip() if len(cols) > 6 else ""
            meaning_raw = cols[7].strip() if len(cols) > 7 else ""
            meaning = clean_html(meaning_raw) or gloss

            m_num = re.search(r'\d+', estrong)
            num_val = int(m_num.group(0)) if m_num else 0
            base_number = f"H{num_val}"

            records.append({
                "strongs": dstrong if dstrong else estrong,
                "base_number": base_number,
                "canonical_strongs": estrong,
                "language": "Hebrew/Aramaic",
                "lemma": hebrew,
                "transliteration": translit,
                "morphology": morph,
                "gloss": gloss,
                "definition": meaning
            })
    print(f"✓ Parsed {len(records)} Hebrew TBESH records.")
    return records

def create_sqlite_database(records, out_db_path):
    print(f"\nBuilding SQLite database at {out_db_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_db_path)), exist_ok=True)
    if os.path.exists(out_db_path):
        os.remove(out_db_path)

    conn = sqlite3.connect(out_db_path)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE lexicon_step (
        strongs TEXT PRIMARY KEY,
        base_number TEXT,
        canonical_strongs TEXT,
        language TEXT,
        lemma TEXT,
        transliteration TEXT,
        morphology TEXT,
        gloss TEXT,
        definition TEXT
    );
    """)
    cur.execute("CREATE INDEX idx_step_base ON lexicon_step (base_number);")
    cur.execute("CREATE INDEX idx_step_canonical ON lexicon_step (canonical_strongs);")
    cur.execute("CREATE INDEX idx_step_lemma ON lexicon_step (lemma);")

    insert_rows = [
        (
            r["strongs"],
            r["base_number"],
            r["canonical_strongs"],
            r["language"],
            r["lemma"],
            r["transliteration"],
            r["morphology"],
            r["gloss"],
            r["definition"]
        )
        for r in records
    ]

    cur.executemany("""
    INSERT OR REPLACE INTO lexicon_step VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, insert_rows)

    conn.commit()
    conn.close()
    size_mb = os.path.getsize(out_db_path) / (1024 * 1024)
    print(f"✅ SQLite database created with {len(records)} entries ({size_mb:.2f} MB)")

def main():
    parser = argparse.ArgumentParser(description="Prepare STEPBible TBESG & TBESH Lexicon Database")
    parser.add_argument("--output-dir", default="data/lexicons", help="Output directory for processed files")
    parser.add_argument("--skip-download", action="store_true", help="Skip downloading if raw files exist")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    raw_greek_path = os.path.join(args.output_dir, "TBESG_raw.txt")
    raw_hebrew_path = os.path.join(args.output_dir, "TBESH_raw.txt")
    sqlite_out = os.path.join(args.output_dir, "step_lexicon.sqlite")

    if not args.skip_download or not os.path.exists(raw_greek_path):
        download_file(TBESG_URL, raw_greek_path)
    if not args.skip_download or not os.path.exists(raw_hebrew_path):
        download_file(TBESH_URL, raw_hebrew_path)

    greek_records = parse_tbesg(raw_greek_path)
    hebrew_records = parse_tbesh(raw_hebrew_path)
    all_records = greek_records + hebrew_records

    create_sqlite_database(all_records, sqlite_out)

if __name__ == "__main__":
    main()
