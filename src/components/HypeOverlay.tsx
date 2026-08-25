import { useEffect } from "react";
import { motion } from "motion/react";
import type { HypeMedia } from "../lib/hype";

interface HypeOverlayProps {
  message: string;
  emoji: string;
  media: HypeMedia | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4500;

export function HypeOverlay({ message, emoji, media, onDismiss }: HypeOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="hype"
      role="alertdialog"
      aria-label={message}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        // Odskok je ovdje opravdan: slavlje, ne obična promjena stanja.
        transition={{ type: "spring", bounce: 0.35, visualDuration: 0.45 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)" }}
      >
        {media ? (
          media.kind === "video" ? (
            <video className="hype__media" src={media.url} autoPlay loop muted playsInline />
          ) : (
            <img className="hype__media" src={media.url} alt="" />
          )
        ) : (
          <span className="hype__emoji">{emoji}</span>
        )}

        <p className="hype__text">{message}</p>
      </motion.div>

      <span className="hype__dismiss">dodirni za zatvaranje</span>
    </motion.div>
  );
}
