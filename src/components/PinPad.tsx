import { useEffect } from "react";

interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  /** Zadnji unos nije valjao: točke se tresu i crvene. */
  failed?: boolean;
  /** Poruka greške ispod točaka; ostaje vidljiva i nakon što se točke isprazne. */
  error?: string;
  disabled?: boolean;
  onBack: () => void;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinPad({
  value,
  onChange,
  failed = false,
  error = "",
  disabled = false,
  onBack,
}: PinPadProps) {
  function press(digit: string) {
    if (disabled || value.length >= 4) return;
    // Kratka vibracija kao potvrda dodira; gdje nije podržana, tiho preskoči.
    navigator.vibrate?.(10);
    onChange(value + digit);
  }

  function erase() {
    if (disabled || value.length === 0) return;
    navigator.vibrate?.(10);
    onChange(value.slice(0, -1));
  }

  // Fizička tipkovnica (desktop): 0-9 i Backspace.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        if (value.length < 4) onChange(value + e.key);
      } else if (e.key === "Backspace") {
        onChange(value.slice(0, -1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, disabled, onChange]);

  return (
    <>
      {/* Točke zauzimaju sav preostali prostor, tipkovnica ostaje prikovana za dno. */}
      <div className="pin__area">
        <div
          className={`pin__dots ${failed ? "pin__dots--failed" : ""}`}
          role="status"
          aria-label={`Upisano ${value.length} od 4`}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`pin__dot ${i < value.length ? "pin__dot--filled" : ""}`}
            />
          ))}
        </div>
        <p className="pin__error" role="alert">
          {error}
        </p>
      </div>

      <div className="pin__pad">
        {DIGITS.map((d) => (
          <button
            key={d}
            type="button"
            className="pin__key"
            onClick={() => press(d)}
            disabled={disabled}
          >
            {d}
          </button>
        ))}

        <button type="button" className="pin__key pin__key--text" onClick={onBack}>
          Natrag
        </button>

        <button type="button" className="pin__key" onClick={() => press("0")} disabled={disabled}>
          0
        </button>

        <button
          type="button"
          className="pin__key pin__key--ghost"
          aria-label="Obriši"
          onClick={erase}
          disabled={value.length === 0}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
            <path d="M17 9.5l-5 5M12 9.5l5 5" />
          </svg>
        </button>
      </div>
    </>
  );
}
