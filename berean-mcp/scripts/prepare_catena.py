#!/usr/bin/env python3
"""Convert the Catena Aurea CMTI SQLite module to project commentary SQLite."""
import argparse, html, os, re, sqlite3

SOURCE_URL = "https://www.ccel.org/ccel/aquinas/catena"

def clean_html(value):
    text = value or ""
    text = re.sub(r"<script\b[^>]*>[\s\S]*?</script>|<style\b[^>]*>[\s\S]*?</style>", "", text, flags=re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</?p\b[^>]*>", "\n\n", text, flags=re.I)
    text = re.sub(r"</?(?:b|strong)\b[^>]*>", "**", text, flags=re.I)
    text = re.sub(r"</?(?:i|em)\b[^>]*>", "*", text, flags=re.I)
    text = re.sub(r"<ref\b[^>]*>([\s\S]*?)</ref>", r"\1", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for i, line in enumerate(lines) if line or (i and lines[i-1])).strip()

def build_database(source, output, overwrite=False):
    if os.path.exists(output) and not overwrite: raise FileExistsError(f"Output exists: {output}; use --overwrite")
    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output): os.remove(output)
    src = sqlite3.connect(source); db = sqlite3.connect(output)
    try:
        db.executescript("""
            CREATE TABLE Commentary (Book INTEGER NOT NULL, Chapter INTEGER NOT NULL, Verse INTEGER NOT NULL,
              ChapterEnd INTEGER NOT NULL, VerseEnd INTEGER NOT NULL, Text TEXT NOT NULL);
            CREATE INDEX idx_catena_bcv ON Commentary (Book, Chapter, Verse);
            CREATE INDEX idx_catena_bc ON Commentary (Book, Chapter);
            CREATE TABLE Details (Title TEXT NOT NULL, Author TEXT NOT NULL, Description TEXT NOT NULL,
              License TEXT NOT NULL, SourceUrl TEXT NOT NULL, SourceModule TEXT NOT NULL, Importer TEXT NOT NULL);
        """)
        rows=[]
        # Chapter-level notes are represented as 0-0 introductions for that chapter.
        for book, chapter, comments in src.execute("SELECT Book, Chapter, Comments FROM ChapterCommentary"):
            text=clean_html(comments)
            if text: rows.append((book, chapter, 0, chapter, 0, text))
        for book, cb, vb, ce, ve, comments in src.execute("SELECT Book, ChapterBegin, VerseBegin, ChapterEnd, VerseEnd, Comments FROM VerseCommentary ORDER BY Book, ChapterBegin, VerseBegin"):
            text=clean_html(comments)
            if text: rows.append((book, cb, vb, ce, ve, text))
        if any(book < 40 or book > 43 for book, *_ in rows): raise ValueError("Catena source contains non-Gospel records")
        db.executemany("INSERT INTO Commentary VALUES (?, ?, ?, ?, ?, ?)", rows)
        db.execute("INSERT INTO Details VALUES (?, ?, ?, ?, ?, ?, ?)", ("St Thomas Aquinas Catena Aurea (Golden Chain)", "St Thomas Aquinas", "Commentary on the Gospels compiled from the early Church Fathers.", "Public domain; source attribution retained.", SOURCE_URL, os.path.basename(source), "prepare_catena.py"))
        db.commit(); print(f"Created {output}: {len(rows):,} range/introduction rows for Matthew through John.")
    finally: src.close(); db.close()

if __name__ == "__main__":
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("source"); p.add_argument("output"); p.add_argument("--overwrite",action="store_true"); a=p.parse_args(); build_database(a.source,a.output,a.overwrite)
