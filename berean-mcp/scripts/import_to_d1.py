#!/usr/bin/env python3
"""
Import oversized Berean SQLite databases into Cloudflare D1.

Databases:
1. berean-morphology:
   - morphology table with index on (Book, Chapter, Verse)
2. berean-reference:
   - lexicon_bdb (BDB Hebrew Lexicon)
   - encyclopedia_isbe (ISBE Encyclopedia)
   - dictionary (Easton / Webster Bible Dictionaries)
"""

import os
import sys
import sqlite3
import subprocess
import tempfile
import argparse

HOME = os.path.expanduser("~")
DATA_DIR = os.path.join(HOME, "biblemate", "data")

def escape_sql_str(val):
    if val is None:
        return "NULL"
    return "'" + str(val).replace("'", "''") + "'"

import time

def execute_d1_sql(db_name, sql_file, is_remote=True, max_retries=3):
    cmd = ["npx", "wrangler", "d1", "execute", db_name, "--file", sql_file, "-y"]
    if is_remote:
        cmd.append("--remote")
    else:
        cmd.append("--local")
        
    for attempt in range(1, max_retries + 1):
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            return True
        err_msg = res.stderr.strip() or res.stdout.strip()
        if "Authentication error" in err_msg or "rate limit" in err_msg.lower() or attempt < max_retries:
            print(f"  ⚠️ Warning on attempt {attempt}/{max_retries}: {err_msg}. Retrying in {attempt * 2}s...")
            time.sleep(attempt * 2)
        else:
            print(f"  ❌ Error executing D1 command: {err_msg}")
            return False
    return False

def format_row_values(values_tuple):
    return "(" + ", ".join(values_tuple) + ")"

def import_table_in_batches(src_db_path, src_query, dst_db_name, table_name, create_table_sql, transform_fn, batch_size=2500, rows_per_insert=50, is_remote=True, index_sql=None, skip_schema=False, col_names=None, offset=0):
    print(f"\n--- Importing from {os.path.basename(src_db_path)} into D1 '{dst_db_name}' ({table_name}) ---")
    if not os.path.exists(src_db_path):
        print(f"❌ Source DB not found: {src_db_path}")
        return False

    conn = sqlite3.connect(src_db_path)
    cursor = conn.cursor()
    cursor.execute(src_query)

    # 1. Create table schema if not skipping
    if not skip_schema and create_table_sql and offset == 0:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
            f.write(create_table_sql + "\n")
            init_file = f.name

        print(f"  Creating schema for '{table_name}' on D1 '{dst_db_name}'...")
        if not execute_d1_sql(dst_db_name, init_file, is_remote):
            os.remove(init_file)
            conn.close()
            return False
        os.remove(init_file)
        print("  ✓ Table schema created.")

    # Skip rows if offset provided
    if offset > 0:
        print(f"  ⏩ Fast-forwarding through initial {offset} rows...")
        skipped = 0
        while skipped < offset:
            to_skip = min(10000, offset - skipped)
            r = cursor.fetchmany(to_skip)
            if not r:
                break
            skipped += len(r)
        print(f"  ✓ Resuming from row {skipped}...")

    # 2. Batch inserts
    total_inserted = offset
    batch_num = offset // batch_size if batch_size > 0 else 0
    TEXT_CHUNK_LIMIT = 30000

    while True:
        rows = cursor.fetchmany(batch_size)
        if not rows:
            break

        with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
            if rows_per_insert == 1 and col_names:
                pk_col, text_col = col_names[0], col_names[1]
                for r in rows:
                    pk_val, text_val = r[0], r[1]
                    text_str = str(text_val) if text_val is not None else ""
                    if len(text_str) <= TEXT_CHUNK_LIMIT:
                        f.write(f"INSERT OR REPLACE INTO {table_name} ({pk_col}, {text_col}) VALUES ({escape_sql_str(pk_val)}, {escape_sql_str(text_str)});\n")
                    else:
                        chunks = [text_str[i:i+TEXT_CHUNK_LIMIT] for i in range(0, len(text_str), TEXT_CHUNK_LIMIT)]
                        f.write(f"INSERT OR REPLACE INTO {table_name} ({pk_col}, {text_col}) VALUES ({escape_sql_str(pk_val)}, {escape_sql_str(chunks[0])});\n")
                        for chunk in chunks[1:]:
                            f.write(f"UPDATE {table_name} SET {text_col} = {text_col} || {escape_sql_str(chunk)} WHERE {pk_col} = {escape_sql_str(pk_val)};\n")
            else:
                # Chunk rows into multi-row insert statements
                for i in range(0, len(rows), rows_per_insert):
                    chunk = rows[i:i + rows_per_insert]
                    values_list = [format_row_values(transform_fn(r)) for r in chunk]
                    f.write(f"INSERT INTO {table_name} VALUES\n" + ",\n".join(values_list) + ";\n")
            batch_file = f.name

        ok = execute_d1_sql(dst_db_name, batch_file, is_remote)
        os.remove(batch_file)
        if not ok:
            print(f"  ❌ Batch {batch_num + 1} (rows {total_inserted}..{total_inserted + len(rows)}) failed.")
            conn.close()
            return False

        batch_num += 1
        total_inserted += len(rows)
        if batch_num % 10 == 0 or len(rows) < batch_size:
            print(f"  ✓ Batch {batch_num}: Inserted {total_inserted} records...")

    # 3. Create indices if any
    if index_sql:
        print("  Building indices...")
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
            f.write(index_sql + "\n")
            idx_file = f.name
        execute_d1_sql(dst_db_name, idx_file, is_remote)
        os.remove(idx_file)
        print("  ✓ Indices created.")

    conn.close()
    print(f"✅ Successfully imported {total_inserted} rows into {dst_db_name} ({table_name})!")
    return True

