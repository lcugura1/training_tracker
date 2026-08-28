import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ApiError, authenticate, checkUsername, type Profile, type Session } from "../lib/api";
import { PinPad } from "./PinPad";

type Step = "username" | "pin" | "confirm";

interface LoginProps {
  onSuccess: (session: Session, profile: Profile, created: boolean) => void;
}

const transition = { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const };

export function Login({ onSuccess }: LoginProps) {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [exists, setExists] = useState(false);
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Guard protiv dvostrukog slanja: efekt se okine na svaku promjenu pin-a.
  const submitting = useRef(false);

  async function submitUsername(event: React.FormEvent) {
    event.preventDefault();
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

  async function finish(finalPin: string) {
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const { profile, created } = await authenticate(username.trim(), finalPin);
      onSuccess({ username: username.trim(), pin: finalPin }, profile, created);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nešto je puklo.");
      setPin("");
      setFirstPin("");
      setStep("pin");
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  // PIN se šalje sam čim su unesene 4 znamenke — nema gumba "potvrdi".
  useEffect(() => {
    if (pin.length !== 4 || submitting.current) return;

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
        setError("PIN-ovi se ne poklapaju. Probaj ponovno.");
        setPin("");
        setFirstPin("");
        setStep("pin");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function back() {
    setError("");
    setPin("");
    setFirstPin("");
    setStep(step === "confirm" ? "pin" : "username");
  }

  return (
    <div className="auth">
      <header className="auth__brand">
        <h1 className="auth__title">Trening<br />Tracker</h1>
        <p className="auth__tagline">Evidencija koja te ne mazi.</p>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {step === "username" ? (
          <motion.form
            key="username"
            className="glass auth__card"
            onSubmit={submitUsername}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <span className="auth__step">Korak 1 od 2</span>

            <h2 className="sheet__title">Tko si ti?</h2>
            <p className="sheet__sub">Upiši korisničko ime i profil je tvoj.</p>

            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="korisničko ime"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              disabled={busy}
              autoFocus
            />

            <p className="auth__hint">
              U formatu <code className="auth__code">imeprezime</code>, npr.{" "}
              <code className="auth__code">leoncugura</code>
            </p>

            <p className="error">{error}</p>

            <button
              type="submit"
              className="cta"
              disabled={busy || username.trim().length < 3}
            >
              {busy ? "Provjeravam…" : "Dalje"}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="pin"
            className="glass auth__card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <span className="auth__step">Korak 2 od 2</span>

            <h2 className="sheet__title">
              {step === "confirm" ? "Ponovi PIN" : exists ? "Upiši PIN" : "Postavi PIN"}
            </h2>
            <p className="sheet__sub">
              {step === "confirm"
                ? "Još jednom, da budemo sigurni."
                : exists
                  ? `Dobrodošao natrag, ${username.trim()}.`
                  : "Četiri brojke. Zapamti ih."}
            </p>

            <PinPad value={pin} onChange={setPin} disabled={busy} />

            <p className="error">{error}</p>

            <button
              type="button"
              className="pill"
              style={{ alignSelf: "center" }}
              onClick={back}
            >
              ← Natrag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
