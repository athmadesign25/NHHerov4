"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { availabilityLabels, type DoctorFilters } from "@/features/search/doctorListing";
import ActiveDoctorFilters, { type ActiveDoctorFilter } from "./ActiveDoctorFilters";
import styles from "./SidebarDoctorFilters.module.css";

export default function SidebarDoctorFilters({ value, onChange, onClearAll, extraChips = [] }: {
  value: DoctorFilters; onChange: (value: DoctorFilters) => void; onClearAll: () => void; extraChips?: ActiveDoctorFilter[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const chips = (["specialties", "expertise", "hospitals", "languages", "genders"] as const).flatMap(key =>
    value[key].map(label => ({ key: `${key}-${label}`, label,
      remove: () => onChange({ ...value, [key]: value[key].filter(item => item !== label) }) })));
  if (value.availability !== "any") chips.push({ key: "availability", label: availabilityLabels[value.availability], remove: () => onChange({ ...value, availability: "any" }) });
  chips.push(...extraChips);
  const focusCategory = () => root.current?.parentElement?.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
  return <div ref={root}>{chips.length > 0 && <>
    <div className={styles.heading}>
      <h3 className={styles.label}>Applied filters</h3>
      <button type="button" className={styles.clear} onClick={() => { onClearAll(); focusCategory(); }}>Clear all</button>
    </div>
    <ActiveDoctorFilters chips={chips} wrap reducedMotion={reducedMotion}
      focusFallback={focusCategory} />
  </>}</div>;
}
