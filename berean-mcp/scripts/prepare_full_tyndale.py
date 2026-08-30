#!/usr/bin/env python3
"""
Comprehensive Tyndale Open Resources Importer
--------------------------------------------
Extracts and builds:
1. data/commentaries/TNotes.commentary (16,923 verse & passage study notes)
2. data/dictionaries/Tyndale.dictionary (6,010 dictionary articles)

Source files:
- cmti/tyndale_open-studynotes.zip
- cmti/TyndaleOpenBibleDictionary.zip
"""

import os
import re
import sys
import zipfile
import sqlite3
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple, Optional

# Canonical 66 Bible books abbreviation mapping
BOOK_MAP = {
    'gen': 1, 'genesis': 1,
    'exod': 2, 'exo': 2, 'ex': 2, 'exodus': 2,
    'lev': 3, 'leviticus': 3,
    'num': 4, 'nm': 4, 'numbers': 4,
    'deut': 5, 'dt': 5, 'deuteronomy': 5,
    'josh': 6, 'joshua': 6,
    'judg': 7, 'jdg': 7, 'judges': 7,
    'ruth': 8, 'rth': 8, 'ru': 8,
    '1sam': 9, '1sa': 9, '1samuel': 9,
    '2sam': 10, '2sa': 10, '2samuel': 10,
    '1kgs': 11, '1kg': 11, '1kings': 11,
    '2kgs': 12, '2kg': 12, '2kings': 12,
    '1chr': 13, '1ch': 13, '1chronicles': 13,
    '2chr': 14, '2ch': 14, '2chronicles': 14,
    'ezra': 15, 'ezr': 15,
    'neh': 16, 'nehemiah': 16,
    'esth': 17, 'esther': 17,
    'job': 18,
    'ps': 19, 'psa': 19, 'psalm': 19, 'psalms': 19,
    'prov': 20, 'pr': 20, 'proverbs': 20,
    'eccl': 21, 'ecclesiastes': 21,
    'song': 22, 'songs': 22, 'songofsongs': 22, 'canticles': 22,
    'isa': 23, 'isaiah': 23,
    'jer': 24, 'jeremiah': 24,
    'lam': 25, 'lamentations': 25,
    'ezek': 26, 'ezk': 26, 'ezekiel': 26,
    'dan': 27, 'daniel': 27,
    'hos': 28, 'hosea': 28,
    'joel': 29,
    'amos': 30,
    'obad': 31, 'obadiah': 31,
    'jonah': 32, 'jon': 32,
    'mic': 33, 'micah': 33,
    'nah': 34, 'nahum': 34,
    'hab': 35, 'habakkuk': 35,
    'zeph': 36, 'zephaniah': 36,
    'hag': 37, 'haggai': 37,
    'zech': 38, 'zec': 38, 'zechariah': 38,
    'mal': 39, 'malachi': 39,
    'matt': 40, 'mat': 40, 'mt': 40, 'matthew': 40,
    'mark': 41, 'mrk': 41, 'mk': 41,
    'luke': 42, 'luk': 42, 'lk': 42,
    'john': 43, 'jhn': 43, 'jn': 43,
    'acts': 44, 'act': 44,
    'rom': 45, 'romans': 45,
    '1cor': 46, '1co': 46, '1corinthians': 46,
    '2cor': 47, '2co': 47, '2corinthians': 47,
    'gal': 48, 'galatians': 48,
    'eph': 49, 'ephesians': 49,
    'phil': 50, 'php': 50, 'philippians': 50,
    'col': 51, 'colossians': 51,
    '1thess': 52, '1th': 52, '1thessalonians': 52,
    '2thess': 53, '2th': 53, '2thessalonians': 53,
    '1tim': 54, '1ti': 54, '1timothy': 54,
    '2tim': 55, '2ti': 55, '2timothy': 55,
    'titus': 56, 'tit': 56,
    'phlm': 57, 'phm': 57, 'philemon': 57,
    'heb': 58, 'hebrews': 58,
    'jas': 59, 'james': 59,
    '1pet': 60, '1pe': 60, '1peter': 60,
    '2pet': 61, '2pe': 61, '2peter': 61,
    '1john': 62, '1jn': 62,
    '2john': 63, '2jn': 63,
    '3john': 64, '3jn': 64,
    'jude': 65, 'jud': 65,
    'rev': 66, 'revelation': 66
}

