"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./ClinicalAtAGlanceCard.module.css";

interface ClinicalAtAGlanceCardProps {
  bookingHref?: string;
  secondOpinionHref?: string;
  className?: string;
  theme?: "white" | "dark" | "dynamic";
}

export default function ClinicalAtAGlanceCard({
  bookingHref = "/book-an-appointment",
  secondOpinionHref = "/book-an-appointment?flow=second-opinion",
  className = "",
  theme = "white",
}: ClinicalAtAGlanceCardProps) {
  const themeClass =
    theme === "dynamic"
      ? styles.actionStripDynamic
      : theme === "dark"
      ? styles.actionStripDark
      : styles.actionStripWhite;

  return (
    <div 
      className={`${styles.actionStripContainer} ${themeClass} ${className}`}
      role="region"
      aria-label="Clinical Consultation & Second Opinion Access"
    >
      <div className={styles.labelGroup}>
        <span className={styles.stripBadge}>Clinical Care</span>
        <span className={styles.stripText}>
          Priority OPD consultation, multidisciplinary second opinions &amp; cashless insurance (30+ TPAs).
        </span>
      </div>

      <div className={styles.buttonGroup}>
        <Link
          href={bookingHref}
          className={styles.bookBtn}
          title="Book Doctor Consultation"
        >
          <span>Book Consultation</span>
          <ArrowUpRight size={13} className={styles.btnArrow} />
        </Link>

        <Link
          href={secondOpinionHref}
          className={styles.opinionBtn}
          title="Request a Second Opinion"
        >
          <span>Second Opinion</span>
        </Link>
      </div>
    </div>
  );
}