def import_morphology(is_remote=True, skip_schema=False, batch_size=2500, offset=0):
    src = os.path.join(DATA_DIR, "morphology.sqlite")
    create_sql = """
    DROP TABLE IF EXISTS morphology;
    CREATE TABLE morphology (
        WordID INT,
        ClauseID INT,
        Book INT,
        Chapter INT,
        Verse INT,
        Word TEXT,
        LexicalEntry TEXT,
        MorphologyCode TEXT,
        Morphology TEXT,
        Lexeme TEXT,
        Transliteration TEXT,
        Pronunciation TEXT,
        Interlinear TEXT,
        Translation TEXT,
        Gloss TEXT
    );
    """
    index_sql = "CREATE INDEX idx_morph_bcv ON morphology (Book, Chapter, Verse);"
    
    def transform(row):
        return tuple(str(r) if (i < 5 and isinstance(r, int)) else escape_sql_str(r) for i, r in enumerate(row))

    return import_table_in_batches(
        src,
        "SELECT WordID, ClauseID, Book, Chapter, Verse, Word, LexicalEntry, MorphologyCode, Morphology, Lexeme, Transliteration, Pronunciation, Interlinear, Translation, Gloss FROM morphology",
        "biblemate-morphology",
        "morphology",
        create_sql,
        transform,
        batch_size=batch_size,
        rows_per_insert=50,
        is_remote=is_remote,
        index_sql=index_sql,
        skip_schema=skip_schema,
        offset=offset
    )

def import_lexicon_bdb(is_remote=True, skip_schema=False, batch_size=100, offset=0):
    src = os.path.join(DATA_DIR, "lexicons", "BDB.lexicon")
    create_sql = """
    DROP TABLE IF EXISTS lexicon_bdb;
    CREATE TABLE lexicon_bdb (
        Topic TEXT PRIMARY KEY,
        Definition TEXT
    );
    """
    
    def transform(row):
        return (escape_sql_str(row[0]), escape_sql_str(row[1]))

    return import_table_in_batches(
        src,
        "SELECT Topic, Definition FROM Lexicon",
        "biblemate-reference",
        "lexicon_bdb",
        create_sql,
        transform,
        batch_size=batch_size,
        rows_per_insert=1,
        is_remote=is_remote,
        skip_schema=skip_schema,
        col_names=("Topic", "Definition"),
        offset=offset
    )

