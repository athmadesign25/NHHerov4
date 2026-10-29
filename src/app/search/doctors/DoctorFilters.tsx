"use client";

import { Fragment, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Building2, Check, ChevronDown, Languages, Search, Stethoscope, UserRound } from "lucide-react";
import { doctorFilterOptions, type ConsultationMode, type DoctorFilters as Filters, type DoctorListingItem, type DoctorMultiFilterKey } from "@/features/search/doctorListing";
import AvailabilityFilter from "./AvailabilityFilter";
import { keepFilterHeadingVisible, prepareFilterListToggle } from "./filterScrolling";
import styles from "./DoctorFilters.module.css";

interface Props {
  doctors: readonly DoctorListingItem[];
  value: Filters;
  matchingDoctors?: readonly DoctorListingItem[];
  onChange: (filters: Filters) => void;
  showAvailability?: boolean;
  showResultCounts?: boolean;
  availabilityEnabled?: boolean;
  mode?: ConsultationMode;
}

const groups = [
  { key: "specialties", label: "Speciality", plural: "specialities", Icon: Stethoscope },
  { key: "expertise", label: "Expertise", plural: "areas of expertise", Icon: BadgeCheck },
  { key: "hospitals", label: "Hospital", plural: "hospitals", Icon: Building2 },
  { key: "languages", label: "Language", plural: "languages", Icon: Languages },
  { key: "genders", label: "Doctor gender", plural: "gender options", Icon: UserRound },
] as const;

export default function DoctorFilters({ doctors, matchingDoctors, value, onChange, showAvailability = true, showResultCounts = true, availabilityEnabled = true, mode = "hospital" }: Props) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };
  const [searches, setSearches] = useState<Partial<Record<DoctorMultiFilterKey, string>>>({});
  const [expanded, setExpanded] = useState<Partial<Record<DoctorMultiFilterKey, boolean>>>({});
  const finishListToggle = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const finish = finishListToggle.current;
    finishListToggle.current = null;
    finish?.();
  }, [expanded]);
  const [openGroup, setOpenGroup] = useState<DoctorMultiFilterKey | "availability" | null>("specialties");
  return (
    <div className={styles.filters}>
      <LayoutGroup id={id}>{groups.map((group) => {
        const counts = matchingDoctors ? new Map(doctorFilterOptions(matchingDoctors, value, mode, group.key).map(option => [option.value, option.count])) : null;
        const options = doctorFilterOptions(doctors, value, mode, group.key).map(option => counts ? { ...option, count: counts.get(option.value) ?? 0 } : option);
        const search = searches[group.key] ?? "";
        const matching = options.filter((option) => option.value.toLowerCase().includes(search.trim().toLowerCase()));
        const visible = search.trim() || expanded[group.key] ? matching : matching.filter((option, index) => index < 5 || value[group.key].includes(option.value));
        const hidden = matching.length - visible.length;
        const Icon = group.Icon;
        const open = openGroup === group.key;
        const triggerId = `${id}-${group.key}-trigger`;
        const panelId = `${id}-${group.key}-panel`;
        return <Fragment key={group.key}><motion.section className={styles.group} data-filter-group data-expanded={open} aria-labelledby={triggerId} layout={reducedMotion ? false : "position"} transition={transition}>
          <div className={styles.groupHeader} data-filter-category-header><h3 className={styles.groupHeading}><motion.button type="button" id={triggerId} className={styles.groupToggle} aria-expanded={open} aria-controls={panelId}
            transition={transition}
            onClick={(event) => { if (open) keepFilterHeadingVisible(event.currentTarget); setOpenGroup(open ? null : group.key); }}>
            <Icon size={17} className={styles.groupIcon} aria-hidden /><span className={styles.groupLabel}>{group.label}</span>
            {value[group.key].length > 0 && <motion.span className={styles.count}
              initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>{value[group.key].length}</motion.span>}
            <ChevronDown size={16} className={styles.chevron} aria-hidden />
          </motion.button></h3>
          <button type="button" className={styles.clearGroup} disabled={value[group.key].length === 0} aria-hidden={value[group.key].length === 0}
            aria-label={`Clear ${group.label.toLowerCase()}`} title={`Clear ${group.label.toLowerCase()}`}
            onClick={() => { onChange({ ...value, [group.key]: [] }); document.getElementById(triggerId)?.focus({ preventScroll: true }); }}>Clear</button>
          </div>
          <div id={panelId} className={styles.panel} aria-labelledby={triggerId} aria-hidden={!open} inert={!open}>
          <AnimatePresence initial={false} mode="popLayout">{open && <motion.div key="content"
            initial={reducedMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: { duration: reducedMotion ? 0 : 0.12 } }} transition={transition}>
          {(group.key === "hospitals" || options.length > 5) && (
            <label className={styles.search}>
              <Search size={16} aria-hidden />
              <input type="search" value={search} onChange={(e) => setSearches({ ...searches, [group.key]: e.target.value })}
                placeholder={`Search ${group.label.toLowerCase()}`} aria-label={`Search ${group.label.toLowerCase()} filters`} />
            </label>
          )}
          <fieldset id={`${id}-${group.key}`} className={styles.options}>
            <legend className={styles.srOnly}>{group.label}</legend>
            {options.length === 0 && <p className={styles.hint}>{group.label} details haven’t been provided for these doctors.</p>}
            {visible.map((option) => {
              const selected = value[group.key].includes(option.value);
              return <motion.label key={option.value} className={styles.option} tabIndex={-1} layout={reducedMotion ? false : "position"}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
                <span className={styles.checkControl}>
                  <input type="checkbox" checked={selected} disabled={!selected && option.count === 0}
                    onChange={() => onChange({ ...value, [group.key]: selected
                      ? value[group.key].filter((item) => item !== option.value) : [...value[group.key], option.value] })} />
                  <Check size={14} strokeWidth={2} absoluteStrokeWidth className={styles.checkIcon} aria-hidden />
                </span>
                <span className={styles.optionLabel}>{option.value}</span>{showResultCounts && <span className={styles.resultCount} aria-label={`${option.count} matching doctors`}>{option.count}</span>}
              </motion.label>;
            })}
            {options.length > 0 && matching.length === 0 && <p className={styles.hint} role="status">No matches. Try another search.</p>}
          </fieldset>
          {!search.trim() && (hidden > 0 || expanded[group.key]) && options.length > 5 && <button type="button" className={styles.showMore} aria-expanded={Boolean(expanded[group.key])} aria-controls={`${id}-${group.key}`}
            aria-label={expanded[group.key] ? `Show fewer ${group.plural}` : `Show ${hidden} more ${group.plural}`}
            onClick={(event) => {
              finishListToggle.current = prepareFilterListToggle(event.currentTarget, !expanded[group.key]);
              setExpanded((previous) => ({ ...previous, [group.key]: !previous[group.key] }));
            }}>{expanded[group.key] ? "Show less" : `Show ${hidden} more`}</button>}
          </motion.div>}</AnimatePresence>
          </div>
        </motion.section>
          {group.key === "hospitals" && showAvailability && <AvailabilityFilter value={value.availability} enabled={availabilityEnabled}
            open={openGroup === "availability"} onOpenChange={(open) => setOpenGroup(open ? "availability" : null)}
            onChange={(availability) => onChange({ ...value, availability })} />}
        </Fragment>;
      })}</LayoutGroup>
    </div>
  );
}
