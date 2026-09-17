"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, ChevronDown } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { SearchResultsData, NH_LOCATIONS } from "./searchData";
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
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close location menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.resultsContainer}>
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close Button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          <div ref={locationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.locationPill}
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              aria-expanded={isLocationOpen}
              aria-label={`Location: ${selectedLocation}`}
            >
              <MapPin size={14} color="#FF6B6B" />
              <span>{selectedLocation}</span>
              <ChevronDown
                size={13}
                style={{
                  transform: isLocationOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {isLocationOpen && (
              <div className={styles.locationMenu}>
                {NH_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`${styles.locationMenuItem} ${
                      loc === selectedLocation ? styles.locationMenuItemSelected : ""
                    }`}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsLocationOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

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
