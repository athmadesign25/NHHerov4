"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./DoctorSearchHint.module.css";

interface Props {
  active: boolean;
  paused: boolean;
  terms?: readonly string[];
  staticHint?: string;
}

const DEFAULT_TERMS = ["speciality name", "condition", "treatment", "doctor name"] as const;

export default function DoctorSearchHint({
  active,
  paused,
  terms = DEFAULT_TERMS,
  staticHint = "Search by speciality, condition or treatment",
}: Props) {
  const [index, setIndex] = useState(0);
  const reducedMotion = Boolean(useReducedMotion());
  const term = terms[index % terms.length];

  useEffect(() => {
    if (!active || paused || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden) {
        timer = setTimeout(() => setIndex((val) => (val + 1) % terms.length), 3500);
      }
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [active, paused, reducedMotion, terms.length]);

  if (!active) return null;

  return (
    <span className={styles.hint} data-static={paused || undefined} aria-hidden="true">
      <span className={styles.rotating}>
        Search by{" "}
        <span className={styles.terms}>
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={term}
              className={styles.term}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: reducedMotion || paused ? 0 : 0.15 } }}
              transition={{ duration: reducedMotion || paused ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {term}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span className={styles.static}>{staticHint}</span>
    </span>
  );
}
