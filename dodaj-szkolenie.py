#!/usr/bin/env python3
"""
Skrypt do dodawania szkoleń do aiprzewodnik.pl

Użycie:
  python3 dodaj-szkolenie.py \
    --nazwa "I Love AI" \
    --autor "Sprawny Marketing" \
    --url "https://sprawnymarketing.pl/konferencja/warszawa/" \
    --kategoria marketing \
    --opis "Ścieżka konferencyjna poświęcona sztucznej inteligencji." \
    --cena "od 997 zł" \
    --format "Stacjonarnie · Warszawa" \
    --czas "21 kwietnia 2026"

  Flagi opcjonalne: --cena, --format, --czas, --certyfikat, --darmowe
  Wymagane: --nazwa, --url, --kategoria

Kategorie: biznes, produkty, marketing, programisci, automatyzacja,
           ogolne, grafika, hr, finanse, prawo, wideo, studia-podyplomowe
"""

import argparse
import json
import os
import re
import sys
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(SCRIPT_DIR, "index.html")
SITEMAP_PATH = os.path.join(SCRIPT_DIR, "sitemap.xml")

KATEGORIE = [
    "biznes", "produkty", "marketing", "programisci", "automatyzacja",
    "ogolne", "grafika", "hr", "finanse", "prawo", "wideo", "studia-podyplomowe"
]

MIESIACE = {
    1: "stycznia", 2: "lutego", 3: "marca", 4: "kwietnia",
    5: "maja", 6: "czerwca", 7: "lipca", 8: "sierpnia",
    9: "września", 10: "października", 11: "listopada", 12: "grudnia"
}


def polska_data(d):
    return f"{d.day} {MIESIACE[d.month]} {d.year}"


def zbuduj_karte(args):
    """Buduje HTML karty szkolenia."""
    lines = []
    lines.append(f'                    <a href="{args.url}" class="course-card" target="_blank" rel="noopener noreferrer">')

    if args.darmowe:
        lines.append('                        <span class="badge-free">Darmowe</span>')

    lines.append(f'                        <h3>{args.nazwa}</h3>')

    if args.autor:
        lines.append(f'                        <span class="card-author">{args.autor}</span>')

    if args.opis:
        lines.append(f'                        <p>{args.opis}</p>')

    # card-meta - tylko tagi z danymi
    meta_tags = []
    if args.cena and not args.darmowe:
        meta_tags.append(f'                            <span class="tag tag-price">{args.cena}</span>')
    if args.format:
        meta_tags.append(f'                            <span class="tag tag-format">{args.format}</span>')
    if args.czas:
        meta_tags.append(f'                            <span class="tag tag-duration">{args.czas}</span>')
    if args.certyfikat:
        meta_tags.append(f'                            <span class="tag tag-cert">Certyfikat</span>')

    if meta_tags:
        lines.append('                        <div class="card-meta">')
        lines.extend(meta_tags)
        lines.append('                        </div>')

    lines.append('                        <div class="card-footer">Odwiedź <span>→</span></div>')
    lines.append('                    </a>')

    return "\n".join(lines)


def zbuduj_schema(args, position):
    """Buduje wpis schema.org."""
    entry = {
        "@type": "ListItem",
        "position": position,
        "item": {
            "@type": "Course",
            "name": args.nazwa,
            "description": args.opis or args.nazwa,
            "provider": {
                "@type": "Organization",
                "name": args.autor.split(" · ")[-1] if args.autor and " · " in args.autor else (args.autor or "")
            },
            "url": args.url
        }
    }

    if args.darmowe:
        entry["item"]["isAccessibleForFree"] = True
    elif args.cena:
        # Wyciągnij liczbę z ceny
        cena_num = re.sub(r'[^\d]', '', args.cena.split()[0] if args.cena.startswith("od ") else args.cena)
        if cena_num:
            entry["item"]["offers"] = {
                "@type": "Offer",
                "price": cena_num,
                "priceCurrency": "PLN"
            }

    return json.dumps(entry, ensure_ascii=False)


