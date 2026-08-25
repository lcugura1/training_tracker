import { useState } from "react";
import { DAY_LABELS, MONTH_LABELS, monthGrid, toKey, todayKey } from "../lib/dates";
import { TRAINING_META, type TrainingType } from "../lib/trainings";

interface CalendarProps {
  entries: Record<string, TrainingType>;
  onSelectToday: () => void;
}

export function Calendar({ entries, onSelectToday }: CalendarProps) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const today = todayKey();
  const cells = monthGrid(view.year, view.month);

  // Ne dopuštamo listanje u budućnost — tamo po definiciji nema ničega.
  const isCurrentMonth =
    view.year === now.getFullYear() && view.month === now.getMonth();

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <section className="glass cal">
      <div className="cal__head">
        <button
          type="button"
          className="btn btn--ghost"
          style={{ minHeight: 32, padding: "0 var(--space-3)" }}
          onClick={() => shift(-1)}
          aria-label="Prethodni mjesec"
        >
          ←
        </button>

        <h2 className="cal__month">
          {MONTH_LABELS[view.month]} <span className="cal__year">{view.year}</span>
        </h2>

        <button
          type="button"
          className="btn btn--ghost"
          style={{ minHeight: 32, padding: "0 var(--space-3)" }}
          onClick={() => shift(1)}
          disabled={isCurrentMonth}
          aria-label="Sljedeći mjesec"
        >
          →
        </button>
      </div>

      <div className="cal__weekdays" aria-hidden="true">
        {DAY_LABELS.map((d) => (
          <span key={d} className="cal__weekday">{d}</span>
        ))}
      </div>

      <div className="cal__grid">
        {cells.map((date, i) => {
          if (!date) {
            return <span key={`empty-${i}`} className="cal__cell cal__cell--empty" />;
          }

          const key = toKey(date);
          const type = entries[key];
          const meta = type ? TRAINING_META[type] : null;
          const isToday = key === today;
          const isFuture = key > today;

          const classes = [
            "cal__cell",
            meta ? "cal__cell--done" : "",
            isToday ? "cal__cell--today" : "",
            isFuture ? "cal__cell--future" : "",
            !meta && !isToday && !isFuture ? "cal__cell--past" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const label = meta
            ? `${date.getDate()}. ${MONTH_LABELS[view.month]} — ${meta.label}`
            : `${date.getDate()}. ${MONTH_LABELS[view.month]}${isToday ? " — danas, označi trening" : ""}`;

          const content = meta ? (
            <>
              <span className="cal__daynum">{date.getDate()}</span>
              <span className="cal__emoji">{meta.emoji}</span>
            </>
          ) : (
            date.getDate()
          );

          // Samo današnji dan je gumb; ostalo je statični prikaz.
          return isToday ? (
            <button
              key={key}
              type="button"
              className={classes}
              style={meta ? ({ "--cell-color": meta.color } as React.CSSProperties) : undefined}
              onClick={onSelectToday}
              aria-label={label}
            >
              {content}
            </button>
          ) : (
            <span
              key={key}
              className={classes}
              style={meta ? ({ "--cell-color": meta.color } as React.CSSProperties) : undefined}
              aria-label={label}
              role="img"
            >
              {content}
            </span>
          );
        })}
      </div>

      <p className="cal__hint">
        {isCurrentMonth
          ? "Označiti možeš samo današnji dan."
          : "Prošli mjesec — samo pregled."}
      </p>
    </section>
  );
}
