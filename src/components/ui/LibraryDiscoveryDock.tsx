"use client";

import React, { useState, useEffect, useRef, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowDownAZ, SlidersHorizontal, RotateCcw } from "lucide-react";
import OrganSystemChipsCarousel, { OrganFilterOption } from "./OrganSystemChipsCarousel";
import StickyBreadcrumbBar from "./StickyBreadcrumbBar";
import PinnedStickyShell from "./PinnedStickyShell";
import RewriteHeadingText from "./RewriteHeadingText";
import styles from "./LibraryDiscoveryDock.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface SubFilterChipOption {
  id: string;
  label: string;
}

interface LibraryDiscoveryDockProps {
  id?: string;
  currentTitle: string;
  parentLabel?: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  gradId: string;
  organOptions: OrganFilterOption[];
  selectedOrgan: string | null;
  onToggleOrgan: (val: string) => void;
  onClearOrgan: () => void;
  onOpenMobileFilters: () => void;
  subFilterChips?: readonly SubFilterChipOption[];
  selectedSubFilter?: string;
  onSelectSubFilter?: (id: string) => void;
  availableLetters?: Set<string>;
  selectedLetter?: string | null;
  onSelectLetter?: (letter: string | null) => void;
  headingText: string;
  resultCount: number;
  isApiLoading?: boolean;
  onResetAll: () => void;
  children: ReactNode;
}

/**
 * Shared F5 Discovery, Filter & Sticky Dock wrapper used across Health Library directory pages.
 * Renders clean Search + Browse A-Z on landing, calmly reveals Organ circles + Chips on white scroll,
 * and docks a zero-jump blurred sticky bar with StickyBreadcrumbBar + Mini-Circle Organ Pills.
 */
