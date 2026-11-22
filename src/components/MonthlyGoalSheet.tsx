import { useEffect, useId, useState } from "react";
import { useKeyboardInset } from "../lib/useKeyboardInset";
import { BottomSheet } from "./BottomSheet";

interface MonthlyGoalSheetProps {
  /** Trenutni cilj; null = još nije postavljen (prazan unos). */
  initialGoal: number | null;
  /** Odbijeni promise znači "spremanje nije uspjelo" i sheet ostaje otvoren. */
  onSave: (goal: number) => Promise<void>;
  onClose: () => void;
}

const MAX_GOAL = 31;

/** Validacija na "Spremi", ne tijekom tipkanja. */
function validate(raw: string): { goal: number } | { error: string } {
  const n = raw === "" ? NaN : parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return { error: "Cilj mora biti barem 1" };
  if (n > MAX_GOAL) return { error: `Cilj može biti najviše ${MAX_GOAL}` };
  return { goal: n };
}

export function MonthlyGoalSheet({ initialGoal, onSave, onClose }: MonthlyGoalSheetProps) {
  const errorId = useId();
  const keyboardInset = useKeyboardInset();

  const [value, setValue] = useState(initialGoal === null ? "" : String(initialGoal));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Greška validacije crveni rub inputa; greška mreže ne.
  const [invalid, setInvalid] = useState(false);

  // Scroll stranice je zaključan dok je sheet otvoren — kad se otvori
  // tipkovnica, preglednik inače voli pomaknuti stranicu iza njega.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value.replace(/[^0-9]/g, "").slice(0, 2));
    setError(null);
    setInvalid(false);
  }

  async function save() {
    if (saving) return;
    const result = validate(value);
    if ("error" in result) {
      setError(result.error);
      setInvalid(true);
      return;
    }

    setSaving(true);
    setError(null);
    setInvalid(false);
    try {
      await onSave(result.goal);
    } catch {
      setError("Spremanje nije uspjelo. Pokušaj ponovno.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet ariaLabel="Mjesečni cilj" onClose={onClose} bottomInset={keyboardInset}>
      <h2 className="sheet__title">Mjesečni cilj</h2>
      <p className="sheet__sub">Koliko dolazaka mjesečno?</p>

      <input
        className={`sheet__input ${invalid ? "sheet__input--invalid" : ""}`}
        data-autofocus
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        autoComplete="off"
        placeholder="npr. 12"
        aria-label="Broj dolazaka mjesečno"
        aria-invalid={invalid || undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
      />

      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="cta" disabled={saving} onClick={() => void save()}>
        {saving ? "Spremanje…" : "Spremi"}
      </button>
    </BottomSheet>
  );
}
