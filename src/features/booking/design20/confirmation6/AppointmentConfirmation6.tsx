"use client";

import { useId, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CalendarPlus, MapPin, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import type { BookingDoctorSummary } from "../../types";
import { formatBookingDate } from "../../format";
import { receiptCalendar } from "../../design7/model";
import type { Design20Draft } from "../model";
import type { design20Pricing } from "../pricing";
import MemberAvatar from "../../design17/MemberAvatar";
import { design17PatientAvatar } from "../../design17/patients";
import SuccessMark from "../confirmation3/SuccessMark";
import ConfirmationPayment from "../confirmation5/ConfirmationPayment";
import styles from "../confirmation5/AppointmentConfirmation5.module.css";
import layout from "./AppointmentConfirmation6.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  draft: Design20Draft;
  pricing: ReturnType<typeof design20Pricing>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export default function AppointmentConfirmation6({ doctor, draft, pricing, headingRef }: Props) {
  const id = useId();
  const reduced = useReducedMotion();
  const [calendarReady, setCalendarReady] = useState(false);
  const member = draft.patients.find(item => item.id === draft.selectedPatientId);
  const patient = member?.patient;
  const selection = draft.receipt?.selection ?? draft.selection;
  const payment = draft.receipt?.payment ?? draft.payment;
  const hospitalVisit = selection.mode === "hospital";
  const travel = getDesign16HospitalPreview(selection.hospital);
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  const distance = profile?.practiceLocations?.find(location => location.hospital === selection.hospital)?.distanceKm ?? travel?.distanceKm;
  const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
  const directions = travel?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selection.hospital)}`;
  const calendarUrl = draft.receipt ? `data:text/calendar;charset=utf-8,${encodeURIComponent(receiptCalendar(draft.receipt, doctor.name))}` : undefined;

  return <article className={styles.confirmation} aria-labelledby={`${id}-title`}>
    <header className={`${styles.hero} ${layout.hero}`}>
      <SuccessMark />
      <div className={styles.heroCopy}>
        <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1}>Your appointment is confirmed</h1>
        <p className={styles.notice}>You’ll receive a confirmation email and SMS on your registered contact details.</p>
      </div>
    </header>

    <motion.div className={styles.receipt}
      initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : duration.slower, ease: ease.out }}>
      <div className={layout.content}>
        {patient && <section className={layout.group} aria-labelledby={`${id}-patient`}>
          <h2 id={`${id}-patient`} className={layout.groupHeading}>Booked for</h2>
          <div className={layout.detailRow}>
            <MemberAvatar src={design17PatientAvatar(member)} name={patient.name} size={40} className={`${styles.patientPhoto} ${layout.patientAvatar}`} />
            <dl className={styles.personDetails}>
              <dt className={styles.srOnly}>Patient</dt>
              <dd><span className={styles.value}>{patient.name}</span>{patient.age !== "" && <span className={styles.supporting}>{patient.age} {patient.age === "1" ? "year" : "years"}</span>}</dd>
            </dl>
          </div>
        </section>}

        <section className={layout.group} aria-labelledby={`${id}-appointment`}>
          <h2 id={`${id}-appointment`} className={layout.groupHeading}>Your appointment</h2>
          <div className={layout.appointmentRows}>
            <div className={layout.detailRow}>
              <MemberAvatar src={doctor.img} name={doctor.name} size={40} className={styles.doctorPhoto} />
              <dl className={styles.personDetails}>
                <dt className={styles.srOnly}>Doctor</dt>
                <dd><span className={styles.value}>{doctor.name}</span>{doctor.speciality && <span className={styles.supporting}>{doctor.speciality}</span>}</dd>
              </dl>
            </div>

            <div className={layout.detailRow}>
              <span className={styles.detailIcon} aria-hidden>{hospitalVisit ? <MapPin size={18} /> : <Video size={18} />}</span>
              <div className={styles.detailContent}>
                <h3 className={styles.detailLabel}>Consultation details</h3>
                <div className={styles.location}>
                  <p className={styles.locationText}>{hospitalVisit ? selection.hospital : "Video consultation"}
                    {hospitalVisit && <a className={styles.distancePill} href={directions} target="_blank" rel="noopener noreferrer" title="Get directions" aria-label={`${distanceLabel}. Get directions to ${travel?.directionsDestination ?? selection.hospital} (opens in a new tab)`}>{distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a>}
                  </p>
                </div>
              </div>
            </div>

            <div className={layout.detailRow}>
              <span className={styles.detailIcon} aria-hidden><CalendarDays size={18} /></span>
              <div className={layout.dateCopy}>
                <h3 className={styles.detailLabel}>Slot date &amp; time</h3>
                <div className={layout.dateGroup}>
                  <p className={styles.dateValue}><span className={styles.dateDay}><time dateTime={selection.date}>{formatBookingDate(selection.date)}</time><span className={styles.dot} aria-hidden>·</span></span>{" "}<span className={styles.time}>{selection.time}</span></p>
                  {calendarUrl && <a className={`${styles.calendar} ${layout.calendar}`} href={calendarUrl} download="nh-appointment.ics" onClick={() => setCalendarReady(true)}><CalendarPlus size={17} aria-hidden />Add to calendar</a>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.payment}><ConfirmationPayment pricing={pricing} paid={payment === "online"} /></div>
      <footer className={styles.footer}>
        <p className={styles.footerNote}>Track appointments, view your medical history and access health records in your patient portal.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>Back to home</Link>
          <a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.secondary} aria-label="Open patient portal (opens in a new tab)">Open patient portal<ArrowUpRight size={16} aria-hidden /></a>
        </div>
      </footer>
    </motion.div>
    <span className={styles.srOnly} role="status" aria-live="polite">{calendarReady ? "Calendar file ready to download." : ""}</span>
  </article>;
}
