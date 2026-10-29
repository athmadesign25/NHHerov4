"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Award,
} from "lucide-react";
import { ALL_SPECIALITIES, SPECIALITY_CATEGORIES, type SpecialityMeta } from "@/data/specialities";
import styles from "./page.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to determine destination URL (Cancer Care -> ?design=2)
function getSpecialityHref(slug: string): string {
  if (slug === "oncology") {
    return "/specialities/oncology?design=2";
  }
  return `/specialities/${slug}`;
}

export default function SpecialitiesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedClassification, setSelectedClassification] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search") || params.get("q") || "";
      const cat = params.get("category") || "";
      if (query) setSearch(query);
      if (cat) setSelectedCategory(cat);
    }
  }, []);

  // Categories list with Centres of Excellence
  const categories = useMemo(() => {
    return ["All", "Centres of Excellence", ...SPECIALITY_CATEGORIES.filter((c) => c !== "All")];
  }, []);

  // Active letters that have matching specialities
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
        if (!s.tagline.toLowerCase().includes("emergency") && s.slug !== "critical-care" && s.slug !== "cardiology" && s.slug !== "neurology") {
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

  const hasActiveFilters = search.trim() !== "" || selectedCategory !== "All" || selectedClassification !== "All" || selectedLetter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedClassification("All");
    setSelectedLetter("All");
    setSortBy("relevance");
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── Page Header (Hero matching doctors page) ── */}
      <div className={styles.hero}>
        <div className={styles.heroDotGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={styles.heroEyebrow}>Find Your Speciality</div>
            <h1 className={styles.heroTitle}>Our Medical Specialities</h1>
            <p className={styles.heroSubtitle}>
              Browse 40+ medical disciplines &amp; Centres of Excellence across 25+ hospitals.
            </p>

            {/* Integrated Search Bar inside Hero */}
            <div className={styles.heroSearchContainer}>
              <div className={styles.heroSearchInputWrap}>
                <Search size={18} className={styles.heroSearchIcon} />
                <input
                  id="speciality-search-input"
                  type="text"
                  placeholder="Search speciality or condition (e.g. Heart, Knee, Cancer)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.heroSearchInput}
                  aria-label="Search medical specialities"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className={styles.heroClearBtn}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Select Dropdown */}
              <select
                id="speciality-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.heroCategorySelect}
                aria-label="Filter by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar Filters + Speciality Cards Grid ── */}
      <div className={styles.layoutContainer}>
        {/* Sidebar Filters matching doctors page */}
        <aside className={`${styles.sidebar} ${mobileFilterOpen ? styles.sidebarMobileOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <SlidersHorizontal size={16} style={{ color: "var(--color-primary)" }} />
              Filters
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.sidebarResetBtn}
                title="Reset all filters"
                id="sidebar-reset-filters-btn"
              >
                <RotateCcw size={12} style={{ display: "inline", marginRight: 3 }} /> Reset
              </button>
            )}
            {mobileFilterOpen && (
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className={styles.heroClearBtn}
                style={{ marginLeft: "auto" }}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Group 1: Category */}
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarGroupTitle}>
              <span>Speciality Category</span>
            </div>
            <div className={styles.sidebarBtnList}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (mobileFilterOpen) setMobileFilterOpen(false);
                    }}
                    className={`${styles.sidebarFilterBtn} ${
                      isActive ? styles.sidebarFilterBtnActive : styles.sidebarFilterBtnInactive
                    }`}
                  >
                    <span>{cat}</span>
                    {cat === "Centres of Excellence" && <Star size={12} fill={isActive ? "#034EA2" : "#f59e0b"} stroke="none" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Classification Radios */}
          <div className={styles.sidebarGroupBordered}>
            <div className={styles.sidebarGroupTitle}>Classification</div>
            {["All", "Centres of Excellence Only", "24/7 Emergency Support"].map((cls) => (
              <label key={cls} className={styles.radioOption}>
                <input
                  type="radio"
                  name="classification"
                  className={styles.radioInput}
                  checked={selectedClassification === cls}
                  onChange={() => setSelectedClassification(cls)}
                />
                {cls}
              </label>
            ))}
          </div>

          {/* Group 3: A–Z Alphabet Jump */}
          <div className={styles.sidebarGroupBordered}>
            <div className={styles.sidebarGroupTitle}>A–Z Directory</div>
            <div className={styles.alphabetGrid}>
              <button
                type="button"
                onClick={() => setSelectedLetter("All")}
                className={`${styles.alphabetBtn} ${styles.alphabetBtnAll} ${
                  selectedLetter === "All" ? styles.alphabetBtnActive : ""
                }`}
                id="filter-letter-all"
              >
                All
              </button>
              {ALPHABET.map((letter) => {
                const hasMatches = availableLetters.has(letter);
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!hasMatches}
                    onClick={() => {
                      setSelectedLetter(letter);
                      if (mobileFilterOpen) setMobileFilterOpen(false);
                    }}
                    className={`${styles.alphabetBtn} ${isActive ? styles.alphabetBtnActive : ""}`}
                    id={`filter-letter-${letter}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <div className={styles.mainContent}>
          {/* Spotlight Highlight for Cancer Care */}
          <Link
            href="/specialities/oncology?design=2"
            className={styles.spotlightBanner}
            id="spotlight-cancer-care-link"
          >
            <div className={styles.spotlightLeft}>
              <div className={styles.spotlightIconWrap}>
                <Sparkles size={22} color="#fbbf24" />
              </div>
              <div>
                <div className={styles.spotlightTitle}>Spotlight: Comprehensive Cancer Care Experience</div>
                <div className={styles.spotlightDesc}>
                  Multidisciplinary tumour boards, precision genomics, immunotherapy, and bone marrow transplants.
                </div>
              </div>
            </div>
            <div className={styles.spotlightBtn}>
              Explore Cancer Care <ArrowRight size={14} />
            </div>
          </Link>

          {/* Results Top Header */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount} id="specialities-results-count">
              Showing <strong>{filtered.length}</strong> specialities
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className={styles.mobileFilterToggle}
                aria-label="Open filter sidebar"
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && "•"}
              </button>

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
            </div>
          </div>

          {/* Cards Grid matching Doctors Card Structure */}
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
                  <Link
                    href={getSpecialityHref(spec.slug)}
                    id={`speciality-card-${spec.slug}`}
                    className={styles.specialityCard}
                    aria-label={`${spec.name} — ${spec.tagline}`}
                  >
                    {/* Top Row: Thumbnail + Title & Category */}
                    <div className={styles.cardTopRow}>
                      <div className={styles.cardThumbWrap}>
                        <Image
                          src={spec.image}
                          alt={spec.name}
                          fill
                          className={styles.cardThumbImage}
                          sizes="72px"
                          loading={i < 4 ? "eager" : "lazy"}
                        />
                        <div className={styles.cardThumbBadge} aria-hidden="true">
                          <img src={spec.icon} alt="" width={14} height={14} />
                        </div>
                      </div>

                      <div className={styles.cardTopInfo}>
                        <div className={styles.cardTitle}>{spec.name}</div>
                        <div className={styles.cardCategoryRow}>
                          <span className={styles.cardCategory}>{spec.category}</span>
                          {spec.isCoE && (
                            <span className={styles.cardCoEStar}>
                              <Star size={10} fill="#b45309" stroke="none" /> CoE
                            </span>
                          )}
                        </div>
                        <div className={styles.cardTagline}>{spec.tagline}</div>
                      </div>
                    </div>

                    {/* Middle Row: Stats & Specialists */}
                    <div className={styles.cardMiddleRow}>
                      <div className={styles.cardStatItem}>
                        <Award size={13} fill="currentColor" stroke="none" />
                        <span>
                          {spec.stat.value} {spec.stat.label}
                        </span>
                      </div>
                      {spec.doctorCount && (
                        <div className={styles.cardDoctorCountItem}>
                          <Stethoscope size={12} color="var(--color-primary)" />
                          <span>{spec.doctorCount}+ Specialists</span>
                        </div>
                      )}
                    </div>

                    {/* Conditions Treated Chips */}
                    {spec.keyConditions && spec.keyConditions.length > 0 && (
                      <div className={styles.cardConditionsList}>
                        {spec.keyConditions.slice(0, 3).map((cond) => (
                          <span key={cond} className={styles.cardConditionTag}>
                            {cond}
                          </span>
                        ))}
                        {spec.keyConditions.length > 3 && (
                          <span className={styles.cardConditionTag} style={{ fontWeight: 600 }}>
                            +{spec.keyConditions.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className={styles.cardBottomRow}>
                      <div className={styles.cardAvailability}>
                        <Clock size={12} />
                        <span>{spec.isCoE ? "Tertiary & Quaternary Care" : "Available Across Centres"}</span>
                      </div>
                      <div className={styles.cardBookBtn}>
                        Explore <ChevronRight size={13} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <div className={styles.emptyTitle}>No specialities found</div>
              <div className={styles.emptyDesc}>Try adjusting your search query or reset your filters</div>
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
        </div>
      </div>
    </div>
  );
}
