"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type Lenis from "lenis";
import ExecutiveIcon from "./ExecutiveIcon";
import styles from "./ExecutiveSlotTag.module.css";

const benefits = [
  { icon: "priority", title: "Priority consultation", description: "Priority support for your consultation" },
  { icon: "doctor", title: "Personalised attention", description: "Extra care from doctors and staff" },
  { icon: "entry", title: "Quick access to facilities", description: "Priority entry for a seamless visit" },
];

export default function ExecutiveBenefitsDialog({ onClose }: { onClose: () => void }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    element.showModal();
    document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (!wasStopped) lenis?.start();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} data-executive-benefits data-lenis-prevent
    onKeyDown={event => { if (event.key === "Escape") event.stopPropagation(); }}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onPointerDown={event => { startedOnBackdrop.current = event.target === event.currentTarget; }}
    onClick={event => { if (startedOnBackdrop.current && event.target === event.currentTarget) onClose(); }}>
    <div className={styles.surface}>
      <header className={styles.header}>
        <span className={styles.headingIcon}><ExecutiveIcon /></span>
        <h2 id={`${id}-title`}>Executive slot benefits</h2>
        <button type="button" className={styles.close} aria-label="Close executive benefits" onClick={onClose}><X aria-hidden /></button>
      </header>
      <ul className={styles.benefits}>{benefits.map(benefit => <li key={benefit.icon}>
        <Image src={`/booking/executive/${benefit.icon}.svg`} width={32} height={32} sizes="32px" alt="" />
        <div><h3>{benefit.title}</h3><p>{benefit.description}</p></div>
      </li>)}</ul>
      <footer className={styles.fee}>Additional consultation fee applies</footer>
    </div>
  </dialog>;
}
