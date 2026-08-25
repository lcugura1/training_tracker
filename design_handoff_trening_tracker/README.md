# Handoff: Trening Tracker — liquid glass redesign

## Overview
Vizualni redizajn mobilne web aplikacije za evidenciju treninga (Vite + React + TS, Netlify Blobs backend). Zadatak redizajna: ukloniti generički ljubičasto-rozi gradijent iz trenutne verzije i zamijeniti ga crnom podlogom, jednom zelenom akcentnom bojom i pravim "liquid glass" slojevima s mekanim, sporim kretanjem svjetla iza stakla. Sve forme su oble ("bobbly"): krugovi, pilule, veliki radijusi.

## About the Design Files
`mockup.html` u ovom paketu je **dizajnerska referenca napravljena u HTML-u** — prototip koji pokazuje željeni izgled i ponašanje, a ne produkcijski kod za copy-paste. Zadatak je **rekreirati ove zaslone u postojećem okruženju projekta** (React 19 + TypeScript, CSS moduli / obični CSS kako je već postavljeno u `src/styles/app.css`), koristeći već uspostavljene komponente i patterne. HTML se ne ugrađuje kao takav.

Datoteka je samostalna (otvori je u pregledniku, jedina vanjska ovisnost je Google Fonts / Inter).

## Fidelity
**High-fidelity.** Boje, tipografija, radijusi, sjene i animacije su konačni. Rekreiraj ih pikselski točno. Sadržaj (imena, brojevi, datumi, poruke) je primjer — dolazi iz stvarnog stanja aplikacije.

## Screens / Views

### 1 — Danas (nakon 20:00)
**Namjena:** glavni zaslon; korisnik vidi svoj niz, statistiku mjeseca, kalendar i (nakon 20:00, ako dan nije označen) poruku srama.

Layout — jedan stupac, `flex-direction: column`, `gap: 16px`, padding `56px 20px 20px` (gornjih 56px je top bar / safe area).

1. **Header** — `flex`, `space-between`, `align-items:center`.
   - Pozdrav: 22px / 800 / tracking -0.02em / `#FFFFFF`. Tekst rotira po dijelu dana ("Dobro jutro", "Dobar dan", "Dobra večer") + ime.
   - Datum: 13px / 400 / `#9CA3AF`, format "Utorak, 25. kolovoza".
   - "Odjava": glass pilula, visina 36px, padding 0 14px, radius 999px, 13px / 600 / `#9CA3AF`.
2. **Statistika (jedna kartica, ne dvije)** — `grid-template-columns: 1fr 1px 1fr`, radius 34px, padding 22px 8px, glass (recept niže), `overflow:hidden`.
   - Vrijednosti: 38px / 800 / line-height 1 / tracking -0.02em / `font-variant-numeric: tabular-nums`. Niz je zelen `#22C55E`, mjesečni broj bijel.
   - Labele: 11px / 600 / uppercase / letter-spacing 0.08em / `#6B7280` ("DANA U NIZU", "KOLOVOZ").
   - Razdjelnik: 1×44px `rgba(255,255,255,0.10)`.
   - Preko kartice ide dijagonalni odsjaj: element 40% širine, `linear-gradient(100deg, transparent, rgba(255,255,255,0.10), transparent)`, animacija `sheen` 7s ease-in-out infinite (`translateX(-120%) → 220%`), `pointer-events:none`.
3. **Poruka srama (samo nakon 20:00 i ako dan nije označen)** — radius 22px, padding 14px 16px, pozadina `rgba(245,180,0,0.10)`, blur 20px saturate 180%, `inset 0 1px 0 rgba(255,255,255,0.14)` + `inset 0 0 0 .5px rgba(245,180,0,0.30)`. Točka 8px `#F5B400` s `0 0 12px rgba(245,180,0,.8)` glow. Tekst 14px / 500 / line-height 1.45 / `#F5D680`.
4. **Kalendar** — glass kartica, radius 32px, padding 20px 16px 22px, `gap:14px`.
   - Header: chevron krugovi 32×32 `rgba(255,255,255,0.06)`, naslov 17px / 700 ("Kolovoz") + godina 500 / `#6B7280`.
   - Weekday red: `grid-template-columns: repeat(7,1fr)`, `gap:6px`, 10px / 600 / letter-spacing 0.06em / `#4B5563`, PON…NED.
   - Dani: ista mreža, ćelije `aspect-ratio:1`, `border-radius:999px`, centrirano.
     - Označen dan: `rgba(34,197,94,0.16)` + `inset 0 0 0 1px rgba(34,197,94,0.45)`, emoji tipa treninga 16px.
     - Neoznačen prošli dan: `rgba(255,255,255,0.03)`, broj 14px `#6B7280`.
     - Danas (neoznačen): broj 14px `#9CA3AF` (aktivan, ali bez zelene dok se ne označi).
     - Budući dan: bez pozadine, broj 13px `#374151`.
