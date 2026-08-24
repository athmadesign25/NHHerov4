"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, FileText, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import styles from "./AppDownloadBanner.module.css";

const features = [
  {
    id: 1,
    title: "Video consultations from home",
    icon: Video,
    img: "/NHCare Screens/Video Consultation.png",
    isBooking: false,
  },
  {
    id: 2,
    title: "Book appointments in 60 seconds",
    icon: Calendar,
    img: "/NHCare Screens/Book Appointment.png",
    isBooking: true,
  },
  {
    id: 3,
    title: "Access your health records anytime",
    icon: FileText,
    img: "/NHCare Screens/Health Records.png",
    isBooking: false,
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    icon: Activity,
    img: "/NHCare Screens/Vital Tracking.png",
    isBooking: false,
  },
];

export default function AppDownloadBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play carousel every 4 seconds only when not hovered, resetting timer on manual interaction
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const activeFeature = features[activeIndex];
  const IconComponent = activeFeature.icon;

  return (
    <section className={styles.section} id="app-download-banner">
      <div className="container">
        <motion.div
          className={styles.contentCard}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Left Side: Copy + QR & Store Buttons */}
          <div className={styles.leftCol}>
            <div className={styles.eyebrow}>
              <span>NH CARE APP</span>
              <span className={styles.eyebrowLine} />
            </div>

            <h2 className={styles.title}>
              Your Health,
              <br />
              <span className={styles.titleHighlight}>Always With You.</span>
            </h2>

            <p className={styles.subtitle}>
              India&apos;s most trusted hospital app. Millions of patients use NH Care to manage their journey end-to-end from booking to recovery.
            </p>

            {/* QR & Store Buttons Row */}
            <div className={styles.downloadsRow}>
              {/* QR Box */}
              <div className={styles.qrBox}>
                <img src="/qr.svg" alt="QR Code" width={84} height={84} style={{ borderRadius: 8 }} />
                <span className={styles.qrLabel}>Scan to install</span>
              </div>

              {/* App Store and Google Play Containers */}
              <div className={styles.storesCol}>
                <div className={styles.storeContainer}>
                  <a href="#" className={styles.storeBadge} tabIndex={0}>
                    <img alt="Download on the App Store" src="/App%20store.svg" />
                  </a>
                </div>
                <div className={styles.storeContainer}>
                  <a href="#" className={styles.storeBadge} tabIndex={0}>
                    <img alt="Get it on Google Play" src="/Google%20play.svg" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Feature Pill + Concentric Rings + Phone Carousel */}
          <div className={styles.rightCol}>
            {/* Top Feature Name Pill with Concentric Rings Staggered Outward One-by-One from Inside */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={styles.pillWrapper}
              >
                {/* Ring 1 (Inner - appears 1st) */}
                <motion.div
                  className={`${styles.concentricRing} ${styles.ring1}`}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.75 }}
                  transition={{ duration: 0.38, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Ring 2 (Middle - appears 2nd) */}
                <motion.div
                  className={`${styles.concentricRing} ${styles.ring2}`}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.45 }}
                  transition={{ duration: 0.42, delay: 0.20, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Ring 3 (Outer - appears 3rd) */}
                <motion.div
                  className={`${styles.concentricRing} ${styles.ring3}`}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.22 }}
                  transition={{ duration: 0.48, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Feature Pill */}
                <div className={styles.featurePill}>
                  <div className={styles.pillIconBg}>
                    <IconComponent className={styles.pillIcon} size={16} />
                  </div>
                  <span className={styles.pillText}>{activeFeature.title}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Phone Display Unit with Left/Right Glass Arrows */}
            <div 
              className={styles.phoneCarouselUnit}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Left Glass Arrow Button */}
              <button
                onClick={handlePrev}
                className={styles.carouselArrowLeft}
                aria-label="Previous feature"
                type="button"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Phone Image Container with Animating Transition (Pinned to bottom) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0.5, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.5, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ transformOrigin: "bottom center" }}
                  className={`${styles.phoneMockupWrap} ${activeFeature.isBooking ? styles.bookingWrap : styles.regularWrap}`}
                >
                  <Image
                    src={activeFeature.img}
                    alt={activeFeature.title}
                    width={380}
                    height={540}
                    className={styles.phoneImg}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Right Glass Arrow Button */}
              <button
                onClick={handleNext}
                className={styles.carouselArrowRight}
                aria-label="Next feature"
                type="button"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
