"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import styles from "./SpecialityMobileBookingFAB.module.css";

interface SpecialityMobileBookingFABProps {
  title: string;
  subtitle?: string;
  phone?: string;
  findSpecialistHref?: string;
  isVisible: boolean;
}

export default function SpecialityMobileBookingFAB({
  title,
  subtitle = "Expert care & consultations",
  phone = "08067506836",
  findSpecialistHref = "/doctors",
  isVisible,
}: SpecialityMobileBookingFABProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.dock}
          initial={{ y: 50, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.animatedSurface}>
            <span className={styles.bookingAccent} aria-hidden="true">
              <span className={styles.accentGlow}><span className={styles.accentTrack} /></span>
              <span className={styles.accentStroke}><span className={styles.accentTrack} /></span>
            </span>
            <div className={styles.surface}>
              <div className={styles.summary} data-appointment-summary="true">
                <div className={styles.infoCol}>
                  <strong>{title}</strong>
                  <span>{subtitle}</span>
                </div>
                <div className={styles.actionGroup}>
                  <a
                    className={styles.callAction}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    aria-label={`Call ${phone} to book an appointment`}
                    title="Call to book an appointment"
                  >
                    <Phone size={18} aria-hidden />
                  </a>
                  <Link href={findSpecialistHref} className={styles.primary}>
                    Find a specialist
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

