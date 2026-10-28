"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Phone, Stethoscope, UserRound } from "lucide-react";
import { nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { design7BookingUrl } from "../d7/directory";
import styles from "./DoctorScanCard.module.css";

interface Props {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  priority?: boolean;
  onProfile: (doctor: DoctorListingItem) => void;
}

export default function DoctorScanCard({ doctor, mode, priority = false, onProfile }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60_000);
    const resume = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", resume);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", resume); };
  }, []);
  const offered = doctor.modes[mode];
  const slot = offered === true ? nextSlot(doctor, mode, now) : null;
  const appointment = offered === null ? "Contact hospital to confirm"
    : offered === false ? "Not offered in this preview"
      : slot ? doctor.availability[mode] : "Choose a date & time";
  const expertise = doctor.expertise?.slice(0, 2).join(" · ");

  return <article className={styles.card} data-doctor-card data-journey-design="d12" data-journey-palette="light">
    <header className={styles.header}>
      <div className={styles.portrait}>
        {doctor.img && !imageFailed
          ? <Image src={doctor.img} alt={doctor.name} fill sizes="80px" priority={priority} className={styles.photo} onError={() => setImageFailed(true)} />
          : <UserRound size={32} strokeWidth={1.4} aria-label="Doctor portrait unavailable" />}
        {doctor.isExecutive && <span className={styles.executive}>Executive</span>}
      </div>
      <div className={styles.identity}>
        <h3><button type="button" className={styles.name} onClick={() => onProfile(doctor)} aria-label={`View profile of ${doctor.name}`}>{doctor.name}</button></h3>
        <p className={styles.speciality}>{doctor.speciality || "Speciality not listed"}</p>
      </div>
    </header>

    <p className={styles.clinicalFit}><Stethoscope size={15} aria-hidden /><span><span className={styles.srOnly}>Areas of care: </span>{expertise || "Areas of care not listed"}</span></p>

    <dl className={styles.metrics}>
      <div><dt>Experience</dt><dd>{doctor.experience || "Not listed"}</dd></div>
      <div><dt>Consultation fee</dt><dd className={styles.fee}>{doctor.fee || "Confirm fee"}</dd></div>
    </dl>

    <div className={styles.location}>
      <MapPin size={16} aria-hidden />
      <div><span className={styles.label}>Hospital</span><p>{doctor.hospital || "Hospital not listed"}</p></div>
    </div>

    <div className={styles.availability} data-has-slot={Boolean(slot) || undefined}>
      <Clock3 size={16} aria-hidden />
      <div><span className={styles.label}>{slot ? "Preview appointment" : "Next appointment"}<span className={styles.srOnly}> · {mode === "hospital" ? "Hospital visit" : "Video consultation"}</span></span><p>{appointment}</p></div>
    </div>

    <footer className={styles.actions}>
      {offered === true
        ? <Link href={design7BookingUrl(doctor, mode, now, "d12")} className={styles.book} aria-label={`Book appointment with ${doctor.name}`}>Book appointment <ArrowRight size={16} aria-hidden /></Link>
        : <a href="tel:18602080208" className={styles.book} aria-label={`Contact Narayana Health about ${doctor.name}`}>Contact hospital <Phone size={16} aria-hidden /></a>}
      <button type="button" className={styles.profile} onClick={() => onProfile(doctor)} aria-label={`View full profile of ${doctor.name}`}>Profile <ArrowUpRight size={15} aria-hidden /></button>
    </footer>
  </article>;
}
