#!/usr/bin/env python3
"""Convert SermonIndex's Early Church Fathers MyBible module to project SQLite."""

import argparse
import html
import os
import re
import sqlite3
import tempfile
import zipfile

SOURCE_URL = "https://www.sermonindex.net/commentary/ecf/"
# MyBible's canonical IDs reserve slots for several deuterocanonical books.
BOOK_MAP = {10:1,20:2,30:3,40:4,50:5,60:6,70:7,80:8,90:9,100:10,110:11,120:12,130:13,140:14,150:15,160:16,
            190:17,220:18,230:19,240:20,250:21,260:22,290:23,300:24,310:25,330:26,340:27,350:28,360:29,370:30,380:31,390:32,400:33,410:34,420:35,430:36,440:37,450:38,460:39,
            470:40,480:41,490:42,500:43,510:44,520:45,530:46,540:47,550:48,560:49,570:50,580:51,590:52,600:53,610:54,620:55,630:56,640:57,650:58,660:59,670:60,680:61,690:62,700:63,710:64,720:65,730:66}


def clean_html(value: str) -> str:
    text = value or ""
    text = re.sub(r"<script\b[^>]*>[\s\S]*?</script>|<style\b[^>]*>[\s\S]*?</style>", "", text, flags=re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</?p\b[^>]*>", "\n\n", text, flags=re.I)
    text = re.sub(r"</?(?:b|strong)>", "**", text, flags=re.I)
    text = re.sub(r"</?(?:i|em)>", "*", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for i, line in enumerate(lines) if line or (i and lines[i - 1])) .strip()


def source_database(path: str):
    if not path.lower().endswith(".zip"):
        return path, None
    archive = zipfile.ZipFile(path)
    candidates = [n for n in archive.namelist() if n.lower().endswith((".sqlite3", ".sqlite", ".db"))]
    if len(candidates) != 1:
        raise ValueError(f"Expected one SQLite database in archive, found {len(candidates)}")
    temp = tempfile.NamedTemporaryFile(prefix="ecf-", suffix=".sqlite3", delete=False)
    temp.write(archive.read(candidates[0]))
    temp.close()
    archive.close()
    return temp.name, temp.name


def build_database(source: str, output: str, overwrite: bool = False) -> None:
    if os.path.exists(output) and not overwrite:
        raise FileExistsError(f"Output already exists: {output}; use --overwrite")
    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output):
        os.remove(output)
    db_path, temporary = source_database(source)
    source_db = sqlite3.connect(db_path)
    output_db = sqlite3.connect(output)
    try:
        output_db.executescript("""
            CREATE TABLE Commentary (
                Book INTEGER NOT NULL, Chapter INTEGER NOT NULL, Verse INTEGER NOT NULL,
                ChapterEnd INTEGER NOT NULL, VerseEnd INTEGER NOT NULL, Text TEXT NOT NULL
            );
            CREATE INDEX idx_ecf_bcv ON Commentary (Book, Chapter, Verse);
            CREATE INDEX idx_ecf_bc ON Commentary (Book, Chapter);
            CREATE TABLE Details (Title TEXT NOT NULL, Author TEXT NOT NULL,
                Description TEXT NOT NULL, License TEXT NOT NULL, SourceUrl TEXT NOT NULL,
                SourceModule TEXT NOT NULL, Importer TEXT NOT NULL);
        """)
        rows = []
        for book_id, chapter, verse, chapter_end, verse_end, text in source_db.execute(
            "SELECT book_number, chapter_number_from, verse_number_from, chapter_number_to, verse_number_to, text "
            "FROM commentaries ORDER BY book_number, chapter_number_from, verse_number_from"
        ):
            if int(book_id) not in BOOK_MAP:
                raise ValueError(f"Unexpected MyBible book id: {book_id}")
            cleaned = clean_html(text)
            if cleaned:
                rows.append((BOOK_MAP[int(book_id)], int(chapter), int(verse), int(chapter_end), int(verse_end), cleaned))
        output_db.executemany("INSERT INTO Commentary VALUES (?, ?, ?, ?, ?, ?)", rows)
        output_db.execute("INSERT INTO Details VALUES (?, ?, ?, ?, ?, ?, ?)", (
            "Early Church Fathers Commentary", "SermonIndex.net / Church Fathers",
            "Patristic commentary from Augustine, Chrysostom, Bede, Jerome, Origen, and others.",
            "Public domain; source attribution retained.", SOURCE_URL, os.path.basename(source), "prepare_ecf.py"))
        output_db.commit()
        print(f"Created {output}: {len(rows):,} commentary rows across {len({r[0] for r in rows})} books.")
    finally:
        source_db.close(); output_db.close()
        if temporary:
            os.unlink(temporary)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="ECF .zip or extracted SQLite3 module")
    parser.add_argument("output", help="Output cECF.commentary path")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    build_database(args.source, args.output, args.overwrite)
