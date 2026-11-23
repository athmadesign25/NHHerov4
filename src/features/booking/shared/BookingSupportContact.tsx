"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Copy, Phone } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import styles from "./BookingSupportContact.module.css";

const SUPPORT_NUMBER = "08067506836";
const FEEDBACK_MS = 2000;
const INTRO_MS = 3200;
const LISTING_INTRO_MS = 3000;
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Desktop support control shared by doctor discovery and profile pages. */
export default function BookingSupportContact({ combined = false }: { combined?: boolean }) {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [introduced, setIntroduced] = useState(false);
  const [phoneHovered, setPhoneHovered] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showCopy = (hovered || focused) && status !== "copied";
  const showHelp = !introduced || phoneHovered || phoneFocused;

  useEffect(() => {
    if (!mounted) return;
    // Reading time; both contact actions remain available throughout.
    const timer = setTimeout(() => setIntroduced(true), combined ? LISTING_INTRO_MS : INTRO_MS);
    return () => clearTimeout(timer);
  }, [mounted, combined]);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  useEffect(() => {
    if (!mounted || !root.current) return;
    const contact = root.current;
    const dock = document.querySelector<HTMLElement>("[data-profile-booking]");
    if (!dock) return;
    const position = () => {
      const bounds = contact.getBoundingClientRect();
      const booking = dock.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(contact).getPropertyValue("--space-16"));
      const overlap = bounds.left < booking.right && bounds.right > booking.left;
      contact.style.setProperty("--support-dock-clearance", overlap ? `${window.innerHeight - booking.top + gap}px` : "0px");
    };
    const observer = new ResizeObserver(position);
    observer.observe(dock);
    observer.observe(contact);
    window.addEventListener("resize", position);
    position();
    return () => { observer.disconnect(); window.removeEventListener("resize", position); };
  }, [mounted]);

  async function copyNumber() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(SUPPORT_NUMBER);
      setStatus("copied");
      resetTimer.current = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
    } catch {
      setStatus("error");
    }
  }

  if (!mounted) return null;

  if (combined) return createPortal(
    <div className={styles.contact} data-booking-support>
      <a className={styles.combined} href={`tel:${SUPPORT_NUMBER}`}
        data-expanded={showHelp}
        onMouseEnter={() => setPhoneHovered(true)} onMouseLeave={() => setPhoneHovered(false)}
        onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
        aria-label="Need help with booking? Call 08067506836">
        <span className={styles.combinedText} aria-hidden="true">
          <span className={styles.combinedHint}>Need help with booking?</span>
          <span className={styles.combinedNumber}>080 6750 6836</span>
        </span>
        <span className={styles.combinedCall}>
          <Phone className={styles.combinedIcon} aria-hidden="true" />
        </span>
      </a>
    </div>, document.body
  );

  return createPortal(
    <div ref={root} className={styles.contact} data-booking-support>
      <motion.button layout={reduceMotion ? false : true}
        transition={{ layout: { duration: duration.moderate, ease: ease.out } }}
        type="button" className={styles.number} onClick={copyNumber}
        onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        aria-label="Copy phone number 08067506836" title="Copy phone number"
        data-copied={status === "copied"}>
        <motion.span layout={reduceMotion ? false : "position"} className={styles.label} aria-hidden="true">
          {status === "copied" ? "Copied" : "080 6750 6836"}
        </motion.span>
        {showCopy && (
          <motion.span layout={reduceMotion ? false : "position"} className={styles.copyIcon}
            initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : duration.fast }} aria-hidden="true">
            <Copy />
          </motion.span>
        )}
      </motion.button>
      <motion.a layout={reduceMotion ? false : true}
        transition={{ layout: { duration: reduceMotion ? 0 : duration.slow, ease: ease.standard } }}
        className={styles.phone} href={`tel:${SUPPORT_NUMBER}`}
        onHoverStart={() => setPhoneHovered(true)} onHoverEnd={() => setPhoneHovered(false)}
        onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
        aria-label="Call 08067506836 to book an appointment" title="Call to book">
        <AnimatePresence initial={false} mode="popLayout">
          {showHelp && <motion.span key="help" layout={reduceMotion ? false : "position"}
            className={styles.helpLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : duration.fast }} aria-hidden="true">
            Need help booking?
          </motion.span>}
        </AnimatePresence>
        <motion.span layout={reduceMotion ? false : "position"} className={styles.phoneIcon} aria-hidden="true">
          <Phone />
        </motion.span>
      </motion.a>
      <span className={status === "error" ? styles.error : styles.status} role="status">
        {status === "copied" ? "Phone number copied" : status === "error" ? "Couldn’t copy. Please dial 08067506836." : ""}
      </span>
    </div>, document.body
  );
}
