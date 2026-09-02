#!/usr/bin/env python3
"""Convert a SWORD Pulpit Commentary module into the project's four shards.

The input is a SWORD module archive containing a zCom module.  ``mod2imp``
exports one record per versification key; this converter removes OSIS display
markup, preserves the commentary text as Markdown-compatible plain text, and
writes the schema consumed by ``lookupCommentary``.
"""

import argparse
import html
import os
import re
import shutil
import sqlite3
import subprocess
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
SHARDS = ((1, 17), (18, 39), (40, 44), (45, 66))
LEGACY_CHAPTERS = {(4, 29), (4, 31), (4, 34), (4, 35), (5, 6), (7, 21), (12, 24)}


def clean_osis(value: str) -> str:
    value = re.sub(r"<note\b[^>]*>.*?</note>", "", value, flags=re.IGNORECASE | re.DOTALL)
    value = re.sub(r"</?hi\b[^>]*>", "", value, flags=re.IGNORECASE)
    value = re.sub(r"</?div\b[^>]*>", "\n\n", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    return re.sub(r"\n{3,}", "\n\n", value).replace("\ufffd", "").strip()


def clean_legacy(value: str) -> str:
    """Remove known formatting leakage from the older converted edition."""
    value = re.sub(r"(?im)^Tahoma;\s*Segoe UI;\s*", "", value or "")
    value = re.sub(r"([A-Za-z])\"s\b", r"\1’s", value)
    return re.sub(r"\n{3,}", "\n\n", value).strip()


def canonical_book_name(book_name: str) -> str:
    return re.sub(r"^(III|II|I) (?=.+)", lambda m: {"I": "1", "II": "2", "III": "3"}[m.group(1)] + " ", book_name)


def export_imp(source: Path, mod2imp: str) -> str:
    with tempfile.TemporaryDirectory(prefix="prepare-sword-pulpit-") as temp_dir:
        with zipfile.ZipFile(source) as archive:
            archive.extractall(temp_dir)
        env = os.environ.copy()
        env["SWORD_PATH"] = temp_dir
        # A few legacy records contain truncated UTF-8 sequences. Decode
        # loss-tolerantly so one malformed byte cannot abort the export.
        result = subprocess.run([mod2imp, "SIPULPIT"], env=env, check=True, capture_output=True)
        return result.stdout.decode("utf-8", errors="replace")


def parse_records(imp_text: str):
    current = None
    chunks = []
    for line in imp_text.splitlines():
        match = RECORD.match(line)
        if match:
            if current:
                yield (*current, clean_osis("\n".join(chunks)))
            book_name, chapter, verse = match.groups()
            current = (book_name, int(chapter), int(verse))
            chunks = []
        elif current:
            chunks.append(line)
    if current:
        yield (*current, clean_osis("\n".join(chunks)))


def write_shard(records, output: Path, first_book: int, last_book: int, legacy_dir: Path | None = None):
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
              ChapterEnd INTEGER NOT NULL,
              VerseEnd INTEGER NOT NULL,
              Text TEXT NOT NULL
            );
            CREATE INDEX idx_comm_bcv ON Commentary (Book, Chapter, Verse);
            CREATE INDEX idx_comm_bc ON Commentary (Book, Chapter);
            CREATE TABLE Details (Title TEXT, Abbreviation TEXT, Author TEXT, Information TEXT, Version TEXT);
        """)
        db.execute(
            "INSERT INTO Details VALUES (?, ?, ?, ?, ?)",
            (
                "The Pulpit Commentary", "Pulpit", "H. D. M. Spence-Jones; Joseph S. Exell",
                "SWORD SIPULPIT module prepared by SermonIndex.net from https://www.sermonindex.net/commentary/pulpit-commentary/.",
                "1.0",
            ),
        )
        selected = [(b, c, v, c, end_verse, text) for b, c, v, end_verse, text in records if first_book <= b <= last_book]
        db.executemany("INSERT INTO Commentary VALUES (?, ?, ?, ?, ?, ?)", selected)
        legacy_count = 0
        if legacy_dir:
            legacy_path = legacy_dir / output.name
            if legacy_path.is_file():
                legacy = sqlite3.connect(legacy_path)
                try:
                    old_rows = legacy.execute(
                        "SELECT Book, Chapter, Verse, ChapterEnd, VerseEnd, Text FROM Commentary WHERE Book BETWEEN ? AND ?",
                        (first_book, last_book),
                    )
                    additions = []
                    for book, chapter, verse, chapter_end, verse_end, text in old_rows:
                        if (book, chapter) in LEGACY_CHAPTERS:
                            additions.append((book, chapter, verse, chapter_end, verse_end, clean_legacy(text)))
                    db.executemany("INSERT INTO Commentary VALUES (?, ?, ?, ?, ?, ?)", additions)
                    legacy_count = len(additions)
                finally:
                    legacy.close()
        db.commit()
        db.execute("VACUUM")
    finally:
        db.close()
    return len(selected), legacy_count


def load_verse_counts(path: Path):
    if not path.is_file():
        return {}
    with sqlite3.connect(path) as db:
        return {
            (book, chapter): max_verse
            for book, chapter, max_verse in db.execute(
                "SELECT Book, Chapter, MAX(Verse) FROM Verses GROUP BY Book, Chapter"
            )
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--bible", type=Path, default=Path(__file__).resolve().parents[1] / "data/bibles/ASV.bible", help="Bible SQLite used for chapter verse counts")
    parser.add_argument("--legacy-dir", type=Path, help="Older cPulpit shard directory used only to fill source gaps")
    parser.add_argument("--mod2imp", default=shutil.which("mod2imp") or "/opt/homebrew/opt/sword/bin/mod2imp")
    args = parser.parse_args()
    if not args.source.is_file():
        raise SystemExit(f"SWORD archive not found: {args.source}")

    raw = list(parse_records(export_imp(args.source, args.mod2imp)))
    unknown = sorted({canonical_book_name(book) for book, _, _, _ in raw if canonical_book_name(book) not in BOOK_NUMBERS})
    if unknown:
        raise SystemExit(f"Unrecognised SWORD book names: {', '.join(unknown)}")
    chapter_ends = {}
    for book, chapter, verse, _ in raw:
        canonical = canonical_book_name(book)
        if canonical in BOOK_NUMBERS and chapter > 0 and verse > 0:
            key = (BOOK_NUMBERS[canonical], chapter)
            chapter_ends[key] = max(chapter_ends.get(key, 0), verse)
    verse_counts = load_verse_counts(args.bible)
    # SIPULPIT is BlockType=BOOK: the complete chapter commentary is usually
    # stored in the first verse key, with empty keys for the remaining verses.
    # Represent that payload as a range so verse-specific queries still match.
    records = [
        (BOOK_NUMBERS[canonical_book_name(book)], chapter, verse, verse_counts.get((BOOK_NUMBERS[canonical_book_name(book)], chapter), chapter_ends[(BOOK_NUMBERS[canonical_book_name(book)], chapter)]), text)
        for book, chapter, verse, text in raw
        if chapter > 0 and verse > 0 and text and canonical_book_name(book) in BOOK_NUMBERS
    ]
    if len(records) < 1000:
        raise SystemExit(f"Only {len(records)} commentary records were exported; refusing incomplete output.")

    total = 0
    for index, (first_book, last_book) in enumerate(SHARDS, 1):
        count, legacy_count = write_shard(records, args.output_dir / f"cPulpit_{index}.commentary", first_book, last_book, args.legacy_dir)
        total += count
        total += legacy_count
        print(f"cPulpit_{index}: books {first_book}-{last_book}, {count:,} new + {legacy_count:,} legacy records")
    print(f"Converted {total:,} merged records from {args.source}")


if __name__ == "__main__":
    main()
