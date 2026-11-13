"use client";

import { useId, useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Check, ChevronDown, MapPin, ShieldCheck, UserRound, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import type { BookingDoctorSummary } from "../../types";
import { formatBookingDate } from "../../format";
import { receiptCalendar } from "../../design7/model";
import type { Design20Draft } from "../model";
import type { design20Pricing } from "../pricing";
import SuccessMoment from "./SuccessMoment";
import styles from "./AppointmentConfirmation2.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  draft: Design20Draft;
  pricing: ReturnType<typeof design20Pricing>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export default function AppointmentConfirmation2({ doctor, draft, pricing, headingRef }: Props) {
  const id = useId();
  const reduced = useReducedMotion();
  const [failedImage, setFailedImage] = useState(false);
  const [calendarReady, setCalendarReady] = useState(false);
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const selection = draft.receipt?.selection ?? draft.selection;
  const payment = draft.receipt?.payment ?? draft.payment;
  const hospitalVisit = selection.mode === "hospital";
  const covered = pricing.amounts.total === 0;
  const paid = payment === "online";
  const date = new Date(`${selection.date}T12:00:00Z`);
  const month = date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
  const travel = getDesign16HospitalPreview(selection.hospital);
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  const distance = profile?.practiceLocations?.find(location => location.hospital === selection.hospital)?.distanceKm ?? travel?.distanceKm;
  const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
  const directions = travel?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selection.hospital)}`;
  const calendarUrl = draft.receipt ? `data:text/calendar;charset=utf-8,${encodeURIComponent(receiptCalendar(draft.receipt, doctor.name))}` : undefined;
  const entry = { initial: reduced ? false as const : { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : duration.slower, ease: ease.out } };

  return <article className={styles.confirmation} aria-labelledby={`${id}-title`}>
    <header className={styles.hero}>
      <SuccessMoment />
      <motion.div {...entry}>
        <p className={styles.eyebrow}>You’re all set!</p>
        <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1}>Appointment confirmed</h1>
      </motion.div>
    </header>

    <motion.div className={styles.pass} {...entry}>
      <header className={styles.dateBand}>
        <span className={styles.dateStamp} aria-hidden><span>{month}</span><strong>{date.getUTCDate()}</strong></span>
        <div className={styles.dateText}><span>Date &amp; time</span><h2><time dateTime={selection.date}>{formatBookingDate(selection.date)}</time><span className={styles.time}><span aria-hidden>·</span>{selection.time}</span></h2></div>
        {calendarUrl && <a className={styles.calendar} href={calendarUrl} download="nh-appointment.ics" onClick={() => setCalendarReady(true)}><CalendarPlus size={17} aria-hidden /><span>Add to calendar</span></a>}
      </header>

      <div className={styles.body}>
        <section className={styles.appointment} aria-labelledby={`${id}-appointment`}>
          <h2 className={styles.sectionTitle} id={`${id}-appointment`}>Your appointment</h2>
          <div className={styles.doctor}>
            {doctor.img && !failedImage ? <Image src={doctor.img} alt="" width={56} height={64} sizes="56px" className={styles.portrait} onError={() => setFailedImage(true)} /> : <span className={styles.portrait}><UserRound size={24} aria-hidden /></span>}
            <div><h3>{doctor.name}</h3>{doctor.speciality && <p>{doctor.speciality}</p>}</div>
          </div>
          <div className={styles.location}>
            {hospitalVisit ? <MapPin size={18} aria-hidden /> : <Video size={18} aria-hidden />}
            <div><span className={styles.label}>{hospitalVisit ? "Hospital" : "Consultation"}</span><p>{hospitalVisit ? selection.hospital : "Video consultation"}
              {hospitalVisit && <a className={styles.distance} href={directions} target="_blank" rel="noopener noreferrer" aria-label={`${distanceLabel}. Get directions to ${travel?.directionsDestination ?? selection.hospital} (opens in a new tab)`} title="Get directions">{distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a>}
            </p></div>
          </div>
        </section>

        <section className={styles.memberPayment} aria-label="Patient and payment">
          {patient && <div className={styles.member}><span className={styles.memberIcon}><UserRound size={19} aria-hidden /></span><div><span className={styles.label}>Booking for</span><h2>{patient.name}</h2>{patient.age !== "" && <p>{patient.age} {patient.age === "1" ? "year" : "years"}</p>}</div></div>}
          <div className={styles.paymentSummary} data-settled={covered || paid}>
            <div className={styles.paymentStatus}>{covered || paid ? <ShieldCheck size={18} aria-hidden /> : <span className={styles.dueDot} aria-hidden />}<span>{covered ? "Covered by benefits" : paid ? "Paid online" : "Pay at hospital"}</span></div>
            <p className={styles.amount}><strong>{pricing.total}</strong><span>{covered ? "Amount due" : paid ? "Amount paid" : "Due at reception"}</span></p>
          </div>
          <details className={styles.paymentDetails}>
            <summary>Payment details<ChevronDown size={14} aria-hidden /></summary>
            <dl><div><dt>Consultation fee</dt><dd>{pricing.base}</dd></div>
              {pricing.hasSponsorship && <div><dt>Sponsorship applied</dt><dd>−{pricing.sponsorshipDiscount}</dd></div>}
              {pricing.hasCoupon && <div><dt>Coupon applied</dt><dd>−{pricing.couponDiscount}</dd></div>}
              {pricing.hasHealthCredits && <div><dt>Health credits applied</dt><dd>−{pricing.healthCreditsDiscount}</dd></div>}
            </dl>
          </details>
        </section>
      </div>
      {pricing.hasDiscount && <div className={styles.savings}><Check size={16} aria-hidden /><span>You saved <strong>{pricing.discount}</strong> on this booking</span><span className={styles.savingsSweep} aria-hidden /></div>}
      <footer className={styles.actions}>
        <a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label="Open patient portal (opens in a new tab)">Open patient portal<ArrowUpRight size={17} aria-hidden /></a>
        <Link className={styles.home} href="/">Back to home</Link>
      </footer>
    </motion.div>
    <span className={styles.srOnly} role="status" aria-live="polite">{calendarReady ? "Calendar file ready to download." : ""}</span>
  </article>;
}
