"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import styles from "./Design2TopSection.module.css";

export interface Design2TopSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  /** Mirrors global Navbar show/hide (tracked in SearchResultsView). */
  isNavVisible: boolean;
  /** Show the Filters trigger (< 1024px, Doctors tab only). */
  showFiltersButton: boolean;
  activeFiltersCount: number;
  onOpenFilters: () => void;
}

const CITIES = [
  { value: "All", label: "All Locations" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Guwahati", label: "Guwahati" },
  { value: "Dharwad", label: "Dharwad" },
  { value: "Shimoga", label: "Shimoga" },
  { value: "Ahmedabad", label: "Ahmedabad" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Kolar", label: "Kolar" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Raipur", label: "Raipur" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Davangere", label: "Davangere" },
  { value: "Barasat", label: "Barasat" },
  { value: "Jamshedpur", label: "Jamshedpur" },
  { value: "Gurugram", label: "Gurugram" },
  { value: "Howrah", label: "Howrah" },
  { value: "Delhi", label: "Delhi" },
  { value: "Mysore", label: "Mysore" },
  { value: "Hosur", label: "Hosur" },
];

export default function Design2TopSection({
  query,
  onQueryChange,
  onSubmit,
  location,
  onLocationChange,
  isNavVisible,
  showFiltersButton,
  activeFiltersCount,
  onOpenFilters,
}: Design2TopSectionProps) {
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>(0);
  const compact = !isNavVisible;

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

        <div className={styles.banner}>
          <div className={styles.container}>
            <form role="search" onSubmit={onSubmit} className={styles.capsuleForm}>
              {/* Unified Booking Capsule */}
              <div className={styles.capsule}>
                {/* Search input field */}
                <div className={styles.searchSegment}>
                  <Search size={18} className={styles.iconMuted} aria-hidden />
                  <label htmlFor="d2-search-input" className={styles.srOnly}>
                    Search doctor by name, specialty or symptom
                  </label>
                  <input
                    ref={inputRef}
                    id="d2-search-input"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search doctor, specialty or symptom…"
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
                      <X size={15} aria-hidden />
                    </button>
                  )}
                </div>

                <div className={styles.divider} aria-hidden />

                {/* Location selector segment */}
                <div className={styles.locationSegment}>
                  <MapPin size={16} className={styles.iconPrimary} aria-hidden />
                  <select
                    id="d2-location-select"
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className={styles.locationSelect}
                    aria-label="Filter doctors by city"
                  >
                    {CITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.iconChevron} aria-hidden />
                </div>

                {/* Action button */}
                <button type="submit" className={styles.submitBtn} aria-label="Find available doctors">
                  <Search size={16} aria-hidden />
                  <span className={styles.submitBtnText}>Find Doctors</span>
                </button>
              </div>

              {/* Mobile/Tablet filter trigger (< 1024px) */}
              {showFiltersButton && (
                <button
                  id="d2-filters-trigger"
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
    </>
  );
}
