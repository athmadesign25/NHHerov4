"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { SearchResultsData } from "./searchData";
import LocationSelector from "./LocationSelector";
import PrimaryResults from "./PrimaryResults";
import SecondaryResults from "./SecondaryResults";
import TertiaryResults from "./TertiaryResults";

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
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close Button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          {/* Location Selector */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />

          {/* Pulse AI Badge */}
          <div 
            className={styles.pulseBadge}
            onClick={onAskPulse}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onAskPulse?.();
            }}
            style={{ cursor: "pointer" }}
            title="Open Pulse AI clinical assistant"
          >
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
            <span className={styles.pulseText}>Pulse AI</span>
          </div>
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

      {/* 2-Column Weighted Split Layout (Primary: ~65%, Tertiary Right Rail: ~35%) */}
      <div className={styles.resultsSplitLayout}>
        {/* ── LEFT COLUMN: Dominant Primary Results & Secondary Related Care ── */}
        <div className={styles.resultsLeftCol}>
          {/* PRIMARY: Dominant Doctor Cards */}
          <PrimaryResults
            pulseRecommendationText={results.pulseRecommendationText}
            doctors={results.doctors}
            selectedLocation={selectedLocation}
            query={query}
            onAskPulse={onAskPulse}
          />

          {/* SECONDARY: Related Specialties & Care */}
          <SecondaryResults
            relatedSpecialties={results.relatedSpecialties}
            onSelectSpecialtyTag={onSelectSpecialtyTag}
          />
        </div>

        {/* ── RIGHT COLUMN: Tertiary Supporting Results (Vertically aligned with RECOMMENDED DOCTORS) ── */}
        <TertiaryResults
          treatments={results.treatments}
          articles={results.articles}
        />
      </div>
    </div>
  );
}
