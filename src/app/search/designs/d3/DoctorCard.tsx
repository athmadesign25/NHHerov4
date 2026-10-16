"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, CalendarSearch, Check, MapPin, PhoneCall, UserRound, Video, Zap } from "lucide-react";
import { bookingUrl, doctorHospitals, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import styles from "../DoctorCardCompact.module.css";
import enhancements from "./DoctorCard.module.css";

interface Props {
  doctor: DoctorListingItem; mode: ConsultationMode; live: boolean;
  onBook: (event: MouseEvent, doctor: DoctorListingItem, mode: ConsultationMode, includeSlot: boolean) => void;
  onDetails: (doctor: DoctorListingItem) => void;
}

/** Reuses Design 2 Compact's visual CSS; improvements are scoped to Design 3. */
export default function DoctorCard({ doctor: doc, mode, live, onBook, onDetails }: Props) {
  const reduced = useReducedMotion();
  const locations = doctorHospitals(doc);
  const extra = Math.max(0, locations.length - 1);
  const specialities = doc.speciality.split(/\s*[,|/]\s*/).filter(Boolean);
  const [locOpen, setLocOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const popId = useId();
  const nameId = useId();
  const slots = (mode === "video" ? ["video"] as const : ["hospital", "video"] as const).filter((type) => Boolean(doc.availability[type]?.trim()));
  const availableToday = doc.availability[mode]?.toLowerCase().startsWith("today");
  const url = (type: ConsultationMode, includeSlot = false) => `${bookingUrl(doc, type, includeSlot)}&design=d3`;
  useEffect(() => {
    if (!locOpen) return;
    const pointer = (event: PointerEvent) => { if (!locationRef.current?.contains(event.target as Node)) setLocOpen(false); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") setLocOpen(false); };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", keyboard); };
  }, [locOpen]);

  const identity = <>
    {doc.img ? <Image src={doc.img} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1099px) 50vw, 320px" className={styles.photoImg} />
      : <div className={enhancements.portraitFallback}><UserRound size={80} strokeWidth={1} aria-hidden /><span>Photo unavailable</span></div>}
    <span className={styles.tint} aria-hidden /><span className={styles.scrim} aria-hidden />
    {availableToday && <span className={`${styles.label} ${enhancements.today}`}><Zap size={12} aria-hidden /> Available today</span>}
    <span className={styles.cue} aria-hidden>{live ? "View details" : "View profile"} <ArrowRight size={13} /></span>
    <div className={styles.idText}>
      <h2 id={nameId} className={`${styles.name} ${enhancements.name}`}>{doc.name}</h2>
      <span className={styles.specRow}><span className={styles.spec}>{specialities[0] || "Speciality unavailable"}</span>
        {specialities.length > 1 && <span className={styles.specMore} aria-label={`${specialities.length - 1} more specialities`}>+{specialities.length - 1}</span>}
      </span>
      {doc.degrees && <span className={styles.degrees}>{doc.degrees}</span>}
    </div>
  </>;
  return <motion.article aria-labelledby={nameId} className={`${styles.card} ${enhancements.card}`}
    initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
    {live ? <button type="button" className={`${styles.identity} ${enhancements.identityButton}`} onClick={() => onDetails(doc)} aria-label={`View details of ${doc.name}`}>{identity}</button>
      : <Link href={`/doctors/${encodeURIComponent(doc.id)}`} className={styles.identity} aria-label={`View profile of ${doc.name}`}>{identity}</Link>}
    <div className={styles.body}>
      <div className={styles.location} ref={locationRef}>
        <MapPin size={15} className={styles.locIcon} aria-hidden />
        <span className={styles.locName} title={locations[0]}>{locations[0] || "Hospital details unavailable"}</span>
        {locations.length > 0 && <button type="button" className={`${styles.locMore} ${enhancements.more}`} aria-expanded={locOpen} aria-controls={popId} aria-label={`Show practice locations for ${doc.name}`} onClick={() => setLocOpen(!locOpen)}>{extra ? `+${extra} more` : "Details"}</button>}
        {locOpen && <div id={popId} className={`${styles.locPop} ${enhancements.locations}`}>
          <span className={styles.locPopTitle}>Practice {locations.length === 1 ? "location" : "locations"}</span>
          <ul>{locations.map((hospital, index) => <li key={hospital}><MapPin size={13} aria-hidden /><span>{hospital}</span>{index === 0 && <span className={styles.locPrimary}><Check size={11} aria-hidden />Primary</span>}</li>)}</ul>
        </div>}
      </div>
      <div className={styles.availability}>
        <span className={styles.availLabel}>{slots.length ? "Next available" : "Appointment availability"}</span>
        {slots.length ? <div className={slots.length > 1 ? styles.slots : undefined}>{slots.map((type) => {
          const Icon = type === "hospital" ? Building2 : Video;
          return <a key={type} href={url(type, true)} onClick={(event) => onBook(event, doc, type, true)}
            className={`${styles.slot} ${slots.length === 1 ? styles.slotFull : ""}`}
            aria-label={`${type === "hospital" ? "Hospital visit" : "Video consultation"} with ${doc.name}, ${doc.availability[type]}`}>
            <span className={slots.length === 1 ? styles.slotFullLeft : enhancements.slotContent}><span className={styles.slotHead}><Icon size={13} aria-hidden />{type === "hospital" ? "Hospital" : "Video"}</span>
              <span className={`${styles.slotTime} ${enhancements.slotTime}`}>{doc.availability[type]?.replace(/, 0(\d:\d\d)/, ", $1")}</span></span>
            {slots.length === 1 && <ArrowRight size={15} aria-hidden className={styles.slotArrow} />}
          </a>;
        })}</div> : <button type="button" onClick={(event) => onBook(event, doc, mode, false)} className={`${styles.slot} ${styles.slotFull} ${styles.slotCheck}`}>
          <span className={styles.slotFullLeft}><span className={styles.slotHead}><CalendarSearch size={13} aria-hidden />{mode === "video" ? "Video consultation" : "Hospital visit"}</span><span className={styles.slotTime}>Check availability</span></span><ArrowRight size={15} aria-hidden />
        </button>}
      </div>
      <div className={styles.footer}>
        <div className={styles.fee}>{doc.fee ? <><span className={styles.feeAmount}>{doc.fee}</span><span className={styles.feeNote}>Consultation fee</span></> : <><span className={styles.feeNote}>Consultation fee</span><span className={styles.feeTbd}>Unavailable</span></>}</div>
        <a href="tel:18602080208" className={styles.callBtn} aria-label={`Contact NH about ${doc.name}`}><PhoneCall size={18} aria-hidden /></a>
        {live ? <button type="button" onClick={(event) => onBook(event, doc, mode, false)} className={`${styles.bookBtn} ${enhancements.primaryAction}`}>Enquire<ArrowRight size={16} aria-hidden /></button>
          : <a href={url(mode, Boolean(doc.availability[mode]))} onClick={(event) => onBook(event, doc, mode, Boolean(doc.availability[mode]))} className={`${styles.bookBtn} ${enhancements.primaryAction}`}>Book now<ArrowRight size={16} aria-hidden /></a>}
      </div>
    </div>
  </motion.article>;
}
