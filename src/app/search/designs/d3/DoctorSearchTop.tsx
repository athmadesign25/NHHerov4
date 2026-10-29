"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Filter, Loader2, MapPin, Search, X } from "lucide-react";
import type Lenis from "lenis";
import { NH_CITIES } from "@/lib/searchService";
import type { ConsultationMode } from "@/features/search/doctorListing";
import { requestDoctorCity } from "@/features/search/doctorLocation";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import DoctorSearchHint from "./DoctorSearchHint";
import styles from "./DoctorSearchTop.module.css";

interface Props {
  query: string; location: string; total: number; mode: ConsultationMode;
  heading: string; summary: string; locationFirst?: boolean;
  compactMobile?: boolean; hideTotal?: boolean;
  loading: boolean; error: boolean; filterCount: number; children: ReactNode;
  onQuery: (query: string) => void; onLocation: (location: string) => void;
  onOpenFilters: () => void;
}

export default function DoctorSearchTop({ query, location, total, mode, heading, summary, locationFirst = false, compactMobile = false, hideTotal = false, loading, error, filterCount, children, onQuery, onLocation, onOpenFilters }: Props) {
  const reducedMotion = Boolean(useReducedMotion());
  const [navVisible, setNavVisible] = useState(true);
  const [hintsPaused, setHintsPaused] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState<string | null>(null);
  const [locationFeedback, setLocationFeedback] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const locationOffered = useRef(false);
  const automaticRequest = useRef(0);
  const locationChange = useRef(onLocation);
  const locationPointerInteraction = useRef(false);
  useEffect(() => { locationChange.current = onLocation; }, [onLocation]);
  const rememberLocationOffer = () => {
    locationOffered.current = true;
    // Store only that we requested permission, never coordinates or a city.
    try { sessionStorage.setItem("nh:d3:location-requested", "1"); } catch { /* Storage may be unavailable. */ }
  };
  const detectLocation = async () => {
    const request = ++automaticRequest.current;
    const sourceLocation = window.location.search;
    const sameCity = () => {
      const before = new URLSearchParams(sourceLocation);
      const after = new URLSearchParams(window.location.search);
      return ["location", "city", "cityId"].every((key) => before.get(key) === after.get(key));
    };
    setDetectingLocation(location);
    setLocationFeedback(false);
    setLocationStatus("Finding your location…");
    const result = await requestDoctorCity(() => request === automaticRequest.current && sameCity());
    if (request !== automaticRequest.current) return;
    setDetectingLocation(null);
    if (!sameCity()) { setLocationStatus(""); return; }
    setLocationFeedback(Boolean(result.error));
    if (result.city !== undefined) {
      setLocationStatus(`Showing doctors near ${result.city}.`);
      locationChange.current(result.city);
    } else setLocationStatus(result.error);
  };
  useEffect(() => () => { automaticRequest.current += 1; }, []);
  useEffect(() => {
    if (locationFirst) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (locationOffered.current) return;
      const params = new URLSearchParams(window.location.search);
      let seen = false;
      try { seen = sessionStorage.getItem("nh:d3:location-requested") === "1"; } catch { /* Use the in-memory guard. */ }
      if (seen || location !== "All" || ["location", "city", "cityId"].some((key) => params.has(key))) {
        rememberLocationOffer();
        return;
      }
      rememberLocationOffer();
      const request = ++automaticRequest.current;
      const current = () => !cancelled && request === automaticRequest.current;
      // Native browser permission on entry; automatic failures stay unobtrusive.
      const result = await requestDoctorCity(current);
      if (!current()) return;
      if (result.city !== undefined) {
        setLocationStatus(`Showing doctors in nearby ${result.city}. You can change the city in Search location.`);
        locationChange.current(result.city);
      } else setLocationStatus(result.error);
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [location, locationFirst]);
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
    // Finish editing immediately; a cancelled scroll must not leave the input active.
    heading.focus({ preventScroll: true });
    // Hand scrolling to Lenis so its momentum cannot fight the search submission.
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(top, { duration: .4, immediate: reducedMotion });
    else window.scrollTo({ top, behavior: "instant" });
  };

  const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
      // Pointer selection is complete. Keyboard selection retains focus so arrows
      // and Tab continue to work, with a visible focus indicator.
      if (locationPointerInteraction.current) event.currentTarget.blur();
      automaticRequest.current += 1;
      setDetectingLocation(null);
      setLocationFeedback(false);
      setLocationStatus("");
      rememberLocationOffer();
      if (event.target.value === "__device") void detectLocation();
      else onLocation(event.target.value);
  };

  const locationSelect = (className: string) => <label className={`${styles.location} ${className}`} data-active={location !== "All" || undefined}>
    {detectingLocation === location ? <Loader2 size={16} className={styles.locationSpinner} aria-hidden /> : <MapPin size={16} aria-hidden />}
    <span className={styles.srOnly}>Search location</span>
    <select data-doctor-location aria-busy={detectingLocation === location} aria-describedby="d3-location-status d3-refinement-help" value={detectingLocation === location ? "__device" : location}
      onPointerDown={() => { locationPointerInteraction.current = true; }}
      onKeyDown={() => { locationPointerInteraction.current = false; }}
      onBlur={() => { locationPointerInteraction.current = false; }}
      onChange={handleLocationChange}>
      <option value="All">All locations</option>
      {!locationFirst && <option value="__device" disabled={detectingLocation === location}>{detectingLocation === location ? "Finding location…" : "Use my location…"}</option>}
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
        <h1 id="d3-results-title" tabIndex={-1}>{heading}</h1>
        {/* Keep the heading readable and focusable beneath the decorative brand wipe. */}
        {/* CSS hides the sweep for reduced motion without changing hydration markup. */}
        <div className={styles.titleSweep} aria-hidden="true">
          <TextSweepEffect key={heading} words={[heading]} sweepMs={1200}
            // Design 16 replays on each heading change, independently of viewport entry.
            active={locationFirst ? !reducedMotion : undefined}
            finalColor="var(--color-text)" />
        </div>
      </div>
      <div className={`${styles.summary} ${hideTotal && !loading && !error ? styles.srOnly : ""}`}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {loading ? "Searching…" : error ? "Results unavailable" : hideTotal ? "Doctor results updated" : <><strong>{total}</strong> {total === 1 ? "doctor" : "doctors"}</>}
          <span className={styles.srOnly}>{query.trim() ? ` matching ${query.trim()}` : ""}, {location === "All" ? "all locations" : location}, {mode === "hospital" ? "hospital visits" : "video consultations"}</span>
        </p>
      </div>
      <p className={styles.pageSummary}>{summary}</p>
      {!locationFirst && locationSelect(styles.mobileLocation)}
    </header>
    <div className={`${styles.searchBar} ${!navVisible ? styles.navHidden : ""}`} data-d3-search-bar data-d3-ui>
      <div className={`${styles.container} ${styles.toolbarContent}`}>
        <div className={`${styles.searchRow} ${locationFirst ? styles.locationFirst : ""} ${compactMobile ? styles.compactMobile : ""}`}>
          <div className={locationFirst ? styles.combinedSearch : styles.searchContents}>
          {locationFirst && locationSelect(styles.leadingLocation)}
          <form role="search" aria-label="Find a doctor" className={styles.form} onSubmit={submit}>
            <div className={styles.searchField}>
              <label className={styles.srOnly} htmlFor="d3-search">Search doctors by name, speciality or hospital</label>
              <input id="d3-search" type="search" value={query} autoComplete="off" enterKeyHint="search"
                placeholder=" " onFocus={() => setHintsPaused(true)} onBlur={() => setHintsPaused(false)} onChange={(event) => onQuery(event.target.value)} />
              <DoctorSearchHint active={!query} paused={hintsPaused} />
              <button type="button" className={styles.clear} aria-label="Clear search" disabled={!query} aria-hidden={!query}
                onClick={() => { onQuery(""); document.getElementById("d3-search")?.focus({ preventScroll: true }); }}><X size={16} aria-hidden /></button>
            </div>
            <button type="submit" className={styles.submit} aria-label="Search and show doctor results" title="Search">
              <Search size={20} aria-hidden />
            </button>
          </form>
          </div>
          {!locationFirst && locationSelect(styles.desktopLocation)}
          {!compactMobile && filterButton}
        </div>
        <p id="d3-location-status" className={locationFeedback ? styles.locationFeedback : styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{locationStatus}</p>
        {children}
      </div>
    </div>
  </>;
}
