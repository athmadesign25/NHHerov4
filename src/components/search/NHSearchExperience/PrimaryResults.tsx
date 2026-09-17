"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Award } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";

interface PrimaryResultsProps {
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  selectedLocation: string;
  query: string;
  onAskPulse?: () => void;
}

export default function PrimaryResults({
  pulseRecommendationText,
  doctors,
  selectedLocation,
  query,
  onAskPulse,
}: PrimaryResultsProps) {
  return (
    <div className={styles.primaryResultsSection}>
      {/* RECOMMENDED DOCTORS label directly above the doctor cards */}
      <div className={styles.recommendedSectionLabel}>RECOMMENDED DOCTORS</div>

      {/* Clean Doctor Cards 2-Column Grid */}
      <div className={styles.doctorsGrid}>
        {doctors.slice(0, 4).map((doc) => (
          <div key={doc.id} className={styles.doctorCard}>
            <div className={styles.doctorCardBody}>
              <img
                src={doc.image}
                alt={doc.name}
                className={styles.doctorAvatar}
              />
              <div className={styles.doctorMeta}>
                <div className={styles.doctorName}>{doc.name}</div>
                <div className={styles.doctorSpecialty}>{doc.speciality}</div>
                <div className={styles.doctorHospital}>{doc.hospital}</div>
              </div>
            </div>

            <div className={styles.doctorCardFooter}>
              <span className={styles.doctorExpText}>{doc.experience}</span>
              <Link
                href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                className={styles.bookApptBtn}
              >
                <span>{doc.consultationType === "video" ? "Book Video" : "Book"}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Text Link for View All Doctors */}
      <div className={styles.viewAllDoctorsRow}>
        <Link
          href={`/doctors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedLocation)}`}
          className={styles.viewAllDoctorsTextLink}
        >
          <span>View all doctors</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Pulse AI Nudge Box — Signature entry point for clinical questions with animated gradient border */}
      {pulseRecommendationText && (
        <div 
          className={styles.pulseNudgeBox} 
          onClick={onAskPulse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAskPulse?.();
          }}
          aria-label="Ask Pulse AI for personalised recommendations and clinical guidance"
        >
          <div className={styles.pulseNudgeLeft}>
            <div className={styles.pulseNudgeIconWrap} aria-hidden>
              <div className={styles.pulseBars}>
                <span className={styles.pulseBar1} />
                <span className={styles.pulseBar2} />
                <span className={styles.pulseBar3} />
              </div>
            </div>
            <div className={styles.pulseNudgeTextWrap}>
              <div className={styles.pulseNudgeTitleRow}>
                <span className={styles.pulseNudgeText}>{pulseRecommendationText}</span>
                <span className={styles.pulseNudgeBadge}>Pulse AI</span>
              </div>
              <div className={styles.pulseNudgeSubtext}>
                Ask clinical questions, describe symptoms, or get tailored specialist recommendations.
              </div>
            </div>
          </div>

          <div className={styles.pulseNudgeAction}>
            <button
              type="button"
              className={styles.pulseNudgeBtn}
              onClick={(e) => {
                e.stopPropagation();
                onAskPulse?.();
              }}
            >
              <span>Ask Pulse</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
