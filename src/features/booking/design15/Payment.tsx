"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, Smartphone } from "lucide-react";
import styles from "./Booking.module.css";

export default function Payment({ fee, busy, expired, onPay, onBack }: { fee: string; busy: boolean; expired: boolean; onPay: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  return <section className={styles.panel} aria-labelledby="d15-payment-heading">
    <header className={styles.sectionHeading}><h2 id="d15-payment-heading">Complete your payment</h2><p>Choose how you’d like to pay.</p></header>
    <div className={styles.total}><span>Total to pay</span><strong>{fee}</strong></div>
    <fieldset className={styles.paymentChoices} disabled={busy || expired}><legend>Payment method</legend>{(["upi", "card"] as const).map(value => <label key={value} className={styles.paymentChoice} data-selected={method === value || undefined}><input type="radio" name="d15-method" checked={method === value} onChange={() => setMethod(value)} />{value === "upi" ? <Smartphone size={20} aria-hidden /> : <CreditCard size={20} aria-hidden />}<span><strong>{value === "upi" ? "UPI" : "Card"}</strong><small>{value === "upi" ? "Pay from your bank account" : "Debit or credit card"}</small></span></label>)}</fieldset>
    <div className={styles.savedMethod}><div><span>{method === "upi" ? "Saved UPI account" : "Saved Visa card"}</span><strong>{method === "upi" ? "a••••@okaxis" : "•••• •••• •••• 4242"}</strong></div><Check size={18} aria-hidden /></div>
    <button type="button" className={styles.primary} disabled={busy || expired} onClick={onPay}>{busy ? "Processing payment…" : `Pay ${fee}`}<ArrowRight size={17} aria-hidden /></button>
    <button type="button" className={styles.textButton} disabled={busy} onClick={onBack}><ArrowLeft size={16} aria-hidden />Back to appointment summary</button>
  </section>;
}
