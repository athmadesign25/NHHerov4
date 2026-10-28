"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, ShieldCheck, Smartphone } from "lucide-react";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import styles from "./PaymentPreview.module.css";

interface Props {
  variant?: QuickJourneyDesign;
  fee: string;
  expired: boolean;
  busy: boolean;
  failed: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onExpire: () => void;
}

export default function PaymentPreview({ variant = "d13", fee, expired, busy, failed, onSuccess, onFailure, onRetry, onCancel, onExpire }: Props) {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [pending, setPending] = useState(false);
  const [checked, setChecked] = useState(false);
  if (variant === "d14") return <section className={`${styles.panel} ${styles.payment}`} data-journey-palette="light" aria-labelledby="d14-payment-heading">
    <header className={styles.heading}><ShieldCheck size={23} aria-hidden /><div><h2 id="d14-payment-heading">{failed ? "Payment wasn’t completed" : "Complete your payment"}</h2><p>Choose how you’d like to pay.</p></div></header>
    <div className={styles.amount}><span>Consultation fee</span><strong>{fee}</strong></div>
    {failed ? <div className={styles.notice} role="alert"><strong>{expired ? "Your appointment hold has ended." : "Please try your payment again."}</strong><p>{expired ? "Choose another appointment time to continue." : "Your appointment time is still held. You can retry or go back to change how you pay."}</p></div>
      : <><fieldset className={styles.paymentMethods} disabled={busy || expired}><legend>Payment method</legend><div className={styles.methods}>
        <button type="button" aria-pressed={method === "upi"} onClick={() => setMethod("upi")}><Smartphone size={20} aria-hidden /><span>UPI<small>Pay from your bank account</small></span>{method === "upi" && <Check size={16} aria-hidden />}</button>
        <button type="button" aria-pressed={method === "card"} onClick={() => setMethod("card")}><CreditCard size={20} aria-hidden /><span>Card<small>Debit or credit card</small></span>{method === "card" && <Check size={16} aria-hidden />}</button>
      </div></fieldset><div className={styles.savedMethod}><span className={styles.methodIcon}>{method === "upi" ? <Smartphone size={22} aria-hidden /> : <CreditCard size={22} aria-hidden />}</span><div><span>{method === "upi" ? "Saved UPI account" : "Saved Visa card"}</span><strong>{method === "upi" ? "a••••@okaxis" : "•••• •••• •••• 4242"}</strong></div><Check size={18} aria-label="Selected payment method" /></div></>}
    <button type="button" className={styles.primary} disabled={expired || busy} onClick={failed ? onRetry : onSuccess}>{busy ? "Processing payment…" : failed ? "Retry payment" : `Pay ${fee}`}<ArrowRight size={17} aria-hidden /></button>
    <button type="button" className={styles.back} disabled={busy} onClick={onCancel}><ArrowLeft size={16} aria-hidden />Back to appointment details</button>
  </section>;
  return <section className={styles.panel} data-journey-palette="light" aria-labelledby="d13-payment-heading">
    <header className={styles.heading}><ShieldCheck size={23} aria-hidden /><div><h2 id="d13-payment-heading">{pending ? "Checking your payment" : failed ? "Payment wasn’t completed" : "Complete your payment"}</h2><p>Demo gateway · No real money moves</p></div></header>
    <div className={styles.amount}><span>Total to pay</span><strong>{fee}</strong></div>
    {pending ? <div className={styles.notice} role="status"><strong>{checked ? "Still waiting for a final result" : "Payment status is pending"}</strong><p>Please check the status before trying another payment. Your appointment will appear here once payment is confirmed.</p></div>
      : failed ? <div className={styles.notice} role="alert"><strong>Nothing was charged in this preview.</strong><p>{expired ? "Your hold has ended. Choose another appointment time to continue." : "Retry with the same hold, or go back to choose pay at hospital when available."}</p></div>
        : <><div className={styles.methods} role="group" aria-label="Demo payment method">
          <button type="button" aria-pressed={method === "upi"} onClick={() => setMethod("upi")}><Smartphone size={20} aria-hidden /><span>UPI<small>Sample UPI payment</small></span>{method === "upi" && <Check size={16} aria-hidden />}</button>
          <button type="button" aria-pressed={method === "card"} onClick={() => setMethod("card")}><CreditCard size={20} aria-hidden /><span>Card<small>Sample card payment</small></span>{method === "card" && <Check size={16} aria-hidden />}</button>
        </div><div className={styles.sample}><span>{method === "upi" ? "Sample UPI ID" : "Sample card"}</span><strong>{method === "upi" ? "preview@nh-demo" : "•••• •••• •••• 4242"}</strong><span>No financial details required</span></div></>}
    <button type="button" className={styles.primary} disabled={expired || busy}
      onClick={pending ? () => setChecked(true) : failed ? onRetry : onSuccess}>
      {busy ? "Confirming…" : pending ? "Check payment status" : failed ? "Retry demo payment" : `Simulate payment · ${fee}`}<ArrowRight size={17} aria-hidden />
    </button>
    {!pending && <button type="button" className={styles.back} disabled={busy} onClick={onCancel}><ArrowLeft size={16} aria-hidden />Back to patient & payment</button>}
    <details className={styles.tools}><summary>Preview scenarios</summary><p>Try payment recovery without charging money.</p><div>
      {pending ? <><button type="button" disabled={expired || busy} onClick={onSuccess}>Simulate confirmed payment</button><button type="button" disabled={busy} onClick={() => { setPending(false); setChecked(false); onFailure(); }}>Simulate failed result</button></>
        : <><button type="button" disabled={expired || busy || failed} onClick={onFailure}>Simulate payment failure</button><button type="button" disabled={expired || busy || failed} onClick={() => setPending(true)}>Simulate payment pending</button></>}
      <button type="button" disabled={expired || busy} onClick={onExpire}>Simulate hold expiry</button>
    </div></details>
  </section>;
}
