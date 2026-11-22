import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  ApiError,
  authenticate,
  clearSession,
  loadSession,
  markTraining,
  saveSession,
  setMonthlyGoal,
  type Profile,
  type Session,
} from "./lib/api";
import {
  countInMonth,
  currentStreak,
  formatLong,
  formatShort,
  greeting,
  isAfterShameHour,
  longestStreak,
  parseKey,
  timeHHMM,
  todayKey,
} from "./lib/dates";
import { totalTrainingDays, weeklyCumulative } from "./lib/stats";
import { randomHypeMessage } from "./lib/messages";
import { randomHypeMedia, type HypeMedia } from "./lib/hype";
import { TRAINING_META, typesLabel, type TrainingType } from "./lib/trainings";
import { Login } from "./components/Login";
import { Calendar } from "./components/Calendar";
import { Stats } from "./components/Stats";
import { TagBreakdown } from "./components/TagBreakdown";
import { ShameBanner } from "./components/ShameBanner";
import { TrainingSheet } from "./components/TrainingSheet";
import { MonthlyGoalSheet } from "./components/MonthlyGoalSheet";
import { useHistoryModal } from "./lib/useHistoryModal";
import { HypeOverlay } from "./components/HypeOverlay";

/** Backend normalizira ime u mala slova; za prikaz vraćamo veliko početno. */
function displayName(username: string): string {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

interface HypeState {
  emojis: string[];
  typeLabel: string;
  dateLabel: string;
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

  // Dan za koji je otvoren odabir treninga (YYYY-MM-DD). Danas ili do tri mjeseca unatrag.
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hype, setHype] = useState<HypeState | null>(null);
  const goalModal = useHistoryModal();

  // Sat koji tjera ponovni render: osvježava prikazano vrijeme u poruci srama
  // i hvata ponoć (novi dan bez treninga), bez da korisnik refresha.
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

  async function saveGoal(goal: number) {
    if (!session) return;
    // Greška se propušta modalu, koji je prikaže ispod inputa i ostane otvoren.
    const updated = await setMonthlyGoal(session.username, session.pin, goal);
    setProfile(updated);
    goalModal.hide();
  }

  async function saveTraining(types: TrainingType[]) {
    if (!session || !profile || !sheetDate) return;
    const date = sheetDate;
    setSaving(true);
    setSaveError("");

    // Rekord se mjeri prema stanju PRIJE spremanja — inače bi današnji dan
    // uvijek bio dio najduljeg niza i svaki trening bi bio "novi rekord".
    const previousBest = longestStreak(profile.entries);

    try {
      const updated = await markTraining(session.username, session.pin, date, types);
      const streak = currentStreak(updated.entries);

      setProfile(updated);
      setSheetDate(null);
      setHype({
        emojis: types.map((t) => TRAINING_META[t].emoji),
        typeLabel: typesLabel(types),
        dateLabel: formatShort(parseKey(date)),
        message: randomHypeMessage(),
        media: randomHypeMedia(),
        streak,
        // Naknadni unos može spojiti dva niza daleko iza nas, pa se rekord
        // mjeri najduljim nizom, ne onim koji završava danas.
        isRecord: longestStreak(updated.entries) > previousBest,
      });
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Nešto je puklo.");
    } finally {
      setSaving(false);
    }
  }

  if (restoring) {
    return (
      <main className="app">
        <div className="app__inner">
          <h1 className="head__title">Evidencija</h1>
          <p className="status">Učitavanje…</p>
        </div>
      </main>
    );
  }

  if (!session || !profile) {
    return <Login onSuccess={handleLogin} />;
  }

  const now = new Date();
  const today = todayKey();
  const todayTypes = profile.entries[today];
  const showShame = !todayTypes && isAfterShameHour(now);

  return (
    <>
      <main className="app">
        <div className="app__inner">
          <header className="head">
            <div className="head__row">
              <h1 className="head__title">Evidencija</h1>
              <button type="button" className="head__logout" onClick={logout}>
                Odjava
              </button>
            </div>
            <p className="head__sub">
              {greeting(now)}, {displayName(profile.username)} · {formatLong(now)}
            </p>
          </header>

          {showShame && <ShameBanner time={timeHHMM(now)} />}

          <button
            type="button"
            className={`cta ${todayTypes ? "cta--quiet" : ""}`}
            onClick={() => setSheetDate(today)}
          >
            {todayTypes ? "Promijeni današnji trening" : "Označi današnji trening"}
          </button>

          <Stats
            monthDone={countInMonth(profile.entries, now.getFullYear(), now.getMonth())}
            monthLimit={profile.monthlyGoal}
            onOpenGoal={goalModal.show}
            total={totalTrainingDays(profile.entries)}
            weeklyCumulative={weeklyCumulative(profile.entries, now)}
          />

          <Calendar entries={profile.entries} onSelectDay={setSheetDate} />

          <TagBreakdown entries={profile.entries} />
        </div>
      </main>

      <AnimatePresence>
        {sheetDate && (
          <TrainingSheet
            // Ključ po datumu: ako se sheet otvori dok prethodni još izlazi,
            // mora nastati nov, a ne naslijediti stari odabir.
            key={`sheet-${sheetDate}`}
            dateLabel={formatLong(parseKey(sheetDate))}
            isToday={sheetDate === today}
            initialTypes={profile.entries[sheetDate]}
            busy={saving}
            error={saveError}
            onSave={saveTraining}
            onClose={() => {
              setSaveError("");
              setSheetDate(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {goalModal.open && (
          <MonthlyGoalSheet
            key="goal"
            initialGoal={profile.monthlyGoal}
            onSave={saveGoal}
            onClose={goalModal.hide}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hype && (
          <HypeOverlay
            key="hype"
            emojis={hype.emojis}
            typeLabel={hype.typeLabel}
            dateLabel={hype.dateLabel}
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
