"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Filter, MapPin, Search, X } from "lucide-react";
import type Lenis from "lenis";
import { NH_CITIES } from "@/lib/searchService";
import type { ConsultationMode } from "@/features/search/doctorListing";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import DoctorSearchHint from "./DoctorSearchHint";
import styles from "./DoctorSearchTop.module.css";

interface Props {
  query: string; location: string; total: number; mode: ConsultationMode;
  loading: boolean; error: boolean; filterCount: number; children: ReactNode;
  onQuery: (query: string) => void; onLocation: (location: string) => void;
  onOpenFilters: () => void;
}

export default function DoctorSearchTop({ query, location, total, mode, loading, error, filterCount, children, onQuery, onLocation, onOpenFilters }: Props) {
  const reducedMotion = Boolean(useReducedMotion());
  const [navVisible, setNavVisible] = useState(true);
  const [hintsPaused, setHintsPaused] = useState(false);
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const current = window.scrollY;
      if (current < 120) { setNavVisible(true); last = current; return; }
      if (Math.abs(current - last) < 12) return;
      setNavVisible(current < last);
      last = current;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const heading = document.getElementById("d3-results-title");
    if (!heading) return;
    const page = heading.closest<HTMLElement>("[data-design]");
    const inset = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
    const gap = page ? parseFloat(getComputedStyle(page).getPropertyValue("--sp-2")) : 0;
    const top = Math.max(0, window.scrollY + heading.getBoundingClientRect().top - inset - gap);
    // Hand scrolling to the site's existing Lenis instance so its momentum cannot
    // fight the search submission. Focus is visible when the movement completes.
    const focus = () => heading.focus({ preventScroll: true });
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(top, { duration: .4, immediate: reducedMotion, onComplete: focus });
    else { window.scrollTo({ top, behavior: "instant" }); focus(); }
  };

  const locationSelect = (className: string) => <label className={`${styles.location} ${className}`} data-active={location !== "All" || undefined}>
    <MapPin size={16} aria-hidden />
    <span className={styles.srOnly}>Search location</span>
    <select value={location} onChange={(event) => onLocation(event.target.value)}>
      <option value="All">All locations</option>
      {NH_CITIES.map((city) => <option key={city.id} value={city.value}>{city.label}</option>)}
    </select>
  </label>;
  const filterButton = <button type="button" className={styles.filterButton} data-active={filterCount > 0 || undefined} onClick={onOpenFilters} aria-haspopup="dialog"
    aria-label={`Filters${filterCount ? `, ${filterCount} active` : ""}`} title="Filters">
    <Filter size={16} aria-hidden /><span className={styles.filterLabel}>Filters</span>{filterCount > 0 && <span className={styles.filterCount} aria-hidden>{filterCount}</span>}
  </button>;

  return <>
    <div className={styles.navGap} aria-hidden />
    <header className={`${styles.container} ${styles.titleRow}`}>
      <div className={styles.title}>
        <h1 id="d3-results-title" tabIndex={-1}>Find a doctor</h1>
        {/* Keep the heading readable and focusable beneath the decorative brand wipe. */}
        {!reducedMotion && <div className={styles.titleSweep} aria-hidden="true">
          <TextSweepEffect words={["Find a doctor"]} sweepMs={1200}
            sweepColor="var(--d3-ui-accent, var(--color-primary))" finalColor="var(--color-text)" />
        </div>}
      </div>
      <div className={styles.summary}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {loading ? "Searching…" : error ? "Results unavailable" : <><strong>{total}</strong> {total === 1 ? "doctor" : "doctors"}</>}
          <span className={styles.srOnly}>{query.trim() ? ` matching ${query.trim()}` : ""}, {location === "All" ? "all locations" : location}, {mode === "hospital" ? "hospital visits" : "video consultations"}</span>
        </p>
      </div>
      {locationSelect(styles.mobileLocation)}
    </header>
    <div className={`${styles.searchBar} ${!navVisible ? styles.navHidden : ""}`} data-d3-search-bar data-d3-ui>
      <div className={`${styles.container} ${styles.toolbarContent}`}>
        <div className={styles.searchRow}>
          <form role="search" aria-label="Find a doctor" className={styles.form} onSubmit={submit}>
            <div className={styles.searchField}>
              <label className={styles.srOnly} htmlFor="d3-search">Search doctors by name, speciality or hospital</label>
              <input id="d3-search" type="search" value={query} autoComplete="off" enterKeyHint="search"
                placeholder=" " onFocus={() => setHintsPaused(true)} onChange={(event) => onQuery(event.target.value)} />
              <DoctorSearchHint active={!query} paused={hintsPaused} />
              <button type="button" className={styles.clear} aria-label="Clear search" disabled={!query} aria-hidden={!query}
                onClick={() => { onQuery(""); document.getElementById("d3-search")?.focus({ preventScroll: true }); }}><X size={16} aria-hidden /></button>
            </div>
            <button type="submit" className={styles.submit} aria-label="Search and show doctor results" title="Search">
              <Search size={20} aria-hidden />
            </button>
          </form>
          {locationSelect(styles.desktopLocation)}
          {filterButton}
        </div>
        {children}
      </div>
    </div>
  </>;
}
