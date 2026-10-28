"use client";

import { ArrowRight, Building2, CalendarDays, Check, CreditCard, Pencil, UserRound, Video } from "lucide-react";
import { formatBookingDate } from "../format";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "./model";
import styles from "./Booking.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  patient: PatientDraft;
  payment: PaymentChoice;
  onPayment: (value: PaymentChoice) => void;
  accepted: boolean;
  onAccepted: (value: boolean) => void;
  onEdit: (step: "appointment" | "patient") => void;
  onContinue: () => void;
  expired: boolean;
  busy: boolean;
}

export default function ReviewStep({ doctor, selection, patient, payment, onPayment, accepted, onAccepted, onEdit, onContinue, expired, busy }: Props) {
  return <section className={styles.panel} aria-labelledby="d7-review-heading">
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>ONE LAST LOOK</span><h2 id="d7-review-heading">Your care, all in place.</h2><p>Check your appointment and choose how you&apos;d prefer to pay.</p></div>
    <div className={styles.reviewSection}><div className={styles.reviewHeading}><h3><CalendarDays size={18} aria-hidden />Appointment</h3><button type="button" className={styles.textButton} onClick={() => onEdit("appointment")}><Pencil size={14} aria-hidden />Edit appointment</button></div>
      <dl className={styles.reviewDetails}><div><dt>Consultation</dt><dd>{selection.mode === "hospital" ? "Hospital visit" : "Video consultation"}</dd></div><div><dt>Date & time</dt><dd>{formatBookingDate(selection.date)} · {selection.time}</dd></div><div><dt>{selection.mode === "hospital" ? "Hospital" : "Location"}</dt><dd>{selection.mode === "hospital" ? selection.hospital : "Online · video call preview"}</dd></div></dl>
    </div>
    <div className={styles.reviewSection}><div className={styles.reviewHeading}><h3><UserRound size={18} aria-hidden />Patient details</h3><button type="button" className={styles.textButton} onClick={() => onEdit("patient")}><Pencil size={14} aria-hidden />Edit patient</button></div>
      <dl className={styles.reviewDetails}><div><dt>Patient</dt><dd>{patient.name} <span className={styles.muted}>· {patient.age} years · {patient.gender}</span></dd></div><div><dt>Mobile</dt><dd>+91 {patient.phone} <span className={styles.verifiedInline}><Check size={13} aria-hidden />Demo verified</span></dd></div>{patient.email && <div><dt>Email</dt><dd>{patient.email}</dd></div>}</dl>
    </div>
    <fieldset className={styles.fieldset}><legend>Payment preference</legend><div className={styles.paymentOptions}>
      <button type="button" className={styles.paymentOption} aria-pressed={payment === "online"} onClick={() => onPayment("online")}><span className={styles.paymentIcon}><CreditCard size={22} aria-hidden /></span><span><strong>Pay online</strong><small>Try a secure payment experience in demo mode</small></span><span className={styles.radioMark} aria-hidden>{payment === "online" && <Check size={12} />}</span></button>
      {selection.mode === "hospital" ? <button type="button" className={styles.paymentOption} aria-pressed={payment === "hospital"} onClick={() => onPayment("hospital")}><span className={styles.paymentIcon}><Building2 size={22} aria-hidden /></span><span><strong>Pay at the hospital</strong><small>Complete payment at the reception before your visit</small></span><span className={styles.radioMark} aria-hidden>{payment === "hospital" && <Check size={12} />}</span></button>
        : <p className={styles.smallNote}><Video size={15} aria-hidden />Video consultations use online payment in this preview.</p>}
    </div></fieldset>
    <div className={styles.priceBreakdown}><div><span>Consultation fee</span><span>{doctor.fee}</span></div><div><span>Additional charges</span><span>₹0</span></div><div className={styles.priceTotal}><strong>Total {payment === "online" ? "to pay" : "at hospital"}</strong><strong>{doctor.fee}</strong></div><p>Illustrative preview fee. No real payment is collected.</p></div>
    <label className={styles.checkbox}><input type="checkbox" checked={accepted} onChange={event => onAccepted(event.target.checked)} /><span>I have checked the appointment and patient details. I understand this creates a demonstration booking only.</span></label>
    <div className={styles.actions}><p className={styles.smallNote}>{payment === "online" ? "Your slot stays held while you finish payment." : "No online payment is required for this option."}</p><button type="button" className={styles.primary} disabled={!accepted || expired || busy} onClick={onContinue}>{busy ? "Completing…" : payment === "online" ? "Continue to payment" : "Confirm preview appointment"}<ArrowRight size={18} aria-hidden /></button></div>
  </section>;
}