def import_encyclopedia_isbe(is_remote=True, skip_schema=False, batch_size=50, offset=0):
    src = os.path.join(DATA_DIR, "data", "encyclopedia.data")
    create_sql = """
    DROP TABLE IF EXISTS encyclopedia_isbe;
    CREATE TABLE encyclopedia_isbe (
        path TEXT PRIMARY KEY,
        content TEXT
    );
    """
    
    def transform(row):
        return (escape_sql_str(row[0]), escape_sql_str(row[1]))

    return import_table_in_batches(
        src,
        "SELECT path, content FROM ISB",
        "biblemate-reference",
        "encyclopedia_isbe",
        create_sql,
        transform,
        batch_size=batch_size,
        rows_per_insert=1,
        is_remote=is_remote,
        skip_schema=skip_schema,
        col_names=("path", "content"),
        offset=offset
    )

def import_dictionary(is_remote=True, skip_schema=False, batch_size=100, offset=0):
    src = os.path.join(DATA_DIR, "data", "dictionary.data")
    create_sql = """
    DROP TABLE IF EXISTS dictionary;
    CREATE TABLE dictionary (
        path TEXT PRIMARY KEY,
        content TEXT
    );
    """
    
    def transform(row):
        return (escape_sql_str(row[0]), escape_sql_str(row[1]))

    return import_table_in_batches(
        src,
        "SELECT path, content FROM Dictionary",
        "biblemate-reference",
        "dictionary",
        create_sql,
        transform,
        batch_size=batch_size,
        rows_per_insert=1,
        is_remote=is_remote,
        skip_schema=skip_schema,
        col_names=("path", "content"),
        offset=offset
    )

def main():
    parser = argparse.ArgumentParser(description="Import SQLite data to Cloudflare D1")
    parser.add_argument("--local", action="store_true", help="Execute against local D1 instead of remote")
    parser.add_argument("--only", choices=["morphology", "bdb", "isbe", "dictionary"], help="Import only specific table")
    parser.add_argument("--skip-schema", action="store_true", help="Skip DROP/CREATE TABLE schema step")
    parser.add_argument("--batch-size", type=int, default=0, help="Custom batch size per execute call")
    parser.add_argument("--offset", type=int, default=0, help="Resume from row offset")
    args = parser.parse_args()

    is_remote = not args.local
    print("=" * 60)
    print(f" Cloudflare D1 Data Importer ({'REMOTE' if is_remote else 'LOCAL'})")
    print("=" * 60)

    if not args.only or args.only == "morphology":
        bs = args.batch_size if args.batch_size > 0 else 2500
        import_morphology(is_remote, skip_schema=args.skip_schema, batch_size=bs, offset=args.offset)
        
    if not args.only or args.only == "bdb":
        bs = args.batch_size if args.batch_size > 0 else 100
        import_lexicon_bdb(is_remote, skip_schema=args.skip_schema, batch_size=bs, offset=args.offset)
        
    if not args.only or args.only == "isbe":
        bs = args.batch_size if args.batch_size > 0 else 50
        import_encyclopedia_isbe(is_remote, skip_schema=args.skip_schema, batch_size=bs, offset=args.offset)
        
    if not args.only or args.only == "dictionary":
        bs = args.batch_size if args.batch_size > 0 else 100
        import_dictionary(is_remote, skip_schema=args.skip_schema, batch_size=bs, offset=args.offset)

    print("\n" + "=" * 60)
    print("🎉 D1 Data Import Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
