"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Building2, Search, X, History, Heart, Droplets, Sparkles, UserRound, Activity } from "lucide-react";
import HealthCatalogueSearch from "./HealthCatalogueSearch";
import searchStyles from "@/components/ui/search-location/SearchToolbar.module.css";
import searchTheme from "@/components/ui/search-location/SearchTheme.module.css";
import chip from "@/components/ui/search-location/ControlChip.module.css";
import type { FacilityId, HealthFacility, HealthItem } from "../catalog";
import { matchesHealthQuery } from "../healthDiscovery";
import HealthIncludedTests from "../HealthIncludedTests";
import { HEALTH_CATEGORIES, healthCategories } from "../healthCardContent";
import HealthLocationPicker, { HealthCentreChooser } from "./HealthLocationPicker";
import HealthDiscoveryCard from "./HealthDiscoveryCard";
import HealthLandingCard from "../design6/HealthLandingCard";
import HealthCatalogueTabs from "./HealthCatalogueTabs";
import HealthTypeToggle from "./HealthTypeToggle";
import styles from "./HealthListing3.module.css";
import HealthFocusRail4 from "../design4/HealthFocusRail4";
import { BookingFocusGlow } from "@/features/booking/components/BookingFocus";
import preview from "../design4/HealthListing4.module.css";
import compactStyles from "../design5/HealthListing5.module.css";

