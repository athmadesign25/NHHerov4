"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Filter, MapPin, Search, X } from "lucide-react";
import { NH_CITIES } from "@/lib/searchService";
import DoctorSearchHint from "./DoctorSearchHint";
import DoctorRefinementRow from "./DoctorRefinementRow";
import chipStyles from "./DoctorControlChip.module.css";
import refinementStyles from "./Design16Refinements.module.css";
import styles from "./DoctorSearchTop.module.css";

interface Props {
  search: string;
  onSearch: (query: string) => void;
  location: string;
  onLocation: (location: string) => void;
  navVisible?: boolean;
  filterCount?: number;
  onOpenFilters?: () => void;
  children?: ReactNode;
}

export default function DoctorSearchTop({
  search,
  onSearch,
  location,
  onLocation,
  navVisible = true,
  filterCount = 0,
  onOpenFilters,
  children,
}: Props) {
  const [hintsPaused, setHintsPaused] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div
      className={`${styles.searchBar} ${!navVisible ? styles.navHidden : ""}`}
      data-d3-search-bar="true"
      data-d3-ui="true"
    >
      <div className={`${styles.container} ${styles.toolbarContent}`}>
        <div className={`${styles.searchRow} ${styles.locationFirst} ${styles.compactMobile}`}>
          <div className={styles.combinedSearch}>
            <label className={`${styles.location} ${styles.leadingLocation}`}>
              <MapPin size={16} aria-hidden="true" />
              <span className={styles.srOnly}>Search location</span>
              <select
                data-doctor-location="true"
                aria-busy="false"
                aria-describedby="d3-location-status d3-refinement-help"
                value={location}
                onChange={(e) => onLocation(e.target.value)}
              >
                <option value="All">All locations</option>
                {NH_CITIES.map((city) => (
                  <option key={city.id} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </label>

            <form
              role="search"
              aria-label="Find a doctor"
              className={styles.form}
              onSubmit={submit}
            >
              <div className={styles.searchField}>
                <label className={styles.srOnly} htmlFor="d3-search">
                  Search doctors by name, speciality or hospital
                </label>
                <input
                  id="d3-search"
                  autoComplete="off"
                  enterKeyHint="search"
                  placeholder=" "
                  type="search"
                  value={search}
                  onFocus={() => setHintsPaused(true)}
                  onBlur={() => setHintsPaused(false)}
                  onChange={(event) => onSearch(event.target.value)}
                />
                <DoctorSearchHint active={!search} paused={hintsPaused} />
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Clear search"
                  disabled={!search}
                  aria-hidden={!search}
                  onClick={() => {
                    onSearch("");
                    document.getElementById("d3-search")?.focus({ preventScroll: true });
                  }}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <button
                type="submit"
                className={styles.submit}
                aria-label="Search and show doctor results"
                title="Search"
              >
                <Search size={20} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <p
          id="d3-location-status"
          className={styles.srOnly}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />

        <div
          className={`${refinementStyles.layout} ${refinementStyles.compactMobile} ${refinementStyles.videoSmartFilter}`}
        >
          <div className={refinementStyles.shortcuts}>
            <div className={refinementStyles.shortcutBar}>
              {onOpenFilters && (
                <button
                  type="button"
                  className={`${chipStyles.chip} ${refinementStyles.filterButton}`}
                  aria-haspopup="dialog"
                  title="Filters"
                  aria-label="Open filters"
                  onClick={onOpenFilters}
                >
                  <Filter size={18} aria-hidden="true" />
                  {filterCount > 0 && (
                    <span className={refinementStyles.filterCount} aria-hidden="true">
                      {filterCount}
                    </span>
                  )}
                </button>
              )}

              <DoctorRefinementRow>{children}</DoctorRefinementRow>
            </div>
            <div className={refinementStyles.context} />
          </div>
          <p
            className={refinementStyles.srOnly}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          />
        </div>
      </div>
    </div>
  );
}
