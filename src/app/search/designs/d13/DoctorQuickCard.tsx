"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Phone, Stethoscope, UserRound } from "lucide-react";
import { nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { doctorReturnId, quickBookingHref } from "@/features/booking/design13/navigation";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import styles from "./DoctorQuickCard.module.css";

interface Props {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  now: Date;
  returnTo: string;
  variant?: QuickJourneyDesign;
  priority?: boolean;
  onProfile: (doctor: DoctorListingItem) => void;
}

export default function DoctorQuickCard({ doctor, mode, now, returnTo, variant = "d13", priority = false, onProfile }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const offered = doctor.modes[mode] === true;
  const slot = offered ? nextSlot(doctor, mode, now) : null;
  const slotLabel = slot ? doctor.availability[mode]?.trim() : null;
  const displayName = variant === "d14" ? presentationDoctorName(doctor.name) : doctor.name;

  return <article id={doctorReturnId(doctor.id)} tabIndex={-1} className={styles.card} data-doctor-card data-journey-design={variant} data-journey-palette="light">
    <header className={styles.header}>
      <div className={styles.portrait}>
        {doctor.img && !imageFailed
          ? <Image src={doctor.img} alt={displayName} fill sizes="80px" priority={priority} className={styles.photo} onError={() => setImageFailed(true)} />
          : <UserRound size={32} strokeWidth={1.4} aria-label="Doctor portrait unavailable" />}
      </div>
      <div className={styles.identity}>
        {doctor.isExecutive && <span className={styles.executive}>Executive consultation</span>}
        <h3><button type="button" className={styles.name} onClick={() => onProfile(doctor)} aria-label={`View profile of ${displayName}`}>{displayName}</button></h3>
        <p className={styles.speciality}>{doctor.speciality || "Speciality not listed"}</p>
      </div>
    </header>
    <p className={styles.clinicalFit}><Stethoscope size={15} aria-hidden /><span>{doctor.expertise?.slice(0, 2).join(" · ") || "Explore this doctor’s areas of care in their profile."}</span></p>
    <dl className={styles.metrics}>
      <div><dt>Experience</dt><dd>{doctor.experience || "Not listed"}</dd></div>
      <div><dt>Consultation fee</dt><dd>{doctor.fee || "Confirm fee"}</dd></div>
    </dl>
    <div className={styles.location}><MapPin size={16} aria-hidden /><p>{doctor.hospital || "Contact hospital for location"}</p></div>
    <div className={styles.booking}>
      <p className={styles.slotLabel}><CalendarDays size={15} aria-hidden />{slot ? `Next ${mode === "hospital" ? "hospital" : "video"} appointment${variant === "d14" ? "" : " · preview"}` : offered ? "Choose a convenient appointment" : "Availability needs confirmation"}</p>
      {offered
        ? <Link href={quickBookingHref(doctor, mode, now, returnTo, slot ? "slot" : "choose", variant)} className={styles.book}
          aria-label={slot ? `Choose ${slotLabel} with ${displayName}` : `Choose a time with ${displayName}`}>
          {slotLabel || "Choose a time"}<ArrowRight size={17} aria-hidden />
        </Link>
        : <a href="tel:18602080208" className={styles.book} aria-label={`Contact Narayana Health about ${displayName}`}>Contact hospital <Phone size={16} aria-hidden /></a>}
      <div className={styles.secondaryActions}>
        {offered && slot && <Link href={quickBookingHref(doctor, mode, now, returnTo, "choose", variant)}>More times <ArrowRight size={14} aria-hidden /></Link>}
        <button type="button" onClick={() => onProfile(doctor)} aria-label={`View full profile of ${displayName}`}>View profile <ArrowUpRight size={14} aria-hidden /></button>
      </div>
    </div>
  </article>;
}
