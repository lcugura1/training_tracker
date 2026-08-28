export const DAY_LABELS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

export const MONTH_LABELS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac",
];

/** YYYY-MM-DD u LOKALNOJ zoni — toISOString() bi ovdje pomaknuo dan. */
export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

/** Sram se javlja tek nakon 20:00. */
export const SHAME_HOUR = 20;

export function isAfterShameHour(now = new Date()): boolean {
  return now.getHours() >= SHAME_HOUR;
}

/**
 * Dani mjeseca poredani u mrežu koja počinje ponedjeljkom.
 * null = prazno mjesto prije prvog dana u mjesecu.
 */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // getDay(): 0 = nedjelja. Pomičemo tako da ponedjeljak bude 0.
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * Broj uzastopnih dana s treningom, računajući unatrag.
 * Ako danas još nije označen, niz se i dalje broji od jučer — dan nije gotov
 * dok ne prođe ponoć, pa ga ne kažnjavamo prerano.
 */
export function currentStreak(entries: Record<string, unknown>): number {
  const cursor = new Date();
  if (!entries[toKey(cursor)]) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (entries[toKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function countInMonth(
  entries: Record<string, unknown>,
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return Object.keys(entries).filter((k) => k.startsWith(prefix)).length;
}

const DAY_FULL = [
  "Nedjelja", "Ponedjeljak", "Utorak", "Srijeda",
  "Četvrtak", "Petak", "Subota",
];

/** Genitiv je ono što ide uz datum: "25. kolovoza", ne "25. kolovoz". */
const MONTH_GENITIVE = [
  "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
  "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca",
];

export function formatLong(date: Date): string {
  return `${DAY_FULL[date.getDay()]}, ${date.getDate()}. ${MONTH_GENITIVE[date.getMonth()]}`;
}

/** Pozdrav se mijenja po dijelu dana. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Dobro jutro";
  if (h < 18) return "Dobar dan";
  return "Dobra večer";
}

export function timeHHMM(now = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * Najdulji niz ikad — treba za oznaku "novi rekord" na hype ekranu.
 * Dan se pomiče preko setDate, ne zbrajanjem milisekundi: prelazak na ljetno
 * računanje vremena čini dan dugim 23 ili 25 sati, pa bi aritmetika pukla.
 */
export function longestStreak(entries: Record<string, unknown>): number {
  const keys = Object.keys(entries).sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const key of keys) {
    if (previous) {
      const next = new Date(`${previous}T00:00:00`);
      next.setDate(next.getDate() + 1);
      run = toKey(next) === key ? run + 1 : 1;
    } else {
      run = 1;
    }
    previous = key;
    if (run > best) best = run;
  }
  return best;
}

/** Kratki oblik za chip: "25. kolovoza", bez dana u tjednu. */
export function formatShort(date: Date): string {
  return `${date.getDate()}. ${MONTH_GENITIVE[date.getMonth()]}`;
}
