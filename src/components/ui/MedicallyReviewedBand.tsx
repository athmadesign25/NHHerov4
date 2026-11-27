import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import styles from "./MedicallyReviewedBand.module.css";

export interface DoctorReviewer {
  name: string;
  designation: string;
  specialty: string;
  qualifications?: string;
  image: string;
  reviewDate?: string;
}

export interface MedicallyReviewedBandProps {
  specialityName?: string;
  reviewer?: DoctorReviewer;
  className?: string;
  theme?: "light" | "dark";
  fluid?: boolean;
  id?: string;
}

const DEFAULT_REVIEWER: DoctorReviewer = {
  name: "Dr. Bagirath Raghuraman",
  designation: "Senior Consultant & Clinical Director",
  specialty: "Surgical Oncology & Robotic Surgery",
  qualifications: "MBBS, MS, MCh",
  image: "/doctors/doc_bagirath.jpg",
  reviewDate: "November 2026",
};

export default function MedicallyReviewedBand({
  specialityName = "Cancer Care",
  reviewer = DEFAULT_REVIEWER,
  className,
  theme = "light",
  fluid = false,
  id,
}: MedicallyReviewedBandProps) {
  const isLight = theme === "light";

  return (
    <div
      id={id}
      className={`${styles.bandWrapper} ${isLight ? styles.bandWrapperLight : ""} ${fluid ? styles.bandWrapperFluid : ""} ${className || ""}`}
      aria-label="Medical Review"
    >
      <div className={styles.bandContainer}>
        <div className={styles.sleekBar}>
          {/* Trust Badge & Context */}
          <div className={styles.trustSide}>
            <div className={styles.shieldIconWrapper}>
              <ShieldCheck className={styles.shieldIcon} size={18} strokeWidth={2.4} />
            </div>
            <div className={styles.trustTextGroup}>
              <div className={styles.statusRow}>
                <span className={styles.reviewLabel}>Medically Reviewed</span>
              </div>
              <span className={styles.reviewDate}>
                Verified • {reviewer.reviewDate || "October 2024"}
              </span>
            </div>
          </div>

          <div className={styles.verticalDivider} aria-hidden />

          {/* Reviewer Doctor Info */}
          <div className={styles.doctorSide}>
            <span className={styles.portrait}>
              <Image
                src={reviewer.image}
                alt={reviewer.name}
                fill
                sizes="48px"
                loading="lazy"
              />
            </span>

            <div className={styles.doctorDetails}>
              <div className={styles.nameRow}>
                <h4 className={styles.docName}>{reviewer.name}</h4>
                {reviewer.qualifications && (
                  <span className={styles.docQual}>{reviewer.qualifications}</span>
                )}
              </div>
              <p className={styles.docRole}>
                <span className={styles.designation}>{reviewer.designation}</span>
                <span className={styles.bullet} aria-hidden>•</span>
                <span className={styles.department}>{reviewer.specialty}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
