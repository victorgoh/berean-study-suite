#!/usr/bin/env python3
"""Convert a SermonIndex MyBible commentary ZIP/SQLite module to project SQLite."""
import argparse, html, os, re, sqlite3, tempfile, zipfile

BOOK_MAP = {10:1,20:2,30:3,40:4,50:5,60:6,70:7,80:8,90:9,100:10,110:11,120:12,130:13,140:14,150:15,160:16,190:17,220:18,230:19,240:20,250:21,260:22,290:23,300:24,310:25,330:26,340:27,350:28,360:29,370:30,380:31,390:32,400:33,410:34,420:35,430:36,440:37,450:38,460:39,470:40,480:41,490:42,500:43,510:44,520:45,530:46,540:47,550:48,560:49,570:50,580:51,590:52,600:53,610:54,620:55,630:56,640:57,650:58,660:59,670:60,680:61,690:62,700:63,710:64,720:65,730:66}

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

def open_source(path):
    if not path.lower().endswith(".zip"): return path, None
    archive = zipfile.ZipFile(path)
    names = [n for n in archive.namelist() if n.lower().endswith((".sqlite3", ".sqlite", ".db"))]
    if len(names) != 1: raise ValueError(f"Expected one SQLite module, found {len(names)}")
    tmp = tempfile.NamedTemporaryFile(prefix="commentary-", suffix=".sqlite3", delete=False)
    tmp.write(archive.read(names[0])); tmp.close(); archive.close()
    return tmp.name, tmp.name

def build(source, output, title, author, description, source_url, overwrite=False):
    if os.path.exists(output) and not overwrite: raise FileExistsError(f"Output exists: {output}; use --overwrite")
    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output): os.remove(output)
    source_path, temporary = open_source(source); src = sqlite3.connect(source_path); db = sqlite3.connect(output)
    try:
        db.executescript("""CREATE TABLE Commentary (Book INTEGER NOT NULL, Chapter INTEGER NOT NULL, Verse INTEGER NOT NULL, ChapterEnd INTEGER NOT NULL, VerseEnd INTEGER NOT NULL, Text TEXT NOT NULL); CREATE INDEX idx_bcv ON Commentary(Book,Chapter,Verse); CREATE INDEX idx_bc ON Commentary(Book,Chapter); CREATE TABLE Details (Title TEXT NOT NULL, Author TEXT NOT NULL, Description TEXT NOT NULL, License TEXT NOT NULL, SourceUrl TEXT NOT NULL, SourceModule TEXT NOT NULL, Importer TEXT NOT NULL);""")
        rows=[]
        for bid, chapter, verse, chapter_end, verse_end, raw in src.execute("SELECT book_number, chapter_number_from, verse_number_from, chapter_number_to, verse_number_to, text FROM commentaries ORDER BY book_number, chapter_number_from, verse_number_from"):
            if int(bid) not in BOOK_MAP: raise ValueError(f"Unexpected MyBible book id: {bid}")
            text=clean_html(raw)
            if text: rows.append((BOOK_MAP[int(bid)], int(chapter), int(verse), int(chapter_end), int(verse_end), text))
        db.executemany("INSERT INTO Commentary VALUES (?,?,?,?,?,?)", rows)
        db.execute("INSERT INTO Details VALUES (?,?,?,?,?,?,?)", (title, author, description, "Public domain; source attribution retained.", source_url, os.path.basename(source), "prepare_sermonindex_commentary.py")); db.commit()
        print(f"Created {output}: {len(rows):,} rows across {len({r[0] for r in rows})} books.")
    finally:
        src.close(); db.close()
        if temporary: os.unlink(temporary)

if __name__ == "__main__":
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("source"); p.add_argument("output"); p.add_argument("--title",required=True); p.add_argument("--author",required=True); p.add_argument("--description",required=True); p.add_argument("--source-url",required=True); p.add_argument("--overwrite",action="store_true"); a=p.parse_args(); build(a.source,a.output,a.title,a.author,a.description,a.source_url,a.overwrite)
