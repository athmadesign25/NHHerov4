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
                
                <div className={styles.doctorExpText}>{doc.experience}</div>

                <div className={styles.doctorActionRow}>
                  <Link
                    href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                    className={styles.bookApptBtn}
                  >
                    <span>Book Appointment</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
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
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Optional Pulse AI Nudge (Below doctors, non-intrusive) */}
      {pulseRecommendationText && (
        <div className={styles.pulseNudgeRow}>
          <span className={styles.pulseNudgeText}>{pulseRecommendationText}</span>
          <button
            type="button"
            className={styles.pulseNudgeBtn}
            onClick={onAskPulse}
          >
            <span>Ask Pulse</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
