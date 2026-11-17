"use client";

import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import BookingAmount from "../design20/previous/BookingAmount";
import bookingStyles from "../design20/previous/BookingPaymentBar.module.css";
import styles from "./BookingActionBar.module.css";

interface Props {
  amount: string;
  actionLabel: string;
  disabled?: boolean;
  feedback?: string;
  onContinue: () => void;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/** The booking FAB surface and amount motion, without consultation-specific pricing or copy. */
export default function BookingActionBar({ amount, actionLabel, disabled, feedback, onContinue }: Props) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduced = useReducedMotion();
  const reserve = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const feedbackId = useId();

  useLayoutEffect(() => {
    if (!mounted || !bar.current || !reserve.current) return;
    const space = reserve.current;
    const dock = bar.current;
    const measure = () => space.style.setProperty("--booking-action-height", `${dock.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [mounted]);

  const layout = { duration: reduced ? 0 : duration.emphasis, ease: ease.out };
  const dock = <motion.section ref={bar} layout={!reduced} transition={{ layout }} className={bookingStyles.bar} data-enhanced data-feedback={Boolean(feedback)} aria-label="Complete booking">
    <div className={bookingStyles.amount}><span>Total payable</span><strong><BookingAmount value={amount} animated={!reduced} /></strong></div>
    <div className={bookingStyles.actions}><button type="button" className={bookingStyles.submit} disabled={disabled} aria-describedby={feedback ? feedbackId : undefined} onClick={onContinue}>{actionLabel}</button></div>
    <AnimatePresence initial={false} mode="popLayout">{feedback && <motion.p id={feedbackId} key="feedback" className={bookingStyles.feedback} role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : duration.fast }}>{feedback}</motion.p>}</AnimatePresence>
  </motion.section>;

  // Fixed controls remain anchored to the viewport, outside animated page ancestors.
  return <div ref={reserve} className={styles.reserve}>{mounted ? createPortal(dock, document.body) : null}</div>;
}
