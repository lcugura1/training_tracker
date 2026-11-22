import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { tagBreakdown, trainingsWord } from "../lib/stats";
import { TRAINING_META, type TrainingType } from "../lib/trainings";

interface TagBreakdownProps {
  entries: Record<string, TrainingType[]>;
}

/* Geometrija iz SPEC.md: središte (120,120), prsten 76–104, odabrani iskače +10. */
const C = 120;
const INNER = 76;
const OUTER = 104;
const POP = 10;
/** Razmak između segmenata u stupnjevima — po pola sa svake strane luka. */
const GAP = 2.5;

/**
 * Koordinate se zaokružuju jer Motion interpolira `d` kao niz brojeva, a
 * Math.cos(±90°) vraća zapise poput 6.1e-15 koje ne zna pročitati.
 */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function polar(angle: number, radius: number): [number, number] {
  const t = ((angle - 90) * Math.PI) / 180;
  return [r3(C + radius * Math.cos(t)), r3(C + radius * Math.sin(t))];
}

function segmentPath(start: number, end: number, outer: number): string {
  // Vrlo uski luk ne smije ostati s negativnom širinom zbog razmaka.
  const gap = Math.min(GAP, (end - start) / 2);
  const a0 = start + gap / 2;
  const a1 = end - gap / 2;
  const large = a1 - a0 > 180 ? 1 : 0;

  const [ox0, oy0] = polar(a0, outer);
  const [ox1, oy1] = polar(a1, outer);
  const [ix1, iy1] = polar(a1, INNER);
  const [ix0, iy0] = polar(a0, INNER);

  return `M ${ox0} ${oy0} A ${outer} ${outer} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 0 ${ix0} ${iy0} Z`;
}

/** Puni prsten (jedna oznaka ili prazno stanje): dva luka od 180° po rubu. */
function ringPath(outer: number): string {
  return [
    `M ${C - outer} ${C} A ${outer} ${outer} 0 1 1 ${C + outer} ${C} A ${outer} ${outer} 0 1 1 ${C - outer} ${C} Z`,
    `M ${C - INNER} ${C} A ${INNER} ${INNER} 0 1 0 ${C + INNER} ${C} A ${INNER} ${INNER} 0 1 0 ${C - INNER} ${C} Z`,
  ].join(" ");
}

export function TagBreakdown({ entries }: TagBreakdownProps) {
  const shares = tagBreakdown(entries);
  const reduceMotion = useReducedMotion();
  const [picked, setPicked] = useState<TrainingType | null>(null);

  // Odabir koji je nestao iz podataka (nema ga više) pada natrag na najčešći.
  const selected = shares.find((s) => s.type === picked) ?? shares[0];
  const transition = { duration: reduceMotion ? 0 : 0.2, ease: "easeOut" as const };

  let cursor = 0;
  const segments = shares.map((s) => {
    const start = cursor;
    const end = cursor + s.share * 360;
    cursor = end;

    const isSelected = s === selected;
    const outer = isSelected ? OUTER + POP : OUTER;
    return {
      ...s,
      isSelected,
      d: shares.length === 1 ? ringPath(outer) : segmentPath(start, end, outer),
    };
  });

  return (
    <section className="card card--surface breakdown" aria-label="Najčešći treninzi">
      <h2 className="breakdown__title">Najčešći treninzi</h2>

      <div className="donut">
        <svg className="donut__svg" width="240" height="240" aria-hidden="true">
          {selected ? (
            segments.map((s) => (
              <motion.path
                key={s.type}
                className="donut__segment"
                fillRule="evenodd"
                fill={TRAINING_META[s.type].color}
                initial={false}
                animate={{ d: s.d, opacity: s.isSelected ? 1 : 0.4 }}
                transition={transition}
                onClick={() => setPicked(s.type)}
              />
            ))
          ) : (
            <path className="donut__empty" fillRule="evenodd" d={ringPath(OUTER)} />
          )}
        </svg>

        <div className="donut__center">
          {selected ? (
            <>
              <div
                className="donut__name"
                style={{ color: TRAINING_META[selected.type].color }}
              >
                {TRAINING_META[selected.type].label}
              </div>
              <div className="donut__value tnum">{selected.count}</div>
              <div className="donut__unit">{trainingsWord(selected.count)}</div>
            </>
          ) : (
            <>
              <div className="donut__value tnum">0</div>
              <div className="donut__unit">Nema treninga</div>
            </>
          )}
        </div>
      </div>

      {shares.length > 0 && (
        <div className="chips">
          {shares.map((s) => {
            const meta = TRAINING_META[s.type];
            const isSelected = s === selected;
            return (
              <button
                key={s.type}
                type="button"
                className={`chip ${isSelected ? "chip--selected" : ""}`}
                style={{ "--tag": meta.color } as CSSProperties}
                aria-pressed={isSelected}
                onClick={() => setPicked(s.type)}
              >
                <span className="chip__dot" />
                <span className="chip__name">{meta.label}</span>
                <span className="chip__count tnum">{s.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
