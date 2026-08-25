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
import { formatLong, currentStreak, countInMonth, isAfterShameHour, todayKey } from "./lib/dates";
import { randomHypeMessage, shameMessageFor } from "./lib/messages";
import { randomHypeMedia, type HypeMedia } from "./lib/hype";
import { TRAINING_META, type TrainingType } from "./lib/trainings";
import { Aurora } from "./components/Aurora";
import { Login } from "./components/Login";
import { Calendar } from "./components/Calendar";
import { Stats } from "./components/Stats";
import { ShameBanner } from "./components/ShameBanner";
import { TrainingSheet } from "./components/TrainingSheet";
import { HypeOverlay } from "./components/HypeOverlay";

interface HypeState {
  message: string;
  emoji: string;
  media: HypeMedia | null;
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

  // Sat koji tjera ponovni render kad prijeđe 20:00, bez da korisnik refresha.
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
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

  const handleLogin = useCallback(
    (newSession: Session, newProfile: Profile) => {
      saveSession(newSession);
      setSession(newSession);
      setProfile(newProfile);
    },
    [],
  );

  function logout() {
    clearSession();
    setSession(null);
    setProfile(null);
  }

  async function saveTraining(type: TrainingType) {
    if (!session) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await markTraining(session.username, session.pin, todayKey(), type);
      setProfile(updated);
      setSheetOpen(false);
      setHype({
        message: randomHypeMessage(),
        emoji: TRAINING_META[type].emoji,
        media: randomHypeMedia(),
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
        <Aurora />
        <main className="app" />
      </>
    );
  }

  if (!session || !profile) {
    return (
      <>
        <Aurora />
        <main className="app">
          <Login onSuccess={handleLogin} />
        </main>
      </>
    );
  }

  const today = todayKey();
  const now = new Date();
  const todayType = profile.entries[today];
  const showShame = !todayType && isAfterShameHour(now);

  return (
    <>
      <Aurora />

      <main className="app">
        <div className="app__inner">
          <header className="header">
            <div>
              <h1 className="title-md">{profile.username}</h1>
              <p className="subtle">{formatLong(now)}</p>
            </div>
            <button type="button" className="btn btn--ghost" onClick={logout}>
              Odjava
            </button>
          </header>

          <Stats
            streak={currentStreak(profile.entries)}
            monthCount={countInMonth(profile.entries, now.getFullYear(), now.getMonth())}
          />

          {showShame && <ShameBanner message={shameMessageFor(today)} />}

          <Calendar entries={profile.entries} onSelectToday={() => setSheetOpen(true)} />

          {!todayType && !showShame && (
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: "100%" }}
              onClick={() => setSheetOpen(true)}
            >
              Označi današnji trening
            </button>
          )}
        </div>
      </main>

      <AnimatePresence>
        {sheetOpen && (
          <TrainingSheet
            key="sheet"
            dateLabel={formatLong(now)}
            initialType={todayType}
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
            message={hype.message}
            emoji={hype.emoji}
            media={hype.media}
            onDismiss={() => setHype(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
