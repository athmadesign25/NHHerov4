"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { UsersRound, X } from "lucide-react";
import styles from "./MemberSwitchCoachmark.module.css";

const SEEN_KEY = "nh-member-switch-hint-seen";
let shownThisSession = false;

export default function MemberSwitchCoachmark({ anchor, enabled }: { anchor: RefObject<HTMLButtonElement | null>; enabled: boolean }) {
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    const timeout = window.setTimeout(() => {
      const target = anchor.current;
      if (!target || !target.getClientRects().length || target.getBoundingClientRect().bottom <= 0 || shownThisSession || document.querySelector("dialog[open]")) return;
      try { if (sessionStorage.getItem(SEEN_KEY)) return; } catch { /* In-memory fallback below. */ }
      shownThisSession = true;
      // Store only this presentation preference, never a patient's information.
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* The in-memory flag prevents repeats. */ }
      setVisible(true);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [anchor, enabled]);

  useLayoutEffect(() => {
    const surface = panel.current;
    if (!visible || !enabled || !surface) return;
    surface.showPopover();
    const position = () => {
      const target = anchor.current;
      if (!target || !target.getClientRects().length) { setVisible(false); return; }
      const bounds = target.getBoundingClientRect();
      const unit = parseFloat(getComputedStyle(surface).getPropertyValue("--sp-1"));
      const width = Math.min(unit * 40, innerWidth - unit * 4);
      const left = Math.max(unit * 2, Math.min(bounds.right - width, innerWidth - width - unit * 2));
      surface.style.setProperty("--hint-width", `${width}px`);
      surface.style.setProperty("--hint-left", `${left}px`);
      surface.style.setProperty("--hint-top", `${bounds.bottom + unit * 1.5}px`);
      surface.style.setProperty("--hint-pointer", `${Math.min(width - unit * 3, Math.max(unit * 3, bounds.left + bounds.width / 2 - left))}px`);
    };
    position();
    const dismiss = () => setVisible(false);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !surface.contains(event.target)) dismiss(); };
    window.addEventListener("resize", position);
    window.addEventListener("scroll", dismiss, true);
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      surface.hidePopover();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", dismiss, true);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [visible, enabled, anchor]);

  if (!visible || !enabled) return null;
  return <motion.div ref={panel} popover="manual" className={styles.coachmark} role="note" aria-label="Patient selection tip" data-member-coachmark
    initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, ease: [.22, 1, .36, 1] }}>
    <span className={styles.icon} aria-hidden><UsersRound size={20} strokeWidth={1.7} /></span>
    <div className={styles.copy} role="status"><strong>Booking for someone else?</strong><span>Change patient here.</span></div>
    <button type="button" className={styles.dismiss} aria-label="Dismiss patient selection tip" onClick={event => {
      if (event.detail === 0) anchor.current?.focus({ preventScroll: true });
      setVisible(false);
    }}><X size={14} aria-hidden /></button>
  </motion.div>;
}
