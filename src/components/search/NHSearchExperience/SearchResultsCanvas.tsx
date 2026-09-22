"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NHSearchExperience.module.css";
import { SearchResultsData } from "./searchData";
import LocationSelector from "./LocationSelector";
import PrimaryResults from "./PrimaryResults";
import TertiaryResults from "./TertiaryResults";
import PulseAIView from "./PulseAIView";

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
  const [isPulseExpanded, setIsPulseExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize local input value when incoming query prop changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Check if user has modified the prompt
  const isEdited = inputValue.trim() !== query.trim() && inputValue.trim().length > 0;

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputValue.trim();
    if (clean) {
      if (onSubmit) {
        onSubmit(clean);
      } else {
        onEditSearch();
      }
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
            onSelectLocation={onSelectLocation}
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

      {/* ── Seamless Horizontal Slide Transition: RESULTS STATE ↔ PULSE STATE ── */}
      <AnimatePresence mode="wait">
        {isPulseExpanded ? (
          /* ── PULSE STATE: Focused Assistant View (Figma Reference) ── */
          <motion.div
            key="pulse-view"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%" }}
          >
            <PulseAIView
              query={query}
              selectedLocation={selectedLocation}
              doctors={results.doctors}
              onBack={() => setIsPulseExpanded(false)}
            />
          </motion.div>
        ) : (
          /* ── RESULTS STATE: Standard 2-Column Search Results ── */
          <motion.div
            key="standard-results"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%" }}
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
                        setInputValue(query);
                      }
                    }
                  }}
                  placeholder="Search doctors, specialties, symptoms..."
                  aria-label="Edit search prompt"
                />
              </div>

              <div className={styles.resultsQueryActions}>
                {isEdited && (
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
              </div>
            </form>

            {/* Red Horizon Divider */}
            <div className={styles.redDivider} />

            {/* 2-Column Result Layout: Primary vs Secondary/Tertiary Editorial */}
            <div className={styles.resultsSplitLayout}>
              {/* ── LEFT / PRIMARY COLUMN: Recommended Doctors ── */}
              <div className={styles.resultsLeftCol}>
                <PrimaryResults
                  doctors={results.doctors}
                  selectedLocation={selectedLocation}
                  proximityMessage={results.proximityMessage}
                  query={query}
                />
              </div>

              {/* ── RIGHT / SECONDARY COLUMN: Treatments, Articles & Related Specialties ── */}
              <TertiaryResults
                treatments={results.treatments}
                articles={results.articles}
                relatedSpecialties={results.relatedSpecialties}
                onSelectSpecialtyTag={onSelectSpecialtyTag}
              />
            </div>

            {/* ── FULL SIZE Ask Pulse Banner at Bottom (Spanning 100% Width) ── */}
            {results.pulseRecommendationText && (
              <div
                className={styles.refPulseRow}
                onClick={() => setIsPulseExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setIsPulseExpanded(true);
                }}
                aria-label="Ask Pulse AI for personalised recommendations"
              >
                <div className={styles.refPulseLeft}>
                  <div className={styles.refPulseIconBox} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
                      <circle cx="18.5" cy="8.5" r="1.8" fill="currentColor" />
                      <circle cx="5.5" cy="8.5" r="1.8" fill="currentColor" />
                      <circle cx="18.5" cy="15.5" r="1.8" fill="currentColor" />
                      <circle cx="5.5" cy="15.5" r="1.8" fill="currentColor" />
                      <line x1="9.6" y1="10.4" x2="7" y2="9.4" />
                      <line x1="14.4" y1="10.4" x2="17" y2="9.4" />
                      <line x1="9.6" y1="13.6" x2="7" y2="14.6" />
                      <line x1="14.4" y1="13.6" x2="17" y2="14.6" />
                    </svg>
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
                    setIsPulseExpanded(true);
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
  );
}

