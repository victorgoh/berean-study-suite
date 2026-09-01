#!/usr/bin/env python3
"""Convert a Matthew Henry Concise Commentary MyBible module to project SQLite.

The source module stores comments as verse ranges. The project runtime supports
those ranges directly, so the content is copied unchanged without duplicating a
single note under every verse it covers.
"""

import argparse
import os
import sqlite3


SOURCE_URL = "https://www.ccel.org/ccel/henry/mhcc.html"
LICENSE = "Public domain; preserve Christian Classics Ethereal Library attribution for the digital text."


def build_database(source: str, output: str, overwrite: bool) -> None:
    if os.path.abspath(source) == os.path.abspath(output):
        raise ValueError("Output must be separate from the supplied MyBible source module.")
    if os.path.exists(output) and not overwrite:
        raise FileExistsError(f"Output already exists: {output}. Use --overwrite to replace it.")

    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output):
        os.remove(output)

    source_db = sqlite3.connect(source)
    output_db = sqlite3.connect(output)
    try:
        output_db.executescript("""
            CREATE TABLE Commentary (
                Book INTEGER NOT NULL,
                Chapter INTEGER NOT NULL,
                VerseStart INTEGER NOT NULL,
                VerseEnd INTEGER NOT NULL,
                Content TEXT NOT NULL
            );
            CREATE INDEX idx_mhcc_bcvr ON Commentary (Book, Chapter, VerseStart, VerseEnd);
            CREATE TABLE Details (
                Title TEXT NOT NULL,
                Author TEXT NOT NULL,
                Description TEXT NOT NULL,
                License TEXT NOT NULL,
                SourceUrl TEXT NOT NULL,
                SourceModule TEXT NOT NULL,
                Importer TEXT NOT NULL
            );
        """)

        rows = source_db.execute(
            "SELECT book, chapter, fromverse, toverse, data FROM commentary ORDER BY book, chapter, fromverse"
        )
        indexed_rows = []
        for book, chapter, first_verse, last_verse, content in rows:
            if not content:
                continue
            indexed_rows.append((book, chapter, first_verse, last_verse, content))

        output_db.executemany(
            "INSERT INTO Commentary (Book, Chapter, VerseStart, VerseEnd, Content) VALUES (?, ?, ?, ?, ?)",
            indexed_rows,
        )
        output_db.execute(
            "INSERT INTO Details VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                "Matthew Henry's Concise Commentary on the Whole Bible",
                "Matthew Henry",
                "Concise, practical whole-Bible commentary indexed from its original verse-range notes.",
                LICENSE,
                SOURCE_URL,
                os.path.basename(source),
                "prepare_mhcc.py",
            ),
        )
        output_db.commit()
        print(f"Created {output}: {len(indexed_rows):,} source verse-range rows.")
    finally:
        source_db.close()
        output_db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="Path to MHCC.cmt.mybible")
    parser.add_argument("output", help="Path for MHCC.commentary")
    parser.add_argument("--overwrite", action="store_true", help="Replace an existing output file")
    args = parser.parse_args()
    build_database(args.source, args.output, args.overwrite)
