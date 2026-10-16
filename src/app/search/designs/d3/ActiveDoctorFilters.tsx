"use client";

import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import AppliedFilterChip from "../../doctors/AppliedFilterChip";
import styles from "./ActiveDoctorFilters.module.css";

export interface ActiveDoctorFilter { key: string; label: string; remove: () => void }

export default function ActiveDoctorFilters({ chips, reducedMotion, focusFallback }: {
  chips: ActiveDoctorFilter[]; reducedMotion: boolean; focusFallback: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const remove = (button: HTMLButtonElement, action: () => void) => {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    const index = buttons.indexOf(button);
    const next = buttons[index + 1] ?? buttons[index - 1];
    if (next) next.focus({ preventScroll: true }); else focusFallback();
    action();
  };
  return <div ref={listRef} className={styles.list} role="group" aria-label="Active filters">
    <AnimatePresence initial={false} mode="popLayout">{chips.map((chip) =>
      <AppliedFilterChip key={chip.key} label={chip.label} reducedMotion={reducedMotion} onRemove={(button) => remove(button, chip.remove)} />
    )}</AnimatePresence>
  </div>;
}
