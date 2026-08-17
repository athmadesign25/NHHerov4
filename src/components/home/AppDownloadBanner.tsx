"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleCheckBig } from "lucide-react";
import styles from "./AppDownloadBanner.module.css";

const SCREENS = [
  "/NHCare Screens/Book Appointment.png",
  "/NHCare Screens/Health Records.png",
  "/NHCare Screens/Video Consultation.png",
  "/NHCare Screens/Vital Tracking.png",
];

const appHighlights = [
  "Book appointments in 60 seconds",
  "Access your health records anytime",
  "Video consultations from home",
  "Track vitals and wellness reports",
];

export default function AppDownloadBanner() {
  const [currentScreen, setCurrentScreen] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % SCREENS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentScreen]);

  return (
    <section className={styles.section} id="app-download-banner">
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



            <div className={styles.actionsContainer}>
              <div className={styles.qrBox}>
                <img src="/qr.svg" alt="QR Code" width={84} height={84} style={{ borderRadius: 8 }} />
                <span>Scan to install</span>
              </div>
              <div className={styles.actionsRow}>
                <a href="#" tabIndex={0} className={styles.storeBadge}>
                  <img alt="Download on the App Store" src="/logos/App%20store.svg" />
                </a>
                <a href="#" tabIndex={0} className={styles.storeBadge}>
                  <img alt="Get it on Google Play" src="/logos/Google%20play.svg" />
                </a>
              </div>
            </div>
          </div>

          <div className={styles.mockupContainer}>
            <div className={styles.floatingBadgeWrap}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  className={`${styles.featureChip} ${styles.floatingBadge}`}
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <CircleCheckBig size={16} />
                  <span>{appHighlights[currentScreen]}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <img 
               src={SCREENS[0]} 
               className={styles.mockupImg} 
               style={{ visibility: 'hidden' }} 
               alt="" 
            />
            
            <AnimatePresence>
              <motion.img
                key={currentScreen}
                src={SCREENS[currentScreen]}
                alt="NH Care App Screens"
                className={`${styles.mockupImg} ${styles.mockupImgAnimated}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </AnimatePresence>

            <div className={styles.dotsContainer}>
              {SCREENS.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.dot} ${idx === currentScreen ? styles.activeDot : ""}`}
                  onClick={() => setCurrentScreen(idx)}
                  aria-label={`View screen ${idx + 1}`}
                />
              ))}
            </div>
          </div>
      </motion.div>
    </section>
  );
}
