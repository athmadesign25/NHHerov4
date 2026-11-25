"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./ClinicalAtAGlanceCard.module.css";

interface ClinicalAtAGlanceCardProps {
  bookingHref?: string;
  secondOpinionHref?: string;
  className?: string;
  theme?: string;
}

export default function ClinicalAtAGlanceCard({
  bookingHref = "/book-an-appointment",
  className = "",
}: ClinicalAtAGlanceCardProps) {
  return (
    <div 
      className={`${styles.actionStripContainer} ${className}`}
      role="region"
      aria-label="Clinical Care & Priority Consultations"
    >
      <div className={styles.labelGroup}>
        <h4 className={styles.bannerTitle}>Clinical Care</h4>
        <span className={styles.stripDivider} aria-hidden="true">&bull;</span>
        <p className={styles.stripText}>
          Priority OPD consultations, multidisciplinary second opinions &amp; cashless hospital admission (30+ TPAs).
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <Link
          href={bookingHref}
          className={styles.checkConsultBtn}
          title="Check Specialist Consultations"
        >
          <span>Check Consultations</span>
          <ArrowUpRight size={13} className={styles.btnArrow} />
        </Link>
      </div>
    </div>
  );
}
