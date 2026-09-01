#!/usr/bin/env python3
"""Create a source-preserving, display-normalized SQLite resource copy.

Only typographic/numeric entities and legacy Windows-1252 punctuation are
normalized. HTML structural entities (such as &lt; and &amp;) remain unchanged
so source markup continues to be safe to parse at request time.
"""

import argparse
import hashlib
import html.entities
import os
import re
import shutil
import sqlite3
import unicodedata
from datetime import datetime, timezone


WINDOWS_1252 = str.maketrans({
    "\u0085": "…", "\u0091": "‘", "\u0092": "’", "\u0093": "“", "\u0094": "”",
    "\u0095": "•", "\u0096": "–", "\u0097": "—",
})
UNSAFE_HTML_CODEPOINTS = {34, 38, 39, 60, 62}
STRUCTURAL_ENTITIES = {"amp", "apos", "gt", "lt", "quot"}


def decode_codepoint(match: re.Match[str], radix: int) -> str:
    original, value = match.group(0), match.group(1)
    try:
        codepoint = int(value, radix)
    except ValueError:
        return original
    if codepoint in UNSAFE_HTML_CODEPOINTS or not (0 <= codepoint <= 0x10FFFF) or 0xD800 <= codepoint <= 0xDFFF:
        return original
    return chr(codepoint)


def normalize_content(value: str) -> str:
    value = re.sub(r"&#x([0-9a-f]+);", lambda m: decode_codepoint(m, 16), value, flags=re.IGNORECASE)
    value = re.sub(r"&#(\d+);", lambda m: decode_codepoint(m, 10), value)
    def decode_named(match: re.Match[str]) -> str:
        name = match.group(1)
        if name.lower() in STRUCTURAL_ENTITIES:
            return match.group(0)
        return html.entities.html5.get(name + ";", match.group(0))

    value = re.sub(r"&([a-z][a-z0-9]+);", decode_named, value, flags=re.IGNORECASE)
    return unicodedata.normalize("NFC", value.translate(WINDOWS_1252)).replace("\u00A0", " ")


def checksum(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def quote_identifier(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def normalize_database(source: str, output: str, table: str, column: str) -> tuple[int, int]:
    if os.path.abspath(source) == os.path.abspath(output):
        raise ValueError("Output must be a separate normalized copy; source files are never overwritten.")
    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    shutil.copy2(source, output)

    table_name, column_name = quote_identifier(table), quote_identifier(column)
    conn = sqlite3.connect(output)
    try:
        available = {row[1] for row in conn.execute(f"PRAGMA table_info({table_name})")}
        if column not in available:
            raise ValueError(f"Column '{column}' not found in table '{table}'.")

        rows_changed = 0
        rows_seen = 0
        cursor = conn.execute(f"SELECT rowid, {column_name} FROM {table_name}")
        updates = []
        for rowid, raw_value in cursor:
            rows_seen += 1
            if raw_value is None:
                continue
            normalized = normalize_content(raw_value)
            if normalized != raw_value:
                updates.append((normalized, rowid))
            if len(updates) >= 1000:
                conn.executemany(f"UPDATE {table_name} SET {column_name} = ? WHERE rowid = ?", updates)
                rows_changed += len(updates)
                updates.clear()
        if updates:
            conn.executemany(f"UPDATE {table_name} SET {column_name} = ? WHERE rowid = ?", updates)
            rows_changed += len(updates)

        conn.execute("CREATE TABLE IF NOT EXISTS NormalizationMetadata (Name TEXT PRIMARY KEY, Value TEXT NOT NULL)")
        metadata = {
            "normalizer": "normalize_sqlite_content.py",
            "normalizer_version": "1",
            "source_filename": os.path.basename(source),
            "source_sha256": checksum(source),
            "normalized_at_utc": datetime.now(timezone.utc).isoformat(),
            "normalized_table": table,
            "normalized_column": column,
        }
        conn.executemany(
            "INSERT OR REPLACE INTO NormalizationMetadata (Name, Value) VALUES (?, ?)",
            metadata.items(),
        )
        conn.commit()
        integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise RuntimeError(f"Integrity check failed: {integrity}")
        return rows_seen, rows_changed
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a normalized derivative SQLite resource.")
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--table", default="Commentary")
    parser.add_argument("--column", default="Scripture")
    args = parser.parse_args()
    seen, changed = normalize_database(args.source, args.output, args.table, args.column)
    print(f"Created {args.output}: normalized {changed} of {seen} {args.table}.{args.column} rows.")
