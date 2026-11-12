"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { Activity, Check, ChevronDown, ListFilter, MapPin, Search, Stethoscope, X } from "lucide-react";
import { NH_CITIES } from "@/lib/searchService";
import { TREATMENTS_PROCEDURES_DATA } from "@/data/treatmentsProceduresData";
import { PROCEDURE_CLASSIFICATIONS, type TreatmentFilters } from "./treatmentFilters";
import filterStyles from "@/app/search/doctors/DoctorFilters.module.css";
import searchStyles from "@/app/search/designs/d21/FilterSearch.module.css";
import styles from "./TreatmentFilterPanel.module.css";
import { keepFilterHeadingVisible, prepareFilterListToggle } from "@/app/search/doctors/filterScrolling";

type GroupKey = keyof TreatmentFilters | "cities";

interface Props {
  value: TreatmentFilters;
  cities: string[];
  onToggle: (group: GroupKey, option: string) => void;
}

const specialties = [...new Set(TREATMENTS_PROCEDURES_DATA.map(item => item.speciality))].sort((a, b) => a.localeCompare(b));
const letters = [...new Set(TREATMENTS_PROCEDURES_DATA.map(item => (item.shortTitle || item.title).charAt(0).toUpperCase()))].sort();
const groups = [
  { key: "specialties", label: "Clinical speciality", Icon: Stethoscope, options: specialties },
  { key: "classifications", label: "Procedure type", Icon: Activity, options: [...PROCEDURE_CLASSIFICATIONS] },
  { key: "letters", label: "Alphabetical (A–Z)", Icon: ListFilter, options: letters },
  { key: "cities", label: "Hospital location", Icon: MapPin, options: NH_CITIES.map(city => city.value) },
] as const;

export default function TreatmentFilterPanel({ value, cities, onToggle }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<GroupKey | null>("specialties");
  const [expanded, setExpanded] = useState<Partial<Record<GroupKey, boolean>>>({});
  const finishListToggle = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const finish = finishListToggle.current;
    finishListToggle.current = null;
    finish?.();
  }, [expanded]);
  const searching = Boolean(query.trim());
  const matches = (label: string, option: string) => `${label} ${option}`.toLowerCase().includes(query.trim().toLowerCase());
  const visibleGroups = groups.filter(group => !searching || group.options.some(option => matches(group.label, option)));

  return <div className={filterStyles.filters}>
    <label className={`${searchStyles.search} ${styles.search}`} data-filter-search>
      <Search size={16} aria-hidden />
      <input type="search" placeholder="Search filters" aria-label="Search procedure filters" value={query} onChange={event => setQuery(event.target.value)} />
      {query && <button type="button" className={searchStyles.clear} aria-label="Clear filter search" onClick={() => setQuery("")}><X size={14} aria-hidden /></button>}
    </label>
    {!visibleGroups.length && <p className={filterStyles.hint} role="status">No matching filters. Try another search.</p>}
    {visibleGroups.map(group => {
      const selected = group.key === "cities" ? cities : value[group.key];
      const open = searching || openGroup === group.key;
      const matching = group.options.filter(option => !searching || matches(group.label, option));
      const visible = searching || expanded[group.key] || group.key === "letters" ? matching : matching.filter((option, index) => index < 5 || selected.includes(option));
      const hidden = matching.length - visible.length;
      const triggerId = `${id}-${group.key}-trigger`;
      const panelId = `${id}-${group.key}-options`;
      const Icon = group.Icon;
      return <section key={group.key} className={filterStyles.group} data-filter-group data-expanded={open} aria-labelledby={triggerId}>
        <div className={filterStyles.groupHeader} data-filter-category-header>
          <h3 className={filterStyles.groupHeading}>
            <button type="button" id={triggerId} className={`${filterStyles.groupToggle} ${filterStyles.unclutteredToggle}`} aria-expanded={open} aria-controls={panelId}
              onClick={event => {
                if (open) keepFilterHeadingVisible(event.currentTarget);
                setOpenGroup(openGroup === group.key ? null : group.key);
              }}>
              <Icon size={17} className={filterStyles.groupIcon} aria-hidden />
              <span className={filterStyles.groupLabel}>{group.label}</span>
              {selected.length > 0 && <span className={filterStyles.count}>{selected.length}</span>}
              <ChevronDown size={16} className={filterStyles.chevron} aria-hidden />
            </button>
          </h3>
        </div>
        <div id={panelId} hidden={!open}>
          <fieldset className={`${filterStyles.options} ${group.key === "letters" ? styles.letters : ""}`}>
            <legend className={filterStyles.srOnly}>{group.label}</legend>
            {visible.map(option => {
              const label = group.key === "cities" ? NH_CITIES.find(city => city.value === option)?.label ?? option : option;
              return <label key={option} className={filterStyles.option}>
                <span className={filterStyles.checkControl}>
                  <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(group.key, option)} />
                  <Check size={14} className={filterStyles.checkIcon} aria-hidden />
                </span>
                <span className={filterStyles.optionLabel}>{label}</span>
              </label>;
            })}
          </fieldset>
          {!searching && group.key !== "letters" && (hidden > 0 || expanded[group.key]) && <button type="button" className={filterStyles.showMore}
            aria-expanded={Boolean(expanded[group.key])} aria-controls={panelId}
            onClick={event => {
              finishListToggle.current = prepareFilterListToggle(event.currentTarget, !expanded[group.key]);
              setExpanded(previous => ({ ...previous, [group.key]: !previous[group.key] }));
            }}>
            {expanded[group.key] ? "Show less" : `Show ${hidden} more`}
          </button>}
        </div>
      </section>;
    })}
  </div>;
}
