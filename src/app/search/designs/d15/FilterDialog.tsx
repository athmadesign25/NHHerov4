"use client";

import { useId, useState } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { emptyDoctorFilters, type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorMultiFilterKey } from "@/features/search/doctorListing";
import { design15FilterOptions, FILTER_GROUPS, refineDesign15Doctors } from "./directory";
import Modal from "./Modal";
import styles from "./FilterDialog.module.css";

function FilterGroup({ title, options, selected, onChange, initialOpen }: {
  title: string; options: { value: string; count: number }[]; selected: string[]; onChange: (values: string[]) => void; initialOpen: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  const matching = options.filter((option) => selected.includes(option.value) || option.value.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(selected.includes(b.value)) - Number(selected.includes(a.value)));
  const shown = all ? matching : matching.slice(0, Math.max(5, selected.length));
  return <details className={styles.group} open={initialOpen || selected.length > 0}>
    <summary><span>{title}</span>{selected.length > 0 && <span className={styles.count}>{selected.length} selected</span>}<ChevronDown size={16} aria-hidden /></summary>
    <fieldset><legend className={styles.srOnly}>{title}</legend>
      {options.length > 5 && <div className={styles.search}><Search size={16} aria-hidden /><label className={styles.srOnly} htmlFor={id}>Search {title.toLowerCase()}</label><input id={id} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setAll(false); }} placeholder={`Search ${title.toLowerCase()}`} /></div>}
      {shown.map((option) => <label className={styles.option} key={option.value}><input type="checkbox" checked={selected.includes(option.value)} disabled={option.count === 0 && !selected.includes(option.value)} onChange={() => onChange(selected.includes(option.value) ? selected.filter((value) => value !== option.value) : [...selected, option.value])} /><span>{option.value}</span><small aria-label={`${option.count} matching doctors`}>{option.count}</small></label>)}
      {!matching.length && <p className={styles.empty}>No matching options.</p>}
      {matching.length > shown.length ? <button type="button" className={styles.more} onClick={() => setAll(true)}>Show {matching.length - shown.length} more</button>
        : all && matching.length > Math.max(5, selected.length) && <button type="button" className={styles.more} onClick={() => setAll(false)}>Show fewer</button>}
    </fieldset>
  </details>;
}

export default function FilterDialog({ doctors, filters, mode, now, onApply, onClose }: {
  doctors: DoctorListingItem[]; filters: DoctorFilters; mode: ConsultationMode; now: Date; onApply: (filters: DoctorFilters) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => ({ ...filters, specialties: [...filters.specialties], hospitals: [...filters.hospitals], languages: [...filters.languages] }));
  const count = refineDesign15Doctors(doctors, draft, mode, now).length;
  const selectedCount = draft.specialties.length + draft.hospitals.length + draft.languages.length;
  const setGroup = (key: DoctorMultiFilterKey, values: string[]) => setDraft((previous) => ({ ...previous, [key]: values }));
  return <Modal title="Refine your search" onClose={onClose} footer={<div className={styles.footer}><button type="button" className={styles.clear} disabled={!selectedCount} onClick={() => setDraft({ ...emptyDoctorFilters(), availability: filters.availability })}>Clear filters</button><button type="button" className={styles.apply} onClick={() => { onApply(draft); onClose(); }}>Show {count} {count === 1 ? "doctor" : "doctors"}<ArrowRight size={16} aria-hidden /></button></div>}>
    <p className={styles.intro} role="status" aria-live="polite">{count} {count === 1 ? "doctor matches" : "doctors match"} your choices.</p>
    {FILTER_GROUPS.map(({ key, label }, index) => <FilterGroup key={key} title={label} options={design15FilterOptions(doctors, draft, mode, now, key)} selected={draft[key]} onChange={(values) => setGroup(key, values)} initialOpen={index === 0} />)}
  </Modal>;
}
