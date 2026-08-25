# Trening Tracker

Mobilna web aplikacija za evidenciju odlazaka u teretanu. Upišeš korisničko ime,
označiš dan kad si trenirao — a ako u 20:00 nisi, aplikacija ti to kaže bez dlake
na jeziku.

## Kako radi

- **Prijava** — korisničko ime + 4-znamenkasti PIN. Bez emaila, bez lozinki.
  Profil živi na serveru, pa te prati na svim uređajima.
- **Kalendar** — mjesečni prikaz. Označiti možeš **samo današnji dan**; povijest
  se ne prepravlja.
- **Tipovi treninga** — Ruke 💪, Noge 🦵, Leđa 🪽, Prsa 🛡️, Ramena 🪨,
  Kardio 🏃, Full body 🏋️. Označeni dan u kalendaru poprima emoji svog tipa.
- **Nabrijavanje** — nakon spremanja trening dobiješ pretjerano pohvalnu poruku
  i nasumičan GIF.
- **Sram** — svaki dan nakon 20:00 bez označenog treninga donosi poruku iz
  rotacije. Poruka je determinirana datumom, pa refresh ne mijenja ništa.
- **Statistika** — niz uzastopnih dana i broj treninga u tekućem mjesecu.

## Stack

| Sloj | Tehnologija |
|---|---|
| Frontend | Vite 8, React 19, TypeScript 6 |
| Animacije | [Motion](https://motion.dev) — opruge, ne fiksna trajanja |
| Izgled | Apple Liquid Glass (CSS + SVG refrakcija), dark-only |
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
