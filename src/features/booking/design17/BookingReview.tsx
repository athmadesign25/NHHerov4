"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, CalendarDays, CreditCard, MapPin, Pencil, Tag, UserRound, Video } from "lucide-react";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "../design7/model";
import type { BookingDoctorSummary, ConsultationType } from "../types";
import { formatBookingDate } from "../format";
import { appointmentPricing, DISCOUNT_CODE } from "./pricing";
import styles from "./Booking.module.css";

export default function BookingReview({ doctor, selection, patient, fee, mode, discountCode, busy, expired, retrying, onDiscount, onEditAppointment, onPay, onLater }: {
  doctor: BookingDoctorSummary; selection: AppointmentSelection; patient: PatientDraft; fee: string; mode: ConsultationType; discountCode?: string; busy: boolean; expired: boolean; retrying: boolean;
  onDiscount: (code: string) => boolean; onEditAppointment: () => void; onPay: (payment: PaymentChoice) => void; onLater: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const pricing = appointmentPricing(fee, discountCode);
  return <section className={`${styles.panel} ${styles.reviewPanel}`} aria-labelledby="d17-review-heading">
    <header className={styles.reviewDoctor}>
      <Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt="" width={48} height={48} sizes="48px" />
      <div><h2 id="d17-review-heading">{doctor.name}</h2><p className={styles.muted}>{doctor.speciality}</p></div>
      <button type="button" className={styles.textButton} disabled={busy} onClick={onEditAppointment}><Pencil size={14} aria-hidden />Edit details</button>
    </header>
    <div className={styles.reviewRecap}>
      <div className={styles.reviewSlot}><CalendarDays size={17} aria-hidden /><div><span className={styles.slotLabel}>Selected slot</span><strong>{formatBookingDate(selection.date, "short")} · {selection.time} <span className={styles.slotTimezone}>IST</span></strong></div></div>
      <div className={styles.reviewMember}><UserRound size={17} aria-hidden /><div><span className={styles.slotLabel}>Patient</span><strong>{patient.name} <span className={styles.reviewAge}>· {patient.age} years</span></strong></div></div>
      <p className={styles.reviewLocation}>{mode === "hospital" ? <MapPin size={17} aria-hidden /> : <Video size={17} aria-hidden />}<span>{mode === "hospital" ? selection.hospital : "Video consultation"}</span></p>
    </div>
    <div className={styles.discountSection}>
      {pricing.hasDiscount ? <div className={styles.discountApplied} role="status"><Tag size={18} aria-hidden /><div><strong>{discountCode} applied</strong><p>You save {pricing.discount}</p></div><button type="button" className={styles.textButton} disabled={busy} onClick={() => { onDiscount(""); setCode(""); setError(""); }}>Remove</button></div>
      : <details><summary><Tag size={18} aria-hidden />Apply discount</summary><form className={styles.discountForm} onSubmit={event => { event.preventDefault(); if (!onDiscount(code)) setError("This code isn’t valid. Check it and try again."); else setError(""); }}>
        <label htmlFor="d17-discount-code">Discount code</label><div className={styles.discountInput}><input id="d17-discount-code" value={code} maxLength={32} disabled={busy || expired} onChange={event => { setCode(event.target.value); setError(""); }} placeholder="Enter code" autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? "d17-discount-error" : "d17-discount-hint"} /><button type="submit" className={styles.primary} disabled={busy || expired || !code.trim()}>Apply</button></div>
        {error && <p id="d17-discount-error" className={styles.discountError} role="alert">{error}</p>}<p id="d17-discount-hint" className={styles.muted}>Use {DISCOUNT_CODE} for 10% off your consultation.</p>
      </form></details>}
    </div>
    <div className={styles.priceBreakdown}><div><span>Consultation fee</span><span>{pricing.base}</span></div>{pricing.hasDiscount && <div><span>Discount</span><span>−{pricing.discount}</span></div>}<div className={styles.amountDue}><strong>Total payable</strong><strong>{pricing.total}</strong></div></div>
    <div className={styles.payActions}>
      <button type="button" className={`${styles.payAction} ${styles.payOnline}`} disabled={busy || expired} onClick={() => onPay("online")}><CreditCard size={22} aria-hidden /><span><strong>Pay online</strong><small>UPI or card</small></span></button>
      {mode === "hospital" && <button type="button" className={`${styles.payAction} ${styles.payHospital}`} disabled={busy || expired} onClick={() => onPay("hospital")}><Building2 size={22} aria-hidden /><span><strong>Pay at hospital</strong><small>Confirm now, pay at reception</small></span></button>}
    </div>
    {busy && <p className={styles.muted} role="status">Confirming your appointment…</p>}
    {retrying && <button type="button" className={styles.textButton} disabled={busy} onClick={onLater}>Finish later</button>}
  </section>;
}
