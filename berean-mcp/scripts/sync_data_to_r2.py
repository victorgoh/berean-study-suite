#!/usr/bin/env python3
"""
Berean Data Sync to Cloudflare R2
------------------------------------
This script uploads local Bible & reference SQLite databases
to a Cloudflare R2 bucket ('biblemate-data').

Usage:
  python3 scripts/sync_data_to_r2.py [--bucket-name biblemate-data] [--dry-run]
"""

import os
import sys
import glob
import subprocess
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Upload BibleMate data to Cloudflare R2")
    parser.add_argument("--bucket", default="biblemate-data", help="R2 bucket name (default: biblemate-data)")
    parser.add_argument("--data-dir", default=os.path.expanduser("~/biblemate/data"), help="Path to local data directory")
    parser.add_argument("--dry-run", action="store_true", help="List files to be uploaded without executing upload")
    parser.add_argument("--include-vectors", action="store_true", help="Include large vector databases (~1.2GB)")
    return parser.parse_args()

def check_wrangler_installed():
    try:
        res = subprocess.run(["npx", "wrangler", "--version"], capture_output=True, text=True, check=True)
        return True
    except Exception:
        return False

def ensure_bucket_exists(bucket_name, dry_run=False):
    if dry_run:
        print(f"[DRY-RUN] Ensuring R2 bucket '{bucket_name}' exists...")
        return
    print(f"Ensuring R2 bucket '{bucket_name}' exists...")
    try:
        subprocess.run(["npx", "wrangler", "r2", "bucket", "create", bucket_name], capture_output=True, text=True)
    except Exception as e:
        print(f"Bucket check note: {e}")

def get_files_to_upload(data_dir, include_vectors=False):
    if not os.path.exists(data_dir):
        print(f"Error: Data directory not found at {data_dir}")
        sys.exit(1)

    all_files = []
    for root, _, files in os.walk(data_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, data_dir)
            
            # Skip hidden files or system files
            if f.startswith(".") or f.endswith(".tmp"):
                continue
                
            # Skip vectors by default unless explicitly included
            if not include_vectors and rel_path.startswith("vectors"):
                continue

            size_mb = os.path.getsize(full_path) / (1024 * 1024)
            all_files.append((full_path, rel_path, size_mb))

    return sorted(all_files, key=lambda x: x[1])

def upload_file(bucket_name, full_path, rel_path, dry_run=False):
    r2_key = f"{bucket_name}/{rel_path}"
    if dry_run:
        print(f"[DRY-RUN] Upload: {rel_path} -> r2://{r2_key}")
        return True

    print(f"Uploading {rel_path} to R2 bucket '{bucket_name}'...")
    cmd = [
        "npx", "wrangler", "r2", "object", "put",
        f"{bucket_name}/{rel_path}",
        "--file", full_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ Uploaded {rel_path}")
        return True
    else:
        print(f"✗ Failed to upload {rel_path}: {result.stderr.strip() or result.stdout.strip()}")
        return False

def main():
    args = parse_args()
    print("=" * 60)
    print(" Berean -> Cloudflare R2 Synchronization")
    print("=" * 60)
    print(f"Source Directory: {args.data_dir}")
    print(f"Target R2 Bucket: {args.bucket}")
    print(f"Dry Run: {args.dry_run}")
    print(f"Include Vectors: {args.include_vectors}")
    print("-" * 60)

    if not check_wrangler_installed():
        print("Error: 'wrangler' is not available. Run 'npm install' in berean-mcp first.")
        sys.exit(1)

    files = get_files_to_upload(args.data_dir, args.include_vectors)
    total_size_mb = sum(f[2] for f in files)
    print(f"Found {len(files)} files to upload (Total size: {total_size_mb:.2f} MB)\n")

    ensure_bucket_exists(args.bucket, args.dry_run)

    success_count = 0
    fail_count = 0

    for full_path, rel_path, size_mb in files:
        print(f"[{size_mb:6.2f} MB] {rel_path}")
        ok = upload_file(args.bucket, full_path, rel_path, args.dry_run)
        if ok:
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "=" * 60)
    if args.dry_run:
        print(f"Dry run complete. {len(files)} files scanned successfully.")
    else:
        print(f"Sync complete: {success_count} succeeded, {fail_count} failed.")
    print("=" * 60)

if __name__ == "__main__":
    main()
