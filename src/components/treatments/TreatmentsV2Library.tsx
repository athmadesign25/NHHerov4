"use client";

import React, { useState, useMemo, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ArrowUpRight,
  PhoneCall,
  Calendar,
  Clock,
  Activity,
  RotateCcw,
  SlidersHorizontal,
  Layers
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import OrganSystemChipsCarousel, {
  DEFAULT_ORGAN_FILTER_OPTIONS,
} from "@/components/ui/OrganSystemChipsCarousel";
import AlphabeticalFilterRail from "@/components/ui/AlphabeticalFilterRail";
import LibrarySubFilterTabs from "@/components/ui/LibrarySubFilterTabs";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import {
  TREATMENTS_PROCEDURES_DATA,
  TreatmentProcedureItem
} from "@/data/treatmentsProceduresData";
import styles from "@/app/treatments/TreatmentsLibrary.module.css";

// 14 Key Organ & Clinical Filters
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Secondary credentials on right hero column (calm, non-distracting 4 parameters)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
  { staticValue: "1L+", label: "Transplants & Complex Surgeries" },
];

export interface TreatmentsV2Props {
  activeVersion?: 1 | 2;
  onVersionChange?: (v: 1 | 2) => void;
}

export default function TreatmentsV2Library({
  activeVersion = 2,
  onVersionChange,
}: TreatmentsV2Props) {
  const [items, setItems] = useState<TreatmentProcedureItem[]>(TREATMENTS_PROCEDURES_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Stats layout variation: 'c1' (spread across bottom) vs 'c2' (compact left-aligned below search)
  const [statsLayout, setStatsLayout] = useState<"c1" | "c2">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("stats")?.toLowerCase();
      if (val === "c1") return "c1";
      if (val === "c2") return "c2";
    }
    return "c2";
  });

  const handleStatsLayoutChange = useCallback((layout: "c1" | "c2") => {
    setStatsLayout(layout);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("stats", layout);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Keyboard shortcut 'c' or 'C' to quickly toggle between C1 and C2 for review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "c" || e.key === "C") {
        handleStatsLayoutChange(statsLayout === "c1" ? "c2" : "c1");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [statsLayout, handleStatsLayoutChange]);

  // Scroll listener to smoothly reveal sticky directory filter bar when scrolling past hero
  const [isFilterSticky, setIsFilterSticky] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsFilterSticky(scrollPos > 180);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile filter sheet is open
  useEffect(() => {
    if (isFilterSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterSheetOpen]);

  // Initial page entrance animation sequence orchestration (image -> overlay -> title/subtext -> search -> skeleton -> real cards)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  // Read URL search or organ parameter if navigated from Pulse search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get("search") || urlParams.get("q") || urlParams.get("query");
      const initialOrgan = urlParams.get("organ");
      if (initialSearch) {
        setSearchQuery(initialSearch);
      }
      if (initialOrgan) {
        setSelectedOrgan(initialOrgan);
      }
    }
  }, []);

  // Dynamic API fetching whenever selectedOrgan or searchQuery changes
  useEffect(() => {
    const controller = new AbortController();

    // Quick debounce so typing feels natural without overloading network
    const timer = setTimeout(async () => {
      setIsApiLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedOrgan) params.set("organ", selectedOrgan);
        params.set("limit", "48");

        const res = await fetch(`/api/treatments?${params.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("[Treatments API] error:", err);
        }
      } finally {
        setIsApiLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedOrgan, searchQuery]);

  const currentOrganLabel = useMemo(() => {
    if (!selectedOrgan) return null;
    const match = ORGAN_FILTER_OPTIONS.find((s) => s.value === selectedOrgan);
    return match ? match.label : selectedOrgan;
  }, [selectedOrgan]);

  const handleToggleOrgan = (val: string) => {
    // Clicking active organ toggles it off, clicking another selects it
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const isPediatricItem = useCallback((item: TreatmentProcedureItem) => {
    const text = `${item.title} ${item.shortTitle} ${item.summary} ${item.overview} ${item.speciality} ${item.specialitySlug} ${item.slug}`.toLowerCase();
    return (
      text.includes("pediatric") ||
      text.includes("paediatric") ||
      text.includes("child") ||
      text.includes("infant") ||
      text.includes("neonatal") ||
      text.includes("congenital") ||
      item.specialitySlug === "paediatric"
    );
  }, []);

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Audience / Sub-filter (All, Adult, Pediatric)
      if (selectedSubFilter === "pediatric" && !isPediatricItem(item)) {
        return false;
      }
      if (selectedSubFilter === "adult" && isPediatricItem(item)) {
        return false;
      }

      // 2. Alphabetical Letter filter
      if (selectedLetter) {
        const firstChar = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
        if (firstChar !== selectedLetter) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedSubFilter, selectedLetter, isPediatricItem]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (selectedSubFilter === "pediatric" && !isPediatricItem(item)) return;
      if (selectedSubFilter === "adult" && isPediatricItem(item)) return;
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      if (char >= "A" && char <= "Z") {
        set.add(char);
      }
    });
    return set;
  }, [items, selectedSubFilter, isPediatricItem]);

  const subFilterTabs = useMemo(() => {
    const pediatricCount = items.filter(isPediatricItem).length;
    const adultCount = items.length - pediatricCount;
    return [
      { id: "all", label: "All Treatments", count: items.length },
      { id: "adult", label: "Adult Care", count: adultCount },
      { id: "pediatric", label: "Pediatric Care", count: pediatricCount },
    ];
  }, [items, isPediatricItem]);

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
    setSelectedSubFilter("all");
    setSelectedLetter(null);
    setItems(TREATMENTS_PROCEDURES_DATA);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("organ");
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("query");
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* ─── TWO-COLUMN HERO SECTION (FOCUSED ON SEARCH & CLINICAL CONTENT) ── */}
      <section className={styles.hero} data-nav-theme="dark">
        <div className={styles.heroBg}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/doctor_patient.png"
              alt="Doctor examining patient with stethoscope"
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </div>

        <div className={styles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse AI Search */}
          <div className={styles.heroLeftCol}>
            <motion.div
              className={styles.breadcrumbsContainer}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Treatments & Procedures" },
                ]}
                theme="dark"
              />

              <div className={styles.heroControlsRow}>
                {/* Stats layout review pill: C1 Current (Spread) vs C2 New (Compact Left) */}
                <div className={styles.reviewSwitcherGroup}>
                  <span className={styles.reviewSwitcherLabel}>Stats:</span>
                  <div className={styles.reviewPill}>
                    <button
                      type="button"
                      className={`${styles.reviewOptionBtn} ${statsLayout === "c1" ? styles.reviewOptionBtnActive : ""}`}
                      onClick={() => handleStatsLayoutChange("c1")}
                      title="C1 Current: 4 numerical stats spread across bottom"
                    >
                      C1 Spread
                    </button>
                    <button
                      type="button"
                      className={`${styles.reviewOptionBtn} ${statsLayout === "c2" ? styles.reviewOptionBtnActive : ""}`}
                      onClick={() => handleStatsLayoutChange("c2")}
                      title="C2 New: 4 numerical stats compact left-aligned below search bar"
                    >
                      C2 Compact
                    </button>
                  </div>
                </div>

                {onVersionChange && (
                  <div className={styles.versionPillWrap}>
                    <button
                      type="button"
                      onClick={() => onVersionChange(1)}
                      className={activeVersion === 1 ? styles.versionBtnActive : styles.versionBtnInactive}
                    >
                      V1 Speciality
                    </button>
                    <button
                      type="button"
                      onClick={() => onVersionChange(2)}
                      className={activeVersion === 2 ? styles.versionBtnActive : styles.versionBtnInactive}
                    >
                      V2 Library
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSweepEffect
                words={["Treatments & Procedures"]}
                sweepMs={2400}
                delayMs={80}
                finalColor="#FFFFFF"
              />
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Explore comprehensive clinical guides, recovery paths, and transparent pricing for over 400+ advanced surgical procedures and evidence-based treatments across Narayana Health.
            </motion.p>

            {/* Compressed Pill Search with Visible Gradient Outline, Glow Spotlight & Mobile Filter Button */}
            <motion.div
              className={styles.heroSearchContainer}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.heroSearchRow}>
                <div className={styles.searchBoxWrap}>
                  <div className={styles.searchBox}>
                    <Search size={16} strokeWidth={2.0} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search treatments, surgery or condition..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search treatments, surgery or condition"
                    />
                    {searchQuery && (
                      <button
                        className={styles.clearSearchBtn}
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Filter Trigger Button (Beside Search Box on Mobile) */}
                <button
                  type="button"
                  className={`${styles.mobileFilterBtn} ${selectedOrgan ? styles.mobileFilterBtnActive : ""}`}
                  onClick={() => setIsFilterSheetOpen(true)}
                  aria-label="Open organ filters"
                >
                  <SlidersHorizontal size={15} />
                  <span className={styles.mobileFilterBtnText}>
                    {selectedOrgan ? ORGAN_FILTER_OPTIONS.find(o => o.value === selectedOrgan)?.label : "Filters"}
                  </span>
                  {selectedOrgan && <span className={styles.mobileFilterDot} />}
                </button>
              </div>

              {/* Active Filter Pill on Mobile when an organ is chosen */}
              {selectedOrgan && (
                <div className={styles.activeFilterRow}>
                  <span className={styles.activeFilterPill}>
                    <span>Filter: {ORGAN_FILTER_OPTIONS.find(o => o.value === selectedOrgan)?.label}</span>
                    <button
                      type="button"
                      className={styles.removeActiveFilterBtn}
                      onClick={() => handleToggleOrgan(selectedOrgan)}
                      aria-label="Remove filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}

              {/* Dynamic result count displayed immediately below search when typing */}
              {searchQuery.trim().length > 0 && (
                <div className={styles.searchCountFeedback}>
                  <span>
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </motion.div>

            {/* C2: Compact Left-Aligned Metrics Row (Directly below Pulse search) */}
            {statsLayout === "c2" && (
              <motion.div
                key="stats-c2"
                className={styles.compactStatsWrap}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.compactStatsGrid}>
                  {HERO_ANALYTICS_PARAMETERS.map((item, index) => (
                    <div key={index} className={styles.compactStatBlock}>
                      <span className={styles.compactStatNumber}>
                        {item.staticValue ? (
                          item.staticValue
                        ) : (
                          <MetricValueReveal value={item.value!} suffix={item.suffix} />
                        )}
                      </span>
                      <span className={styles.compactStatLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* C1: Full-Width Spread Metrics Row across bottom */}
          {statsLayout === "c1" && (
            <motion.div
              key="stats-c1"
              className={styles.metricsBottomWrap}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.statsGrid}>
                {HERO_ANALYTICS_PARAMETERS.map((item, index) => (
                  <div key={index} className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {item.staticValue ? (
                        item.staticValue
                      ) : (
                        <MetricValueReveal value={item.value!} suffix={item.suffix} />
                      )}
                    </span>
                    <span className={styles.statLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── ORGAN-SYSTEM CHIPS CAROUSEL + "VIEW ALL" (DESKTOP) ─────────── */}
      <OrganSystemChipsCarousel
        options={ORGAN_FILTER_OPTIONS}
        selectedOrgan={selectedOrgan}
        onSelectOrgan={(val) => {
          if (val === null) {
            handleResetFilters();
            const el = document.getElementById("procedures-directory");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          } else {
            handleToggleOrgan(val);
          }
        }}
        eyebrow="Explore Treatments by Organ System & Speciality"
      />

      {/* ─── SCROLL-REVEAL STICKY DIRECTORY CONTROLS (SUB-FILTERS & A–Z INDEX) ─── */}
      <div
        id="procedures-directory"
        className={`${styles.stickyDirectoryBar} ${isFilterSticky ? styles.stickyDirectoryBarVisible : ""}`}
        aria-hidden={!isFilterSticky}
      >
        <div className={styles.stickyDirectoryInner}>
          <div className={styles.directoryTopBar}>
            <LibrarySubFilterTabs
              tabs={subFilterTabs}
              activeTab={selectedSubFilter}
              onTabChange={(tab) => {
                setSelectedSubFilter(tab);
                setSelectedLetter(null);
              }}
              ariaLabel="Filter treatments by patient group"
            />

            <div className={styles.feedbackTextWrapper}>
              <p className={styles.feedbackText}>
                {searchQuery.trim() ? (
                  <>
                    Search: <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash;{" "}
                    <span className={styles.feedbackCount}>
                      {displayedItems.length} {displayedItems.length === 1 ? "procedure" : "procedures"} found
                    </span>
                  </>
                ) : selectedOrgan ? (
                  <>
                    Organ: <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash;{" "}
                    <span className={styles.feedbackCount}>
                      {displayedItems.length} {displayedItems.length === 1 ? "procedure" : "procedures"} found
                    </span>
                  </>
                ) : (
                  <span className={styles.feedbackCount}>
                    Showing {displayedItems.length} {displayedItems.length === 1 ? "procedure" : "procedures"}
                  </span>
                )}
              </p>

              {(selectedOrgan || searchQuery.trim() || selectedSubFilter !== "all" || selectedLetter) && (
                <button
                  type="button"
                  className={styles.clearFilterChip}
                  onClick={handleResetFilters}
                  aria-label="Clear active filters"
                >
                  <RotateCcw size={12} />
                  <span>Reset all</span>
                </button>
              )}
            </div>
          </div>

          {/* Alphabetical A–Z Filter Rail */}
          <AlphabeticalFilterRail
            availableLetters={availableLetters}
            selectedLetter={selectedLetter}
            onSelectLetter={setSelectedLetter}
            resultCount={displayedItems.length}
          />

          {isApiLoading && (
            <div className={styles.apiPulseBar}>
              <div className={styles.apiPulseIndicator} />
            </div>
          )}
        </div>
      </div>

      {/* ─── 3-COLUMN CARDS GRID (ORCHESTRATED WITH ENTRANCE SKELETON) ─────── */}
      <AnimatePresence mode="wait">
        {isPageOpening ? (
          <motion.div
            key="entrance-skeletons"
            className={styles.cardsGrid}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, delay: 0.78 }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImageWrap}>
                  <div className={styles.skeletonShimmer} />
                </div>
                <div className={styles.skeletonContent}>
                  <div>
                    <div className={styles.skeletonEyebrow} />
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonBadges}>
                      <div className={styles.skeletonBadge} />
                      <div className={styles.skeletonBadge} />
                    </div>
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonPrice} />
                    <div className={styles.skeletonCta} />
                  </div>
                </div>
                <div className={styles.skeletonShimmer} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.main
            key="loaded-cards"
            className={styles.cardsGrid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isApiLoading ? 0.78 : 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {displayedItems.length === 0 ? (
              <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.emptyIconWrapper}>
                  <Search size={26} />
                </div>
                <h3 className={styles.emptyTitle}>No matching procedures found</h3>
                <p className={styles.emptyDesc}>
                  We couldn&apos;t find any results matching your search, age group, or active filter. Try clearing your filters or exploring another category.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, idx) => {
                  const detailUrl = `/procedures/${item.slug}`;
                  const doctorsUrl = `/doctors?speciality=${encodeURIComponent(item.specialitySlug)}`;

                  return (
                    <motion.article
                      key={item.id}
                      className={styles.procedureCard}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.24, delay: Math.min(idx * 0.02, 0.15) }}
                    >
                      {/* 3D Organ / Procedure Image */}
                      <div className={styles.cardImageWrap}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 84px, (max-width: 1024px) 50vw, 33vw"
                          className={styles.cardBgImage}
                        />
                        <div className={styles.cardGradient} />
                      </div>

                      {/* Content Block */}
                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.speciality}
                          </div>

                          <Link href={detailUrl} className={styles.cardTitleLink}>
                            <h2 className={styles.cardTitle}>
                              {item.title}
                            </h2>
                          </Link>

                          <p className={styles.cardSub}>
                            {item.summary}
                          </p>
                        </div>

                        {/* Card Bottom Slot: Resting Metadata (Recovery, Stay) vs Decision Action Buttons */}
                        <div className={styles.cardBottomSlot}>
                          {/* Non-hover Resting State: Clinical Procedure Facts (Fades away smoothly on hover on desktop) */}
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <Clock size={13} className={styles.metaIcon} />
                              <span>{item.hospitalStay ? `Stay: ${item.hospitalStay}` : "Minimal Stay"}</span>
                            </span>
                            <span className={styles.metaDivider} aria-hidden="true" />
                            <span className={styles.metaBadge}>
                              <Activity size={13} className={styles.metaIcon} />
                              <span>{item.recoveryTime ? `Recovery: ${item.recoveryTime}` : "Fast Recovery"}</span>
                            </span>
                          </div>

                          {/* Action Buttons: Find doctors & Read more ↗ */}
                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Find doctors
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Read more</span>
                              <ArrowUpRight size={11.5} className={styles.pillBtnArrow} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.main>
        )}
      </AnimatePresence>

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        bg="dark"
        eyebrow="MULTI-DISCIPLINARY SURGICAL BOARD"
        title="Looking for a Surgical Second Opinion or Cost Estimate?"
        subtitle="Our senior surgical boards review complex diagnoses, imaging reports, and recommend minimally invasive surgical alternatives with transparent, all-inclusive pricing."
        primaryBtn={{
          href: "/book-an-appointment",
          text: "Find a Specialist",
        }}
        secondaryBtn={{
          href: "/health-packages",
          text: "Explore Health Packages",
        }}
        phoneText="Surgical Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />
      <ClinicalFloatingSideActions />

      {/* ─── MOBILE FILTER BOTTOM SHEET DRAWER ─── */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            <motion.div
              className={styles.sheetBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
            />

            <motion.div
              className={styles.sheetContainer}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.sheetDragHandle} />

              <div className={styles.sheetHeader}>
                <div className={styles.sheetTitleWrap}>
                  <h3 className={styles.sheetTitle}>Filter by Speciality &amp; Organ</h3>
                  <span className={styles.sheetSubtitle}>Choose an organ to filter procedures</span>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.sheetBody}>
                {/* All Specialities Option */}
                <button
                  type="button"
                  className={`${styles.sheetOrganCard} ${!selectedOrgan ? styles.sheetOrganCardActive : ""}`}
                  onClick={() => {
                    setSelectedOrgan(null);
                    setIsFilterSheetOpen(false);
                  }}
                >
                  <div className={styles.sheetOrganIconWrapAll}>
                    <Layers size={18} />
                  </div>
                  <span className={styles.sheetOrganLabel}>All Specialities</span>
                  <span className={styles.sheetOrganCount}>{TREATMENTS_PROCEDURES_DATA.length}</span>
                </button>

                {/* 10 Organ Options */}
                <div className={styles.sheetOrgansGrid}>
                  {ORGAN_FILTER_OPTIONS.map((opt) => {
                    const isSelected = selectedOrgan === opt.value;
                    const count = TREATMENTS_PROCEDURES_DATA.filter((p) => {
                      const fullContent = `${p.title} ${p.shortTitle} ${p.speciality} ${p.summary} ${p.specialitySlug}`.toLowerCase();
                      return fullContent.includes(opt.value);
                    }).length;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.sheetOrganCard} ${isSelected ? styles.sheetOrganCardActive : ""}`}
                        onClick={() => {
                          handleToggleOrgan(opt.value);
                          setIsFilterSheetOpen(false);
                        }}
                      >
                        <div className={styles.sheetOrganImgWrap}>
                          <Image
                            src={opt.image}
                            alt={opt.label}
                            fill
                            sizes="32px"
                            className={styles.sheetOrganImg}
                          />
                        </div>
                        <span className={styles.sheetOrganLabel}>{opt.label}</span>
                        {count > 0 && <span className={styles.sheetOrganCount}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.sheetFooter}>
                {selectedOrgan ? (
                  <button
                    type="button"
                    className={styles.sheetResetBtn}
                    onClick={() => {
                      setSelectedOrgan(null);
                    }}
                  >
                    Reset
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  className={styles.sheetApplyBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  View {items.length} Procedures
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
