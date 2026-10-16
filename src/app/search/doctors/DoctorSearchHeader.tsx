"use client";

import { useRef, type FormEvent } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { NH_CITIES } from "@/lib/searchService";
import styles from "./DoctorSearchHeader.module.css";

interface Props {
  query: string;
  location: string;
  onQueryChange: (query: string) => void;
  onLocationChange: (city: string) => void;
  onSubmit: (event: FormEvent) => void;
  onOpenFilters: () => void;
  filterCount: number;
  navVisible: boolean;
}

export default function DoctorSearchHeader({ query, location, onQueryChange, onLocationChange, onSubmit, onOpenFilters, filterCount, navVisible }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return <>
    <div className={styles.spacer} aria-hidden />
    <header className={`${styles.header} ${!navVisible ? styles.compact : ""}`}>
      <form role="search" aria-label="Find a doctor" className={styles.form} onSubmit={onSubmit}>
        <div className={styles.search}>
          <Search size={20} aria-hidden />
          <input ref={inputRef} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Doctor, speciality or condition" aria-label="Search doctors by name, speciality or condition" enterKeyHint="search" autoComplete="off" />
          {query && <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => { onQueryChange(""); inputRef.current?.focus(); }}><X size={18} /></button>}
          <button type="submit" className={styles.submit}>Search<Arrow /></button>
        </div>
        <div className={styles.location}>
          <MapPin size={18} aria-hidden />
          <label className={styles.srOnly} htmlFor="doctor-city">Choose city</label>
          <select id="doctor-city" value={location} onChange={(event) => onLocationChange(event.target.value)}>
            <option value="All">All cities</option>
            {NH_CITIES.map((city) => <option key={city.id} value={city.value}>{city.label}</option>)}
          </select>
          <ChevronDown size={16} className={styles.chevron} aria-hidden />
        </div>
        <button type="button" className={styles.filters} onClick={onOpenFilters} aria-haspopup="dialog" aria-label={`Filters${filterCount ? `, ${filterCount} active` : ""}`}>
          <SlidersHorizontal size={18} aria-hidden /><span>Filters</span>{filterCount > 0 && <span className={styles.badge}>{filterCount}</span>}
        </button>
      </form>
    </header>
  </>;
}

function Arrow() { return <span aria-hidden>→</span>; }
