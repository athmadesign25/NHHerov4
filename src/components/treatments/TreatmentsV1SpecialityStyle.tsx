"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Activity,
  Check,
} from "lucide-react";
import {
  TREATMENTS_PROCEDURES_DATA,
  TreatmentProcedureItem
} from "@/data/treatmentsProceduresData";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import { NH_CITIES } from "@/lib/searchService";
import styles from "./TreatmentsV1SpecialityStyle.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Common refinement categories for horizontal toolbar
const TOP_REFINEMENT_TAGS = [
  { id: "all", label: "All Procedures" },
  { id: "minimally-invasive", label: "Minimally Invasive", icon: Sparkles },
  { id: "day-care", label: "Day Care / Outpatient", icon: Clock },
  { id: "cardiology", label: "Cardiac Surgery" },
  { id: "oncology", label: "Cancer Care (Oncology)" },
  { id: "orthopaedics", label: "Orthopaedics & Joint" },
  { id: "neurology", label: "Neuro & Spine" },
  { id: "gastroenterology", label: "GI & Laparoscopy" },
  { id: "nephrology", label: "Nephrology & Urology" },
  { id: "paediatrics", label: "Paediatric Surgery" },
];

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
  const [selectedSpeciality, setSelectedSpeciality] = useState(() => searchParams?.get("speciality") || "All");
  const [specialitySearch, setSpecialitySearch] = useState("");
  const [selectedClassification, setSelectedClassification] = useState(() => searchParams?.get("type") || "All");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [selectedCity, setSelectedCity] = useState(() => searchParams?.get("city") || "All");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion states for left sidebar
  const [openSpecialityAccordion, setOpenSpecialityAccordion] = useState(true);
  const [openClassAccordion, setOpenClassAccordion] = useState(true);
  const [openLetterAccordion, setOpenLetterAccordion] = useState(false);
  const [openCityAccordion, setOpenCityAccordion] = useState(false);

  // Scroll refinement chips bar
  const refinementChipsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const checkScrollEdges = () => {
    const el = refinementChipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    checkScrollEdges();
    const el = refinementChipsRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollEdges, { passive: true });
      return () => el.removeEventListener("scroll", checkScrollEdges);
    }
  }, []);

  const scrollRefinements = (direction: "left" | "right") => {
    if (!refinementChipsRef.current) return;
    const offset = direction === "left" ? -240 : 240;
    refinementChipsRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Extract all unique specialities & procedure counts
  const { uniqueSpecialities, specialityCounts, classificationCounts, availableLetters } = useMemo(() => {
    const specMap: Record<string, number> = {};
    const classMap: Record<string, number> = {
      "All Types": TREATMENTS_PROCEDURES_DATA.length,
      "Minimally Invasive": 0,
      "Day Care": 0,
      "Complex Surgical": 0,
    };
    const letters = new Set<string>();

    TREATMENTS_PROCEDURES_DATA.forEach((item) => {
      // Speciality
      const spec = item.speciality || "General Surgery";
      specMap[spec] = (specMap[spec] || 0) + 1;

      // Classification detection
      const text = `${item.title} ${item.summary} ${item.overview} ${item.hospitalStay || ""}`.toLowerCase();
      if (text.includes("minimally") || text.includes("endovascular") || text.includes("laparoscopic") || text.includes("catheter")) {
        classMap["Minimally Invasive"]++;
      }
      if (text.includes("day care") || text.includes("same-day") || text.includes("same day") || (item.hospitalStay && item.hospitalStay.toLowerCase().includes("day care"))) {
        classMap["Day Care"]++;
      }
      if (text.includes("transplant") || text.includes("open") || text.includes("reconstruction") || text.includes("replacement")) {
        classMap["Complex Surgical"]++;
      }

      // First letter
      const l = (item.shortTitle || item.title).charAt(0).toUpperCase();
      if (l) letters.add(l);
    });

    const sortedSpecs = Object.keys(specMap).sort((a, b) => a.localeCompare(b));

    return {
      uniqueSpecialities: sortedSpecs,
      specialityCounts: specMap,
      classificationCounts: classMap,
      availableLetters: letters,
    };
  }, []);

  const filteredUniqueSpecialities = useMemo(() => {
    if (!specialitySearch.trim()) return uniqueSpecialities;
    const q = specialitySearch.toLowerCase().trim();
    return uniqueSpecialities.filter((s) => s.toLowerCase().includes(q));
  }, [uniqueSpecialities, specialitySearch]);

  // Filtered and sorted procedures
  const filtered = useMemo(() => {
    let result = [...TREATMENTS_PROCEDURES_DATA];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.shortTitle.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.overview.toLowerCase().includes(q) ||
          item.speciality.toLowerCase().includes(q)
        );
      });
    }

    // Speciality filter
    if (selectedSpeciality !== "All") {
      result = result.filter((item) => item.speciality.toLowerCase() === selectedSpeciality.toLowerCase());
    }

    // Classification filter
    if (selectedClassification !== "All" && selectedClassification !== "All Types") {
      const c = selectedClassification.toLowerCase();
      result = result.filter((item) => {
        const text = `${item.title} ${item.summary} ${item.overview} ${item.hospitalStay || ""}`.toLowerCase();
        if (c.includes("minimally")) {
          return text.includes("minimally") || text.includes("endovascular") || text.includes("laparoscopic") || text.includes("catheter");
        }
        if (c.includes("day care")) {
          return text.includes("day care") || text.includes("same-day") || text.includes("same day") || (item.hospitalStay && item.hospitalStay.toLowerCase().includes("day care"));
        }
        if (c.includes("complex") || c.includes("surgical")) {
          return text.includes("transplant") || text.includes("open") || text.includes("reconstruction") || text.includes("replacement");
        }
        return true;
      });
    }

    // Letter filter
    if (selectedLetter !== "All") {
      result = result.filter((item) => {
        const l = (item.shortTitle || item.title).charAt(0).toUpperCase();
        return l === selectedLetter;
      });
    }

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
  }, [search, selectedSpeciality, selectedClassification, selectedLetter, selectedCity, sortBy]);

  // Applied chips list
  const appliedChips = useMemo(() => {
    const list: { key: string; label: string; remove: () => void }[] = [];
    if (search.trim()) {
      list.push({ key: "search", label: `"${search.trim()}"`, remove: () => setSearch("") });
    }
    if (selectedSpeciality !== "All") {
      list.push({ key: "speciality", label: selectedSpeciality, remove: () => setSelectedSpeciality("All") });
    }
    if (selectedClassification !== "All" && selectedClassification !== "All Types") {
      list.push({ key: "class", label: selectedClassification, remove: () => setSelectedClassification("All") });
    }
    if (selectedLetter !== "All") {
      list.push({ key: "letter", label: `Letter: ${selectedLetter}`, remove: () => setSelectedLetter("All") });
    }
    if (selectedCity !== "All") {
      list.push({ key: "city", label: selectedCity, remove: () => setSelectedCity("All") });
    }
    return list;
  }, [search, selectedSpeciality, selectedClassification, selectedLetter, selectedCity]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedSpeciality("All");
    setSelectedClassification("All");
    setSelectedLetter("All");
    setSelectedCity("All");
    setSortBy("relevance");
  };

  const handleChipToolbarClick = (tagId: string, label: string) => {
    if (tagId === "all") {
      handleResetFilters();
      return;
    }
    if (tagId === "minimally-invasive") {
      setSelectedClassification("Minimally Invasive");
      return;
    }
    if (tagId === "day-care") {
      setSelectedClassification("Day Care");
      return;
    }
    // Match speciality substring
    const matched = uniqueSpecialities.find((s) => s.toLowerCase().includes(tagId));
    if (matched) {
      setSelectedSpeciality(matched);
    } else {
      setSearch(label);
    }
  };

  return (
    <div className={styles.page} data-nav-theme="light">
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
              <label className={styles.leadingLocation}>
                <MapPin size={16} aria-hidden="true" />
                <span className={styles.srOnly}>Select city location</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Filter procedures by location"
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

          {/* Refinement Chips Row */}
          <div className={styles.refinementBar}>
            {canScrollLeft && (
              <button
                type="button"
                className={`${styles.refinementArrow} ${styles.refinementArrowLeft}`}
                onClick={() => scrollRefinements("left")}
                aria-label="Scroll tags left"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div className={styles.refinementChips} ref={refinementChipsRef}>
              {TOP_REFINEMENT_TAGS.map((tag) => {
                const Icon = tag.icon;
                const isSelected =
                  tag.id === "all"
                    ? appliedChips.length === 0
                    : tag.id === "minimally-invasive"
                    ? selectedClassification === "Minimally Invasive"
                    : tag.id === "day-care"
                    ? selectedClassification === "Day Care"
                    : selectedSpeciality.toLowerCase().includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`${styles.refinementChip} ${isSelected ? styles.refinementChipActive : ""}`}
                    onClick={() => handleChipToolbarClick(tag.id, tag.label)}
                  >
                    {Icon && <Icon size={13} fill={isSelected ? "#034EA2" : "none"} />}
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className={`${styles.refinementArrow} ${styles.refinementArrowRight}`}
                onClick={() => scrollRefinements("right")}
                aria-label="Scroll tags right"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. MAIN TWO-COLUMN LAYOUT ── */}
      <div className={styles.layout}>
        {/* Left Sticky Sidebar Filters */}
        <aside
          className={`${styles.sidebar} ${!navVisible ? styles.navHidden : ""}`}
          aria-label="Procedure filters"
          data-lenis-prevent="true"
        >
          <div className={styles.filterHeading}>
            <h2>
              <Filter size={16} />
              Filters
            </h2>
            {appliedChips.length > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.clearAllBtn}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Group 1: Speciality / Department */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterGroupHeader}
              onClick={() => setOpenSpecialityAccordion(!openSpecialityAccordion)}
            >
              <span>Clinical Speciality</span>
              <ChevronDown
                size={16}
                className={`${styles.filterGroupChevron} ${openSpecialityAccordion ? styles.filterGroupChevronOpen : ""}`}
              />
            </button>
            {openSpecialityAccordion && (
              <div className={styles.filterGroupOptions} data-lenis-prevent="true">
                <div className={styles.filterSearchBox}>
                  <Search size={13} />
                  <input
                    type="text"
                    placeholder="Search specialities..."
                    value={specialitySearch}
                    onChange={(e) => setSpecialitySearch(e.target.value)}
                  />
                  {specialitySearch && (
                    <button
                      type="button"
                      onClick={() => setSpecialitySearch("")}
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className={`${styles.filterOption} ${selectedSpeciality === "All" ? styles.filterOptionActive : ""}`}
                  onClick={() => setSelectedSpeciality("All")}
                >
                  <span>All Specialities</span>
                  <span className={styles.filterOptionCount}>{TREATMENTS_PROCEDURES_DATA.length}</span>
                </button>
                {filteredUniqueSpecialities.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={`${styles.filterOption} ${selectedSpeciality === spec ? styles.filterOptionActive : ""}`}
                    onClick={() => setSelectedSpeciality(spec)}
                  >
                    <span>{spec}</span>
                    <span className={styles.filterOptionCount}>{specialityCounts[spec]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 2: Procedure Classification */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterGroupHeader}
              onClick={() => setOpenClassAccordion(!openClassAccordion)}
            >
              <span>Procedure Type</span>
              <ChevronDown
                size={16}
                className={`${styles.filterGroupChevron} ${openClassAccordion ? styles.filterGroupChevronOpen : ""}`}
              />
            </button>
            {openClassAccordion && (
              <div className={styles.filterGroupOptions} data-lenis-prevent="true">
                {Object.entries(classificationCounts).map(([typeName, count]) => (
                  <button
                    key={typeName}
                    type="button"
                    className={`${styles.filterOption} ${selectedClassification === typeName ? styles.filterOptionActive : ""}`}
                    onClick={() => setSelectedClassification(typeName)}
                  >
                    <span>{typeName}</span>
                    <span className={styles.filterOptionCount}>{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 3: Alphabet Filter */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterGroupHeader}
              onClick={() => setOpenLetterAccordion(!openLetterAccordion)}
            >
              <span>Alphabetical (A - Z)</span>
              <ChevronDown
                size={16}
                className={`${styles.filterGroupChevron} ${openLetterAccordion ? styles.filterGroupChevronOpen : ""}`}
              />
            </button>
            {openLetterAccordion && (
              <div className={styles.lettersGrid}>
                <button
                  type="button"
                  className={`${styles.letterBtn} ${selectedLetter === "All" ? styles.letterBtnActive : ""}`}
                  onClick={() => setSelectedLetter("All")}
                >
                  All
                </button>
                {ALPHABET.map((ltr) => {
                  const hasItems = availableLetters.has(ltr);
                  const isActive = selectedLetter === ltr;
                  return (
                    <button
                      key={ltr}
                      type="button"
                      disabled={!hasItems}
                      className={`${styles.letterBtn} ${isActive ? styles.letterBtnActive : ""} ${!hasItems ? styles.letterBtnDisabled : ""}`}
                      onClick={() => setSelectedLetter(ltr)}
                    >
                      {ltr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 4: Hospital Location */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterGroupHeader}
              onClick={() => setOpenCityAccordion(!openCityAccordion)}
            >
              <span>Hospital Location</span>
              <ChevronDown
                size={16}
                className={`${styles.filterGroupChevron} ${openCityAccordion ? styles.filterGroupChevronOpen : ""}`}
              />
            </button>
            {openCityAccordion && (
              <div className={styles.filterGroupOptions} data-lenis-prevent="true">
                <button
                  type="button"
                  className={`${styles.filterOption} ${selectedCity === "All" ? styles.filterOptionActive : ""}`}
                  onClick={() => setSelectedCity("All")}
                >
                  <span>All Locations</span>
                </button>
                {NH_CITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.filterOption} ${selectedCity === c.value ? styles.filterOptionActive : ""}`}
                    onClick={() => setSelectedCity(c.value)}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Results Area */}
        <section className={styles.resultsArea} aria-label="Procedure results">
          {/* Applied Filter Chips */}
          {appliedChips.length > 0 && (
            <div className={styles.appliedChips}>
              {appliedChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={styles.chipItem}
                  onClick={chip.remove}
                  title={`Remove ${chip.label}`}
                >
                  <span>{chip.label}</span>
                  <X size={14} />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.clearAllBtn}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Header: Count & Sort */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>
              Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "clinical procedure" : "clinical procedures"}
              {selectedCity !== "All" ? ` in ${selectedCity}` : ""}
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
      {mobileFilterOpen && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className={styles.mobileDrawer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <h3>Filters ({filtered.length})</h3>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Speciality */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Speciality</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    type="button"
                    className={`${styles.filterOption} ${selectedSpeciality === "All" ? styles.filterOptionActive : ""}`}
                    onClick={() => setSelectedSpeciality("All")}
                  >
                    All Specialities
                  </button>
                  {uniqueSpecialities.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      className={`${styles.filterOption} ${selectedSpeciality === spec ? styles.filterOptionActive : ""}`}
                      onClick={() => setSelectedSpeciality(spec)}
                    >
                      {spec} ({specialityCounts[spec]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Classification */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Procedure Type</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {Object.entries(classificationCounts).map(([t, count]) => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.filterOption} ${selectedClassification === t ? styles.filterOptionActive : ""}`}
                      onClick={() => setSelectedClassification(t)}
                    >
                      {t} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>City Location</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    type="button"
                    className={`${styles.filterOption} ${selectedCity === "All" ? styles.filterOptionActive : ""}`}
                    onClick={() => setSelectedCity("All")}
                  >
                    All Locations
                  </button>
                  {NH_CITIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.filterOption} ${selectedCity === c.value ? styles.filterOptionActive : ""}`}
                      onClick={() => setSelectedCity(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button
                type="button"
                className={styles.drawerResetBtn}
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.drawerApplyBtn}
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filtered.length} Procedures
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Speciality-Anatomy Procedure Card ──
function SpecialityProcedureCard({ item }: { item: TreatmentProcedureItem }) {
  const [isHovered, setIsHovered] = useState(false);

  // Derive metric value and label
  const statValue = item.successRate || item.duration || "98.5%+";
  const statLabel = item.successRate ? "Clinical Success" : "Procedure Duration";

  return (
    <Link
      id={`procedure-card-${item.slug}`}
      aria-label={item.shortTitle || item.title}
      className={styles.procedureCard}
      href={`/procedures/${item.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
