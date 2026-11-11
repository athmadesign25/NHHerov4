"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Phone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import styles from "./BookingSupportContact.module.css";

const SUPPORT_NUMBER = "08067506836";
const FEEDBACK_MS = 2000;
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Desktop support control shared by doctor discovery and profile pages. */
export default function BookingSupportContact() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return createPortal(
    <div ref={root} className={styles.contact} data-booking-support>
      <motion.button layout={reduceMotion ? false : true}
        transition={{ layout: { duration: duration.moderate, ease: ease.out } }}
        type="button" className={styles.number} onClick={copyNumber}
        aria-label="Copy phone number 08067506836" title="Copy phone number"
        data-copied={status === "copied"}>
        <motion.span layout={reduceMotion ? false : "position"} className={styles.label} aria-hidden="true">
          {status === "copied" ? "Copied" : "080 6750 6836"}
        </motion.span>
      </motion.button>
      <a className={styles.phone} href={`tel:${SUPPORT_NUMBER}`}
        aria-label="Call 08067506836 to book an appointment" title="Call to book">
        <Phone aria-hidden="true" />
      </a>
      <span className={status === "error" ? styles.error : styles.status} role="status">
        {status === "copied" ? "Phone number copied" : status === "error" ? "Couldn’t copy. Please dial 08067506836." : ""}
      </span>
    </div>, document.body
  );
}