export default function LibraryDiscoveryDock({
  id = "library-directory",
  currentTitle,
  parentLabel = "Health Library",
  searchPlaceholder,
  searchAriaLabel,
  searchQuery,
  onSearchChange,
  gradId,
  organOptions,
  selectedOrgan,
  onToggleOrgan,
  onClearOrgan,
  onOpenMobileFilters,
  subFilterChips = [],
  selectedSubFilter = "all",
  onSelectSubFilter,
  availableLetters,
  selectedLetter = null,
  onSelectLetter,
  headingText,
  resultCount,
  isApiLoading = false,
  onResetAll,
  children,
}: LibraryDiscoveryDockProps) {
  const [isF5AlphaOpen, setIsF5AlphaOpen] = useState(false);
  const [isSecondaryRevealed, setIsSecondaryRevealed] = useState(false);
  const [isStickyPinned, setIsStickyPinned] = useState(false);
  const stickySentinelRef = useRef<HTMLDivElement>(null);
  const stickyEndSentinelRef = useRef<HTMLDivElement>(null);

  const hasLetters = Boolean(availableLetters && onSelectLetter);
  const hasSubFilter = Boolean(subFilterChips.length > 0 && selectedSubFilter !== "all");
  const hasAnyActiveFilter = Boolean(
    selectedOrgan || hasSubFilter || selectedLetter || searchQuery.trim()
  );

  const currentOrganShortLabel = useMemo(() => {
    if (!selectedOrgan) return null;
    const match = organOptions.find((o) => o.value === selectedOrgan);
    return match ? (match.shortLabel || match.label) : selectedOrgan;
  }, [selectedOrgan, organOptions]);

  // Smooth slow reveal on scroll > 48px, gracefully tucking back at scroll top <= 8px when unfiltered
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncReveal = () => {
      const sy = window.scrollY;
      const hasSecondaryFilter = Boolean(selectedOrgan) || hasSubFilter;
      if (sy > 48 || hasSecondaryFilter) {
        setIsSecondaryRevealed(true);
      } else if (sy <= 8 && !hasSecondaryFilter && !isF5AlphaOpen && !selectedLetter && !searchQuery.trim()) {
        setIsSecondaryRevealed(false);
      }
    };
    syncReveal();
    window.addEventListener("scroll", syncReveal, { passive: true });
    return () => window.removeEventListener("scroll", syncReveal);
  }, [selectedOrgan, hasSubFilter, isF5AlphaOpen, selectedLetter, searchQuery]);

  // Detect when in-flow filters exit above top bar, and un-dock before footer CTA banner
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateSticky = () => {
      const topEl = stickySentinelRef.current;
      const endEl = stickyEndSentinelRef.current;
      if (!topEl) return;
      const topY = topEl.getBoundingClientRect().top;
      const endY = endEl ? endEl.getBoundingClientRect().top : Infinity;
      setIsStickyPinned(topY <= 92 && endY > 220);
    };
    updateSticky();
    window.addEventListener("scroll", updateSticky, { passive: true });
    window.addEventListener("resize", updateSticky, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateSticky);
      window.removeEventListener("resize", updateSticky);
    };
  }, []);

  const handleFullReset = () => {
    setIsF5AlphaOpen(false);
    onResetAll();
  };

  const renderSearchBar = (includeGradSvg: boolean = true) => (
    <div className={styles.searchContainer}>
      <div className={styles.searchRow}>
        <div className={styles.searchBoxWrap}>
          <div className={styles.animatedBorderOutline} aria-hidden="true" />
          <div className={styles.searchBox}>
            {includeGradSvg && (
              <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "var(--dyn-search-grad-3, #00C4FF)" }} />
                    <stop offset="50%" style={{ stopColor: "var(--dyn-search-grad-2, #8B5CF6)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--dyn-search-grad-1, #ED1C24)" }} />
                  </linearGradient>
                </defs>
              </svg>
            )}
            <Search
              size={18}
              strokeWidth={2.0}
              className={styles.searchIcon}
              style={{ stroke: `url(#${gradId})` }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={searchAriaLabel}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => onSearchChange("")}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  const renderUtilityControls = (inSticky: boolean) => (
    <div className={styles.rightUtilityGroup}>
      {onOpenMobileFilters && (
        <button
          type="button"
          className={`${styles.mobileFilterBtn} ${styles.mobileFilterBtnUnified} ${
            selectedOrgan ? styles.mobileFilterBtnActive : ""
          }`}
          onClick={onOpenMobileFilters}
          aria-label="Open organ filters"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          <span>{currentOrganShortLabel || "Organs"}</span>
          {selectedOrgan && <span className={styles.mobileFilterDot} />}
        </button>
      )}

      {hasLetters && onSelectLetter && (
        <button
          type="button"
          className={`${styles.alphaTriggerBtn} ${
            selectedLetter || isF5AlphaOpen ? styles.alphaTriggerBtnActive : ""
          }`}
          onClick={() => setIsF5AlphaOpen((prev) => !prev)}
          aria-expanded={isF5AlphaOpen || Boolean(selectedLetter)}
          title="Jump by starting letter (A–Z)"
        >
          <span className={styles.alphaSolidBadge} aria-hidden="true">
            <ArrowDownAZ size={14} strokeWidth={2.4} />
          </span>
          <ArrowDownAZ size={14} className={styles.mobileAlphaIcon} aria-hidden="true" />
          <span className={styles.alphaBtnDesktopText}>
            {selectedLetter ? `A–Z · ${selectedLetter}` : "Browse A–Z"}
          </span>
          <span className={styles.alphaBtnMobileText}>
            {selectedLetter ? `A–Z · ${selectedLetter}` : "A–Z"}
          </span>
          {selectedLetter && (
            <X
              size={13}
              strokeWidth={2.3}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLetter(null);
              }}
            />
          )}
        </button>
      )}

      {subFilterChips.length > 0 && onSelectSubFilter && (
        <div
          className={inSticky ? styles.stickyInlineChipsWrap : styles.mobileInlineChipsWrap}
          role="group"
          aria-label="Additional filters"
        >
          {inSticky && hasLetters && <span className={styles.stickyInlineDivider} aria-hidden="true" />}
          {subFilterChips.map((chip) => {
            const isSelected = selectedSubFilter === chip.id;
            return (
              <button
                key={`${inSticky ? "s" : "m"}-${chip.id}`}
                type="button"
                className={`${styles.subFilterChip} ${isSelected ? styles.subFilterChipActive : ""}`}
                onClick={() => onSelectSubFilter(isSelected ? "all" : chip.id)}
                aria-pressed={isSelected}
                data-selected={isSelected ? "true" : undefined}
              >
                <span>{chip.label}</span>
                {isSelected && <X size={13} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAlphabetStrip = () =>
    hasLetters && availableLetters && onSelectLetter ? (
      <AnimatePresence initial={false}>
        {(isF5AlphaOpen || Boolean(selectedLetter)) && (
          <motion.div
            className={styles.alphaDrawerWrap}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className={styles.typoAlphaRail} role="toolbar" aria-label="A to Z alphabetical jump">
              <button
                type="button"
                className={`${styles.typoAlphaBtn} ${selectedLetter === null ? styles.typoAlphaBtnActive : ""}`}
                onClick={() => onSelectLetter(null)}
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
                    className={`${styles.typoAlphaBtn} ${isSel ? styles.typoAlphaBtnActive : ""} ${
                      !isAvail ? styles.typoAlphaBtnDisabled : ""
                    }`}
                    onClick={() => onSelectLetter(isSel ? null : char)}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ) : null;

  return (
    <div id={id} className={styles.directoryStickyScope} data-nav-theme="light">
      {/* ─── IN-FLOW FILTERS SECTION (NEVER CHANGES DIMENSIONS ON STICKY PIN -> 0PX CARD JUMP) ─── */}
      <div className={styles.inFlowFilterHeader}>
        <div className={styles.stickyFilterHeaderInner}>
          {/* Level 1 Row: Search + Unified Filter Toolbar (Organs + Browse A–Z + Sub-Filter Chips) */}
          <div className={styles.filterBlockUnit}>
            <div className={styles.topUnifiedBar}>
              {renderSearchBar(true)}
              {renderUtilityControls(false)}
            </div>

            {renderAlphabetStrip()}
          </div>

          {/* Secondary Filters: Slow, calm entrance on scroll over white canvas */}
          <motion.div
            initial={false}
            animate={{
              height: isSecondaryRevealed ? "auto" : 0,
              opacity: isSecondaryRevealed ? 1 : 0,
              y: isSecondaryRevealed ? 0 : -10,
            }}
            transition={{
              height: {
                duration: isSecondaryRevealed ? 0.82 : 0.72,
                delay: isSecondaryRevealed ? 0 : 0.16,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: isSecondaryRevealed ? 0.68 : 0.44,
                delay: isSecondaryRevealed ? 0.14 : 0,
                ease: [0.22, 1, 0.36, 1],
              },
              y: {
                duration: isSecondaryRevealed ? 0.76 : 0.52,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            style={{
              overflow: "hidden",
              pointerEvents: isSecondaryRevealed ? "auto" : "none",
            }}
          >
            <div className={styles.secondaryFiltersSmoothWrap}>
              {/* Level 2: Full Circular Organ-Wise Filters (Single-Word Labels) */}
              <OrganSystemChipsCarousel
                variant="circle"
                showHeader={false}
                showAllOption
                options={organOptions}
                selectedOrgan={selectedOrgan}
                onSelectOrgan={(val) => {
                  if (val === null) onClearOrgan();
                  else onToggleOrgan(val);
                }}
              />

              {/* Level 3: Optional Sub-Filter Chips (Desktop/Tablet below organs; hidden on MWeb since unified inline above) */}
              {subFilterChips.length > 0 && onSelectSubFilter && (
                <div className={`${styles.filterBlockUnit} ${styles.desktopOnlySubFilters}`}>
                  <div className={styles.chipsRow} role="group" aria-label="Additional filters">
                    {subFilterChips.map((chip) => {
                      const isSelected = selectedSubFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          className={`${styles.subFilterChip} ${isSelected ? styles.subFilterChipActive : ""}`}
                          onClick={() => onSelectSubFilter(isSelected ? "all" : chip.id)}
                          aria-pressed={isSelected}
                          data-selected={isSelected ? "true" : undefined}
                        >
                          <span>{chip.label}</span>
                          {isSelected && <X size={14} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sentinel marking top sticky transition */}
      <div ref={stickySentinelRef} className={styles.stickySentinel} aria-hidden="true" />

      {/* ─── FROSTED BLURRED FIXED STICKY DOCK (BREADCRUMB + COMPACT SEARCH + MINI-CIRCLE ORGAN PILLS) ─── */}
      <PinnedStickyShell isPinned={isStickyPinned} motionKey={`${gradId}-sticky-dock`}>
        <StickyBreadcrumbBar
          currentTitle={currentTitle}
          parentLabel={parentLabel}
          activeFilterLabel={currentOrganShortLabel}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <div className={styles.stickyPanelInner}>
          {/* Line 1: Compact Search + Organs + Browse A–Z + Sub-Filter Chips */}
          <div className={styles.filterBlockUnit}>
            <div className={styles.topUnifiedBar}>
              {renderSearchBar(false)}
              {renderUtilityControls(true)}
            </div>

            {renderAlphabetStrip()}
          </div>

          {/* Line 2: Mini-Circle Organ Pills (desktop/tablet sticky; hidden on mobile <=768px where [Filters] sheet is active) */}
          <OrganSystemChipsCarousel
            variant="mini-pills"
            showHeader={false}
            showAllOption
            className={styles.mobileHideMiniPills}
            options={organOptions}
            selectedOrgan={selectedOrgan}
            onSelectOrgan={(val) => {
              if (val === null) onClearOrgan();
              else onToggleOrgan(val);
            }}
          />
        </div>
      </PinnedStickyShell>

      {/* Animated Dynamic Heading + Reset Filters CTA directly on the right */}
      <div className={styles.discoveryZoneWrap}>
        <div className={styles.dynamicHeadingSection}>
          <div className={styles.dynamicHeadingTopRow}>
            <h2 className={styles.dynamicResultsTitle}>
              <RewriteHeadingText text={headingText} />{" "}
              <span className={styles.dynamicResultsCount}>({resultCount})</span>
            </h2>

            <AnimatePresence>
              {hasAnyActiveFilter && (
                <motion.button
                  key="reset-filters-header-cta"
                  type="button"
                  className={styles.resetHeaderBtn}
                  onClick={handleFullReset}
                  initial={{ opacity: 0, scale: 0.94, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.94, x: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>Reset filters</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {isApiLoading && (
            <div className={styles.apiPulseBar}>
              <div className={styles.apiPulseIndicator} />
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid & Content */}
      {children}

      {/* Bottom Sticky Exit Sentinel */}
      <div ref={stickyEndSentinelRef} className={styles.stickySentinel} aria-hidden="true" />
    </div>
  );
}
