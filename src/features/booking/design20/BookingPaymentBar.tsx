"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, CreditCard } from "lucide-react";
import type { PaymentChoice } from "../design7/model";
import type { design20Pricing } from "./pricing";
import styles from "./BookingPaymentBar.module.css";

type Props = {
  pricing: ReturnType<typeof design20Pricing>;
  payment: PaymentChoice;
  hospitalVisit: boolean;
  disabled: boolean;
  busy: boolean;
  feedback?: string;
  onPaymentChange: (payment: PaymentChoice) => void;
  onSubmit: () => void;
};

export default function BookingPaymentBar({ pricing, payment, hospitalVisit, disabled, busy, feedback, onPaymentChange, onSubmit }: Props) {
  const selectionId = useId();
  const reduced = useReducedMotion();
  const layout = { duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] as const };
  const covered = pricing.amounts.total === 0;
  return <div className={styles.reserve}>
    <motion.section layout={!reduced} transition={{ layout }} className={styles.bar} data-feedback={Boolean(feedback)} aria-label="Complete booking">
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.amount}><span>{payment === "hospital" && !covered ? "Pay at hospital" : "Total payable"}</span><strong>{pricing.total}</strong>{pricing.hasDiscount && <small role="status" aria-live="polite" aria-atomic="true">You save {pricing.discount}</small>}</motion.div>
      {hospitalVisit && !covered ? <motion.fieldset layout={reduced ? false : "position"} transition={{ layout }} className={styles.methods} disabled={busy}>
        <legend className={styles.srOnly}>Payment method</legend>
        {(["online", "hospital"] as const).map(method => <label key={method}>
          <input type="radio" name={`payment-${selectionId}`} value={method} checked={payment === method} onChange={() => onPaymentChange(method)} />
          {payment === method && <motion.span className={styles.selection} layoutId={`payment-selection-${selectionId}`} initial={false} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 38, mass: .7 }} aria-hidden />}
          <span className={styles.methodLabel}>{method === "online" ? <CreditCard size={15} aria-hidden /> : <Building2 size={15} aria-hidden />}{method === "online" ? "Pay online" : "Pay at hospital"}</span>
        </label>)}
      </motion.fieldset> : <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.methodNote}>{covered ? "Covered by your benefits" : <><CreditCard size={16} aria-hidden />UPI, cards & more</>}</motion.div>}
      <motion.button layout={reduced ? false : "position"} transition={{ layout }} className={styles.submit} type="button" disabled={disabled} onClick={onSubmit}>
        <span>{busy ? "Preparing…" : "Continue with booking"}</span>
      </motion.button>
      <AnimatePresence initial={false} mode="popLayout">{feedback && <motion.p key="feedback" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16, layout }} className={styles.feedback} role="status">{feedback}</motion.p>}</AnimatePresence>
    </motion.section>
  </div>;
}
