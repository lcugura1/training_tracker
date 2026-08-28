/** Tipovi treninga — vrijednosti moraju odgovarati onima u netlify/functions/profile.mts */
export const TRAINING_TYPES = [
  "ruke",
  "noge",
  "leda",
  "prsa",
  "ramena",
  "core",
  "kardio",
  "fullbody",
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

/** Najviše dva tipa po danu — dovoljno za kombinaciju, premalo za popis želja. */
export const MAX_TYPES_PER_DAY = 2;

interface TrainingMeta {
  label: string;
  emoji: string;
}

/* Boje namjerno nema: dizajn nosi jedna zelena, a tip se razlikuje emojijem. */
export const TRAINING_META: Record<TrainingType, TrainingMeta> = {
  ruke:     { label: "Ruke",      emoji: "💪" },
  noge:     { label: "Noge",      emoji: "🦵" },
  leda:     { label: "Leđa",      emoji: "🪽" },
  prsa:     { label: "Prsa",      emoji: "🛡️" },
  ramena:   { label: "Ramena",    emoji: "🪨" },
  core:     { label: "Core",      emoji: "🧱" },
  kardio:   { label: "Kardio",    emoji: "🏃" },
  fullbody: { label: "Full body", emoji: "🏋️" },
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
