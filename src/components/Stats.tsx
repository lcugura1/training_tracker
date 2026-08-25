interface StatsProps {
  streak: number;
  monthCount: number;
}

/** Hrvatska množina: 1 dan, 2-4 dana, 5+ dana. */
function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "dan";
  return "dana";
}

function trainingWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "trening";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "treninga";
  return "treninga";
}

export function Stats({ streak, monthCount }: StatsProps) {
  return (
    <section className="stats">
      <div className="glass stat">
        <span className="stat__value">
          {streak > 0 ? "🔥" : "💤"} {streak}
        </span>
        <span className="stat__label">
          {dayWord(streak)} u nizu
        </span>
      </div>

      <div className="glass stat">
        <span className="stat__value">{monthCount}</span>
        <span className="stat__label">
          {trainingWord(monthCount)} ovaj mjesec
        </span>
      </div>
    </section>
  );
}
