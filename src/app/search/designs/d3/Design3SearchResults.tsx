"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Filter, Info, PhoneCall, X } from "lucide-react";
import { searchDoctorsData } from "../../mockDoctors";
import { getCityId } from "@/lib/searchService";
import { getSearchTabById, getSearchTabFromPathname, getSearchTabPath, type SearchTabId } from "@/features/search/searchTabs";
import { activeFilterCount, bookingUrl, emptyDoctorFilters, filterDoctors, fromApiDoctor, fromDirectoryDoctor, readListingParams, sortDoctors, type ConsultationMode, type DoctorFilters as DoctorFilterValues, type DoctorListingItem } from "@/features/search/doctorListing";
import { catalogResults, emptyCatalogFilters, filterCatalog, readCatalogFilters, readSearchLocation, type CatalogFilters as CatalogFilterValues, type SearchCatalogs, type SearchResultItem } from "@/features/search/design3Data";
import { useDesign3Search } from "@/features/search/useDesign3Search";
import { withDesign3DemoMetadata } from "@/features/search/design3DoctorMetadata";
import DesignSwitcher from "@/features/design-preview/DesignSwitcher";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import DoctorFilters from "../../doctors/DoctorFilters";
import DoctorListingControls from "../../doctors/DoctorListingControls";
import SearchHeader from "./SearchHeader";
import DoctorSearchTop from "./DoctorSearchTop";
import FilterScrollArea from "./FilterScrollArea";
import CatalogFilters from "./CatalogFilters";
import SearchDialog from "./SearchDialog";
import DoctorCard from "./DoctorCard";
import ResultCard from "./ResultCard";
import SearchState, { ResultSkeletons } from "./SearchState";
import styles from "./Design3SearchResults.module.css";
import ui from "./DoctorSearchTheme.module.css";

const directory = withDesign3DemoMetadata(searchDoctorsData.map(fromDirectoryDoctor));
const titles: Record<SearchTabId, string> = {
  doctors: "Find the right doctor", hospitals: "Find a hospital or clinic", specialties: "Explore our specialities",
  treatments: "Explore treatments & procedures", packages_tests: "Health packages & tests", articles: "Health articles & insights",
};

