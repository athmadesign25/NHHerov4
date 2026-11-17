"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, FileText, ArrowUpRight } from "lucide-react";
import styles from "./ClinicalReviewedBySection.module.css";

export interface ClinicalSummaryBannerProps {
  eyebrow?: string;
  summary: string;
  reviewerName?: string;
  reviewAnchorId?: string;
}

export function ClinicalSummaryBanner({
  summary,
  reviewerName,
  reviewAnchorId = "medically-reviewed-by",
}: ClinicalSummaryBannerProps) {
  const formattedReviewer = reviewerName
    ? reviewerName.startsWith("Dr.")
      ? reviewerName
      : `Dr. ${reviewerName}`
    : "Dr. Devi Prasad Shetty";

  return (
    <div className={styles.summaryEditorialSection} role="region" aria-label="Clinical Summary">
      <div className={styles.summaryHeaderRow}>
        <a href={`#${reviewAnchorId}`} className={styles.inlineReviewerBadge}>
          <CheckCircle2 size={13} className={styles.inlineCheckIcon} />
          <span>Medically Reviewed by {formattedReviewer}</span>
        </a>
      </div>
      <p className={styles.summaryLeadText}>{summary}</p>
    </div>
  );
}

export interface ClinicalReviewedByProps {
  doctorName?: string;
  doctorRole?: string;
  speciality?: string;
  hospital?: string;
  experience?: string;
  doctorImage?: string;
  reviewDate?: string;
  id?: string;
}

export default function ClinicalReviewedBySection({
  doctorName = "Dr. Devi Prasad Shetty",
  doctorRole = "Senior Consultant & Clinical Lead",
  speciality = "Multidisciplinary Clinical Care",
  hospital = "Narayana Health City, Bengaluru",
  experience = "22+ Years Experience",
  doctorImage = "/doctors/doc_vivek.jpg",
  reviewDate = "November 2026",
  id = "medically-reviewed-by",
}: ClinicalReviewedByProps) {
  const normalizedName = doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`;

  return (
    <section id={id} className={styles.reviewedSection} aria-label={`Reviewed by ${normalizedName}`}>
      <div className={styles.reviewedInner}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarImgWrap}>
            <Image
              src={doctorImage || "/doctors/doc_vivek.jpg"}
              alt={normalizedName}
              fill
              sizes="68px"
              className={styles.avatarImg}
            />
          </div>
          <span className={styles.verifiedShieldBadge} title="Verified Medical Reviewer">
            <CheckCircle2 size={12} strokeWidth={3} />
          </span>
        </div>

        <div className={styles.reviewedContent}>
          <div className={styles.reviewedTopRow}>
            <span className={styles.eeatBadge}>
              <ShieldCheck size={13} />
              <span>Medically Reviewed Content</span>
            </span>
            <span className={styles.reviewDateText}>Last Reviewed: {reviewDate}</span>
          </div>

          <h3 className={styles.reviewerHeading}>Reviewed by {normalizedName}</h3>

          <p className={styles.reviewerCredentials}>
            {doctorRole} &bull; {speciality}
            {experience ? ` (${experience})` : ""} &bull; {hospital}
          </p>

          <p className={styles.reviewerNote}>
            This medical guide has been clinically reviewed and verified by {normalizedName} and the Narayana Health Medical Advisory Board to ensure adherence to evidence-based diagnostic, surgical, and patient-safety protocols.
          </p>

          <Link
            href={`/doctors?search=${encodeURIComponent(normalizedName)}`}
            className={styles.profileLink}
          >
            <span>Consult or View Specialist Profile</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export interface EditorialFigureItem {
  src: string;
  alt: string;
  caption: string;
}

export function ClinicalEditorialFigures({ items }: { items: EditorialFigureItem[] }) {
  return (
    <div className={styles.editorialFiguresGrid}>
      {items.map((item, idx) => (
        <figure key={idx} className={styles.editorialFigureCard} style={{ margin: 0 }}>
          <div className={styles.editorialFigureImgWrap}>
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className={styles.editorialFigureImg}
            />
          </div>
          <figcaption className={styles.editorialFigureCaption}>{item.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
