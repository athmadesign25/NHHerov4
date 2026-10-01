"use client";

import React from "react";
import Image from "next/image";
import { Calendar, Clock, MapPin, Video, User, Edit2, CheckCircle2 } from "lucide-react";
import type { BookingDoctorSummary, BookingState } from "@/features/booking/types";
import styles from "./BookingSummary.module.css";

interface BookingSummaryProps {
  doctor: BookingDoctorSummary;
  state: BookingState;
  onEditStep1: () => void;
  onEditStep2: () => void;
}

export default function BookingSummary({
  doctor,
  state,
  onEditStep1,
  onEditStep2,
}: BookingSummaryProps) {
  const { consultationType, selectedHospital, selectedDate, selectedTime, patient } = state;
  const locationLabel = consultationType === "video" ? "Video Consultation" : selectedHospital;

  return (
    <div className={styles.wrapper}>
      {/* Doctor row */}
      <div className={styles.doctorRow}>
        <div className={styles.doctorPhoto}>
          <Image
            src={doctor.img}
            alt={doctor.name}
            fill
            sizes="48px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.doctorInfo}>
          <p className={styles.doctorName}>{doctor.name}</p>
          <p className={styles.doctorSpec}>{doctor.speciality}</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Appointment details */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Appointment Details</span>
          <button
            type="button"
            onClick={onEditStep1}
            className={styles.editBtn}
            aria-label="Edit appointment date and time"
          >
            <Edit2 size={12} aria-hidden />
            Edit
          </button>
        </div>

        <ul className={styles.detailList}>
          <li className={styles.detailItem}>
            {consultationType === "video" ? (
              <Video size={15} className={styles.detailIcon} aria-hidden />
            ) : (
              <MapPin size={15} className={styles.detailIcon} aria-hidden />
            )}
            <div>
              <span className={styles.detailLabel}>
                {consultationType === "video" ? "Video Consultation" : "Hospital Visit"}
              </span>
              <span className={styles.detailValue}>{locationLabel}</span>
            </div>
          </li>
          <li className={styles.detailItem}>
            <Calendar size={15} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{selectedDate}</span>
            </div>
          </li>
          <li className={styles.detailItem}>
            <Clock size={15} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Time</span>
              <span className={styles.detailValue}>{selectedTime}</span>
            </div>
          </li>
        </ul>
      </div>

      <div className={styles.divider} />

      {/* Patient details */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Patient Details</span>
          <button
            type="button"
            onClick={onEditStep2}
            className={styles.editBtn}
            aria-label="Edit patient details"
          >
            <Edit2 size={12} aria-hidden />
            Edit
          </button>
        </div>

        <ul className={styles.detailList}>
          <li className={styles.detailItem}>
            <User size={15} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Patient</span>
              <span className={styles.detailValue}>
                {patient.name || "—"}
                {patient.age ? `, ${patient.age} yrs` : ""}
                {patient.gender ? ` · ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}` : ""}
              </span>
            </div>
          </li>
          {patient.reason && (
            <li className={[styles.detailItem, styles.detailItemReason].join(" ")}>
              <span className={styles.reasonText}>&ldquo;{patient.reason}&rdquo;</span>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.divider} />

      {/* Fee row */}
      <div className={styles.feeRow}>
        <span className={styles.feeLabel}>Consultation Fee</span>
        <span className={styles.feeAmount}>{doctor.fee}</span>
      </div>

      {/* Trust signals */}
      <div className={styles.trustRow}>
        <span className={styles.trustItem}>
          <CheckCircle2 size={13} className={styles.trustIcon} aria-hidden />
          Verified Doctor
        </span>
        <span className={styles.trustItem}>
          <CheckCircle2 size={13} className={styles.trustIcon} aria-hidden />
          Free Cancellation
        </span>
      </div>
    </div>
  );
}
