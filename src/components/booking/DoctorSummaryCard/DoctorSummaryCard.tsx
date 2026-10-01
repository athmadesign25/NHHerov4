"use client";

import React from "react";
import Image from "next/image";
import { Clock, MapPin, Star, Languages } from "lucide-react";
import type { BookingDoctorSummary } from "@/features/booking/types";
import styles from "./DoctorSummaryCard.module.css";

interface DoctorSummaryCardProps {
  doctor: BookingDoctorSummary;
  /** Compact mode removes the about/fee from the card (used inside step panels) */
  compact?: boolean;
}

export default function DoctorSummaryCard({ doctor, compact = false }: DoctorSummaryCardProps) {
  const languageList = doctor.languages?.join(", ") ?? "English, Hindi";

  return (
    <article className={[styles.card, compact ? styles.compact : ""].filter(Boolean).join(" ")}>
      <div className={styles.photoWrapper}>
        <Image
          src={doctor.img}
          alt={`Photo of ${doctor.name}`}
          fill
          sizes="(max-width: 768px) 72px, 90px"
          className={styles.photo}
        />
      </div>

      <div className={styles.body}>
        <h2 className={styles.name}>{doctor.name}</h2>
        <p className={styles.speciality}>
          {doctor.speciality}
          {doctor.subSpeciality ? ` · ${doctor.subSpeciality}` : ""}
        </p>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <Star size={12} aria-hidden />
            {doctor.rating} ({doctor.reviews.toLocaleString()} reviews)
          </span>
          <span className={styles.metaDot} aria-hidden />
          <span className={styles.metaItem}>
            <Clock size={12} aria-hidden />
            {doctor.experienceYears} Experience
          </span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <MapPin size={12} aria-hidden />
            {doctor.hospital}, {doctor.city}
          </span>
        </div>

        {!compact && (
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <Languages size={12} aria-hidden />
              {languageList}
            </span>
          </div>
        )}
      </div>

      {!compact && (
        <div className={styles.feeBadge} aria-label={`Consultation fee: ${doctor.fee}`}>
          <span className={styles.feeLabel}>Fee</span>
          <span className={styles.feeAmount}>{doctor.fee}</span>
        </div>
      )}
    </article>
  );
}
