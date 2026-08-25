/** Tipovi treninga — vrijednosti moraju odgovarati onima u netlify/functions/profile.mts */
export const TRAINING_TYPES = [
  "ruke",
  "noge",
  "leda",
  "prsa",
  "ramena",
  "kardio",
  "fullbody",
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

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
  kardio:   { label: "Kardio",    emoji: "🏃" },
  fullbody: { label: "Full body", emoji: "🏋️" },
};

export function isTrainingType(value: unknown): value is TrainingType {
  return TRAINING_TYPES.includes(value as TrainingType);
}
