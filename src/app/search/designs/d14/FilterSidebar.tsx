"use client";

import { useId, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  activeFilterCount, availabilityLabels, doctorFilterValues, emptyDoctorFilters,
  type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorMultiFilterKey,
} from "@/features/search/doctorListing";
import { refineDesign7Doctors } from "../d7/directory";
import { FEE_OPTIONS, filterByFee, type FeeFilter } from "./filtering";
import styles from "./FilterSidebar.module.css";

export interface DoctorFilterProps {
  doctors: DoctorListingItem[];
  filters: DoctorFilters;
  fee: FeeFilter;
  mode: ConsultationMode;
  now: Date;
  onChange: (filters: DoctorFilters, fee: FeeFilter) => void;
}

interface FilterOption { value: string; count: number }
const PREVIEW_OPTIONS = 4;

function optionsFor({ doctors, filters, fee, mode, now }: DoctorFilterProps, key: DoctorMultiFilterKey): FilterOption[] {
  const candidates = filterByFee(refineDesign7Doctors(doctors, { ...filters, [key]: [] }, mode, "relevance", now), fee);
  const counts = new Map<string, number>();
  for (const doctor of candidates) {
    for (const value of new Set(doctorFilterValues(doctor, key))) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const values = new Set([...doctors.flatMap((doctor) => [...doctorFilterValues(doctor, key)]), ...filters[key]]);
  return [...values].filter(Boolean).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, count: counts.get(value) ?? 0 }));
}

function MultiGroup({ title, options, selected, onChange, initiallyOpen = false }: {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  initiallyOpen?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const matching = options.filter((option) => selected.includes(option.value) || option.value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => Number(selected.includes(b.value)) - Number(selected.includes(a.value)));
  const shown = showAll ? matching : matching.slice(0, Math.max(PREVIEW_OPTIONS, selected.length));
  if (!options.length) return null;
  return <details className={styles.group} open={initiallyOpen || selected.length > 0}>
    <summary><span>{title}</span>{selected.length > 0 && <span className={styles.selectedCount}>{selected.length}<span className={styles.srOnly}> selected</span></span>}<ChevronDown size={16} aria-hidden /></summary>
    <fieldset className={styles.options}>
      <legend className={styles.srOnly}>{title}</legend>
      {options.length > PREVIEW_OPTIONS && <div className={styles.search}>
        <Search size={15} aria-hidden />
        <input id={`${id}-search`} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false); }} placeholder={`Search ${title.toLowerCase()}`} aria-label={`Search ${title.toLowerCase()} filters`} autoComplete="off" />
        {query && <button type="button" onClick={() => { setQuery(""); document.getElementById(`${id}-search`)?.focus(); }} aria-label={`Clear ${title.toLowerCase()} search`}><X size={14} aria-hidden /></button>}
      </div>}
      {shown.map((option) => {
        const checked = selected.includes(option.value);
        return <label className={styles.option} key={option.value} data-empty={option.count === 0 && !checked || undefined}>
          <input type="checkbox" checked={checked} disabled={option.count === 0 && !checked}
            onChange={() => onChange(checked ? selected.filter((value) => value !== option.value) : [...selected, option.value])} />
          <span className={styles.optionLabel}>{option.value}</span>
          <span className={styles.optionCount} aria-hidden>{option.count}</span>
          <span className={styles.srOnly}>{option.count} {option.count === 1 ? "doctor matches" : "doctors match"} other filters</span>
        </label>;
      })}
      {!matching.length && <p className={styles.empty}>No matching options. Try another search.</p>}
      {matching.length > shown.length
        ? <button type="button" className={styles.showMore} onClick={() => setShowAll(true)}>Show {matching.length - shown.length} more</button>
        : showAll && matching.length > Math.max(PREVIEW_OPTIONS, selected.length) && <button type="button" className={styles.showMore} onClick={() => setShowAll(false)}>Show fewer</button>}
    </fieldset>
  </details>;
}

/** Shared controls: immediate in the sidebar, draft-only inside FilterSheet. */
export function FilterControls(props: DoctorFilterProps) {
  const { doctors, filters, fee, mode, now, onChange } = props;
  const id = useId();
  const multiGroup = (key: DoctorMultiFilterKey, title: string, initiallyOpen = false) => <MultiGroup key={key} title={title} options={optionsFor(props, key)} selected={filters[key]} initiallyOpen={initiallyOpen}
    onChange={(values) => onChange({ ...filters, [key]: values }, fee)} />;
  const feeCandidates = refineDesign7Doctors(doctors, filters, mode, "relevance", now);
  return <div className={styles.groups}>
    {multiGroup("specialties", "Speciality", true)}
    <details className={styles.group} open>
      <summary><span>Availability</span>{filters.availability !== "any" && <span className={styles.selectedCount}>1<span className={styles.srOnly}> selected</span></span>}<ChevronDown size={16} aria-hidden /></summary>
      <fieldset className={styles.options}><legend className={styles.srOnly}>Availability</legend>
        {(Object.entries(availabilityLabels) as [DoctorFilters["availability"], string][]).map(([value, label]) => {
          const count = filterByFee(refineDesign7Doctors(doctors, { ...filters, availability: value }, mode, "relevance", now), fee).length;
          return <label className={styles.option} key={value}><input type="radio" name={`${id}-availability`} checked={filters.availability === value} onChange={() => onChange({ ...filters, availability: value }, fee)} /><span className={styles.optionLabel}>{label}</span><span className={styles.optionCount} aria-hidden>{count}</span><span className={styles.srOnly}>{count} matching doctors</span></label>;
        })}
      </fieldset>
    </details>
    {multiGroup("hospitals", "Hospital")}
    <details className={styles.group} open={fee !== "any"}>
      <summary><span>Consultation fee</span>{fee !== "any" && <span className={styles.selectedCount}>1<span className={styles.srOnly}> selected</span></span>}<ChevronDown size={16} aria-hidden /></summary>
      <fieldset className={styles.options}><legend className={styles.srOnly}>Consultation fee</legend>
        {FEE_OPTIONS.map((option) => {
          const count = filterByFee(feeCandidates, option.value).length;
          return <label className={styles.option} key={option.value}><input type="radio" name={`${id}-fee`} checked={fee === option.value} onChange={() => onChange(filters, option.value)} /><span className={styles.optionLabel}>{option.label}</span><span className={styles.optionCount} aria-hidden>{count}</span><span className={styles.srOnly}>{count} matching doctors</span></label>;
        })}
        <p className={styles.note}>Any fee includes doctors whose fee isn’t listed.</p>
      </fieldset>
    </details>
    {multiGroup("languages", "Language")}
    {multiGroup("genders", "Doctor gender")}
    {multiGroup("expertise", "Areas of care")}
  </div>;
}

export default function FilterSidebar(props: DoctorFilterProps) {
  const count = activeFilterCount(props.filters) + Number(props.fee !== "any");
  return <aside className={styles.sidebar} aria-label="Filter doctors" data-journey-palette="dark">
    <header className={styles.header}><h2><SlidersHorizontal size={17} aria-hidden />Filters{count > 0 && <span>{count}<span className={styles.srOnly}> active</span></span>}</h2>
      <button type="button" disabled={count === 0} onClick={() => props.onChange(emptyDoctorFilters(), "any")}>Clear all</button>
    </header>
    <FilterControls {...props} />
  </aside>;
}
