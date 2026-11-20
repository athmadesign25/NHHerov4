"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Clock, 
  FileCheck2, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  Calculator
} from "lucide-react";
import styles from "./ClinicalAtAGlanceCard.module.css";

interface ClinicalAtAGlanceCardProps {
  title: string;
  speciality?: string;
  bookingHref?: string;
  secondOpinionHref?: string;
  insuranceHref?: string;
  turnaroundDays?: string;
  insurersCount?: string;
  hospitalsCount?: string;
  className?: string;
}

export default function ClinicalAtAGlanceCard({
  title,
  speciality = "Specialised Surgical Care",
  bookingHref = "/book-an-appointment",
  secondOpinionHref = "/book-an-appointment?flow=second-opinion",
  insuranceHref = "#insurance-and-cost",
  turnaroundDays = "24–48 hrs",
  insurersCount = "30+",
  hospitalsCount = "21+",
  className = "",
}: ClinicalAtAGlanceCardProps) {
  return (
    <section 
      className={`${styles.cardContainer} ${className}`}
      aria-label={`${title} Care Pathway & Quick Access`}
    >
      {/* Top Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.eyebrowBadge}>
          <Sparkles size={12} className={styles.sparkleIcon} />
          <span>Clinical Care Pathway · At a Glance</span>
        </div>
        <span className={styles.specialityLabel}>{speciality}</span>
      </div>

      {/* Main Title & Lead Text */}
      <div className={styles.contentRow}>
        <div className={styles.titleColumn}>
          <h3 className={styles.cardHeading}>
            Plan Your {title} with Leading Narayana Specialists
          </h3>
          <p className={styles.cardDescription}>
            Direct access to accredited quaternary hospitals, transparent surgery packages, 
            cashless insurance processing, and comprehensive second opinions by our senior clinical board.
          </p>
        </div>
      </div>

      {/* 3 Pillars Grid (Reassurance Parameters) */}
      <div className={styles.pillarsGrid}>
        <div className={styles.pillarItem}>
          <div className={styles.pillarIconWrap}>
            <Clock size={16} />
          </div>
          <div className={styles.pillarTextGroup}>
            <strong className={styles.pillarTitle}>Priority OPD Scheduling</strong>
            <span className={styles.pillarDesc}>
              Confirmed surgeon consultation within {turnaroundDays}
            </span>
          </div>
        </div>

        <div className={styles.pillarItem}>
          <div className={styles.pillarIconWrap}>
            <ShieldCheck size={16} />
          </div>
          <div className={styles.pillarTextGroup}>
            <strong className={styles.pillarTitle}>{insurersCount} Insurers & TPAs</strong>
            <span className={styles.pillarDesc}>
              CGHS, ECHS, Ayushman & private cashless approvals
            </span>
          </div>
        </div>

        <div className={styles.pillarItem}>
          <div className={styles.pillarIconWrap}>
            <FileCheck2 size={16} />
          </div>
          <div className={styles.pillarTextGroup}>
            <strong className={styles.pillarTitle}>Multidisciplinary Review</strong>
            <span className={styles.pillarDesc}>
              In-depth second opinion before surgical commitment
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button Action Row (Strict Shape Standard: 8px-10px rounded rect) */}
      <div className={styles.ctaRow}>
        <Link
          href={bookingHref}
          className={styles.primaryCtaBtn}
          title={`Book Consultation for ${title}`}
        >
          <span>Book Doctor Consultation</span>
          <ArrowUpRight size={14} className={styles.btnArrow} />
        </Link>

        <Link
          href={secondOpinionHref}
          className={styles.secondaryCtaBtn}
          title="Request a Second Opinion"
        >
          <FileCheck2 size={14} />
          <span>Get Second Opinion</span>
        </Link>

        <a
          href={insuranceHref}
          className={styles.tertiaryCtaBtn}
          title="Check Insurance & Cost Inclusions"
        >
          <Calculator size={13} />
          <span>Check Insurance & Cost</span>
        </a>
      </div>

      {/* Trust Micro-Footnote */}
      <div className={styles.trustFootnoteRow}>
        <div className={styles.checkItem}>
          <CheckCircle2 size={12} className={styles.checkIcon} />
          <span>No advance commitment required</span>
        </div>
        <div className={styles.checkItem}>
          <CheckCircle2 size={12} className={styles.checkIcon} />
          <span>Dedicated patient care coordinator</span>
        </div>
        <div className={styles.checkItem}>
          <CheckCircle2 size={12} className={styles.checkIcon} />
          <span>{hospitalsCount} Quaternary Units Pan-India</span>
        </div>
      </div>
    </section>
  );
}
