"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import type Lenis from "lenis";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

export default function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pressedBackdrop = useRef(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    dialog.showModal();
    if (scrollbar > 0) body.style.paddingRight = `${Number.parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    return () => { dialog.close(); body.style.overflow = overflow; body.style.paddingRight = padding; if (!wasStopped) lenis?.start(); if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={id} data-lenis-prevent onCancel={(event) => { event.preventDefault(); onClose(); }}
    onPointerDown={(event) => { const box = event.currentTarget.getBoundingClientRect(); pressedBackdrop.current = event.target === event.currentTarget && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom); }}
    onClick={(event) => { if (event.target === event.currentTarget && pressedBackdrop.current) onClose(); pressedBackdrop.current = false; }}>
    <header className={styles.header}><h2 id={id}>{title}</h2><button ref={closeRef} type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`}><X size={20} aria-hidden /></button></header>
    <div className={styles.body} data-lenis-prevent>{children}</div>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </dialog>;
}
