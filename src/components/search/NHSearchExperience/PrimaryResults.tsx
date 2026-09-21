"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";

interface PrimaryResultsProps {
  doctors: DoctorCardData[];
  selectedLocation: string;
  proximityMessage?: string;
  query: string;
  pulseRecommendationText?: string;
  onAskPulse?: () => void;
  isPulseExpanded?: boolean;
  onTogglePulseExpand?: (expanded: boolean) => void;
  hidePulse?: boolean;
}

function formatExperience(exp: string): string {
  if (!exp) return "10+ yrs";
  return exp.replace(/years?(\s+experience)?/gi, "yrs").trim();
}

export default function PrimaryResults({
  doctors,
  selectedLocation,
  query,
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
              {/* Top-left Experience Badge */}
              <div className={styles.refDocExpBadge}>
                <Briefcase size={11} className={styles.refDocExpBadgeIcon} />
                <span>{formatExperience(doc.experience)}</span>
              </div>

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

                {/* Book CTA Button */}
                <Link
                  href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                  className={styles.refBookBtn}
                >
                  <span>Book</span>
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
    </div>
  );
}
