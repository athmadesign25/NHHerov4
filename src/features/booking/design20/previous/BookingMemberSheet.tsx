"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type Lenis from "lenis";
import { duration, ease } from "@/lib/motion";
import styles from "./BookingMemberPicker.module.css";

export default function BookingMemberSheet({ children, headingId, onClose }: { children: ReactNode; headingId: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const onBackdrop = useRef(false);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    element.showModal();
    document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    (element.querySelector<HTMLElement>('[aria-selected="true"]') ?? element.querySelector<HTMLElement>('[role="option"]') ?? element.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true });
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (!wasStopped) lenis?.start();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return <motion.dialog ref={dialog} id={`${headingId}-dialog`} className={styles.sheet} aria-labelledby={headingId} data-lenis-prevent
    initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onPointerDown={event => { onBackdrop.current = event.target === event.currentTarget; }}
    onClick={event => { if (onBackdrop.current && event.target === event.currentTarget) onClose(); }}>
    <motion.div className={styles.sheetSurface} initial={reduced ? false : { y: 24 }} animate={{ y: 0 }} exit={{ y: 16 }} transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out }}>
      <header className={styles.sheetHeader}><h2 id={headingId}>Choose a member</h2><button type="button" className={styles.sheetClose} aria-label="Close member selection" onClick={onClose}><X size={20} aria-hidden /></button></header>
      {children}
    </motion.div>
  </motion.dialog>;
}
