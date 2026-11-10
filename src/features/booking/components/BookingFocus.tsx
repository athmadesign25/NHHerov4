"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import styles from "./BookingFocus.module.css";

/** Keep this beside, not inside, the elevated or transformed booking surface. */
export function BookingBackdrop({ open, suspended = false, inline = false, onDismiss }: {
  open: boolean; suspended?: boolean; inline?: boolean; onDismiss: () => void;
}) {
  const reduced = useReducedMotion();
  return <AnimatePresence>{open && <motion.div key="page" className={`${styles.backdrop} ${inline ? styles.inlineBackdrop : ""}`} data-booking-backdrop data-lenis-prevent={inline ? undefined : true} aria-hidden="true"
    initial={{ opacity: 0 }} animate={{ opacity: suspended ? 0 : 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : duration.moderate, ease: ease.out }}
    onClick={onDismiss} />}{open && inline && <motion.div key="toolbar" className={`${styles.backdrop} ${styles.toolbarBackdrop}`} data-booking-backdrop aria-hidden="true"
    initial={{ opacity: 0 }} animate={{ opacity: suspended ? 0 : 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : duration.moderate, ease: ease.out }}
    onClick={onDismiss} />}</AnimatePresence>;
}

/** One quiet three-second highlight, settling back to the normal booking surface. */
export function BookingFocusGlow() {
  return <span className={styles.glow} aria-hidden="true">
    <span className={styles.halo}><span className={styles.track} /></span>
    <span className={styles.stroke}><span className={styles.track} /></span>
  </span>;
}
