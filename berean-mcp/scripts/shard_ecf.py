#!/usr/bin/env python3
"""Split a converted cECF.commentary database into four Worker-sized shards."""
import argparse, os, sqlite3

RANGES = ((1, 17), (18, 39), (40, 56), (57, 66))

def shard(source, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    src = sqlite3.connect(source)
    try:
        for index, (first, last) in enumerate(RANGES, 1):
            out = os.path.join(output_dir, f"cECF_{index}.commentary")
            if os.path.exists(out): os.remove(out)
            db = sqlite3.connect(out)
            try:
                db.executescript("""
                    CREATE TABLE Commentary (Book INTEGER NOT NULL, Chapter INTEGER NOT NULL, Verse INTEGER NOT NULL,
                        ChapterEnd INTEGER NOT NULL, VerseEnd INTEGER NOT NULL, Text TEXT NOT NULL);
                    CREATE INDEX idx_ecf_bcv ON Commentary (Book, Chapter, Verse);
                    CREATE INDEX idx_ecf_bc ON Commentary (Book, Chapter);
                    CREATE TABLE Details (Title TEXT NOT NULL, Author TEXT NOT NULL, Description TEXT NOT NULL,
                        License TEXT NOT NULL, SourceUrl TEXT NOT NULL, SourceModule TEXT NOT NULL, Importer TEXT NOT NULL);
                """)
                rows = src.execute("SELECT * FROM Commentary WHERE Book BETWEEN ? AND ? ORDER BY Book, Chapter, Verse", (first, last)).fetchall()
                db.executemany("INSERT INTO Commentary VALUES (?, ?, ?, ?, ?, ?)", rows)
                details = src.execute("SELECT * FROM Details LIMIT 1").fetchone()
                db.execute("INSERT INTO Details VALUES (?, ?, ?, ?, ?, ?, ?)", details)
                db.commit()
                print(f"{os.path.basename(out)}: books {first}-{last}, {len(rows):,} rows, {os.path.getsize(out)/(1024*1024):.1f} MiB")
            finally: db.close()
    finally: src.close()

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("source"); p.add_argument("output_dir")
    args = p.parse_args()
    shard(args.source, args.output_dir)
