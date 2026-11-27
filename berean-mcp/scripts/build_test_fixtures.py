#!/usr/bin/env python3
"""Build small sample Bible databases for tests that run without the full data.

GitHub Actions has none of the large resource files, so the CI test run points
DATA_DIR at test/fixtures, which holds a few chapters of four translations cut
from the real databases (same schema). Rebuild after changing CHAPTERS:

    python3 scripts/build_test_fixtures.py [path/to/full/data]   # default ~/biblemate/data
"""
import os
import sqlite3
import sys
from pathlib import Path

VERSIONS = ["BSB", "KJV", "NET", "WEB"]
# (book number, chapter) pairs used by the CI-run checks.
CHAPTERS = [(1, 1), (1, 50), (19, 23), (39, 4), (40, 11), (43, 1), (43, 3), (43, 11), (45, 8)]

source_dir = Path(sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/biblemate/data")) / "bibles"
out_dir = Path(__file__).resolve().parent.parent / "test" / "fixtures" / "bibles"
out_dir.mkdir(parents=True, exist_ok=True)

for version in VERSIONS:
    src = sqlite3.connect(source_dir / f"{version}.bible")
    target = out_dir / f"{version}.bible"
    target.unlink(missing_ok=True)
    dst = sqlite3.connect(target)
    for (sql,) in src.execute("SELECT sql FROM sqlite_master WHERE type = 'table' AND sql IS NOT NULL"):
        dst.execute(sql)
    tables = [name for (name,) in src.execute("SELECT name FROM sqlite_master WHERE type = 'table'")]
    for table in tables:
        cols = [row[1] for row in src.execute(f"PRAGMA table_info({table})")]
        if "Book" not in cols or "Chapter" not in cols:
            continue
        placeholders = ",".join("?" * len(cols))
        for book, chapter in CHAPTERS:
            rows = src.execute(f"SELECT * FROM {table} WHERE Book = ? AND Chapter = ?", (book, chapter)).fetchall()
            dst.executemany(f"INSERT INTO {table} VALUES ({placeholders})", rows)
    dst.commit()
    dst.execute("VACUUM")
    dst.close()
    print(f"{target} ({target.stat().st_size:,} bytes)")
