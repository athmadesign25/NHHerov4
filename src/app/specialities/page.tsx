"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  X,
  Star,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Stethoscope,
  Award,
  MapPin,
  Filter,
  Check,
} from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { ALL_SPECIALITIES, SPECIALITY_CATEGORIES, type SpecialityMeta } from "@/data/specialities";
import { NH_CITIES } from "@/lib/searchService";
import {
  SpecialityFilters,
  FilterScrollArea,
  ActiveSpecialityFilters,
  SidebarSpecialityFilters,
  SpecialityFilterDialog,
} from "./filters";
import styles from "./page.module.css";


const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to determine destination URL (Cancer Care -> ?design=2)
function getSpecialityHref(slug: string): string {
  if (slug === "oncology") {
    return "/specialities/oncology?design=2";
  }
  return `/specialities/${slug}`;
}

function isCoEQuery(cat: string, classification: string, isCoEParam: boolean): boolean {
  if (isCoEParam) return true;
  const c = cat.toLowerCase().trim();
  const cl = classification.toLowerCase().trim();
  return (
    c === "centres of excellence" ||
    c === "centre of excellence" ||
    c === "centres-of-excellence" ||
    c === "centre-of-excellence" ||
    c === "coe" ||
    cl.includes("excellence")
  );
}

