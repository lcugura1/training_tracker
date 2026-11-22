import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ApiError, authenticate, checkUsername, type Profile, type Session } from "../lib/api";
import { PinPad } from "./PinPad";

type Step = "username" | "pin" | "confirm";

interface LoginProps {
  onSuccess: (session: Session, profile: Profile, created: boolean) => void;
}

const transition = { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const };

/** Koliko dugo točke ostaju crvene nakon krivog unosa, prije nego se isprazne. */
const FAIL_RESET_MS = 400;

/** Dopuštena su samo slova (uključujući č ć đ š ž); sve ostalo se briše pri tipkanju. */
const sanitize = (raw: string) => raw.toLowerCase().replace(/[^a-zčćđšž]/g, "");

function StepMarker({ step }: { step: 1 | 2 }) {
  return (
    <div className="auth__marker" aria-label={`Korak ${step} od 2`}>
      <span className="auth__marker-now">{step}</span>
      <span className="auth__marker-total">/2</span>
    </div>
  );
}

export function Login({ onSuccess }: LoginProps) {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [exists, setExists] = useState(false);
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Guard protiv dvostrukog slanja: efekt se okine na svaku promjenu pin-a.
  const submitting = useRef(false);
  const failTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(failTimer.current), []);

  async function submitUsername(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("Korisničko ime mora imati barem 3 znaka.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      setExists(await checkUsername(trimmed));
      setStep("pin");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nešto je puklo.");
    } finally {
      setBusy(false);
    }
  }

  /** Krivi unos: točke se tresu i crvene, pa se isprazne, a poruka ostaje. */
  function fail(message: string) {
    setError(message);
    setFailed(true);
    failTimer.current = window.setTimeout(() => {
      setPin("");
      setFirstPin("");
      setStep("pin");
      setFailed(false);
    }, FAIL_RESET_MS);
  }

  async function finish(finalPin: string) {
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const { profile, created } = await authenticate(username.trim(), finalPin);
      onSuccess({ username: username.trim(), pin: finalPin }, profile, created);
    } catch (e) {
      fail(e instanceof ApiError ? e.message : "Nešto je puklo.");
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  // PIN se šalje sam čim su unesene 4 znamenke — nema gumba "potvrdi".
  useEffect(() => {
    if (pin.length !== 4 || submitting.current || failed) return;

    if (step === "pin") {
      if (exists) {
        void finish(pin);
      } else {
        // Novi profil: traži potvrdu da tipfeler ne postane trajni PIN.
        setFirstPin(pin);
        setPin("");
        setStep("confirm");
      }
    } else if (step === "confirm") {
      if (pin === firstPin) {
        void finish(pin);
      } else {
        fail("PIN-ovi se ne poklapaju. Probaj ponovno.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function handlePin(next: string) {
    // Poruka o prošlom pokušaju miče se čim kreneš tipkati novi.
    if (error && !failed) setError("");
    setPin(next);
  }

  function back() {
    if (failed) return;
    setError("");
    setPin("");
    setFirstPin("");
    setStep(step === "confirm" ? "pin" : "username");
  }

  const pinTitle = step === "confirm" ? "Ponovi PIN" : exists ? "Upiši PIN" : "Postavi PIN";
  const pinSub =
    step === "confirm" ? (
      "Još jednom, da budemo sigurni."
    ) : exists ? (
      <>
        Bok, <b>{username.trim()}</b>
      </>
    ) : (
      "Četiri brojke. Zapamti ih."
    );

  return (
    <main className="auth">
      <AnimatePresence mode="wait" initial={false}>
        {step === "username" ? (
          <motion.form
            key="username"
            className="auth__step"
            onSubmit={submitUsername}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <StepMarker step={1} />

            <h1 className="auth__title">
              Dobrodošao
              <br />
              majstorčino
            </h1>
            <p className="auth__tagline">Evidencija koja te ne mazi.</p>

            <h2 className="auth__ask">Tko si ti?</h2>

            <div className="auth__field">
              {/* Nativni ::placeholder ne zna dvije boje, pa se format crta ispod inputa. */}
              {username === "" && (
                <div className="auth__ghost" aria-hidden="true">
                  <span className="auth__ghost-first">ime</span>
                  <span className="auth__ghost-last">prezime</span>
                </div>
              )}
              <input
                className="auth__input"
                value={username}
                onChange={(e) => {
                  setUsername(sanitize(e.target.value));
                  setError("");
                }}
                aria-label="Korisničko ime u formatu imeprezime"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={20}
                disabled={busy}
                autoFocus
              />
            </div>

            <p className="auth__help">
              Sve spojeno, malim slovima · npr. <b>leoncugura</b>
            </p>

            <p className="auth__error" role="alert">
              {error}
            </p>

            <div className="auth__spacer" />

            <button type="submit" className="cta" disabled={busy || username === ""}>
              {busy ? "Provjeravam…" : "Dalje"}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="pin"
            className="auth__step"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <StepMarker step={2} />

            <h1 className="auth__title auth__title--pin">{pinTitle}</h1>
            <p className="auth__sub">{pinSub}</p>

            <PinPad
              value={pin}
              onChange={handlePin}
              failed={failed}
              error={error}
              disabled={busy || failed}
              onBack={back}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
