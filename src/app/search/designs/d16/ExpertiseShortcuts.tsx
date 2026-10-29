"use client";

import { X } from "lucide-react";
import type { ConsultationMode, DoctorFilters, DoctorListingItem } from "@/features/search/doctorListing";
import { getDesign16ExpertiseShortcuts, toggleDesign16Expertise } from "@/features/search/design16Expertise";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./ExpertiseShortcuts.module.css";

export interface ExpertiseShortcutsProps {
  doctors: readonly DoctorListingItem[];
  matchingDoctors?: readonly DoctorListingItem[];
  filters: DoctorFilters;
  mode: ConsultationMode;
  query: string;
  onChange: (filters: DoctorFilters) => void;
}

export default function ExpertiseShortcuts({ doctors, matchingDoctors, filters, mode, query, onChange }: ExpertiseShortcutsProps) {
  const options = getDesign16ExpertiseShortcuts(doctors, filters, mode, query, undefined, matchingDoctors);
  if (!options.length) return null;

  return <div className={styles.group} role="group" aria-label="Focus of care" data-d3-ui>
    <span className={styles.label} aria-hidden="true">Focus of care</span>
    <div className={styles.options}>
      {options.map(({ value, count, selected }) => <button
        key={value}
        type="button"
        className={`${chip.chip} ${styles.option}`}
        aria-pressed={selected}
        aria-label={`${value}${selected ? ". Remove expertise filter" : count === 0 ? ". No matching doctors" : ""}`}
        disabled={!selected && count === 0}
        onClick={() => onChange(toggleDesign16Expertise(filters, value))}
      >
        <span className={styles.value}>{value}</span>
        {selected && <X className={styles.dismiss} aria-hidden="true" />}
      </button>)}
    </div>
  </div>;
}
