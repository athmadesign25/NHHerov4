import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowUpRight, Calendar } from "lucide-react";
import styles from "./MedicallyReviewedBand.module.css";

export interface DoctorReviewer {
  name: string;
  designation: string;
  specialty: string;
  qualifications?: string;
  experience?: string;
  image: string;
  profileLink?: string;
  reviewDate?: string;
}

interface MedicallyReviewedBandProps {
  reviewer?: DoctorReviewer;
  className?: string;
}

const DEFAULT_REVIEWER: DoctorReviewer = {
  name: "Dr. Bagirath Raghuraman",
  designation: "Senior Consultant & Clinical Director",
  specialty: "Surgical Oncology & Robotic Cancer Surgery",
  qualifications: "MBBS, MS, MCh (Surgical Oncology)",
  experience: "22+ Yrs Exp",
  image: "/doctors/doc_bagirath.jpg",
  profileLink: "/doctors/dr-bagirath-raghuraman",
  reviewDate: "October 2024",
};

export default function MedicallyReviewedBand({
  reviewer = DEFAULT_REVIEWER,
  className,
}: MedicallyReviewedBandProps) {
  return (
    <div className={`${styles.bandWrapper} ${className || ""}`}>
      <div className={styles.bandInner}>
        <div className={styles.bandCard}>
          {/* Left: Verified Trust Badge + Text Label */}
          <div className={styles.badgeCol}>
            <div className={styles.shieldIconWrapper}>
              <ShieldCheck className={styles.shieldIcon} size={20} strokeWidth={2.2} />
            </div>
            <div className={styles.badgeTextGroup}>
              <div className={styles.statusRow}>
                <span className={styles.pulseDot} />
                <span className={styles.reviewLabel}>Medically Reviewed</span>
              </div>
              <span className={styles.reviewDate}>
                Clinical accuracy verified • {reviewer.reviewDate || "Recently updated"}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Middle: Doctor Profile Info with Avatar */}
          <div className={styles.doctorCol}>
            <div className={styles.avatarFrame}>
              <Image
                src={reviewer.image}
                alt={reviewer.name}
                width={54}
                height={54}
                className={styles.avatarImg}
                priority={false}
              />
              <span className={styles.verifiedCheckBadge} title="Verified Specialist">
                <CheckCircle2 size={13} strokeWidth={2.8} />
              </span>
            </div>

            <div className={styles.docDetails}>
              <div className={styles.nameRow}>
                <h4 className={styles.docName}>{reviewer.name}</h4>
                {reviewer.qualifications && (
                  <span className={styles.docQual}>{reviewer.qualifications}</span>
                )}
              </div>
              <p className={styles.docMeta}>
                <span className={styles.designation}>{reviewer.designation}</span>
                <span className={styles.metaBullet}>•</span>
                <span className={styles.specialty}>{reviewer.specialty}</span>
                {reviewer.experience && (
                  <>
                    <span className={styles.metaBullet}>•</span>
                    <span className={styles.experience}>{reviewer.experience}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Quick Action CTAs */}
          <div className={styles.actionCol}>
            {reviewer.profileLink && (
              <Link
                href={reviewer.profileLink}
                className={styles.viewProfileBtn}
                id="reviewer-view-profile-btn"
              >
                <span>View Profile</span>
                <ArrowUpRight size={14} />
              </Link>
            )}
            <Link
              href="#appointment"
              className={styles.bookConsultBtn}
              id="reviewer-book-consult-btn"
            >
              <Calendar size={13} />
              <span>Consult Doctor</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
