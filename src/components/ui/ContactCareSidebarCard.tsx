"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import styles from "./ContactCareSidebarCard.module.css";

interface ContactCareSidebarCardProps {
  phone?: string;
  displayPhone?: string;
  title?: string;
  subtitle?: string;
}

export default function ContactCareSidebarCard({
  phone = "18003090309",
  displayPhone = "1800 309 0309",
  title = "24×7 Care Helpline",
  subtitle = "Toll-free doctor appointment & triage",
}: ContactCareSidebarCardProps) {
  return (
    <div className={styles.helplineSection} role="complementary" aria-label="Narayana Health Care Helpline">
      <span className={styles.helplineEyebrow}>{title}</span>
      <a
        href={`tel:${phone}`}
        className={styles.helplinePhoneLink}
        title={`Call ${displayPhone}`}
        aria-label={`Call ${title} at ${displayPhone}`}
      >
        <PhoneCall size={13} className={styles.phoneIcon} />
        <span>{displayPhone}</span>
      </a>
      {subtitle && <span className={styles.helplineSubtext}>{subtitle}</span>}
    </div>
  );
}
