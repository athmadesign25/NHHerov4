"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./DoctorSearchHint.module.css";

const terms = ["doctor name", "speciality", "hospital"] as const;

export default function DoctorSearchHint({ active, paused }: { active: boolean; paused: boolean }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const term = terms[index];

  useEffect(() => {
    // Loop only while empty and unfocused; resume after focus leaves the input.
    if (!active || paused || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(() => setIndex(value => (value + 1) % terms.length), 4000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", schedule); };
  }, [active, paused, reducedMotion, index]);

  if (!active) return null;
  return <span className={styles.hint} data-static={paused || undefined} aria-hidden="true">
    <span className={styles.rotating}>Search by <span className={styles.terms}>
      <AnimatePresence initial={false} mode="wait">
        <motion.span key={term} className={styles.term}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: reducedMotion || paused ? 0 : .15 } }}
          transition={{ duration: reducedMotion || paused ? 0 : .25, ease: [.22, 1, .36, 1] }}>{term}</motion.span>
      </AnimatePresence>
    </span></span>
    <span className={styles.static}>Search by doctor, speciality, hospital</span>
  </span>;
}
