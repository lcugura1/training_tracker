# Evidencija (Attendance) — mobilni web spec

Cilj: mobilni web ekran (React/Next ili sl.) koji vizualno 1:1 odgovara `templates/attendance/AttendanceScreen.dc.html`. Referentni viewport 390×844. Tamna tema. Sve boje isključivo iz tokena ispod; jedina iznimka su boje oznaka treninga (TAG_COLORS), koje su podatkovne vrijednosti.

## 1. Tokeni

```css
:root{
  --color-background:#000000;
  --color-surface:#0E0E10;
  --color-surface-border:#1F1F22;
  --color-text-primary:#FFFFFF;
  --color-text-secondary:#8E8E93;
  --color-text-on-light:#000000;
  --color-card-gradient-from:#1A1B1E;
  --color-card-gradient-to:#0C0C0E;
  --color-card-border:#26272B;
  --color-card-light-gradient-from:#FFFFFF;
  --color-card-light-gradient-to:#DEDEE3;
  --color-accent:#C5F23D;
  --color-danger:#FF3B30;
}
```

TAG_COLORS (podaci, ne UI tokeni):
| Oznaka | Boja |
|---|---|
| Push | `var(--color-accent)` #C5F23D |
| Pull | #4DA3FF |
| Legs | #FF9F45 |
| Upper | #FF6B8A |
| Lower | #B57BFF |
| Kardio | #3DDC97 |

Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', Roboto, system-ui, sans-serif`. Bez web fontova.

Površine (koristi se ponovno):
- **Tamna kartica**: `background: linear-gradient(135deg, var(--color-card-gradient-from), var(--color-card-gradient-to)); border:1px solid var(--color-card-border); border-radius:24px;`
- **Svijetla kartica**: `background: linear-gradient(135deg, var(--color-card-light-gradient-from), var(--color-card-light-gradient-to)); color: var(--color-text-on-light); border-radius:24px;` bez bordera.
- **Surface kartica**: `background: var(--color-surface); border:1px solid var(--color-surface-border); border-radius:24px;`

## 2. Layout stranice

- `body` pozadina `--color-background`, cijela visina (`min-height:100dvh`).
- Scroll kontejner: padding `67px 16px 24px` (gornjih 67px = status bar / safe area; na webu koristi `calc(env(safe-area-inset-top) + 20px)` s minimumom ~20px ako nema notcha, ili zadrži 67px ako je app shell bez headera). Donji padding + visina tab bara ako postoji.
- Sadržaj: jedan stupac, vertikalni `gap:24px`, širina = viewport − 32px. Max širina sadržaja 480px, centrirano, za veće ekrane.
- Skriveni scrollbar (`scrollbar-width:none`, `::-webkit-scrollbar{display:none}`).

Redoslijed blokova:
1. Naslov
2. (stanje učitavanja / greške)
3. Red statistike (2 kartice)
4. Kalendar (svijetla kartica)
5. Najčešći treninzi (surface kartica s donut grafom)

## 3. Naslov

- Tekst „Evidencija", centriran.
- 30px, weight 800, letter-spacing 0.5px, `--color-text-primary`.

## 4. Stanja

- **loading**: ispod naslova tekst „Učitavanje…", 13px, `--color-text-secondary`, centrirano.
- **error**: „Nije moguće učitati treninge.", 13px, `--color-danger`, centrirano.
- Ostali blokovi ostaju u layoutu (prazni/0 vrijednosti); nema skeletona.

## 5. Red statistike

Flex red, `gap:12px`, dvije kartice jednake širine (`flex:1; min-width:0`), obje **tamna kartica**, padding 18px.

### 5a. „Ovaj mjesec" (lijevo) — progress prsten
- Kartica: flex stupac, centrirano, `gap:12px`. Klikabilna (`cursor:pointer`, `:active { opacity:.9 }`) — otvara detalj članarine/limita.
- Prsten 120×120 SVG, rotiran −90° (počinje na vrhu):
  - r=55, stroke-width 10, bez filla.
  - Pozadinski krug: stroke `--color-card-border`.
  - Progres krug: stroke `--color-accent`, `stroke-linecap:round`, `stroke-dasharray = 2πr ≈ 345.58`, `stroke-dashoffset = 345.58 × (1 − done/limit)`.
  - Ako je `done ≥ limit`, dashoffset 0. Ako nema limita (neograničena članarina), prikaži samo broj bez `/limit` i puni prsten.
