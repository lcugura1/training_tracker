# Mjesečni cilj — modal (mobilni web spec)

Izvor dizajna: `templates/monthly-goal/MonthlyGoalScreen.dc.html` (kod: `monthly-goal-sheet.tsx`). Referentni viewport 390×844, tamna tema. Koriste se isključivo tokeni ispod.

## 1. Okidač

- Otvara se tapom na lijevu karticu „Ovaj mjesec" (progress prsten) na ekranu Evidencija.
- Kartica ima `:active { opacity:.9 }` i `cursor:pointer`; semantički je `<button aria-haspopup="dialog">`.
- Nakon spremanja vrijednost cilja postaje `limit` u prstenu (`done/limit`).

## 2. Tokeni

```css
--color-background:#000000;
--color-surface:#0E0E10;
--color-surface-border:#1F1F22;
--color-text-primary:#FFFFFF;
--color-text-secondary:#8E8E93;
--color-button-primary-from:#FFFFFF;
--color-button-primary-to:#CFCFCF;
--color-button-primary-text:#000000;
--color-danger:#FF3B30;
```
Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', Roboto, system-ui, sans-serif`.

## 3. Struktura

```
Overlay (fixed, inset 0)
 ├─ Backdrop (blur + zatamnjenje, iza je ekran Evidencija)
 └─ Centrirajući kontejner (padding 24px)
     └─ Kartica dijaloga
         ├─ Header (eyebrow + naslov)
         ├─ Numerički unos
         ├─ Poruka greške (uvjetno)
         └─ Gumb „Spremi"
```

## 4. Backdrop

- `position:fixed; inset:0; z-index` iznad tab bara.
- `backdrop-filter: blur(24px)` (+ `-webkit-backdrop-filter`).
- Pozadina: `color-mix(in srgb, var(--color-background) 35%, transparent)`.
- Ekran ispod ostaje vidljiv kroz zamućenje; scroll stranice zaključan dok je modal otvoren (`overflow:hidden` na body).
- Tap na backdrop zatvara modal bez spremanja.

## 5. Pozicioniranje

- Kontejner: `display:flex; flex-direction:column; justify-content:center; padding:24px`.
- Kartica je vertikalno centrirana, širina = viewport − 48px (342px na 390), max-width 420px, horizontalno centrirana.
- Kad se otvori tipkovnica: koristi `100dvh` / `visualViewport` da kartica ostane centrirana u vidljivom dijelu iznad tipkovnice, ne ispod nje.

## 6. Kartica dijaloga

- `background: var(--color-surface)`
- `border: 1px solid var(--color-surface-border)`
- `border-radius: 24px`
- `padding: 24px`
- flex stupac, `gap: 20px`
- Bez sjene.

### 6a. Header
- Flex stupac, centrirano, `gap:6px`.
- Eyebrow: „MJESEČNI CILJ" — 13px, weight 600, letter-spacing 0.5px, uppercase, `--color-text-secondary`.
- Naslov: „Koliko dolazaka mjesečno?" — 22px, weight 700, centriran, `--color-text-primary`. Ovo je `aria-labelledby` dijaloga.

### 6b. Unos
- `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off">`
- Širina 100%, visina 64px, `border-radius:16px`.
- Pozadina `--color-background`, border 1px `--color-surface-border`.
- Tekst: 30px, weight 800, centriran, `--color-text-primary`, `font: inherit`.
- Placeholder „npr. 12", `--color-text-secondary` (ista veličina/težina).
- Bez outline-a; fokus: border postaje `--color-border-focused` (#FFFFFF). Caret bijeli.
- Predpopunjeno trenutnim ciljem (ako postoji), inače prazno.
- Autofokus pri otvaranju (otvara numeričku tipkovnicu).
- Filtriranje unosa: dopuštene samo znamenke, max 2 znaka (`value.replace(/[^0-9]/g,'').slice(0,2)`).
- Svaka promjena briše prikazanu grešku.
- Enter na tipkovnici = Spremi.

### 6c. Greška
- Stanje greške: border inputa postaje 1px `--color-danger` (zamjenjuje sivi border, ne dodaje se drugi).
- Ispod inputa poruka: 13px, `--color-danger`, centrirano. Razmak od inputa 12px (gap 20 − 8 negativne margine).
- Input dobiva `aria-invalid="true"` i `aria-describedby` na poruku; poruka `role="alert"`.

### 6d. Gumb „Spremi"
- Širina 100%, visina 52px, `border-radius:16px`, bez bordera.
- Pozadina: `linear-gradient(135deg, var(--color-button-primary-from), var(--color-button-primary-to))`.
- Tekst „Spremi": 16px, weight 700, `--color-button-primary-text`.
- `:active { opacity:.85 }`.
- Uvijek omogućen (validacija se radi na klik).
- Za vrijeme spremanja: tekst „Spremanje…", `opacity:.6`, `pointer-events:none`.

## 7. Validacija (na „Spremi")

| Uvjet | Poruka |
|---|---|
| prazno, nije broj ili < 1 | „Cilj mora biti barem 1" |
| > 31 | „Cilj može biti najviše 31" |
| 1–31 | sprema, zatvara modal |

## 8. Ponašanje

- Uspješno spremanje: zatvori modal, ažuriraj prsten na kartici (animiraj `stroke-dashoffset` 400ms ease-out).
- Greška mreže pri spremanju: modal ostaje otvoren, poruka „Spremanje nije uspjelo. Pokušaj ponovno." u istom stilu greške ispod inputa (border inputa ostaje normalan).
- Zatvaranje: tap na backdrop, Escape, Android/browser back (gurni history state pri otvaranju). Nema X gumba.
- Fokus zarobljen unutar dijaloga; nakon zatvaranja fokus se vraća na karticu „Ovaj mjesec".

## 9. Animacija

- Otvaranje: backdrop opacity 0→1, 200ms ease-out; kartica opacity 0→1 + scale 0.96→1, 220ms `cubic-bezier(0.2,0.8,0.2,1)`.
- Zatvaranje: obrnuto, 150ms ease-in.
- `prefers-reduced-motion`: samo opacity fade, bez scale.

## 10. Pristupačnost

- `role="dialog" aria-modal="true" aria-labelledby="<id naslova>"`.
- Input `aria-label="Broj dolazaka mjesečno"`.
- Kontrast: sav tekst prolazi 4.5:1 na `--color-surface`.

## 11. Podaci

```ts
type Props = {
  open: boolean;
  initialGoal: number | null;
  onSave: (goal: number) => Promise<void>;
  onClose: () => void;
};
```

## 12. Ne dodavati

Nema X gumba, gumba „Odustani", stepper +/− kontrola, sjena ni dodatnog teksta.
