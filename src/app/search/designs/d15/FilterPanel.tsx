"use client";

import { useId, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { ConsultationMode, DoctorFilters, DoctorListingItem } from "@/features/search/doctorListing";
import { design15FilterOptions, FILTER_GROUPS } from "./directory";
import styles from "./FilterPanel.module.css";

interface Props {
  doctors: DoctorListingItem[];
  filters: DoctorFilters;
  mode: ConsultationMode;
  now: Date;
  onChange: (filters: DoctorFilters) => void;
}
type GroupKey = typeof FILTER_GROUPS[number]["key"];
const PREVIEW_COUNT = 4;

function FilterGroup({ id, title, open, options, selected, onChange }: {
  id: string; title: string; open: boolean; options: { value: string; count: number }[];
  selected: string[]; onChange: (values: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matching = options.filter(option => selected.includes(option.value) || option.value.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => Number(selected.includes(b.value)) - Number(selected.includes(a.value)));
  const limit = Math.max(PREVIEW_COUNT, selected.length);
  const shown = showAll ? matching : matching.slice(0, limit);

  return <section id={id} className={styles.group} data-open={open || undefined} aria-label={`${title} filters`}>
    <header className={styles.groupHeading}><h3>{title}</h3>{selected.length > 0 && <span className={styles.selectedCount}>{selected.length}<span className={styles.srOnly}> selected</span></span>}</header>
    <fieldset className={styles.options}><legend className={styles.srOnly}>{title}</legend>
      {options.length > PREVIEW_COUNT && <div className={styles.search}><Search size={15} aria-hidden /><label className={styles.srOnly} htmlFor={`${id}-search`}>Search {title.toLowerCase()} filters</label>
        <input id={`${id}-search`} type="search" value={query} autoComplete="off" placeholder={`Search ${title.toLowerCase()}`} onChange={event => { setQuery(event.target.value); setShowAll(false); }} />
        {query && <button type="button" aria-label={`Clear ${title.toLowerCase()} search`} onClick={() => { setQuery(""); document.getElementById(`${id}-search`)?.focus(); }}><X size={14} aria-hidden /></button>}
      </div>}
      {shown.map(option => {
        const checked = selected.includes(option.value);
        return <label className={styles.option} key={option.value} data-unavailable={option.count === 0 && !checked || undefined}>
          <input type="checkbox" checked={checked} disabled={option.count === 0 && !checked} onChange={() => onChange(checked ? selected.filter(value => value !== option.value) : [...selected, option.value])} />
          <span className={styles.optionLabel}>{option.value}</span><small className={styles.optionCount} aria-hidden>{option.count}</small><span className={styles.srOnly}>{option.count} {option.count === 1 ? "doctor matches" : "doctors match"} other filters</span>
        </label>;
      })}
      {!matching.length && <p className={styles.empty}>{options.length ? "No matching options. Try another search." : "No options for this search."}</p>}
      {matching.length > shown.length ? <button type="button" className={styles.more} onClick={() => setShowAll(true)} aria-label={`Show ${matching.length - shown.length} more ${title.toLowerCase()} options`}>Show {matching.length - shown.length} more</button>
        : showAll && matching.length > limit && <button type="button" className={styles.more} onClick={() => setShowAll(false)}>Show fewer</button>}
    </fieldset>
  </section>;
}

export default function FilterPanel({ doctors, filters, mode, now, onChange }: Props) {
  const id = useId();
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  return <aside className={styles.panel} aria-label="Filter doctors">
    <h2 className={styles.title}>Refine your search</h2>
    <div className={styles.mobileGroups} aria-label="Filter groups">{FILTER_GROUPS.map(({ key, label }) => <button key={key} type="button" aria-expanded={openGroup === key} aria-controls={`${id}-${key}`} onClick={() => setOpenGroup(current => current === key ? null : key)}>
      <span>{label}</span>{filters[key].length > 0 && <span className={styles.selectedCount}>{filters[key].length}<span className={styles.srOnly}> selected</span></span>}<ChevronDown size={13} aria-hidden />
    </button>)}</div>
    <div className={styles.groups}>{FILTER_GROUPS.map(({ key, label }) => <FilterGroup key={key} id={`${id}-${key}`} title={label} open={openGroup === key}
      options={design15FilterOptions(doctors, filters, mode, now, key)} selected={filters[key]} onChange={values => onChange({ ...filters, [key]: values })} />)}</div>
  </aside>;
}
