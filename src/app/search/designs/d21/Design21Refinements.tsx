"use client";
import { useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, Filter, History, Video, X } from "lucide-react";
import type Design16Refinements from "../d16/Design16Refinements";
import DoctorRefinementRow from "../d3/DoctorRefinementRow";
import DoctorCallToBook from "../../doctors/DoctorCallToBook";
import ChooseDate from "../d16/ChooseDate";
import NearMeLocation from "../d16/NearMeLocation";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./Design21Filters.module.css";

export default function Design21Refinements(props: ComponentProps<typeof Design16Refinements>) {
  const params = useSearchParams();
  const nearbySelected = params.get("nearby") === props.location;
  const [feedback, setFeedback] = useState("");
  const unavailable = !props.hasDates || props.loading || props.error;
  return <div className={styles.refinements} data-d21-smart-filters>
    <div className={styles.quickRow}>
      <button type="button" className={`${chip.chip} ${styles.mobileFilters}`} onClick={props.onOpenFilters} aria-haspopup="dialog" aria-label={`Filters${props.filterCount ? `, ${props.filterCount} applied` : ""}`}>
        <Filter size={16} aria-hidden /><span>Filters</span>{Boolean(props.filterCount) && <span>{props.filterCount}</span>}
      </button>
      <DoctorRefinementRow>
        <div className={styles.chipGroup} role="group" aria-label="Appointment date">
        {(["today", "tomorrow"] as const).map(day => <button key={day} type="button" className={chip.chip}
          aria-pressed={!props.date && props.filters.availability === day} disabled={unavailable && props.filters.availability !== day}
          onClick={() => props.onFiltersChange({ ...props.filters, availability: !props.date && props.filters.availability === day ? "any" : day })}>
          {day === "today" ? "Today" : "Tomorrow"}
        </button>)}
        <ChooseDate tone="blue" value={props.date} min={props.minDate} max={props.maxDate} disabled={unavailable && !props.date} onChange={props.onDateChange} />
        </div>
        <div className={styles.chipGroup} role="group" aria-label="Access to care">
        <NearMeLocation showSelectionClear={false} cityOnly label="Near me" location={props.location} selected={nearbySelected} disabled={props.loading || props.error} onLocated={props.onNearMe} onClear={() => props.onNearMe("")} onFeedback={setFeedback} />
        <button type="button" className={chip.chip} aria-pressed={props.mode === "video"} onClick={() => props.onModeChange(props.mode === "video" ? "hospital" : "video")}>
          <Video size={16} aria-hidden />Video consultation
        </button>
        </div>
        <div className={styles.chipGroup} role="group" aria-label="Personal preferences">
        <button type="button" className={chip.chip} aria-pressed={props.historySelected} aria-haspopup={props.historyRequiresLogin ? "dialog" : undefined}
          title={props.historyRequiresLogin ? "Sign in to see your previous doctors" : undefined} onClick={props.onHistoryChange}>
          <History size={16} aria-hidden />{props.historyLabel}
        </button>
        {props.children}
        </div>
        <button type="button" className={chip.chip} aria-label="Order by earliest appointment" aria-pressed={props.sort === "earliest"}
          disabled={unavailable && props.sort !== "earliest"} onClick={() => props.onSortChange(props.sort === "earliest" ? "relevance" : "earliest")}>
          <ArrowUpDown size={16} aria-hidden />Earliest slot
        </button>
      </DoctorRefinementRow>
      <DoctorCallToBook placement="filters" />
    </div>
    <div className={feedback ? styles.locationNotice : styles.srOnly} role="status" aria-live="polite">
      {feedback && <><span>{feedback}</span><button type="button" aria-label="Dismiss location message" onClick={() => setFeedback("")}><X size={16} aria-hidden /></button></>}
    </div>
  </div>;
}