5. **CTA "Označi današnji trening"** — visina 56px, radius 999px, fill `#22C55E`, tekst 16px / 600 / `#062911`, `inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 24px rgba(34,197,94,0.30)`. Animacija `pulse` 2.6s (scale 1 → 1.04, opacity .9 → 1) dok dan nije označen; nakon označavanja pulsiranje se gasi i CTA prelazi u mirno stanje.

### 2 — Odabir treninga (bottom sheet)
**Namjena:** korisnik bira tip treninga za današnji dan i sprema.

- Pozadina: glavni zaslon ostaje vidljiv, `filter: blur(7px)` + `opacity: .45`, preko njega scrim `rgba(0,0,0,0.45)` (bez blura — scrim je flat).
- Sheet: prilijepljen na dno, `border-radius: 34px 34px 0 0`, padding 14px 20px 28px, `gap:18px`, pozadina `rgba(255,255,255,0.07)`, `backdrop-filter: blur(34px) saturate(185%) url(#liquid-refraction)`, `inset 0 1px 0 rgba(255,255,255,0.24)`, `inset 0 0 0 .5px rgba(255,255,255,0.07)`, `0 -20px 60px rgba(0,0,0,.6)`.
- Handle: 44×5px, radius 999px, `rgba(255,255,255,0.22)`, centriran.
- Naslov "Što si danas radio?" 24px / 800 / tracking -0.02em; podnaslov datum 13px `#9CA3AF`.
- Opcije: `grid-template-columns: 1fr 1fr`, `gap:10px`, zadnja opcija (Full body) zauzima jednu ćeliju i red ostaje nepopunjen.
  - Pilula: visina 58px, radius 999px, padding 0 16px, `gap:12px`, emoji 20px + label 16px/600, glass `rgba(255,255,255,0.05)` blur 16px saturate 170%.
  - Odabrana: `rgba(34,197,94,0.16)`, `inset 0 0 0 1.5px #22C55E`, `0 8px 22px rgba(34,197,94,0.22)`, label 700 bijel.
- CTA "Spremi": isti kao primarni CTA gore. Disabled dok nije odabran tip (opacity .4).

### 3 — Hype nakon spremanja
**Namjena:** potvrda + nabrijavanje; zatvara se na CTA ili automatski nakon ~6s.

- Zaslon centriran (`justify-content:center`, `box-sizing:border-box` obavezan uz `height:100%` + padding).
- Chip gore: 34px visine, radius 999px, glass, emoji + "Noge · 25. kolovoza", 13px/600.
- Glass kartica: radius 36px, padding 28px 22px 26px, `rgba(255,255,255,0.07)`, blur 30px saturate 185%.
  - GIF slot: `aspect-ratio: 1.1`, radius 26px, `rgba(0,0,0,0.35)`, `inset 0 0 0 1.5px rgba(34,197,94,0.35)`. Sadržaj: nasumičan GIF iz `src/assets/hype/*.gif` (glob import, bez popisa koji se održava); ako mape nema, kartica ostaje bez slike i samo se prikaže poruka.
  - Poruka: 28px / 800 / line-height 1.15 / tracking -0.02em / `text-wrap: pretty`, centrirano, iz `HYPE_MESSAGES`.
  - Podnožje: broj u nizu 14px/600 zelen (tabular-nums) + opis 500 `#6B7280`.
- CTA "Idemo dalje": primarni CTA.

