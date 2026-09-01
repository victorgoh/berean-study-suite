#!/usr/bin/env python3
"""Build a source-attributed SQLite Book Guide from Tyndale Open Study Notes.

The source archive is distributed by Tyndale House Publishers under CC BY-SA 4.0.
This importer stores both the concise BookIntroSummaries and full BookIntros without
creating or rewriting editorial prose.
"""

import argparse
import os
import sqlite3
import xml.etree.ElementTree as ET
import zipfile


BOOK_NUMBERS = {
    "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
    "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
    "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
    "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
    "Proverbs": 20, "Ecclesiastes": 21, "Song of Songs": 22, "Isaiah": 23,
    "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27, "Hosea": 28,
    "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32, "Micah": 33,
    "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37, "Zechariah": 38,
    "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42, "John": 43,
    "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
    "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
    "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54,
    "2 Timothy": 55, "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59,
    "1 Peter": 60, "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64,
    "Jude": 65, "Revelation": 66,
}

REFERENCE_BOOK_NUMBERS = {
    "1Sam": (9, "1 Samuel"),
    "2Sam": (10, "2 Samuel"),
    "1Kgs": (11, "1 Kings"),
    "2Kgs": (12, "2 Kings"),
    "1Chr": (13, "1 Chronicles"),
    "2Chr": (14, "2 Chronicles"),
    "1Thes": (52, "1 Thessalonians"),
    "2Thes": (53, "2 Thessalonians"),
    "1Tim": (54, "1 Timothy"),
    "2Tim": (55, "2 Timothy"),
    "1Pet": (60, "1 Peter"),
    "2Pet": (61, "2 Peter"),
    "1Jn": (62, "1 John"),
    "2Jn": (63, "2 John"),
    "3Jn": (64, "3 John"),
}


def inner_xml(element: ET.Element) -> str:
    parts = [element.text or ""]
    for child in element:
        parts.append(ET.tostring(child, encoding="unicode"))
    return "".join(parts).strip()


def parse_items(xml_bytes: bytes, detail: str) -> list[tuple[int, str, str, str]]:
    root = ET.fromstring(xml_bytes)
    rows = []
    for item in root.findall("item"):
        title = (item.findtext("title") or "").strip()
        body = item.find("body")
        book = BOOK_NUMBERS.get(title)
        # Some full Tyndale introductions omit the leading number in the display
        # title. The refs field retains the canonical distinction.
        ref_prefix = (item.findtext("refs") or "").split(".", 1)[0]
        if ref_prefix in REFERENCE_BOOK_NUMBERS:
            book, title = REFERENCE_BOOK_NUMBERS[ref_prefix]
        if not book or body is None:
            continue
        content = inner_xml(body)
        if content:
            rows.append((book, detail, title, content))
    return rows


def build_database(source_zip: str, output: str) -> None:
    archive_root = "Tyndale Open Study Notes/"
    with zipfile.ZipFile(source_zip) as archive:
        summaries = parse_items(archive.read(archive_root + "BookIntroSummaries.xml"), "summary")
        full_intros = parse_items(archive.read(archive_root + "BookIntros.xml"), "full")

    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output):
        os.remove(output)

    conn = sqlite3.connect(output)
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE BookGuide (
            Book INTEGER NOT NULL,
            Detail TEXT NOT NULL CHECK (Detail IN ('summary', 'full')),
            Title TEXT NOT NULL,
            Content TEXT NOT NULL,
            PRIMARY KEY (Book, Detail)
        );
        CREATE TABLE Details (
            SourceName TEXT NOT NULL,
            SourceUrl TEXT NOT NULL,
            License TEXT NOT NULL,
            ArchiveName TEXT NOT NULL,
            Importer TEXT NOT NULL
        );
    """)
    cur.executemany("INSERT INTO BookGuide (Book, Detail, Title, Content) VALUES (?, ?, ?, ?)", summaries + full_intros)
    cur.execute(
        "INSERT INTO Details VALUES (?, ?, ?, ?, ?)",
        (
            "Tyndale Open Study Notes",
            "https://tyndaleopenresources.com/",
            "CC BY-SA 4.0",
            os.path.basename(source_zip),
            "prepare_tyndale_book_intros.py",
        ),
    )
    conn.commit()
    conn.close()
    print(f"Created {output}: {len(summaries)} summaries and {len(full_intros)} full introductions.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Tyndale Open Study Notes book introductions into SQLite.")
    parser.add_argument("--source-zip", required=True, help="Path to tyndale_open-studynotes.zip")
    parser.add_argument("--output", default=os.path.expanduser("~/biblemate/data/data/tyndale_book_intros.data"))
    args = parser.parse_args()
    build_database(args.source_zip, args.output)
