"use client";

import { useRef, useState, type FormEvent, type ReactNode, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import styles from "./SearchToolbar.module.css";

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
  inputProps?: Pick<InputHTMLAttributes<HTMLInputElement>, "onFocus" | "onKeyDown" | "role" | "aria-controls" | "aria-expanded" | "aria-activedescendant" | "aria-autocomplete">;
}

/** Shared search surface for doctor booking and health checkups. */
export default function SearchLocationUnit({ id, query, onQuery, onSubmit, searchLabel, inputLabel, locationControl, placeholder = " ", hint, maxLength, inputProps }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const [paused, setPaused] = useState(false);
  return <div className={locationControl ? styles.combinedSearch : styles.searchContents}>
    {locationControl}
    <form role="search" aria-label={searchLabel} className={styles.form} onSubmit={onSubmit}>
      <div className={styles.searchField}>
        <label className={styles.srOnly} htmlFor={id}>{inputLabel}</label>
        <input {...inputProps} ref={input} id={id} type="search" value={query} autoComplete="off" enterKeyHint="search" maxLength={maxLength}
          placeholder={placeholder} onFocus={event => { setPaused(true); inputProps?.onFocus?.(event); }} onBlur={() => setPaused(false)} onChange={event => onQuery(event.target.value)}
          onKeyDown={event => {
            inputProps?.onKeyDown?.(event);
            if (event.key === "Escape") input.current?.blur();
          }} />
        {hint?.(paused)}
        <button type="button" className={styles.clear} aria-label="Clear search" disabled={!query} aria-hidden={!query}
          onClick={() => { onQuery(""); setPaused(false); submit.current?.focus({ preventScroll: true }); }}><X size={16} aria-hidden /></button>
      </div>
      <button ref={submit} type="submit" className={styles.submit} aria-label={`Search and show ${searchLabel === "Find a doctor" ? "doctor" : "health checkup"} results`} title="Search">
        <Search size={20} aria-hidden />
      </button>
    </form>
  </div>;
}
