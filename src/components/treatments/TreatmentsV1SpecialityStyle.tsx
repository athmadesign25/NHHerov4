"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  TREATMENTS_PROCEDURES_DATA,
  TreatmentProcedureItem
} from "@/data/treatmentsProceduresData";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import { NH_CITIES } from "@/lib/searchService";
import styles from "./TreatmentsV1SpecialityStyle.module.css";
import TreatmentFilterPanel from "./TreatmentFilterPanel";
import { filterTreatments, parseTreatmentSelection, toggleTreatmentSelection, type TreatmentFilters } from "./treatmentFilters";
import AppliedFilterList from "@/app/search/designs/d21/AppliedFilterList";
import FilterScrollArea from "@/app/search/designs/d3/FilterScrollArea";
import SearchDialog from "@/app/search/designs/d3/SearchDialog";
import SearchCityPicker from "@/components/ui/search-location/SearchCityPicker";
import bookingStyles from "@/app/search/designs/d3/Design3SearchResults.module.css";
import bookingFilterStyles from "@/app/search/designs/d21/Design21Filters.module.css";
import searchTheme from "@/components/ui/search-location/SearchTheme.module.css";

export interface TreatmentsV1Props {
  activeVersion?: 1 | 2;
  onVersionChange?: (v: 1 | 2) => void;
}

