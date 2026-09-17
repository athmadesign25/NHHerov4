"use client";

import React from "react";
import Link from "next/link";
import styles from "./NHSearchExperience.module.css";

interface SecondaryResultsProps {
  relatedSpecialties: string[];
  onSelectSpecialtyTag?: (tag: string) => void;
}

export default function SecondaryResults({
  relatedSpecialties,
  onSelectSpecialtyTag,
}: SecondaryResultsProps) {
  return (
    <div className={styles.relatedSpecialtiesSection}>
      <div className={styles.relatedSectionHeader}>
        <span className={styles.relatedSectionTitle}>RELATED SPECIALTIES & CARE</span>
      </div>

      <div className={styles.relatedTagsGroup}>
        {relatedSpecialties.map((spec) => (
          <button
            key={spec}
            type="button"
            className={styles.specPillTag}
            onClick={() => onSelectSpecialtyTag?.(spec)}
          >
            {spec}
          </button>
        ))}
        <Link href="/specialities" className={styles.viewAllSpecLink}>
          View all →
        </Link>
      </div>
    </div>
  );
}
