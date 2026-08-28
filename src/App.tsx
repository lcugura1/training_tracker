import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  ApiError,
  authenticate,
  clearSession,
  loadSession,
  markTraining,
  saveSession,
  type Profile,
  type Session,
} from "./lib/api";
import {
  MONTH_LABELS,
  countInMonth,
  currentStreak,
  formatLong,
  formatShort,
  greeting,
  isAfterShameHour,
  longestStreak,
  timeHHMM,
  todayKey,
} from "./lib/dates";
import { randomHypeMessage, shameMessageFor } from "./lib/messages";
import { randomHypeMedia, type HypeMedia } from "./lib/hype";
import { TRAINING_META, typesLabel, type TrainingType } from "./lib/trainings";
import { Background } from "./components/Background";
import { Login } from "./components/Login";
import { Calendar } from "./components/Calendar";
import { Stats } from "./components/Stats";
import { ShameBanner } from "./components/ShameBanner";
import { TrainingSheet } from "./components/TrainingSheet";
import { HypeOverlay } from "./components/HypeOverlay";

/** Backend normalizira ime u mala slova; za prikaz vraćamo veliko početno. */
function displayName(username: string): string {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

interface HypeState {
  emojis: string[];
  typeLabel: string;
  message: string;
  media: HypeMedia | null;
  streak: number;
  isRecord: boolean;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Ako sesije nema, nema se što ni vraćati — krećemo odmah na prijavu.
  const [restoring, setRestoring] = useState(() => loadSession() !== null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hype, setHype] = useState<HypeState | null>(null);

  // Sat koji tjera ponovni render kad prijeđe 20:00 i osvježava prikazano
  // vrijeme u poruci srama, bez da korisnik refresha.
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  /* Vraćanje sesije iz localStorage pri otvaranju aplikacije. */
  useEffect(() => {
    const stored = loadSession();
    if (!stored) return;

    authenticate(stored.username, stored.pin)
      .then(({ profile: p }) => {
        setSession(stored);
        setProfile(p);
      })
      .catch(() => {
        // PIN više ne valja ili profil ne postoji — natrag na prijavu.
        clearSession();
      })
      .finally(() => setRestoring(false));
  }, []);

  const handleLogin = useCallback((newSession: Session, newProfile: Profile) => {
    saveSession(newSession);
    setSession(newSession);
    setProfile(newProfile);
  }, []);

  function logout() {
    clearSession();
    setSession(null);
    setProfile(null);
  }

  async function saveTraining(types: TrainingType[]) {
    if (!session || !profile) return;
    setSaving(true);
    setSaveError("");

    // Rekord se mjeri prema stanju PRIJE spremanja — inače bi današnji dan
    // uvijek bio dio najduljeg niza i svaki trening bi bio "novi rekord".
    const previousBest = longestStreak(profile.entries);

    try {
      const updated = await markTraining(session.username, session.pin, todayKey(), types);
      const streak = currentStreak(updated.entries);

      setProfile(updated);
      setSheetOpen(false);
      setHype({
        emojis: types.map((t) => TRAINING_META[t].emoji),
        typeLabel: typesLabel(types),
        message: randomHypeMessage(),
        media: randomHypeMedia(),
        streak,
        isRecord: streak > previousBest,
      });
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Nešto je puklo.");
    } finally {
      setSaving(false);
    }
  }

  if (restoring) {
    return (
      <>
        <Background />
        <main className="app" />
      </>
    );
  }

  if (!session || !profile) {
    return (
      <>
        <Background />
        <main className="app">
          <Login onSuccess={handleLogin} />
        </main>
      </>
    );
  }

  const now = new Date();
  const today = todayKey();
  const todayTypes = profile.entries[today];
  const showShame = !todayTypes && isAfterShameHour(now);
  const dateLabel = formatLong(now);

  return (
    <>
      <Background />

      <main className="app">
        <div className={`app__inner app__content ${sheetOpen ? "app__content--dimmed" : ""}`}>
          <header className="header">
            <div className="header__text">
              <h1 className="header__greeting">
                {greeting(now)}, {displayName(profile.username)}
              </h1>
              <p className="header__date">{dateLabel}</p>
            </div>
            <button type="button" className="glass--thin pill" onClick={logout}>
              Odjava
            </button>
          </header>

          <Stats
            streak={currentStreak(profile.entries)}
            monthCount={countInMonth(profile.entries, now.getFullYear(), now.getMonth())}
            monthLabel={MONTH_LABELS[now.getMonth()]}
          />

          {showShame && (
            <ShameBanner time={timeHHMM(now)} message={shameMessageFor(today)} />
          )}

          <Calendar entries={profile.entries} onSelectToday={() => setSheetOpen(true)} />

          <button
            type="button"
            className={`cta ${todayTypes ? "" : "cta--pulse"}`}
            onClick={() => setSheetOpen(true)}
          >
            {todayTypes ? "Promijeni današnji trening" : "Označi današnji trening"}
          </button>
        </div>
      </main>

      <AnimatePresence>
        {sheetOpen && (
          <TrainingSheet
            key="sheet"
            dateLabel={dateLabel}
            initialTypes={todayTypes}
            busy={saving}
            error={saveError}
            onSave={saveTraining}
            onClose={() => {
              setSaveError("");
              setSheetOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hype && (
          <HypeOverlay
            key="hype"
            emojis={hype.emojis}
            typeLabel={hype.typeLabel}
            dateLabel={formatShort(now)}
            message={hype.message}
            media={hype.media}
            streak={hype.streak}
            isRecord={hype.isRecord}
            onDismiss={() => setHype(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