function SpecialitiesContent() {
  const searchParams = useSearchParams();
  const reducedMotion = Boolean(useReducedMotion());

  const isCoE = useMemo(() => {
    const cat = searchParams?.get("category") || searchParams?.get("filter") || "";
    const cl = searchParams?.get("classification") || "";
    const coeParam = searchParams?.get("coe") === "true";
    return isCoEQuery(cat, cl, coeParam);
  }, [searchParams]);

  const [search, setSearch] = useState(() => searchParams?.get("search") || searchParams?.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (isCoE) return "Centres of Excellence";
    return searchParams?.get("category") || searchParams?.get("filter") || "All";
  });
  const [selectedClassification, setSelectedClassification] = useState(() => {
    if (isCoE) return "Centres of Excellence Only";
    return searchParams?.get("classification") || "All";
  });
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [selectedCity, setSelectedCity] = useState(() => searchParams?.get("location") || searchParams?.get("city") || "All");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const refinementScrollRef = useRef<HTMLDivElement>(null);
  const [refinementEdges, setRefinementEdges] = useState<{
    overflow: boolean;
    previous: boolean;
    next: boolean;
  }>({ overflow: false, previous: false, next: false });

  // Sync scroll edge indicators for DoctorRefinementRow styling
  useEffect(() => {
    const el = refinementScrollRef.current;
    if (!el) return;

    const measureEdges = () => {
      const overflow = el.scrollWidth > el.clientWidth + 1;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const previous = overflow && el.scrollLeft > 2;
      const next = overflow && el.scrollLeft < maxScroll - 2;
      setRefinementEdges((prev) =>
        prev.overflow === overflow && prev.previous === previous && prev.next === next
          ? prev
          : { overflow, previous, next }
      );
    };

    measureEdges();
    el.addEventListener("scroll", measureEdges, { passive: true });
    const ro = new ResizeObserver(measureEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", measureEdges);
      ro.disconnect();
    };
  }, []);

  // Sync query params whenever searchParams changes
  useEffect(() => {
    const query = searchParams?.get("search") || searchParams?.get("q") || "";
    const rawCat = searchParams?.get("category") || searchParams?.get("filter") || "";
    const cl = searchParams?.get("classification") || "";
    const loc = searchParams?.get("location") || searchParams?.get("city") || "";
    const coeParam = searchParams?.get("coe") === "true";

    if (isCoEQuery(rawCat, cl, coeParam)) {
      setSelectedCategory("Centres of Excellence");
      setSelectedClassification("Centres of Excellence Only");
    } else {
      setSelectedCategory(rawCat || "All");
      setSelectedClassification(cl || "All");
    }

    if (query) setSearch(query);
    if (loc) setSelectedCity(loc);
  }, [searchParams]);

  // Navbar visibility synchronized with Navbar's data-nav-visible on <html>
  const [navVisible, setNavVisible] = useState(true);

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

  // Refinement scroll handler
  const scrollRefinements = (direction: -1 | 1) => {
    if (refinementScrollRef.current) {
      refinementScrollRef.current.scrollBy({
        left: direction * (refinementScrollRef.current.clientWidth * 0.75),
        behavior: "smooth",
      });
    }
  };

  // Categories list with Centres of Excellence
  const categories = useMemo(() => {
    return [
      "All",
      "Centres of Excellence",
      ...SPECIALITY_CATEGORIES.filter((c) => c !== "All"),
    ];
  }, []);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: ALL_SPECIALITIES.length,
      "Centres of Excellence": ALL_SPECIALITIES.filter((s) => s.isCoE).length,
    };
    SPECIALITY_CATEGORIES.filter((c) => c !== "All").forEach((cat) => {
      counts[cat] = ALL_SPECIALITIES.filter((s) => s.category === cat).length;
    });
    return counts;
  }, []);

  // Dynamic counts for classification
  const classificationCounts = useMemo(() => {
    return {
      All: ALL_SPECIALITIES.length,
      "Centres of Excellence Only": ALL_SPECIALITIES.filter((s) => s.isCoE).length,
      "24/7 Emergency Support": ALL_SPECIALITIES.filter(
        (s) =>
          s.tagline.toLowerCase().includes("emergency") ||
          s.slug === "critical-care" ||
          s.slug === "cardiology" ||
          s.slug === "neurology"
      ).length,
    };
  }, []);

  // Letters that have at least one speciality
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    ALL_SPECIALITIES.forEach((s) => {
      const letter = (s.shortName || s.name).trim().charAt(0).toUpperCase();
      letters.add(letter);
    });
    return letters;
  }, []);

  // Filtered & Sorted Specialities
  const filtered = useMemo(() => {
    const list = ALL_SPECIALITIES.filter((s) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchShort = s.shortName.toLowerCase().includes(q);
        const matchCat = s.category.toLowerCase().includes(q);
        const matchTag = s.tagline.toLowerCase().includes(q);
        const matchCond = s.keyConditions?.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchShort && !matchCat && !matchTag && !matchCond) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory === "Centres of Excellence") {
        if (!s.isCoE) return false;
      } else if (selectedCategory !== "All") {
        if (s.category !== selectedCategory) return false;
      }

      // 3. Classification Filter
      if (selectedClassification === "Centres of Excellence Only") {
        if (!s.isCoE) return false;
      } else if (selectedClassification === "24/7 Emergency Support") {
        if (
          !s.tagline.toLowerCase().includes("emergency") &&
          s.slug !== "critical-care" &&
          s.slug !== "cardiology" &&
          s.slug !== "neurology"
        ) {
          return false;
        }
      }

      // 4. A–Z Letter Filter
      if (selectedLetter !== "All") {
        const firstLetter = (s.shortName || s.name).trim().charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "doctors") {
      return [...list].sort((a, b) => (b.doctorCount || 0) - (a.doctorCount || 0));
    }
    if (sortBy === "name") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "procedures") {
      return [...list].sort((a, b) => {
        const valA = parseFloat(a.stat.value.replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(b.stat.value.replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    }

    return list;
  }, [search, selectedCategory, selectedClassification, selectedLetter, sortBy]);

  // Active filter indicators
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (selectedCategory !== "All") count++;
    if (
      selectedClassification !== "All" &&
      !(
        selectedCategory === "Centres of Excellence" &&
        selectedClassification === "Centres of Excellence Only"
      )
    ) {
      count++;
    }
    if (selectedLetter !== "All") count++;
    if (selectedCity !== "All") count++;
    return count;
  }, [search, selectedCategory, selectedClassification, selectedLetter, selectedCity]);

  const hasActiveFilters = activeFiltersCount > 0;

  const appliedChips = useMemo(() => {
    const list: { key: string; label: string; remove: () => void }[] = [];
    if (search.trim()) {
      list.push({
        key: "search",
        label: `"${search.trim()}"`,
        remove: () => setSearch(""),
      });
    }
    if (selectedCategory !== "All") {
      list.push({
        key: "category",
        label: selectedCategory,
        remove: () => {
          setSelectedCategory("All");
          if (selectedClassification === "Centres of Excellence Only") {
            setSelectedClassification("All");
          }
        },
      });
    }
    if (
      selectedClassification !== "All" &&
      !(
        selectedCategory === "Centres of Excellence" &&
        selectedClassification === "Centres of Excellence Only"
      )
    ) {
      list.push({
        key: "classification",
        label: selectedClassification,
        remove: () => setSelectedClassification("All"),
      });
    }
    if (selectedLetter !== "All") {
      list.push({
        key: "letter",
        label: `Letter: ${selectedLetter}`,
        remove: () => setSelectedLetter("All"),
      });
    }
    if (selectedCity !== "All") {
      list.push({
        key: "city",
        label: selectedCity,
        remove: () => setSelectedCity("All"),
      });
    }
    return list;
  }, [search, selectedCategory, selectedClassification, selectedLetter, selectedCity]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedClassification("All");
    setSelectedLetter("All");
    setSelectedCity("All");
    setSortBy("relevance");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  return (
    <div className={styles.page} data-nav-theme="light">
      {/* ── 1. HEADER & HERO (Matching DoctorSearchTop from aditya4_work) ── */}
      <header className={`${styles.container} ${styles.titleRow}`}>
        <div className={styles.title}>
          <h1 id="specialities-title" tabIndex={-1} className={styles.titleHeading}>
            Our Medical Specialities
          </h1>
        </div>
        <p className={styles.pageSummary}>
          From complex cardiac surgeries to advanced oncology and robotic orthopaedics — Narayana
          Health covers every dimension of your health across 25+ hospitals.
        </p>
      </header>

      {/* ── 2. STICKY UNIFIED SEARCH & REFINEMENT TOOLBAR ── */}
      <div className={`${styles.searchToolbarWrapper} ${!navVisible ? styles.navHidden : ""}`} data-d3-search-bar>
        <div className={styles.searchToolbarInner}>
          <div className={styles.searchRow}>
            {/* Unified Search Input (Location + Query) */}
            <div className={styles.combinedSearch}>
              {/* Leading City Location dropdown */}
              <label className={styles.leadingLocation}>
                <MapPin size={16} aria-hidden="true" />
                <span className={styles.srOnly}>Select location</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Filter specialities by location"
                >
                  <option value="All">All Locations</option>
                  {NH_CITIES.map((c) => (
                    <option key={c.id} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Search Form */}
              <form
                className={styles.searchForm}
                role="search"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.searchField}>
                  <input
                    id="speciality-search-input"
                    type="search"
                    className={styles.searchFieldInput}
                    placeholder="Search speciality, condition or treatment (e.g. Heart, Knee, Cancer)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    aria-label="Search medical specialities"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={styles.searchClearBtn}
                      aria-label="Clear search query"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className={styles.searchSubmitBtn}
                  aria-label="Search"
                  title="Search"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              className={styles.mobileFilterBtn}
              data-active={hasActiveFilters}
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open filter sidebar"
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className={styles.mobileFilterBadge}>{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Horizontal Refinement Bar (DoctorRefinementRow styling) */}
          <div
            className={styles.refinementRow}
            role="group"
            aria-label="Category shortcuts"
            data-overflow={refinementEdges.overflow ? "true" : undefined}
            data-has-previous={refinementEdges.previous ? "true" : undefined}
            data-has-next={refinementEdges.next ? "true" : undefined}
          >
            <button
              type="button"
              className={`${styles.refinementArrow} ${styles.refinementArrowLeft}`}
              onClick={() => scrollRefinements(-1)}
              aria-label="Scroll categories left"
              data-visible={refinementEdges.previous ? "true" : "false"}
              tabIndex={refinementEdges.previous ? 0 : -1}
              disabled={!refinementEdges.previous}
            >
              <ChevronLeft size={16} />
            </button>

            <div ref={refinementScrollRef} className={styles.refinementViewport}>
              {/* All */}
              <button
                type="button"
                className={`${styles.refinementChip} ${
                  selectedCategory === "All" && selectedClassification === "All"
                    ? styles.refinementChipActive
                    : ""
                }`}
                aria-pressed={selectedCategory === "All" && selectedClassification === "All"}
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedClassification("All");
                }}
              >
                All Specialities
              </button>

              {/* Centres of Excellence */}
              <button
                type="button"
                className={`${styles.refinementChip} ${
                  selectedCategory === "Centres of Excellence" ||
                  selectedClassification === "Centres of Excellence Only"
                    ? styles.refinementChipActive
                    : ""
                }`}
                aria-pressed={
                  selectedCategory === "Centres of Excellence" ||
                  selectedClassification === "Centres of Excellence Only"
                }
                onClick={() => {
                  setSelectedCategory("Centres of Excellence");
                  setSelectedClassification("Centres of Excellence Only");
                }}
              >
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                Centres of Excellence
              </button>

              {/* Top Categories */}
              {SPECIALITY_CATEGORIES.filter((c) => c !== "All").map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.refinementChip} ${
                      isActive ? styles.refinementChipActive : ""
                    }`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedClassification("All");
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={`${styles.refinementArrow} ${styles.refinementArrowRight}`}
              onClick={() => scrollRefinements(1)}
              aria-label="Scroll categories right"
              data-visible={refinementEdges.next ? "true" : "false"}
              tabIndex={refinementEdges.next ? 0 : -1}
              disabled={!refinementEdges.next}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN TWO-COLUMN LAYOUT ── */}
      <div className={styles.layout}>
        {/* Sticky Sidebar Filters */}
        <aside
          className={styles.sidebar}
          aria-label="Speciality filters"
          aria-describedby="d3-refinement-help"
          data-lenis-prevent="true"
          data-d3-ui="true"
        >
          <div className={styles.filterHeading}>
            <h2>
              <Filter size={16} aria-hidden />
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                Clear all
              </button>
            )}
          </div>

          <FilterScrollArea>
            <SidebarSpecialityFilters
              chips={appliedChips}
              onClearAll={handleResetFilters}
            />
            <SpecialityFilters
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedClassification={selectedClassification}
              onSelectClassification={setSelectedClassification}
              selectedLetter={selectedLetter}
              onSelectLetter={setSelectedLetter}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              categories={categories}
              categoryCounts={categoryCounts}
              classificationCounts={classificationCounts}
              availableLetters={availableLetters}
            />
          </FilterScrollArea>
        </aside>


        {/* Right Main Results Area */}
        <section className={styles.resultsArea} aria-label="Medical specialities results">
          {/* Applied Filter Chips matching Doctor listing flow */}
          {appliedChips.length > 0 && (
            <div style={{ marginBottom: "var(--sp-2, 16px)" }}>
              <ActiveSpecialityFilters
                chips={appliedChips}
                reducedMotion={reducedMotion}
                focusFallback={() => {
                  document.getElementById("refinement-all")?.focus({ preventScroll: true });
                }}
              />
            </div>
          )}

          {/* Results Header: Count & Sort Select */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount} id="specialities-results-count">
              Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "speciality" : "specialities"}
              {selectedCity !== "All" ? ` in ${selectedCity}` : ""}
            </div>

            <div className={styles.sortSelectWrapper}>
              <select
                id="speciality-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
                aria-label="Sort specialities"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="doctors">Specialists: High to Low</option>
                <option value="procedures">Procedures: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ChevronDown className={styles.sortSelectArrow} size={15} aria-hidden="true" />
            </div>
          </div>

          {/* Speciality Cards Grid (Exact match to Landing Page Specialty Card) */}
          <AnimatePresence mode="popLayout">
            <motion.div className={styles.cardsGrid} layout>
              {filtered.map((spec, i) => (
                <motion.div
                  key={spec.slug}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35 }}
                >
                  <SpecialityCardItem spec={spec} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <div className={styles.emptyTitle}>No specialities found</div>
              <div className={styles.emptyDesc}>
                Try adjusting your search query, location or reset your filters
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.emptyResetBtn}
                id="empty-reset-filters-btn"
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── 10. MOBILE FILTER MODAL / DRAWER (Matching DoctorFilterDialog from aditya4_work) ── */}
      {mobileFilterOpen && (
        <SpecialityFilterDialog
          count={filtered.length}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedClassification={selectedClassification}
          onSelectClassification={setSelectedClassification}
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
          categories={categories}
          categoryCounts={categoryCounts}
          classificationCounts={classificationCounts}
          availableLetters={availableLetters}
          onResetAll={handleResetFilters}
          onApply={() => setMobileFilterOpen(false)}
          onClose={() => setMobileFilterOpen(false)}
        />
      )}
    </div>
  );
}

export default function SpecialitiesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", paddingTop: "140px", textAlign: "center", color: "#64748B" }}>
          Loading specialities...
        </div>
      }
    >
      <SpecialitiesContent />
    </Suspense>
  );
}

function SpecialityCardItem({ spec }: { spec: SpecialityMeta }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link
      id={`speciality-card-${spec.slug}`}
      aria-label={spec.name}
      className={styles.specialityCard}
      href={getSpecialityHref(spec.slug)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        alt={spec.name}
        loading="lazy"
        src={spec.image}
        className={styles.cardImage}
      />
      {spec.video && (
        <video
          ref={videoRef}
          src={spec.video}
          className={`${styles.cardVideo} ${isHovered ? styles.cardVideoActive : ""}`}
          muted
          loop
          playsInline
        />
      )}
      <div className={styles.cardOverlay} />

      <div className={styles.cardTopBadges}>
        {spec.isCoE && (
          <div className={styles.cardCoEBadge}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span>Centre of Excellence</span>
          </div>
        )}
      </div>

      <div className={styles.cardTextWrap}>
        {spec.stat && (
          <div className={styles.cardStats}>
            <div className={styles.metricValue}>{spec.stat.value}</div>
            <div className={styles.metricLabel}>{spec.stat.label}</div>
          </div>
        )}
        <div className={styles.specialityNameRow}>
          <span className={styles.specialityName}>{spec.name}</span>
          <ArrowRight className={styles.nameArrow} size={16} strokeWidth={2.5} />
        </div>
        <span className={styles.cardAction}>
          Explore
          <span className={styles.actionUnderline} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

