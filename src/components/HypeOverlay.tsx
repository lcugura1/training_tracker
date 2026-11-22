import { useEffect } from "react";
import { motion } from "motion/react";
import type { HypeMedia } from "../lib/hype";

interface HypeOverlayProps {
  emojis: string[];
  typeLabel: string;
  dateLabel: string;
  message: string;
  media: HypeMedia | null;
  streak: number;
  isRecord: boolean;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 6000;
const transition = { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] as const };

export function HypeOverlay({
  emojis,
  typeLabel,
  dateLabel,
  message,
  media,
  streak,
  isRecord,
  onDismiss,
}: HypeOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="hype"
      role="alertdialog"
      aria-label={message}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="hype__inner"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="hype__chip">
          <span className="hype__chip-emoji">{emojis.join(" ")}</span>
          <span>{typeLabel} · {dateLabel}</span>
        </div>

        <div className="card hype__card">
          <div className="hype__slot">
            {media ? (
              media.kind === "video" ? (
                <video className="hype__media" src={media.url} autoPlay loop muted playsInline />
              ) : (
                <img className="hype__media" src={media.url} alt="" />
              )
            ) : (
              <span className="hype__slot-emoji">{emojis.join(" ")}</span>
            )}
          </div>

          <p className="hype__text">{message}</p>

          <div className="hype__footer">
            <span className="tnum">{streak}</span>
            <span className="hype__footer-note">
              {streak === 1 ? "dan u nizu" : "dana u nizu"}
              {isRecord ? " · novi rekord" : ""}
            </span>
          </div>
        </div>

        <button type="button" className="cta" onClick={onDismiss}>
          Idemo dalje
        </button>
      </motion.div>
    </motion.div>
  );
}
