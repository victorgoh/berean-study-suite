#!/usr/bin/env python3
"""
Upload auxiliary data files and JSON lookup indexes to Cloudflare R2 bucket.
"""

import os
import subprocess

HOME = os.path.expanduser("~")
DATA_DIR = os.path.join(HOME, "biblemate", "data")
BUCKET = "biblemate-data"

files_to_sync = [
    # JSON lookups
    "data/lookup/exlbt_index.json",
    "data/lookup/exlbp_index.json",
    "data/lookup/locations_index.json",
    "data/lookup/dictionaries_index.json",
    "data/lookup/encyclopedia_index.json",
    "data/lookup/parallels_index.json",
    "data/lookup/promises_index.json",
    "data/lookup/bible_names.json",
    "data/lookup/chronology.json",
    "data/lookup/daily_readings.json",
    # SQLite databases
    "data/exlb3.data",
    "data/biblePeople.data",
    "data/book_analysis.data",
    "data/chapter_summary.data",
    "collections3.sqlite",
    "commentaries/cHenry.commentary",
    "commentaries/cJFB.commentary",
    "commentaries/cCalvin.commentary",
    "commentaries/cGill.commentary",
    "commentaries/cBarnes.commentary",
    "commentaries/cMacL.commentary",
    "commentaries/cHH.commentary",
    "commentaries/cBenson.commentary",
    "commentaries/cClarke.commentary",
    "commentaries/cCECNT.commentary",
    "commentaries/cECER.commentary",
    "commentaries/cBI.commentary",
    "commentaries/cBI_1.commentary",
    "commentaries/cBI_2.commentary",
    "commentaries/cBI_3.commentary",
    "commentaries/cBI_4.commentary",
    "commentaries/cSpur.commentary",
    "commentaries/cRob.commentary",
    "commentaries/cVincent.commentary",
    "commentaries/cKD.commentary",
    "commentaries/cWesley.commentary",
    "commentaries/cPulpit.commentary",
    "commentaries/cEBC.commentary",
    "commentaries/cWhedon.commentary",
    "commentaries/cLange.commentary",
    "commentaries/cRyle.commentary",
    "commentaries/cTrapp.commentary",
    "commentaries/cMorgan.commentary",
    "commentaries/cBullinger.commentary",
    "commentaries/cIronside.commentary",
    "commentaries/cAlford.commentary",
    "commentaries/cFBMeyer.commentary",
    "commentaries/cUtley.commentary"
]

def main():
    print("=" * 60)
    print(" Uploading Auxiliary Datasets & Indexes to Cloudflare R2")
    print("=" * 60)

    for rel_path in files_to_sync:
        full_path = os.path.join(DATA_DIR, rel_path)
        if not os.path.exists(full_path):
            print(f"⚠️ Skipping missing file: {full_path}")
            continue

        size_mb = os.path.getsize(full_path) / (1024 * 1024)
        print(f"[{size_mb:5.2f} MB] Uploading {rel_path} -> r2://{BUCKET}/{rel_path}...")
        cmd = [
            "npx", "wrangler", "r2", "object", "put",
            f"{BUCKET}/{rel_path}",
            "--file", full_path,
            "--remote"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"  ✓ Uploaded {rel_path}")
        else:
            print(f"  ❌ Error: {res.stderr.strip() or res.stdout.strip()}")

    print("\n" + "=" * 60)
    print("🎉 All Auxiliary Datasets Uploaded to R2!")
    print("=" * 60)

if __name__ == "__main__":
    main()
