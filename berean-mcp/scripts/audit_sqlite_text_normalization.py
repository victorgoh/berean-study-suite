#!/usr/bin/env python3
"""Read-only audit for HTML entities and legacy punctuation in SQLite resources."""

import argparse
import csv
import os
import sqlite3
import sys


EXTENSIONS = {".bible", ".book", ".commentary", ".data", ".dictionary", ".lexicon", ".sqlite"}
TEXT_NAMES = {"content", "definition", "description", "information", "scripture", "text", "title"}
ENTITY_SQL = "({column} GLOB '*&[A-Za-z]*;*' OR {column} GLOB '*&#*;*')"
LEGACY_SQL = "(" + " OR ".join(f"instr({{column}}, char({code})) > 0" for code in (133, 145, 146, 147, 148, 149, 150, 151)) + ")"


def quote(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def candidate_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    columns = []
    for _, name, declared_type, *_ in conn.execute(f"PRAGMA table_info({quote(table)})"):
        if name.lower() in TEXT_NAMES or "TEXT" in (declared_type or "").upper() or "CHAR" in (declared_type or "").upper() or "CLOB" in (declared_type or "").upper():
            columns.append(name)
    return columns


def audit_file(path: str) -> list[dict[str, object]]:
    uri = f"file:{path}?mode=ro"
    conn = sqlite3.connect(uri, uri=True)
    try:
        tables = [row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
        findings = []
        for table in tables:
            for column in candidate_columns(conn, table):
                col = quote(column)
                entity_rows = conn.execute(f"SELECT count(*) FROM {quote(table)} WHERE {ENTITY_SQL.format(column=col)}").fetchone()[0]
                legacy_rows = conn.execute(f"SELECT count(*) FROM {quote(table)} WHERE {LEGACY_SQL.format(column=col)}").fetchone()[0]
                if entity_rows or legacy_rows:
                    findings.append({
                        "path": path,
                        "table": table,
                        "column": column,
                        "entity_rows": entity_rows,
                        "legacy_rows": legacy_rows,
                        "size_bytes": os.path.getsize(path),
                    })
        return findings
    finally:
        conn.close()


def iter_resources(root: str):
    for directory, directories, files in os.walk(root):
        directories[:] = [name for name in directories if name not in {"normalized", "__MACOSX"}]
        if os.path.basename(directory) in {"normalized", "__MACOSX"}:
            continue
        for filename in files:
            if os.path.splitext(filename)[1].lower() in EXTENSIONS:
                yield os.path.join(directory, filename)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audit SQLite resource text without modifying files.")
    parser.add_argument("root")
    parser.add_argument("--csv", required=True, help="Path for CSV findings")
    args = parser.parse_args()

    findings = []
    failures = []
    resources = list(iter_resources(args.root))
    for index, path in enumerate(resources, start=1):
        try:
            findings.extend(audit_file(path))
        except sqlite3.Error as error:
            failures.append((path, str(error)))
        print(f"[{index}/{len(resources)}] {path}", file=sys.stderr)

    with open(args.csv, "w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["path", "table", "column", "entity_rows", "legacy_rows", "size_bytes"])
        writer.writeheader()
        writer.writerows(findings)

    print(f"Audited {len(resources)} resources; {len(findings)} text columns need normalization; {len(failures)} unreadable resources.")
    for path, error in failures:
        print(f"Unreadable: {path}: {error}", file=sys.stderr)
