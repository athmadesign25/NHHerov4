"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Video } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import { formatBookingDate } from "../format";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection } from "../design7/model";
import type { SavedPatient } from "../design14/patients";
import MemberAvatar from "../design17/MemberAvatar";
import { design17PatientAvatar } from "../design17/patients";
import styles from "./PaymentReservation.module.css";

type Props = {
  seconds: number;
  expired: boolean;
  doctor: BookingDoctorSummary;
  member?: SavedPatient;
  selection: AppointmentSelection;
  total: string;
  onChooseSlot: () => void;
};

export default function PaymentReservation({ seconds, expired, doctor, member, selection, total, onChooseSlot }: Props) {
  const titleId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const remaining = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(remaining / 60);
  const secondsPart = String(remaining % 60).padStart(2, "0");
  const patient = member?.patient;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expired, reduced]);

  return <motion.section className={styles.reservation} aria-labelledby={titleId}
    initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : duration.slow, ease: ease.out }}>
    <header className={styles.header}>
      <span className={styles.mark} aria-hidden><Clock3 size={32} strokeWidth={1.7} /></span>
      <p className={styles.status}>{expired ? "Reservation expired" : "Payment pending"}</p>
      <h1 ref={heading} tabIndex={-1} id={titleId}>{expired ? "Your slot reservation has expired" : "Your slot is reserved"}</h1>
      <p className={styles.description}>{expired
        ? "The slot has been released. Choose another available time to complete your booking."
        : "Complete payment in your patient portal before the timer ends to confirm your appointment."}</p>
      {!expired && <div className={styles.timerGroup}>
        <span className={styles.timer} role="timer" aria-live="off" aria-label={`${minutes} minutes ${remaining % 60} seconds remaining`}>{minutes}:{secondsPart}</span>
        <span className={styles.timerLabel}>remaining</span>
      </div>}
      {!expired && <p className={styles.release}>Unpaid reservations are released automatically.</p>}
    </header>

    <div className={styles.appointment}>
      {patient && <section aria-labelledby={`${titleId}-patient`}>
        <h2 className={styles.groupHeading} id={`${titleId}-patient`}>Booking for</h2>
        <div className={styles.identity}>
          <MemberAvatar src={design17PatientAvatar(member)} name={patient.name} size={40} className={styles.avatar} />
          <div><p className={styles.value}>{patient.name}</p>{patient.age !== "" && <p className={styles.supporting}>{patient.age} {patient.age === "1" ? "year" : "years"}</p>}</div>
        </div>
      </section>}
      <section aria-labelledby={`${titleId}-appointment`}>
        <h2 className={styles.groupHeading} id={`${titleId}-appointment`}>Your appointment</h2>
        <div className={styles.details}>
          <div className={styles.identity}>
            <MemberAvatar src={doctor.img} name={doctor.name} size={40} className={styles.avatar} />
            <div><p className={styles.value}>{doctor.name}</p>{doctor.speciality && <p className={styles.supporting}>{doctor.speciality}</p>}</div>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailIcon} aria-hidden>{selection.mode === "video" ? <Video size={18} /> : <MapPin size={18} />}</span>
            <div><p className={styles.label}>Consultation details</p><p className={styles.value}>{selection.mode === "video" ? "Video consultation" : selection.hospital}</p></div>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailIcon} aria-hidden><CalendarDays size={18} /></span>
            <div><p className={styles.label}>Slot date &amp; time</p><p className={styles.value}><time dateTime={selection.date}>{formatBookingDate(selection.date)}</time><span className={styles.dot} aria-hidden> · </span><span className={styles.time}>{selection.time}</span></p></div>
          </div>
        </div>
      </section>
      <div className={styles.amount}><span>Amount to pay</span><strong>{total}</strong></div>
    </div>

    <div className={styles.actions}>
      {expired
        ? <button type="button" className={styles.primary} onClick={onChooseSlot}>Choose another slot</button>
        : <a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label="Open patient portal (opens in a new tab)">Open patient portal<ArrowUpRight size={17} aria-hidden /></a>}
      <Link href="/" className={styles.secondary}>Back to home</Link>
    </div>
  </motion.section>;
}
