#!/usr/bin/env python3
"""Build the seed dictionary CSVs from WordNet 3.1 and a word-frequency list.

Filters applied:
- single words only (lowercase letters, internal hyphens allowed), length 3-16
- nouns: drop lemmas that only occur in WordNet "instance" synsets (named
  people, places, organizations - marked with an @i instance-hypernym pointer)
- both: drop words outside the top FREQUENCY_CUTOFF of the frequency list
  (each hyphen-separated part must be common)

Inputs (download once):
  https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz  (extract dict/)
  https://norvig.com/ngrams/count_1w.txt

Usage: build-dictionary.py <wordnet-dict-dir> <count_1w.txt>
Writes: backend/src/main/resources/dictionary/{adjectives,nouns}.csv
"""

import re
import sys
from pathlib import Path

FREQUENCY_CUTOFF = 20_000
WORD_RE = re.compile(r"[a-z]+(-[a-z]+)*")
OUT_DIR = Path(__file__).resolve().parent.parent / "backend/src/main/resources/dictionary"


def load_ranks(count_1w: Path) -> dict[str, int]:
    with open(count_1w) as f:
        return {line.split("\t")[0]: i for i, line in enumerate(f, 1)}


def instance_only_nouns(data_noun: Path) -> set[str]:
    """Lemmas that appear exclusively in instance synsets (named entities)."""
    instance, regular = set(), set()
    with open(data_noun) as f:
        for line in f:
            if line.startswith("  "):  # license header
                continue
            fields = line.split(" ")
            word_count = int(fields[3], 16)
            lemmas = {fields[4 + 2 * i].lower() for i in range(word_count)}
            pointer_start = 4 + 2 * word_count
            pointer_count = int(fields[pointer_start])
            symbols = {fields[pointer_start + 1 + 4 * i] for i in range(pointer_count)}
            (instance if "@i" in symbols else regular).update(lemmas)
    return instance - regular


def load_index_lemmas(index_file: Path) -> list[str]:
    lemmas = []
    with open(index_file) as f:
        for line in f:
            if line.startswith("  "):
                continue
            lemma = line.split(" ", 1)[0]
            if WORD_RE.fullmatch(lemma) and 3 <= len(lemma) <= 16:
                lemmas.append(lemma)
    return lemmas


def main(dict_dir: Path, count_1w: Path) -> None:
    ranks = load_ranks(count_1w)

    def is_common(lemma: str) -> bool:
        return all(ranks.get(part, sys.maxsize) <= FREQUENCY_CUTOFF for part in lemma.split("-"))

    named_entities = instance_only_nouns(dict_dir / "data.noun")
    adjectives = sorted(w for w in load_index_lemmas(dict_dir / "index.adj") if is_common(w))
    nouns = sorted(
        w for w in load_index_lemmas(dict_dir / "index.noun")
        if w not in named_entities and is_common(w)
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, words in (("adjectives.csv", adjectives), ("nouns.csv", nouns)):
        (OUT_DIR / name).write_text("\n".join(words) + "\n")
        print(f"{name}: {len(words)} words")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
