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

function formatExperienceText(exp: string): string {
  if (!exp) return "10+ yrs of experience";
  const cleaned = exp.replace(/years?(\s+experience)?/gi, "yrs").trim();
  return `${cleaned} of experience`;
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

      {/* 2-Column Responsive Grid: Doctor Cards with radius 8 and bottom action */}
      <div className={styles.refDoctorsGrid}>
        {doctors.map((doc) => {
          // If name is long (> 18 chars), name wraps to 2 lines and hospital truncates to 1 line
          // If name is short, name is 1 line and hospital can wrap to 2 lines
          const isLongName = doc.name.length > 18;

          return (
            <div key={doc.id} className={styles.refDoctorCard}>
              {/* Full background doctor photo spanning entire card */}
              <img
                src={doc.image}
                alt={doc.name}
                className={styles.refDocFullImage}
                draggable={false}
              />

              {/* Gradient overlay darkening smoothly towards the bottom */}
              <div className={styles.refDocFullGradient} />

              {/* Doctor Information directly over the gradient overlay at the bottom */}
              <div className={styles.refDocOverlayContent}>
                <div className={styles.refDocBottomFlex}>
                  {/* Left Column: Name, Specialty, Experience, Hospital */}
                  <div className={styles.refDocTextCol}>
                    <h3 
                      className={`${styles.refDocName} ${isLongName ? styles.refDocNameMultiLine : styles.refDocNameSingleLine}`} 
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>

                    <div className={styles.refDocSpecialty} title={doc.speciality}>
                      {doc.speciality}
                    </div>

                    <div className={styles.refDocExpRow}>
                      <Briefcase size={12} className={styles.refDocExpIcon} />
                      <span>{formatExperienceText(doc.experience)}</span>
                    </div>

                    <div 
                      className={`${styles.refDocHospital} ${isLongName ? styles.refDocHospitalSingleLine : styles.refDocHospitalTwoLines}`} 
                      title={doc.hospital}
                    >
                      {doc.hospital}
                    </div>
                  </div>

                  {/* Right Side: White Book Button with radius 8 */}
                  <Link
                    href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                    className={styles.refBookBtnWhite}
                  >
                    Book
                  </Link>
                </div>
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
