"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Building2, Video, PhoneCall, ArrowRight, CalendarSearch, Check, Zap } from "lucide-react";
import styles from "./DoctorCardCompact.module.css";

/**
 * Design 2 · Compact doctor card (design-preview variant "d2c").
 * Four fixed regions — identity · locations · availability · footer — each with
 * a reserved height so every card in the grid lines up regardless of content.
 */

export interface CompactDoctor {
  id: string;
  name: string;
  speciality: string;
  degrees: string;
  hospital: string;
  hospitals?: readonly string[];
  hospitalCount?: string;
  availability?: { hospital?: string; video?: string } | null;
  img: string;
  fee: string;
}

interface DoctorCardCompactProps {
  doc: CompactDoctor;
  /** false when results are filtered to video consultations only */
  showHospitalSlot: boolean;
  hospitalUrl: string;
  videoUrl: string;
  bookUrl: string;
  onBookingClick: (e: React.MouseEvent, url: string) => void;
}

const asSlot = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

function cleanSlotTime(slot: string): string {
  return slot.replace(/, 0(\d:\d\d)/, ", $1");
}

function useLocations(doc: CompactDoctor) {
  const list = (doc.hospitals?.length ? doc.hospitals : [doc.hospital]).filter(Boolean).slice(0, 3);
  const primary = list[0] ?? doc.hospital;
  const namedExtra = list.length - 1;
  const countExtra = parseInt((doc.hospitalCount ?? "").replace(/\D/g, ""), 10) || 0;
  return { primary, list, extra: Math.min(Math.max(namedExtra, countExtra), 2) };
}

