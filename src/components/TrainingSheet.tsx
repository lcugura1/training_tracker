import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import {
  MAX_TYPES_PER_DAY,
  TRAINING_META,
  TRAINING_TYPES,
  toggleType,
  type TrainingType,
} from "../lib/trainings";

interface TrainingSheetProps {
  dateLabel: string;
  initialTypes?: TrainingType[];
  busy: boolean;
  error: string;
  onSave: (types: TrainingType[]) => void;
  onClose: () => void;
}

/** Dizajn traži jedno easing i kratka trajanja — bez opruga i odskoka. */
const ease = [0.2, 0.8, 0.2, 1] as const;
const transition = { duration: 0.22, ease };

const DISMISS_OFFSET = 110;
const DISMISS_VELOCITY = 520;

export function TrainingSheet({
  dateLabel,
  initialTypes,
  busy,
  error,
  onSave,
  onClose,
}: TrainingSheetProps) {
  const [selected, setSelected] = useState<TrainingType[]>(initialTypes ?? []);

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Zatvara se ili po prijeđenom putu ili po brzini otpuštanja — brz flick
    // mora raditi i kad prst nije stigao daleko.
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose();
    }
  }

  return (
    <>
      <motion.div
        className="scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      />

      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Označi trening — ${dateLabel}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={transition}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
      >
        <div className="sheet__handle" />

        <h2 className="sheet__title">Što si danas radio?</h2>
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
      </motion.div>
    </>
  );
}
