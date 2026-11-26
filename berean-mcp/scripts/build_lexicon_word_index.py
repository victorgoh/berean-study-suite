#!/usr/bin/env python3
"""Build data/lookup/lexicon_words.json: find Strong's numbers by word.

Lets lexicon_lookup and word_study_pack accept "agape", "shalom", "αγαπη" or
an English word such as "rest" instead of a Strong's number.

Input: the STEPBible lexicon rows (strongs, lemma, transliteration, gloss),
either as a `wrangler d1 execute --json` export or as step_lexicon.sqlite:

    npx wrangler d1 execute biblemate-reference --remote --json \\
      --command "SELECT strongs, lemma, transliteration, gloss FROM lexicon_step" > lexicon_step.json
    python3 scripts/build_lexicon_word_index.py lexicon_step.json

    python3 scripts/build_lexicon_word_index.py ~/biblemate/data/lexicons/step_lexicon.sqlite

Output (compact JSON):
    entries: { "G0026": ["ἀγάπη", "agapē", "love"], ... }
    forms:   normalized transliteration or lemma -> [Strong's]   ("agape" -> ["G0026"])
    glosses: English gloss word -> [Strong's], best matches first ("rest" -> [...])

Normalization (must match normalizeWord() in src/services/lexiconService.ts):
NFD, drop combining marks, lowercase, keep letters and digits only.
"""
import json
import re
import sqlite3
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

MAX_PER_KEY = 10
STOP_WORDS = {"to", "the", "a", "an", "of", "be", "in", "on", "for", "and", "or", "with", "at", "by", "from", "as", "is", "one", "who", "that"}
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "lookup" / "lexicon_words.json"


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text or "")
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch) and ch.isalnum()).lower()


def load_rows(path: str):
    if path.endswith((".sqlite", ".db")):
        con = sqlite3.connect(path)
        return [dict(zip(("strongs", "lemma", "transliteration", "gloss"), row))
                for row in con.execute("SELECT strongs, lemma, transliteration, gloss FROM lexicon_step")]
    text = Path(path).read_text(encoding="utf-8")
    data = json.loads(text[text.index("["):])
    return data[0]["results"] if isinstance(data, list) and "results" in data[0] else data


def gloss_words(gloss: str):
    return [w for w in re.split(r"[^a-z]+", (gloss or "").lower()) if w and w not in STOP_WORDS]


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    rows = [r for r in load_rows(sys.argv[1]) if r.get("strongs")]

    entries = {}
    forms = defaultdict(list)
    ranked_glosses = defaultdict(list)  # word -> [(rank, gloss length, strongs)]
    for r in rows:
        strongs = r["strongs"].strip().upper()
        lemma, translit, gloss = (r.get("lemma") or "").strip(), (r.get("transliteration") or "").strip(), (r.get("gloss") or "").strip()
        entries[strongs] = [lemma, translit, gloss]
        for form in {normalize(translit), normalize(lemma.split(",")[0])}:
            if form and strongs not in forms[form]:
                forms[form].append(strongs)
        words = gloss_words(gloss)
        core = re.sub(r"^to ", "", gloss.lower()).strip()
        for position, word in enumerate(words):
            rank = 0 if core == word else (1 if position == 0 else 2)
            ranked_glosses[word].append((rank, len(gloss), strongs))

    glosses = {}
    for word, items in ranked_glosses.items():
        ordered = []
        for _, _, strongs in sorted(items, key=lambda x: (x[0], x[1], x[2])):
            if strongs not in ordered:
                ordered.append(strongs)
        glosses[word] = ordered[:MAX_PER_KEY]

    out = {
        "version": 1,
        "source": "STEPBible TBESG/TBESH (Tyndale House, CC BY 4.0) via lexicon_step",
        "entries": entries,
        "forms": {k: v[:MAX_PER_KEY] for k, v in forms.items()},
        "glosses": glosses,
    }
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes): {len(entries)} entries, {len(out['forms'])} forms, {len(glosses)} gloss words")


if __name__ == "__main__":
    main()