interface Props {
  variant?: "3" | "4" | "5" | "6";
  renderHero?: (controls: ReactNode) => ReactNode;
  cities: readonly { value: string; label: string }[];
  facilities: readonly HealthFacility[];
  facility?: HealthFacility;
  initialCity?: string;
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
  const { cities, facilities, facility, initialCity, facilityOpen, onOpenFacility, onCloseFacility, onFacility,
    catalog, query, onQuery, tab, onTab, category, onCategory, ids, includedIds,
    onAdd, onDetails, bookedIds = [], variant = "3" } = props;
  const immersive = variant === "4";
  const compact = variant === "5" || variant === "6";
  const [testsItem, setTestsItem] = useState<HealthItem | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const results = useRef<HTMLDivElement>(null);
  const catalogueId = useId();
  const panelId = `${catalogueId}-results`;
  const searching = Boolean(query.trim());
  const categories = useMemo(() => HEALTH_CATEGORIES.filter(category => category.id !== "all" && catalog.some(item => item.kind === tab && healthCategories(item).includes(category.id))), [catalog, tab]);
  const hasHistory = catalog.some(item => item.kind === tab && bookedIds.includes(item.id));
  const activeCategory = category === "booked" ? (hasHistory ? "booked" : "All") : categories.some(entry => entry.id === category) ? category : "All";
  const visible = catalog.filter(item => searching ? matchesHealthQuery(item, query) : item.kind === tab
    && (activeCategory === "All" || (activeCategory === "booked"
      ? bookedIds.includes(item.id) : healthCategories(item).some(value => value === activeCategory))));
  const typeLabel = searching ? "packages and tests" : tab === "package" ? "health packages" : "lab tests";

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
    const Card = variant === "6" ? HealthLandingCard : HealthDiscoveryCard;
    return <Card key={item.id} item={item} eager={index < 3} selected={ids.includes(item.id)} included={includedIds.includes(item.id)}
      onAdd={() => onAdd(item)} onDetails={() => onDetails(item)} onTests={() => setTestsItem(item)} previouslyBooked={bookedIds.includes(item.id)} />;
  }

  const focusChips = !searching && (categories.length > 0 || hasHistory) && <div className={`${styles.categories} ${compact ? compactStyles.categories : ""}`} role="group" aria-label="Filter by health focus">
    <button type="button" className={chip.chip} aria-pressed={activeCategory === "All"} onClick={() => onCategory("All")}>All</button>
    {hasHistory && <button type="button" className={chip.chip} aria-pressed={activeCategory === "booked"} onClick={() => onCategory("booked")}><History aria-hidden />Booked before</button>}
    {categories.map(value => {
      const Icon = value.id === "heart" ? Heart : value.id === "diabetes" || value.id === "kidney" ? Droplets : value.id === "vitamins" ? Sparkles : value.id === "general" || value.id === "thyroid" ? Activity : UserRound;
      return <button type="button" key={value.id} className={`${chip.chip} ${styles.category}`} data-tone={value.tone} aria-pressed={activeCategory === value.id} onClick={() => onCategory(activeCategory === value.id ? "All" : value.id)}><Icon aria-hidden />{value.label}</button>;
    })}
  </div>;

  const controls = <section className={`${searchStyles.searchBar} ${searchTheme.theme} ${styles.discoveryBar} ${immersive ? preview.toolbar : ""} ${compact ? compactStyles.toolbar : ""} ${!navVisible ? searchStyles.navHidden : ""}`} aria-label="Find health packages and tests">
      <div className={searchStyles.toolbarContent}>
        <div className={`${styles.catalogueHeader} ${immersive ? preview.catalogueHeader : ""} ${compact ? compactStyles.catalogueHeader : ""}`}>
          <div className={`${styles.searchRow} ${immersive ? preview.searchGlass : ""}`}>
            <HealthCatalogueSearch locationControl={<HealthLocationPicker initialCity={initialCity} cities={cities} facilities={facilities} selectedFacility={facility} open={facilityOpen}
                onOpen={onOpenFacility} onClose={onCloseFacility} onSelect={onFacility} />} locationOpen={facilityOpen} catalog={catalog} query={query} onQuery={value => { onQuery(value); onCategory("All"); }}
              onDetails={onDetails} onSubmit={() => results.current?.focus({ preventScroll: true })} />
            {immersive && <BookingFocusGlow />}
          </div>
          {compact ? <HealthTypeToggle value={tab} searching={searching} onChange={browse} /> : <HealthCatalogueTabs id={catalogueId} panelId={panelId} value={searching ? null : tab} onChange={browse} />}
        </div>
        {!immersive && !compact && focusChips}
      </div>
    </section>;

  return <>
    {testsItem && <HealthIncludedTests item={testsItem} onClose={() => setTestsItem(null)} onDetails={() => { setTestsItem(null); onDetails(testsItem); }} />}
    {!facility && immersive && props.renderHero?.(null)}
    {!facility ? <section className={`${styles.chooseCentre} ${immersive ? preview.chooseCentre : ""}`}>
      <div className={styles.centreIntro}>
        <span className={styles.centreMark}><Building2 aria-hidden /></span>
        <h2>Where would you like to visit?</h2>
        <p>Choose a centre to see available packages, tests and prices.</p>
      </div>
      <HealthCentreChooser key={initialCity ?? "all-cities"} cities={cities} facilities={facilities} initialCity={initialCity} onSelect={onFacility} />
    </section> : <>
    {immersive && props.renderHero ? props.renderHero(controls) : controls}
      {variant === "5" && focusChips}
      {(immersive || variant === "6") && !searching && (categories.length > 0 || hasHistory) && <HealthFocusRail4 id={`${catalogueId}-focus`} categories={categories} active={activeCategory} hasHistory={hasHistory} onChange={onCategory} />}
      <div ref={results} id={panelId} className={`${styles.results} ${immersive ? preview.results : ""}`} tabIndex={-1} role="region" aria-label="Health search results">
        {immersive && !searching && <div className={preview.resultsHeading}><h2>{tab === "package" ? "Health packages" : "Lab tests"}{activeCategory !== "All" ? ` · ${activeCategory === "booked" ? "Booked before" : categories.find(entry => entry.id === activeCategory)?.label}` : ""}</h2>{activeCategory !== "All" && <button type="button" className={styles.textAction} onClick={() => onCategory("All")}>Show all<X aria-hidden /></button>}</div>}
        {searching && <div className={styles.resultHeading}><h2>Results for “{query.trim()}”</h2><button type="button" className={styles.textAction} onClick={() => onQuery("")}>Clear search<X aria-hidden /></button></div>}
        <p className={styles.srOnly} role="status">{visible.length ? `${visible.length} ${typeLabel} available` : !catalog.length ? "Catalogue unavailable for this centre" : `No matching ${typeLabel}`}</p>
        {visible.length ? searching ? <div className={styles.resultGroups}>{(["package", "test"] as const).map(kind => {
          const matches = visible.filter(item => item.kind === kind);
          return matches.length > 0 && <section key={kind} aria-labelledby={`${panelId}-${kind}`}><h3 id={`${panelId}-${kind}`} className={styles.groupHeading}>{kind === "package" ? "Health packages" : "Lab tests"}</h3><div className={styles.cardGrid}>{matches.map(renderItem)}</div></section>;
        })}</div> : <div className={styles.cardGrid}>{visible.map(renderItem)}</div> : <section className={styles.empty}>
          <Search aria-hidden /><h2>{!catalog.length ? "Catalogue unavailable for this centre" : searching || activeCategory !== "All" ? `No matching ${typeLabel}` : `No ${typeLabel} listed here`}</h2>
          <p>{!catalog.length ? "We can’t show packages and tests for this centre yet. Choose another centre to browse." : searching ? "Try a different name, or clear your search." : activeCategory !== "All" ? "Try another health focus or view all results." : "Try another centre or explore the other services."}</p>
          <div>{catalog.length > 0 && (activeCategory !== "All" ? <button type="button" className={styles.textAction} onClick={() => onCategory("All")}>Clear health focus</button> : searching ? <button type="button" className={styles.textAction} onClick={() => onQuery("")}>Clear search</button> : <button type="button" className={styles.textAction} onClick={() => browse(tab === "package" ? "test" : "package")}>{tab === "package" ? "Browse lab tests" : "Browse health packages"}</button>)}
          <button type="button" className={styles.textAction} onClick={onOpenFacility}>Change centre</button></div>
        </section>}
      </div>
    </>}
  </>;
}
