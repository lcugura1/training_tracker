import { useState, type CSSProperties } from "react";
import {
  MAX_TYPES_PER_DAY,
  TRAINING_META,
  TRAINING_TYPES,
  toggleType,
  type TrainingType,
} from "../lib/trainings";
import { BottomSheet } from "./BottomSheet";

interface TrainingSheetProps {
  dateLabel: string;
  /** Današnji dan nosi pitanje "danas", ostali "taj dan" — dan je ionako u podnaslovu. */
  isToday: boolean;
  initialTypes?: TrainingType[];
  busy: boolean;
  error: string;
  onSave: (types: TrainingType[]) => void;
  onClose: () => void;
}

export function TrainingSheet({
  dateLabel,
  isToday,
  initialTypes,
  busy,
  error,
  onSave,
  onClose,
}: TrainingSheetProps) {
  const [selected, setSelected] = useState<TrainingType[]>(initialTypes ?? []);

  return (
    <BottomSheet ariaLabel={`Označi trening — ${dateLabel}`} onClose={onClose}>
      <h2 className="sheet__title">
        {isToday ? "Što si danas radio?" : "Što si radio taj dan?"}
      </h2>
      <p className="sheet__sub">
        {dateLabel} · odaberi do {MAX_TYPES_PER_DAY}
      </p>

      <div className="types">
        {TRAINING_TYPES.map((type) => {
          const meta = TRAINING_META[type];
          const isSelected = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              className={`type ${isSelected ? "type--selected" : ""}`}
              style={{ "--tag": meta.color } as CSSProperties}
              onClick={() => setSelected((prev) => toggleType(prev, type))}
              aria-pressed={isSelected}
            >
              <span className="type__emoji">{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {error && <p className="error">{error}</p>}

      <button
        type="button"
        className="cta"
        disabled={selected.length === 0 || busy}
        onClick={() => selected.length > 0 && onSave(selected)}
      >
        {busy ? "Spremam…" : "Spremi"}
      </button>
    </BottomSheet>
  );
}
