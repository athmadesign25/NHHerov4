"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NHSearchExperience.module.css";
import { SearchResultsData, getSearchResults } from "./searchData";
import LocationSelector from "./LocationSelector";
import PrimaryResults from "./PrimaryResults";
import TertiaryResults from "./TertiaryResults";
import PulseAIView from "./PulseAIView";
import PulseAIAvatar from "./PulseAIAvatar";

interface SearchResultsCanvasProps {
  query: string;
  results: SearchResultsData;
  onEditSearch: () => void;
  onSubmit?: (newQuery: string) => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectSpecialtyTag?: (tag: string) => void;
  onAskPulse?: () => void;
}

export default function SearchResultsCanvas({
  query,
  results,
  onEditSearch,
  onSubmit,
  onClose,
  selectedLocation,
  onSelectLocation,
  onSelectSpecialtyTag,
  onAskPulse,
}: SearchResultsCanvasProps) {
  const [inputValue, setInputValue] = useState(query);
  const [activeQuery, setActiveQuery] = useState(query);
  const [currentResults, setCurrentResults] = useState<SearchResultsData>(results);
  const [isRequerying, setIsRequerying] = useState(false);
  const [requeryStage, setRequeryStage] = useState<"idle" | "analyzing" | "skeleton">("idle");
  const [isPulseExpanded, setIsPulseExpanded] = useState(false);
  const [pulseOriginY, setPulseOriginY] = useState(440);
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pulseRowRef = useRef<HTMLDivElement>(null);

  // Synchronize local states when incoming props change
  useEffect(() => {
    setCurrentResults(results);
  }, [results]);

  useEffect(() => {
    setActiveQuery(query);
    setInputValue(query);
  }, [query]);

  // Check if user has modified the prompt
  const isEdited = inputValue.trim() !== activeQuery.trim() && inputValue.trim().length > 0;

  const handleOpenPulse = () => {
    if (pulseRowRef.current && stageRef.current) {
      const rowRect = pulseRowRef.current.getBoundingClientRect();
      const stageRect = stageRef.current.getBoundingClientRect();
      const deltaY = Math.round(rowRect.top - stageRect.top);
      if (deltaY > 80) {
        setPulseOriginY(deltaY);
      }
    }
    setIsPulseExpanded(true);
  };

  const handleBackToResults = () => {
    setIsPulseExpanded(false);
  };

  // Re-ask/Prompt directly inside results without tearing down the modal
  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    // Stage 1: Finding & Analysing phase
    setIsRequerying(true);
    setRequeryStage("analyzing");
    setActiveQuery(clean);

    // Stage 2: Skeleton appearance after quick intent analysis
    setTimeout(() => {
      setRequeryStage("skeleton");
    }, 260);

    try {
      const [newResults] = await Promise.all([
        getSearchResults(clean, selectedLocation),
        new Promise((resolve) => setTimeout(resolve, 680)),
      ]);

      if (newResults) {
        setCurrentResults(newResults);
      }
    } catch (err) {
      console.warn("Live search query error:", err);
    } finally {
      setIsRequerying(false);
      setRequeryStage("idle");
    }
  };

  return (
    <div className={styles.resultsContainer}>
      {/* Top Header Row: Location Pill + Close Button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          {/* Location Selector */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={async (loc) => {
              onSelectLocation(loc);
              // Update local results with selected location
              const updated = await getSearchResults(activeQuery, loc);
              setCurrentResults(updated);
            }}
          />
        </div>

        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close results"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Seamless Expansion Transition: RESULTS STATE ↔ PULSE STATE ── */}
      <div className={styles.canvasStage} ref={stageRef}>
        <AnimatePresence initial={false}>
          {isPulseExpanded ? (
            /* ── PULSE STATE: Expands smoothly from Ask Pulse Card into full Viewport Box ── */
            <motion.div
              key="pulse-view"
              className={styles.canvasStageLayer}
              initial={{ opacity: 0.85, y: pulseOriginY, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pulseOriginY, scale: 0.98 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 2 }}
            >
              <PulseAIView
                query={activeQuery}
                selectedLocation={selectedLocation}
                doctors={currentResults.doctors}
                onBack={handleBackToResults}
              />
            </motion.div>
          ) : (
            /* ── RESULTS STATE: Standard 2-Column Search Results ── */
            <motion.div
              key="standard-results"
              className={styles.canvasStageLayer}
              initial={{ opacity: 0, y: -20, x: -8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, x: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: 1 }}
            >
            {/* Query Display Bar: Search Icon + Natural Editable Input + Send/Edit button */}
            <form className={styles.resultsQueryBar} onSubmit={handleFormSubmit}>
              <div 
                className={styles.resultsQueryLeft}
                onClick={() => inputRef.current?.focus()}
              >
                <Search size={22} className={styles.resultsQuerySearchIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.resultsQueryInput}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFormSubmit();
                    } else if (e.key === "Escape") {
                      if (isEdited) {
                        e.stopPropagation();
                        setInputValue(activeQuery);
                      }
                    }
                  }}
                  placeholder="Search doctors, specialties, symptoms..."
                  aria-label="Edit search prompt"
                />
              </div>

              <div className={styles.resultsQueryActions}>
                {isEdited && !isRequerying && (
                  <button
                    type="submit"
                    className={styles.querySendBtn}
                    title="Search with updated prompt"
                    aria-label="Submit search"
                  >
                    <span>Search</span>
                    <ArrowRight size={14} />
                  </button>
                )}
                {isRequerying && (
                  <div className={styles.skeletonLoadingStatus}>
                    <span className={styles.skeletonPulseDot} />
                    <span>Searching…</span>
                  </div>
                )}
              </div>
            </form>

            {/* Dynamic Finding & Analysing Intent Banner */}
            <AnimatePresence>
              {isRequerying && (
                <motion.div
                  key="analyzing-banner"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={styles.analyzingActiveBanner}
                >
                  <span className={styles.analyzingSparkleDot} />
                  <span className={styles.analyzingBannerText}>
                    {requeryStage === "analyzing"
                      ? `Finding results & analysing clinical intent for “${activeQuery}” in ${selectedLocation}…`
                      : `Matching verified specialists, diagnostic slots & care in ${selectedLocation}…`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Red Horizon Divider */}
            <div className={styles.redDivider} />

            {/* 2-Column Result Layout or In-place Skeleton while Re-querying */}
            {requeryStage === "skeleton" ? (
              /* In-Place Skeleton Shimmer while re-querying */
              <div className={styles.resultsSplitLayout} aria-busy="true">
                {/* Left Column Skeleton */}
                <div className={styles.resultsLeftCol}>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 12, marginBottom: 12 }} />
                  <div className={styles.doctorsGrid}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={styles.skeletonDoctorCard}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 48, height: 48, flexShrink: 0 }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "70%", height: 18 }} />
                            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "45%", height: 14, marginTop: 2 }} />
                            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "60%", height: 13, marginTop: 2 }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                          <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 85, height: 13 }} />
                          <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: 48, height: 22, borderRadius: 5 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column Skeleton */}
                <div className={styles.resultsRightCol}>
                  <div className={styles.tertiarySectionBlock}>
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 120, height: 11, marginBottom: 8 }} />
                    <div className={styles.tertiaryListRows}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.skeletonSecondaryCard}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 20, height: 20, borderRadius: 4 }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 115, height: 12 }} />
                              <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 75, height: 10 }} />
                            </div>
                          </div>
                          <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 10, height: 10 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard 2-Column Result Layout */
              <div className={styles.resultsSplitLayout}>
                {/* ── LEFT / PRIMARY COLUMN: Recommended Doctors ── */}
                <div className={styles.resultsLeftCol}>
                  <PrimaryResults
                    doctors={currentResults.doctors}
                    selectedLocation={selectedLocation}
                    proximityMessage={currentResults.proximityMessage}
                    query={activeQuery}
                  />
                </div>

                {/* ── RIGHT / SECONDARY COLUMN: Treatments, Articles & Related Specialties ── */}
                <TertiaryResults
                  treatments={currentResults.treatments}
                  articles={currentResults.articles}
                  relatedSpecialties={currentResults.relatedSpecialties}
                  onSelectSpecialtyTag={onSelectSpecialtyTag}
                />
              </div>
            )}

            {/* ── FULL SIZE Ask Pulse Banner at Bottom (Spanning 100% Width) ── */}
            {results.pulseRecommendationText && (
              <div
                ref={pulseRowRef}
                className={styles.refPulseRow}
                onClick={handleOpenPulse}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleOpenPulse();
                }}
                aria-label="Ask Pulse AI for personalised recommendations"
              >
                <div className={styles.refPulseLeft}>
                  <div className={styles.refPulseIconBox} aria-hidden="true">
                    <PulseAIAvatar size={36} />
                  </div>
                  <div className={styles.refPulseTextWrap}>
                    <div className={styles.refPulseTitleLine}>
                      <span className={styles.refPulseTitle}>
                        Want a more personalised recommendation?
                      </span>
                      <span className={styles.refPulseBadge}>PULSE AI</span>
                    </div>
                    <p className={styles.refPulseSubtext}>
                      Ask clinical questions, describe symptoms, or get tailored specialist recommendations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.refPulseBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPulse();
                  }}
                >
                  <span>Ask Pulse</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

