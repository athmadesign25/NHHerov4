"use client";

import { useId, useRef, type RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, Building2, Video, X } from "lucide-react";
import { availabilityLabels, type ConsultationMode, type DoctorFilters, type DoctorSort } from "@/features/search/doctorListing";
import DoctorRefinementRow from "../designs/d3/DoctorRefinementRow";
import ActiveDoctorFilters from "../designs/d3/ActiveDoctorFilters";
import chipStyles from "./DoctorControlChip.module.css";
import styles from "./DoctorListingControls.module.css";

interface Props {
  mode: ConsultationMode;
  sort: DoctorSort;
  filters: DoctorFilters;
  onModeChange: (mode: ConsultationMode) => void;
  onSortChange: (sort: DoctorSort) => void;
  onFiltersChange: (filters: DoctorFilters) => void;
  hideMode?: boolean;
  hideAppliedFilters?: boolean;
  hasSlots?: boolean;
  loading?: boolean;
  error?: boolean;
  hasDoctors?: boolean;
}

/** Shared consultation toggle; Design 16 places it alongside search. */
export function DoctorConsultationToggle({ mode, onModeChange, modeRef, availableModes, iconVariant = "outline" }: { mode: ConsultationMode; onModeChange: (mode: ConsultationMode) => void; modeRef?: RefObject<HTMLFieldSetElement | null>; availableModes?: readonly ConsultationMode[]; iconVariant?: "outline" | "availability" }) {
  const id = useId();
  const reducedMotion = Boolean(useReducedMotion());
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };
  const options = (["hospital", "video"] as const).filter(value => !availableModes || availableModes.includes(value));
  return <fieldset ref={modeRef} className={styles.mode} data-single-mode={options.length === 1 || undefined}>
        <legend className={styles.srOnly}>Consultation mode</legend>
        <motion.span className={styles.modeIndicator} aria-hidden initial={false}
          animate={{ x: options.indexOf(mode) > 0 ? "100%" : "0%" }} transition={transition} />
        {options.map((value) => {
          const Icon = value === "hospital" ? Building2 : Video;
          return <label key={value} className={styles.modeOption}>
            <input type="radio" name={`${id}-mode`} value={value} aria-label={value === "hospital" ? "Hospital visit" : "Video consultation"} aria-describedby="d3-refinement-help" checked={mode === value} onChange={() => onModeChange(value)} />
            <span className={styles.modeLabel}>{iconVariant === "availability" ? <Image src={`/icons/doctor-card/${value}.svg`} alt="" width={16} height={16} className={styles.modeImage} /> : <Icon size={16} aria-hidden />}{value === "hospital" ? "Hospital visit" : "Video consultation"}</span>
          </label>;
        })}
      </fieldset>;
}

/** Used only by the Design 3 doctor preview. */
export default function DoctorListingControls({ mode, sort, filters, onModeChange, onSortChange, onFiltersChange, hideMode = false, hideAppliedFilters = false, hasSlots = true, loading = false, error = false, hasDoctors = true }: Props) {
  const id = useId();
  const reducedMotion = Boolean(useReducedMotion());
  const modeRef = useRef<HTMLFieldSetElement>(null);
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };
  const chips = (["specialties", "expertise", "hospitals", "languages", "genders"] as const).flatMap((key) =>
    filters[key].map((label) => ({ key: `${key}-${label}`, label, remove: () => onFiltersChange({ ...filters, [key]: filters[key].filter((item) => item !== label) }) }))
  );
  if (filters.availability === "week") chips.push({ key: "availability-week", label: availabilityLabels.week, remove: () => onFiltersChange({ ...filters, availability: "any" }) });
  const datesUnavailable = !loading && !error && !hasSlots && hasDoctors;
  const slotStatus = hasSlots ? "" : loading ? "Checking appointment availability…"
    : error ? "Appointment availability could not be loaded. Try the search again."
    : !hasDoctors ? "No matching doctors. Change your search to check appointment availability."
    : "Appointment dates aren’t provided for these results.";
  return <div className={styles.controls}>
    <DoctorRefinementRow>
      {!hideMode && <DoctorConsultationToggle mode={mode} onModeChange={onModeChange} modeRef={modeRef} />}
      <div className={styles.quickFilters} role="group" aria-label="Appointment order and date" aria-describedby={slotStatus ? `${id}-dates` : undefined}>
        <motion.button type="button" className={chipStyles.chip} layout={reducedMotion ? false : "position"} transition={transition}
          aria-label="Order by earliest appointment" aria-pressed={sort === "earliest"} aria-describedby={`d3-refinement-help${slotStatus ? ` ${id}-dates` : ""}`} disabled={!hasSlots && sort !== "earliest"}
          onClick={() => onSortChange(sort === "earliest" ? "relevance" : "earliest")} title={sort === "earliest" ? "Remove earliest appointment ordering" : slotStatus || "Show the earliest available appointments first"}>
          <ArrowUpDown size={16} aria-hidden />Earliest slot
          {sort === "earliest" && <motion.span className={styles.dismissIcon} aria-hidden
            initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={transition}><X size={16} /></motion.span>}
        </motion.button>
        <div className={styles.dayFilters} role="group" aria-label="Appointment day">
          <span id={`${id}-date-help`} className={styles.srOnly}>Activate a selected date to remove that filter.</span>
          {(["today", "tomorrow"] as const).map((value) => <motion.button key={value} type="button" className={chipStyles.chip} layout={reducedMotion ? false : "position"} transition={transition} aria-pressed={filters.availability === value} aria-describedby={`${id}-date-help${slotStatus ? ` ${id}-dates` : ""}`} title={filters.availability === value ? `Remove ${availabilityLabels[value]} filter` : slotStatus || `Appointments ${value}`} disabled={!hasSlots && filters.availability !== value}
            onClick={() => onFiltersChange({ ...filters, availability: filters.availability === value ? "any" : value })}>
            <span>{availabilityLabels[value]}</span>
            {filters.availability === value && <motion.span className={styles.dismissIcon} aria-hidden
              initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>
              <X size={16} />
            </motion.span>}
          </motion.button>)}
        </div>
      </div>
      {!hideAppliedFilters && chips.length > 0 && <ActiveDoctorFilters chips={chips} reducedMotion={reducedMotion}
        focusFallback={() => (modeRef.current?.querySelector<HTMLInputElement>("input:checked") ?? document.querySelector<HTMLInputElement>("[data-d3-search-bar] input[type=radio]:checked"))?.focus({ preventScroll: true })} />}
    </DoctorRefinementRow>
    {slotStatus && <p id={`${id}-dates`} className={datesUnavailable ? styles.hint : styles.srOnly}>{slotStatus}{datesUnavailable && filters.availability !== "any" && <> <button type="button" onClick={() => onFiltersChange({ ...filters, availability: "any" })}>Remove date filter</button></>}</p>}
  </div>;
}
