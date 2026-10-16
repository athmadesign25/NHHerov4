"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { SearchTab } from "@/features/search/searchTabs";
import styles from "./Design1TopSection.module.css";

const CARD_CONFIGS: Record<
  string,
  {
    titleLine1: string;
    titleLine2?: string;
    image: string;
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
  }
> = {
  doctors: {
    titleLine1: "Doctors",
    image: "/images/category-cards/subjects/doctor_2x.png",
    imgX: 50,
    imgY: 30,
    imgW: 140,
    imgH: 140,
  },
  hospitals: {
    titleLine1: "Hospital &",
    titleLine2: "Clinics",
    image: "/images/category-cards/subjects/hospital_2x.png",
    imgX: 75,
    imgY: 42,
    imgW: 135,
    imgH: 125,
  },
  specialties: {
    titleLine1: "Specialty",
    image: "/images/category-cards/subjects/heart_2x.png",
    imgX: 95,
    imgY: 28,
    imgW: 115,
    imgH: 138,
  },
  treatments: {
    titleLine1: "Treatment &",
    titleLine2: "Procedure",
    image: "/images/category-cards/subjects/treatment_2x.png",
    imgX: 52,
    imgY: 52,
    imgW: 158,
    imgH: 115,
  },
  packages_tests: {
    titleLine1: "Packages &",
    titleLine2: "Test",
    image: "/images/category-cards/subjects/packages_2x.png",
    imgX: 88,
    imgY: 34,
    imgW: 122,
    imgH: 132,
  },
  articles: {
    titleLine1: "Articles &",
    titleLine2: "Blogs",
    image: "/images/category-cards/subjects/articles_2x.png",
    imgX: 78,
    imgY: 42,
    imgW: 132,
    imgH: 124,
  },
};

const SHAPE_PATH = "M 220,0 L 220,160 L 0,160 L 18,24 Q 22,0 52,0 Z";
const HIGHLIGHT_PATH = "M 0,160 L 18,24 Q 22,0 52,0 L 220,0";

/**
 * Design 1 — Search Results top section.
 *
 * Presentation only. All state and handlers are owned by SearchResultsView
 * and passed in unchanged, so search, live API, tab routing, filters and
 * booking behave identically to the Original design.
 */
export interface Design1TopSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** Mirrors global Navbar show/hide (tracked in SearchResultsView). */
  isNavVisible: boolean;
  tabs: readonly SearchTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  counts: Record<string, number | string>;
  /** Show the Filters trigger (< 1024px, Doctors tab only). */
  showFiltersButton: boolean;
  activeFiltersCount: number;
  onOpenFilters: () => void;
}

