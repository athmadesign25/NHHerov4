"use client";

import { useRef } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import type { DoctorFilters } from "@/features/search/doctorListing";
import { design21AppliedFilters, type AppliedDoctorFilter } from "@/features/search/design21AppliedFilters";
import AppliedFilterChip from "../../doctors/AppliedFilterChip";
import DoctorRefinementRow from "../d3/DoctorRefinementRow";
import styles from "./AppliedFilterSummary.module.css";

interface Props {
  value: DoctorFilters;
  smartLanguage?: string;
  extraChips: readonly AppliedDoctorFilter[];
  onChange: (value: DoctorFilters) => void;
}

export default function AppliedFilterSummary({ value, extraChips, smartLanguage, onChange }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const chips = design21AppliedFilters(value, onChange, extraChips, [
    "appointmentDate", "mode", "previouslyBooked",
    ...(value.availability === "today" || value.availability === "tomorrow" ? ["availability"] : []),
    ...(smartLanguage ? [`languages-${smartLanguage}`] : []),
  ]);
  const focusFallback = () => {
    const target = Array.from(document.querySelectorAll<HTMLElement>('[data-d21-smart-filters] button:not(:disabled)'))
      .find(control => control.getClientRects().length > 0 && !control.closest('[hidden], [inert], [aria-hidden="true"]'))
      ?? document.getElementById("d21-result-count");
    target?.focus({ preventScroll: true });
  };
  const remove = (button: HTMLButtonElement, action: () => void) => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[data-applied-filter]:not(:disabled)') ?? []);
    const index = buttons.indexOf(button);
    const next = buttons[index + 1] ?? buttons[index - 1];
    if (next) next.focus({ preventScroll: true }); else focusFallback();
    action();
  };
  if (!chips.length) return null;

  return <div ref={root} className={styles.row} data-d21-applied-filters data-d3-ui>
    <span className={styles.label}>Applied</span>
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