def dodaj_szkolenie(args):
    """Główna funkcja - dodaje szkolenie do index.html i aktualizuje sitemap."""

    # --- Czytaj index.html ---
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # --- Znajdź sekcję kategorii ---
    section_pattern = f'id="{args.kategoria}"'
    section_pos = content.find(section_pattern)
    if section_pos == -1:
        print(f"BŁĄD: Nie znaleziono sekcji #{args.kategoria} w index.html")
        sys.exit(1)

    # Znajdź koniec courses-grid w tej sekcji (</div> przed </section>)
    # Szukamy od pozycji sekcji
    section_end = content.find("</section>", section_pos)
    if section_end == -1:
        print("BŁĄD: Nie znaleziono </section> po sekcji kategorii")
        sys.exit(1)

    # Znajdź ostatnie </div> przed </section> (to zamknięcie courses-grid)
    grid_close = content.rfind("</div>", section_pos, section_end)
    if grid_close == -1:
        print("BŁĄD: Nie znaleziono </div> (courses-grid) w sekcji")
        sys.exit(1)

    # Wstaw kartę przed </div> zamykającym grid
    karta = zbuduj_karte(args)
    content = content[:grid_close] + karta + "\n" + content[grid_close:]

    # --- Schema.org: znajdź numberOfItems i zaktualizuj ---
    match = re.search(r'"numberOfItems":\s*(\d+)', content)
    if not match:
        print("BŁĄD: Nie znaleziono numberOfItems w schema.org")
        sys.exit(1)

    old_count = int(match.group(1))
    new_count = old_count + 1
    content = content.replace(match.group(0), f'"numberOfItems": {new_count}')

    # --- Schema.org: dodaj wpis na końcu itemListElement ---
    schema_entry = zbuduj_schema(args, new_count)

    # Szukamy końca tablicy: ...}}]} (ostatni wpis + zamknięcie tablicy + zamknięcie obiektu)
    array_end = content.find("}]}\n")
    if array_end == -1:
        array_end = content.find("}]}")
    if array_end == -1:
        print("BŁĄD: Nie znaleziono końca tablicy itemListElement")
        sys.exit(1)

    # Wstaw nowy wpis po ostatnim }} a przed ]}
    insert_pos = array_end + 1  # po ostatnim }
    content = content[:insert_pos] + "," + schema_entry + content[insert_pos:]

    # --- Aktualizuj datę "Ostatnia aktualizacja" ---
    dzis = polska_data(date.today())
    content = re.sub(
        r'Ostatnia aktualizacja: [^<]+',
        f'Ostatnia aktualizacja: {dzis}',
        content
    )

    # --- Zapisz index.html ---
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    # --- Aktualizuj sitemap.xml ---
    dzis_iso = date.today().isoformat()
    with open(SITEMAP_PATH, "r", encoding="utf-8") as f:
        sitemap = f.read()

    # Zmień lastmod dla głównej strony (pierwsza data po aiprzewodnik.pl/)
    sitemap = re.sub(
        r'(<loc>https://aiprzewodnik\.pl/</loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}(</lastmod>)',
        rf'\g<1>{dzis_iso}\2',
        sitemap
    )

    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write(sitemap)

    # --- Podsumowanie ---
    print(f"Dodano szkolenie: {args.nazwa}")
    print(f"  Kategoria: #{args.kategoria}")
    print(f"  Autor: {args.autor or '(brak)'}")
    print(f"  Cena: {'Darmowe' if args.darmowe else (args.cena or '(brak)')}")
    print(f"  Schema position: {new_count}")
    print(f"  numberOfItems: {old_count} → {new_count}")
    print(f"  Ostatnia aktualizacja: {dzis}")
    print(f"  sitemap.xml lastmod: {dzis_iso}")


def main():
    parser = argparse.ArgumentParser(
        description="Dodaj szkolenie do aiprzewodnik.pl",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Kategorie: {', '.join(KATEGORIE)}"
    )
    parser.add_argument("--nazwa", required=True, help="Nazwa szkolenia")
    parser.add_argument("--url", required=True, help="URL strony szkolenia")
    parser.add_argument("--kategoria", required=True, choices=KATEGORIE, help="Kategoria sekcji")
    parser.add_argument("--autor", default="", help="Autor / organizacja")
    parser.add_argument("--opis", default="", help="Opis (1-2 zdania)")
    parser.add_argument("--cena", default="", help="Cena (np. '997 zł', 'od 1200 zł netto')")
    parser.add_argument("--format", default="", help="Format (np. 'Online', 'Stacjonarnie · Warszawa')")
    parser.add_argument("--czas", default="", help="Czas trwania (np. '2 dni', '21 kwietnia 2026')")
    parser.add_argument("--certyfikat", action="store_true", help="Czy jest certyfikat")
    parser.add_argument("--darmowe", action="store_true", help="Szkolenie darmowe")

    args = parser.parse_args()
    dodaj_szkolenie(args)


if __name__ == "__main__":
    main()
