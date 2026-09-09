"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, FileText, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import styles from "./AppDownloadBanner.module.css";

// Popup card dimensions are each scaled by the same factor as the base phone
// mockup (popup native px * (BASE_WIDTH / 726), base native width) so every
// popup keeps its true size relative to the base screen instead of being
// force-fit to a uniform box.
const features = [
  {
    id: 1,
    title: "Video consultations from home",
    icon: Video,
    img: "/NHCare Screens/Video Consultation.png",
    popupImg: "/NHCare Screens/Video Consultation Popup.png",
    popupWidth: 182,
    popupHeight: 247,
  },
  {
    id: 2,
    title: "Book appointments in 60 seconds",
    icon: Calendar,
    img: "/NHCare Screens/Book Appointment.png",
    popupImg: "/NHCare Screens/Book Appointment Popup.png",
    popupWidth: 184,
    popupHeight: 174,
  },
  {
    id: 3,
    title: "Access your health records anytime",
    icon: FileText,
    img: "/NHCare Screens/Health Records.png",
    popupImg: "/NHCare Screens/Health Records Popup.png",
    popupWidth: 182,
    popupHeight: 149,
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    icon: Activity,
    img: "/NHCare Screens/Vital Tracking.png",
    popupImg: "/NHCare Screens/Vital Tracking Popup.png",
    popupWidth: 231,
    popupHeight: 183,
  },
];

const BASE_WIDTH = 220;
const BASE_HEIGHT = 364; // natural aspect (726:1200) at BASE_WIDTH
const BASE_VISIBLE_HEIGHT = 330; // crops the bottom edge off so the phone appears to sink below frame

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
                {/* Ring (single outline ring, staggered in on mount) */}
                <motion.div
                  className={`${styles.concentricRing} ${styles.ring2}`}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.45 }}
                  transition={{ duration: 0.42, delay: 0.20, ease: [0.16, 1, 0.3, 1] }}
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
                  className={styles.phoneMockupWrap}
                >
                  {/* Base screen: bottom edge cropped off so it appears to sink below the frame */}
                  <div className={styles.phoneFrame}>
                    <Image
                      src={activeFeature.img}
                      alt={activeFeature.title}
                      width={BASE_WIDTH}
                      height={BASE_HEIGHT}
                      className={styles.phoneImg}
                      priority
                    />
                  </div>

                  {/* Popup: center touches the base screen's right edge, ~28px below its top,
                      appears as an overlay ~1s after the base screen mounts */}
                  <motion.div
                    className={styles.popupFrame}
                    style={{
                      width: activeFeature.popupWidth,
                      height: activeFeature.popupHeight,
                      transformOrigin: "bottom center",
                    }}
                    initial={{ opacity: 0, scale: 0.8, x: "-50%" }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: "-50%",
                      transition: { duration: 0.5, delay: 1, ease: [0.16, 1, 0.3, 1] },
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: "-50%", transition: { duration: 0.2, ease: "easeIn" } }}
                  >
                    <Image
                      src={activeFeature.popupImg}
                      alt={`${activeFeature.title} popup`}
                      width={activeFeature.popupWidth}
                      height={activeFeature.popupHeight}
                      className={styles.popupImg}
                    />
                  </motion.div>
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
