"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import ActiveSpecialityFilters, { type ActiveSpecialityFilter } from "./ActiveSpecialityFilters";
import styles from "./SidebarSpecialityFilters.module.css";

export interface SidebarSpecialityFiltersProps {
  chips: ActiveSpecialityFilter[];
  onClearAll: () => void;
}


export default function SidebarSpecialityFilters({
  chips,
  onClearAll,
}: SidebarSpecialityFiltersProps) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());

  const focusCategory = () =>
    root.current?.parentElement
      ?.querySelector<HTMLButtonElement>("button[aria-expanded]")
      ?.focus({ preventScroll: true });

  return (
    <div ref={root}>
      {chips.length > 0 && (
        <>
          <div className={styles.heading}>
            <h3 className={styles.label}>Applied filters</h3>
            <button
              type="button"
              className={styles.clear}
              onClick={() => {
                onClearAll();
                focusCategory();
              }}
            >
              Clear all
            </button>
          </div>
          <ActiveSpecialityFilters
            chips={chips}
            wrap
            reducedMotion={reducedMotion}
            focusFallback={focusCategory}
          />
        </>
      )}
    </div>
  );
}