- U sredini prstena (baseline poravnanje): broj `done` 42px/800, letter-spacing −1px, `--color-text-primary`; zatim `/limit` 22px/700, letter-spacing −0.5px, `--color-text-secondary`.
- Labela ispod: „Ovaj mjesec", 15px, `--color-text-secondary`.

### 5b. „Ukupno" (desno) — broj + trend
- Kartica: flex stupac, `overflow:hidden`.
- Broj ukupnih treninga: 52px/800, letter-spacing −1.5px, line-height 1.15, `--color-text-primary`.
- Labela „Ukupno" 15px `--color-text-secondary`, razmak 2px od broja.
- Sparkline zauzima ostatak visine (`flex:1; min-height:52px`), poravnat na dno, **bleeds do rubova kartice** (negativne margine −18px lijevo/desno/dolje), visina 52px, širina = puna širina kartice.
  - Podaci: kumulativni broj treninga po tjednu (zadnjih 7 točaka).
  - Linija: stroke `--color-accent`, 2px, round join/cap.
  - Površina ispod: linear gradient odozgo prema dolje, accent opacity 0.28 → 0.
  - Točka na zadnjoj vrijednosti: krug r=3, fill accent, uvučen 4px od desnog ruba.
  - Y skala: vrh 6px od gornjeg ruba, dno 6px iznad donjeg ruba (raspon 6–46).
  - Koristi `viewBox` + `preserveAspectRatio="none"` za liniju/površinu da se širi s karticom; točku crtaj zasebno (ili s `vector-effect`) da ne bude razvučena.

## 6. Kalendar

**Svijetla kartica**, padding 20px, flex stupac `gap:16px`. Sav tekst `--color-text-on-light`.

### Header
- Red: lijeva strelica — naziv mjeseca — desna strelica, `space-between`, centrirano vertikalno.
- Strelice: chevron ikona 22×22 (stroke 2, round), `currentColor`, padding 4px (dodaj nevidljivi hit area do 44×44). Klik mijenja mjesec.
- Naziv: „STUDENI 2026" — hrvatski naziv mjeseca, uppercase, 18px/700, letter-spacing 0.5px, centriran, `flex:1`.

### Dani u tjednu
- Grid 7 stupaca: Pon Uto Sri Čet Pet Sub Ned (tjedan počinje ponedjeljkom). 12px/600, centrirano.

### Mreža dana
- Grid 7 jednakih stupaca, `row-gap:8px`, ćelije centrirane u stupcu. Razmak između zaglavlja i mreže 16px.
- Prazne ćelije prije 1. u mjesecu (offset po ponedjeljku), visina 38px.
- Ćelija dana: 38×38, flex centrirano, 15px, weight 400.
- **Dan s treningom**: `border-radius:12px`, pozadina = boja oznake treninga tog dana, broj weight 700, crni tekst, klikabilno (otvara detalj treninga/dolaska). Ako je više treninga u danu, koristi prvi (ili dominantni).
- **Danas** (bez treninga): border 2px solid `--color-text-on-light`, radius 12px, weight 700, bez pozadine. Ako danas ima trening, prikaži ispunu oznake + isti 2px border.
- Obični dani: bez pozadine.
- Budući dani: isti stil kao obični (bez prigušivanja).

### Legenda
- Flex wrap, `gap:14px`, `margin-top:4px` (ukupno 20px od mreže), 13px.
- Stavka: kvadrat 14×14 radius 4px u boji oznake + naziv, `gap:6px`.
- Redoslijed: Push, Pull, Legs, Upper, Lower, Kardio, Danas (Danas = kvadrat s 2px crnim borderom, bez ispune).

## 7. Najčešći treninzi

**Surface kartica**, padding 20px, flex stupac `gap:18px`.