def clean_xml_text(elem: ET.Element) -> str:
    """Recursively converts an XML element tree to clean, well-formatted Markdown."""
    if elem is None:
        return ""
    
    # Process children
    for span in elem.findall('.//span[@class="sn-ref"]'):
        ref_text = "".join(span.itertext()).strip()
        span.text = f"**{ref_text}** "
        for child in list(span):
            span.remove(child)

    for span in elem.findall('.//span[@class="sn-excerpt"]'):
        excerpt_text = "".join(span.itertext()).strip()
        span.text = f"*{excerpt_text}* "
        for child in list(span):
            span.remove(child)

    for h in elem.findall('.//p[@class="h1"]'):
        h_text = "".join(h.itertext()).strip()
        h.text = f"### {h_text}\n\n"
        for child in list(h):
            h.remove(child)

    for h in elem.findall('.//p[@class="h2"]'):
        h_text = "".join(h.itertext()).strip()
        h.text = f"#### {h_text}\n\n"
        for child in list(h):
            h.remove(child)

    for a in elem.findall('.//a'):
        a_text = "".join(a.itertext()).strip()
        a.text = a_text
        for child in list(a):
            a.remove(child)

    raw = ET.tostring(elem, encoding='unicode', method='text')
    
    # Clean up whitespace and paragraph breaks
    lines = [l.strip() for l in raw.split('\n')]
    cleaned = '\n\n'.join(l for l in lines if l)
    cleaned = re.sub(r' +', ' ', cleaned)
    cleaned = re.sub(r'•\s*', '\n\n* ', cleaned)
    return cleaned.strip()

def parse_ref_key(ref_str: str) -> Optional[Tuple[int, int, int]]:
    """Parses a reference string like 'Gen.1.1' or 'Gen.1.1-2.3' into (Book, Chapter, Verse)."""
    if not ref_str:
        return None
    
    start_ref = ref_str.split('-')[0].strip()
    parts = start_ref.split('.')
    if len(parts) < 3:
        return None
    
    book_abbr = parts[0].lower()
    book_num = BOOK_MAP.get(book_abbr)
    if not book_num:
        return None
    
    try:
        chapter_num = int(parts[1])
        verse_num = int(parts[2])
        return (book_num, chapter_num, verse_num)
    except ValueError:
        return None

