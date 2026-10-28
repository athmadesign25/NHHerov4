"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, Smartphone, TriangleAlert } from "lucide-react";
import styles from "./Booking.module.css";

interface Props {
  amount: string;
  expired: boolean;
  busy: boolean;
  failed: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onExpire: () => void;
}

export default function DemoPaymentStep({ amount, expired, busy, failed, onSuccess, onFailure, onRetry, onCancel, onExpire }: Props) {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  return <section className={`${styles.panel} ${styles.gateway}`} aria-labelledby="d7-payment-heading">
    <div className={styles.gatewayHeader}><span className={styles.gatewayMark}><LockKeyhole size={22} aria-hidden /></span><span className={styles.demoBadge}>DEMO PAYMENT GATEWAY</span></div>
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>NARAYANA HEALTH</span><h2 id="d7-payment-heading">{failed ? "Let’s try that again." : "Complete your payment."}</h2><p>{failed ? "The simulated payment failed. Nothing was charged, and your original slot hold is still running." : "Explore checkout using sample payment details. No money moves and no real financial details are needed."}</p></div>
    <div className={styles.gatewayAmount}><span>Amount to pay</span><strong>{amount}</strong><span>Demo transaction only</span></div>
    {failed ? <div className={styles.paymentFailed} role="alert"><TriangleAlert size={23} aria-hidden /><div><strong>Payment unsuccessful</strong><p>You can retry before the timer expires, or return to review and choose pay at hospital if available.</p></div></div> : <><div className={styles.modeGrid} role="group" aria-label="Demo payment method">
      <button type="button" className={styles.modeOption} aria-pressed={method === "upi"} onClick={() => setMethod("upi")}><Smartphone size={22} aria-hidden /><span><strong>UPI</strong><small>Sample UPI payment</small></span></button>
      <button type="button" className={styles.modeOption} aria-pressed={method === "card"} onClick={() => setMethod("card")}><CreditCard size={22} aria-hidden /><span><strong>Card</strong><small>Sample card payment</small></span></button>
    </div><div className={styles.samplePayment}><span>{method === "upi" ? "Sample UPI ID" : "Sample card"}</span><strong>{method === "upi" ? "preview@nh-demo" : "••••  ••••  ••••  4242"}</strong><span className={styles.verifiedInline}><Check size={14} aria-hidden />Ready to simulate</span></div></>}
    <button type="button" className={`${styles.primary} ${styles.fullWidth}`} disabled={expired || busy} onClick={failed ? onRetry : onSuccess}>
      {busy ? "Completing…" : failed ? "Retry demo payment" : `Simulate successful payment · ${amount}`}<ArrowRight size={18} aria-hidden />
    </button>
    <button type="button" className={`${styles.backButton} ${styles.gatewayBack}`} disabled={busy} onClick={onCancel}><ArrowLeft size={17} aria-hidden />Cancel payment & return to review</button>
    <details className={styles.demoTools}><summary>Preview scenarios</summary><p>Test the recovery states without moving money or waiting for the timer.</p><div>
      <button type="button" className={styles.secondary} disabled={expired || busy || failed} onClick={onFailure}>Simulate payment failure</button>
      <button type="button" className={styles.secondary} disabled={expired || busy} onClick={onExpire}>Simulate hold expiry</button>
    </div></details>
  </section>;
}
