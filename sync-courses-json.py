#!/usr/bin/env python3
"""Synchronizuje data/courses.json z kartami na stronach kategorii."""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data/courses.json"


def text(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def first(pattern, body):
    match = re.search(pattern, body, re.DOTALL)
    return text(match.group(1)) if match else ""


def main():
    existing = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    cards_by_key = {}
    card_order = []
    seen = set()
    for path in sorted(ROOT.glob("szkolenia-ai-*.html")):
        category = path.stem.removeprefix("szkolenia-ai-")
        content = path.read_text(encoding="utf-8")
        cards = re.findall(
            r'<a href="([^"]+)" class="course-card"[^>]*>(.*?)</a>', content, re.DOTALL
        )
        for url, body in cards:
            name = first(r"<h3>(.*?)</h3>", body)
            if not name:
                continue
            key = (name.lower(), url.rstrip("/").lower())
            if key in seen:
                continue
            seen.add(key)
            item = {"name": name, "cat": category}
            description = first(r"<p>(.*?)</p>", body)
            if description:
                item["desc"] = description
            item["url"] = url
            price = first(r'class="tag tag-price">(.*?)</span>', body)
            item["price"] = price
            format_value = first(r'class="tag tag-format">(.*?)</span>', body)
            if format_value:
                item["format"] = format_value
            cards_by_key[key] = item
            card_order.append(key)

    synchronized = []
    synchronized_keys = set()
    for item in existing:
        key = (
            item.get("name", "").strip().lower(),
            item.get("url", "").rstrip("/").lower(),
        )
        if key not in cards_by_key or key in synchronized_keys:
            continue
        preserved = dict(item)
        preserved["cat"] = cards_by_key[key]["cat"]
        synchronized.append(preserved)
        synchronized_keys.add(key)

    for key in card_order:
        if key not in synchronized_keys:
            synchronized.append(cards_by_key[key])
            synchronized_keys.add(key)

    DATA_PATH.write_text(
        json.dumps(synchronized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"data/courses.json: {len(existing)} -> {len(synchronized)} rekordów")


if __name__ == "__main__":
    main()
