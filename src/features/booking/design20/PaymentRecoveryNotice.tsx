"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import styles from "./PaymentRecoveryNotice.module.css";

type Props = {
  status: "cancelled" | "failed";
  expired: boolean;
  covered?: boolean;
};

export default function PaymentRecoveryNotice({ status, expired, covered = false }: Props) {
  const titleId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [status, expired, reduced]);

  return <motion.section
    className={styles.notice}
    role="alert"
    aria-labelledby={titleId}
    initial={reduced ? false : { opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out }}
  >
    <span className={styles.icon} aria-hidden><CircleAlert size={24} /></span>
    <div className={styles.copy}>
      <h2 id={titleId} ref={heading} tabIndex={-1}>{status === "cancelled" ? "Payment cancelled" : "Payment failed"}</h2>
      <p>{expired
        ? "Your reservation has expired. Choose another slot to continue."
        : covered ? "Your benefits now cover the full fee. Confirm your appointment to finish booking."
        : "Your appointment isn’t confirmed. Retry payment, or choose Skip to view your reservation and pay in the patient portal before the 15-minute hold ends."}</p>
    </div>
  </motion.section>;
}
