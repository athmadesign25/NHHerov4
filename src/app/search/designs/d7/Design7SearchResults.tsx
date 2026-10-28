"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, MapPin, PanelLeftClose, PanelLeftOpen, Phone, Search, SlidersHorizontal, Video, X } from "lucide-react";
import Design7Shell from "@/features/design-preview/design7/Design7Shell";
import { resolveJourneyDesign, type JourneyDesign } from "@/features/design-preview/journeyDesigns";
import { type SearchCatalogs, readSearchLocation } from "@/features/search/design3Data";
import { activeFilterCount, doctorFilterOptions, emptyDoctorFilters, readListingParams, type DoctorFilters, type DoctorListingItem, type DoctorMultiFilterKey, type DoctorSort } from "@/features/search/doctorListing";
import { doctorListingParams, doctorListingUrl } from "@/features/search/doctorListingNavigation";
import { DOCTOR_LANDING_SPECIALITIES } from "@/features/search/doctorLandingPages";
import { NH_CITIES } from "@/lib/searchService";
import { doctorReturnId, safeReturnTo } from "@/features/booking/design13/navigation";
import { refineDesign7Doctors, searchDesign7Directory } from "./directory";
import DoctorCard from "./DoctorCard";
import DoctorProfile from "./DoctorProfile";
import DoctorComparison from "../d11/DoctorComparison";
import DoctorScanCard from "../d12/DoctorScanCard";
import DoctorQuickCard from "../d13/DoctorQuickCard";
import FilterSidebar from "../d14/FilterSidebar";
import FilterSheet from "../d14/FilterSheet";
import { FEE_OPTIONS, filterByFee, readFeeFilter, type FeeFilter } from "../d14/filtering";
import focusStyles from "../d14/DirectoryLayout.module.css";
import styles from "./Design7SearchResults.module.css";

const quickSpecialities = [
  { label: "All specialities", value: "" },
  { label: "Heart care", value: "Cardiologist" },
  { label: "Bone & joint", value: "Orthopaedician" },
  { label: "Cancer care", value: "Oncologist" },
  { label: "Brain & spine", value: "Neurologist" },
  { label: "Child care", value: "Pediatrician" },
];

