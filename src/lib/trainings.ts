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
  /** CSS token koji boji dan u kalendaru i gumb u sheetu. */
  color: string;
}

export const TRAINING_META: Record<TrainingType, TrainingMeta> = {
  ruke:     { label: "Ruke",      emoji: "💪",  color: "var(--orange)" },
  noge:     { label: "Noge",      emoji: "🦵",  color: "var(--purple)" },
  leda:     { label: "Leđa",      emoji: "🪽",  color: "var(--cyan)" },
  prsa:     { label: "Prsa",      emoji: "🛡️", color: "var(--red)" },
  ramena:   { label: "Ramena",    emoji: "🪨",  color: "var(--yellow)" },
  kardio:   { label: "Kardio",    emoji: "🏃",  color: "var(--green)" },
  fullbody: { label: "Full body", emoji: "🏋️", color: "var(--pink)" },
};

export function isTrainingType(value: unknown): value is TrainingType {
  return TRAINING_TYPES.includes(value as TrainingType);
}
