"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import styles from "./DoctorSearchTop.module.css";

interface Props {
  id: string;
  query: string;
  onQuery: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  searchLabel: string;
  inputLabel: string;
  locationControl?: ReactNode;
  placeholder?: string;
  hint?: (paused: boolean) => ReactNode;
  maxLength?: number;
}

/** Shared search surface for doctor booking and health checkups. */
export default function SearchLocationUnit({ id, query, onQuery, onSubmit, searchLabel, inputLabel, locationControl, placeholder = " ", hint, maxLength }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [paused, setPaused] = useState(false);
  return <div className={locationControl ? styles.combinedSearch : styles.searchContents}>
    {locationControl}
    <form role="search" aria-label={searchLabel} className={styles.form} onSubmit={onSubmit}>
      <div className={styles.searchField}>
        <label className={styles.srOnly} htmlFor={id}>{inputLabel}</label>
        <input ref={input} id={id} type="search" value={query} autoComplete="off" enterKeyHint="search" maxLength={maxLength}
          placeholder={placeholder} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onChange={event => onQuery(event.target.value)} />
        {hint?.(paused)}
        <button type="button" className={styles.clear} aria-label="Clear search" disabled={!query} aria-hidden={!query}
          onClick={() => { onQuery(""); input.current?.focus({ preventScroll: true }); }}><X size={16} aria-hidden /></button>
      </div>
      <button type="submit" className={styles.submit} aria-label={`Search and show ${searchLabel === "Find a doctor" ? "doctor" : "health checkup"} results`} title="Search">
        <Search size={20} aria-hidden />
      </button>
    </form>
  </div>;
}
