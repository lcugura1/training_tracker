/**
 * Poruke srama — javljaju se nakon 20:00 ako dan nije označen.
 * Biraju se DETERMINISTIČKI po datumu: isti dan uvijek daje istu poruku,
 * da refresh ne izgleda kao lutrija.
 */
export const SHAME_MESSAGES = [
  "Spojili se ne mogu i neću, grozno!",
  "Danas ništa, a? Bicepsi su ti se stisnuli od srama.",
  "Jebote, i kauč je danas imao veći volumen treninga od tebe.",
  "Prošao je još jedan dan. Teretana je bila otvorena. Ti nisi.",
  "Nula. Ništa. Kurac. Sutra isto, ha?",
  "Plan ti je bio odličan. Izvedba je bila sranje.",
  "Znaš onaj osjećaj kad si ponosan na sebe? Neće danas.",
  "Netko drugi je danas odradio tvoj trening. I bit će jači od tebe.",
  "Izgovor si već smislio. Rezultat nisi.",
  "Ajde reci naglas: „danas mi se nije dalo“. Kako ti zvuči?",
  "Šipke su hladne. Kao i tvoja motivacija.",
  "Dan bez treninga. Čestitam, upravo si postao prosjek.",
  "20:00. Teretana radi. Ti ležiš. Matematika je jednostavna.",
  "Mišići ne rastu od dobrih namjera, majstore.",
  "„Sutra počinjem“, rekao je čovjek koji nikad nije počeo.",
  "Danas si trenirao samo palac po ekranu.",
  "Jedan dan neće ništa promijeniti — istina. Problem je što ih je već previše.",
  "Ovaj dan ti nitko neće vratiti. Potrošio si ga na ništa.",
  "Nema treninga, nema napretka, nema jebene priče. Ima izgovora.",
  "Ogledalo te sutra neće lagati. Ali ti hoćeš.",
  "Svaka čast, danas si uspješno odradio dan odmora od dana odmora.",
  "Teretana je 10 minuta daleko. Tvoji izgovori su bliži.",
  "Ma pusti, i tako je bio težak dan. Kao i jučer. I prekjučer.",
  "Tvoj plan treninga te upravo pitao gdje si bio. Nemaš odgovor.",
];

/**
 * Poruke nakon spremljenog treninga — pretjerano nabrijane, biraju se nasumično
 * jer je slavlje, a ne dnevni izvještaj.
 */
export const HYPE_MESSAGES = [
  "TAKO SE TO RADI! Šipka je zaplakala!",
  "JEBENA ZVIJER! Danas si zaradio svaki gram!",
  "E TO! Ovo je taj čovjek!",
  "LEGENDA. Šipka gori, ti se smiješ.",
  "PUMPA JE STIGLA! Nema tko te zaustavi!",
  "YEAH BUDDY! LIGHT WEIGHT BABY!",
  "MONSTRUM! Danas si bio bolji od 99% ljudi.",
  "OVO! Ovo je razlog zašto ćeš izgledati kao bog.",
  "Odradio si dok su drugi spavali. Poštovanje.",
  "BOOM! Još jedan dan u banci!",
  "Tijelo ti se upravo zahvalilo. NASTAVI OVAKO!",
  "NEMA MILOSTI! Danas si dao sve!",
  "Ovo je taj momentum. NE ISPUŠTAJ GA!",
  "SVAKA ČAST! Disciplina jede motivaciju za doručak.",
  "ZVIJER MODE: AKTIVIRAN.",
  "Danas si postao malo opasniji nego jučer.",
  "TO! Tako se gradi tijelo koje se ne ispričava!",
  "Jebeni stroj! Sutra ponavljamo!",
];

/** Stabilan hash stringa — isti datum uvijek daje isti indeks. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // drži broj u 32-bitnom rasponu
  }
  return Math.abs(hash);
}

export function shameMessageFor(dateKey: string): string {
  return SHAME_MESSAGES[hashString(dateKey) % SHAME_MESSAGES.length];
}

export function randomHypeMessage(): string {
  return HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
}
