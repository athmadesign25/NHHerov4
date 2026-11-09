"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import AnnouncementIcon from "../MarketingDrawer/AnnouncementIcon";
import type { Announcement } from "./announcementStore";
import styles from "./AnnouncementCenter.module.css";

/** Optional display metadata; the announcement source and destinations stay unchanged. */
type PresentedAnnouncement = Announcement & {
  eventDate?: string;
  location?: string;
  type?: "Event" | "New service" | "Update";
  unread?: boolean;
};

type Props = {
  entries: PresentedAnnouncement[];
  className: string;
  top: number;
  left: number;
  size: number;
  mobile: boolean;
  docked: boolean;
  emphasized: boolean;
};

function eventDetails(entry: PresentedAnnouncement) {
  if (!entry.eventDate) return null;
  const date = new Date(entry.eventDate);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
    label: [new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date), entry.location].filter(Boolean).join(" · "),
  };
}

/** L4 is available whenever its route has announcements, independently of L1–L3. */
export default function AnnouncementCenter({ entries, className, top, left, size, mobile, docked, emphasized }: Props) {
  const [mode, setMode] = useState<"hover" | "pinned" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [anchor, setAnchor] = useState({ right: left + size, top });
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const open = mode !== null;
  const unreadCount = entries.filter(entry => entry.unread !== false).length;

  const cancelOpen = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
  }, []);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const close = useCallback((restoreFocus = false) => {
    cancelOpen();
    cancelClose();
    setMode(null);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }, [cancelOpen, cancelClose]);
  const scheduleClose = () => {
    cancelOpen();
    if (mobile || mode === "pinned") return;
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!panel.current?.contains(document.activeElement)) setMode(current => current === "hover" ? null : current);
    }, duration.moderate * 1000);
  };

  useEffect(() => {
    setMounted(true);
    return () => { cancelOpen(); cancelClose(); };
  }, [cancelOpen, cancelClose]);
  useEffect(() => { close(); }, [mobile, close]);

  // Read the actual icon bounds, including its island's current position. CSS
  // keeps the panel inside the viewport when exact right alignment cannot fit.
  useLayoutEffect(() => {
    if (!open) return;
    const updateAnchor = () => {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds) return;
      setAnchor(current => current.right === bounds.right && current.top === bounds.top ? current : { right: bounds.right, top: bounds.top });
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, { passive: true });
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor);
    };
  }, [open, top, left, size]);

  useEffect(() => {
    if (!open) return;
    if (mode === "pinned") panel.current?.querySelector<HTMLAnchorElement>("[data-announcement-link]")?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keydown);
    };
  }, [open, mode, close]);

  const navigateList = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("[data-announcement-link]"));
    if (!links.length) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next].focus({ preventScroll: true });
  };

  const position = {
    "--announcement-anchor-right": `${anchor.right}px`,
    "--announcement-anchor-top": `${anchor.top}px`,
  } as CSSProperties;

  return <>
    <motion.button ref={trigger} type="button" data-banner-bubble data-docked={docked} data-emphasized={emphasized} className={`${className} ${styles.trigger}`}
      style={{ top, left, width: size, height: size, pointerEvents: "auto" }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : duration.slow, ease: ease.out }}
      aria-label={`Announcements, ${unreadCount} new`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
      onPointerEnter={event => {
        if (mobile || event.pointerType !== "mouse") return;
        cancelClose();
        cancelOpen();
        if (!open) openTimer.current = setTimeout(() => { setMode(current => current ?? "hover"); }, duration.instant * 1000);
      }}
      onPointerLeave={scheduleClose}
      onClick={event => {
        event.stopPropagation();
        cancelOpen();
        cancelClose();
        if (mode === "pinned") close(true);
        else setMode("pinned");
      }}>
      <AnnouncementIcon size={19} />
      <span className={styles.count} aria-hidden="true">{entries.length}</span>
      {!open && <span className={styles.tooltip}>{entries.length} announcements</span>}
    </motion.button>
    {mounted && createPortal(<AnimatePresence>
      {open && <motion.div ref={panel} id={id} role="dialog" aria-label="Announcements" tabIndex={-1}
        className={`${styles.position} ${styles.panel}`} style={position} data-lenis-prevent
        onPointerEnter={cancelClose} onPointerLeave={scheduleClose}
        initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.96, transition: { duration: duration.instant, ease: ease.out } }}
        transition={{ duration: duration.fast, ease: ease.out }}>
        <header className={styles.header}>
          <h2>Announcements</h2>
          {mode === "pinned" && <button type="button" onClick={() => close(true)} className={styles.close} aria-label="Close announcements"><X aria-hidden="true" /></button>}
        </header>
        <ul className={styles.list} onKeyDown={navigateList}>
          {entries.map(entry => {
            const date = eventDetails(entry);
            const meta = date?.label ?? (entry.type !== "Update" ? entry.type : undefined);
            return <li key={entry.id}>
              <Link href={entry.href} className={styles.item} data-announcement-link onClick={event => {
                close();
                if (entry.onSelect) { event.preventDefault(); entry.onSelect(); }
              }}>
                {date ? <span className={`${styles.thumbnail} ${styles.dateTile}`} aria-hidden="true"><span className={styles.day}>{date.day}</span><span className={styles.month}>{date.month}</span></span>
                  : <span className={styles.thumbnail}><Image src={entry.image} alt="" fill sizes="56px" /></span>}
                <span className={styles.copy}>
                  <span className={styles.title}>{entry.title}</span>
                  {meta && <span className={styles.meta}>{meta}</span>}
                </span>
                <ArrowUpRight className={styles.arrow} aria-hidden="true" />
              </Link>
            </li>;
          })}
        </ul>
      </motion.div>}
    </AnimatePresence>, document.body)}
  </>;
}
