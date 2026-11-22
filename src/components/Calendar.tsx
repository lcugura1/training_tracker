import { useState } from "react";
import {
  DAY_LABELS,
  EDIT_WINDOW_MONTHS,
  MONTH_LABELS,
  earliestEditableKey,
  formatShort,
  isEditableKey,
  monthGrid,
  toKey,
  todayKey,
} from "../lib/dates";
import { TRAINING_META, TRAINING_TYPES, type TrainingType } from "../lib/trainings";

interface CalendarProps {
  entries: Record<string, TrainingType[]>;
  /** Poziva se za dan koji se smije označiti: danas ili do tri mjeseca unatrag. */
  onSelectDay: (key: string) => void;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function Calendar({ entries, onSelectDay }: CalendarProps) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const today = todayKey();
  const cells = monthGrid(view.year, view.month);

  const viewIndex = view.year * 12 + view.month;
  const currentIndex = now.getFullYear() * 12 + now.getMonth();

  // Unatrag se lista do mjeseca najstarijeg unosa ili granice za uređivanje,
  // što god je ranije — dalje nema što pokazati.
  const earliestKey = [earliestEditableKey(now), ...Object.keys(entries)].sort()[0];
  const earliestIndex =
    Number(earliestKey.slice(0, 4)) * 12 + Number(earliestKey.slice(5, 7)) - 1;

  const canGoBack = viewIndex > earliestIndex;
  const canGoForward = viewIndex < currentIndex;

  const hasEditableDay = cells.some((d) => d && isEditableKey(toKey(d), now));

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <section className="card card--light cal" aria-label="Kalendar">
      <div className="cal__head">
        <button
          type="button"
          className="cal__nav"
          onClick={() => shift(-1)}
          disabled={!canGoBack}
          aria-label="Prethodni mjesec"
        >
          <Chevron direction="left" />
        </button>

        <h2 className="cal__month">
          {MONTH_LABELS[view.month]} {view.year}
        </h2>

        <button
          type="button"
          className="cal__nav"
          onClick={() => shift(1)}
          disabled={!canGoForward}
          aria-label="Sljedeći mjesec"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <div className="cal__body">
        <div className="cal__weekdays" aria-hidden="true">
          {DAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="cal__grid">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="cal__empty" />;

            const key = toKey(date);
            const types = entries[key] ?? [];
            const done = types.length > 0;
            const isToday = key === today;
            const editable = isEditableKey(key, now);
            // Prošlost izvan prozora: dizajn ne poznaje to stanje, a bez znaka
            // se u najstarijem mjesecu ne vidi gdje točno prestaje unos.
            // Budući dani ostaju nepriguženi, kako spec traži.
            const locked = !editable && key < today;

            const classes = [
              "day",
              done ? "day--done" : "",
              isToday ? "day--today" : "",
              editable ? "day--editable" : "",
              locked && !done ? "day--locked" : "",
            ]
              .filter(Boolean)
              .join(" ");

            // Dan s treningom pokazuje emoji tipa umjesto broja; datum kažu
            // položaj u mreži i aria-label. Dva tipa stanu samo smanjena.
            const content = done ? (
              <span className={`day__emojis ${types.length > 1 ? "day__emojis--duo" : ""}`}>
                {types.map((t) => (
                  <span key={t}>{TRAINING_META[t].emoji}</span>
                ))}
              </span>
            ) : (
              date.getDate()
            );

            const dayLabel = `${formatShort(date)}${
              done ? `, ${types.map((t) => TRAINING_META[t].label).join(" + ")}` : ""
            }`;

            // Dani izvan prozora (stariji od granice i budući) ostaju običan prikaz.
            return editable ? (
              <button
                key={key}
                type="button"
                className={classes}
                onClick={() => onSelectDay(key)}
                aria-label={done ? dayLabel : `${dayLabel}, označi trening`}
                aria-current={isToday ? "date" : undefined}
              >
                {content}
              </button>
            ) : (
              <div
                key={key}
                className={classes}
                role={done ? "img" : undefined}
                aria-label={done ? dayLabel : undefined}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <ul className="legend">
        {TRAINING_TYPES.map((type) => (
          <li key={type} className="legend__item">
            <span className="legend__emoji" aria-hidden="true">
              {TRAINING_META[type].emoji}
            </span>
            {TRAINING_META[type].label}
          </li>
        ))}
        <li className="legend__item">
          <span className="legend__swatch legend__swatch--today" />
          Danas
        </li>
      </ul>

      <p className="cal__hint">
        {hasEditableDay
          ? `Dodirni dan za unos ili promjenu — do ${EDIT_WINDOW_MONTHS} mjeseca unatrag.`
          : `Stariji od ${EDIT_WINDOW_MONTHS} mjeseca — samo pregled.`}
      </p>
    </section>
  );
}
