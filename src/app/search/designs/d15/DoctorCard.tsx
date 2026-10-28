"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Phone } from "lucide-react";
import { doctorHospitals, nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import type { Design15Variant } from "@/features/design-preview/journeyDesigns";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { doctorReturnId } from "@/features/booking/design13/navigation";
import { design15BookingHref } from "./directory";
import styles from "./DoctorCard.module.css";

export function DoctorPortrait({ doctor, priority = false, className = "" }: { doctor: DoctorListingItem; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const hasPortrait = Boolean(doctor.img) && !/\/images\/misc\/doctor_avatar/i.test(doctor.img);
  const words = presentationDoctorName(doctor.name).replace(/^(?:Dr\.?|Prof\.?)\s+/i, "").trim().split(/\s+/);
  const initials = [words[0]?.[0], words.length > 1 ? words.at(-1)?.[0] : ""].filter(Boolean).join("").toUpperCase();
  return <div className={`${styles.portrait} ${className}`}>
    {hasPortrait && !failed ? <Image src={doctor.img} alt={presentationDoctorName(doctor.name)} fill sizes="(max-width: 374px) 80px, 104px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className={styles.photo} onError={() => setFailed(true)} />
      : <span className={styles.fallback}><span className={styles.initials} aria-hidden>{initials || "NH"}</span><span className={styles.srOnly}>Doctor photograph unavailable</span></span>}
  </div>;
}

export default function DoctorCard({ doctor, mode, now, variant, returnTo, priority, onProfile }: {
  doctor: DoctorListingItem; mode: ConsultationMode; now: Date; variant: Design15Variant; returnTo: string; priority?: boolean; onProfile: (doctor: DoctorListingItem) => void;
}) {
  const name = presentationDoctorName(doctor.name);
  const slot = nextSlot(doctor, mode, now);
  const canBook = doctor.modes[mode] === true;
  const otherHospitals = Math.max(0, doctorHospitals(doctor).length - 1);
  return <article id={doctorReturnId(doctor.id)} className={styles.card} tabIndex={-1} data-doctor-card>
    <header className={styles.identity}>
      <div className={styles.identityText}>
        <h3><button type="button" onClick={() => onProfile(doctor)} aria-label={`View profile of ${name}`}>{name}<ArrowUpRight size={15} aria-hidden /></button></h3>
        <p className={styles.speciality}>{doctor.speciality || "Specialist"}</p>
        {doctor.isExecutive && <span className={styles.executive}>Executive consultation</span>}
      </div>
      <DoctorPortrait doctor={doctor} priority={priority} />
    </header>
    <dl className={styles.metrics}>
      <div><dt>Experience</dt><dd data-missing={!doctor.experience || undefined}>{doctor.experience || "Available on request"}</dd></div>
      <div><dt>Consultation fee</dt><dd data-missing={!doctor.fee || undefined}>{doctor.fee || "Confirm fee"}</dd></div>
    </dl>
    <div className={styles.location}>
      <MapPin size={16} aria-hidden />
      <p>{doctor.hospital || "Contact us for location details"}</p>
      {otherHospitals > 0 && <button type="button" onClick={() => onProfile(doctor)} aria-label={`View all locations for ${name}`}>+{otherHospitals}<span className={styles.srOnly}> {otherHospitals === 1 ? "location" : "locations"}</span></button>}
    </div>
    <footer className={styles.footer}>
      <div className={styles.availability} data-available={Boolean(slot) || undefined}>
        <span><Clock3 size={13} aria-hidden />Next {mode === "hospital" ? "hospital visit" : "video consultation"}</span>
        <strong>{slot ? doctor.availability[mode]?.replace(/, 0(\d:\d\d)/, ", $1") : canBook ? "Check available times" : "Contact for availability"}</strong>
      </div>
      {canBook ? <Link href={design15BookingHref(doctor, mode, now, returnTo, variant)} className={styles.book} aria-label={`Book appointment with ${name}`}>Book appointment<ArrowRight size={16} aria-hidden /></Link>
        : <a href="tel:18602080208" className={styles.book} aria-label={`Contact hospital about ${name}`}>Contact hospital<Phone size={16} aria-hidden /></a>}
    </footer>
  </article>;
}
