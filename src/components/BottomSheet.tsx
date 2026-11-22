import { useEffect, useRef, type ReactNode } from "react";
import { motion, type PanInfo } from "motion/react";

interface BottomSheetProps {
  ariaLabel: string;
  onClose: () => void;
  /** Podizanje sheeta iznad tipkovnice, u pikselima (vidi useKeyboardInset). */
  bottomInset?: number;
  children: ReactNode;
}

/** Dizajn traži jedno easing i kratka trajanja — bez opruga i odskoka. */
const ease = [0.2, 0.8, 0.2, 1] as const;
const transition = { duration: 0.22, ease };

const DISMISS_OFFSET = 110;
const DISMISS_VELOCITY = 520;

const FOCUSABLE = "button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex='-1'])";

/**
 * Zajednička ljuska za sve sheetove: scrim, ručka, povlačenje prema dolje.
 * Zatvara se tapom na scrim, swipeom dolje i tipkom Escape. Fokus ostaje unutar
 * sheeta dok je otvoren, a po zatvaranju se vraća na element koji ga je otvorio.
 * Element s atributom data-autofocus dobiva fokus pri otvaranju.
 */
export function BottomSheet({ ariaLabel, onClose, bottomInset = 0, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheetRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;

      const items = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      // aria-modal sam ne zarobljava Tab, pa se vrti u krug ručno.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Zatvara se ili po prijeđenom putu ili po brzini otpuštanja — brz flick
    // mora raditi i kad prst nije stigao daleko.
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose();
    }
  }

  return (
    <>
      <motion.div
        className="scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      />

      <motion.div
        ref={sheetRef}
        className="sheet"
        style={{ bottom: bottomInset }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={transition}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
      >
        <div className="sheet__handle" />
        {children}
      </motion.div>
    </>
  );
}
