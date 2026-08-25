import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { TRAINING_META, TRAINING_TYPES, type TrainingType } from "../lib/trainings";

interface TrainingSheetProps {
  dateLabel: string;
  initialType?: TrainingType;
  busy: boolean;
  error: string;
  onSave: (type: TrainingType) => void;
  onClose: () => void;
}

/** Appleove ship vrijednosti za ladice: damping 0.8 / response 0.3. */
const sheetSpring = { type: "spring", bounce: 0.2, visualDuration: 0.3 } as const;

const DISMISS_OFFSET = 110;
const DISMISS_VELOCITY = 520;

export function TrainingSheet({
  dateLabel,
  initialType,
  busy,
  error,
  onSave,
  onClose,
}: TrainingSheetProps) {
  const [selected, setSelected] = useState<TrainingType | null>(initialType ?? null);

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Povlačenje se zatvara ili po prijeđenom putu ili po brzini otpuštanja —
    // brz flick mora raditi i kad prst nije stigao daleko.
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
        transition={{ duration: 0.2 }}
      />

      <motion.div
        className="glass glass--thick sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Označi trening — ${dateLabel}`}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={sheetSpring}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
      >
        <div className="sheet__handle" />

        <h2 className="sheet__title">Što si danas radio?</h2>
        <p className="sheet__sub">{dateLabel}</p>

        <div className="types">
          {TRAINING_TYPES.map((type) => {
            const meta = TRAINING_META[type];
            const isSelected = selected === type;
            return (
              <button
                key={type}
                type="button"
                className={`type ${isSelected ? "type--selected" : ""}`}
                style={{ "--type-color": meta.color } as React.CSSProperties}
                onClick={() => setSelected(type)}
                aria-pressed={isSelected}
              >
                <span className="type__emoji">{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>

        <p className="error" style={{ marginBottom: "var(--space-4)" }}>{error}</p>

        <button
          type="button"
          className="btn btn--primary"
          style={{ width: "100%" }}
          disabled={!selected || busy}
          onClick={() => selected && onSave(selected)}
        >
          {busy ? "Spremam…" : "Spremi"}
        </button>
      </motion.div>
    </>
  );
}
