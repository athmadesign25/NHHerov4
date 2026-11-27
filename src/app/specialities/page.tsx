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
  Check,
} from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ListingHeroSection from "@/components/ui/ListingHeroSection";
import { ALL_SPECIALITIES, SPECIALITY_CATEGORIES, type SpecialityMeta } from "@/data/specialities";
import { NH_CITIES } from "@/lib/searchService";
import { SpecialityFilterDialog } from "./filters";
import themeStyles from "./toolbar/DoctorSearchTheme.module.css";
import styles from "./page.module.css";
import heroStyles from "../centre-of-excellence/CentreOfExcellenceHero.module.css";



const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to determine destination URL (Cancer Care -> ?design=2)
function getSpecialityHref(slug: string, city: string): string {
  const params = new URLSearchParams();
  if (slug === "oncology") params.set("design", "2");
  if (city !== "All") params.set("location", city);
  return `/specialities/${encodeURIComponent(slug)}${params.size ? `?${params}` : ""}`;
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

  const pageRef = useRef<HTMLDivElement>(null);

  // Follow our existing navbar's rendered edge without changing its component.
  useEffect(() => {
    const page = pageRef.current;
    const nav = document.querySelector("nav");
    if (!page || !nav) return;
    let frame = 0;
    let until = 0;
    const follow = () => {
      page.style.setProperty("--directory-nav-offset", `${Math.max(0, nav.getBoundingClientRect().bottom)}px`);
      page.style.setProperty("--page-nav-height", `${nav.getBoundingClientRect().height}px`);
      frame = performance.now() < until ? requestAnimationFrame(follow) : 0;
    };
    const schedule = () => {
      const seconds = Math.max(...getComputedStyle(nav).transitionDuration.split(",").map(value => parseFloat(value)));
      until = performance.now() + seconds * 1000;
      if (!frame) frame = requestAnimationFrame(follow);
    };
    follow();
    const observer = new MutationObserver(schedule);
    observer.observe(nav, { attributes: true, attributeFilter: ["style", "class"] });
    const resize = new ResizeObserver(schedule);
    resize.observe(nav);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect(); resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
    <div
      ref={pageRef}
      className={`${styles.page} ${styles.doctorPage} ${themeStyles.theme}`}
      data-design="d20"
      data-nav-theme="light"
    >
      {/* ── 1. CONFIGURABLE LISTING HERO SECTION ── */}
      <ListingHeroSection
        id="specialities"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Medical Specialities" },
        ]}
        title="Our Medical Specialities"
        subtext="From complex cardiac surgeries to advanced oncology and robotic orthopaedics — Narayana Health covers every dimension of your health across 25+ hospitals and specialized clinics nationwide."
        stats={[
          {
            value: "50+",
            label: "Medical specialities,\ndelivered with specialized care.",
          },
          {
            value: "25+",
            label: "Hospitals nationwide,\nwith advanced tertiary infrastructure.",
          },
          {
            value: "4,000+",
            label: "Expert clinicians,\nwith specialized fellowship training.",
          },
          {
            value: "10M+",
            label: "Patients healed,\nwith compassionate, evidence-based care.",
          },
        ]}
        backgroundImage="/doctor_patient.png"
        imageAlt="Doctor examining patient with stethoscope"
      />

      {/* ── 2. SPECIALITIES DIRECTORY GRID (Matching COE left/right margins & card sizing) ── */}
      <section className={heroStyles.coeContainer} aria-label="Medical specialities results">
        {/* Pulse Search Input */}
        <motion.div
          className={heroStyles.heroSearchContainer}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={heroStyles.heroSearchRow}>
            <div className={heroStyles.searchBoxWrap}>
              <div className={heroStyles.searchBox}>
                <Search size={16} strokeWidth={2.0} className={heroStyles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search medical specialities, treatments, or conditions..."
                  className={heroStyles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search medical specialities"
                />
                {search && (
                  <button
                    className={heroStyles.clearSearchBtn}
                    onClick={() => setSearch("")}
                    aria-label="Clear search input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* A to Z Alphabet Filter Row (Only in Specialities) - Full Width across left & right margins */}
        <motion.div
          className={styles.heroAlphabetWrap}
          role="group"
          aria-label="Filter specialities by alphabetical letter"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            className={`${styles.heroAlphabetBtn} ${styles.heroAlphabetBtnAll} ${
              selectedLetter === "All" ? styles.heroAlphabetBtnActive : ""
            }`}
            onClick={() => setSelectedLetter("All")}
            aria-pressed={selectedLetter === "All"}
            aria-label="Show all specialities"
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const isAvailable = availableLetters.has(letter);
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                disabled={!isAvailable}
                className={`${styles.heroAlphabetBtn} ${
                  isSelected ? styles.heroAlphabetBtnActive : ""
                } ${!isAvailable ? styles.heroAlphabetBtnDisabled : ""}`}
                onClick={() => setSelectedLetter(isSelected ? "All" : letter)}
                aria-pressed={isSelected}
                aria-label={`Filter specialities starting with ${letter}`}
                title={
                  isAvailable
                    ? `Filter specialities starting with ${letter}`
                    : `No specialities starting with ${letter}`
                }
              >
                {letter}
              </button>
            );
          })}
        </motion.div>

        {/* Speciality Cards Grid (Exact match to Landing Page Specialty Card & COE card sizes) */}
        <AnimatePresence mode="popLayout">
          <motion.div className={heroStyles.coeGrid} layout>
            {filtered.map((spec, i) => (
              <motion.div
                key={spec.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35 }}
              >
                <SpecialityCardItem spec={spec} city={selectedCity} />
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

function SpecialityCardItem({ spec, city }: { spec: SpecialityMeta; city: string }) {
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
      href={getSpecialityHref(spec.slug, city)}
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
