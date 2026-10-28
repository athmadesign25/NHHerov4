"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type Lenis from "lenis";
import Payment from "../design15/Payment";
import styles from "./Booking.module.css";

export default function PaymentDialog({ fee, busy, expired, onPay, onClose }: { fee: string; busy: boolean; expired: boolean; onPay: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    element.showModal(); document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    return () => { element.close(); document.body.style.overflow = overflow; if (!wasStopped) lenis?.start(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={dialog} className={styles.paymentDialog} aria-labelledby="d15-payment-heading" data-lenis-prevent onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button type="button" className={styles.dialogClose} aria-label="Close payment" disabled={busy} onClick={onClose}><X size={19} aria-hidden /></button>
    <Payment fee={fee} busy={busy} expired={expired} onPay={onPay} onBack={onClose} />
  </dialog>;
}
