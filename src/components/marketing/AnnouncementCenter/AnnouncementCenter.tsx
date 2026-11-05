"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import AnnouncementIcon from "../MarketingDrawer/AnnouncementIcon";
import type { Announcement } from "./announcementStore";
import styles from "./AnnouncementCenter.module.css";

type Props = {
  entries: Announcement[];
  className: string;
  top: number;
  left: number;
  size: number;
  mobile: boolean;
  docked: boolean;
  emphasized: boolean;
};

/** L4 is available whenever its route has announcements, independently of L1–L3. */
export default function AnnouncementCenter({ entries, className, top, left, size, mobile, docked, emphasized }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusOnOpen = useRef(false);
  const id = useId();
  const reduced = useReducedMotion();
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const close = useCallback((restoreFocus = false) => {
    cancelClose();
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }, [cancelClose]);
  const scheduleClose = () => {
    if (mobile) return;
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!panel.current?.contains(document.activeElement)) close();
    }, duration.emphasis * 1000);
  };

  useEffect(() => { setMounted(true); return cancelClose; }, [cancelClose]);
  useEffect(() => { close(); }, [mobile, close]);
  useEffect(() => {
    if (!open) return;
    if (focusOnOpen.current) panel.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
      if (!mobile || event.key !== "Tab") return;
      const focusable = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keydown);
    };
  }, [open, mobile, close]);

  const position = {
    "--announcement-right": `max(var(--space-12), calc(100vw - ${left + size}px))`,
    "--announcement-bottom": `calc(100dvh - ${top}px + var(--space-12))`,
  } as CSSProperties;

  return <>
    <motion.button ref={trigger} type="button" data-banner-bubble data-docked={docked} data-emphasized={emphasized} className={`${className} ${styles.trigger}`}
      style={{ top, left, width: size, height: size, pointerEvents: "auto" }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : duration.slow, ease: ease.out }}
      aria-label={`Announcements, ${entries.length} unread`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
      onPointerEnter={event => {
        if (mobile || event.pointerType !== "mouse") return;
        cancelClose(); focusOnOpen.current = false; setOpen(true);
      }}
      onPointerLeave={scheduleClose}
      onClick={event => {
        event.stopPropagation(); cancelClose();
        focusOnOpen.current = true;
        if (mobile) setOpen(!open);
        else { setOpen(true); panel.current?.focus({ preventScroll: true }); }
      }}>
      <AnnouncementIcon size={19} />
      <span className={styles.count} aria-hidden="true">{entries.length}</span>
      {!open && <span className={styles.tooltip}>{entries.length} announcements</span>}
    </motion.button>
    {mounted && createPortal(<AnimatePresence>
      {open && <>
        {mobile && <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : duration.base }} aria-hidden="true" onClick={() => close()} />}
        <div className={`${styles.position} ${mobile ? styles.mobile : ""}`} style={position}>
          <motion.div ref={panel} id={id} role="dialog" aria-modal={mobile || undefined} aria-label="Announcements" tabIndex={-1} className={styles.panel}
            data-lenis-prevent onPointerEnter={cancelClose} onPointerLeave={scheduleClose}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}>
            <header className={styles.header}><h2>Announcements</h2><button type="button" onClick={() => close(true)} className={styles.close} aria-label="Close announcements"><X aria-hidden="true" /></button></header>
            <ul className={styles.list}>
              {entries.map(entry => {
                const content = <><span className={styles.thumbnail}><Image src={entry.image} alt="" fill sizes="64px" /></span><span className={styles.title}>{entry.title}</span></>;
                return <li key={entry.id}>{entry.onSelect ? <button type="button" className={styles.item} onClick={() => { close(); entry.onSelect?.(); }}>{content}</button> : <Link href={entry.href} className={styles.item} onClick={() => close()}>{content}</Link>}</li>;
              })}
            </ul>
          </motion.div>
        </div>
      </>}
    </AnimatePresence>, document.body)}
  </>;
}