### Naslov sekcije
- „NAJČEŠĆI TRENINZI", 13px/600, letter-spacing 0.5px, uppercase, `--color-text-secondary`.

### Donut graf
- Centriran, 240×240, `overflow:visible`.
- Geometrija: centar (120,120), unutarnji radijus 76, vanjski 104. Odabrani segment „iskače": vanjski radijus 114 (+10).
- Razmak između segmenata 2.5° (po 1.25° oduzeto s obje strane svakog luka).
- Kut počinje na vrhu (−90°), smjer kazaljke na satu, segmenti poredani po broju treninga silazno.
- Ispuna = boja oznake. Odabrani segment opacity 1, ostali 0.4.
- Segment je oblik prstena (vanjski luk → linija → unutarnji luk unatrag → zatvoreno); `large-arc` flag kad je luk > 180°.
- Ako postoji samo jedna oznaka, nacrtaj puni prsten (dva luka od 180°).
- Klik na segment ga odabire. Default odabran = najčešći.
- Centar (apsolutno, `pointer-events:none`), flex stupac centriran:
  - Naziv oznake 15px/600 u boji oznake.
  - Postotak 40px/800 `--color-text-primary` (zaokruženo na cijeli broj).
  - „N treninga" 13px `--color-text-secondary` (hrvatska množina: 1 trening, 2–4 treninga, 5+ treninga; 11–14 → treninga).
- Animacija promjene odabira: segment pomak radijusa i opacity, 200ms ease-out. Poštuj `prefers-reduced-motion`.

### Chipovi
- Flex wrap, `gap:8px`, isti redoslijed kao segmenti.
- Chip: pill (`border-radius:999px`), padding 8px 12px, flex `gap:7px`, centrirano.
  - Točka 9×9 radius 5px, boja oznake.
  - Naziv 14px, `--color-text-primary`, weight 500 (odabran: 700).
  - Postotak 13px `--color-text-secondary`.
- Neodabran: border 1px `--color-surface-border`, bez pozadine.
- Odabran: border 1px u boji oznake, pozadina `color-mix(in srgb, <boja> 12%, transparent)`.
- Klik na chip = isto kao klik na segment. Min. visina dodira 36px (chip je ~34px; dodaj 1px vertikalnog paddinga ili hit-area pseudo-element do 44px).

### Prazno stanje
- Ako nema treninga: umjesto donuta jedan puni sivi prsten (`--color-surface-border`), centar „0" i „Nema treninga"; chipovi se ne prikazuju.

## 8. Podaci

```ts
type Tag = 'Push'|'Pull'|'Legs'|'Upper'|'Lower'|'Kardio';
type Workout = { date: string /* YYYY-MM-DD */; tag: Tag };
type Props = {
  status: 'ready'|'loading'|'error';
  monthDone: number;       // treninzi ovaj mjesec
  monthLimit: number|null; // null = neograničeno
  total: number;
  weeklyCumulative: number[]; // 7 točaka za sparkline
  workouts: Workout[];        // za kalendar i donut
};
```
- Donut i chipovi računaju se iz svih `workouts` (ne samo iz trenutnog mjeseca), osim ako produkt odluči drugačije.
- Kalendar prikazuje samo `workouts` odabranog mjeseca.

## 9. Pristupačnost

- Naslov `<h1>`. Sekcije `<section aria-label>`.
- Progress prsten: `role="progressbar" aria-valuenow aria-valuemax aria-label="Treninzi ovaj mjesec"`.
- Strelice kalendara: `<button aria-label="Prethodni mjesec" / "Sljedeći mjesec">`.
- Dani s treningom: `<button aria-label="2. studenoga, Push">`; danas `aria-current="date"`.
- Chipovi: `<button aria-pressed>`; donut segmenti dekorativni (`aria-hidden`), interakcija preko chipova.
- Fokus prsten: 2px `--color-accent` outline, offset 2px (na svijetloj kartici 2px `--color-text-on-light`).

## 10. Što NE dodavati

- Nema novih boja, sjena, ikona ni dodatnih sekcija.
- Nema hover efekata na mobilnom osim `:active` opacity 0.9 na klikabilnim elementima.
