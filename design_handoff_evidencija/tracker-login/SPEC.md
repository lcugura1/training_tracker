# Trening Tracker — prijava (2 koraka) + poruka na početnoj — handoff spec

Izvor dizajna: `TrackerLogin.dc.html` (tri ekrana: Korak 1, Korak 2, Početna). Mobilni web, referentni viewport 390×844, tamna tema. Koriste se samo tokeni ispod.

## Tokeni
```css
--color-background:#000000;
--color-surface:#0E0E10;
--color-surface-border:#1F1F22;
--color-text-primary:#FFFFFF;
--color-text-secondary:#8E8E93;
--color-text-on-light:#000000;
--color-border:#3A3A3A;
--color-border-focused:#FFFFFF;
--color-card-gradient-from:#1A1B1E;
--color-card-gradient-to:#0C0C0E;
--color-card-border:#26272B;
--color-accent:#C5F23D;
--color-danger:#FF3B30;
```
Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', Roboto, system-ui, sans-serif`.

## Zajedničko (oba koraka prijave)
- Stranica: pozadina `--color-background`, `min-height:100dvh`, flex stupac, padding `calc(env(safe-area-inset-top) + 20px) 20px calc(env(safe-area-inset-bottom) + 34px)` (u dizajnu 67/20/34).
- **Bez kartice-kontejnera** — sadržaj stoji izravno na pozadini.
- **Oznaka koraka**: samo „1/2" ili „2/2", gore lijevo. 17px, weight 800, tabular-nums, letter-spacing 0.5px. Trenutni broj u `--color-accent`, „/2" u `--color-text-secondary`. Bez „KORAK … OD …".
- Tekst „Trening Tracker" se više ne koristi.

## Korak 1 — korisničko ime
Redoslijed odozgo:
1. Oznaka „1/2".
2. Naslov „Dobrodošao<br>majstorčino" (namjerni prijelom u 2 reda), lijevo poravnat, margin-top 28px. 44px, weight 800, line-height 1.02, letter-spacing −1.2px, `--color-text-primary`.
3. Podnaslov „Evidencija koja te ne mazi." — 16px, `--color-text-secondary`, margin-top 12px.
4. „Tko si ti?" — 22px/700, margin-top 56px.
5. **Polje** (margin-top 14px):
   - Visina 72px, pill (`border-radius:999px`), pozadina `--color-surface`, border 1px `--color-surface-border`, padding 0 28px, tekst lijevo.
   - Fokus: border 1px `--color-border-focused`.
   - Upisani tekst: 26px, weight 700, letter-spacing −0.3px, `--color-text-primary`.
   - **Placeholder s formatom** (prikazuje se dok je polje prazno, i tijekom fokusa): „ime" + „prezime" spojeno bez razmaka, isti font kao unos (26px/700). „ime" je `--color-text-primary` s opacity 0.38, „prezime" je `--color-accent`. Implementirati kao apsolutni overlay (`pointer-events:none`, `aria-hidden`) iza inputa, jer nativni `::placeholder` ne podržava dvije boje. Overlay nestaje na prvi upisani znak.
   - Input: `autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Korisničko ime u formatu imeprezime"`.
   - Sanitizacija na svaku promjenu: lowercase, dopuštena samo slova `a-z č ć đ š ž` (razmaci, brojevi i znakovi se uklanjaju).
6. Pomoćni tekst ispod polja (margin-top 12px, uvučen 28px da se poravna s tekstom u polju): „Sve spojeno, malim slovima · npr. " 14px `--color-text-secondary` + „leoncugura" 14px/600 `--color-text-primary`. **Nema pillova** za format/primjer.
7. Razmaknica (`flex:1`) gura gumb na dno.
8. **Gumb „Dalje"**: širina 100%, visina 60px, pill, pozadina `--color-accent`, tekst `--color-text-on-light` 18px/700. `:active { transform:scale(.98) }`. Disabled dok je polje prazno: `opacity:.4`, nije klikabilan. Enter na tipkovnici = Dalje.

