"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Sparkles } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";

interface PrimaryResultsProps {
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  selectedLocation: string;
  proximityMessage?: string;
  query: string;
  onAskPulse?: () => void;
  isPulseExpanded?: boolean;
  onTogglePulseExpand?: (expanded: boolean) => void;
  hidePulse?: boolean;
}

export default function PrimaryResults({
  pulseRecommendationText,
  doctors,
  selectedLocation,
  proximityMessage,
  query,
  onAskPulse,
  onTogglePulseExpand,
  hidePulse = false,
}: PrimaryResultsProps) {
  return (
    <div className={styles.primaryResultsSection}>
      {/* Header: Title */}
      <div className={styles.primaryHeaderRow}>
        <span className={styles.sectionEyebrowTitle}>
          RECOMMENDED DOCTORS
        </span>
      </div>

          {/* 2 × 2 Grid: Prominent Image-Led Doctor Cards */}
          <div className={styles.refDoctorsGrid}>
            {doctors.slice(0, 4).map((doc) => {
              return (
                <div key={doc.id} className={styles.refDoctorCard}>
                  {/* Full background doctor photo spanning entire card */}
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className={styles.refDocFullImage}
                  />

                  {/* Gradient overlay darkening smoothly towards the bottom */}
                  <div className={styles.refDocFullGradient} />

                  {/* Doctor Information directly over the gradient overlay at the bottom */}
                  <div className={styles.refDocOverlayContent}>
                    <h3 className={styles.refDocName} title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className={styles.refDocSpecialty} title={doc.speciality}>
                      {doc.speciality}
                    </div>
                    <div className={styles.refDocHospital} title={doc.hospital}>
                      {doc.hospital}
                    </div>

                    {/* Experience Info */}
                    <div className={styles.refDocExpRow}>
                      <Briefcase size={12} className={styles.refDocExpIcon} />
                      <span>{doc.experience}</span>
                    </div>

                    {/* Book CTA Button */}
                    <Link
                      href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                      className={styles.refBookBtn}
                    >
                      <span>Book →</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean View all doctors Link */}
          <div className={styles.refViewAllRow}>
            <Link
              href={`/doctors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedLocation)}`}
              className={styles.refViewAllLink}
            >
              <span>View all doctors</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Larger Horizontal Pulse AI Recommendation Row matching Figma */}
          {!hidePulse && pulseRecommendationText && (
            <div
              className={styles.refPulseRow}
              onClick={() => onTogglePulseExpand?.(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onTogglePulseExpand?.(true);
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
                  onTogglePulseExpand?.(true);
                }}
              >
                <span>Ask Pulse →</span>
              </button>
            </div>
          )}
    </div>
  );
}

