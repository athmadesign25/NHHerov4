"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowRight, Building2, ChevronDown, Clock3, MapPin, Phone, Search, Video, X } from "lucide-react";
import Design7Shell from "@/features/design-preview/design7/Design7Shell";
import { isDesign15Variant, type Design15Variant } from "@/features/design-preview/journeyDesigns";
import { readSearchLocation, type SearchCatalogs } from "@/features/search/design3Data";
import { type ConsultationMode, type DoctorFilters, type DoctorListingItem } from "@/features/search/doctorListing";
import { doctorListingParams, doctorListingUrl } from "@/features/search/doctorListingNavigation";
import { doctorReturnId, safeReturnTo } from "@/features/booking/design13/navigation";
import { NH_CITIES } from "@/lib/searchService";
import { searchDesign7Directory } from "../d7/directory";
import { FILTER_GROUPS, readAvailabilityChoice, readDesign15Filters, refineDesign15Doctors, type AvailabilityChoice } from "./directory";
import DoctorCard from "./DoctorCard";
import DoctorProfile from "./DoctorProfile";
import FilterPanel from "./FilterPanel";
import styles from "./Design15SearchResults.module.css";

const QUICK_CHOICES: { value: AvailabilityChoice; label: string }[] = [
  { value: "earliest", label: "Earliest slot" }, { value: "today", label: "Today" }, { value: "tomorrow", label: "Tomorrow" },
];
const PAGE_SIZE = 6;

