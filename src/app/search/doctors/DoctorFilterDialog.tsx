"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import DoctorFilters from "./DoctorFilters";
import { emptyDoctorFilters, type DoctorFilters as Filters, type DoctorListingItem } from "@/features/search/doctorListing";
import styles from "./DoctorFilterDialog.module.css";

interface Props {
  doctors: readonly DoctorListingItem[];
  filters: Filters;
  count: number;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  onClose: () => void;
}

export default function DoctorFilterDialog({ doctors, filters, count, onChange, onApply, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.documentElement.style.overflow;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    dialog?.showModal();
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (desktop.matches) closeRef.current(); };
    desktop.addEventListener("change", onResize);
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = previousOverflow;
      lenis?.start();
      desktop.removeEventListener("change", onResize);
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="doctor-filter-title" data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}>
      <header className={styles.header}>
        <div><h2 id="doctor-filter-title">Refine your search</h2><p>Choose what matters to you.</p></div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close filters"><X size={20} /></button>
      </header>
      <div className={styles.content}>
        <DoctorFilters doctors={doctors} value={filters} onChange={onChange} />
      </div>
      <footer className={styles.footer}>
        <button type="button" className={styles.reset} onClick={() => onChange(emptyDoctorFilters())}>Clear all</button>
        <button type="button" className={styles.apply} onClick={onApply}>Show {count} {count === 1 ? "doctor" : "doctors"}</button>
      </footer>
    </dialog>, document.body
  );
}