export default function TreatmentsV1SpecialityStyle({
  activeVersion = 1,
  onVersionChange,
}: TreatmentsV1Props) {
  const searchParams = useSearchParams();

  // Search & filter states
  const [search, setSearch] = useState(() => searchParams?.get("search") || searchParams?.get("q") || "");
  const [filters, setFilters] = useState<TreatmentFilters>(() => ({
    specialties: parseTreatmentSelection(searchParams?.get("speciality")),
    classifications: parseTreatmentSelection(searchParams?.get("type")),
    letters: [],
  }));
  // The source catalogue has no per-city availability; retain location as browsing context.
  const [cities, setCities] = useState(() => parseTreatmentSelection(searchParams?.get("city")));
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  // Navbar visibility synchronized with Navbar's scroll state & data-nav-visible on <html>
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const current = window.scrollY;
      if (current < 120) {
        setNavVisible(true);
        last = current;
        return;
      }
      if (Math.abs(current - last) < 12) return;
      setNavVisible(current < last);
      last = current;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateNavVisible = () => {
      const attr = document.documentElement.getAttribute("data-nav-visible");
      if (attr !== null) {
        setNavVisible(attr !== "false");
      }
    };
    updateNavVisible();

    const observer = new MutationObserver(updateNavVisible);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-nav-visible"],
    });

    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const result = filterTreatments(TREATMENTS_PROCEDURES_DATA, search, filters);

    // Sort
    if (sortBy === "success") {
      result.sort((a, b) => {
        const parseRate = (val?: string) => (val ? parseFloat(val.replace(/[^0-9.]/g, "")) : 0);
        return parseRate(b.successRate) - parseRate(a.successRate);
      });
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.shortTitle || a.title).localeCompare(b.shortTitle || b.title));
    } else if (sortBy === "stay") {
      result.sort((a, b) => (a.hospitalStay || "").localeCompare(b.hospitalStay || ""));
    }

    return result;
  }, [search, filters, sortBy]);

  const appliedChips = [
    ...(search.trim() ? [{ key: "search", label: `“${search.trim()}”`, remove: () => setSearch("") }] : []),
    ...(["specialties", "classifications", "letters"] as const).flatMap(group => filters[group].map(label => ({
      key: `${group}-${label}`,
      label: group === "letters" ? `Letter: ${label}` : label,
      remove: () => setFilters(previous => ({ ...previous, [group]: previous[group].filter(item => item !== label) })),
    }))),
    ...cities.map(city => ({ key: `city-${city}`, label: NH_CITIES.find(item => item.value === city)?.label ?? city,
      remove: () => setCities(previous => previous.filter(item => item !== city)) })),
  ];
  const handleResetFilters = () => {
    setSearch("");
    setFilters({ specialties: [], classifications: [], letters: [] });
    setCities([]);
    setSortBy("relevance");
  };
  const toggleFilter = (group: keyof TreatmentFilters | "cities", option: string) => {
    if (group === "cities") setCities(previous => toggleTreatmentSelection(previous, option));
    else setFilters(previous => ({ ...previous, [group]: toggleTreatmentSelection(previous[group], option) }));
  };
  const renderFilters = () => <TreatmentFilterPanel value={filters} cities={cities} onToggle={toggleFilter} />;

  return (
    <div className={`${styles.page} ${searchTheme.theme}`} data-design="treatments" data-nav-theme="light">
      {/* ── 1. TITLE & HERO ── */}
      <header className={`${styles.container} ${styles.titleRow}`}>
        <div className={styles.titleTopRow}>
          <div className={styles.titleCol}>
            <h1 className={styles.titleHeading}>Our Medical Procedures &amp; Treatments</h1>
            <p className={styles.pageSummary}>
              From complex cardiac surgeries and multi-organ transplants to robotic joint replacements and advanced day care interventions &mdash; explore 400+ clinical treatments across Narayana Health.
            </p>
          </div>
          {onVersionChange && (
            <div className={styles.versionSwitchWrap}>
              <div className={styles.segmentedControl}>
                <button
                  type="button"
                  className={`${styles.segmentedBtn} ${activeVersion === 1 ? styles.segmentedBtnActive : ""}`}
                  onClick={() => onVersionChange(1)}
                  title="Switch to V1 Speciality Directory layout"
                >
                  V1 Speciality
                </button>
                <button
                  type="button"
                  className={`${styles.segmentedBtn} ${activeVersion === 2 ? styles.segmentedBtnActive : ""}`}
                  onClick={() => onVersionChange(2)}
                  title="Switch to V2 Pulse Library layout"
                >
                  V2 Library
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── 2. STICKY UNIFIED SEARCH & REFINEMENT TOOLBAR ── */}
      <div className={`${styles.searchToolbarWrapper} ${!navVisible ? styles.navHidden : ""}`} data-d3-search-bar>
        <div className={styles.searchToolbarInner}>
          <div className={styles.searchRow}>
            {/* Unified Search Input */}
            <div className={styles.combinedSearch}>
              {/* City Location Select */}
              <SearchCityPicker cities={NH_CITIES} value={cities.join(",") || "All"}
                onChange={value => setCities(parseTreatmentSelection(value))} showDeviceLocation={false} className={styles.locationPicker} />

              {/* Search Form */}
              <form
                className={styles.searchForm}
                role="search"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.searchField}>
                  <input
                    ref={searchInput}
                    type="search"
                    className={styles.searchFieldInput}
                    placeholder="Search procedure, surgery or clinical condition (e.g. Angioplasty, TKR, Kidney)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    aria-label="Search treatments and procedures"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={styles.searchClearBtn}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className={styles.searchSubmitBtn}
                  aria-label="Submit search"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open procedure filters"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {appliedChips.length > 0 && (
                <span className={styles.filterBadge}>{appliedChips.length}</span>
              )}
            </button>
          </div>

          <AppliedFilterList chips={appliedChips} focusFallback={() => searchInput.current?.focus({ preventScroll: true })} />
        </div>
      </div>

      {/* ── 3. MAIN TWO-COLUMN LAYOUT ── */}
      <div className={styles.layout}>
        <aside className={`${bookingStyles.sidebar} ${styles.sidebar}`} aria-label="Procedure filters" data-lenis-prevent data-d3-ui>
          <div className={bookingFilterStyles.filterTools} data-filter-tools>
            <div className={bookingStyles.filterHeading}>
              <h2><Filter size={16} aria-hidden />Filters</h2>
              {appliedChips.length > 0 && <button type="button" aria-label="Clear all filters" onClick={handleResetFilters}>Clear all</button>}
            </div>
          </div>
          <FilterScrollArea>{renderFilters()}</FilterScrollArea>
        </aside>

        {/* Right Main Results Area */}
        <section className={styles.resultsArea} aria-label="Procedure results">
          {/* Results Header: Count & Sort */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount} role="status" aria-live="polite">
              Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "clinical procedure" : "clinical procedures"}
            </div>

            <div className={styles.sortSelectWrapper}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
                aria-label="Sort clinical procedures"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="success">Success Rate: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="stay">Hospital Stay: Short to Long</option>
              </select>
              <ChevronDown className={styles.sortSelectArrow} size={15} aria-hidden="true" />
            </div>
          </div>

          {/* Speciality-Style Cards Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div className={styles.cardsGrid} layout>
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.slug}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.25), duration: 0.35 }}
                >
                  <SpecialityProcedureCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <div className={styles.emptyTitle}>No clinical procedures found</div>
              <div className={styles.emptyDesc}>
                Try adjusting your search query, department, or clearing applied filters.
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.emptyResetBtn}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        eyebrow="WORLD-CLASS SURGICAL & CLINICAL EXCELLENCE"
        title="Looking for a Surgical Second Opinion or Cost Estimate?"
        subtitle="Our senior surgical boards review complex diagnoses, imaging reports, and recommend minimally invasive surgical alternatives with transparent, all-inclusive pricing."
        primaryBtn={{
          href: "/doctors",
          text: "Book Surgical Consultation",
        }}
        secondaryBtn={{
          href: "/health-packages",
          text: "Explore Health Packages",
        }}
        phoneText="Surgical Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />

      {/* ── 4. MOBILE FILTER DRAWER MODAL ── */}
      {mobileFilterOpen && <SearchDialog title="Procedure filters" mobileOnly onClose={() => setMobileFilterOpen(false)}
        headerAction={<button type="button" className={bookingFilterStyles.drawerClear} disabled={!appliedChips.length} onClick={handleResetFilters}>Clear all</button>}
        footer={<button type="button" className={bookingStyles.primaryButton} onClick={() => setMobileFilterOpen(false)}>Show {filtered.length} procedures</button>}>
        {renderFilters()}
      </SearchDialog>}
    </div>
  );
}

