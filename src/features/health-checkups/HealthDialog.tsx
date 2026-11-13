"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import type Lenis from "lenis";
import styles from "./HealthDialog.module.css";

export default function HealthDialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (!wasStopped) lenis?.start();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.wide : ""}`} aria-labelledby={titleId} data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.body}>
      <header className={styles.header}><h2 id={titleId}>{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></header>
      {children}
    </div>
  </dialog>;
}
