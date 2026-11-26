"use client";

import React, { useState, useMemo, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { specialityBookingEntry } from "@/features/search/specialityBookingEntry";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Search, 
  X, 
  ArrowUpRight, 
  PhoneCall,
  Calendar,
  AlertTriangle,
  Activity,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CardTitleText, buildCardHoverReading } from "@/components/ui/CardTitleText";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import OrganSystemChipsCarousel, {
  DEFAULT_ORGAN_FILTER_OPTIONS,
} from "@/components/ui/OrganSystemChipsCarousel";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { SYMPTOMS_DATA, SymptomItem } from "@/data/symptomsData";
import styles from "./SymptomsLibrary.module.css";

// 14 Key Organ & Clinical Filters
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Secondary credentials on right hero column
const HERO_ANALYTICS_PARAMETERS = [
  { value: 200, suffix: "+", label: "Documented Symptoms" },
  { value: 30, suffix: "+", label: "Clinical Specialities" },
  { staticValue: "24×7", label: "Emergency Triage" },
  { staticValue: "100%", label: "Doctor Reviewed" },
];

export default function SymptomsLibraryPage() {
  const [items, setItems] = useState<SymptomItem[]>(SYMPTOMS_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get("search") || urlParams.get("q") || urlParams.get("query");
      const initialOrgan = urlParams.get("organ");
      if (initialSearch) setSearchQuery(initialSearch);
      if (initialOrgan) setSelectedOrgan(initialOrgan);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsApiLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedOrgan) params.set("organ", selectedOrgan);
        params.set("limit", "48");

        const res = await fetch(`/api/symptoms?${params.toString()}`, {
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
          console.error("[Symptoms API] error:", err);
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
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("organ");
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("query");
      window.history.replaceState(null, "", url.toString());
    }
  };

  // 1. Unified Dark -> White -> Dark V2 dynamism across the entire page
  const topProgress = useMotionValue(0);
  const unifiedWhiteProgress = useMotionValue(0);
  const ctaSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY || 0;
      const topWhite = Math.max(0, Math.min(1, (sy - 36) / (360 - 36)));
      topProgress.set(topWhite);

      let bottomDark = 0;
      const el = ctaSentinelRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const startY = vh * 0.72;
        const endY = vh * 0.28;
        const raw = (startY - rect.top) / (startY - endY);
        bottomDark = Math.max(0, Math.min(1, raw));
      }

      unifiedWhiteProgress.set(Math.max(0, Math.min(topWhite, 1 - bottomDark)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [topProgress, unifiedWhiteProgress]);

  // V2 dynamism palette: Dark Navy -> Deep Black -> Alabaster -> Pure White
  const pageBgColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );

  const heroCanvasOpacity = useTransform(
    topProgress,
    [0, 0.38, 0.68],
    [1, 0.75, 0]
  );

  // Dynamic text, chip, filter & rail color inversions matching Procedure Detail V2
  const dynHeading = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynSubtitle = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.84)", "#475569", "#64748b"]);
  const dynMuted = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.60)", "rgba(255, 255, 255, 0.66)", "#64748b", "#64748b"]);
  const dynEyebrow = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.56)", "rgba(255, 255, 255, 0.64)", "#64748b", "#64748b"]);
  const dynBubbleLabel = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.74)", "rgba(255, 255, 255, 0.82)", "#334155", "#334155"]);
  const dynBubbleHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBubbleActive = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#034EA2", "#034EA2"]);
  const dynBubbleBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.22)", "rgba(255, 255, 255, 0.26)", "rgba(15, 23, 42, 0.14)", "rgba(15, 23, 42, 0.12)"]);
  const dynBubbleBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.08)", "rgba(15, 23, 42, 0.04)", "rgba(15, 23, 42, 0.04)"]);
  const dynArrow = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.72)", "rgba(255, 255, 255, 0.80)", "#475569", "#475569"]);
  const dynArrowHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynFilterBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.14)", "rgba(15, 23, 42, 0.12)"]);
  const dynFilterBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.08)", "rgba(15, 23, 42, 0.04)", "rgba(15, 23, 42, 0.04)"]);
  const dynFilterText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.74)", "rgba(255, 255, 255, 0.82)", "#334155", "#334155"]);
  const dynFilterBgHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.14)", "rgba(15, 23, 42, 0.08)", "rgba(15, 23, 42, 0.08)"]);
  const dynFilterTextHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynRailAll = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.58)", "rgba(255, 255, 255, 0.68)", "#475569", "#475569"]);
  const dynRailLetter = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.48)", "rgba(255, 255, 255, 0.58)", "#64748b", "#64748b"]);
  const dynRailHoverBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.12)", "rgba(15, 23, 42, 0.06)", "rgba(15, 23, 42, 0.06)"]);
  const dynRailHoverText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.16)", "rgba(15, 23, 42, 0.08)", "rgba(15, 23, 42, 0.08)"]);
  const dynSearchBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.07)", "rgba(255, 255, 255, 0.09)", "rgba(15, 23, 42, 0.04)", "rgba(15, 23, 42, 0.04)"]);
  const dynSearchBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.22)", "rgba(255, 255, 255, 0.26)", "rgba(15, 23, 42, 0.16)", "rgba(15, 23, 42, 0.14)"]);
  const dynSearchText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynSearchPlaceholder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.72)", "rgba(255, 255, 255, 0.78)", "#64748b", "#64748b"]);
  const dynRedSelBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(237, 28, 36, 0.15)", "rgba(237, 28, 36, 0.18)", "rgba(237, 28, 36, 0.06)", "rgba(237, 28, 36, 0.06)"]);
  const dynRedSelBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(248, 113, 113, 0.75)", "rgba(248, 113, 113, 0.80)", "rgba(220, 38, 38, 0.65)", "rgba(220, 38, 38, 0.65)"]);
  const dynRedSelText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ff7b82", "#ff7b82", "#cf171f", "#cf171f"]);
  const heroStatNumColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]);
  const heroStatLabelColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.50)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]);
  const heroStatDividerColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]);

  return (
    <motion.div
      className={styles.pageContainer}
      style={{
        backgroundColor: pageBgColor,
        ["--dyn-heading" as string]: dynHeading,
        ["--dyn-subtitle" as string]: dynSubtitle,
        ["--dyn-muted" as string]: dynMuted,
        ["--dyn-eyebrow" as string]: dynEyebrow,
        ["--dyn-bubble-label" as string]: dynBubbleLabel,
        ["--dyn-bubble-hover" as string]: dynBubbleHover,
        ["--dyn-bubble-active" as string]: dynBubbleActive,
        ["--dyn-bubble-border" as string]: dynBubbleBorder,
        ["--dyn-bubble-bg" as string]: dynBubbleBg,
        ["--dyn-arrow" as string]: dynArrow,
        ["--dyn-arrow-hover" as string]: dynArrowHover,
        ["--dyn-filter-border" as string]: dynFilterBorder,
        ["--dyn-filter-bg" as string]: dynFilterBg,
        ["--dyn-filter-text" as string]: dynFilterText,
        ["--dyn-filter-bg-hover" as string]: dynFilterBgHover,
        ["--dyn-filter-text-hover" as string]: dynFilterTextHover,
        ["--dyn-rail-all" as string]: dynRailAll,
        ["--dyn-rail-letter" as string]: dynRailLetter,
        ["--dyn-rail-hover-bg" as string]: dynRailHoverBg,
        ["--dyn-rail-hover-text" as string]: dynRailHoverText,
        ["--dyn-border" as string]: dynBorder,
        ["--dyn-search-bg" as string]: dynSearchBg,
        ["--dyn-search-border" as string]: dynSearchBorder,
        ["--dyn-search-text" as string]: dynSearchText,
        ["--dyn-search-placeholder" as string]: dynSearchPlaceholder,
        ["--dyn-red-sel-bg" as string]: dynRedSelBg,
        ["--dyn-red-sel-border" as string]: dynRedSelBorder,
        ["--dyn-red-sel-text" as string]: dynRedSelText,
        ["--stat-num-color" as string]: heroStatNumColor,
        ["--stat-label-color" as string]: heroStatLabelColor,
        ["--stat-divider-color" as string]: heroStatDividerColor,
      }}
    >
      {/* ─── TWO-COLUMN HERO SECTION ───────────────────────────────────────── */}
      <section className={styles.hero} data-nav-theme="dark">
        <motion.div className={styles.heroBg} style={{ opacity: heroCanvasOpacity }}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/images/heroes/symptoms_hero_v3.jpg"
              alt="Doctor assessing patient symptoms"
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </motion.div>

        <div className={styles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse Search */}
          <div className={styles.heroLeftCol}>
            <motion.div
              className={styles.breadcrumbsContainer}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Symptoms Guide" },
                ]}
                theme="dark"
              />
            </motion.div>

            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSweepEffect 
                words={["Symptoms & Clinical Triage"]} 
                sweepMs={2400} 
                delayMs={80} 
                finalColor="var(--dyn-heading, #FFFFFF)" 
              />
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Identify warning signs, understand potential medical causes, and find the right specialist for early diagnosis and treatment across 24×7 Narayana Health care networks.
            </motion.p>

            {/* Pill Search */}
            <motion.div
              className={styles.heroSearchContainer}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.heroSearchRow}>
                <div className={styles.searchBoxWrap}>
                  <div className={styles.animatedBorderOutline} aria-hidden="true" />
                  <div className={styles.searchBox}>
                    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
                      <defs>
                        <linearGradient id="nhSearchPillGradSymptoms" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00C4FF" />
                          <stop offset="35%" stopColor="#8B5CF6" />
                          <stop offset="70%" stopColor="#FF2E93" />
                          <stop offset="100%" stopColor="#ED1C24" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <Search size={18} strokeWidth={2.0} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search symptom, sensation or warning sign..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search symptom or warning sign"
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

              {searchQuery.trim().length > 0 && (
                <div className={styles.searchCountFeedback}>
                  <span>
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "symptom" : "symptoms"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom Column: Horizontal Metrics Row (Matching CSR Hero) */}
          <motion.div
            className={styles.metricsBottomWrap}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
        </div>
      </section>

      {/* ─── ORGAN-SYSTEM CHIPS CAROUSEL + "VIEW ALL" (DESKTOP) ─────────── */}
      <OrganSystemChipsCarousel
        options={ORGAN_FILTER_OPTIONS}
        selectedOrgan={selectedOrgan}
        onSelectOrgan={(val) => {
          if (val === null) {
            setSelectedOrgan(null);
            setSearchQuery("");
          } else {
            handleToggleOrgan(val);
          }
        }}
        eyebrow="Explore Symptoms by Organ System & Speciality"
      />

      {/* ─── DYNAMIC FEEDBACK TEXT ROW ─────────────────────────────────────── */}
      <motion.div
        className={styles.feedbackTextRow}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.55 }}
      >
        <div className={styles.feedbackTextWrapper}>
          <p className={styles.feedbackText}>
            {searchQuery.trim() ? (
              <>
                Here based on your search for <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} found</span>
              </>
            ) : selectedOrgan ? (
              <>
                Here based on your selection for symptoms under <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} found</span>
              </>
            ) : (
              <>
                Here based on our clinical symptoms directory &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} available</span>
              </>
            )}
          </p>

          {(selectedOrgan || searchQuery.trim()) && (
            <button 
              type="button" 
              className={styles.clearFilterChip} 
              onClick={handleResetFilters}
              aria-label="Clear active filter"
            >
              <RotateCcw size={12} />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {isApiLoading && (
          <div className={styles.apiPulseBar}>
            <div className={styles.apiPulseIndicator} />
          </div>
        )}
      </motion.div>

      {/* ─── 3-COLUMN CARDS GRID ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isPageOpening ? (
          <motion.div
            key="entrance-skeletons"
            className={styles.cardsGrid}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, delay: 0.6 }}
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
            {items.length === 0 ? (
              <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.emptyIconWrapper}>
                  <Search size={26} />
                </div>
                <h3 className={styles.emptyTitle}>No matching symptoms found</h3>
                <p className={styles.emptyDesc}>
                  We couldn't find any symptoms matching your query or organ filter. Try searching for broader terms like &ldquo;pain&rdquo;, &ldquo;fever&rdquo;, or &ldquo;breath&rdquo;.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const detailUrl = `/symptoms/${item.slug}`;
                  const doctorsUrl = specialityBookingEntry(item.specialitySlug);

                  return (
                    <motion.article
                      key={item.id}
                      className={styles.procedureCard}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.24, delay: Math.min(idx * 0.02, 0.15) }}
                    >
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

                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.speciality}
                          </div>

                          <Link href={detailUrl} className={styles.cardTitleLink}>
                            <h2 className={styles.cardTitle}>
                              <CardTitleText title={item.title} />
                            </h2>
                          </Link>

                          <div className={styles.cardSubReveal}>
                            <div className={styles.cardSubInner}>
                              <p className={styles.cardSub}>
                                {buildCardHoverReading([
                                  item.overview,
                                  item.summary,
                                  item.commonCauses?.length ? `Common causes: ${item.commonCauses.slice(0, 3).join(", ")}` : null,
                                  item.diagnosticTests?.length ? `Diagnostic evaluation: ${item.diagnosticTests.slice(0, 3).join(", ")}` : null,
                                ])}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardBottomSlot}>
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <AlertTriangle size={13} className={styles.metaIcon} />
                              <span>{item.severity}</span>
                            </span>
                            <span className={styles.metaDivider} aria-hidden="true" />
                            <span className={styles.metaBadge}>
                              <Activity size={13} className={styles.metaIcon} />
                              <span>{item.urgencyLevel}</span>
                            </span>
                          </div>

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

      {/* Sentinel for smooth pre-footer CTA background return to dark */}
      <div
        ref={ctaSentinelRef}
        style={{ height: "1px", width: "100%", pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        bg="transparent"
        eyebrow="24×7 EMERGENCY & TRIAGE NETWORK"
        title="Experiencing Severe or Sudden Symptoms?"
        subtitle="Don't ignore critical warning signs. Our emergency care units and rapid triage helpline are available 24×7 with state-of-the-art ambulances, cath labs, and trauma specialists."
        primaryBtn={{
          href: "/book-an-appointment",
          text: "Find a Specialist",
        }}
        secondaryBtn={{
          href: "/treatments",
          text: "Explore Treatments",
        }}
        phoneText="Emergency Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />
      <ClinicalFloatingSideActions />

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className={styles.filterSheetOverlay} onClick={() => setIsFilterSheetOpen(false)}>
            <motion.div
              className={styles.filterSheetContent}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.filterSheetHeader}>
                <div className={styles.filterSheetHandle} />
                <div className={styles.filterSheetTitleRow}>
                  <h3 className={styles.filterSheetTitle}>Filter by Organ System</h3>
                  <button
                    className={styles.filterSheetCloseBtn}
                    onClick={() => setIsFilterSheetOpen(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.filterSheetBody}>
                <div className={styles.filterSheetGrid}>
                  {ORGAN_FILTER_OPTIONS.map((opt) => {
                    const isActive = selectedOrgan === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.filterSheetItem} ${isActive ? styles.filterSheetItemActive : ""}`}
                        onClick={() => {
                          handleToggleOrgan(opt.value);
                          setIsFilterSheetOpen(false);
                        }}
                      >
                        <div className={styles.filterSheetImgWrap}>
                          <Image
                            src={opt.image}
                            alt={opt.label}
                            fill
                            sizes="40px"
                            className={styles.filterSheetImg}
                          />
                        </div>
                        <span className={styles.filterSheetLabel}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.filterSheetFooter}>
                <button
                  type="button"
                  className={styles.filterSheetResetBtn}
                  onClick={() => {
                    setSelectedOrgan(null);
                    setIsFilterSheetOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className={styles.filterSheetApplyBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