export default function Design3SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());
  const legacyTab = pathname === "/search" ? getSearchTabById(params.get("tab")) : undefined;
  const tab = legacyTab ?? getSearchTabFromPathname(pathname);
  const query = params.get("q") ?? params.get("search") ?? params.get("query") ?? "";
  const location = readSearchLocation(params);
  const { filters, mode, sort } = readListingParams(params);
  const catalogFilters = readCatalogFilters(params, tab.id);
  const live = Boolean(query.trim());
  const request = useDesign3Search(query, location);
  const apiCategory = tab.id !== "hospitals" && tab.id !== "packages_tests";
  const loading = apiCategory && request.loading;
  const error = apiCategory && request.error;
  const doctorTab = tab.id === "doctors";
  const { isUserLoggedIn } = useAuthState();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<DoctorListingItem | null>(null);
  const [itemDetails, setItemDetails] = useState<SearchResultItem | null>(null);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [draftDoctors, setDraftDoctors] = useState(emptyDoctorFilters);
  const [draftCatalog, setDraftCatalog] = useState(emptyCatalogFilters);
  const [visible, setVisible] = useState(16);
  const moreRef = useRef<HTMLDivElement>(null);

  const doctors = live ? (request.data?.doctors ?? []).map(fromApiDoctor) : directory.filter((doctor) => location === "All" || getCityId(doctor.city) === getCityId(location));
  const results = sortDoctors(filterDoctors(doctors, filters, mode), sort, mode);
  const catalog = catalogResults(catalogs, query, location, request.data);
  const items = doctorTab ? [] : filterCatalog(catalog[tab.id as Exclude<SearchTabId, "doctors">], catalogFilters);
  const currentItems = doctorTab ? [] : catalog[tab.id as Exclude<SearchTabId, "doctors">];
  const total = doctorTab ? results.length : items.length;
  const filterCount = doctorTab ? activeFilterCount(filters) : Object.values(catalogFilters).flat().length;

  const navigate = (url: string, replace = false) => { window.history[replace ? "replaceState" : "pushState"](null, "", url); };
  const update = (change: (next: URLSearchParams) => void, replace = false) => {
    const next = new URLSearchParams(window.location.search);
    next.delete("tab"); next.delete("city"); next.delete("cityId"); next.delete("search"); next.delete("query");
    next.set("design", "d3");
    if (query) next.set("q", query);
    if (location !== "All") next.set("location", location);
    change(next);
    navigate(`${getSearchTabPath(tab.id)}?${next}`, replace);
  };
  const changeDoctorFilters = (nextFilters: DoctorFilterValues) => update((next) => {
    for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) { next.delete(key); nextFilters[key].forEach((value) => next.append(key, value)); }
    next.delete("availability");
    if (nextFilters.availability !== "any") next.set("availability", nextFilters.availability);
  });
  const changeCatalogFilters = (nextFilters: CatalogFilterValues) => update((next) => {
    for (const key of ["letters", "types", "hospitals", "genders"] as const) { next.delete(`${tab.id}.${key}`); nextFilters[key].forEach((value) => next.append(`${tab.id}.${key}`, value)); }
  });
  const clearFilters = () => doctorTab ? update((next) => {
    Object.keys(emptyDoctorFilters()).forEach((key) => next.delete(key));
  }) : changeCatalogFilters(emptyCatalogFilters());
  const openFilters = () => { setDraftDoctors(filters); setDraftCatalog(catalogFilters); setFilterDrawer(true); };
  const book = (event: MouseEvent, doctor: DoctorListingItem, selectedMode: ConsultationMode, includeSlot: boolean) => {
    event.preventDefault();
    // The search endpoint has no verified appointment/profile detail contract.
    // Keep unknown IDs out of the legacy synthetic profile fallback.
    if (live) { setDoctorDetails(doctor); return; }
    const url = `${bookingUrl(doctor, selectedMode, includeSlot)}&design=d3`;
    if (isUserLoggedIn) router.push(url); else setPendingUrl(url);
  };
  const stateKey = searchParams.toString();
  useEffect(() => { setVisible(16); setFilterDrawer(false); }, [stateKey, tab.id]);
  useEffect(() => {
    const element = moreRef.current;
    if (!element || loading || error || visible >= total) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible((value) => Math.min(value + 16, total)); }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [total, visible, loading, error]);

  const renderFilters = (draft: boolean) => doctorTab
    ? <DoctorFilters doctors={doctors} value={draft ? draftDoctors : filters} onChange={draft ? setDraftDoctors : changeDoctorFilters}
        availabilityEnabled={doctors.some((doctor) => Boolean(doctor.availability[mode]))} mode={mode} />
    : <CatalogFilters tab={tab.id} items={currentItems} value={draft ? draftCatalog : catalogFilters} onChange={draft ? setDraftCatalog : changeCatalogFilters} />;
  const draftCount = doctorTab ? filterDoctors(doctors, draftDoctors, mode).length : filterCatalog(currentItems, draftCatalog).length;
  const sample = !live || !apiCategory;

  return <div className={`${styles.page} ${doctorTab ? `${styles.doctorPage} ${ui.theme}` : ""}`} data-design="d3" data-nav-theme="light">
    {doctorTab ? <DoctorSearchTop query={query} location={location} total={total} mode={mode}
      loading={loading} error={error} filterCount={filterCount} onOpenFilters={openFilters}
      onQuery={(value) => update((next) => { if (value) next.set("q", value); else next.delete("q"); }, true)}
      onLocation={(value) => update((next) => { next.delete("location"); if (value !== "All") next.set("location", value); })}>
      <DoctorListingControls mode={mode} sort={sort} filters={filters}
        onModeChange={(value) => update((next) => next.set("mode", value))}
        onSortChange={(value) => update((next) => { if (value === "relevance") next.delete("sort"); else next.set("sort", value); })}
        onFiltersChange={changeDoctorFilters} loading={loading} error={error} hasDoctors={doctors.length > 0}
        hasSlots={doctors.some((doctor) => Boolean(doctor.availability[mode]))} />
    </DoctorSearchTop>
      : <SearchHeader query={query} location={location}
      onQuery={(value) => update((next) => { if (value) next.set("q", value); else next.delete("q"); }, true)}
      onLocation={(value) => update((next) => { next.delete("location"); if (value !== "All") next.set("location", value); })} />}
    <div className={styles.container}>
      {!doctorTab && <header className={styles.heading}>
        <div><p className={styles.eyebrow}>Care that’s right for you</p><h1 id="d3-results-title" tabIndex={-1}>{titles[tab.id]}</h1>
          <p className={styles.context}>{query.trim() ? <>Results for <strong>“{query.trim()}”</strong> · </> : null}{location === "All" ? "Across Narayana Health" : location}</p>
        </div>
        <button type="button" className={styles.mobileFilter} onClick={openFilters} aria-haspopup="dialog"><Filter size={18} aria-hidden />Filters{filterCount > 0 && <span>{filterCount}</span>}</button>
      </header>}
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label={`${tab.label} filters`} data-lenis-prevent data-d3-ui>
          <div className={styles.filterHeading}><h2><Filter size={16} aria-hidden />Filters</h2><button type="button" disabled={filterCount === 0} aria-hidden={filterCount === 0}
            onClick={(event) => { clearFilters(); event.currentTarget.closest("aside")?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus({ preventScroll: true }); }}>Clear all</button></div>
          <FilterScrollArea key={tab.id}>{renderFilters(false)}</FilterScrollArea>
        </aside>
        <section className={styles.results} aria-label={tab.label}>
          {!doctorTab && filterCount > 0 && <div className={styles.chips}>{(Object.keys(catalogFilters) as (keyof CatalogFilterValues)[]).flatMap((key) => catalogFilters[key].map((value) => <button type="button" key={`${key}-${value}`} aria-label={`Remove filter: ${value}`} onClick={() => changeCatalogFilters({ ...catalogFilters, [key]: catalogFilters[key].filter((item) => item !== value) })}>{value}<X size={14} aria-hidden /></button>))}</div>}
          {!doctorTab && <div className={styles.resultMeta}><p role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : <><strong>{total}</strong> {total === 1 ? "result" : "results"}</>}</p>
            {sample && <span className={styles.sample}><Info size={14} aria-hidden />Sample directory</span>}
          </div>}
          {!sample && doctorTab && !loading && !error && <p className={styles.dataNote}>Contact NH to confirm appointment times and consultation fees.</p>}
          <div className={styles.grid} aria-busy={loading}>
            {loading ? <ResultSkeletons doctors={doctorTab} /> : error || !total ? <SearchState error={error} filtered={filterCount > 0} onRetry={request.retry} onReset={filterCount ? clearFilters : () => update((next) => { next.delete("q"); next.delete("location"); })} />
              : doctorTab ? results.slice(0, visible).map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} mode={mode} live={live} onBook={book} onDetails={setDoctorDetails} />)
                : items.slice(0, visible).map((item) => <ResultCard key={item.id} item={item} onDetails={() => setItemDetails(item)} />)}
          </div>
          {doctorTab && <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{!loading && !error && visible > 16 ? `Showing ${Math.min(visible, total)} of ${total} doctors` : ""}</p>}
          {!loading && !error && total > 0 && <div ref={moreRef} className={styles.more} data-d3-ui><p>Showing {Math.min(visible, total)} of {total}</p>{visible < total && <button type="button" className={styles.secondaryButton} onClick={() => setVisible((value) => Math.min(value + 16, total))}>Show more results</button>}</div>}
        </section>
      </div>
    </div>
    <AnimatePresence>
    {filterDrawer && <SearchDialog key="filters" title="Refine your search" mobileOnly doctorPreview={doctorTab} onClose={() => setFilterDrawer(false)} footer={<>
      {doctorTab && <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{loading ? "Searching…" : error ? "Results unavailable" : `${draftCount} ${draftCount === 1 ? "doctor matches" : "doctors match"} your filters`}</span>}
      <button type="button" className={styles.secondaryButton} disabled={doctorTab ? activeFilterCount(draftDoctors) === 0 : Object.values(draftCatalog).every((values) => values.length === 0)} onClick={() => doctorTab ? setDraftDoctors(emptyDoctorFilters()) : setDraftCatalog(emptyCatalogFilters())}>Clear all</button>
      <button type="button" className={styles.primaryButton} onClick={() => { if (doctorTab) changeDoctorFilters(draftDoctors); else changeCatalogFilters(draftCatalog); setFilterDrawer(false); }}>Show {draftCount} results</button>
    </>}>{renderFilters(true)}</SearchDialog>}
    {doctorDetails && <SearchDialog key="doctor-details" title={doctorDetails.name} doctorPreview={doctorTab} onClose={() => setDoctorDetails(null)} footer={<a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden />Contact NH</a>}>
      <p>{doctorDetails.speciality || "Speciality information unavailable"}</p>{doctorDetails.degrees && <p>{doctorDetails.degrees}</p>}
      {doctorDetails.hospital && <p>{doctorDetails.hospital}</p>}
      {live ? <p>Appointment times, fees and full profile details are currently unavailable here. Contact Narayana Health to confirm before booking.</p>
        : <p><Link className={styles.textLink} href={`/doctors/${encodeURIComponent(doctorDetails.id)}`}>View doctor profile <ArrowRight size={16} aria-hidden /></Link></p>}
    </SearchDialog>}
    {itemDetails && <SearchDialog key="item-details" title={itemDetails.name} onClose={() => setItemDetails(null)} footer={<a className={styles.primaryButton} href="tel:18602080208"><PhoneCall size={16} aria-hidden />Contact NH</a>}>
      <p>{itemDetails.description || "Further details are currently unavailable."}</p>{itemDetails.hospital && <p>{itemDetails.hospital}</p>}
      {itemDetails.inclusions && <ul className={styles.detailList}>{itemDetails.inclusions.map((value) => <li key={value}>{value}</li>)}</ul>}
      {itemDetails.price && <p>Listed price: {itemDetails.price}. Please confirm with NH before booking.</p>}
      <p>{tab.id === "packages_tests" ? "Online booking for this package or test is currently unavailable here." : "Contact Narayana Health for further information."}</p>
    </SearchDialog>}
    </AnimatePresence>
    {pendingUrl && <LoginModal isOpen manageFocus onClose={() => setPendingUrl(null)} onLoginSuccess={() => { const url = pendingUrl; setPendingUrl(null); router.push(url); }} />}
    <DesignSwitcher scope="search-top" />
  </div>;
}
