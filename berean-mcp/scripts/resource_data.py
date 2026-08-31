#!/usr/bin/env python3
"""Manifest-driven local resource validation and R2 upload planning."""

import argparse
import hashlib
import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = PROJECT_ROOT.parent / "docs" / "agent-resource-manifest.json"


def load_manifest():
    with MANIFEST.open(encoding="utf-8") as handle:
        return json.load(handle)


def data_roots():
    configured = os.environ.get("BEREAN_DATA_DIR")
    roots = [Path(configured)] if configured else []
    roots.extend([PROJECT_ROOT / "data", Path.home() / "biblemate" / "data", Path.home() / ".biblemate" / "data"])
    return list(dict.fromkeys(root for root in roots if root))


def resolve_pattern(pattern):
    candidates = []
    for root in data_roots():
        candidates.extend(root.glob(pattern))
    candidates.extend((PROJECT_ROOT / pattern).parent.glob(Path(pattern).name) if not any(ch in pattern for ch in "*?[") else (PROJECT_ROOT / pattern).parent.glob(Path(pattern).name))
    return sorted({p for p in candidates if p.is_file()})


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def sqlite_check(path):
    try:
        with sqlite3.connect(path) as db:
            result = db.execute("PRAGMA integrity_check").fetchone()[0]
            return result == "ok", result
    except Exception as exc:
        return False, str(exc)


def files_for_resource(resource):
    paths = resource.get("localPaths", [])
    if resource.get("localPath"):
        paths.append(resource["localPath"])
    if resource.get("localGlob"):
        paths.append(resource["localGlob"])
    found = []
    missing = []
    for pattern in paths:
        matches = resolve_pattern(pattern)
        if matches:
            found.extend(matches)
        else:
            missing.append(pattern)
    return sorted(set(found)), missing


def status(fail_on_required=False):
    report = {"manifest": str(MANIFEST), "dataRoots": [str(p) for p in data_roots()], "resources": []}
    failures = 0
    for resource in load_manifest()["resources"]:
        found, missing = files_for_resource(resource)
        entries = []
        for path in found:
            item = {"path": str(path), "sizeBytes": path.stat().st_size, "sha256": sha256(path)}
            if path.suffix in {".sqlite", ".db", ".data", ".bible", ".commentary"}:
                item["sqliteIntegrity"], item["sqliteIntegrityDetail"] = sqlite_check(path)
            entries.append(item)
        report["resources"].append({"id": resource["id"], "sourceFamily": resource["sourceFamily"], "required": resource.get("required", False), "needsReview": resource.get("needsReview", False), "files": entries, "missingPatterns": missing})
    print(json.dumps(report, indent=2))
    if fail_on_required:
        for resource in report["resources"]:
            if resource["required"] and (resource["missingPatterns"] or not resource["files"] or any(item.get("sqliteIntegrity") is False for item in resource["files"])):
                failures += 1
        if failures:
            raise SystemExit(failures)


def upload_plan():
    manifest = load_manifest()
    bucket = os.environ.get("R2_BUCKET", "biblemate-data")
    failures = 0
    for resource in manifest["resources"]:
        if resource.get("needsReview"):
            print(f"SKIP {resource['id']}: needs provenance/license review")
            continue
        found, missing = files_for_resource(resource)
        if not found and resource.get("required"):
            print(f"ERROR {resource['id']}: required resource is missing ({', '.join(missing)})")
            failures += 1
            continue
        for path in found:
            key = resource.get("r2Key") or resource.get("r2Prefix")
            if not key:
                print(f"SKIP {resource['id']}: no R2 destination")
                continue
            if key.endswith("/"):
                key += path.name
            print(f"DRY-RUN npx wrangler r2 object put {bucket}/{key} --file={path} --remote")
    if failures:
        raise SystemExit(1)


parser = argparse.ArgumentParser(description="Validate Berean resource files and produce safe R2 upload plans.")
parser.add_argument("command", choices=["status", "validate", "upload-plan"])
args = parser.parse_args()

if args.command in {"status", "validate"}:
    status(fail_on_required=args.command == "validate")
else:
    upload_plan()
