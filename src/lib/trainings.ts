/** Tipovi treninga — vrijednosti moraju odgovarati onima u netlify/functions/profile.mts */
export const TRAINING_TYPES = [
  "ruke",
  "noge",
  "leda",
  "prsa",
  "ramena",
  "core",
  "kardio",
  "trcanje",
  "plivanje",
  "boks",
  "fullbody",
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

/** Najviše dva tipa po danu — dovoljno za kombinaciju, premalo za popis želja. */
export const MAX_TYPES_PER_DAY = 2;

interface TrainingMeta {
  label: string;
  emoji: string;
  /** Boja tipa u grafu raspodjele i odabiru. Podatkovna vrijednost, ne UI token. */
  color: string;
}

/*
 * Boje prate TAG_COLORS iz dizajna (design_handoff_evidencija/SPEC.md). Dizajn
 * poznaje šest oznaka, a mi imamo jedanaest tipova — Core, Full body, Boks,
 * Trčanje i Plivanje dobili su nove boje iz iste obitelji (cijan, žuta,
 * srebrna, koral, indigo). Kalendar ne koristi boje: tamo tip dana nosi emoji.
 * Trčanje ima 👟 jer 🏃 već nosi Kardio, a dani se razlikuju samo po emojiju.
 */
export const TRAINING_META: Record<TrainingType, TrainingMeta> = {
  ruke:     { label: "Ruke",      emoji: "💪", color: "#FF6B8A" },
  noge:     { label: "Noge",      emoji: "🦵", color: "#FF9F45" },
  leda:     { label: "Leđa",      emoji: "🪽", color: "#4DA3FF" },
  prsa:     { label: "Prsa",      emoji: "🛡️", color: "#C5F23D" },
  ramena:   { label: "Ramena",    emoji: "🪨", color: "#B57BFF" },
  core:     { label: "Core",      emoji: "🧱", color: "#4DD4E6" },
  kardio:   { label: "Kardio",    emoji: "🏃", color: "#3DDC97" },
  trcanje:  { label: "Trčanje",   emoji: "👟", color: "#FF5C4D" },
  plivanje: { label: "Plivanje",  emoji: "🏊", color: "#7C8CFF" },
  boks:     { label: "Boks",      emoji: "🥊", color: "#C7C7CC" },
  fullbody: { label: "Full body", emoji: "🏋️", color: "#FFD84D" },
};

/**
 * Klik na tip: već odabrani se miče, novi se dodaje. Kad su puna dva mjesta,
 * najstariji ispada — tako nijedan dodir ne ostane bez učinka.
 */
export function toggleType(
  selected: TrainingType[],
  type: TrainingType,
): TrainingType[] {
  if (selected.includes(type)) return selected.filter((t) => t !== type);
  if (selected.length < MAX_TYPES_PER_DAY) return [...selected, type];
  return [...selected.slice(1), type];
}

export function typesLabel(types: TrainingType[]): string {
  return types.map((t) => TRAINING_META[t].label).join(" + ");
}
