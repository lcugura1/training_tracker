import { useEffect, useState } from "react";
import { randomShameMessage, rememberShameMessage } from "../lib/messages";

interface ShameBannerProps {
  time: string;
}

export function ShameBanner({ time }: ShameBannerProps) {
  // Poruka se bira jednom kad se banner pojavi. App se renderira svakih 30 s,
  // pa bi odabir u renderu mijenjao tekst pred očima.
  const [message] = useState(randomShameMessage);

  useEffect(() => rememberShameMessage(message), [message]);

  return (
    <div className="shame">
      <time className="shame__time tnum" dateTime={time}>
        <span className="shame__dot" aria-hidden="true" />
        {time}
      </time>
      <p className="shame__text">{message}</p>
    </div>
  );
}
