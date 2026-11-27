"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { DoctorItem } from "@/data/procedureDetailGenerator";
import styles from "./FeaturedDoctorCardBackup.module.css";

interface FeaturedDoctorCardBackupProps {
  doc: DoctorItem;
  priority?: boolean;
}

/**
 * Backup of our original Featured Doctors left-blend portrait card
 * preserved before switching the active card UI to Toshib's card design.
 */
export default function FeaturedDoctorCardBackup({
  doc,
  priority = false,
}: FeaturedDoctorCardBackupProps) {
  return (
    <div className={styles.doctorBlendCard}>
      {/* Left: Full Image Blending onto Background */}
      <div className={styles.doctorImageBlendCol}>
        <Image
          src={doc.image}
          alt={doc.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 420px"
          className={styles.doctorBlendImg}
        />
        <div className={styles.doctorImageBlendOverlay} />
      </div>

      {/* Right: Text on that Style */}
      <div className={styles.doctorTextCol}>
        <div className={styles.doctorTextTop}>
          {doc.bio && <p className={styles.doctorCardBio}>{doc.bio}</p>}
        </div>

        <div className={styles.doctorTextBottom}>
          <h3 className={styles.doctorCardName}>{doc.name}</h3>
          <div className={styles.doctorCardRole}>{doc.designation}</div>
          <div className={styles.doctorMetaBlock}>
            <span className={styles.doctorExperienceText}>{doc.experience}</span>
            <span className={styles.doctorMetaDot} aria-hidden="true">
              •
            </span>
            <span className={styles.doctorHospitalName}>
              {doc.hospital.replace(", Bangalore", "").replace(", Bengaluru", "")}
            </span>
          </div>
          <div className={styles.doctorCtaContainer}>
            <Link
              href={`/doctors?doctor=${encodeURIComponent(doc.name)}`}
              className={styles.doctorProfileLink}
            >
              <span>View Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
