"use client";

import React from "react";
import { Search, X } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";
import PulseAnalyzingCentral from "./PulseAnalyzingCentral";

interface SkeletonResultsCanvasProps {
  query: string;
  selectedLocation?: string;
  onClose?: () => void;
  onSelectLocation?: (location: string) => void;
}

export default function SkeletonResultsCanvas({
  query,
  selectedLocation = "Bangalore",
  onClose,
  onSelectLocation,
}: SkeletonResultsCanvasProps) {
  const displayQuery = query?.trim() || "Finding the right care for you…";

  return (
    <div
      className={styles.resultsContainer}
      aria-busy="true"
      aria-label="Finding results and analysing clinical intelligence"
    >
      {/* Top Header Row: Location Pill + Close Button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation || (() => {})}
          />
        </div>
        {onClose && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Clean Query Display Bar */}
      <div className={styles.resultsQueryBar}>
        <div className={styles.resultsQueryLeft}>
          <Search size={22} className={styles.resultsQuerySearchIcon} />
          <span className={styles.resultsQueryText}>{displayQuery}</span>
        </div>
      </div>

      {/* Red Horizon Divider */}
      <div className={styles.redDivider} />

      {/* ── Central Results Stage: Pulse AI Clinical Intelligence Analyzing View ── */}
      <div className={styles.canvasStage} style={{ overflow: "hidden" }}>
        <PulseAnalyzingCentral
          query={displayQuery}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
}
