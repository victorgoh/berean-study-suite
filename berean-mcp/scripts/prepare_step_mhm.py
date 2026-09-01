#!/usr/bin/env python3
"""Convert STEPBible's Eng_MHM SWORD module into the project commentary SQLite format.

The source module is Matthew Henry's Modern English Commentary on the Whole Bible
(MHM), a verse-by-verse modern-English rearrangement released by STEPBible.org
under CC BY 4.0. It replaces the project's legacy cHenry derived database.

Requires the official CrossWire SWORD `mod2imp` utility. On macOS:
  brew install sword
"""

import argparse
import html
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


BOOK_NUMBERS = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
    "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
    "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
    "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
    "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
    "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
    "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46,
    "2 Corinthians": 47, "Galatians": 48, "Ephesians": 49, "Philippians": 50,
    "Colossians": 51, "1 Thessalonians": 52, "2 Thessalonians": 53,
    "1 Timothy": 54, "2 Timothy": 55, "Titus": 56, "Philemon": 57,
    "Hebrews": 58, "James": 59, "1 Peter": 60, "2 Peter": 61, "1 John": 62,
    "2 John": 63, "3 John": 64, "Jude": 65, "Revelation of John": 66,
}

RECORD = re.compile(r"^\$\$\$(.+?)\s+(\d+):(\d+)$")


def clean_osis(value: str) -> str:
    """Retain readable content while removing SWORD's OSIS display markup."""
    value = re.sub(r"<note\b[^>]*>.*?</note>", "", value, flags=re.IGNORECASE | re.DOTALL)
    value = re.sub(r"</?hi\b[^>]*>", "", value, flags=re.IGNORECASE)
    value = re.sub(r"<div\b[^>]*>", "\n\n", value, flags=re.IGNORECASE)
    value = re.sub(r"</div>", "\n\n", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    return re.sub(r"\n{3,}", "\n\n", value).strip()


def canonical_book_name(book_name: str) -> str:
    """Convert SWORD's Roman numeral book labels to the project convention."""
    return re.sub(r"^(III|II|I) (?=.+)", lambda match: {"I": "1", "II": "2", "III": "3"}[match.group(1)] + " ", book_name)


def export_imp(module_zip: Path, mod2imp: str) -> str:
    with tempfile.TemporaryDirectory(prefix="prepare-step-mhm-") as temp_dir:
        with zipfile.ZipFile(module_zip) as archive:
            archive.extractall(temp_dir)
        env = os.environ.copy()
        env["SWORD_PATH"] = temp_dir
        result = subprocess.run(
            [mod2imp, "Eng_MHM"], env=env, check=True, text=True,
            capture_output=True,
        )
        return result.stdout


def parse_records(imp_text: str):
    current = None
    chunks = []
    for line in imp_text.splitlines():
        match = RECORD.match(line)
        if match:
            if current and chunks:
                yield (*current, clean_osis("\n".join(chunks)))
            book_name, chapter, verse = match.groups()
            current = (book_name, int(chapter), int(verse))
            chunks = []
        elif current:
            chunks.append(line)
    if current and chunks:
        yield (*current, clean_osis("\n".join(chunks)))


def create_database(records, output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    db = sqlite3.connect(output)
    try:
        db.executescript("""
            CREATE TABLE Commentary (
              Book INTEGER NOT NULL,
              Chapter INTEGER NOT NULL,
              Verse INTEGER NOT NULL,
              Content TEXT NOT NULL,
              PRIMARY KEY (Book, Chapter, Verse)
            );
            CREATE INDEX idx_commentary_reference ON Commentary (Book, Chapter, Verse);
            CREATE TABLE Details (Description TEXT, Abbreviation TEXT, Information TEXT);
        """)
        db.executemany(
            "INSERT INTO Commentary (Book, Chapter, Verse, Content) VALUES (?, ?, ?, ?)",
            records,
        )
        db.execute(
            "INSERT INTO Details VALUES (?, ?, ?)",
            (
                "Matthew Henry's Modern English Commentary on the Whole Bible",
                "MHM",
                "Modern-English, verse-by-verse rearrangement of Matthew Henry's Commentary. "
                "Source: STEPBible.org Eng_MHM SWORD module, Version 1.0 (10 May 2026). "
                "The modern rearrangement was prepared by STEPBible.org and is licensed CC BY 4.0. "
                "Attribution: STEP Bible / STEPBible.org, https://stepbible.github.io/STEPBible-Data/. "
                "Underlying historic Matthew Henry text: public domain; CrossWire MHC module via CCEL.",
            ),
        )
        db.commit()
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to Eng_MHM.zip")
    parser.add_argument("output", type=Path, help="Output cHenry.commentary SQLite path")
    parser.add_argument("--mod2imp", default=shutil.which("mod2imp") or "/opt/homebrew/opt/sword/bin/mod2imp")
    args = parser.parse_args()

    if not args.source.is_file():
        raise SystemExit(f"Source archive not found: {args.source}")
    if not Path(args.mod2imp).is_file():
        raise SystemExit("mod2imp was not found. Install the CrossWire SWORD package first.")

    raw_records = list(parse_records(export_imp(args.source, args.mod2imp)))
    records = []
    unknown_books = set()
    for book_name, chapter, verse, content in raw_records:
        book = BOOK_NUMBERS.get(canonical_book_name(book_name))
        if book is None:
            unknown_books.add(book_name)
        elif content:
            records.append((book, chapter, verse, content))
    if unknown_books:
        raise SystemExit(f"Unrecognised SWORD book names: {', '.join(sorted(unknown_books))}")
    if len(records) < 20_000:
        raise SystemExit(f"Only {len(records)} commentary records were exported; refusing incomplete output.")

    create_database(records, args.output)
    print(f"Wrote {len(records):,} MHM commentary records to {args.output}")


if __name__ == "__main__":
    main()
