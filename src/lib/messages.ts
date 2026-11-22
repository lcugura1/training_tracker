/**
 * Poruke srama — javljaju se cijeli dan, sve dok današnji dan nije označen.
 * Biraju se nasumično pri svakom prikazu bannera (vidi randomShameMessage).
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
  "Teretana radi. Ti ležiš. Matematika je jednostavna.",
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
  "Jedino što si danas podigao je daljinski. I to s mukom.",
  "Šipka ti je poslala poruku. Ostavio si je na „viđeno“.",
  "Tvoj budući ja te upravo gleda i odmahuje glavom.",
  "„Idem poslije posla“ znači „idem nikad“. Svi znamo, i ti.",
  "Shaker ti je danas ostao čist. Kao i savjest, očito.",
  "Mišićna memorija ti je otišla u mirovinu. Hvala na doprinosu.",
  "Prijatelji su ti na treningu, ti si na kauču. Netko od vas raste, i nisi to ti.",
  "Jedini sport koji si danas upražnjavao je čekanje da dan prođe.",
  "Kauč ti je danas bio vjerniji nego ikad. Čestitam na vezi.",
  "Stalno si „umoran“. Od čega, jebote, od ležanja?",
  "Jedino što je danas bilo teško bila je odluka da ne ideš. Pobijedila je. Bravo.",
  "Teretana te nije zaboravila. Samo je prestala čekati.",
  "Ni jedne serije danas. Dobro, osim one na Netflixu, ali to se ne računa.",
  "Ako te danas jebala loša volja, trening bi pomogao. Ali nije ga bilo.",
  "Tvoji bicepsi su ti poslali poruku. Nisi je pročitao, naravno.",
  "Danas je bio dan za pobjedu. Ti si poslao zamjenu — kauč.",
  "Dan je gotov, a majica ti je i dalje suha. Sumnjivo.",
  "Nitko ti nije kriv. Osim tebe. I tvoje volje. I kauča.",
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
  "KRALJU! Danas si preskočio izgovore i ostavio trag!",
  "ODRADIO SI! Sutra će te boljeti, a ti ćeš se smiješiti.",
  "RASTURIO SI! Teretana ti duguje pivo!",
  "BICEPSI PLJEŠĆU! Hlače se boje!",
  "Dok drugi traže motivaciju, ti si je jebeno odradio.",
  "TEŽINE SU SE POBOJALE! Sutra opet dolaziš po njih.",
  "BESTIJA! Pumpa deset od deset!",
  "Ti – 1, izgovori – 0. Presuda je pala.",
  "BRAVO ŠEFE! Ovo se ne gradi na kauču!",
  "Ovakvih dana se sjetiš kad te pitaju kako si ušao u formu.",
  "E pa jebi ga — danas si pobijedio samog sebe!",
  "FORMA SE KUJE, A TI SI MAJSTOR S ČEKIĆEM!",
  "ZLATNA MEDALJA ZA UPORNOST! Nema je, ali zaslužuješ.",
  "SIROVA SNAGA! Šipka traži milost.",
  "Danas si uzeo gvožđe i vratio ga manje ponosnim.",
  "HAJDE JEBOTE! Još jedna kockica u slagalici!",
];

const LAST_SHAME_KEY = "training-tracker:last-shame";

/**
 * Nasumična poruka srama, ali nikad ista kao zadnja prikazana na ovom uređaju —
 * inače bi dva refresha zaredom mogla pokazati istu poruku.
 */
export function randomShameMessage(): string {
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_SHAME_KEY);
  } catch {
    // Bez storagea (privatni način) nema pamćenja, ostaje čisti random.
  }

  const pool = SHAME_MESSAGES.filter((m) => m !== last);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Zapamti prikazanu poruku da je sljedeći odabir preskoči. */
export function rememberShameMessage(message: string): void {
  try {
    localStorage.setItem(LAST_SHAME_KEY, message);
  } catch {
    /* isto kao gore */
  }
}

export function randomHypeMessage(): string {
  return HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
}
