"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
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

const mobileQuery = "(max-width: 767px)";
const subscribeMobile = (listener: () => void) => {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => false;

export default function BookingPaymentBar({ pricing, hospitalVisit, disabled, busy, feedback, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState<PaymentChoice | null>(null);
  const feedbackId = useId();
  const reserve = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const mobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerSnapshot);
  const reduced = useReducedMotion();
  const layout = { duration: reduced ? 0 : duration.emphasis, ease: ease.out };
  const covered = pricing.amounts.total === 0;
  const submit = (payment: PaymentChoice) => { setSubmitting(payment); onSubmit(payment); };

  useLayoutEffect(() => {
    if (!mobile || !bar.current || !reserve.current) return;
    const space = reserve.current;
    const dock = bar.current;
    const measure = () => space.style.setProperty("--payment-dock-height", `${dock.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => {
      observer.disconnect();
      space.style.removeProperty("--payment-dock-height");
    };
  }, [mobile]);

  const payment = <motion.section ref={bar} layout={!reduced} transition={{ layout }} className={styles.bar} data-docked={mobile || undefined} aria-label="Complete booking">
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.amount}><span>Total payable</span><strong>{pricing.total}</strong>{covered && <small>Covered by your benefits</small>}</motion.div>
      <AnimatePresence initial={false} mode="popLayout">{feedback && <motion.p id={feedbackId} key="feedback" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : duration.fast, layout }} className={styles.feedback} role="status">{feedback}</motion.p>}</AnimatePresence>
      <motion.div layout={reduced ? false : "position"} transition={{ layout }} className={styles.actions}>
        {hospitalVisit && !covered && <button className={`${styles.submit} ${styles.secondary}`} type="button" disabled={disabled || busy} aria-describedby={feedback ? feedbackId : undefined} onClick={() => submit("hospital")}>
          {busy && submitting === "hospital" ? "Confirming…" : "Pay at hospital"}
        </button>}
        <button className={styles.submit} type="button" disabled={disabled || busy} aria-describedby={feedback ? feedbackId : undefined} onClick={() => submit("online")}>
          {busy && submitting === "online" ? "Preparing…" : covered ? "Confirm appointment" : "Pay online"}
        </button>
      </motion.div>
    </motion.section>;

  // Keep the mobile dock outside animated ancestors, which otherwise change its fixed positioning.
  return <div ref={reserve} className={styles.reserve} data-docked={mobile || undefined}>
    {mobile ? createPortal(payment, document.body) : payment}
  </div>;
}
