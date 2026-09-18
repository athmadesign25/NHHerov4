"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Award } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";
import InlinePulseAICard from "./InlinePulseAICard";

interface PrimaryResultsProps {
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  selectedLocation: string;
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
  query,
  onAskPulse,
  isPulseExpanded: controlledExpanded,
  onTogglePulseExpand,
  hidePulse = false,
}: PrimaryResultsProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggleExpand = (val: boolean) => {
    setInternalExpanded(val);
    onTogglePulseExpand?.(val);
  };

  return (
    <div className={styles.primaryResultsSection}>
      {/* If Pulse AI is expanded, show Pulse AI front-and-center */}
      {!hidePulse && pulseRecommendationText && isExpanded && (
        <InlinePulseAICard
          pulseRecommendationText={pulseRecommendationText}
          query={query}
          selectedLocation={selectedLocation}
          doctors={doctors}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
      )}

      {/* When Pulse AI is NOT expanded (or in standard view), show standard recommended doctors */}
      {(!isExpanded || hidePulse) && (
        <>
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
        </>
      )}

      {/* When Pulse AI is collapsed, show the compact nudge bar at the bottom */}
      {!hidePulse && pulseRecommendationText && !isExpanded && (
        <InlinePulseAICard
          pulseRecommendationText={pulseRecommendationText}
          query={query}
          selectedLocation={selectedLocation}
          doctors={doctors}
          isExpanded={false}
          onToggleExpand={handleToggleExpand}
        />
      )}
    </div>
  );
}
