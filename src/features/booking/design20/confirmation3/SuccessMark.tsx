"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import styles from "./AppointmentConfirmation3.module.css";

export default function SuccessMark() {
  const reduced = useReducedMotion();
  return <motion.span className={styles.successMark} aria-hidden="true"
    initial={reduced ? false : { opacity: 0, scale: .82 }}
    animate={{ opacity: 1, scale: reduced ? 1 : [.82, 1.06, 1] }}
    transition={{
      opacity: { duration: reduced ? 0 : duration.moderate },
      scale: { duration: reduced ? 0 : duration.slowest, times: [0, .6, 1], ease: ease.out },
    }}>
    <span className={styles.successRipple} />
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <motion.path d="m8 16 5.5 5.5L25 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : duration.slow, delay: reduced ? 0 : duration.fast, ease: ease.out }} />
    </svg>
  </motion.span>;
}
