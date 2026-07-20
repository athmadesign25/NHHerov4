"use client";

import { motion } from "framer-motion";
import { QrCode, CircleCheckBig } from "lucide-react";
import Image from "next/image";
import mockupImg from "../../../public/Mockups.png";
import styles from "./AppDownloadBanner.module.css";

const appHighlights = [
  "Book appointments in 60 seconds",
  "Video consultations from home",
  "Access your health records anytime",
  "Track vitals and wellness reports",
  "Manage your entire family",
];

export default function AppDownloadBanner() {
  return (
    <section className={`section ${styles.section}`} id="app-download-banner">
      <div className="container">
        <motion.div
          className={styles.inner}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.contentCol}>
            <div className={`${styles.eyebrow} section-eyebrow`}>NH CARE APP</div>
            <h2 className={styles.title}>
              Your Health,
              <br />
              <span>Always With You.</span>
            </h2>
            <p className={`section-subtitle section-subtitle-light ${styles.subtitle}`}>
              India&apos;s most trusted hospital app. Millions of patients use NH Care to manage
              their journey end-to-end from booking to recovery.
            </p>

            <div className={styles.featuresWrap}>
              {appHighlights.map((item) => (
                <div key={item} className={styles.featureChip}>
                  <CircleCheckBig size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className={styles.actionsRow}>
              <a href="#" tabIndex={0} className={styles.storeBadge}>
                <img alt="Download on the App Store" src="/App%20store.svg" />
              </a>
              <a href="#" tabIndex={0} className={styles.storeBadge}>
                <img alt="Get it on Google Play" src="/Google%20play.svg" />
              </a>
              <div className={styles.qrBox}>
                <QrCode size={22} />
                <span>Scan to install</span>
              </div>
            </div>
          </div>

          <div className={styles.mockupContainer}>
            <Image
              alt="NH Care App Mockups"
              src={mockupImg}
              style={{ width: "100%", maxWidth: "425px", height: "100%", objectFit: "contain", objectPosition: "bottom right", transform: "scale(1.5)", transformOrigin: "bottom right" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
