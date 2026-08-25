interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinPad({ value, onChange, disabled = false }: PinPadProps) {
  function press(key: string) {
    if (disabled) return;
    if (key === "⌫") {
      onChange(value.slice(0, -1));
    } else if (key !== "" && value.length < 4) {
      onChange(value + key);
    }
  }

  return (
    <div>
      <div className="pin__dots" role="status" aria-label={`Uneseno ${value.length} od 4 znamenke`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`pin__dot ${i < value.length ? "pin__dot--filled" : ""}`}
          />
        ))}
      </div>

      <div className="pin__pad">
        {KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} className="pin__key pin__key--blank" aria-hidden="true" />
          ) : (
            <button
              key={i}
              type="button"
              className="pin__key"
              onClick={() => press(key)}
              disabled={disabled || (key === "⌫" && value.length === 0)}
              aria-label={key === "⌫" ? "Obriši znamenku" : key}
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
