"use client";

import { ArrowRight, Building2, CreditCard, Pencil } from "lucide-react";
import type { PatientDraft, PaymentChoice } from "../design7/model";
import type { ConsultationType } from "../types";
import styles from "./Booking.module.css";

export default function BookingReview({ patient, fee, mode, payment, busy, expired, retrying, onPayment, onEditPatient, onSubmit, onLater }: {
  patient: PatientDraft; fee: string; mode: ConsultationType; payment: PaymentChoice; busy: boolean; expired: boolean; retrying: boolean;
  onPayment: (payment: PaymentChoice) => void; onEditPatient: () => void; onSubmit: () => void; onLater: () => void;
}) {
  return <section className={styles.panel} aria-labelledby="d15-review-heading">
    <header className={styles.sectionHeading}><h2 id="d15-review-heading">Check your appointment</h2><p>Review the details, then choose how to pay.</p></header>
    <div className={styles.reviewPatient}><div><span>Patient</span><strong>{patient.name}</strong><small>{patient.age} years</small></div><button type="button" className={styles.textButton} disabled={busy} onClick={onEditPatient}><Pencil size={14} aria-hidden />Change patient</button></div>
    <fieldset className={styles.paymentChoices} disabled={busy}><legend>Payment method</legend><label className={styles.paymentChoice} data-selected={payment === "online" || undefined}><input type="radio" name="d15-payment" checked={payment === "online"} onChange={() => onPayment("online")} /><CreditCard size={20} aria-hidden /><span><strong>Pay online</strong><small>UPI or card</small></span></label>
      {mode === "hospital" && <label className={styles.paymentChoice} data-selected={payment === "hospital" || undefined}><input type="radio" name="d15-payment" checked={payment === "hospital"} onChange={() => onPayment("hospital")} /><Building2 size={20} aria-hidden /><span><strong>Pay at hospital</strong><small>At reception before your consultation</small></span></label>}
    </fieldset>
    <div className={styles.total}><span>Consultation fee</span><strong>{fee}</strong></div>
    <div className={styles.actions}><button type="button" className={styles.primary} disabled={busy || expired} onClick={onSubmit}>{busy ? "Confirming…" : payment === "hospital" ? "Confirm appointment" : retrying ? "Retry payment" : "Continue to payment"}<ArrowRight size={17} aria-hidden /></button></div>
    {retrying && <button type="button" className={styles.textButton} disabled={busy} onClick={onLater}>Finish later</button>}
  </section>;
}
