"use client";

import { Languages, X } from "lucide-react";
import type { ConsultationMode, DoctorFilters, DoctorListingItem } from "@/features/search/doctorListing";
import { getDesign16LanguageShortcut, toggleDesign16Language } from "@/features/search/design16Language";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./LanguageShortcut.module.css";

export interface LanguageShortcutProps {
  doctors: readonly DoctorListingItem[];
  matchingDoctors?: readonly DoctorListingItem[];
  filters: DoctorFilters;
  mode: ConsultationMode;
  location: string;
  now?: Date;
  onChange: (filters: DoctorFilters) => void;
}

export default function LanguageShortcut({ doctors, matchingDoctors, filters, mode, location, now, onChange }: LanguageShortcutProps) {
  const option = getDesign16LanguageShortcut(doctors, filters, mode, location, now, matchingDoctors);
  if (!option) return null;
  return <div className={styles.group} role="group" aria-label="Consultation language" data-d3-ui>
    <button type="button" className={`${chip.chip} ${styles.option}`} aria-pressed={option.selected}
      aria-label={`Consult in ${option.value}${option.selected ? ". Remove language filter" : option.count === 0 ? ". No matching doctors" : ""}`}
      disabled={!option.selected && option.count === 0} onClick={() => onChange(toggleDesign16Language(filters, option.value))}>
      <Languages size={16} aria-hidden /><span className={styles.value}>Consult in {option.value}</span>
      {option.selected && <X size={14} aria-hidden />}
    </button>
  </div>;
}
