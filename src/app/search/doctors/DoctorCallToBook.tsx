"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import BookingSupportContact from "@/features/booking/shared/BookingSupportContact";
import styles from "./DoctorCallToBook.module.css";

export default function DoctorCallToBook({ placement, hidden = false }: { placement: "mobile" | "filters"; hidden?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [introduced, setIntroduced] = useState(false);
  const mobile = placement === "mobile";
  const expanded = mobile && !introduced && !reducedMotion;

  useEffect(() => {
    if (!mobile) return;
    // Reading time, rather than an animation delay; calling works throughout.
    const timer = window.setTimeout(() => setIntroduced(true), 2400);
    return () => window.clearTimeout(timer);
  }, [mobile]);

  if (!mobile) return hidden ? null : <BookingSupportContact />;

  return (
    <a
      className={`${styles.call} ${styles[placement]}`}
      hidden={hidden}
      data-expanded={expanded}
      href="tel:08067506836"
      aria-label="Call to book an appointment: 08067506836"
      title="Call to book an appointment"
      data-doctor-call={placement}
    >
      <span className={styles.icon}><Phone aria-hidden="true" /></span>
      <span className={styles.label}>Call to book</span>
    </a>
  );
}