export default function DoctorCardCompact({
  doc,
  showHospitalSlot,
  hospitalUrl,
  videoUrl,
  bookUrl,
  onBookingClick,
}: DoctorCardCompactProps) {
  const specialities = doc.speciality.split(/\s*[,|/]\s*/).filter(Boolean);
  const { primary, list, extra } = useLocations(doc);
  const rawHospital = asSlot(doc.availability?.hospital);
  const rawVideo = asSlot(doc.availability?.video);
  const hospitalSlot = rawHospital ? cleanSlotTime(rawHospital) : undefined;
  const videoSlot = rawVideo ? cleanSlotTime(rawVideo) : undefined;
  const noSlots = !videoSlot && (!hospitalSlot || !showHospitalSlot);
  const hasFee = Boolean(doc.fee && doc.fee.trim());
  const availableToday = [hospitalSlot, videoSlot].some((v) => v?.toLowerCase().startsWith("today"));

  const [locOpen, setLocOpen] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!locOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!locRef.current?.contains(e.target as Node)) setLocOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLocOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [locOpen]);

  const hasHospital = Boolean(hospitalSlot && showHospitalSlot);
  const hasVideo = Boolean(videoSlot);
  const hasBoth = hasHospital && hasVideo;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* A · Identity — full-bleed portrait with NH-blue gradient map */}
      <Link href={`/doctors/${doc.id}`} className={styles.identity} aria-label={`View profile of ${doc.name}`}>
        <Image
          src={doc.img}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px"
          className={styles.photoImg}
        />
        <span className={styles.tint} aria-hidden="true" />
        <span className={styles.scrim} aria-hidden="true" />

        {availableToday && (
          <span className={styles.label}>
            <Zap size={12} aria-hidden="true" /> Available today
          </span>
        )}
        <span className={styles.cue} aria-hidden="true">
          View profile <ArrowRight size={13} />
        </span>

        <span className={styles.idText}>
          <span className={styles.name}>{doc.name}</span>
          <span className={styles.specRow}>
            <span className={styles.spec}>{specialities[0] ?? doc.speciality}</span>
            {specialities.length > 1 && (
              <span className={styles.specMore} title={specialities.slice(1).join(", ")}>
                +{specialities.length - 1}
              </span>
            )}
          </span>
          <span className={styles.degrees} title={doc.degrees}>
            {doc.degrees}
          </span>
        </span>
      </Link>

      <div className={styles.body}>
        {/* B · Practice locations */}
        <div className={styles.location} ref={locRef}>
          <MapPin size={15} className={styles.locIcon} aria-hidden="true" />
          <span className={styles.locName} title={primary}>
            {primary}
          </span>
          {extra > 0 &&
            (list.length > 1 ? (
              <button
                type="button"
                className={styles.locMore}
                aria-expanded={locOpen}
                aria-controls={popId}
                onClick={() => setLocOpen((o) => !o)}
              >
                +{extra} more
              </button>
            ) : (
              <Link href={`/doctors/${doc.id}`} className={styles.locMore}>
                +{extra} more
              </Link>
            ))}

          {locOpen && (
            <div id={popId} className={styles.locPop} role="dialog" aria-label="Practice locations">
              <span className={styles.locPopTitle}>Consults at {list.length} locations</span>
              <ul>
                {list.map((h, i) => (
                  <li key={h}>
                    <MapPin size={13} aria-hidden="true" />
                    <span>{h}</span>
                    {i === 0 && (
                      <span className={styles.locPrimary}>
                        <Check size={11} aria-hidden="true" /> Primary
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* C · Availability */}
        <div className={styles.availability}>
          <span className={styles.availLabel}>Next available</span>
          {hasBoth ? (
            <div className={styles.slots}>
              <a
                href={hospitalUrl}
                onClick={(e) => onBookingClick(e, hospitalUrl)}
                className={styles.slot}
                aria-label={`Hospital visit, next available ${hospitalSlot}`}
              >
                <span className={styles.slotHead}>
                  <Building2 size={13} aria-hidden="true" /> Hospital
                </span>
                <span className={styles.slotTime}>{hospitalSlot}</span>
              </a>
              <a
                href={videoUrl}
                onClick={(e) => onBookingClick(e, videoUrl)}
                className={styles.slot}
                aria-label={`Video consult, next available ${videoSlot}`}
              >
                <span className={styles.slotHead}>
                  <Video size={13} aria-hidden="true" /> Video
                </span>
                <span className={styles.slotTime}>{videoSlot}</span>
              </a>
            </div>
          ) : hasHospital ? (
            <a
              href={hospitalUrl}
              onClick={(e) => onBookingClick(e, hospitalUrl)}
              className={`${styles.slot} ${styles.slotFull}`}
              aria-label={`Hospital visit, next available ${hospitalSlot}`}
            >
              <div className={styles.slotFullLeft}>
                <span className={styles.slotHead}>
                  <Building2 size={13} aria-hidden="true" /> Hospital Visit
                </span>
                <span className={styles.slotTime}>{hospitalSlot}</span>
              </div>
              <ArrowRight size={15} aria-hidden="true" className={styles.slotArrow} />
            </a>
          ) : hasVideo ? (
            <a
              href={videoUrl}
              onClick={(e) => onBookingClick(e, videoUrl)}
              className={`${styles.slot} ${styles.slotFull}`}
              aria-label={`Video consult, next available ${videoSlot}`}
            >
              <div className={styles.slotFullLeft}>
                <span className={styles.slotHead}>
                  <Video size={13} aria-hidden="true" /> Video Consult
                </span>
                <span className={styles.slotTime}>{videoSlot}</span>
              </div>
              <ArrowRight size={15} aria-hidden="true" className={styles.slotArrow} />
            </a>
          ) : (
            <a
              href={bookUrl}
              onClick={(e) => onBookingClick(e, bookUrl)}
              className={`${styles.slot} ${styles.slotFull} ${styles.slotCheck}`}
              aria-label={`Check availability for ${doc.name}`}
            >
              <div className={styles.slotFullLeft}>
                <span className={styles.slotHead}>
                  <CalendarSearch size={13} aria-hidden="true" /> Next Slot
                </span>
                <span className={styles.slotTime}>Check availability</span>
              </div>
              <ArrowRight size={15} aria-hidden="true" className={styles.slotArrow} />
            </a>
          )}
        </div>

        {/* D · Booking footer */}
        <div className={styles.footer}>
          <div className={styles.fee}>
            {hasFee ? (
              <>
                <span className={styles.feeAmount}>{doc.fee}</span>
                <span className={styles.feeNote}>onwards</span>
              </>
            ) : (
              <>
                <span className={styles.feeNote}>Consultation fee</span>
                <span className={styles.feeTbd}>At booking</span>
              </>
            )}
          </div>
          <a href="tel:+919876543210" className={styles.callBtn} aria-label={`Call to enquire about ${doc.name}`}>
            <PhoneCall size={18} aria-hidden="true" />
          </a>
          <a href={bookUrl} onClick={(e) => onBookingClick(e, bookUrl)} className={styles.bookBtn}>
            Book now <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