export default function Design15SearchResults({ catalogs, design }: { catalogs: SearchCatalogs; design?: Design15Variant }) {
  void catalogs;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = doctorListingParams(pathname, searchParams.toString());
  const requestedDesign = params.get("design");
  const variant = design ?? (isDesign15Variant(requestedDesign) ? requestedDesign : "d15-light");
  const paramsKey = params.toString();
  const location = readSearchLocation(params);
  const query = params.get("q") ?? params.get("search") ?? params.get("query") ?? "";
  const mode: ConsultationMode = params.get("mode") === "video" ? "video" : "hospital";
  const filters = readDesign15Filters(params);
  const availability = readAvailabilityChoice(params);
  const selectedCount = filters.specialties.length + filters.hospitals.length + filters.languages.length;
  const requestedShown = Number(params.get("shown"));
  const shown = Number.isInteger(requestedShown) && requestedShown >= PAGE_SIZE && requestedShown <= 1200 ? requestedShown : PAGE_SIZE;
  const [now, setNow] = useState(() => new Date());
  const [profile, setProfile] = useState<DoctorListingItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const pendingReveal = useRef<string | null>(null);
  const doctors = searchDesign7Directory(query, location);
  const results = refineDesign15Doctors(doctors, filters, mode, now);

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", visible); };
  }, []);

  useEffect(() => {
    if (isPending) return;
    const id = pendingReveal.current ?? window.location.hash.slice(1);
    if (!/^doctor-[A-Za-z0-9._~-]+$/.test(id)) return;
    const frame = requestAnimationFrame(() => {
      const card = document.getElementById(id);
      if (card) { card.scrollIntoView({ block: "start", behavior: "instant" }); card.focus({ preventScroll: true }); pendingReveal.current = null; }
    });
    return () => cancelAnimationFrame(frame);
  }, [paramsKey, isPending]);

  const normalizedParams = (source: URLSearchParams) => {
    const next = new URLSearchParams({ design: variant, mode: source.get("mode") === "video" ? "video" : "hospital", sort: "earliest" });
    const city = readSearchLocation(source);
    const search = source.get("q") ?? source.get("search") ?? source.get("query") ?? "";
    if (city !== "All") next.set("location", city);
    if (search.trim()) next.set("q", search.trim());
    const currentFilters = readDesign15Filters(source);
    FILTER_GROUPS.forEach(({ key }) => currentFilters[key].forEach((value) => next.append(key, value)));
    if (currentFilters.availability !== "any") next.set("availability", currentFilters.availability);
    return next;
  };
  const update = (change: (next: URLSearchParams) => void, keepShown = false) => {
    const current = doctorListingParams(pathname, window.location.search);
    const next = normalizedParams(current);
    if (keepShown) next.set("shown", String(shown));
    change(next);
    const url = doctorListingUrl(pathname, next);
    if (url.split("?")[0] === pathname) window.history.pushState(null, "", url);
    else startTransition(() => router.push(url, { scroll: false }));
  };
  const setFilters = (nextFilters: DoctorFilters) => update((next) => {
    FILTER_GROUPS.forEach(({ key }) => { next.delete(key); nextFilters[key].forEach((value) => next.append(key, value)); });
    next.delete("availability");
    if (nextFilters.availability === "today" || nextFilters.availability === "tomorrow") next.set("availability", nextFilters.availability);
  });
  const chooseAvailability = (value: AvailabilityChoice) => update((next) => { next.delete("availability"); if (value !== "earliest") next.set("availability", value); });
  const reset = () => update((next) => { FILTER_GROUPS.forEach(({ key }) => next.delete(key)); next.delete("q"); next.delete("availability"); });
  const returnToDoctor = (doctorId: string) => {
    const next = normalizedParams(params);
    next.set("shown", String(shown));
    return safeReturnTo(`${doctorListingUrl(pathname, next)}#${doctorReturnId(doctorId)}`, `/search/doctors?design=${variant}`, variant);
  };

  return <Design7Shell currentStep="discover" design={variant} compact>
    <div className={styles.page} data-journey-design={variant}>
      <header className={styles.intro}><h1>Find a doctor.</h1>
        <label className={styles.location}><MapPin size={18} aria-hidden /><span className={styles.srOnly}>Location</span><select aria-label="Location" value={location} onChange={(event) => update((next) => { next.delete("location"); next.delete("hospitals"); if (event.target.value !== "All") next.set("location", event.target.value); })}><option value="All">All cities</option>{NH_CITIES.map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}</select><ChevronDown size={14} aria-hidden /></label>
      </header>
      <section className={styles.discovery} aria-label="Find a doctor">
        <div className={styles.searchRow}>
          <form className={styles.search} role="search" onSubmit={(event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get("doctor-search") ?? "").trim(); update((next) => { if (value) next.set("q", value); else next.delete("q"); }); }}>
            <Search size={19} aria-hidden /><label htmlFor="d15-search" className={styles.srOnly}>Doctor, speciality or hospital</label><input id="d15-search" name="doctor-search" type="search" key={query} defaultValue={query} placeholder="Doctor, speciality or hospital" autoComplete="off" />
            <button type="submit" aria-label="Search doctors"><ArrowRight size={19} aria-hidden /></button>
          </form>
          <fieldset className={styles.consultation}><legend className={styles.srOnly}>Consultation type</legend>
            <label data-selected={mode === "hospital" || undefined}><input type="radio" name="d15-mode" checked={mode === "hospital"} onChange={() => update((next) => next.set("mode", "hospital"))} /><Building2 size={18} aria-hidden /><span>Hospital</span></label>
            <label data-selected={mode === "video" || undefined}><input type="radio" name="d15-mode" checked={mode === "video"} onChange={() => update((next) => next.set("mode", "video"))} /><Video size={18} aria-hidden /><span>Video</span></label>
          </fieldset>
        </div>
      </section>
      <div className={styles.workspace}>
      <FilterPanel doctors={doctors} filters={filters} mode={mode} now={now} onChange={setFilters} />
      <section className={styles.results} aria-labelledby="d15-results-heading" aria-busy={isPending} data-journey-results>
        <div className={styles.resultsHeader}><div><h2 id="d15-results-heading" ref={resultHeading} tabIndex={-1}>{results.length} {results.length === 1 ? "doctor" : "doctors"}{location !== "All" && <span>{` in ${location}`}</span>}</h2><p className={styles.srOnly} role="status" aria-live="polite">{isPending ? "Updating doctors" : `${results.length} doctors match your search`}</p></div>
          <fieldset className={styles.quickOptions}><legend className={styles.srOnly}>Appointment availability</legend>{QUICK_CHOICES.map((choice) => <label key={choice.value} data-selected={availability === choice.value || undefined}><input type="radio" name="d15-availability" value={choice.value} checked={availability === choice.value} onChange={() => chooseAvailability(choice.value)} />{choice.value === "earliest" && <Clock3 size={14} aria-hidden />}<span>{choice.label}</span></label>)}</fieldset>
        </div>
        {(selectedCount > 0 || query) && <div className={styles.selectedFilters} aria-label="Active search filters">
          {query && <button type="button" onClick={() => update((next) => next.delete("q"))}>“{query}”<X size={13} aria-hidden /><span className={styles.srOnly}>Remove search</span></button>}
          {FILTER_GROUPS.flatMap(({ key }) => filters[key].map((value) => <button key={`${key}-${value}`} type="button" onClick={() => setFilters({ ...filters, [key]: filters[key].filter((item) => item !== value) })}>{value}<X size={13} aria-hidden /><span className={styles.srOnly}>Remove filter</span></button>))}
          <button type="button" className={styles.clear} onClick={reset}>Clear all</button>
        </div>}
        {isPending ? <div className={styles.grid} aria-label="Loading doctors">{[0, 1, 2].map((key) => <div className={styles.skeleton} key={key} />)}</div>
          : results.length > 0 ? <div className={styles.grid}>{results.slice(0, shown).map((doctor, index) => <DoctorCard doctor={doctor} mode={mode} now={now} variant={variant} returnTo={returnToDoctor(doctor.id)} priority={index < 3} onProfile={setProfile} key={doctor.id} />)}</div>
            : <div className={styles.empty}><Search size={28} aria-hidden /><h3>No doctors match these choices.</h3><p>Try another speciality, date or location.</p><div><button type="button" onClick={reset}>Clear search & filters</button>{location !== "All" && <button type="button" onClick={() => update((next) => { next.delete("location"); next.delete("hospitals"); })}>Search all cities</button>}</div></div>}
        {!isPending && results.length > 0 && <div className={styles.more}><p>Showing {Math.min(shown, results.length)} of {results.length} doctors</p>{shown < results.length && <button type="button" onClick={() => { pendingReveal.current = doctorReturnId(results[shown].id); update((next) => next.set("shown", String(Math.min(shown + PAGE_SIZE, results.length))), true); }}>Show more doctors<ArrowDown size={16} aria-hidden /></button>}</div>}
      </section>
      </div>
      <aside className={styles.help}><p>Need help finding the right doctor?</p><a href="tel:18602080208"><Phone size={16} aria-hidden />Talk to our care team<ArrowRight size={15} aria-hidden /></a></aside>
      {profile && <DoctorProfile doctor={profile} mode={mode} now={now} variant={variant} returnTo={returnToDoctor(profile.id)} onClose={() => setProfile(null)} />}
    </div>
  </Design7Shell>;
}
