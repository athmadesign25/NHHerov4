"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import styles from "./SearchDialog.module.css";
import ui from "./DoctorSearchTheme.module.css";

interface Props { title: string; children: ReactNode; footer?: ReactNode; onClose: () => void; mobileOnly?: boolean; doctorPreview?: boolean }

export default function SearchDialog({ title, children, footer, onClose, mobileOnly = false, doctorPreview = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const present = useIsPresent();
  const animate = doctorPreview && !reducedMotion;
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = document.documentElement.style.overflow;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    dialog?.showModal();
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    const desktop = window.matchMedia(doctorPreview ? "(min-width: 1200px)" : "(min-width: 1024px)");
    const resize = () => { if (mobileOnly && desktop.matches) closeRef.current(); };
    desktop.addEventListener("change", resize);
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = previous;
      lenis?.start();
      desktop.removeEventListener("change", resize);
      trigger?.focus({ preventScroll: true });
    };
  }, [mobileOnly, doctorPreview]);
  return createPortal(<motion.dialog layoutRoot ref={ref} className={`${styles.dialog} ${doctorPreview ? ui.theme : ""}`} aria-labelledby={titleId} data-lenis-prevent data-d3-ui data-doctor-preview={doctorPreview || undefined}
    inert={!present} data-closing={!present || undefined} initial={animate ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: animate ? 8 : 0, transition: { duration: animate ? .15 : 0 } }}
    transition={{ duration: animate ? .25 : 0, ease: [.22, 1, .36, 1] }}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
    }}>
    <header className={styles.header}><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog"><X size={20} aria-hidden /></button></header>
    <motion.div layoutScroll className={styles.content} data-filter-scroll-viewport={mobileOnly || undefined}>{children}</motion.div>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </motion.dialog>, document.body);
}
