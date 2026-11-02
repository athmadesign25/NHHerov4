"use client";

import { forwardRef } from "react";
import { motion, useIsPresent } from "framer-motion";
import { X } from "lucide-react";
import chipStyles from "./DoctorControlChip.module.css";
import styles from "./AppliedFilterChip.module.css";

interface Props {
  label: string;
  reducedMotion: boolean;
  onRemove: (button: HTMLButtonElement) => void;
}

// Forward the DOM ref so AnimatePresence can position an exiting chip.
const AppliedFilterChip = forwardRef<HTMLButtonElement, Props>(function AppliedFilterChip({ label, reducedMotion, onRemove }, ref) {
  const present = useIsPresent();
  return <motion.button ref={ref} type="button" className={`${chipStyles.chip} ${styles.chip}`} data-selected="true" disabled={!present} aria-hidden={!present}
    aria-label={`Remove filter: ${label}`} title={label} onClick={(event) => onRemove(event.currentTarget)}
    layout={reducedMotion ? false : "position"}
    initial={reducedMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: { duration: reducedMotion ? 0 : .15 } }}
    transition={{ duration: reducedMotion ? 0 : .25, ease: [0.22, 1, 0.36, 1] }}>
    <span>{label}</span><X size={16} aria-hidden />
  </motion.button>;
});

export default AppliedFilterChip;
