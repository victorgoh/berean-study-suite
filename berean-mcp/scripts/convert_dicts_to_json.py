#!/usr/bin/env python3
"""
Convert Berean Python dictionary and flat text files into structured JSON lookup files.
"""

import os
import sys
import json
import re

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AGENTS_DIR = os.path.join(WORKSPACE_ROOT, ".agents", "skills")
MCP_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "lookup")
os.makedirs(MCP_DATA_DIR, exist_ok=True)

def convert_python_dict(py_path, var_name, out_json_name):
    if not os.path.exists(py_path):
        print(f"⚠️  File not found: {py_path}")
        return
    
    print(f"Converting {os.path.basename(py_path)} -> {out_json_name}...")
    with open(py_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    local_vars = {}
    exec(code, {}, local_vars)
    data = local_vars.get(var_name, {})
    
    out_path = os.path.join(MCP_DATA_DIR, out_json_name)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"✓ Wrote {out_json_name} ({len(data)} entries, {os.path.getsize(out_path) / 1024:.1f} KB)")

def convert_bible_names():
    names_file = os.path.join(AGENTS_DIR, "names", "data", "Bible Names.txt")
    if not os.path.exists(names_file):
        print(f"⚠️  Names file not found: {names_file}")
        return
        
    print("Converting Bible Names.txt -> bible_names.json...")
    records = []
    with open(names_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if ' - ' in line:
                parts = line.split(' - ', 1)
                records.append({
                    "name": parts[0].strip(),
                    "meaning": parts[1].strip()
                })
            else:
                records.append({
                    "name": line,
                    "meaning": ""
                })
                
    out_path = os.path.join(MCP_DATA_DIR, "bible_names.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"✓ Wrote bible_names.json ({len(records)} entries)")

def convert_chronology():
    chrono_dir = os.path.join(AGENTS_DIR, "chronology", "data")
    if not os.path.exists(chrono_dir):
        print(f"⚠️  Chronology dir not found: {chrono_dir}")
        return
        
    print("Converting Chronology text files -> chronology.json...")
    sections = {}
    for filename in sorted(os.listdir(chrono_dir)):
        if filename.endswith(".txt"):
            section_name = os.path.splitext(filename)[0]
            with open(os.path.join(chrono_dir, filename), 'r', encoding='utf-8') as f:
                lines = [l.strip() for l in f if l.strip()]
            sections[section_name] = lines
            
    out_path = os.path.join(MCP_DATA_DIR, "chronology.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)
    print(f"✓ Wrote chronology.json ({len(sections)} sections)")

def convert_daily_readings():
    reader_file = os.path.join(AGENTS_DIR, "daily-read", "daily_reader.py")
    if not os.path.exists(reader_file):
        print(f"⚠️  Daily reader file not found: {reader_file}")
        return
        
    print("Converting daily_reader.py allDays -> daily_readings.json...")
    with open(reader_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    match = re.search(r'allDays\s*=\s*(\{[\s\S]*?\n\})', content)
    if match:
        local_vars = {}
        exec(f"allDays = {match.group(1)}", {}, local_vars)
        data = local_vars.get("allDays", {})
        # Map string keys for JSON
        json_data = {str(k): v for k, v in data.items()}
        out_path = os.path.join(MCP_DATA_DIR, "daily_readings.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        print(f"✓ Wrote daily_readings.json ({len(json_data)} days)")

def main():
    print("=" * 60)
    print(" Converting Berean Python Dicts to JSON Lookup Files")
    print("=" * 60)
    
    # 1. Topics
    convert_python_dict(
        os.path.join(AGENTS_DIR, "topics", "data", "exlbt_dict.py"),
        "EXLBT",
        "exlbt_index.json"
    )
    
    # 2. Characters
    convert_python_dict(
        os.path.join(AGENTS_DIR, "characters", "data", "exlbp_dict.py"),
        "EXLBP",
        "exlbp_index.json"
    )
    
    # 3. Locations
    convert_python_dict(
        os.path.join(AGENTS_DIR, "locations", "data", "bible_locations.py"),
        "allLocations",
        "locations_index.json"
    )
    
    # 4. Parallels
    convert_python_dict(
        os.path.join(AGENTS_DIR, "parallels", "data", "parallels_dict.py"),
        "PARALLEL",
        "parallels_index.json"
    )
    
    # 5. Promises
    convert_python_dict(
        os.path.join(AGENTS_DIR, "promises", "data", "promises_dict.py"),
        "PROMISES",
        "promises_index.json"
    )
    
    # 6. Dictionaries (Easton / Smith lookup map)
    convert_python_dict(
        os.path.join(AGENTS_DIR, "dictionaries", "data", "dictionaries_dict.py"),
        "DICTIONARIES",
        "dictionaries_index.json"
    )
    
    # 7. Encyclopedia (ISBE / CBE lookup map)
    convert_python_dict(
        os.path.join(AGENTS_DIR, "encyclopedias", "data", "encyclopedia_dict.py"),
        "ENCYCLOPEDIA",
        "encyclopedia_index.json"
    )
    
    # 8. Bible Names
    convert_bible_names()
    
    # 9. Chronology
    convert_chronology()
    
    # 10. Daily Readings
    convert_daily_readings()
    
    print("\n" + "=" * 60)
    print(f"All JSON lookup files created in: {MCP_DATA_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
