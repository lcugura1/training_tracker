import { toKey } from "./dates";
import { TRAINING_TYPES, type TrainingType } from "./trainings";

type Entries = Record<string, TrainingType[]>;

/** Broj dana s barem jednim treningom, ukupno. */
export function totalTrainingDays(entries: Entries): number {
  return Object.keys(entries).length;
}

/**
 * Kumulativni broj treninga na kraju svakog od zadnjih `points` tjedana
 * (tjedan počinje ponedjeljkom, zadnja točka je tekući tjedan). Prva točka je
 * dakle "koliko sam imao prije šest tjedana", a zadnja "koliko imam sad".
 */
export function weeklyCumulative(
  entries: Entries,
  now = new Date(),
  points = 7,
): number[] {
  const keys = Object.keys(entries);
  const mondayOffset = (now.getDay() + 6) % 7;
  const result: number[] = [];

  for (let weeksBack = points - 1; weeksBack >= 0; weeksBack--) {
    // Nedjelja tog tjedna. Dan se pomiče preko setDate (kroz Date konstruktor),
    // ne zbrajanjem milisekundi — ljetno računanje vremena kvari 24h aritmetiku.
    const sunday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - mondayOffset - 7 * weeksBack + 6,
    );
    const end = toKey(sunday);
    result.push(keys.filter((k) => k <= end).length);
  }
  return result;
}

export interface TagShare {
  type: TrainingType;
  count: number;
  /** Udio u svim označenim treninzima, 0..1. */
  share: number;
}

/**
 * Raspodjela po tipu, od najčešćeg. Dan s dva tipa broji se jednom za svaki
 * od njih. Pri izjednačenju vrijedi redoslijed iz TRAINING_TYPES, da graf ne
 * preskače kad se brojevi poklope.
 */
export function tagBreakdown(entries: Entries): TagShare[] {
  const counts = new Map<TrainingType, number>();
  for (const types of Object.values(entries)) {
    for (const type of types) counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((a, b) => a + b, 0);

  return TRAINING_TYPES.filter((t) => counts.has(t))
    .map((type) => ({
      type,
      count: counts.get(type) ?? 0,
      share: (counts.get(type) ?? 0) / total,
    }))
    .sort((a, b) => b.count - a.count);
}

/** "1 trening", "2 treninga", "21 trening", "11 treninga". */
export function trainingsLabel(n: number): string {
  const one = n % 10 === 1 && n % 100 !== 11;
  return `${n} ${one ? "trening" : "treninga"}`;
}
