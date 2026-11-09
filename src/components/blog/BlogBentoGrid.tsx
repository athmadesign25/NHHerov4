"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import styles from "./BlogBentoGrid.module.css";

const ROTATING_STATS = [
  { value: "4,500+", label: "Board-Certified Doctors & Clinical Reviewers" },
  { value: "100+", label: "Doctor-Authored Disease & Wellness Guides" },
  { value: "8,000+", label: "Complex Surgeries & Clinical Protocols Documented" },
];

export default function BlogBentoGrid() {
  const [statIndex, setStatIndex] = useState(0);
  const comprehensiveVideoRef = useRef<HTMLVideoElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  // Scroll-linked expansion to fill full screen width (Exact same as homepage)
  const { scrollYProgress: enterProgress } = useScroll({
    target: bentoRef,
    offset: ["start 92%", "start 25%"],
  });

  const gridScale = useTransform(enterProgress, [0, 1], [0.92, 1.0]);
  const gridWidth = useTransform(enterProgress, [0, 1], ["92%", "100%"]);
  const gridBlur = useTransform(enterProgress, [0, 0.4], ["blur(12px)", "blur(0px)"]);

  // Auto-rotating stat counter
  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % ROTATING_STATS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Ping-pong video playback for comprehensive care
  useEffect(() => {
    const videoEl = comprehensiveVideoRef.current;
    if (!videoEl) return;

    let direction: 1 | -1 = 1;
    let rafId: number;
    let cancelled = false;
    const REVERSE_STEP = 1 / 30;

    const step = () => {
      if (cancelled) return;
      if (direction === 1) {
        if (videoEl.ended || videoEl.currentTime >= videoEl.duration - 0.05) {
          direction = -1;
          videoEl.pause();
        }
      } else {
        const next = videoEl.currentTime - REVERSE_STEP;
        if (next <= 0) {
          videoEl.currentTime = 0;
          direction = 1;
          videoEl.play().catch(() => {});
        } else {
          videoEl.currentTime = next;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    const handleLoaded = () => {
      videoEl.play().catch(() => {});
      rafId = requestAnimationFrame(step);
    };

    if (videoEl.readyState >= 1) {
      handleLoaded();
    } else {
      videoEl.addEventListener("loadedmetadata", handleLoaded);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      videoEl.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

  return (
    <section className={styles.bentoSection} data-nav-theme="dark">
      <div className={styles.container}>
        {/* Section Header (Centered with TextSweepEffect & Clean Eyebrow) */}
        <div className={styles.sectionHeader}>
          <motion.div
            className={styles.cleanEyebrow}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            CLINICAL EXCELLENCE IN HEALTH KNOWLEDGE
          </motion.div>
          <h2 className={styles.sectionTitle}>
            <TextSweepEffect words={["Why Millions Trust Narayana Health Information"]} sweepMs={1500} finalColor="#FFFFFF" />
          </h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Bridging cutting-edge clinical research, quaternary hospital protocols, and everyday patient wellness into clear, accessible health guidance.
          </motion.p>
        </div>

        {/* 12-Column Bento Grid with Scroll Expansion (Matching Homepage) */}
        <div ref={bentoRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <motion.div
            className={styles.bentoExpandWrapper}
            style={{
              scale: gridScale,
              width: gridWidth,
              filter: gridBlur,
            }}
          >
            <div className={styles.bentoGrid}>
              {/* ROW 1 & 2 - CARD 1: Clinical Rigour & Excellence */}
              <motion.div
                className={styles.heroCard}
                style={{ transformOrigin: "center" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src="/bento-clinical-excellence.png"
                  alt="Clinical Rigour at Narayana Health"
                  className={styles.heroBgImage}
                />
                <div className={styles.heroTopOverlay} />
                <div className={styles.heroBottomOverlay} />

                <div className={styles.heroHeaderUnit}>
                  <h3 className={styles.heroTitle}>Clinical Rigour</h3>
                  <p className={styles.heroSubtitle}>
                    Doctor-authored, peer-reviewed health insights backed by quaternary care protocols
                  </p>
                </div>

                <div className={styles.heroStatUnit}>
                  <div className={styles.heroStatInner}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={ROTATING_STATS[statIndex].value}
                        initial={{ opacity: 0, y: 6, filter: "blur(5px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -6, filter: "blur(5px)" }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        <div className={styles.heroStatValue}>{ROTATING_STATS[statIndex].value}</div>
                        <div className={styles.heroStatLabel}>{ROTATING_STATS[statIndex].label}</div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* ROW 1 - CARD 2: Patient-First Support */}
              <motion.div
                className={`${styles.cardRow1Equal} ${styles.cardRow1Col2}`}
                style={{ transformOrigin: "center" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src="/bento-patient-first.jpg"
                  alt="Patient-First Support"
                  className={styles.cardBgImage}
                />
                <div className={styles.topBlurOverlay} />
                <div className={styles.cardHeaderUnit}>
                  <h3 className={styles.cardTitle}>Patient-First Support</h3>
                  <p className={styles.cardSubtitle}>
                    Clear communication, recovery guides, and care navigation for every family
                  </p>
                </div>
              </motion.div>

              {/* ROW 1 - CARD 3: Advanced Technology */}
              <motion.div
                className={`${styles.cardRow1Equal} ${styles.cardRow1Col3}`}
                style={{ transformOrigin: "center" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src="/bento-advanced-technology.jpg"
                  alt="Advanced Technology"
                  className={styles.cardBgImage}
                />
                <div className={styles.topBlurOverlay} />
                <div className={styles.cardHeaderUnit}>
                  <h3 className={styles.cardTitle}>Advanced Technology</h3>
                  <p className={styles.cardSubtitle}>
                    Cutting-edge diagnostics and surgical innovations documented by practicing experts
                  </p>
                </div>
              </motion.div>

              {/* ROW 2 - CARD 4: Top Medical Experts */}
              <motion.div
                className={styles.cardRow2Wider}
                style={{ transformOrigin: "center" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src="/bento-top-medical-experts.jpg"
                  alt="Top Medical Experts"
                  className={styles.cardBgImage}
                />
                <div className={styles.topBlurOverlay} />
                <div className={styles.cardHeaderUnit}>
                  <h3 className={styles.cardTitle}>Top Medical Experts</h3>
                  <p className={styles.cardSubtitle}>
                    4,500+ specialists sharing evidence-based wellness &amp; preventative knowledge
                  </p>
                </div>
              </motion.div>

              {/* ROW 2 - CARD 5: Comprehensive Care Video */}
              <motion.div
                className={styles.accreditationsCard}
                style={{ transformOrigin: "center" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <video
                  ref={comprehensiveVideoRef}
                  src="/5808902_Coll_wavebreak_Hospital_1280x720.mp4"
                  className={styles.cardBgImage}
                  muted
                  playsInline
                  preload="auto"
                  aria-label="Comprehensive Care at Narayana Health"
                />
                <div className={styles.accreditationsDarkOverlay} />
                <div className={styles.cardHeaderUnit}>
                  <h3 className={styles.cardTitle}>Comprehensive Care</h3>
                  <p className={styles.cardSubtitle}>
                    Multidisciplinary expertise across diagnosis, treatment, critical care and recovery
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
