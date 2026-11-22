interface StatsProps {
  /** Treninzi u tekućem mjesecu. */
  monthDone: number;
  /** Mjesečni cilj; null = nije postavljen (prikaže se samo broj i pun prsten). */
  monthLimit: number | null;
  /** Tap na karticu otvara modal za postavljanje cilja. */
  onOpenGoal: () => void;
  total: number;
  /** Kumulativno po tjednu, zadnjih 7 točaka. */
  weeklyCumulative: number[];
}

const RING_R = 55;
const RING_C = 2 * Math.PI * RING_R;

/** Raspon sparklinea: vrh 6px od ruba, dno 6px iznad ruba (visina je 52). */
const SPARK_H = 52;
const SPARK_TOP = 6;
const SPARK_BOTTOM = 46;

function sparkPoints(values: number[]): { x: number; y: number }[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const last = Math.max(values.length - 1, 1);

  return values.map((v, i) => ({
    x: (i / last) * 100,
    // Bez raspona (svi isti) linija leži na dnu umjesto da dijeli s nulom.
    y: span === 0 ? SPARK_BOTTOM : SPARK_BOTTOM - ((v - min) / span) * (SPARK_BOTTOM - SPARK_TOP),
  }));
}

export function Stats({ monthDone, monthLimit, onOpenGoal, total, weeklyCumulative }: StatsProps) {
  const progress =
    monthLimit === null || monthLimit <= 0 ? 1 : Math.min(1, monthDone / monthLimit);

  const points = sparkPoints(weeklyCumulative);
  const line = points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ");
  const lastPoint = points[points.length - 1];

  return (
    <div className="stats">
      {/* Cijela kartica je okidač. Unutar gumba djeca su za čitače zaslona
          dekorativna, pa stanje prstena nosi aria-label na samom gumbu. */}
      <button
        type="button"
        className="card stats__card stats__card--ring"
        aria-haspopup="dialog"
        aria-label={`Treninzi ovaj mjesec: ${monthDone}${
          monthLimit === null ? "" : ` od ${monthLimit}`
        }. Postavi mjesečni cilj`}
        onClick={onOpenGoal}
      >
        <div className="ring" aria-hidden="true">
          <svg className="ring__svg" width="120" height="120">
            <circle className="ring__track" cx="60" cy="60" r={RING_R} />
            <circle
              className="ring__bar"
              cx="60"
              cy="60"
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
            />
          </svg>
          <div className="ring__value">
            <span className="ring__done tnum">{monthDone}</span>
            {monthLimit !== null && <span className="ring__limit tnum">/{monthLimit}</span>}
          </div>
        </div>
        <div className="stats__label">Ovaj mjesec</div>
      </button>

      <section className="card stats__card stats__card--total" aria-label="Ukupno">
        <div className="stats__total">
          <div className="total__value tnum">{total}</div>
          <div className="stats__label">Ukupno</div>
        </div>

        <div className="spark" aria-hidden="true">
          <div className="spark__plot">
            <svg
              className="spark__svg"
              viewBox={`0 0 100 ${SPARK_H}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" className="spark__stop spark__stop--top" />
                  <stop offset="1" className="spark__stop spark__stop--bottom" />
                </linearGradient>
              </defs>
              <path d={`M 0 ${SPARK_H} L ${line} L 100 ${SPARK_H} Z`} fill="url(#trend-fill)" />
              <path className="spark__line" d={`M ${line}`} />
            </svg>
            {/* Točka je zasebni element: viewBox s preserveAspectRatio="none" bi je razvukao u elipsu. */}
            <span className="spark__dot" style={{ top: lastPoint.y - 3 }} />
          </div>
        </div>
      </section>
    </div>
  );
}
