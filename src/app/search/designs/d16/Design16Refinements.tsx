"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpDown, Filter, History, X } from "lucide-react";
import type { ConsultationMode, DoctorFilters, DoctorSort } from "@/features/search/doctorListing";
import { DoctorConsultationToggle } from "../../doctors/DoctorListingControls";
import DoctorRefinementRow from "../d3/DoctorRefinementRow";
import ChooseDate from "./ChooseDate";
import NearMeLocation from "./NearMeLocation";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./Design16Refinements.module.css";

interface Props {
  location: string;
  mode: ConsultationMode;
  sort: DoctorSort;
  filters: DoctorFilters;
  date: string;
  minDate: string;
  maxDate: string;
  hasDates: boolean;
  loading: boolean;
  error: boolean;
  historyRequiresLogin: boolean;
  historySelected: boolean;
  historyLabel?: string;
  compactMobile?: boolean;
  filterCount?: number;
  onOpenFilters?: () => void;
  onModeChange: (mode: ConsultationMode) => void;
  onSortChange: (sort: DoctorSort) => void;
  onNearMe: (city: string) => void;
  onFiltersChange: (filters: DoctorFilters) => void;
  onDateChange: (date: string) => void;
  onHistoryChange: () => void;
  children?: ReactNode;
}

export default function Design16Refinements(props: Props) {
  const [locationFeedback, setLocationFeedback] = useState("");
  const unavailable = !props.hasDates || props.loading || props.error;
  return <div className={`${styles.layout} ${props.compactMobile ? styles.compactMobile : ""}`}>
    <DoctorConsultationToggle mode={props.mode} onModeChange={props.onModeChange} />
    <div className={styles.shortcuts}>
      <div className={styles.shortcutBar}>
      {props.compactMobile && props.onOpenFilters && <button type="button" className={`${chip.chip} ${styles.filterButton}`}
        data-selected={Boolean(props.filterCount) || undefined} aria-haspopup="dialog" title="Filters"
        aria-label={`Open filters${props.filterCount ? `, ${props.filterCount} applied` : ""}`} onClick={props.onOpenFilters}>
        <Filter size={18} aria-hidden />
        {Boolean(props.filterCount) && <span className={styles.filterCount} aria-hidden>{props.filterCount}</span>}
      </button>}
      <DoctorRefinementRow>
        <button type="button" className={chip.chip} aria-pressed={props.historySelected}
          aria-haspopup={props.historyRequiresLogin ? "dialog" : undefined}
          title={props.historyRequiresLogin ? `Sign in to see ${props.historyLabel === "Previously consulted" ? "doctors you’ve consulted before" : "doctors you’ve booked before"}` : undefined} onClick={props.onHistoryChange}>
          <History size={16} aria-hidden />{props.historyLabel ?? "Previously booked"}{props.historySelected && <X size={14} aria-hidden />}
        </button>
        {props.mode === "hospital" && <NearMeLocation location={props.location} selected={props.sort === "nearest"} disabled={props.loading || props.error}
          onLocated={props.onNearMe} onClear={() => props.onSortChange("relevance")} onFeedback={setLocationFeedback} />}
        <div className={styles.group} role="group" aria-label="Appointment date and order">
          <button type="button" className={chip.chip} aria-label="Order by earliest appointment" aria-pressed={props.sort === "earliest"}
            disabled={unavailable && props.sort !== "earliest"} onClick={() => props.onSortChange(props.sort === "earliest" ? "relevance" : "earliest")}>
            <ArrowUpDown size={16} aria-hidden />Earliest slot{props.sort === "earliest" && <X size={14} aria-hidden />}
          </button>
          {(["today", "tomorrow"] as const).map(day => <button type="button" key={day} className={chip.chip}
            aria-pressed={!props.date && props.filters.availability === day} disabled={unavailable && props.filters.availability !== day}
            onClick={() => props.onFiltersChange({ ...props.filters, availability: props.filters.availability === day ? "any" : day })}>
            {day === "today" ? "Today" : "Tomorrow"}{!props.date && props.filters.availability === day && <X size={14} aria-hidden />}
          </button>)}
          <ChooseDate value={props.date} min={props.minDate} max={props.maxDate} disabled={unavailable && !props.date} onChange={props.onDateChange} />
        </div>
      </DoctorRefinementRow>
      </div>
      {props.children && <div className={styles.context}>{props.children}</div>}
    </div>
    {props.mode === "hospital" && <p className={locationFeedback ? styles.hint : styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{locationFeedback}</p>}
    {!props.loading && !props.error && !props.hasDates && <p className={styles.hint}>Appointment dates aren’t provided for these results.</p>}
  </div>;
}
