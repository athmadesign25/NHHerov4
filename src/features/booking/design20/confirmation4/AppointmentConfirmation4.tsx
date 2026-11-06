"use client";

import { useId, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, MapPin, Stethoscope, UserRound, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import type { BookingDoctorSummary } from "../../types";
import { formatBookingDate } from "../../format";
import { receiptCalendar } from "../../design7/model";
import type { Design20Draft } from "../model";
import type { design20Pricing } from "../pricing";
import ConfirmationPayment from "../confirmation3/ConfirmationPayment";
import SuccessMark from "../confirmation3/SuccessMark";
import styles from "./AppointmentConfirmation4.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  draft: Design20Draft;
  pricing: ReturnType<typeof design20Pricing>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export default function AppointmentConfirmation4({ doctor, draft, pricing, headingRef }: Props) {
  const id = useId();
  const reduced = useReducedMotion();
  const [calendarReady, setCalendarReady] = useState(false);
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const selection = draft.receipt?.selection ?? draft.selection;
  const payment = draft.receipt?.payment ?? draft.payment;
  const hospitalVisit = selection.mode === "hospital";
  const date = new Date(`${selection.date}T12:00:00Z`);
  const travel = getDesign16HospitalPreview(selection.hospital);
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  const distance = profile?.practiceLocations?.find(location => location.hospital === selection.hospital)?.distanceKm ?? travel?.distanceKm;
  const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
  const directions = travel?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selection.hospital)}`;
  const calendarUrl = draft.receipt ? `data:text/calendar;charset=utf-8,${encodeURIComponent(receiptCalendar(draft.receipt, doctor.name))}` : undefined;
  const enter = {
    initial: reduced ? false as const : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : duration.slower, ease: ease.out },
  };

  return <article className={styles.confirmation} aria-labelledby={`${id}-title`}>
    <header className={styles.hero}>
      <div className={styles.heroHeading}>
        <SuccessMark />
        <div><p className={styles.eyebrow}>You’re all set!</p><h1 id={`${id}-title`} ref={headingRef} tabIndex={-1}>Appointment confirmed</h1></div>
      </div>
      <p className={styles.notification}>You’ll receive a confirmation email and SMS on your registered contact details.</p>
    </header>

    <motion.div className={styles.pass} {...enter}>
      <section className={styles.dateBand} aria-labelledby={`${id}-date`}>
        <span className={styles.dateStamp} aria-hidden>
          <span>{date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" })}</span>
          <strong>{date.getUTCDate()}</strong>
        </span>
        <div className={styles.dateText}>
          <h2 id={`${id}-date`}>Slot date &amp; time</h2>
          <p><time dateTime={selection.date}>{formatBookingDate(selection.date)}</time><span className={styles.time}><span className={styles.dateDot} aria-hidden>·</span>{selection.time}</span></p>
        </div>
        {calendarUrl && <a className={styles.calendar} href={calendarUrl} download="nh-appointment.ics" onClick={() => setCalendarReady(true)}><CalendarPlus size={17} aria-hidden /><span>Add to calendar</span></a>}
      </section>

      <section className={styles.appointment} aria-labelledby={`${id}-appointment`}>
        <h2 id={`${id}-appointment`}>Your appointment</h2>
        <dl className={styles.facts}>
          {patient && <div className={styles.fact}>
            <dt><UserRound size={18} aria-hidden />Patient</dt>
            <dd><span className={styles.value}>{patient.name}</span>{patient.age !== "" && <span className={styles.supporting}>{patient.age} {patient.age === "1" ? "year" : "years"}</span>}</dd>
          </div>}
          <div className={styles.fact}>
            <dt><Stethoscope size={18} aria-hidden />Doctor</dt>
            <dd><span className={styles.value}>{doctor.name}</span>{doctor.speciality && <span className={styles.supporting}>{doctor.speciality}</span>}</dd>
          </div>
          <div className={`${styles.fact} ${styles.location}`}>
            <dt>{hospitalVisit ? <MapPin size={18} aria-hidden /> : <Video size={18} aria-hidden />}{hospitalVisit ? "Hospital" : "Consultation"}</dt>
            <dd><span className={styles.value}>{hospitalVisit ? selection.hospital : "Video consultation"}
              {hospitalVisit && <a className={styles.distance} href={directions} target="_blank" rel="noopener noreferrer" aria-label={`${distanceLabel}. Get directions to ${travel?.directionsDestination ?? selection.hospital} (opens in a new tab)`} title="Get directions">{distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a>}
            </span></dd>
          </div>
        </dl>
      </section>

      <div className={styles.payment}><ConfirmationPayment pricing={pricing} paid={payment === "online"} /></div>
      <footer className={styles.footer}>
        <p>Track appointments, view your medical history and access health records in your patient portal.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>Back to home</Link>
          <a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.secondary} aria-label="Open patient portal (opens in a new tab)">Open patient portal<ArrowUpRight size={16} aria-hidden /></a>
        </div>
      </footer>
    </motion.div>
    <span className={styles.srOnly} role="status" aria-live="polite">{calendarReady ? "Calendar file ready to download." : ""}</span>
  </article>;
}
