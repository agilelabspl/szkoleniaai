# aiprzewodnik.pl — Katalog Szkoleń AI

## Co to jest
Statyczna strona HTML (GitHub Pages) — największy katalog szkoleń AI w Polsce.
Repo: `agilelabspl/szkoleniaai` · Domena: `aiprzewodnik.pl`

## Pliki strony (wszystkie serwowane przez GitHub Pages)

| Plik | Co to | Kiedy aktualizować |
|------|-------|--------------------|
| `index.html` | Główna strona — katalog szkoleń (karty + schema.org JSON-LD) | Dodanie/edycja szkolenia, zmiana layoutu |
| `zbudowane-z-ai.html` | Podstrona "Zbudowane z AI w Polsce" — polskie produkty AI (karty + schema.org) | Dodanie/edycja produktu |
| `wydarzenia-ai.html` | Mapa wydarzeń AI w Polsce — konferencje, meetupy, śniadania (Leaflet + JSON) | Dodanie/edycja wydarzenia |
| `quiz.html` | Quiz "Jaki kurs AI jest dla Ciebie?" | Zmiana pytań/wyników quizu |
| `slownik.html` | Strona zbiorcza słownika AI | Dodanie nowego hasła |
| `slownik/*.html` | 14 podstron haseł (llm, prompt, rag, token...) | Edycja/dodanie hasła |
| `sitemap.xml` | Mapa strony dla Google | Dodanie nowej podstrony (np. nowe hasło słownika) |
| `robots.txt` | Instrukcje dla crawlerów | Raczej nigdy |
| `CNAME` | Domena `aiprzewodnik.pl` | Nigdy |
| `og-image.png` | Obrazek OG (social share) | Zmiana brandingu |
| `aiprzewodnik-pdf.png` | Grafika PDF | Zmiana brandingu |
| `README.md` | Opis repo na GitHubie | **NIGDY nie pushuj** |
| `biznesy/` | Dokumenty wewnętrzne (analizy, monetyzacja, kontakty) | Nie są częścią strony |

## Struktura techniczna index.html
- **Karty szkoleń** — klasa `.course-card` w sekcjach `.category-section`
- **Schema.org JSON-LD** — blok `<script type="application/ld+json">` w `<head>`, pole `numberOfItems` + tablica `itemListElement`
- **Licznik:** aktualnie **138 szkoleń** (numberOfItems w schema.org)

## Sitemap — kiedy aktualizować
- Nowa podstrona (np. nowe hasło słownika) → dodaj `<url>` do `sitemap.xml`
- Zmiana istniejącej podstrony → zaktualizuj `<lastmod>` na dzisiejszą datę
- Dodanie szkolenia do `index.html` → zaktualizuj `<lastmod>` dla `/` na dzisiejszą datę
- Format daty: `YYYY-MM-DD`

## Kategorie (sekcje w HTML)
`#ogolne` · `#biznes` · `#produkty` · `#grafika` · `#wideo` · `#hr` · `#finanse` · `#marketing` · `#programisci` · `#automatyzacja` · `#prawo` · `#studia-podyplomowe`

## Jak dodać szkolenie (3 kroki)

### 1. Karta HTML — wstawić w odpowiednią sekcję kategorii
```html
                    <a href="[URL]" class="course-card" target="_blank" rel="noopener noreferrer">
                        <h3>[TYTUŁ]</h3>
                        <span class="card-author">[AUTOR] · [ORGANIZACJA]</span>
                        <p>[OPIS — 1-2 zdania, narzędzia]</p>
                        <div class="card-meta">
                            <span class="tag tag-price">[CENA] zł</span>
                            <span class="tag tag-format">[FORMAT: Online/Nagranie/Stacjonarnie/Online · live]</span>
                            <span class="tag tag-duration">[CZAS np. 2 dni / 6h · 30 lekcji]</span>
                            <span class="tag tag-cert">Certyfikat</span>  <!-- tylko jeśli jest -->
                        </div>
                        <div class="card-footer">Odwiedź <span>→</span></div>
                    </a>
```
Tagi w `card-meta` są opcjonalne — dodawaj tylko te, dla których masz dane.