## Interactions & Behavior
- **Press feedback:** na `pointerdown`, ne na `click`. `transform: scale(0.97)` u 100ms; primarni CTA dodatno potamni na `#16A34A`.
- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)`, trajanja 180–240ms. Bez bounce/spring.
- **Sheet enter/exit:** slide-up 8px + fade, isti put natrag; zatvaranje na scrim tap i na swipe-down.
- **Prijelazi zaslona:** fade ili 8px slide-up. Bez flipova i parallaxa.
- **Klik na dan:** klikabilan je samo današnji dan; prošli su vidljivi ali zaključani, budući onemogućeni. Poruka pod kalendarom ostaje: "Označiti možeš samo današnji dan."
- **Poruka srama:** prikazuje se ako je lokalno vrijeme ≥ 20:00 i dan nije označen. Poruka se bira **deterministički po datumu** (hash datuma % duljina liste) da refresh ne mijenja tekst.
- **Hype poruka:** bira se nasumično pri spremanju.
- **Pozadinsko svjetlo:** tri mekana kruga, blur 70–90px, opacity .32–.55, animira se **isključivo `transform`** (`drift1/2/3`, 24–40s, `ease-in-out infinite alternate`). Nikad ne animiraj `filter` ili `position`.
- **Zrno:** SVG `feTurbulence baseFrequency=0.9`, desaturirano, opacity 5%, `mix-blend-mode: overlay` preko cijele podloge — ubija banding i daje "napredniji" dojam.
- **Refrakcija:** `backdrop-filter: … url(#liquid-refraction)` samo na sheetu (jedan hero moment). Fallback:
  ```css
  @supports not (backdrop-filter: url(#liquid-refraction)) {
    .sheet { backdrop-filter: blur(34px) saturate(185%); }
  }
  ```
- **prefers-reduced-motion:** ugasi drift, pulse i sheen; zadrži fade.

## State Management
- `session: { username, pin } | null` (localStorage, ključ `training-tracker:session`).
- `profile: { username, createdAt, entries: Record<YYYY-MM-DD, TrainingType> }` — iz Netlify funkcije `/api/profile`.
- `viewMonth: { year, month }` — navigacija kalendara (samo prikaz, ne mijenja pravila označavanja).
- `sheetOpen: boolean`, `selectedType: TrainingType | null`.
- `hype: { message, gif } | null` — postavlja se nakon uspješnog `mark`, gasi na CTA ili timeout.
- Derived: `streak` (`currentStreak`), `monthCount` (`countInMonth`), `showShame` (≥20:00 && !entries[today]).
- Fetch: `POST /api/profile` s `action: "auth" | "mark"`. Optimistic update na `mark`, rollback na grešku.

## Design Tokens

**Boje**
| Uloga | Vrijednost |
|---|---|
| Podloga zaslona | `#04060A` |
| Podloga ploče/stranice | `#05060A` |
| Akcent (jedina brand boja) | `#22C55E` |
| Akcent pressed | `#16A34A` |
| Tekst na zelenom | `#062911` |
| Tekst primarni | `#FFFFFF` |
| Tekst muted | `#9CA3AF` |
| Tekst subtle / labele | `#6B7280` |
| Weekday labele | `#4B5563` |
| Budući dan | `#374151` |
| Amber (samo poruka srama) | `#F5B400`, tekst `#F5D680`, fill `rgba(245,180,0,0.10)` |
| Hairline | `rgba(255,255,255,0.06)` / jači `rgba(255,255,255,0.12)` |

**Glass recept (standard)**
```css
background: rgba(255, 255, 255, 0.055);
backdrop-filter: blur(28px) saturate(180%);
-webkit-backdrop-filter: blur(28px) saturate(180%);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.20),   /* specular gornji rub */
  inset 0 0 0 .5px rgba(255,255,255,0.06),/* hairline */
  0 18px 40px rgba(0,0,0,0.5);            /* dubina */
```
Varijante: thin `rgba(255,255,255,0.05)` blur 16px saturate 170%; thick (sheet) `rgba(255,255,255,0.07)` blur 34px saturate 185%. Nikad ne slaži dva prozirna sloja jedan na drugi.

**Pozadinski krugovi svjetla:** `#127A47` (zelena), `#0B5A6B` (teal), `#15A05A` (svjetlija zelena), blur 70–90px, opacity .32–.6. Plus gornji vignette `radial-gradient(120% 60% at 50% 0%, rgba(34,197,94,0.12), rgba(34,197,94,0.04) 32%, transparent 62%)`.

**Radijusi:** 999px pilule i dani · 22px poruka/gumbi · 26px GIF slot · 32px kalendar · 34px statistika i vrh sheeta · 36px hype kartica · 46px okvir uređaja (samo mockup).

**Spacing:** 4px grid. Padding zaslona 20px, gornji 56px. Gap između sekcija 16px, unutar kartica 10–14px.

**Tipografija:** Inter 400/500/600/700/800. Skala u mockupu: 38/28/24/22/17/16/14/13/12/11/10px. Naslovi 800 s tracking -0.02em. Svi brojevi `font-variant-numeric: tabular-nums`. ALL-CAPS labele: letter-spacing 0.08em, `#6B7280`.

**Sjene:** CTA glow `0 8px 24px rgba(34,197,94,0.30)`; glass dubina `0 18px 40px rgba(0,0,0,0.5)`; sheet `0 -20px 60px rgba(0,0,0,0.6)`; focus halo `0 0 0 6px rgba(34,197,94,0.18)` + 1.5px zeleni border.

## Assets
- **Fontovi:** Inter i JetBrains Mono s Google Fontsa (JetBrains Mono samo za spec ploču u mockupu, ne treba u aplikaciji).
- **Emoji tipova treninga** (zadržani iz postojeće aplikacije): 💪 Ruke · 🦵 Noge · 🪽 Leđa · 🛡️ Prsa · 🪨 Ramena · 🏃 Kardio · 🏋️ Full body.
- **GIF-ovi:** korisnik ih ubacuje u `src/assets/hype/`, pokupiti glob importom. Nisu dio ovog paketa.
- **SVG filteri:** `#liquid-refraction` (feTurbulence + feDisplacementMap, scale 16) i `#grain` — definirani u `mockup.html`, kopirati kako jesu.

## Files
- `mockup.html` — samostalna dizajnerska referenca, sva tri zaslona jedan uz drugi + ploča s CSS vrijednostima na dnu.
- U izvornom projektu dizajn živi u `Trening Tracker Mockup.dc.html`.
