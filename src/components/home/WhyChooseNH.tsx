"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import styles from "./WhyChooseNH.module.css";

const STATS = [
  { value: "8,000+", label: "Cancer surgeries performed annually" },
  { value: "4,500+", label: "Doctors and staff trained on standard protocols" },
  { value: "1,200+", label: "Robotic surgeries performed to date" },
];

// How much raw scroll distance (px) the exit blur/fade eases over, once
// triggered — see exitRange below for what triggers it.
const EXIT_RANGE_PX = 400;

export default function WhyChooseNH() {
  const sectionRef = useRef<HTMLElement>(null);
  const [statIndex, setStatIndex] = useState(0);

  // Auto-looping stat unit (changes every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % STATS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Scroll-linked expansion for entire bento grid (grows from 90% to 100% full page width)
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start 92%", "start 25%"],
  });

  const gridScale = useTransform(enterProgress, [0, 1], [0.90, 1.0]);
  const gridWidth = useTransform(enterProgress, [0, 1], ["90%", "100%"]);
  const gridBlur = useTransform(enterProgress, [0, 0.4], ["blur(12px)", "blur(0px)"]);

  // Max 10px card corner radius -> unrounds to 0px for outer corners touching screen edge
  const edgeRadius = useTransform(enterProgress, [0.8, 1.0], ["10px", "0px"]);

  // Exit: the whole section blurs + fades out only once AppDownloadBanner's
  // own title has scrolled a third of the way up the viewport (from the
  // bottom) — same "title unit crosses the 2/3-viewport line" convention
  // used for CentreOfExcellence's own dim gating — rather than reacting to
  // the (now-removed) page-level dark-bg crossfade, which triggered far
  // earlier than this section actually finishes leaving the viewport.
  const [exitRange, setExitRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const measure = () => {
      const titleEl = document.getElementById("app-download-title-unit");
      if (!titleEl) return;
      const vh = window.innerHeight;
      const titleTop = titleEl.getBoundingClientRect().top + window.scrollY;
      const start = titleTop - (vh - vh / 3);
      setExitRange([start, start + EXIT_RANGE_PX]);
    };

    // A single early measurement isn't reliable here — AppDownloadBanner's
    // title sits far enough down the page that its absolute position can
    // still drift by 100+ px after mount (cumulative layout settling
    // everywhere above it), so this keeps re-measuring on scroll too
    // (rAF-throttled, same pattern as HealthPackages' own scroll handler)
    // rather than trusting one early snapshot.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        measure();
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    const settleTimer = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer);
    };
  }, []);

  const { scrollY } = useScroll();
  const exitOpacity = useTransform(scrollY, exitRange, [1, 0]);
  const exitBlur = useTransform(scrollY, exitRange, ["blur(0px)", "blur(20px)"]);

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      id="WhyChooseNH_section"
      style={{ opacity: exitOpacity, filter: exitBlur }}
    >
      <div className={styles.container}>
        {/* Section Header: eyebrow keeps its own simple blur-in (same timing
            as before); title/subtitle now animate independently instead of
            as part of this shared block. */}
        <div className={styles.header}>
          <motion.div
            className="section-eyebrow"
            initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            BEST IN HEALTHCARE
          </motion.div>
          <h2 className={styles.sectionTitle}>
            <TextSweepEffect words={["Why Choose Narayana Health?"]} sweepMs={1200} />
          </h2>
          <motion.p
            className={styles.sectionSubtitle}
            initial={{ opacity: 0, filter: "blur(16px)", y: -24 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          >
            Where your health &amp; well-being comes first, always.
          </motion.p>
        </div>

        {/* Scroll Expansion Wrapper for Entire Bento Grid. The whole section
            is otherwise marked light (white bg around the header text), but
            every tile in this grid is a dark photo/video card with its own
            dark overlay — nested here so the navbar reads dark/white text
            specifically while it's over the grid, not the lighter header. */}
        <motion.div
          className={styles.bentoExpandWrapper}
          data-nav-theme="dark"
          style={{
            scale: gridScale,
            width: gridWidth,
            filter: gridBlur,
          }}
        >
          {/* 12-Column Bento Grid - Full Page Width */}
          <div className={styles.bentoGrid}>
            {/* ROW 1 & 2 - CARD 1: Clinical Excellence (Column 1 Hero) */}
            <motion.div
              className={styles.heroCard}
              style={{
                borderTopLeftRadius: edgeRadius,
                borderBottomLeftRadius: edgeRadius,
              }}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(18px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.15, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/bento-clinical-excellence.png"
                alt="Clinical Excellence"
                className={styles.heroBgImage}
              />
              <div className={styles.heroTopOverlay} />
              <div className={styles.heroBottomOverlay} />

              <div className={styles.heroHeaderUnit}>
                <h3 className={styles.heroTitle}>Clinical Excellence</h3>
                <p className={styles.heroSubtitle}>
                  Protocols and tracked outcomes for safer recovery paths
                </p>
              </div>

              <div className={styles.heroStatUnit}>
                <div className={styles.heroStatInner}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={STATS[statIndex].value}
                      initial={{ opacity: 0, y: 6, filter: "blur(5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(5px)" }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                      <div className={styles.heroStatValue}>{STATS[statIndex].value}</div>
                      <div className={styles.heroStatLabel}>{STATS[statIndex].label}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* ROW 1 - CARD 2: Patient-First Support (Equal width 4 cols) */}
            <motion.div
              className={`${styles.cardRow1Equal} ${styles.cardRow1Col2}`}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(18px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.15, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
                  Clear communication and care navigation for every family
                </p>
              </div>
            </motion.div>

            {/* ROW 1 - CARD 3: Advanced Technology (Equal width 4 cols) */}
            <motion.div
              className={`${styles.cardRow1Equal} ${styles.cardRow1Col3}`}
              style={{
                borderTopRightRadius: edgeRadius,
              }}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(18px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.15, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
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
                  Modern diagnostics and surgical platforms for precision treatment
                </p>
              </div>
            </motion.div>

            {/* ROW 2 - CARD 4: Top Medical Experts (Wider 5 cols) */}
            <motion.div
              className={styles.cardRow2Wider}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(18px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.15, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
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
                  Senior specialists for complex procedures and continuity of care
                </p>
              </div>
            </motion.div>

            {/* ROW 2 - CARD 5: Comprehensive Care (Smaller/Compact 3 cols) */}
            <motion.div
              className={styles.accreditationsCard}
              style={{
                borderBottomRightRadius: edgeRadius,
              }}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(18px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.15, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/why-nh-comprehensive-care.jpg"
                alt="Comprehensive Care"
                className={styles.cardBgImage}
              />
              <div className={styles.accreditationsDarkOverlay} />
              <div className={styles.cardHeaderUnit}>
                <h3 className={styles.cardTitle}>Comprehensive Care</h3>
                <p className={styles.cardSubtitle}>
                  Multidisciplinary care across diagnosis, treatment, surgery, critical care and rehabilitation.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