export default function Design7SearchResults(props: { catalogs: SearchCatalogs; design?: JourneyDesign }) {
  // The shared route supplies all catalog categories; this journey is doctor-led.
  void props.catalogs;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = doctorListingParams(pathname, searchParams.toString());
  const variant = props.design ?? resolveJourneyDesign(params.get("design"));
  const isComparison = variant === "d11";
  const isSidebar = variant === "d14";
  const isQuick = variant === "d13" || isSidebar;
  const quickVariant = isSidebar ? "d14" : "d13";
  const pageSize = variant === "d12" || isQuick ? 6 : 8;
  const { filters, mode, sort } = readListingParams(params);
  const location = readSearchLocation(params);
  const query = params.get("q") ?? params.get("search") ?? params.get("query") ?? "";
  const stateParams = new URLSearchParams(params);
  if (isQuick) stateParams.delete("shown");
  const stateKey = stateParams.toString();
  const paramsKey = params.toString();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const pendingReveal = useRef<string | null>(null);
  const revealResults = useRef(false);
  const [profile, setProfile] = useState<DoctorListingItem | null>(null);
  const [page, setPage] = useState({ key: stateKey, count: pageSize });
  const [now, setNow] = useState(() => new Date());
  const requestedShown = Number(params.get("shown"));
  const visible = isQuick
    ? Number.isInteger(requestedShown) && requestedShown >= pageSize && requestedShown <= 1200 ? requestedShown : pageSize
    : page.key === stateKey ? page.count : pageSize;
  const doctors = searchDesign7Directory(query, location);
  const fee = isSidebar ? readFeeFilter(params.get("fee")) : "any";
  const results = filterByFee(refineDesign7Doctors(doctors, filters, mode, sort, isQuick ? now : undefined), fee);
  const filterCount = activeFilterCount(filters) + Number(fee !== "any");
  const advancedCount = filters.hospitals.length + filters.languages.length + filters.genders.length + filters.expertise.length + Number(filters.availability !== "any");
  const selectedSpeciality = filters.specialties.length === 1 ? DOCTOR_LANDING_SPECIALITIES.find((speciality) => speciality.label === filters.specialties[0]) : null;

  useEffect(() => {
    if (!isQuick) return;
    const refresh = () => setNow(new Date());
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isQuick]);

  useEffect(() => {
    if (!isQuick || isPending) return;
    if (revealResults.current) {
      const frame = window.requestAnimationFrame(() => {
        document.querySelector("[data-journey-results]")?.scrollIntoView({ block: "start", behavior: "instant" });
        revealResults.current = false;
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const id = pendingReveal.current ?? window.location.hash.slice(1);
    if (!/^doctor-[A-Za-z0-9._~-]+$/.test(id)) return;
    const frame = window.requestAnimationFrame(() => {
      const card = document.getElementById(id);
      if (!card) return;
      card.scrollIntoView({ block: "start", behavior: "instant" });
      card.focus({ preventScroll: true });
      pendingReveal.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isQuick, isPending, paramsKey]);

  const returnToDoctor = (doctorId: string) => {
    const next = new URLSearchParams(params);
    next.set("design", quickVariant);
    next.set("shown", String(visible));
    return safeReturnTo(`${doctorListingUrl(pathname, next)}#${doctorReturnId(doctorId)}`, `/search/doctors?design=${quickVariant}`, quickVariant);
  };

  const update = (change: (next: URLSearchParams) => void, replace = false, keepShown = false) => {
    const next = doctorListingParams(pathname, window.location.search);
    next.delete("tab"); next.delete("city"); next.delete("cityId"); next.delete("search"); next.delete("query");
    next.set("design", variant);
    if (query) next.set("q", query);
    if (location !== "All") next.set("location", location);
    if (isQuick && !keepShown) next.delete("shown");
    change(next);
    const url = doctorListingUrl(pathname, next);
    if (isSidebar) {
      revealResults.current = false;
      const currentQuery = new URLSearchParams(window.location.search);
      const target = new URL(url, window.location.origin);
      if (!keepShown) currentQuery.delete("shown");
      currentQuery.sort();
      target.searchParams.sort();
      if (target.pathname === pathname && currentQuery.toString() === target.searchParams.toString()) return;
      if (!keepShown) {
        const resultsTop = document.querySelector("[data-journey-results]")?.getBoundingClientRect().top;
        const headerBottom = document.querySelector("[data-design7-shell] > header")?.getBoundingClientRect().bottom ?? 0;
        revealResults.current = resultsTop !== undefined && resultsTop < headerBottom;
      }
    }
    if (url.split("?")[0] === pathname) window.history[replace ? "replaceState" : "pushState"](null, "", url);
    else startTransition(() => router[replace ? "replace" : "push"](url, { scroll: false }));
  };
  const setFilters = (nextFilters: DoctorFilters, nextFee: FeeFilter = fee) => update((next) => {
    for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
      next.delete(key); nextFilters[key].forEach((value) => next.append(key, value));
    }
    next.delete("availability");
    if (nextFilters.availability !== "any") next.set("availability", nextFilters.availability);
    if (isSidebar) {
      next.delete("fee");
      if (nextFee !== "any") next.set("fee", nextFee);
    }
  });
  const selectFilter = (key: DoctorMultiFilterKey, value: string) => setFilters({ ...filters, [key]: value ? [value] : [] });
  const reset = () => update((next) => {
    Object.keys(emptyDoctorFilters()).forEach((key) => next.delete(key));
    next.delete("q");
    if (isSidebar) next.delete("fee");
  });
  const resultTitle = selectedSpeciality?.plural ?? "Specialists";
  const hospitalOptions = doctorFilterOptions(doctors, filters, mode, "hospitals");
  const languageOptions = doctorFilterOptions(doctors, filters, mode, "languages");
  const closeFilters = () => {
    setFiltersOpen(false);
    filterTrigger.current?.focus();
  };

  return <Design7Shell currentStep="discover" design={variant} compact>
    <div className={styles.page} data-design={variant} data-journey-design={variant} data-compact-directory>
      <div className={styles.heroIsland} data-journey-contrast={variant === "d9" ? "dark" : undefined}>
      <header className={styles.intro}>
        <h1>{isSidebar ? <>Your care, <span>in focus.</span></> : isQuick ? <>Care, <span>without the wait.</span></> : isComparison ? "Compare doctors." : <>Find your <span>doctor.</span></>}</h1>
        <p className={styles.lead}>{isSidebar ? "Find the right fit. Choose your time." : isQuick ? "Find your doctor. Choose your time." : isComparison ? "Your care, side by side." : "Expert care, made personal."}</p>
      </header>

      <section className={styles.discovery} aria-label="Find your doctor">
        <div className={styles.searchRow}>
          <form className={styles.searchForm} role="search" onSubmit={(event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("doctor-search") ?? "").trim();
            update((next) => { if (value) next.set("q", value); else next.delete("q"); });
          }}>
            <Search size={21} strokeWidth={1.5} aria-hidden />
            <label className={styles.srOnly} htmlFor="d7-doctor-search">Search doctors, specialities or hospitals</label>
            <input id="d7-doctor-search" key={query} name="doctor-search" type="search" defaultValue={query} placeholder="Doctor, speciality or hospital" autoComplete="off" />
            <button type="submit" aria-label="Search doctors"><ArrowRight size={20} aria-hidden /></button>
          </form>
          <label className={styles.location}>
            <MapPin size={18} aria-hidden /><span className={styles.srOnly}>Your city</span>
            <select value={location} onChange={(event) => update((next) => { next.delete("location"); if (event.target.value !== "All") next.set("location", event.target.value); })}>
              <option value="All">All cities</option>{NH_CITIES.map((city) => <option value={city.value} key={city.value}>{city.label}</option>)}
            </select><ChevronDown size={16} aria-hidden />
          </label>
          <div className={styles.mode} role="group" aria-label="Consultation type">
            <button type="button" aria-pressed={mode === "hospital"} onClick={() => update((next) => next.set("mode", "hospital"))}><Building2 size={16} aria-hidden /><span>In hospital</span></button>
            <button type="button" aria-pressed={mode === "video"} onClick={() => update((next) => next.set("mode", "video"))}><Video size={16} aria-hidden /><span>Video</span></button>
          </div>
        </div>
        {!isSidebar && <div className={styles.specialityRow}>
          <div className={styles.quickSpecialities} role="group" aria-label="Quick speciality filters" data-lenis-prevent-horizontal>
          {quickSpecialities.map((speciality) => <button type="button" key={speciality.value} aria-pressed={speciality.value ? filters.specialties.length === 1 && filters.specialties[0] === speciality.value : filters.specialties.length === 0} onClick={() => selectFilter("specialties", speciality.value)}>
            {speciality.value && filters.specialties.length === 1 && filters.specialties[0] === speciality.value && <Check size={13} aria-hidden />}{speciality.label}
          </button>)}
          </div>
          <button ref={filterTrigger} type="button" className={styles.moreFilters} aria-expanded={filtersOpen} aria-controls="d7-expanded-filters" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={14} aria-hidden />All filters{advancedCount > 0 && <span className={styles.filterBadge}>{advancedCount}</span>}</button>
        </div>}
        {!isSidebar && filtersOpen && <div className={styles.expandedFilters} id="d7-expanded-filters" onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); closeFilters(); }
        }}>
          <label><span>Speciality</span><select value={filters.specialties.length === 1 ? filters.specialties[0] : ""} onChange={(event) => selectFilter("specialties", event.target.value)}><option value="">All specialities</option>{doctorFilterOptions(doctors, filters, mode, "specialties").map((option) => <option value={option.value} key={option.value}>{option.value} ({option.count})</option>)}</select></label>
          <label><span>Hospital</span><select value={filters.hospitals[0] ?? ""} onChange={(event) => selectFilter("hospitals", event.target.value)}><option value="">All hospitals</option>{hospitalOptions.map((option) => <option value={option.value} key={option.value}>{option.value} ({option.count})</option>)}</select></label>
          <label><span>Language</span><select value={filters.languages[0] ?? ""} onChange={(event) => selectFilter("languages", event.target.value)}><option value="">Any language</option>{languageOptions.map((option) => <option value={option.value} key={option.value}>{option.value} ({option.count})</option>)}</select></label>
          <label><span>Availability</span><select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value as DoctorFilters["availability"] })}><option value="any">Any date</option><option value="today">Today</option><option value="tomorrow">Tomorrow</option><option value="week">Next 7 days</option></select></label>
          <div className={styles.filterActions}><button type="button" disabled={filterCount === 0} onClick={() => setFilters(emptyDoctorFilters())}>Reset filters</button><button type="button" onClick={closeFilters}>Done <Check size={16} aria-hidden /></button></div>
        </div>}
      </section>
      </div>

      <div className={isSidebar ? focusStyles.workspace : undefined} data-sidebar-hidden={isSidebar && sidebarHidden || undefined}>
      {isSidebar && <div className={focusStyles.sidebar} id="d14-filter-sidebar" data-lenis-prevent>
        <FilterSidebar doctors={doctors} filters={filters} fee={fee} mode={mode} now={now} onChange={setFilters} />
      </div>}
      <section className={`${styles.results} ${isSidebar ? focusStyles.results : ""}`} aria-labelledby="d7-results-heading" aria-busy={isPending} data-journey-results>
        <div className={styles.resultsHeader}>
          <div className={styles.resultSummary}><h2 id="d7-results-heading">{resultTitle}<span className={styles.resultLocation}>{location === "All" ? " for you" : ` in ${location}`}</span></h2><p className={styles.resultCount} role="status" aria-live="polite">{isPending ? "Updating…" : <>{results.length} {results.length === 1 ? "doctor" : "doctors"}{query ? ` matching “${query}”` : ""}</>}</p></div>
          <div className={isSidebar ? focusStyles.resultControls : styles.sortOnly}>
          {isSidebar && <>
            <button className={focusStyles.sidebarToggle} type="button" aria-expanded={!sidebarHidden} aria-controls="d14-filter-sidebar" onClick={() => setSidebarHidden((hidden) => !hidden)}>
              {sidebarHidden ? <PanelLeftOpen size={16} aria-hidden /> : <PanelLeftClose size={16} aria-hidden />}
              {sidebarHidden ? "Show filters" : "Hide filters"}{sidebarHidden && filterCount > 0 && <span>{filterCount}</span>}
            </button>
            <button ref={filterTrigger} className={focusStyles.sheetTrigger} type="button" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} aria-hidden />Filters{filterCount > 0 && <span>{filterCount}</span>}
            </button>
          </>}
          <label className={styles.sort}><span>Sort by</span><select value={sort} onChange={(event) => update((next) => next.set("sort", event.target.value as DoctorSort))}><option value="relevance">Best match</option><option value="earliest">Earliest appointment</option><option value="experience">Experience</option><option value="fee_asc">Fee: low to high</option><option value="fee_desc">Fee: high to low</option></select><ChevronDown size={15} aria-hidden /></label>
          </div>
        </div>
        {(query || filterCount > 0) && <div className={styles.activeFilters}>
          {query && <button type="button" onClick={() => update((next) => next.delete("q"))}>“{query}”<X size={13} aria-hidden /><span className={styles.srOnly}>Remove search</span></button>}
          {(["specialties", "hospitals", "languages", "genders", "expertise"] as const).flatMap((key) => filters[key].map((value) => <button type="button" key={`${key}-${value}`} onClick={() => setFilters({ ...filters, [key]: filters[key].filter((item) => item !== value) })}>{value}<X size={13} aria-hidden /><span className={styles.srOnly}>Remove filter</span></button>))}
          {filters.availability !== "any" && <button type="button" onClick={() => setFilters({ ...filters, availability: "any" })}>{filters.availability === "week" ? "Next 7 days" : filters.availability}<X size={13} aria-hidden /><span className={styles.srOnly}>Remove availability filter</span></button>}
          {fee !== "any" && <button type="button" onClick={() => setFilters(filters, "any")}>Fee: {FEE_OPTIONS.find((option) => option.value === fee)?.label}<X size={13} aria-hidden /><span className={styles.srOnly}>Remove fee filter</span></button>}
          <button type="button" className={styles.clearAll} onClick={reset}>Clear all</button>
        </div>}
        {isPending ? <div className={styles.grid} aria-label="Loading doctors">{[0, 1, 2, 3].map((key) => <div className={styles.skeleton} key={key}><span /><span /><span /></div>)}</div>
          : results.length ? isComparison
            ? <DoctorComparison key={stateKey} doctors={results} mode={mode} onProfile={setProfile} />
            : <div className={styles.grid}>{results.slice(0, visible).map((doctor, index) => isQuick
              ? <DoctorQuickCard doctor={doctor} mode={mode} now={now} returnTo={returnToDoctor(doctor.id)} variant={quickVariant} key={doctor.id} priority={index < 3} onProfile={setProfile} />
              : variant === "d12"
              ? <DoctorScanCard doctor={doctor} mode={mode} key={doctor.id} priority={index < 3} onProfile={setProfile} />
              : <DoctorCard doctor={doctor} mode={mode} key={doctor.id} priority={index < 2} variant={variant} onProfile={setProfile} />)}</div>
            : <div className={styles.empty}><Search size={32} strokeWidth={1.4} aria-hidden /><h3>A fresh search could help.</h3><p>Try a different name or speciality, or explore another city.</p><div><button type="button" onClick={reset}>Clear search & filters</button><button type="button" onClick={() => update((next) => next.delete("location"))}>Explore all cities</button></div></div>}
        {!isComparison && !isPending && results.length > 0 && <div className={styles.more}><p role={isQuick ? "status" : undefined}>Showing {Math.min(visible, results.length)} of {results.length} doctors</p>{visible < results.length && <button type="button" onClick={() => {
          if (isQuick) {
            pendingReveal.current = doctorReturnId(results[visible].id);
            update((next) => next.set("shown", String(Math.min(visible + pageSize, results.length))), false, true);
          } else setPage({ key: stateKey, count: visible + pageSize });
        }}>Explore more specialists <ArrowDown size={16} aria-hidden /></button>}</div>}
      </section>
      </div>
      <aside className={styles.help}><div><span>WE’RE HERE TO HELP</span><h2>Not sure where to begin?</h2><p>Our care team can help you find the right department.</p></div><a href="tel:18602080208"><Phone size={17} aria-hidden />Talk to our care team <ArrowUpRight size={16} aria-hidden /></a></aside>
      {variant !== "d14" && <p className={styles.previewNote}>Design preview · Sample doctor details, fees and availability. No real appointments are made.</p>}
      {profile && <DoctorProfile doctor={profile} mode={mode} variant={variant} now={isQuick ? now : undefined} returnTo={isQuick ? returnToDoctor(profile.id) : undefined} onClose={() => setProfile(null)} />}
      {isSidebar && filtersOpen && <FilterSheet doctors={doctors} filters={filters} fee={fee} mode={mode} now={now} onChange={setFilters} onClose={closeFilters} />}
    </div>
  </Design7Shell>;
}
