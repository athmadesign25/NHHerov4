"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PaymentChoice } from "../design7/model";
import type { design20Pricing } from "./pricing";
import styles from "./BookingPaymentBar.module.css";

type Props = {
  pricing: ReturnType<typeof design20Pricing>;
  hospitalVisit: boolean;
  disabled: boolean;
  busy: boolean;
  feedback?: string;
  onSubmit: (payment: PaymentChoice) => void;
};

export default function BookingPaymentBar({ pricing, hospitalVisit, disabled, busy, feedback, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState<PaymentChoice | null>(null);
  const reduced = useReducedMotion();
  const layout = { duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] as const };
  const covered = pricing.amounts.total === 0;
  const submit = (payment: PaymentChoice) => { setSubmitting(payment); onSubmit(payment); };
  return <div className={styles.reserve}>
    <motion.section layout={!reduced} transition={{ layout }} className={styles.bar} data-feedback={Boolean(feedback)} aria-label="Complete booking">
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.amount}><span>Total payable</span><strong>{pricing.total}</strong>{covered && <small>Covered by your benefits</small>}</motion.div>
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.actions}>
        {hospitalVisit && !covered && <button className={`${styles.submit} ${styles.secondary}`} type="button" disabled={disabled || busy} onClick={() => submit("hospital")}>
          {busy && submitting === "hospital" ? "Confirming…" : "Pay at hospital"}
        </button>}
        <button className={styles.submit} type="button" disabled={disabled || busy} onClick={() => submit("online")}>
          {busy && submitting === "online" ? "Preparing…" : covered ? "Confirm appointment" : "Pay online"}
        </button>
      </motion.div>
      <AnimatePresence initial={false} mode="popLayout">{feedback && <motion.p key="feedback" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16, layout }} className={styles.feedback} role="status">{feedback}</motion.p>}</AnimatePresence>
    </motion.section>
  </div>;
}
