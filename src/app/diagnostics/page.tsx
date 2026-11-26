"use client";

import React, { useState, useMemo, useEffect, useTransition, useCallback, useRef } from "react";
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
  Clock,
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
import AlphabeticalFilterRail from "@/components/ui/AlphabeticalFilterRail";
import LibrarySubFilterTabs from "@/components/ui/LibrarySubFilterTabs";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { DIAGNOSTICS_DATA, DiagnosticItem } from "@/data/diagnosticsData";
import styles from "./DiagnosticsLibrary.module.css";

// 14 Key Organ & Clinical Filters
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Secondary credentials on right hero column
const HERO_ANALYTICS_PARAMETERS = [
  { value: 1500, suffix: "+", label: "Diagnostic Tests" },
  { staticValue: "NABL", label: "Accredited Labs" },
  { staticValue: "Same Day", label: "Digital Reports" },
  { staticValue: "AI-Ready", label: "Imaging Precision" },
];

export default function DiagnosticsLibraryPage() {
  const [items, setItems] = useState<DiagnosticItem[]>(DIAGNOSTICS_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Screen width detection for automatic mweb switching
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Progressive scroll reveal for directory sub-filters & A–Z rail (desktop only, always visible on mobile)
  const [isFilterRevealed, setIsFilterRevealed] = useState<boolean>(false);

  useEffect(() => {
    if (window.scrollY > 30) {
      setIsFilterRevealed(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("search") ||
      params.get("q") ||
      params.get("organ") ||
      params.get("letter") ||
      params.get("filter")
    ) {
      setIsFilterRevealed(true);
    }
  }, []);

  // Reveal on scroll (one-way latch: once revealed, stays in position until page refresh)
  useEffect(() => {
    if (isFilterRevealed) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsFilterRevealed(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFilterRevealed]);

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

        const res = await fetch(`/api/diagnostics?${params.toString()}`, {
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
          console.error("[Diagnostics API] error:", err);
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
    setIsFilterRevealed(true);
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const isLabItem = useCallback((item: DiagnosticItem) => {
    const mod = item.modality.toLowerCase();
    return mod.includes("laboratory") || mod.includes("pathology") || mod.includes("genomics") || mod.includes("molecular");
  }, []);

  const isImagingItem = useCallback((item: DiagnosticItem) => {
    const mod = item.modality.toLowerCase();
    return mod.includes("radiology") || mod.includes("imaging") || mod.includes("cardio") || mod.includes("endoscopy");
  }, []);

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Modality / Sub-filter
      if (selectedSubFilter === "lab" && !isLabItem(item)) return false;
      if (selectedSubFilter === "imaging" && !isImagingItem(item)) return false;

      // 2. Alphabetical Letter filter
      if (selectedLetter) {
        const firstChar = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
        if (firstChar !== selectedLetter) return false;
      }

      return true;
    });
  }, [items, selectedSubFilter, selectedLetter, isLabItem, isImagingItem]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (selectedSubFilter === "lab" && !isLabItem(item)) return;
      if (selectedSubFilter === "imaging" && !isImagingItem(item)) return;
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      if (char >= "A" && char <= "Z") {
        set.add(char);
      }
    });
    return set;
  }, [items, selectedSubFilter, isLabItem, isImagingItem]);

  const subFilterTabs = useMemo(() => {
    const labCount = items.filter(isLabItem).length;
    const imagingCount = items.filter(isImagingItem).length;
    return [
      { id: "all", label: "All Investigations", shortLabel: "All", count: items.length },
      { id: "lab", label: "Laboratory & Pathology", shortLabel: "Lab", count: labCount },
      { id: "imaging", label: "Imaging & Radiology", shortLabel: "Imaging", count: imagingCount },
    ];
  }, [items, isLabItem, isImagingItem]);

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
    setSelectedSubFilter("all");
    setSelectedLetter(null);
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
      {/* ─── TWO-COLUMN HERO SECTION (SIGNATURE DARK MODE) ───────────────── */}
      <section className={styles.hero} data-nav-theme="dark">
        <motion.div className={styles.heroBg} style={{ opacity: heroCanvasOpacity }}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/images/heroes/diagnostics_hero_v3.jpg"
              alt="Medical laboratory scientist analyzing test specimen"
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </motion.div>

        <div className={styles.heroInner}>
          {/* Left Column */}
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
                  { label: "Diagnostics & Lab Tests" },
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
              <span className={styles.desktopTitleText}>
                <TextSweepEffect
                  words={["Diagnostics & Lab Tests"]}
                  sweepMs={2400}
                  delayMs={80}
                  finalColor="var(--dyn-heading, #FFFFFF)"
                />
              </span>
              <span className={styles.mobileTitleText}>
                <TextSweepEffect
                  words={["Diagnostics & Lab Tests"]}
                  sweepMs={2400}
                  delayMs={80}
                  finalColor="var(--dyn-heading, #FFFFFF)"
                />
              </span>
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Access over 1,500+ NABL &amp; NABH accredited laboratory investigations, advanced MRI, CT scans, digital PET-CT, and endoscopy with rapid turnaround times and verified digital reports.
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
                        <linearGradient id="nhSearchPillGradDiagnostics" x1="0%" y1="0%" x2="100%" y2="100%">
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
                      placeholder="Search test, scan, X-ray, MRI or blood panel..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIsFilterRevealed(true);
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search diagnostic test or scan"
                    />
                    {searchQuery && (
                      <button
                        type="button"
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
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "diagnostic test" : "diagnostic tests"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </motion.div>

            {/* Mobile Web Rolling Single-Row Credential Ticker (One by one in same space on mobile) */}
            <MobileRollingStats items={HERO_ANALYTICS_PARAMETERS} />
          </div>

          {/* C1: Full-Width Spread Metrics Row across bottom */}
          <motion.div
            className={styles.metricsBottomWrap}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
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
        </div>
      </section>

      {/* ─── ORGAN-SYSTEM CHIPS CAROUSEL + "VIEW ALL" ────────────────────── */}
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
        eyebrow="Explore Diagnostics & Lab Tests by Organ System"
      />

      {/* ─── DIRECTORY CONTROLS: SUB-FILTER TABS (LAB/IMAGING) & A–Z INDEX (PROGRESSIVE SCROLL REVEAL) ─── */}
      <motion.div
        className={styles.directoryControlsWrap}
        initial={false}
        animate={{
          height: (isMobile || isFilterRevealed) ? "auto" : 0,
          opacity: (isMobile || isFilterRevealed) ? 1 : 0,
          marginTop: (isMobile || isFilterRevealed) ? 14 : 0,
          marginBottom: (isMobile || isFilterRevealed) ? (isMobile ? 12 : 20) : 0,
        }}
        transition={{
          duration: 0.48,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          overflow: isMobile ? "visible" : (isFilterRevealed ? "visible" : "hidden"),
          pointerEvents: (isMobile || isFilterRevealed) ? "auto" : "none",
        }}
      >
        <div className={styles.directoryTopBar}>
          <LibrarySubFilterTabs
            tabs={subFilterTabs}
            activeTab={selectedSubFilter}
            onTabChange={(tab) => {
              setSelectedSubFilter(tab);
              setSelectedLetter(null);
            }}
            ariaLabel="Filter investigations by modality"
          />

          <div className={styles.feedbackTextWrapper}>
            <p className={styles.feedbackText}>
              {searchQuery.trim() ? (
                <>
                  Search: <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash;{" "}
                  <span className={styles.feedbackCount}>
                    {displayedItems.length} {displayedItems.length === 1 ? "test" : "tests"} found
                  </span>
                </>
              ) : selectedOrgan ? (
                <>
                  Organ: <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash;{" "}
                  <span className={styles.feedbackCount}>
                    {displayedItems.length} {displayedItems.length === 1 ? "test" : "tests"} found
                  </span>
                </>
              ) : (
                <span className={styles.feedbackCount}>
                  Showing {displayedItems.length} {displayedItems.length === 1 ? "test" : "tests"}
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

        {/* Mobile Results Summary (Placed below A-Z rail on mobile to match Figma) */}
        <div className={styles.mobileFeedbackWrap}>
          <p className={styles.mobileFeedbackText}>
            Showing {displayedItems.length} {displayedItems.length === 1 ? "investigation" : "investigations"}
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
            {displayedItems.length === 0 ? (
              <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.emptyIconWrapper}>
                  <Search size={26} />
                </div>
                <h3 className={styles.emptyTitle}>No matching diagnostic tests found</h3>
                <p className={styles.emptyDesc}>
                  We couldn&apos;t find any tests matching your query. Try searching for &ldquo;MRI&rdquo;, &ldquo;X-ray&rdquo;, &ldquo;Blood test&rdquo;, or &ldquo;CT Scan&rdquo;.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, idx) => {
                  const detailUrl = `/diagnostics/${item.slug}`;
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
                      {/* 1. Full Background Image */}
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                        className={styles.cardBgImage}
                      />

                      {/* 2. Atmospheric Gradient Scrim (Exact Figma "Image fade") */}
                      <div className={styles.cardGradient} />

                      {/* 3. Content Overlaid on Scrim */}
                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.modality}
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
                                  item.testProcedure,
                                  item.turnaroundTime ? `Report turnaround: ${item.turnaroundTime}` : null,
                                  item.preparation ? `Preparation: ${item.preparation}` : null,
                                ])}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardBottomSlot}>
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <Clock size={13} className={styles.metaIcon} />
                              <span>{item.turnaroundTime || "Within 30 Minutes"}</span>
                            </span>
                            <span className={styles.metaDivider} aria-hidden="true" />
                            <span className={styles.metaBadge}>
                              <Activity size={13} className={styles.metaIcon} />
                              <span>{item.preparation || "No Fasting Required"}</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Book test
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Test details</span>
                              <ArrowUpRight size={12} className={styles.pillBtnArrow} />
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
        eyebrow="NABL ACCREDITED LABORATORY NETWORK"
        title="Need Doorstep Home Sample Collection or Specialist Advice?"
        subtitle="Our trained, vaccinated phlebotomists collect blood and pathology samples directly from your home with barcode verification and automated temperature-controlled transit."
        primaryBtn={{
          href: "/book-an-appointment",
          text: "Find a Specialist",
        }}
        secondaryBtn={{
          href: "/health-checkups",
          text: "Explore Health Packages",
        }}
        phoneText="Diagnostics Helpline: 1800 309 0309"
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
