"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, X, RotateCcw } from "lucide-react";
import styles from "./Design2BookingControls.module.css";

export interface ActiveFilterItem {
  label: string;
  remove: () => void;
}

export interface Design2BookingControlsProps {
  consultationType: "Hospital Visit" | "Video Consultation";
  onConsultationTypeChange: (type: "Hospital Visit" | "Video Consultation") => void;
  selectedAvailability: string[];
  onToggleAvailability: (val: string) => void;
  isEarliestSlotActive: boolean;
  onToggleEarliestSlot: () => void;
  activeFilterItems: ActiveFilterItem[];
  location: string;
  totalDoctorsCount: number;
  hasActiveFilters: boolean;
  onResetAllFilters: () => void;
}

export default function Design2BookingControls({
  consultationType,
  onConsultationTypeChange,
  selectedAvailability,
  onToggleAvailability,
  isEarliestSlotActive,
  onToggleEarliestSlot,
  activeFilterItems,
  location,
  totalDoctorsCount,
  hasActiveFilters,
  onResetAllFilters,
}: Design2BookingControlsProps) {
  const isHospital = consultationType === "Hospital Visit";
  const isToday = selectedAvailability.includes("Available Today");
  const isTomorrow = selectedAvailability.includes("Available Tomorrow");

  return (
    <div className={styles.wrapper}>
      {/* Primary Booking Controls Bar */}
      <div className={styles.bar}>
        {/* Left: Consultation Type Toggle */}
        <div className={styles.toggleTrack} role="radiogroup" aria-label="Consultation mode">
          <button
            type="button"
            role="radio"
            aria-checked={isHospital}
            className={`${styles.toggleBtn} ${isHospital ? styles.toggleBtnActive : ""}`}
            onClick={() => onConsultationTypeChange("Hospital Visit")}
          >
            {isHospital && (
              <motion.div
                layoutId="d2ActiveConsultation"
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
                layoutId="d2ActiveConsultation"
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

        {/* Right: Smart Availability & Urgency Levers (Replaces Sort dropdown) */}
        <div className={styles.urgencyCluster} role="group" aria-label="Availability and slot filters">
          {/* Earliest Slot quick sorter */}
          <button
            type="button"
            aria-pressed={isEarliestSlotActive}
            className={`${styles.urgencyPill} ${styles.earliestPill} ${isEarliestSlotActive ? styles.earliestActive : ""}`}
            onClick={onToggleEarliestSlot}
            title="Sort doctors by nearest available appointment slot"
          >
            <Zap size={13} className={styles.zapIcon} aria-hidden />
            <span>Earliest Slot</span>
          </button>

          {/* Today Filter */}
          <button
            type="button"
            aria-pressed={isToday}
            className={`${styles.urgencyPill} ${isToday ? styles.todayActive : ""}`}
            onClick={() => onToggleAvailability("Available Today")}
          >
            Today
          </button>

          {/* Tomorrow Filter */}
          <button
            type="button"
            aria-pressed={isTomorrow}
            className={`${styles.urgencyPill} ${isTomorrow ? styles.tomorrowActive : ""}`}
            onClick={() => onToggleAvailability("Available Tomorrow")}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Dynamic Active Filter Chips */}
      {activeFilterItems.length > 0 && (
        <div className={styles.activeFiltersRow}>
          <span className={styles.activeFiltersLabel}>Active:</span>
          {activeFilterItems.map((f, idx) => (
            <span key={idx} className={styles.filterChip}>
              <span>{f.label}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={f.remove}
                aria-label={`Remove filter: ${f.label}`}
              >
                <X size={12} aria-hidden />
              </button>
            </span>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={onResetAllFilters}
            >
              <RotateCcw size={11} aria-hidden />
              Reset all
            </button>
          )}
        </div>
      )}

      {/* Results Discovery Summary — Minimal clean text */}
      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <strong className={styles.countText}>
            {totalDoctorsCount} {totalDoctorsCount === 1 ? "Doctor" : "Doctors"}
          </strong>{" "}
          available for{" "}
          <strong>{isHospital ? "hospital visits" : "video consultations"}</strong>
          {" in "}
          <strong>{location === "All" ? "all locations" : location}</strong>
          {isEarliestSlotActive && (
            <span className={styles.earliestTag}> · sorted by earliest slot</span>
          )}
        </p>
      </div>
    </div>
  );
}
