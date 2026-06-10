#!/usr/bin/env python3
"""Deterministyczna walidacja danych i stron katalogu AI Przewodnik."""

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATEGORY_FILES = sorted(ROOT.glob("szkolenia-ai-*.html"))


def fail(errors, message):
    errors.append(message)


def load_json(path, errors):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(errors, f"{path.relative_to(ROOT)}: niepoprawny JSON: {exc}")
        return None


def main():
    errors = []
    warnings = []
    courses = load_json(ROOT / "data/courses.json", errors)
    counts = load_json(ROOT / "data/category-counts.json", errors)

    if isinstance(courses, list):
        keys = [
            (
                x.get("name", "").strip().lower(),
                x.get("url", "").strip().rstrip("/").lower(),
            )
            for x in courses
        ]
        duplicates = sorted(key for key, count in Counter(keys).items() if all(key) and count > 1)
        if duplicates:
            fail(
                errors,
                "data/courses.json: zduplikowane szkolenia: "
                + ", ".join(f"{name} ({url})" for name, url in duplicates),
            )

    actual_counts = {}
    total_cards = 0
    for path in CATEGORY_FILES:
        content = path.read_text(encoding="utf-8")
        cards = len(re.findall(r'class="course-card"', content))
        total_cards += cards
        slug = path.stem.removeprefix("szkolenia-ai-")
        actual_counts[slug] = cards

        blocks = re.findall(
            r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
            content,
            re.DOTALL,
        )
        if not blocks:
            fail(errors, f"{path.name}: brak JSON-LD")
            continue
        try:
            schema = json.loads(blocks[0])
            item_list = schema.get("mainEntity", schema)
            items = item_list.get("itemListElement", [])
            declared = item_list.get("numberOfItems")
            if declared != len(items):
                fail(errors, f"{path.name}: numberOfItems={declared}, wpisów={len(items)}")
            positions = [item.get("position") for item in items]
            if positions != list(range(1, len(items) + 1)):
                fail(errors, f"{path.name}: nieciągłe pozycje JSON-LD")
        except (json.JSONDecodeError, AttributeError) as exc:
            fail(errors, f"{path.name}: niepoprawny JSON-LD: {exc}")

        external_cards = re.findall(
            r'<a\s+href="https?://[^"]+"\s+class="course-card"([^>]*)>', content
        )
        for attrs in external_cards:
            if 'target="_blank"' not in attrs or 'rel="noopener noreferrer"' not in attrs:
                fail(errors, f"{path.name}: zewnętrzna karta bez bezpiecznych atrybutów")

    if isinstance(counts, dict):
        for slug, actual in sorted(actual_counts.items()):
            declared = counts.get(slug)
            if declared != actual:
                fail(errors, f"data/category-counts.json: {slug}={declared}, kart={actual}")

    if isinstance(courses, list) and len(courses) != total_cards:
        warnings.append(f"data/courses.json: wpisów={len(courses)}, kart HTML={total_cards}")

    if errors:
        print("WALIDACJA: BŁĄD")
        for error in errors:
            print(f"- {error}")
        return 1

    for warning in warnings:
        print(f"OSTRZEŻENIE: {warning}")

    print(f"WALIDACJA: OK ({total_cards} szkoleń, {len(CATEGORY_FILES)} kategorii)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