export default function Design1TopSection({
  query,
  onQueryChange,
  onSubmit,
  isNavVisible,
  tabs,
  activeTab,
  onTabChange,
  counts,
  showFiltersButton,
  activeFiltersCount,
  onOpenFilters,
}: Design1TopSectionProps) {
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>(0);
  const compact = !isNavVisible;

  // Reserve the header's EXPANDED height in flow. Measured only while
  // expanded, so compacting never changes document layout.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el || compact) return;
    const measure = () => setPlaceholderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compact]);

  return (
    <>
      <div className={styles.placeholder} style={{ height: placeholderHeight || undefined }} aria-hidden />

      <header
        ref={headerRef}
        className={`${styles.shell} ${compact ? styles.compact : ""}`}
        data-compact={compact || undefined}
      >
        <div className={styles.navReserve} aria-hidden />

        {/* Search band — stays pinned; compacts when the Navbar hides */}
        <div className={styles.searchBand}>
          <div className={styles.container}>
            <form role="search" onSubmit={onSubmit} className={styles.form}>
              <div className={styles.inputWrap}>
                <Search size={18} className={styles.searchIcon} aria-hidden />
                <label htmlFor="search-results-input" className={styles.srOnly}>
                  Search doctors, hospitals, packages, tests and conditions
                </label>
                <input
                  ref={inputRef}
                  id="search-results-input"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search doctors, hospitals, packages, tests, conditions…"
                  className={styles.input}
                />
                {query && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => {
                      onQueryChange("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={16} aria-hidden />
                  </button>
                )}
              </div>

              {showFiltersButton && (
                <button
                  id="search-filters-trigger"
                  type="button"
                  className={styles.filtersBtn}
                  onClick={onOpenFilters}
                  aria-label={
                    activeFiltersCount > 0 ? `Filters, ${activeFiltersCount} active` : "Filters"
                  }
                >
                  <SlidersHorizontal size={16} aria-hidden />
                  <span className={styles.filtersLabel}>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className={styles.filtersBadge} aria-hidden>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* Category cards band — In normal document flow so cards are non-sticky and scroll away smoothly */}
      <nav className={styles.tabsBand} aria-label="Search categories">
        <div className={styles.container}>
          <div className={styles.cardsTrack} role="tablist">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const config = CARD_CONFIGS[tab.id] || {
                  titleLine1: tab.label,
                  image: "/images/category-cards/subjects/doctor_2x.png",
                  imgX: 50,
                  imgY: 30,
                  imgW: 140,
                  imgH: 140,
                };
                const count = counts[tab.countKey];
                const baseZ = idx + 1;
                const zIndex = isActive ? 20 : baseZ;

                return (
                  <button
                    key={tab.id}
                    id={`search-tab-${tab.slug}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    style={{ zIndex }}
                    className={`${styles.card} ${isActive ? styles.cardActive : styles.cardInactive}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <svg viewBox="0 0 220 160" preserveAspectRatio="none" className={styles.cardSvg}>
                      <defs>
                        <clipPath id={`d1-clip-${tab.id}`}>
                          <path d={SHAPE_PATH} />
                        </clipPath>
                        <linearGradient id={`d1-grad-blue-${tab.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3E88DA" />
                          <stop offset="35%" stopColor="#175EB8" />
                          <stop offset="70%" stopColor="#044493" />
                          <stop offset="100%" stopColor="#011F4A" />
                        </linearGradient>
                        <linearGradient id={`d1-grad-grey-${tab.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8E8E8E" />
                          <stop offset="35%" stopColor="#606060" />
                          <stop offset="70%" stopColor="#3C3C3C" />
                          <stop offset="100%" stopColor="#1C1C1C" />
                        </linearGradient>
                        <linearGradient id={`d1-dark-fade-${tab.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                          <stop offset="40%" stopColor="#000000" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Card background shape */}
                      <path
                        d={SHAPE_PATH}
                        fill={isActive ? `url(#d1-grad-blue-${tab.id})` : `url(#d1-grad-grey-${tab.id})`}
                      />

                      {/* Subject artwork clipped to exact card geometry */}
                      <g clipPath={`url(#d1-clip-${tab.id})`}>
                        <image
                          href={config.image}
                          x={config.imgX}
                          y={config.imgY}
                          width={config.imgW}
                          height={config.imgH}
                          preserveAspectRatio="xMidYMid meet"
                          style={{
                            filter: !isActive ? "brightness(0.92) contrast(1.05)" : undefined,
                          }}
                        />
                        {/* Dark bottom blending overlay */}
                        <rect x="0" y="80" width="220" height="80" fill={`url(#d1-dark-fade-${tab.id})`} />
                      </g>

                      {/* Light glass highlight along slanted left edge and rounded top-left curve */}
                      <path
                        d={HIGHLIGHT_PATH}
                        stroke={isActive ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.35)"}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>

                    {/* Content overlay: Title and Result Count */}
                    <div className={styles.cardOverlay}>
                      <div className={styles.cardTitle}>
                        {config.titleLine1}
                        {config.titleLine2 && (
                          <>
                            <br />
                            {config.titleLine2}
                          </>
                        )}
                      </div>
                      {count !== undefined && count !== "" && (
                        <span className={styles.cardCountBadge} aria-label={`${count} results`}>
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
    </>
  );
}
