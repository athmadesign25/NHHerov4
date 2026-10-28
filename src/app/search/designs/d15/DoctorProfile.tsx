"use client";

import Link from "next/link";
import { ArrowRight, Clock3, GraduationCap, Languages, MapPin, Phone } from "lucide-react";
import { doctorHospitals, nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import type { Design15Variant } from "@/features/design-preview/journeyDesigns";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { DoctorPortrait } from "./DoctorCard";
import { design15BookingHref } from "./directory";
import Modal from "./Modal";
import styles from "./DoctorProfile.module.css";

export default function DoctorProfile({ doctor, mode, now, variant, returnTo, onClose }: {
  doctor: DoctorListingItem; mode: ConsultationMode; now: Date; variant: Design15Variant; returnTo: string; onClose: () => void;
}) {
  const canBook = doctor.modes[mode] === true;
  const slot = nextSlot(doctor, mode, now);
  return <Modal title="Doctor profile" onClose={onClose} footer={<div className={styles.footer}><div><span>Consultation fee</span><strong>{doctor.fee || "Confirm fee"}</strong></div>
    {canBook ? <Link href={design15BookingHref(doctor, mode, now, returnTo, variant)} onClick={onClose} className={styles.book}>Book appointment<ArrowRight size={16} aria-hidden /></Link>
      : <a href="tel:18602080208" className={styles.book}>Contact hospital<Phone size={16} aria-hidden /></a>}</div>}>
    <header className={styles.identity}><DoctorPortrait doctor={doctor} priority className={styles.portrait} /><div><h3>{presentationDoctorName(doctor.name)}</h3><p className={styles.speciality}>{doctor.speciality}</p><p>{doctor.experience ? `${doctor.experience} experience` : "Contact the hospital for experience details."}</p>{doctor.isExecutive && <span className={styles.executive}>Executive consultation</span>}</div></header>
    <div className={styles.sections}>
      <section><h4><Clock3 size={16} aria-hidden />Next available · {mode === "hospital" ? "Hospital" : "Video"}</h4><p>{slot ? doctor.availability[mode] : canBook ? "Choose from available dates and times when booking." : "Contact the hospital for appointment availability."}</p></section>
      <section><h4><GraduationCap size={16} aria-hidden />Qualifications</h4><p>{doctor.degrees || "Contact the hospital for qualification details."}</p></section>
      {Boolean(doctor.expertise?.length) && <section><h4>Areas of care</h4><p>{doctor.expertise?.join(" · ")}</p></section>}
      <section><h4><MapPin size={16} aria-hidden />Practice locations</h4><ul>{doctorHospitals(doctor).map((hospital) => <li key={hospital}>{hospital}</li>)}</ul></section>
      {Boolean(doctor.languages?.length) && <section><h4><Languages size={16} aria-hidden />Languages spoken</h4><p>{doctor.languages?.join(" · ")}</p></section>}
    </div>
  </Modal>;
}