// ── Speciality-Anatomy Procedure Card ──
function SpecialityProcedureCard({ item }: { item: TreatmentProcedureItem }) {
  // Derive metric value and label
  const statValue = item.successRate || item.duration || "98.5%+";
  const statLabel = item.successRate ? "Clinical Success" : "Procedure Duration";

  return (
    <Link
      id={`procedure-card-${item.slug}`}
      aria-label={item.shortTitle || item.title}
      className={styles.procedureCard}
      href={`/procedures/${item.slug}`}
    >
      <img
        alt={item.shortTitle || item.title}
        loading="lazy"
        src={item.image}
        className={styles.cardImage}
      />
      <div className={styles.cardOverlay} />

      <div className={styles.cardTopBadges}>
        <div className={styles.cardSpecialityBadge}>
          <span>{item.speciality}</span>
        </div>
        {item.isPopular && (
          <div className={styles.cardCoEBadge}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span>Centre of Excellence</span>
          </div>
        )}
      </div>

      <div className={styles.cardTextWrap}>
        <div className={styles.cardStats}>
          <div className={styles.metricValue}>{statValue}</div>
          <div className={styles.metricLabel}>{statLabel}</div>
        </div>

        <div className={styles.procedureNameRow}>
          <span className={styles.procedureName}>{item.shortTitle || item.title}</span>
          <ArrowRight className={styles.nameArrow} size={16} strokeWidth={2.5} />
        </div>

        <span className={styles.cardAction}>
          Read more
          <span className={styles.actionUnderline} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
