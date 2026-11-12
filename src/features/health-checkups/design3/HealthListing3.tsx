"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Search, X, History, Heart, Droplets, Sparkles, UserRound, Activity } from "lucide-react";
import SearchLocationUnit from "@/components/ui/search-location/SearchLocationUnit";
import searchStyles from "@/components/ui/search-location/SearchToolbar.module.css";
import searchTheme from "@/components/ui/search-location/SearchTheme.module.css";
import chip from "@/components/ui/search-location/ControlChip.module.css";
import type { FacilityId, HealthFacility, HealthItem } from "../catalog";
import { matchesHealthQuery } from "../healthDiscovery";
import HealthIncludedTests from "../HealthIncludedTests";
import { HEALTH_CATEGORIES, healthCategories } from "../healthCardContent";
import HealthLocationPicker from "./HealthLocationPicker";
import HealthDiscoveryCard from "./HealthDiscoveryCard";
import HealthTypeToggle from "./HealthTypeToggle";
import styles from "./HealthListing3.module.css";

interface Props {
  cities: readonly { value: string; label: string }[];
  facilities: readonly HealthFacility[];
  facility?: HealthFacility;
  facilityOpen: boolean;
  onOpenFacility: () => void;
  onCloseFacility: () => void;
  onFacility: (id: FacilityId) => void;
  catalog: HealthItem[];
  query: string;
  onQuery: (query: string) => void;
  tab: "package" | "test";
  onTab: (tab: "package" | "test") => void;
  category: string;
  onCategory: (category: string) => void;
  ids: string[];
  bookedIds?: readonly string[];
  includedIds: string[];
  onAdd: (item: HealthItem) => void;
  onDetails: (item: HealthItem) => void;
}