def build_tyndale_studynotes(zip_path: str, out_db_path: str):
    """Parses StudyNotes.xml into TNotes.commentary."""
    print(f"\n==================================================================")
    print(f"📦 Building Tyndale Open Study Notes: {out_db_path}")
    print(f"==================================================================")
    
    os.makedirs(os.path.dirname(out_db_path), exist_ok=True)
    if os.path.exists(out_db_path):
        os.remove(out_db_path)

    conn = sqlite3.connect(out_db_path)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE Commentary (
            Book INTEGER NOT NULL,
            Chapter INTEGER NOT NULL,
            Verse INTEGER NOT NULL,
            Content TEXT NOT NULL,
            PRIMARY KEY (Book, Chapter, Verse)
        )
    """)
    cur.execute("CREATE INDEX idx_commentary_bcv ON Commentary(Book, Chapter, Verse);")

    cur.execute("""
        CREATE TABLE Details (
            Title TEXT,
            Author TEXT,
            Description TEXT,
            License TEXT
        )
    """)
    cur.execute("""
        INSERT INTO Details (Title, Author, Description, License) VALUES (
            'Tyndale Open Study Notes',
            'Tyndale House Publishers',
            'Concise, high-density, scholarly, historical-grammatical study notes covering Old and New Testaments.',
            'CC BY-SA 4.0'
        )
    """)

    notes_by_bcv: Dict[Tuple[int, int, int], List[str]] = {}

    with zipfile.ZipFile(zip_path, 'r') as z:
        print("▶ Parsing StudyNotes.xml...")
        xml_data = z.read('Tyndale Open Study Notes/StudyNotes.xml')
        root = ET.fromstring(xml_data)
        
        count = 0
        for item in root.findall('item'):
            refs = item.findtext('refs') or item.get('name') or ''
            bcv = parse_ref_key(refs)
            if not bcv:
                continue
            
            body_elem = item.find('body')
            content = clean_xml_text(body_elem)
            if not content:
                continue

            if bcv not in notes_by_bcv:
                notes_by_bcv[bcv] = []
            notes_by_bcv[bcv].append(content)
            count += 1

        print(f"  ✓ Processed {count:,} study notes across {len(notes_by_bcv):,} distinct verses")

    # Insert combined notes into Commentary table
    rows = []
    for (b, c, v), note_list in notes_by_bcv.items():
        combined_text = "\n\n---\n\n".join(note_list)
        rows.append((b, c, v, combined_text))

    cur.executemany("INSERT INTO Commentary (Book, Chapter, Verse, Content) VALUES (?, ?, ?, ?)", rows)
    conn.commit()

    cur.execute("PRAGMA vacuum;")
    cur.execute("SELECT COUNT(*) FROM Commentary")
    total_verses = cur.fetchone()[0]
    conn.close()

    size_mb = os.path.getsize(out_db_path) / (1024 * 1024)
    print(f"✅ Successfully compiled TNotes.commentary ({total_verses:,} verses, {size_mb:.2f} MB)")

def build_tyndale_dictionary(zip_path: str, out_db_path: str):
    """Parses Articles/*.xml from TyndaleOpenBibleDictionary.zip into Tyndale.dictionary."""
    print(f"\n==================================================================")
    print(f"📦 Building Tyndale Open Bible Dictionary: {out_db_path}")
    print(f"==================================================================")

    os.makedirs(os.path.dirname(out_db_path), exist_ok=True)
    if os.path.exists(out_db_path):
        os.remove(out_db_path)

    conn = sqlite3.connect(out_db_path)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE Dictionary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            headword TEXT NOT NULL COLLATE NOCASE,
            title TEXT NOT NULL,
            definition TEXT NOT NULL,
            source TEXT DEFAULT 'TyndaleOpenBibleDictionary'
        )
    """)
    cur.execute("CREATE INDEX idx_dict_headword ON Dictionary(headword);")

    cur.execute("""
        CREATE TABLE Details (
            Title TEXT,
            Author TEXT,
            Description TEXT,
            License TEXT
        )
    """)
    cur.execute("""
        INSERT INTO Details (Title, Author, Description, License) VALUES (
            'Tyndale Open Bible Dictionary',
            'Tyndale House Publishers',
            'Comprehensive evangelical Bible dictionary with 6,000+ entries on people, places, events, and doctrines.',
            'CC BY-SA 4.0'
        )
    """)

    entries = []
    seen_entries = set()

    with zipfile.ZipFile(zip_path, 'r') as z:
        article_files = sorted([f for f in z.namelist() if f.startswith('Articles/') and f.endswith('.xml')])
        print(f"▶ Parsing {len(article_files)} article XML files...")

        for af in article_files:
            xml_data = z.read(af)
            root = ET.fromstring(xml_data)
            for item in root.findall('item'):
                if item.get('typename') != 'Article':
                    continue
                name = item.get('name') or ''
                body_elem = item.find('body')
                if body_elem is None:
                    continue
                
                h1 = item.find('.//p[@class="h1"]')
                h1_text = ''.join(h1.itertext()).strip() if h1 is not None else ''

                content = clean_xml_text(body_elem)
                if not content:
                    continue

                headwords_to_index = set()
                
                # Base name from XML item
                clean_name = re.sub(r'_Article_TyndaleOpenBibleDictionary$', '', name)
                headwords_to_index.add(clean_name)
                
                # From H1 title (e.g. "JUSTIFICATION*, JUSTIFIED" -> "Justification", "Justified")
                if h1_text:
                    clean_h1 = re.sub(r'[*]', '', h1_text).strip()
                    headwords_to_index.add(clean_h1)
                    # Split comma or slash separated terms
                    for part in re.split(r'[,/|;]', clean_h1):
                        part = part.strip()
                        if part and len(part) > 1:
                            headwords_to_index.add(part)
                            # If has parenthesis like "ABDON (Person)", also add "ABDON"
                            no_paren = re.sub(r'\(.*?\)', '', part).strip()
                            if no_paren and len(no_paren) > 1:
                                headwords_to_index.add(no_paren)

                main_title = re.sub(r'[*]', '', h1_text).title() if h1_text else clean_name

                for hw in headwords_to_index:
                    hw_clean = hw.strip()
                    if not hw_clean or (hw_clean.lower(), name) in seen_entries:
                        continue
                    seen_entries.add((hw_clean.lower(), name))
                    entries.append((hw_clean, main_title, content, 'TyndaleOpenBibleDictionary'))

    print(f"  ✓ Processed {len(entries):,} indexed dictionary entries (from {len(seen_entries):,} unique mappings)")
    cur.executemany("INSERT INTO Dictionary (headword, title, definition, source) VALUES (?, ?, ?, ?)", entries)
    conn.commit()

    cur.execute("PRAGMA vacuum;")
    cur.execute("SELECT COUNT(*) FROM Dictionary")
    total_articles = cur.fetchone()[0]
    conn.close()

    size_mb = os.path.getsize(out_db_path) / (1024 * 1024)
    print(f"✅ Successfully compiled Tyndale.dictionary ({total_articles:,} entries, {size_mb:.2f} MB)")

if __name__ == '__main__':
    notes_zip = '/Users/victorgoh/Projects/my-berean-study-suite/cmti/tyndale_open-studynotes.zip'
    dict_zip = '/Users/victorgoh/Projects/my-berean-study-suite/cmti/TyndaleOpenBibleDictionary.zip'
    
    notes_db = '/Users/victorgoh/Projects/my-berean-study-suite/berean-mcp/data/commentaries/TNotes.commentary'
    dict_db = '/Users/victorgoh/Projects/my-berean-study-suite/berean-mcp/data/dictionaries/Tyndale.dictionary'

    build_tyndale_studynotes(notes_zip, notes_db)
    build_tyndale_dictionary(dict_zip, dict_db)
