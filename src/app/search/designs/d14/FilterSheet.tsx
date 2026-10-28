"use client";

import { useEffect, useId, useRef, useState } from "react";
import type Lenis from "lenis";
import { ArrowRight, X } from "lucide-react";
import { activeFilterCount, emptyDoctorFilters } from "@/features/search/doctorListing";
import { refineDesign7Doctors } from "../d7/directory";
import { FilterControls, type DoctorFilterProps } from "./FilterSidebar";
import { filterByFee } from "./filtering";
import styles from "./FilterSheet.module.css";

export default function FilterSheet({ doctors, filters, fee, mode, now, onChange, onClose }: DoctorFilterProps & { onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backdropPress = useRef(false);
  const [draftFilters, setDraftFilters] = useState(() => ({
    ...filters,
    specialties: [...filters.specialties], hospitals: [...filters.hospitals], languages: [...filters.languages],
    genders: [...filters.genders], expertise: [...filters.expertise],
  }));
  const [draftFee, setDraftFee] = useState(fee);
  const count = filterByFee(refineDesign7Doctors(doctors, draftFilters, mode, "relevance", now), draftFee).length;
  const selected = activeFilterCount(draftFilters) + Number(draftFee !== "any");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    if (!dialog.open) dialog.showModal();
    if (scrollbar > 0) body.style.paddingRight = `${Number.parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      if (!wasStopped) lenis?.start();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const dismissOnDesktop = () => { if (desktop.matches) onClose(); };
    desktop.addEventListener("change", dismissOnDesktop);
    dismissOnDesktop();
    return () => desktop.removeEventListener("change", dismissOnDesktop);
  }, [onClose]);

  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} data-journey-palette="dark" data-lenis-prevent
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onPointerDown={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      backdropPress.current = event.target === event.currentTarget &&
        (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
    }}
    onClick={(event) => { if (event.target === event.currentTarget && backdropPress.current) onClose(); backdropPress.current = false; }}>
    <header className={styles.header}>
      <div><h2 id={titleId}>Filter doctors{selected > 0 && <span>{selected}<span className={styles.srOnly}> selected</span></span>}</h2><p>Make your choices, then apply them together.</p></div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close filters without applying"><X size={20} aria-hidden /></button>
    </header>
    <div className={styles.body} data-lenis-prevent>
      <FilterControls doctors={doctors} filters={draftFilters} fee={draftFee} mode={mode} now={now} onChange={(nextFilters, nextFee) => { setDraftFilters(nextFilters); setDraftFee(nextFee); }} />
    </div>
    <footer className={styles.footer}>
      <p role="status" aria-live="polite">{count} {count === 1 ? "doctor matches" : "doctors match"} your filters</p>
      <div><button className={styles.clear} type="button" disabled={selected === 0} onClick={() => { setDraftFilters(emptyDoctorFilters()); setDraftFee("any"); }}>Clear all</button>
        <button className={styles.apply} type="button" onClick={() => { onChange(draftFilters, draftFee); onClose(); }}>Show {count} {count === 1 ? "doctor" : "doctors"}<ArrowRight size={17} aria-hidden /></button>
      </div>
    </footer>
  </dialog>;
}
