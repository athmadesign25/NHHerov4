import React from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
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
}

const DEFAULT_REVIEWER: DoctorReviewer = {
  name: "Dr. Bagirath Raghuraman",
  designation: "Senior Consultant & Clinical Director",
  specialty: "Surgical Oncology & Robotic Surgery",
  qualifications: "MBBS, MS, MCh",
  image: "/doctors/doc_bagirath.jpg",
  reviewDate: "October 2024",
};

export default function MedicallyReviewedBand({
  specialityName = "Cancer Care",
  reviewer = DEFAULT_REVIEWER,
  className,
}: MedicallyReviewedBandProps) {
  return (
    <div className={`${styles.bandWrapper} ${className || ""}`} aria-label="Medical Review">
      <div className={styles.bandContainer}>
        <div className={styles.sleekBar}>
          {/* Trust Badge & Context */}
          <div className={styles.trustSide}>
            <div className={styles.shieldIconWrapper}>
              <ShieldCheck className={styles.shieldIcon} size={18} strokeWidth={2.4} />
            </div>
            <div className={styles.trustTextGroup}>
              <div className={styles.statusRow}>
                <span className={styles.pulseDot} aria-hidden />
                <span className={styles.reviewLabel}>Medically Reviewed</span>
                <span className={styles.contextBadge}>{specialityName}</span>
              </div>
              <span className={styles.reviewDate}>
                Verified • {reviewer.reviewDate || "October 2024"}
              </span>
            </div>
          </div>

          <div className={styles.verticalDivider} aria-hidden />

          {/* Reviewer Doctor Info */}
          <div className={styles.doctorSide}>
            <div className={styles.avatarFrame}>
              <Image
                src={reviewer.image}
                alt={reviewer.name}
                width={42}
                height={42}
                className={styles.avatarImg}
                loading="lazy"
              />
              <span className={styles.verifiedCheckBadge} title="Verified Clinical Specialist">
                <CheckCircle2 size={11} strokeWidth={3} />
              </span>
            </div>

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