/** Listing-only preview; selection, login, scheduling and payment stay shared. */
export default function HealthListing3(props: Props) {
  const { cities, facilities, facility, facilityOpen, onOpenFacility, onCloseFacility, onFacility,
    catalog, query, onQuery, tab, onTab, category, onCategory, ids, includedIds,
    onAdd, onDetails, bookedIds = [] } = props;
  const [testsItem, setTestsItem] = useState<HealthItem | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const results = useRef<HTMLDivElement>(null);
  const searching = Boolean(query.trim());
  const categories = useMemo(() => HEALTH_CATEGORIES.filter(category => category.id !== "all" && catalog.some(item => item.kind === tab && healthCategories(item).includes(category.id))), [catalog, tab]);
  const hasHistory = catalog.some(item => item.kind === tab && bookedIds.includes(item.id));
  const activeCategory = category === "booked" ? (hasHistory ? "booked" : "All") : categories.some(entry => entry.id === category) ? category : "All";
  const visible = catalog.filter(item => searching ? matchesHealthQuery(item, query) : item.kind === tab && (activeCategory === "All" || (activeCategory === "booked" ? bookedIds.includes(item.id) : healthCategories(item).some(value => value === activeCategory))));
  const packages = visible.filter(item => item.kind === "package");
  const tests = visible.filter(item => item.kind === "test");

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    if (!nav) return;
    const sync = () => setNavVisible(nav.dataset.navHidden !== "true");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(nav, { attributes: true, attributeFilter: ["data-nav-hidden"] });
    return () => observer.disconnect();
  }, []);

  function browse(next: "package" | "test") {
    onQuery(""); onCategory("All"); onTab(next);
  }
  function renderItem(item: HealthItem, index: number) {
    return <HealthDiscoveryCard key={item.id} item={item} eager={index < 3} selected={ids.includes(item.id)} included={includedIds.includes(item.id)}
      onAdd={() => onAdd(item)} onDetails={() => onDetails(item)} onTests={() => setTestsItem(item)} previouslyBooked={bookedIds.includes(item.id)} />;
  }

  return <>
    {testsItem && <HealthIncludedTests item={testsItem} onClose={() => setTestsItem(null)} onDetails={() => { setTestsItem(null); onDetails(testsItem); }} />}
    <section className={`${searchStyles.searchBar} ${searchTheme.theme} ${styles.discoveryBar} ${!navVisible ? searchStyles.navHidden : ""}`} aria-label="Find health packages and tests">
      <div className={searchStyles.toolbarContent}>
        <div className={styles.searchAndType}>
          <div className={`${searchStyles.searchRow} ${searchStyles.locationFirst} ${styles.searchRow}`}>
          <SearchLocationUnit id="health-discovery-search" query={query} onQuery={value => { onQuery(value); onCategory("All"); }} maxLength={120}
            searchLabel="Find health packages and tests" inputLabel="Search packages and lab tests" placeholder="Search packages or lab tests"
            onSubmit={event => { event.preventDefault(); if (!facility) onOpenFacility(); else results.current?.focus({ preventScroll: true }); }}
            locationControl={<HealthLocationPicker cities={cities} facilities={facilities} selectedFacility={facility} open={facilityOpen}
              onOpen={onOpenFacility} onClose={onCloseFacility} onSelect={onFacility} />} />
          </div>
          <HealthTypeToggle value={tab} searching={searching} onChange={browse} />
        </div>
        {facility && !searching && (categories.length > 0 || hasHistory) && <div className={styles.categories} role="group" aria-label="Filter by health focus">
          <button type="button" className={chip.chip} aria-pressed={activeCategory === "All"} onClick={() => onCategory("All")}>All</button>
          {hasHistory && <button type="button" className={chip.chip} aria-pressed={activeCategory === "booked"} onClick={() => onCategory("booked")}><History aria-hidden />Booked before</button>}
          {categories.map(value => {
            const Icon = value.id === "heart" ? Heart : value.id === "diabetes" || value.id === "kidney" ? Droplets : value.id === "vitamins" ? Sparkles : value.id === "general" || value.id === "thyroid" ? Activity : UserRound;
            return <button type="button" key={value.id} className={`${chip.chip} ${styles.category}`} data-tone={value.tone} aria-pressed={activeCategory === value.id} onClick={() => onCategory(activeCategory === value.id ? "All" : value.id)}><Icon aria-hidden />{value.label}</button>;
          })}
        </div>}
      </div>
    </section>

    {!facility ? <section className={styles.chooseCentre}>
      <span className={styles.centreMark}><Building2 aria-hidden /></span>
      <div><h2>Choose where you’ll visit</h2><p>See the packages, tests and prices available at your hospital or clinic.</p></div>
      <button type="button" className={styles.primary} onClick={onOpenFacility}>Choose centre</button>
    </section> : <>
      <div ref={results} className={styles.results} tabIndex={-1} role="region" aria-label={searching ? "Search results" : tab === "package" ? "Health packages" : "Lab tests"}>
        {searching && <div className={styles.resultHeading}><h2>Results for “{query.trim()}”</h2><button type="button" className={styles.textAction} onClick={() => onQuery("")}>Clear search<X aria-hidden /></button></div>}
        <p className={styles.srOnly} role="status">{visible.length ? `${packages.length} health packages and ${tests.length} lab tests available` : "No matching packages or lab tests"}</p>
        {visible.length ? <>
          {packages.length > 0 && <section aria-label="Health packages"><h2 className={searching ? styles.groupHeading : styles.srOnly}>Health packages</h2><div className={styles.cardGrid}>{packages.map(renderItem)}</div></section>}
          {tests.length > 0 && <section aria-label="Lab tests"><h2 className={searching ? styles.groupHeading : styles.srOnly}>Lab tests</h2><div className={styles.cardGrid}>{tests.map(renderItem)}</div></section>}
        </> : <section className={styles.empty}>
          <Search aria-hidden /><h2>{searching ? "No matching packages or tests" : `No ${tab === "package" ? "packages" : "lab tests"} listed here`}</h2>
          <p>{searching ? "Try a different name, or clear your search." : "Try another centre or explore the other services."}</p>
          <div>{searching ? <button type="button" className={styles.textAction} onClick={() => onQuery("")}>Clear search</button> : <button type="button" className={styles.textAction} onClick={() => browse(tab === "package" ? "test" : "package")}>{tab === "package" ? "Browse lab tests" : "Browse health packages"}</button>}
          <button type="button" className={styles.textAction} onClick={onOpenFacility}>Change centre</button></div>
        </section>}
      </div>
    </>}
  </>;
}
