interface StatsProps {
  streak: number;
  monthCount: number;
  monthLabel: string;
}

export function Stats({ streak, monthCount, monthLabel }: StatsProps) {
  return (
    <section className="glass stats">
      <div className="stats__sheen" aria-hidden="true" />

      <div className="stat">
        <span className="stat__value stat__value--accent tnum">{streak}</span>
        <span className="stat__label">Dana u nizu</span>
      </div>

      <div className="stats__divider" aria-hidden="true" />

      <div className="stat">
        <span className="stat__value tnum">{monthCount}</span>
        <span className="stat__label">{monthLabel}</span>
      </div>
    </section>
  );
}
