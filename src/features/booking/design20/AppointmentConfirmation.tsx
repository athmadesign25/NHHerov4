"use client";

import { useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, MapPin, UserRound, Video } from "lucide-react";
import type { BookingDoctorSummary } from "../types";
import { formatBookingDate } from "../format";
import type { Design20Draft } from "./model";
import type { design20Pricing } from "./pricing";
import styles from "./AppointmentConfirmation.module.css";

interface AppointmentConfirmationProps {
  doctor: BookingDoctorSummary;
  draft: Design20Draft;
  pricing: ReturnType<typeof design20Pricing>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export default function AppointmentConfirmation({ doctor, draft, pricing, headingRef }: AppointmentConfirmationProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const selection = draft.receipt?.selection ?? draft.selection;
  const payment = draft.receipt?.payment ?? draft.payment;
  const covered = pricing.amounts.total === 0;
  const paid = payment === "online";
  const hospitalVisit = selection.mode === "hospital";

  return <article className={styles.confirmation} aria-labelledby="appointment-confirmed-title">
    <header className={styles.heading}>
      <span className={styles.successMark} aria-hidden="true"><Check size={28} strokeWidth={2} /></span>
      <h1 id="appointment-confirmed-title" ref={headingRef} tabIndex={-1}>Appointment confirmed</h1>
    </header>

    <div className={styles.content}>
      <section className={styles.appointment} aria-labelledby="confirmed-doctor-name">
        <header className={styles.doctor}>
          {doctor.img && failedImage !== doctor.img
            ? <Image src={doctor.img} alt="" width={80} height={96} sizes="80px" className={styles.portrait} onError={() => setFailedImage(doctor.img)} />
            : <span className={styles.portrait}><UserRound size={28} aria-hidden /></span>}
          <div><h2 id="confirmed-doctor-name">{doctor.name}</h2>{doctor.speciality && <p>{doctor.speciality}</p>}</div>
        </header>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt><CalendarDays size={20} aria-hidden />Date & time</dt><dd className={styles.slot}><time dateTime={selection.date}>{formatBookingDate(selection.date)}</time><span><span className={styles.dot} aria-hidden>·</span>{selection.time}</span></dd>
          </div>
          {patient && <div className={styles.detail}>
            <dt><UserRound size={20} aria-hidden />Booking for</dt><dd>{patient.name}{patient.age !== "" && <span className={styles.secondaryText}> · {patient.age} {patient.age === "1" ? "year" : "years"}</span>}</dd>
          </div>}
          <div className={styles.detail}>
            <dt>{hospitalVisit ? <MapPin size={20} aria-hidden /> : <Video size={20} aria-hidden />}{hospitalVisit ? "Hospital" : "Consultation"}</dt><dd>{hospitalVisit ? selection.hospital : "Video consultation"}</dd>
          </div>
        </dl>
        {!hospitalVisit && <p className={styles.note}>Have a stable connection and your reports ready.</p>}
      </section>

      <section className={styles.payment} aria-labelledby="confirmed-payment-title">
        <h2 id="confirmed-payment-title">Payment details</h2>
        <p className={covered || paid ? styles.paymentSuccess : styles.paymentStatus}>
          {(covered || paid) && <Check size={16} aria-hidden />}
          {covered ? "Covered by benefits" : paid ? "Paid online" : "Pay at hospital"}
        </p>
        <dl className={styles.breakdown}>
          <div><dt>Consultation fee</dt><dd>{pricing.base}</dd></div>
          {pricing.hasSponsorship && <div><dt>Sponsorship applied</dt><dd className={styles.discount}>−{pricing.sponsorshipDiscount}</dd></div>}
          {pricing.hasCoupon && <div><dt>Coupon applied</dt><dd className={styles.discount}>−{pricing.couponDiscount}</dd></div>}
          {pricing.hasHealthCredits && <div><dt>Health credits applied</dt><dd className={styles.discount}>−{pricing.healthCreditsDiscount}</dd></div>}
          <div className={styles.total}><dt>{covered ? "Amount due" : paid ? "Amount paid" : "Due at hospital"}</dt><dd>{pricing.total}</dd></div>
        </dl>
        {hospitalVisit && !paid && !covered && <p className={styles.note}>Pay at reception before your consultation.</p>}
      </section>
    </div>

    <footer className={styles.footer}>
      <div><h2>Manage your appointment</h2><p>Appointments and health records in your patient portal.</p></div>
      <div className={styles.actions}>
        <a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label="Open patient portal (opens in a new tab)">Open patient portal <ArrowUpRight size={17} aria-hidden /></a>
        <Link href="/" className={styles.home}>Back to home</Link>
      </div>
    </footer>
  </article>;
}
