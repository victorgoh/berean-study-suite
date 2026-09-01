#!/usr/bin/env python3
"""Import Tyndale Open Study Notes Themes and Profiles into one SQLite resource.

The importer keeps the supplied body XML intact so future dedicated services can
choose their own display rendering. It deliberately does not process charts,
maps, pictures, or textboxes.
"""

import argparse
import os
import sqlite3
import xml.etree.ElementTree as ET


def inner_xml(element: ET.Element) -> str:
    parts = [element.text or ""]
    for child in element:
        parts.append(ET.tostring(child, encoding="unicode"))
    return "".join(parts).strip()


def read_items(source_dir: str, filename: str, resource_type: str) -> list[tuple[str, str, str, str, str]]:
    root = ET.parse(os.path.join(source_dir, filename)).getroot()
    rows = []
    for item in root.findall("item"):
        title = (item.findtext("title") or item.get("name") or "").strip()
        refs = (item.findtext("refs") or "").strip()
        body = item.find("body")
        content = inner_xml(body) if body is not None else ""
        item_id = (item.get("name") or title).strip()
        if title and content:
            rows.append((resource_type, item_id, title, refs, content))
    return rows


def build_database(source_dir: str, output: str, overwrite: bool) -> None:
    if os.path.exists(output) and not overwrite:
        raise FileExistsError(f"Output already exists: {output}. Use --overwrite to replace it.")
    os.makedirs(os.path.dirname(os.path.abspath(output)), exist_ok=True)
    if os.path.exists(output):
        os.remove(output)

    rows = read_items(source_dir, "ThemeNotes.xml", "theme")
    rows.extend(read_items(source_dir, "Profiles.xml", "profile"))

    conn = sqlite3.connect(output)
    try:
        conn.executescript("""
            CREATE TABLE TyndaleResource (
                ResourceType TEXT NOT NULL CHECK (ResourceType IN ('theme', 'profile')),
                ResourceId TEXT NOT NULL,
                Title TEXT NOT NULL,
                Refs TEXT NOT NULL,
                Content TEXT NOT NULL,
                PRIMARY KEY (ResourceType, ResourceId)
            );
            CREATE INDEX idx_tyndale_resource_title ON TyndaleResource (ResourceType, Title COLLATE NOCASE);
            CREATE TABLE Details (
                SourceName TEXT NOT NULL,
                SourceDirectory TEXT NOT NULL,
                License TEXT NOT NULL,
                Importer TEXT NOT NULL
            );
        """)
        conn.executemany(
            "INSERT INTO TyndaleResource (ResourceType, ResourceId, Title, Refs, Content) VALUES (?, ?, ?, ?, ?)", rows
        )
        conn.execute(
            "INSERT INTO Details VALUES (?, ?, ?, ?)",
            ("Tyndale Open Study Notes", os.path.basename(os.path.abspath(source_dir)), "CC BY-SA 4.0", "prepare_tyndale_themes_profiles.py"),
        )
        conn.commit()
        themes = sum(1 for row in rows if row[0] == "theme")
        profiles = len(rows) - themes
        print(f"Created {output}: {themes} themes and {profiles} profiles.")
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True, help="Extracted Tyndale Open Study Notes directory")
    parser.add_argument("--output", required=True, help="Output SQLite database path")
    parser.add_argument("--overwrite", action="store_true", help="Replace an existing output database")
    args = parser.parse_args()
    build_database(args.source_dir, args.output, args.overwrite)
