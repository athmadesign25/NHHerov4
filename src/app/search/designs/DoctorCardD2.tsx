"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Video,
  PhoneCall,
  ArrowRight,
  History,
  Eye,
  Zap,
} from "lucide-react";
import styles from "./DoctorCardD2.module.css";

export type DoctorCardLabel = "booked" | "viewed" | "today";

export interface DoctorCardData {
  id: string;
  name: string;
  speciality: string;
  degrees: string;
  hospital: string;
  hospitalCount?: string;
  rating: number;
  reviews?: number;
  availability?: { hospital?: string; video?: string } | null;
  img: string;
  fee: string;
  isExecutive?: boolean;
}

interface DoctorCardD2Props {
  doc: DoctorCardData;
  /** false when the page is filtered to video-only consultations */
  showHospitalSlot: boolean;
  hospitalUrl: string;
  videoUrl: string;
  bookUrl: string;
  onBookingClick: (e: React.MouseEvent, url: string) => void;
  /** Optional contextual label; falls back to Available today */
  label?: DoctorCardLabel;
}

const LABELS: Record<DoctorCardLabel, { text: string; Icon: typeof Eye; tone: string }> = {
  booked: { text: "Booked earlier", Icon: History, tone: "toneBlue" },
  viewed: { text: "Recently viewed", Icon: Eye, tone: "toneBlue" },
  today: { text: "Available today", Icon: Zap, tone: "toneGreen" },
};

export default function DoctorCardD2({
  doc,
  showHospitalSlot,
  hospitalUrl,
  videoUrl,
  bookUrl,
  onBookingClick,
  label,
}: DoctorCardD2Props) {
  const isAvailableToday =
    doc.availability?.hospital?.toLowerCase().startsWith("today") ||
    doc.availability?.video?.toLowerCase().startsWith("today");
  const labelKey: DoctorCardLabel | undefined = label ?? (isAvailableToday ? "today" : undefined);
  const labelInfo = labelKey ? LABELS[labelKey] : undefined;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header with masked photo on left and details on right */}
      <div className={styles.header}>
        <div className={styles.photoWrap}>
          <Image
            src={doc.img}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 360px"
            className={styles.photo}
          />
          <div className={styles.scrim} aria-hidden="true" />
        </div>

        <div className={styles.headerContent}>
          {labelInfo && (
            <span className={`${styles.pill} ${styles[labelInfo.tone]}`}>
              <labelInfo.Icon size={12} aria-hidden="true" /> {labelInfo.text}
            </span>
          )}
          <h3 className={styles.name}>{doc.name}</h3>
          <p className={styles.speciality}>{doc.speciality}</p>
          <p className={styles.degrees}>{doc.degrees}</p>
        </div>

        <Link
          href={`/doctors/${doc.id}`}
          className={styles.headerLink}
          aria-label={`View profile of ${doc.name}`}
        />
        <span className={styles.cue} aria-hidden="true">
          View profile <ArrowRight size={12} />
        </span>
      </div>

      {/* Body with location, availability chips, and footer */}
      <div className={styles.body}>
        <div className={styles.location}>
          <MapPin size={15} className={styles.locationIcon} aria-hidden="true" />
          <span className={styles.locationText} title={doc.hospital}>
            {doc.hospital}
          </span>
          {doc.hospitalCount && <span className={styles.locationMore}>{doc.hospitalCount}</span>}
        </div>

        <div className={styles.availability}>
          <span className={styles.availLabel}>Next available</span>
          <div className={styles.chips}>
            {showHospitalSlot && (
              doc.availability?.hospital ? (
                <a
                  href={hospitalUrl}
                  onClick={(e) => onBookingClick(e, hospitalUrl)}
                  className={`${styles.chip} ${styles.chipHospital}`}
                  aria-label={`Hospital visit, next available ${doc.availability.hospital}`}
                >
                  <span className={styles.chipIcon}>
                    <Building2 size={16} aria-hidden="true" />
                  </span>
                  <div className={styles.chipText}>
                    <span className={styles.chipType}>Hospital visit</span>
                    <span className={styles.chipTime}>{doc.availability.hospital}</span>
                  </div>
                </a>
              ) : (
                <div className={`${styles.chip} ${styles.chipOff}`}>
                  <span className={styles.chipIcon}>
                    <Building2 size={16} aria-hidden="true" />
                  </span>
                  <span className={styles.chipOffText}>No hospital slots</span>
                </div>
              )
            )}

            {doc.availability?.video ? (
              <a
                href={videoUrl}
                onClick={(e) => onBookingClick(e, videoUrl)}
                className={`${styles.chip} ${styles.chipVideo}`}
                aria-label={`Video consultation, next available ${doc.availability.video}`}
              >
                <span className={styles.chipIcon}>
                  <Video size={16} aria-hidden="true" />
                </span>
                <div className={styles.chipText}>
                  <span className={styles.chipType}>Video consultation</span>
                  <span className={styles.chipTime}>{doc.availability.video}</span>
                </div>
              </a>
            ) : (
              <div className={`${styles.chip} ${styles.chipOff}`}>
                <span className={styles.chipIcon}>
                  <Video size={16} aria-hidden="true" />
                </span>
                <span className={styles.chipOffText}>No video slots</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.fee}>
            <span className={styles.feeAmount}>{doc.fee}</span>
            <span className={styles.feeNote}>onwards</span>
          </div>
          <div className={styles.actions}>
            <a
              href="tel:+919876543210"
              className={styles.callBtn}
              aria-label={`Call to enquire about ${doc.name}`}
            >
              <PhoneCall size={18} aria-hidden="true" />
            </a>
            <a
              href={bookUrl}
              onClick={(e) => onBookingClick(e, bookUrl)}
              className={styles.bookBtn}
            >
              Book now <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
