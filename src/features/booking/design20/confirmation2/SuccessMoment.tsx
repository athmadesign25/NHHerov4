"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import styles from "./SuccessMoment.module.css";

const accents = [
  { x: -68, y: -38, rotate: -35 }, { x: 64, y: -46, rotate: 48 },
  { x: -84, y: 6, rotate: 25 }, { x: 82, y: 12, rotate: -25 },
  { x: -48, y: 54, rotate: 70 }, { x: 48, y: 52, rotate: -60 },
  { x: -18, y: -70, rotate: 25 }, { x: 20, y: -76, rotate: -20 },
];

/** A single short celebration. Essential content never waits for it. */
export default function SuccessMoment() {
  const reduced = useReducedMotion();
  return <div className={styles.moment} aria-hidden="true">
    <span className={styles.halo} />
    {!reduced && accents.map((accent, index) => <motion.span key={index} className={styles.confetti}
      initial={{ opacity: 0, x: accent.x * .35, y: accent.y * .35, scale: .4 }}
      animate={{ opacity: [0, 1, 1, 0], x: accent.x, y: [accent.y * .35, accent.y, accent.y + 12], rotate: accent.rotate, scale: [ .4, 1, .8 ] }}
      transition={{ duration: duration.slowest * 2, delay: duration.base, ease: ease.out }} />)}
    <motion.div className={styles.seal} initial={reduced ? false : { opacity: 0, scale: .8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.spring }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><motion.path d="m12 24 8 8 17-18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : duration.slower, delay: reduced ? 0 : duration.fast, ease: ease.out }} /></svg>
    </motion.div>
    <span className={styles.star}>✦</span><span className={styles.dot} />
  </div>;
}
