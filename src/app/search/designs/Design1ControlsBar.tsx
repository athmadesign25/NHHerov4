"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpDown, MapPin, ChevronDown, X, RotateCcw } from "lucide-react";
import styles from "./Design1ControlsBar.module.css";

export interface ActiveFilterItem {
  label: string;
  remove: () => void;
}

export interface Design1ControlsBarProps {
  consultationType: "Hospital Visit" | "Video Consultation";
  onConsultationTypeChange: (type: "Hospital Visit" | "Video Consultation") => void;
  selectedAvailability: string[];
  onToggleAvailability: (val: string) => void;
  activeFilterItems: ActiveFilterItem[];
  sortBy: "relevance" | "experience" | "fee_asc" | "fee_desc";
  onSortByChange: (sort: "relevance" | "experience" | "fee_asc" | "fee_desc") => void;
  location: string;
  onLocationChange: (loc: string) => void;
  totalDoctorsCount: number;
  hasActiveFilters: boolean;
  onResetAllFilters: () => void;
  query?: string;
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

export default function Design1ControlsBar({
  consultationType,
  onConsultationTypeChange,
  selectedAvailability,
  onToggleAvailability,
  activeFilterItems,
  sortBy,
  onSortByChange,
  location,
  onLocationChange,
  totalDoctorsCount,
  hasActiveFilters,
  onResetAllFilters,
  query,
}: Design1ControlsBarProps) {
  const isHospital = consultationType === "Hospital Visit";
  const isToday = selectedAvailability.includes("Available Today");
  const isTomorrow = selectedAvailability.includes("Available Tomorrow");

  return (
    <div className={styles.wrapper}>
      {/* Primary Bar: segmented toggle + quick pills + sort & location */}
      <div className={styles.bar}>
        {/* Left cluster: Consultation toggle & availability pills */}
        <div className={styles.leftCluster}>
          {/* Segmented consultation switch */}
          <div className={styles.toggleTrack} role="radiogroup" aria-label="Consultation type">
            <button
              type="button"
              role="radio"
              aria-checked={isHospital}
              className={`${styles.toggleBtn} ${isHospital ? styles.toggleBtnActive : ""}`}
              onClick={() => onConsultationTypeChange("Hospital Visit")}
            >
              {isHospital && (
                <motion.div
                  layoutId="d1ActiveConsultation"
                  className={styles.toggleThumb}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className={styles.toggleContent}>
                <Image
                  src="/Appointment/Hospital_visit.svg"
                  alt=""
                  width={15}
                  height={15}
                  className={`${styles.toggleIcon} ${!isHospital ? styles.toggleIconMuted : ""}`}
                />
                Hospital Visit
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={!isHospital}
              className={`${styles.toggleBtn} ${!isHospital ? styles.toggleBtnActive : ""}`}
              onClick={() => onConsultationTypeChange("Video Consultation")}
            >
              {!isHospital && (
                <motion.div
                  layoutId="d1ActiveConsultation"
                  className={styles.toggleThumb}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className={styles.toggleContent}>
                <Image
                  src="/Appointment/Video_consultation.svg"
                  alt=""
                  width={15}
                  height={15}
                  className={`${styles.toggleIcon} ${isHospital ? styles.toggleIconMuted : ""}`}
                />
                Video Consult
              </span>
            </button>
          </div>

          {/* Quick Date Pills */}
          <div className={styles.quickPills} role="group" aria-label="Quick availability filters">
            <button
              type="button"
              aria-pressed={isToday}
              className={`${styles.quickPill} ${isToday ? styles.quickPillActive : ""}`}
              onClick={() => onToggleAvailability("Available Today")}
            >
              Today
            </button>
            <button
              type="button"
              aria-pressed={isTomorrow}
              className={`${styles.quickPill} ${isTomorrow ? styles.quickPillActive : ""}`}
              onClick={() => onToggleAvailability("Available Tomorrow")}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Right cluster: Sort dropdown and Location dropdown */}
        <div className={styles.rightCluster}>
          {/* Sort pill */}
          <div className={styles.controlPill}>
            <ArrowUpDown size={14} className={styles.controlIcon} aria-hidden />
            <select
              id="d1-sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className={styles.select}
              aria-label="Sort doctors"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="experience">Experience: High to Low</option>
              <option value="fee_asc">Fee: Low to High</option>
              <option value="fee_desc">Fee: High to Low</option>
            </select>
            <ChevronDown size={14} className={styles.chevronIcon} aria-hidden />
          </div>

          {/* Location pill */}
          <div className={styles.controlPill}>
            <MapPin size={14} className={styles.controlIcon} aria-hidden />
            <select
              id="d1-location-select"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className={styles.select}
              aria-label="Filter by location"
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevronIcon} aria-hidden />
          </div>
        </div>
      </div>

      {/* Active Dynamic Filter Chips Row (if any active filters exist) */}
      {activeFilterItems.length > 0 && (
        <div className={styles.activeFiltersRow}>
          <span className={styles.activeFiltersPrefix}>Active filters:</span>
          {activeFilterItems.map((f, idx) => (
            <span key={idx} className={styles.activeChip}>
              <span>{f.label}</span>
              <button
                type="button"
                className={styles.activeChipRemove}
                onClick={f.remove}
                aria-label={`Remove filter: ${f.label}`}
              >
                <X size={13} aria-hidden />
              </button>
            </span>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetAllBtn}
              onClick={onResetAllFilters}
            >
              <RotateCcw size={11} aria-hidden />
              Reset all
            </button>
          )}
        </div>
      )}

      {/* Results Summary Bar — Minimal text layout without pill badge */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryLeft}>
          <span className={styles.countText}>
            {totalDoctorsCount} {totalDoctorsCount === 1 ? "Doctor" : "Doctors"}
          </span>
          <span className={styles.summaryText}>
            available for{" "}
            <strong>
              {isHospital ? "hospital visits" : "video consultations"}
            </strong>{" "}
            in{" "}
            <strong>
              {location === "All" ? "all locations" : location}
            </strong>
            {query?.trim() ? (
              <>
                {" "}for &ldquo;<strong>{query.trim()}</strong>&rdquo;
              </>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}
