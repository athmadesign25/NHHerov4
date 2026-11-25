"use client";

import React, { useState, useMemo, useEffect, useTransition, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownAZ,
  Clock,
  Activity,
  RotateCcw,
  SlidersHorizontal,
  Layers
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
import {
  TREATMENTS_PROCEDURES_DATA,
  TreatmentProcedureItem
} from "@/data/treatmentsProceduresData";
import styles from "@/app/treatments/TreatmentsLibrary.module.css";

// Pure Organ-Only Circular Filters (Red, Blue & White 3D/Clean SVG Icons)
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Hero Credential Parameters (part of Title & Subtext narrative)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
  { staticValue: "1L+", label: "Transplants & Complex Surgeries" },
];

export type HeroLayoutVariant = "l1" | "l2";
export type FilterLayoutVariant = "f1" | "f2" | "f3" | "f4" | "f5";

const F4_QUICK_TAB_IDS = ["all", "adult", "pediatric"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function TreatmentsV2Library() {
  const [items, setItems] = useState<TreatmentProcedureItem[]>(TREATMENTS_PROCEDURES_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Review Variations for Treatments & Procedures Library Page:
  // Hero Layout: L1 (Stats grouped under subtext, Search anchored at bottom of hero next to filters)
  //              L2 (Stats spread at bottom of hero, Search moved directly into top of Filter section)
  // Filter Composition: F1 (Search -> A-Z Tiles -> Organ Circles -> Quick Filter Chips -> Dynamic Heading)
  //                     F2 (Search + Quick Filter Chips -> Organ Circles -> A-Z Tiles -> Dynamic Heading)
  //                     F3 (Dynamic Heading + Search -> Organ Circles -> Quick Filter Chips -> A-Z Tiles)
  const [heroLayout, setHeroLayout] = useState<HeroLayoutVariant>("l1");
  const [filterLayout, setFilterLayout] = useState<FilterLayoutVariant>("f5");
  const [isF5AlphaOpen, setIsF5AlphaOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hl = params.get("hero")?.toLowerCase();
      const fl = params.get("filters")?.toLowerCase();
      if (hl === "l1" || hl === "l2") setHeroLayout(hl);
      if (fl === "f1" || fl === "f2" || fl === "f3" || fl === "f4" || fl === "f5") setFilterLayout(fl);
    }
  }, []);

  // Progressive reveal: filters stay hidden on landing (search + glimpse of cards only),
  // then appear once the user scrolls. One-way latch; always visible on mobile web.
  const [isFilterRevealed, setIsFilterRevealed] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth <= 768 || window.scrollY > 30) {
      setIsFilterRevealed(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("search") || params.get("q") || params.get("organ")) {
      setIsFilterRevealed(true);
      return;
    }
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsFilterRevealed(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHeroLayoutChange = useCallback((v: HeroLayoutVariant) => {
    setHeroLayout(v);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("hero", v);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const handleFilterLayoutChange = useCallback((v: FilterLayoutVariant) => {
    setFilterLayout(v);
    if (v === "f4" || v === "f5") {
      setSelectedSubFilter((prev) => (F4_QUICK_TAB_IDS.includes(prev) ? prev : "all"));
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("filters", v);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Unified Dark -> White -> Dark V2 dynamism across the entire page
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
  const dynBubbleLabel = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.88)", "rgba(255, 255, 255, 0.92)", "#1e293b", "#1e293b"]);
  const dynBubbleHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBubbleActive = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ff6b72", "#ff6b72", "#cf171f", "#cf171f"]);
  const dynBubbleBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.24)", "rgba(255, 255, 255, 0.28)", "rgba(15, 23, 42, 0.18)", "rgba(15, 23, 42, 0.16)"]);
  const dynBubbleBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.07)", "rgba(255, 255, 255, 0.09)", "#f8fafc", "#f8fafc"]);
  const dynArrow = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.88)", "#334155", "#334155"]);
  const dynArrowHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynFilterBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.20)", "rgba(255, 255, 255, 0.24)", "rgba(15, 23, 42, 0.18)", "rgba(15, 23, 42, 0.16)"]);
  const dynFilterBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.08)", "#ffffff", "#ffffff"]);
  const dynFilterText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.90)", "rgba(255, 255, 255, 0.94)", "#1e293b", "#1e293b"]);
  const dynFilterBgHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.16)", "#f8fafc", "#f8fafc"]);
  const dynFilterTextHover = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynRailAll = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.90)", "#1e293b", "#1e293b"]);
  const dynRailLetter = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.84)", "rgba(255, 255, 255, 0.90)", "#1e293b", "#1e293b"]);
  const dynRailHoverBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.14)", "rgba(15, 23, 42, 0.06)", "rgba(15, 23, 42, 0.06)"]);
  const dynRailHoverText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.20)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]);
  const dynSearchBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.10)", "#ffffff", "#ffffff"]);
  const dynSearchBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.26)", "rgba(255, 255, 255, 0.30)", "rgba(15, 23, 42, 0.20)", "rgba(15, 23, 42, 0.18)"]);
  const dynSearchText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynSearchPlaceholder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.82)", "#475569", "#475569"]);
  // Book Appointment Red Outline Selection Tokens (adapting smoothly from dark canvas to white canvas)
  const dynRedSelBg = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(237, 28, 36, 0.15)", "rgba(237, 28, 36, 0.18)", "rgba(237, 28, 36, 0.06)", "rgba(237, 28, 36, 0.06)"]);
  const dynRedSelBorder = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(248, 113, 113, 0.75)", "rgba(248, 113, 113, 0.80)", "rgba(220, 38, 38, 0.65)", "rgba(220, 38, 38, 0.65)"]);
  const dynRedSelText = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["#ff7b82", "#ff7b82", "#cf171f", "#cf171f"]);
  const heroStatNumColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.82)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]);
  const heroStatLabelColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.52)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]);
  const heroStatDividerColor = useTransform(unifiedWhiteProgress, [0, 0.44, 0.64, 1], ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]);

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

  // Initial page entrance animation sequence orchestration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 650);
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

  const isMinimallyInvasiveItem = useCallback((item: TreatmentProcedureItem) => {
    const text = `${item.title} ${item.shortTitle} ${item.summary} ${item.overview}`.toLowerCase();
    return (
      text.includes("minimally invasive") ||
      text.includes("robotic") ||
      text.includes("laparoscop") ||
      text.includes("endoscop") ||
      text.includes("catheter") ||
      text.includes("angioplasty") ||
      text.includes("ablation") ||
      text.includes("arthroscop") ||
      text.includes("laser")
    );
  }, []);

  const isOncologyItem = useCallback((item: TreatmentProcedureItem) => {
    const text = `${item.title} ${item.shortTitle} ${item.summary} ${item.speciality} ${item.specialitySlug}`.toLowerCase();
    return (
      text.includes("cancer") ||
      text.includes("oncology") ||
      text.includes("tumor") ||
      text.includes("tumour") ||
      text.includes("carcinoma") ||
      text.includes("mastectomy") ||
      text.includes("chemotherapy") ||
      text.includes("radiation")
    );
  }, []);

  const isTransplantItem = useCallback((item: TreatmentProcedureItem) => {
    const text = `${item.title} ${item.shortTitle} ${item.summary} ${item.speciality}`.toLowerCase();
    return text.includes("transplant") || text.includes("donor");
  }, []);

  const matchesSubFilter = useCallback(
    (item: TreatmentProcedureItem, subFilter: string) => {
      if (subFilter === "pediatric") return isPediatricItem(item);
      if (subFilter === "adult") return !isPediatricItem(item);
      if (subFilter === "minimally-invasive") return isMinimallyInvasiveItem(item);
      if (subFilter === "oncology") return isOncologyItem(item);
      if (subFilter === "transplant") return isTransplantItem(item);
      return true;
    },
    [isPediatricItem, isMinimallyInvasiveItem, isOncologyItem, isTransplantItem]
  );

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      if (!matchesSubFilter(item, selectedSubFilter)) {
        return false;
      }
      if (selectedLetter) {
        const firstChar = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
        if (firstChar !== selectedLetter) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedSubFilter, selectedLetter, matchesSubFilter]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (!matchesSubFilter(item, selectedSubFilter)) return;
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      if (char >= "A" && char <= "Z") {
        set.add(char);
      }
    });
    return set;
  }, [items, selectedSubFilter, matchesSubFilter]);

  const subFilterTabs = useMemo(() => {
    const pediatricCount = items.filter(isPediatricItem).length;
    const adultCount = items.length - pediatricCount;
    const minInvasiveCount = items.filter(isMinimallyInvasiveItem).length;
    const oncologyCount = items.filter(isOncologyItem).length;
    const transplantCount = items.filter(isTransplantItem).length;
    return [
      { id: "all", label: "All Treatments", shortLabel: "All", count: items.length },
      { id: "adult", label: "Adult Care", shortLabel: "Adult", count: adultCount },
      { id: "pediatric", label: "Pediatric Care", shortLabel: "Pediatric", count: pediatricCount },
      { id: "minimally-invasive", label: "Minimally Invasive & Robotic", shortLabel: "Robotic / MIS", count: minInvasiveCount },
      { id: "oncology", label: "Cancer & Oncology", shortLabel: "Oncology", count: oncologyCount },
      { id: "transplant", label: "Organ Transplants", shortLabel: "Transplant", count: transplantCount },
    ];
  }, [items, isPediatricItem, isMinimallyInvasiveItem, isOncologyItem, isTransplantItem]);

  const f4QuickTabs = useMemo(() => subFilterTabs.slice(0, 3), [subFilterTabs]);

  // Dynamic Book-Appointment-Style Heading reflecting active filters (no subtext or redundant chips layer)
  const dynamicResultsHeading = useMemo(() => {
    const parts: string[] = [];
    if (selectedSubFilter === "pediatric") parts.push("Pediatric");
    else if (selectedSubFilter === "adult") parts.push("Adult");
    else if (selectedSubFilter === "minimally-invasive") parts.push("Minimally Invasive & Robotic");
    else if (selectedSubFilter === "oncology") parts.push("Cancer & Oncology");
    else if (selectedSubFilter === "transplant") parts.push("Organ Transplant");

    if (currentOrganLabel) {
      parts.push(currentOrganLabel);
    }

    const baseSubject = parts.length > 0 ? `${parts.join(" ")} Treatments & Procedures` : "All Surgical Treatments & Procedures";

    if (searchQuery.trim() && selectedLetter) {
      return `${baseSubject} Matching “${searchQuery.trim()}” (Starting with ‘${selectedLetter}’)`;
    }
    if (searchQuery.trim()) {
      return `${baseSubject} Matching “${searchQuery.trim()}”`;
    }
    if (selectedLetter) {
      return `${baseSubject} Starting with ‘${selectedLetter}’`;
    }
    return baseSubject;
  }, [selectedSubFilter, currentOrganLabel, searchQuery, selectedLetter]);

  const hasAnyActiveFilter = Boolean(
    selectedOrgan || selectedSubFilter !== "all" || selectedLetter || searchQuery.trim()
  );

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

  // Reusable Search Bar Block (rendered at bottom of Hero in L1, or at top of Filter section in L2)
  // Includes prominent Reset filter CTA directly beside Search when any filter is applied
  const renderSearchBar = (contextClass?: string) => (
    <div className={`${styles.heroSearchContainer} ${contextClass || ""}`}>
      <div className={styles.heroSearchRow}>
        <div className={styles.searchBoxWrap}>
          <div className={styles.animatedBorderOutline} aria-hidden="true" />
          <div className={styles.searchBox}>
            <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
              <defs>
                <linearGradient id="nhSearchPillGradTreatments" x1="0%" y1="0%" x2="100%" y2="100%">
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
              placeholder="Search treatments, surgery, organ or condition..."
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

        {/* Prominent Reset Filter CTA directly beside Search when filters are applied */}
        {hasAnyActiveFilter && (
          <button
            type="button"
            className={styles.prominentSearchResetBtn}
            onClick={handleResetFilters}
            aria-label="Reset all active filters"
          >
            <RotateCcw size={14} />
            <span>Reset filters</span>
          </button>
        )}

        {/* Mobile Filter Trigger Button */}
        <button
          type="button"
          className={`${styles.mobileFilterBtn} ${selectedOrgan ? styles.mobileFilterBtnActive : ""}`}
          onClick={() => setIsFilterSheetOpen(true)}
          aria-label="Open organ filters"
        >
          <SlidersHorizontal size={15} />
          <span className={styles.mobileFilterBtnText}>
            {selectedOrgan ? ORGAN_FILTER_OPTIONS.find((o) => o.value === selectedOrgan)?.label : "Filters"}
          </span>
          {selectedOrgan && <span className={styles.mobileFilterDot} />}
        </button>
      </div>
    </div>
  );

  // Reusable Dynamic Heading right above the cards grid with bracketed result count
  const renderDynamicHeadingBlock = () => (
    <div className={styles.dynamicHeadingSection}>
      <div className={styles.dynamicHeadingTopRow}>
        <h2 className={styles.dynamicResultsTitle}>
          <span>{dynamicResultsHeading}</span>{" "}
          <span className={styles.dynamicResultsCount}>({displayedItems.length})</span>
        </h2>
      </div>

      {isApiLoading && (
        <div className={styles.apiPulseBar}>
          <div className={styles.apiPulseIndicator} />
        </div>
      )}
    </div>
  );

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
      {/* ─── HERO SECTION (L1 vs L2 COMPOSITION) ──────────────────────────── */}
      <section className={styles.hero} data-nav-theme="dark">
        <motion.div className={styles.heroBg} style={{ opacity: heroCanvasOpacity }}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/images/heroes/treatments_hero_v3.jpg"
              alt="Surgeon performing precision procedure at Narayana Health"
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </motion.div>

        <div className={styles.heroInner}>
          {/* Top Narrative Block: Breadcrumb + Title + Subtext + (L1: Inline Numerical Credentials) */}
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
                  { label: "Treatments & Procedures" },
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
                words={["Treatments & Procedures"]}
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
              Explore comprehensive clinical guides, recovery paths, and transparent pricing for over 400+ advanced surgical procedures and evidence-based treatments across Narayana Health.
            </motion.p>

            {/* Mobile Web Rolling Single-Row Credential Ticker */}
            <MobileRollingStats items={HERO_ANALYTICS_PARAMETERS} />

            {/* L1: Numerical Values are directly part of Title & Subtext block */}
            {heroLayout === "l1" && (
              <motion.div
                key="hero-stats-l1"
                className={styles.l1InlineStatsWrap}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.l1InlineStatsGrid}>
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

          {/* Bottom of Hero:
              - In L1: Search Bar sits at the bottom edge of the hero, directly connected to the Filters below!
              - In L2: Full-width 4-column Numerical Credentials sit at the bottom of the hero, while Search moves down into the Filter Section! */}
          {heroLayout === "l1" ? (
            <motion.div
              key="hero-bottom-search-l1"
              className={styles.heroBottomSearchDock}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderSearchBar(styles.heroBottomSearchFull)}
            </motion.div>
          ) : (
            <motion.div
              key="hero-bottom-stats-l2"
              className={styles.metricsBottomWrap}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ─── UNBOXED FILTER & DISCOVERY ZONE (F1 / F2 / F3 / F4 / F5 + SCROLL REVEAL) ─────── */}
      <div id="procedures-directory" className={styles.discoveryZoneWrap}>
        {/* In L2, Search stays always visible right above the collapsible filter rails.
            In F5 + L2, Search shares the top row with the Segmented Audience Switch & A-Z Trigger! */}
        {heroLayout === "l2" && (
          <div className={styles.filterBlockUnit}>
            {filterLayout === "f5" ? (
              <div className={styles.f5TopUnifiedBar}>
                {renderSearchBar(styles.f5UnifiedSearch)}

                {isFilterRevealed && (
                  <motion.div
                    className={styles.f5RightUtilityGroup}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      type="button"
                      className={`${styles.f5AlphaTriggerBtn} ${
                        selectedLetter || isF5AlphaOpen ? styles.f5AlphaTriggerBtnActive : ""
                      }`}
                      onClick={() => setIsF5AlphaOpen((prev) => !prev)}
                      aria-expanded={isF5AlphaOpen}
                      title="Jump to procedure by starting letter (A–Z)"
                    >
                      <span className={styles.f5AlphaSolidBadge} aria-hidden="true">
                        <ArrowDownAZ size={13} strokeWidth={2.4} />
                      </span>
                      <span>{selectedLetter ? `A–Z · ${selectedLetter}` : "Browse A–Z"}</span>
                      {selectedLetter && (
                        <X
                          size={12}
                          strokeWidth={2.3}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLetter(null);
                          }}
                        />
                      )}
                    </button>

                    <div className={styles.f5SegmentedGroup} role="group" aria-label="Filter by patient group">
                      {f4QuickTabs.map((tab) => {
                        const isActive = selectedSubFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            className={`${styles.f5SegmentBtn} ${isActive ? styles.f5SegmentBtnActive : ""}`}
                            onClick={() => {
                              setSelectedSubFilter(tab.id);
                              setSelectedLetter(null);
                            }}
                            aria-pressed={isActive}
                          >
                            <span>{tab.shortLabel || tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              renderSearchBar(
                filterLayout === "f3" ? styles.filterIntegratedSearchWide : styles.filterIntegratedSearch
              )
            )}
          </div>
        )}

        {/* Progressive Reveal on Scroll across ALL F1/F2/F3/F4:
            Hidden on initial load so user sees Search + glimpse of Cards; expands smoothly on scroll */}
        <motion.div
          className={styles.progressiveFiltersReveal}
          initial={false}
          animate={{
            height: isFilterRevealed ? "auto" : 0,
            opacity: isFilterRevealed ? 1 : 0,
            marginTop: isFilterRevealed ? 4 : 0,
            marginBottom: isFilterRevealed ? 4 : 0,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            overflow: isFilterRevealed ? "visible" : "hidden",
            pointerEvents: isFilterRevealed ? "auto" : "none",
          }}
        >
          {/* F1: Search -> A–Z Tile Rail -> Organ Icon Circles -> Quick Filter Chips */}
          {filterLayout === "f1" && (
            <>
              <div className={styles.filterBlockUnit}>
                <AlphabeticalFilterRail
                  availableLetters={availableLetters}
                  selectedLetter={selectedLetter}
                  onSelectLetter={setSelectedLetter}
                  resultCount={displayedItems.length}
                  eyebrow="Browse Alphabetically (A–Z)"
                />
              </div>

              <OrganSystemChipsCarousel
                options={ORGAN_FILTER_OPTIONS}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) {
                    setSelectedOrgan(null);
                  } else {
                    handleToggleOrgan(val);
                  }
                }}
                eyebrow="Filter by Organ System"
              />

              <div className={styles.filterBlockUnit}>
                <LibrarySubFilterTabs
                  tabs={subFilterTabs}
                  activeTab={selectedSubFilter}
                  onTabChange={(tab) => {
                    setSelectedSubFilter(tab);
                    setSelectedLetter(null);
                  }}
                  eyebrow="Filter by Care Category & Clinical Approach"
                  ariaLabel="Filter treatments by care category"
                />
              </div>
            </>
          )}

          {/* F2: Search -> Quick Filter Chips -> Organ Icon Circles -> A–Z Tile Rail */}
          {filterLayout === "f2" && (
            <>
              <div className={styles.filterBlockUnit}>
                <LibrarySubFilterTabs
                  tabs={subFilterTabs}
                  activeTab={selectedSubFilter}
                  onTabChange={(tab) => {
                    setSelectedSubFilter(tab);
                    setSelectedLetter(null);
                  }}
                  eyebrow="Filter by Care Category & Clinical Approach"
                  ariaLabel="Filter treatments by care category"
                />
              </div>

              <OrganSystemChipsCarousel
                options={ORGAN_FILTER_OPTIONS}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) {
                    setSelectedOrgan(null);
                  } else {
                    handleToggleOrgan(val);
                  }
                }}
                eyebrow="Filter by Organ System"
              />

              <div className={styles.filterBlockUnit}>
                <AlphabeticalFilterRail
                  availableLetters={availableLetters}
                  selectedLetter={selectedLetter}
                  onSelectLetter={setSelectedLetter}
                  resultCount={displayedItems.length}
                  eyebrow="Browse Alphabetically (A–Z)"
                />
              </div>
            </>
          )}

          {/* F3: Search -> Organ Icon Circles -> Quick Filter Chips -> A–Z Tile Rail */}
          {filterLayout === "f3" && (
            <>
              <OrganSystemChipsCarousel
                options={ORGAN_FILTER_OPTIONS}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) {
                    setSelectedOrgan(null);
                  } else {
                    handleToggleOrgan(val);
                  }
                }}
                eyebrow="Filter by Organ System"
              />

              <div className={styles.filterBlockUnit}>
                <LibrarySubFilterTabs
                  tabs={subFilterTabs}
                  activeTab={selectedSubFilter}
                  onTabChange={(tab) => {
                    setSelectedSubFilter(tab);
                    setSelectedLetter(null);
                  }}
                  eyebrow="Filter by Care Category & Clinical Approach"
                  ariaLabel="Filter treatments by care category"
                />
              </div>

              <div className={styles.filterBlockUnit}>
                <AlphabeticalFilterRail
                  availableLetters={availableLetters}
                  selectedLetter={selectedLetter}
                  onSelectLetter={setSelectedLetter}
                  resultCount={displayedItems.length}
                  eyebrow="Browse Alphabetically (A–Z)"
                />
              </div>
            </>
          )}

          {/* F4: Search -> 3 Quick Filter Chips (All / Adult / Pediatric) -> Organ Icon Circles -> A–Z Tile Rail */}
          {filterLayout === "f4" && (
            <>
              <div className={styles.filterBlockUnit}>
                <LibrarySubFilterTabs
                  tabs={f4QuickTabs}
                  activeTab={selectedSubFilter}
                  onTabChange={(tab) => {
                    setSelectedSubFilter(tab);
                    setSelectedLetter(null);
                  }}
                  eyebrow="Filter by Patient Group"
                  ariaLabel="Filter treatments by patient group"
                />
              </div>

              <OrganSystemChipsCarousel
                options={ORGAN_FILTER_OPTIONS}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) {
                    setSelectedOrgan(null);
                  } else {
                    handleToggleOrgan(val);
                  }
                }}
                eyebrow="Filter by Organ System"
              />

              <div className={styles.filterBlockUnit}>
                <AlphabeticalFilterRail
                  availableLetters={availableLetters}
                  selectedLetter={selectedLetter}
                  onSelectLetter={setSelectedLetter}
                  resultCount={displayedItems.length}
                  eyebrow="Browse Alphabetically (A–Z)"
                />
              </div>
            </>
          )}

          {/* F5: Zero-Clutter Hierarchy — Unboxed Organ Icon Bar + Unified Segmented Audience + On-Demand Typographic A–Z */}
          {filterLayout === "f5" && (
            <>
              <OrganSystemChipsCarousel
                variant="clean-tabs"
                options={ORGAN_FILTER_OPTIONS}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) {
                    setSelectedOrgan(null);
                  } else {
                    handleToggleOrgan(val);
                  }
                }}
              />

              {/* In L1 (Search is in hero), show Browse A–Z (left with icon) alongside Segmented Patient Group */}
              {heroLayout === "l1" && (
                <div className={styles.filterBlockUnit}>
                  <div className={styles.f5L1ControlsBar}>
                    <button
                      type="button"
                      className={`${styles.f5AlphaTriggerBtn} ${
                        selectedLetter || isF5AlphaOpen ? styles.f5AlphaTriggerBtnActive : ""
                      }`}
                      onClick={() => setIsF5AlphaOpen((prev) => !prev)}
                      aria-expanded={isF5AlphaOpen}
                      title="Jump to procedure by starting letter (A–Z)"
                    >
                      <span className={styles.f5AlphaSolidBadge} aria-hidden="true">
                        <ArrowDownAZ size={13} strokeWidth={2.4} />
                      </span>
                      <span>{selectedLetter ? `A–Z · ${selectedLetter}` : "Browse A–Z"}</span>
                      {selectedLetter && (
                        <X
                          size={12}
                          strokeWidth={2.3}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLetter(null);
                          }}
                        />
                      )}
                    </button>

                    <div className={styles.f5SegmentedGroup} role="group" aria-label="Filter by patient group">
                      {f4QuickTabs.map((tab) => {
                        const isActive = selectedSubFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            className={`${styles.f5SegmentBtn} ${isActive ? styles.f5SegmentBtnActive : ""}`}
                            onClick={() => {
                              setSelectedSubFilter(tab.id);
                              setSelectedLetter(null);
                            }}
                            aria-pressed={isActive}
                          >
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Lightweight Unboxed Typographic A–Z Jump Strip (Zero letter borders; expands smoothly on click) */}
              <AnimatePresence initial={false}>
                {(isF5AlphaOpen || Boolean(selectedLetter)) && (
                  <motion.div
                    className={styles.filterBlockUnit}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className={styles.f5TypoAlphaRail} role="toolbar" aria-label="A to Z alphabetical jump">
                      <button
                        type="button"
                        className={`${styles.f5TypoAlphaBtn} ${selectedLetter === null ? styles.f5TypoAlphaBtnActive : ""}`}
                        onClick={() => setSelectedLetter(null)}
                      >
                        All
                      </button>
                      {ALPHABET.map((char) => {
                        const isAvail = availableLetters.has(char);
                        const isSel = selectedLetter === char;
                        return (
                          <button
                            key={char}
                            type="button"
                            disabled={!isAvail}
                            className={`${styles.f5TypoAlphaBtn} ${isSel ? styles.f5TypoAlphaBtnActive : ""} ${
                              !isAvail ? styles.f5TypoAlphaBtnDisabled : ""
                            }`}
                            onClick={() => setSelectedLetter(isSel ? null : char)}
                          >
                            {char}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* Bottom before cards: Dynamic Heading + Reset CTA only */}
        {renderDynamicHeadingBlock()}
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
            transition={{ duration: 0.45, delay: 0.4 }}
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
                  We couldn&apos;t find any results matching your search, care group, or active filter. Try clearing your filters or exploring another organ system.
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
                              <CardTitleText title={item.title} />
                            </h2>
                          </Link>

                          <div className={styles.cardSubReveal}>
                            <div className={styles.cardSubInner}>
                              <p className={styles.cardSub}>
                                {buildCardHoverReading([
                                  item.overview,
                                  item.summary,
                                  item.duration ? `Typical procedure duration: ${item.duration}` : null,
                                  item.hospitalStay ? `Hospital stay: ${item.hospitalStay}` : null,
                                  item.recoveryTime ? `Expected recovery: ${item.recoveryTime}` : null,
                                  item.successRate ? `Clinical success rate: ${item.successRate}` : null,
                                ])}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Slot: Resting Metadata (Recovery, Stay) vs Decision Action Buttons */}
                        <div className={styles.cardBottomSlot}>
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
                  <h3 className={styles.sheetTitle}>Filter by Organ System</h3>
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
                  <span className={styles.sheetOrganLabel}>All Organ Systems</span>
                  <span className={styles.sheetOrganCount}>{TREATMENTS_PROCEDURES_DATA.length}</span>
                </button>

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
                            width={24}
                            height={24}
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
                  View {displayedItems.length} Procedures
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── FLOATING REVIEW SWITCHER DOCK (L1/L2 HERO & F1/F2/F3 FILTER COMPOSITIONS) ─── */}
      <aside className={styles.floatingStatsDock} aria-label="Hero and Filter Layout Review Switcher">
        <span className={styles.floatingStatsDot} aria-hidden="true" />
        <span className={styles.floatingStatsLabel}>HERO:</span>
        <div className={styles.floatingStatsBtnGroup}>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${heroLayout === "l1" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleHeroLayoutChange("l1")}
            title="L1: Numerical values grouped under subtext; Search anchored at bottom of hero directly above filters"
          >
            L1
          </button>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${heroLayout === "l2" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleHeroLayoutChange("l2")}
            title="L2: Spread numerical values in hero; Search docked inside top of Filter section"
          >
            L2
          </button>
        </div>

        <span className={styles.floatingDockDivider} aria-hidden="true" />

        <span className={styles.floatingStatsLabel}>FILTERS:</span>
        <div className={styles.floatingStatsBtnGroup}>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${filterLayout === "f1" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleFilterLayoutChange("f1")}
            title="F1: Search → A–Z Tile Rail → Organ Circles → Quick Filter Chips → Dynamic Heading"
          >
            F1
          </button>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${filterLayout === "f2" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleFilterLayoutChange("f2")}
            title="F2: Search + Quick Filter Chips → Organ Circles → A–Z Tile Rail → Dynamic Heading"
          >
            F2
          </button>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${filterLayout === "f3" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleFilterLayoutChange("f3")}
            title="F3: Search → Organ Circles → Quick Filter Chips → A–Z Tile Rail"
          >
            F3
          </button>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${filterLayout === "f4" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleFilterLayoutChange("f4")}
            title="F4: Search → 3 Quick Filter Chips (All / Adult / Pediatric) → Organ Circles → A–Z Tile Rail"
          >
            F4
          </button>
          <button
            type="button"
            className={`${styles.floatingStatsBtn} ${filterLayout === "f5" ? styles.floatingStatsBtnActive : ""}`}
            onClick={() => handleFilterLayoutChange("f5")}
            title="F5: Zero-Clutter Hierarchy — Unboxed Organ Icon Bar + Unified Segmented Audience + On-Demand A–Z"
          >
            F5
          </button>
        </div>
      </aside>
    </motion.div>
  );
}
