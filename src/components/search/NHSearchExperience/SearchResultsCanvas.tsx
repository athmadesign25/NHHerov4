"use client";

import React from "react";
import { Search, X } from "lucide-react";
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
  onClose,
  selectedLocation,
  onSelectLocation,
  onSelectSpecialtyTag,
  onAskPulse,
}: SearchResultsCanvasProps) {
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
          <div className={styles.pulseBadge}>
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

      {/* Query Display Bar: Search Icon + Query + EDIT SEARCH button */}
      <div className={styles.resultsQueryBar}>
        <div className={styles.resultsQueryLeft}>
          <Search size={22} className={styles.resultsQuerySearchIcon} />
          <span className={styles.resultsQueryText}>{query}</span>
        </div>

        <button
          type="button"
          className={styles.editSearchBtn}
          onClick={onEditSearch}
        >
          EDIT SEARCH
        </button>
      </div>

      {/* Red Horizon Divider */}
      <div className={styles.redDivider} />

      {/* Main Search Result Heading (Above Split Layout) */}
      <div className={styles.resultsCategoryHeader}>
        <h2 className={styles.resultsCategoryTitle}>{results.categoryTitle}</h2>
        <div className={styles.resultsCategorySub}>{results.matchCountText}</div>
      </div>

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