## Korak 2 — PIN
Cilj: tipkovnica što veća i lakša za tipkanje. Bez kartice, bez velikog naslova aplikacije.

Redoslijed odozgo:
1. Oznaka „2/2".
2. „Upiši PIN" — 34px/800, line-height 1.05, letter-spacing −0.8px, margin-top 28px.
3. „Bok, **leoncugura**" — 16px `--color-text-secondary`, korisničko ime 600 `--color-text-primary`. margin-top 8px.
4. **PIN točke** — zauzimaju sav preostali prostor (`flex:1`) i centrirane su u njemu. 4 kruga 18×18, gap 20px.
   - Prazna: transparentna, border 2px `--color-border`.
   - Upisana: ispuna i border `--color-accent`.
5. **Tipkovnica** — prikovana za dno.
   - Grid 3 stupca (`repeat(3,minmax(0,1fr))`), gap 12px, puna širina (350px na 390).
   - Redovi: 1 2 3 / 4 5 6 / 7 8 9 / Natrag 0 ⌫.
   - Tipka s brojem: visina 80px, `border-radius:22px`, pozadina `linear-gradient(135deg, var(--color-card-gradient-from), var(--color-card-gradient-to))`, border 1px `--color-card-border`. Broj 32px/600, tabular-nums, `--color-text-primary`. `:active { background: var(--color-card-border) }`.
   - „Natrag" (lijevo dolje): bez pozadine i bordera, 16px/600 `--color-text-secondary`. Vraća na Korak 1 (zadržava upisano ime).
   - Brisanje (desno dolje): bez pozadine/bordera, ikona backspace 30×30 (stroke 1.8, round), `--color-text-primary`, `aria-label="Obriši"`, `:active { background: var(--color-surface) }`.
   - Ukupna visina tipkovnice: 4×80 + 3×12 = 356px.
   - Na tap: `navigator.vibrate?.(10)` ako je podržano. `touch-action: manipulation` na tipkama (bez zooma na dvostruki tap).
   - Podržati i fizičku tipkovnicu (0–9, Backspace).
   - Nakon 4. znamenke automatski poslati PIN.
   - Pogrešan PIN: točke se tresu (translateX ±8px, 300ms), postaju `--color-danger` na 400ms, zatim se prazne. Ispod točaka 14px `--color-danger` „Pogrešan PIN".

## Početna — poruka
Mijenja se samo blok poruke (pill se uklanja). Ostatak početne ostaje kakav jest.

- Header: „Evidencija" 30px/800 lijevo, „Odjava" 15px/600 `--color-text-secondary` desno (u istom redu, `space-between`). Ispod: „Dobar dan, Imeprezime · Nedjelja, 22. studenoga" 14px `--color-text-secondary`, gap 6px.
- **Poruka** (bez pozadine, bordera i pilla), padding 8px 4px 4px, flex stupac gap 10px:
  - Red s vremenom: točka 8×8 `--color-danger` + vrijeme „17:13" 15px/700 tabular-nums `--color-danger`, gap 8px.
  - Rečenica: 32px/800, line-height 1.12, letter-spacing −0.8px, `--color-text-primary`, `text-wrap:pretty`, lijevo poravnata. Iz izvorne poruke „17:13 je. Tvoj budući ja…" vrijeme se vadi u red iznad, a u rečenici ostaje „Tvoj budući ja te upravo gleda i odmahuje glavom."
  - Ako poruka nema vremenski prefiks, red s vremenom se ne prikazuje.
- Gumb „Označi današnji trening": puna širina, visina 60px, pill, `--color-accent`, tekst `--color-text-on-light` 18px/700.
- Razmak između blokova 24px.

## Pristupačnost
- Fokus prsten na gumbima i tipkama: outline 2px `--color-accent`, offset 2px.
- PIN točke: `role="status" aria-label="Upisano N od 4"`.
- Poruka na početnoj: obični `<p>`, vrijeme u `<time>`.
