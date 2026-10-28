"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Clock3, MapPin, Phone, UserRound, Video } from "lucide-react";
import { nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import type { JourneyDesign } from "@/features/design-preview/journeyDesigns";
import { design7BookingUrl } from "./directory";
import styles from "./DoctorCard.module.css";

interface Props {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  priority?: boolean;
  variant?: JourneyDesign;
  onProfile: (doctor: DoctorListingItem) => void;
}

export function DoctorPortrait({ doctor, priority = false, variant = "d7" }: { doctor: DoctorListingItem; priority?: boolean; variant?: JourneyDesign }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.portrait}>
    {doctor.img && !failed
      ? <Image src={doctor.img} alt={doctor.name} fill sizes={variant === "d8" ? "(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 33vw" : variant === "d9" ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 639px) 112px, 160px"} priority={priority} className={styles.photo} onError={() => setFailed(true)} />
      : <div className={styles.photoFallback}><UserRound size={48} aria-hidden /><span>Doctor profile</span></div>}
  </div>;
}

export default function DoctorCard({ doctor, mode, priority, variant = "d7", onProfile }: Props) {
  const slot = nextSlot(doctor, mode);
  return <article className={styles.card} data-doctor-card data-journey-design={variant} data-journey-palette={variant === "d9" ? "dark" : undefined}>
    <div className={styles.main}>
      <DoctorPortrait doctor={doctor} priority={priority} variant={variant} />
      <div className={styles.identity}>
        <div className={styles.cardEyebrow}>
          <span>{mode === "hospital" ? <Building2 size={13} aria-hidden /> : <Video size={13} aria-hidden />}{mode === "hospital" ? "In-person care" : "Video consultation"}</span>
          {doctor.isExecutive && <span className={styles.executive}>Executive</span>}
        </div>
        <h3><button type="button" onClick={() => onProfile(doctor)} className={styles.name} aria-label={`View profile of ${doctor.name}`}>{doctor.name}<ArrowUpRight size={18} aria-hidden /></button></h3>
        <p className={styles.speciality}>{doctor.speciality}</p>
        <p className={styles.experience}>{doctor.experience} of experience</p>
        <button type="button" onClick={() => onProfile(doctor)} className={styles.profileLink}>View profile <ArrowUpRight size={14} aria-hidden /></button>
      </div>
    </div>
    <div className={styles.details}>
      {doctor.degrees && <p className={styles.qualifications}>{doctor.degrees}</p>}
      <p className={styles.location}><MapPin size={15} aria-hidden /><span>{doctor.hospital}</span></p>
      <div className={styles.availability}><Clock3 size={14} aria-hidden /><span>{slot ? `Next available · ${doctor.availability[mode]}` : "Choose an available date & time"}</span></div>
    </div>
    <div className={styles.footer}>
      <div className={styles.fee}><span>Consultation</span><strong>{doctor.fee || "Confirm fee"}</strong></div>
      {doctor.modes[mode] === true
        ? <Link className={styles.book} href={design7BookingUrl(doctor, mode, new Date(), variant)} aria-label={`Book appointment with ${doctor.name}`}>Book appointment <ArrowRight size={17} aria-hidden /></Link>
        : <a className={styles.book} href="tel:18602080208" aria-label={`Contact Narayana Health about ${doctor.name}`}>Contact hospital <Phone size={17} aria-hidden /></a>}
    </div>
  </article>;
}
