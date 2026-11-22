# Trening Tracker

Mobilna web aplikacija za evidenciju odlazaka u teretanu. Upišeš korisničko ime,
označiš dan kad si trenirao — a ako nisi, aplikacija ti to kaže bez dlake
na jeziku.

## Kako radi

- **Prijava** — korisničko ime + 4-znamenkasti PIN. Bez emaila, bez lozinki.
  Profil živi na serveru, pa te prati na svim uređajima.
- **Kalendar** — mjesečni prikaz. Označiti možeš današnji dan i **do 3 mjeseca
  unatrag** (dodirni dan); starije se ne prepravlja. Granica se računa isto na
  klijentu (`src/lib/dates.ts`) i na serveru (`netlify/functions/profile.mts`).
- **Tipovi treninga** — Ruke 💪, Noge 🦵, Leđa 🪽, Prsa 🛡️, Ramena 🪨, Core 🧱,
  Kardio 🏃, Boks 🥊, Full body 🏋️. Do dva po danu. Označeni dan u kalendaru pokazuje emoji
  svog tipa (limeta pločica), a graf raspodjele koristi boje.
- **Mjesečni cilj** — tap na karticu "Ovaj mjesec" otvara modal za cilj
  (1–31 dolazaka) u istom bottom sheetu kao i odabir treninga. Sprema se na profil, a prsten pokazuje `dolasci/cilj`.
- **Nabrijavanje** — nakon spremanja trening dobiješ pretjerano pohvalnu poruku
  i nasumičan GIF.
- **Sram** — svaki dan bez označenog treninga, od ponoći pa do označavanja, donosi poruku iz
  liste. Poruka se bira nasumično pri svakom otvaranju appa i ne ponavlja se ista
  dva puta zaredom; dok je app otvoren, ostaje ista.
- **Statistika** — prsten treninga u mjesecu naspram cilja, ukupan broj s
  trendom po tjednima i raspodjela po tipu treninga. Niz uzastopnih dana vidi
  se na ekranu nakon spremanja.

## Stack

| Sloj | Tehnologija |
|---|---|
| Frontend | Vite 8, React 19, TypeScript 6 |
| Animacije | [Motion](https://motion.dev) — sheet, hype i donut graf |
| Izgled | Tamna tema, limeta kao akcent; tokeni iz [`design_handoff_evidencija/SPEC.md`](design_handoff_evidencija/SPEC.md), sistemski font |
| Backend | Netlify Functions (v2, ESM) |
| Pohrana | Netlify Blobs |
| Hosting | Netlify |

## Razvoj

```bash
npm install
netlify dev          # Vite + funkcije + lokalni Blobs sandbox, port 8888
```

`npm run dev` pokreće samo Vite — API pozivi tada neće raditi jer nema funkcija.

```bash
npm run build        # tsc -b && vite build
npm run lint         # oxlint
```

## GIF-ovi

Ubaci datoteke u [`src/assets/hype/`](src/assets/hype/) — pokupe se automatski.
Detalji u README-u te mape.

## Deploy

Spojen na Netlify preko GitHub integracije; svaki push na `main` pokreće deploy.
Konfiguracija je u [`netlify.toml`](netlify.toml).

## Sigurnost

PIN se nikad ne sprema u čistom obliku — čuva se SHA-256 hash sa salt-om po
korisniku, a usporedba ide u konstantnom vremenu. Nakon 5 pogrešnih pokušaja
profil se zaključava na 5 minuta. PIN se drži u `localStorage` radi udobnosti;
svjestan kompromis za aplikaciju koja čuva evidenciju treninga.
