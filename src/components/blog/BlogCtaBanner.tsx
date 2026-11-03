"use client";

import React from "react";
import Link from "next/link";
import { Calendar, PhoneCall, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./BlogCtaBanner.module.css";

export default function BlogCtaBanner() {
  return (
    <section className={styles.ctaSection} data-nav-theme="dark">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          {/* Subtle Ambient Radial Glow */}
          <div className={styles.glowRadial} />

          <div className={styles.cardContent}>
            <div className={styles.eyebrowBadge}>
              <ShieldCheck size={14} />
              <span>NEED PERSONALIZED MEDICAL ADVICE?</span>
            </div>

            <h2 className={styles.ctaTitle}>
              Connect with a Narayana Health Specialist Today
            </h2>

            <p className={styles.ctaSubtitle}>
              Whether you are seeking a primary clinical opinion, advanced surgery evaluation, or specialized preventive health screening — our 4,500+ world-class consultants are here for you.
            </p>

            <div className={styles.actionsRow}>
              <Link href="/doctors" className={styles.primaryBtn}>
                <Calendar size={17} />
                <span>Book Doctor Appointment</span>
              </Link>

              <Link href="/health-packages" className={styles.secondaryBtn}>
                <span>Explore Health Packages</span>
                <ArrowRight size={15} />
              </Link>

              <a href="tel:18003090309" className={styles.phoneLink}>
                <PhoneCall size={16} />
                <span>Call 24×7: 1800 309 0309</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