### 2. Schema.org — dodać wpis na końcu tablicy `itemListElement`
```json
{"@type":"ListItem","position":[NUMER],"item":{"@type":"Course","name":"[TYTUŁ]","description":"[OPIS]","provider":{"@type":"Organization","name":"[ORGANIZACJA]"},"offers":{"@type":"Offer","price":"[CENA]","priceCurrency":"PLN"}}}
```
- `offers` — tylko gdy jest cena. Darmowe: dodaj `"isAccessibleForFree":true` zamiast `offers`.
- Pamiętaj o przecinku po poprzednim wpisie!

### 3. Zaktualizować `numberOfItems` w schema.org (linia z `"numberOfItems":`)

## Git
- Branch: `main`
- Remote: `origin` → `https://github.com/agilelabspl/szkoleniaai.git`
- **NIGDY nie pushuj README.md**
- Commity po polsku, wzór: `Dodanie szkolenia [NAZWA] ([ORGANIZACJA]) do katalogu`

## Struktura techniczna zbudowane-z-ai.html
- **Karty produktów** — klasa `.product-card` w siatce `.products-list` (2 kolumny)
- **Tagi domenowe** — `.tag-sport`, `.tag-edukacja`, `.tag-ecommerce`, `.tag-dzieci`, `.tag-produktywnosc`, `.tag-kariera`, `.tag-hr`, `.tag-finanse`, `.tag-it`, `.tag-free`
- **CTA card** — klasa `.cta-card` (ostatni element siatki, link do LinkedIn)
- **Schema.org JSON-LD** — `ItemList` z `numberOfItems` + tablica `itemListElement`
- **Licznik:** aktualnie **10 produktów** (numberOfItems w schema.org + badge w hero)
- **GA events:** `product_click` (event_label = nazwa), `cta_click` (event_label = zglos_produkt)
- **Linkowanie z index.html:** przycisk w nav (event: `nav_click`) + baner mid-page (event: `banner_click`)

### Jak dodać produkt (3 kroki)

#### 1. Karta HTML — wstawić przed CTA card
```html
            <a href="[URL]" class="product-card" target="_blank" rel="noopener noreferrer" onclick="gtag('event','product_click',{event_label:'[NAZWA]'})">
                <h2>[NAZWA]</h2>
                <div class="product-creator">[AUTOR]</div>
                <p class="product-desc">[OPIS z <strong>boldem</strong> na kluczowym fragmencie]</p>
                <span class="product-tag tag-[KATEGORIA]">[Kategoria]</span>
                <div class="card-footer">Sprawdź <span>&rarr;</span></div>
            </a>
```

#### 2. Schema.org — dodać wpis na końcu tablicy `itemListElement`
```json
{ "@type": "ListItem", "position": [NUMER], "item": { "@type": "WebApplication", "name": "[NAZWA]", "description": "[OPIS]", "url": "[URL]", "author": { "@type": "Person", "name": "[AUTOR]" } } }
```

#### 3. Zaktualizować `numberOfItems` w schema.org + badge "X produktów" w hero + animation-delay dla nowego nth-child

## Struktura techniczna wydarzenia-ai.html
- **Mapa** — Leaflet.js (OpenStreetMap), piny na 10 miastach, popupy z listą eventów
- **Dane wydarzeń** — tablica JS `events` w `<script>` (nie JSON zewnętrzny)
- **Karty wydarzeń** — renderowane dynamicznie z tablicy `events` przez `renderEvents()`
- **Filtry** — typ wydarzenia (konferencja/meetup/śniadanie), filtruje karty + popupy mapy
- **Schema.org JSON-LD** — `ItemList` z konferencjami (mają daty) + `WebPage`
- **GA events:** `event_click`, `map_pin_click`, `filter_use`, `cta_click`, `nav_click`
- **Licznik:** dynamiczny, aktualizowany przez `renderEvents()`

### Jak dodać wydarzenie (2 kroki)

#### 1. Dodać obiekt do tablicy `events`
```js
{ name: '[NAZWA]', city: '[MIASTO]', date: '[DATA lub CZĘSTOTLIWOŚĆ]', type: '[konferencja|meetup|sniadanie]', free: [true|false], url: '[URL]', desc: '[OPIS]' }
```

#### 2. Jeśli konferencja z datą — dodać wpis do Schema.org `itemListElement` i zaktualizować `numberOfItems`

## Dodatkowe pliki
- `slownik.html` + `slownik/*.html` — słownik pojęć AI (14 podstron)
- `quiz.html` — quiz AI
- `robots.txt`, `CNAME`, `og-image.png` — konfiguracja
- `biznesy/` — analizy biznesowe i monetyzacja (dokumenty wewnętrzne)
