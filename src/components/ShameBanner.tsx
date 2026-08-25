import { motion } from "motion/react";

interface ShameBannerProps {
  message: string;
}

export function ShameBanner({ message }: ShameBannerProps) {
  return (
    <motion.section
      className="glass shame"
      role="alert"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, visualDuration: 0.4 }}
    >
      <p className="shame__label">20:00 · Nisi trenirao</p>
      <p className="shame__text">{message}</p>
    </motion.section>
  );
}
