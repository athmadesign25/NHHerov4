"use client";

import { useRef } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import AppliedFilterChip from "../../doctors/AppliedFilterChip";
import DoctorRefinementRow from "../d3/DoctorRefinementRow";
import styles from "./AppliedFilterSummary.module.css";

export interface AppliedFilterListItem {
  key: string;
  label: string;
  accessibleLabel?: string;
  remove: () => void;
}

/** Shared selected-filter row for booking and the treatments directory. */
export default function AppliedFilterList({ chips, focusFallback }: {
  chips: readonly AppliedFilterListItem[];
  focusFallback: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const remove = (button: HTMLButtonElement, action: () => void) => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[data-applied-filter]:not(:disabled)') ?? []);
    const index = buttons.indexOf(button);
    const next = buttons[index + 1] ?? buttons[index - 1];
    if (next) next.focus({ preventScroll: true }); else focusFallback();
    action();
  };
  if (!chips.length) return null;

  return <div ref={root} className={styles.row} data-d21-applied-filters data-d3-ui>
    <div className={styles.tags}>
      <DoctorRefinementRow label="Applied filters">
        <AnimatePresence initial={false} mode="popLayout">{chips.map(chip =>
          <AppliedFilterChip key={chip.key} label={chip.label} accessibleLabel={chip.accessibleLabel} tone="neutral" reducedMotion={reducedMotion}
            onRemove={button => remove(button, chip.remove)} />
        )}</AnimatePresence>
      </DoctorRefinementRow>
    </div>
  </div>;
}
