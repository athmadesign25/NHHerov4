"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown } from "lucide-react";
import { availabilityLabels, type AvailabilityFilter as AvailabilityValue } from "@/features/search/doctorListing";
import { matchingAvailabilityOptions } from "@/features/search/design21FilterSearch";
import { keepFilterHeadingVisible } from "./filterScrolling";
import styles from "./DoctorFilters.module.css";

interface Props {
  value: AvailabilityValue;
  enabled: boolean;
  hideUnavailable?: boolean;
  hideClear?: boolean;
  searchQuery?: string;
  onChange: (value: AvailabilityValue) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customDateLabel?: string;
  onClearCustomDate?: () => void;
}

export default function AvailabilityFilter({ value, enabled, hideUnavailable = false, hideClear = false, searchQuery = "", onChange, open: controlledOpen, onOpenChange, customDateLabel, onClearCustomDate }: Props) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const reducedMotion = useReducedMotion();
  const transition = { duration: reducedMotion ? 0 : .25, ease: [0.22, 1, 0.36, 1] as const };
  const triggerId = `${id}-availability-trigger`;
  const panelId = `${id}-availability-panel`;
  const selected = value !== "any" || Boolean(customDateLabel);
  const searching = Boolean(searchQuery.trim());
  const matches = matchingAvailabilityOptions(searchQuery, enabled, value, customDateLabel);
  const heading = <><CalendarDays size={17} className={styles.groupIcon} aria-hidden /><span className={styles.groupLabel}>Availability</span>
    {selected && <motion.span className={styles.count} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>1</motion.span>}</>;

  return <motion.section className={styles.group} data-filter-group data-expanded={open} aria-labelledby={triggerId} layout={reducedMotion ? false : "position"} transition={transition}>
    <div className={styles.groupHeader} data-filter-category-header><h3 className={styles.groupHeading}>
      {searching ? <span id={triggerId} className={styles.searchGroupTitle}>{heading}</span> : <motion.button type="button" id={triggerId} className={`${styles.groupToggle} ${hideClear ? styles.unclutteredToggle : ""}`} aria-expanded={open} aria-controls={panelId}
        transition={transition}
        onClick={(event) => { if (open) keepFilterHeadingVisible(event.currentTarget); setOpen(!open); }}>
        {heading}
        <ChevronDown size={16} className={styles.chevron} aria-hidden />
      </motion.button>}
    </h3>
      {!hideClear && <button type="button" className={styles.clearGroup} disabled={!selected} aria-hidden={!selected} aria-label="Clear availability" title="Clear availability"
        onClick={() => { if (customDateLabel && onClearCustomDate) onClearCustomDate(); else onChange("any"); document.getElementById(triggerId)?.focus({ preventScroll: true }); }}>Clear</button>}
    </div>
    <div id={panelId} className={styles.panel} aria-labelledby={triggerId} aria-hidden={!open} inert={!open}>
      <AnimatePresence initial={false} mode="popLayout">{open && <motion.div key="content"
        initial={reducedMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: { duration: reducedMotion ? 0 : .12 } }} transition={transition}>
        <fieldset className={styles.options}><legend className={styles.srOnly}>Appointment availability</legend>
          {customDateLabel && (!searching || matches.custom) && <label className={styles.option}><input type="radio" name={`${id}-availability`} checked readOnly value="custom" /><span className={styles.optionLabel}>{customDateLabel}</span></label>}
          {(searching ? matches.dates : (["today", "tomorrow", "week"] as const).filter(date => !hideUnavailable || enabled || (!customDateLabel && value === date))).map((date) => <label key={date} className={styles.option}>
            <input type="radio" name={`${id}-availability`} value={date} checked={!customDateLabel && value === date} disabled={!enabled && !hideUnavailable}
              onChange={() => onChange(date)} /><span className={styles.optionLabel}>{availabilityLabels[date]}</span>
          </label>)}
        </fieldset>
        {!enabled && <p className={styles.hint}>Appointment dates are unavailable for these results.</p>}
      </motion.div>}</AnimatePresence>
    </div>
  </motion.section>;
}
