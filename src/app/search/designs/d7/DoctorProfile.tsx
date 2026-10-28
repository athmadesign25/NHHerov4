"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Languages, MapPin, Phone, X } from "lucide-react";
import { doctorHospitals, nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { isQuickJourneyDesign, type JourneyDesign } from "@/features/design-preview/journeyDesigns";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { quickBookingHref } from "@/features/booking/design13/navigation";
import { DoctorPortrait } from "./DoctorCard";
import { design7BookingUrl } from "./directory";
import styles from "./DoctorProfile.module.css";

export default function DoctorProfile({ doctor, mode, variant = "d7", now = new Date(), returnTo = "/search/doctors?design=d13", onClose }: {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  variant?: JourneyDesign;
  now?: Date;
  returnTo?: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isQuick = isQuickJourneyDesign(variant);
  const displayDoctor = variant === "d14" ? { ...doctor, name: presentationDoctorName(doctor.name) } : doctor;
  const hasQuickSlot = isQuick && doctor.modes[mode] === true && Boolean(nextSlot(doctor, mode, now));
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="d7-profile-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} data-lenis-prevent data-journey-design={variant} data-journey-palette={variant === "d9" ? "dark" : variant === "d12" || isQuick ? "light" : undefined}>
    <div className={styles.content}>
      <div className={styles.top}><span>Meet your specialist</span><button type="button" onClick={onClose} aria-label="Close doctor profile"><X size={20} aria-hidden /></button></div>
      <header className={styles.header}>
        <DoctorPortrait doctor={displayDoctor} priority />
        <div><p className={styles.speciality}>{doctor.speciality}</p><h2 id="d7-profile-title">{displayDoctor.name}</h2><p className={styles.experience}>{doctor.experience} of experience</p>{doctor.isExecutive && <span className={styles.executive}>Executive consultation</span>}</div>
      </header>
      <div className={styles.sections}>
        <section><h3><GraduationCap size={18} aria-hidden />Qualifications</h3><p>{doctor.degrees || "Please contact the hospital for qualification details."}</p></section>
        {Boolean(doctor.expertise?.length) && <section><h3><BriefcaseBusiness size={18} aria-hidden />Areas of care</h3><div className={styles.tags}>{doctor.expertise?.map((value) => <span key={value}>{value}</span>)}</div></section>}
        {Boolean(doctor.languages?.length) && <section><h3><Languages size={18} aria-hidden />Languages spoken</h3><p>{doctor.languages?.join(" · ")}</p></section>}
        <section><h3><MapPin size={18} aria-hidden />Practice locations</h3><ul>{doctorHospitals(doctor).map((hospital) => <li key={hospital}>{hospital}</li>)}</ul><p className={styles.note}>Choose your hospital and appointment time in the next step.</p></section>
      </div>
      <footer className={styles.footer}>
        <div><span>Consultation fee</span><strong>{doctor.fee || "Confirm with hospital"}</strong></div>
        {doctor.modes[mode] === true ? isQuick
          ? <div className={styles.quickFooterActions}>
            {hasQuickSlot && <Link href={quickBookingHref(doctor, mode, now, returnTo, "choose", variant)} className={styles.moreTimes} onClick={onClose}>More times</Link>}
            <Link href={quickBookingHref(doctor, mode, now, returnTo, hasQuickSlot ? "slot" : "choose", variant)} onClick={onClose}>{hasQuickSlot ? doctor.availability[mode] : "Choose a time"} <ArrowRight size={18} aria-hidden /></Link>
          </div>
          : <Link href={design7BookingUrl(doctor, mode, new Date(), variant)} onClick={onClose}>Choose appointment <ArrowRight size={18} aria-hidden /></Link>
          : <a href="tel:18602080208">Contact hospital <Phone size={18} aria-hidden /></a>}
      </footer>
    </div>
  </dialog>;
}
