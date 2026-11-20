"use client";

import React from "react";
import { PhoneCall, Clock, ArrowUpRight } from "lucide-react";
import styles from "./ContactCareSidebarCard.module.css";

interface ContactCareSidebarCardProps {
  phone?: string;
  displayPhone?: string;
  title?: string;
  subtitle?: string;
  bookingHref?: string;
}

export default function ContactCareSidebarCard({
  phone = "18003090309",
  displayPhone = "1800 309 0309",
  title = "24×7 Care Helpline",
  subtitle = "Immediate assistance for emergency admissions, OPD appointments & second opinions.",
  bookingHref = "/book-an-appointment",
}: ContactCareSidebarCardProps) {
  return (
    <div className={styles.careCardContainer} role="complementary" aria-label="Narayana Health Care Helpline">
      <div className={styles.headerRow}>
        <div className={styles.pulseIndicatorWrap}>
          <span className={styles.pulseDot} />
          <span className={styles.pulsePing} />
        </div>
        <span className={styles.eyebrowText}>{title}</span>
      </div>

      <a
        href={`tel:${phone}`}
        className={styles.phoneNumberLink}
        title={`Call Narayana Health Helpline ${displayPhone}`}
        aria-label={`Call 24x7 Helpline at ${displayPhone}`}
      >
        <PhoneCall size={16} className={styles.phoneIcon} />
        <span>{displayPhone}</span>
      </a>

      <p className={styles.careSubtitle}>{subtitle}</p>

      <div className={styles.buttonActionRow}>
        <a
          href={`tel:${phone}`}
          className={styles.callNowBtn}
          aria-label={`Tap to call ${displayPhone}`}
        >
          <PhoneCall size={13} />
          <span>Call Helpline</span>
        </a>
        <a
          href={bookingHref}
          className={styles.bookOpdLink}
          aria-label="Book OPD Appointment Online"
        >
          <span>Book OPD</span>
          <ArrowUpRight size={12} />
        </a>
      </div>

      <div className={styles.footerNote}>
        <Clock size={11} className={styles.clockIcon} />
        <span>Toll-free · Round-the-clock clinical triage</span>
      </div>
    </div>
  );
}
