"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import type { PaymentChoice } from "../../design7/model";
import type { design20Pricing } from "../pricing";
import BookingAmount from "./BookingAmount";
import styles from "./BookingPaymentBar.module.css";

type Props = {
  pricing: ReturnType<typeof design20Pricing>;
  hospitalVisit: boolean;
  disabled: boolean;
  busy: boolean;
  feedback?: string;
  enhanced?: boolean;
  onSubmit: (payment: PaymentChoice) => void;
};

export default function BookingPaymentBar({ pricing, hospitalVisit, disabled, busy, feedback, enhanced = false, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState<PaymentChoice | null>(null);
  const reduced = useReducedMotion();
  const layout = { duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] as const };
  const covered = pricing.amounts.total === 0;
  const submit = (payment: PaymentChoice) => { setSubmitting(payment); onSubmit(payment); };
  return <div className={styles.reserve}>
    <motion.section layout={!reduced} initial={enhanced && !reduced ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out, layout }} className={styles.bar} data-enhanced={enhanced || undefined} data-feedback={Boolean(feedback)} aria-label="Complete booking">
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.amount}><span>Total payable</span><strong><BookingAmount value={pricing.total} animated={enhanced} /></strong>{covered && <small>Covered by your benefits</small>}</motion.div>
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
