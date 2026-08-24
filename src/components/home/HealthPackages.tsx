"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import styles from "./HealthPackages.module.css";

const packageCardsData = [
  {
    id: "package-1",
    title: "Healthy Heart Package",
    overview:
      "Heart focused screening to assess key risk markers and heart health",
    bgImage: "/Healthy-Heart-Package.png",
  },
  {
    id: "package-2",
    title: "Wellness 360 Health Package",
    overview:
      "Comprehensive health check covering major systems and key markers",
    bgImage: "/Wellness-360-Health-Package.png",
  },
  {
    id: "package-3",
    title: "Special Screening Packages",
    overview:
      "Specialized preventive screening tailored for specific health needs",
    bgImage: "/Special-Screening-Packages.png",
  },
];

const pointerItems = [
  "Total Cholesterol",
  "HDL Cholesterol",
  "LDL Cholesterol",
  "Triglycerides",
  "VLDL Cholesterol",
  "Total Cholesterol / HDL Ratio",
  "Fasting Blood Glucose",
  "HbA1c",
  "High-Sensitivity C-Reactive Protein (hs-CRP)",
  "Apolipoprotein B (ApoB)",
  "Lipoprotein (a) [Lp(a)]",
  "Homocysteine",
  "Creatinine",
  "Uric Acid",
  "AST (SGOT)",
  "ALT (SGPT)",
  "Haemoglobin",
  "Thyroid-Stimulating Hormone (TSH)",
];

function CardPointerTicker({ paused = false }: { paused?: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pointerItems.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [paused]);

  const currentItem = pointerItems[index];

  return (
    <div className={styles.pointerContainer}>
      <AnimatePresence mode="wait">
        {!paused ? (
          <motion.div
            key={currentItem}
            initial={{ opacity: 0, filter: "blur(10px)", x: -12 }}
            animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)", x: 12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={styles.pointerItem}
          >
            <div className={styles.checkCircle}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M4 12l5 5L20 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                />
              </svg>
            </div>

            <motion.span
              key={`text-${currentItem}`}
              className={styles.pointerText}
              initial={{ backgroundPosition: "0% 0%" }}
              animate={{ backgroundPosition: "100% 0%" }}
              transition={{
                duration: 1.2,
                delay: 0.4,
                ease: "easeInOut",
              }}
            >
              {currentItem}
            </motion.span>
          </motion.div>
        ) : (
          <div className={styles.pointerItem}>
            <div className={styles.checkCircle}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>
            <span className={styles.pointerText} style={{ backgroundPosition: "100% 0%" }}>
              {currentItem}
            </span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HealthPackages() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isCard3Shrinking, setIsCard3Shrinking] = useState(false);

  // scrollYProgress over the 300vh sticky scroll runway
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsCard3Shrinking(latest > 0.82);
  });

  // ── Card 1 ──
  const card1Scale = useTransform(scrollYProgress, [0.0, 0.10, 0.40], [1.0, 1.0, 0.80]);
  const card1BlurPx = useTransform(scrollYProgress, [0.0, 0.10, 0.40], [0, 0, 12]);
  const card1Blur = useTransform(card1BlurPx, (v) => `blur(${v}px)`);
  const card1DimOpacity = useTransform(scrollYProgress, [0.0, 0.10, 0.40], [0, 0, 0.5]);

  // ── Card 2 ──
  const card2Y = useTransform(scrollYProgress, [0.0, 0.10, 0.40, 1.0], ["110%", "110%", "0%", "0%"]);
  const card2Scale = useTransform(scrollYProgress, [0.0, 0.10, 0.40, 0.50, 0.75, 1.0], [0.80, 0.80, 1.0, 1.0, 0.80, 0.80]);
  const card2Radius = useTransform(scrollYProgress, [0.0, 0.10, 0.40, 1.0], ["20px", "20px", "0px", "0px"]);
  const card2BlurPx = useTransform(scrollYProgress, [0.0, 0.50, 0.75, 1.0], [0, 0, 12, 12]);
  const card2Blur = useTransform(card2BlurPx, (v) => `blur(${v}px)`);
  const card2DimOpacity = useTransform(scrollYProgress, [0.0, 0.50, 0.75, 1.0], [0, 0, 0.5, 0.5]);

  // ── Card 3 ──
  // Slides up from 110%→0% between 0.50–0.75. Stays full size at 1.0 until 0.82, then shrinks 20% (1.0→0.80) as user scrolls past!
  const card3Y = useTransform(scrollYProgress, [0.0, 0.50, 0.75, 1.0], ["110%", "110%", "0%", "0%"]);
  const card3Scale = useTransform(scrollYProgress, [0.0, 0.50, 0.75, 0.82, 1.0], [0.80, 0.80, 1.0, 1.0, 0.80]);
  const card3Radius = useTransform(scrollYProgress, [0.0, 0.50, 0.75, 0.82, 1.0], ["20px", "20px", "0px", "0px", "16px"]);
  const card3BlurPx = useTransform(scrollYProgress, [0.0, 0.82, 1.0], [0, 0, 8]);
  const card3Blur = useTransform(card3BlurPx, (v) => `blur(${v}px)`);
  const card3DimOpacity = useTransform(scrollYProgress, [0.0, 0.82, 1.0], [0, 0, 0.35]);

  return (
    <div className={styles.sectionWrap} id="health-packages">
      {/* Header scrolls naturally with the page */}
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className="section-eyebrow">HEALTH PACKAGES</div>
            <SplitText
              text="Recommended Health Packages"
              tag="h2"
              className={styles.title}
            />
            <p className={`section-subtitle ${styles.subtitle}`}>
              Designed by doctors for your care
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Scroll Runway: Card 1 scrolls up until top edge hits navbar, then pins */}
      <div ref={trackRef} className={styles.stackTrack}>
        <div className={styles.stickyViewport}>
          <div className={styles.cardsLayer}>
            {/* CARD 1 (Bottom) — sharp corners, full size at start */}
            <motion.div
              className={styles.cardContainer}
              style={{
                zIndex: 1,
                scale: card1Scale,
                filter: card1Blur,
                borderRadius: "0px",
                transformOrigin: "center top",
                backgroundImage: `url(${packageCardsData[0].bgImage})`,
              }}
            >
              <motion.div
                className={styles.cardDimOverlay}
                style={{ opacity: card1DimOpacity }}
              />
              <div className={styles.cardTextUnit}>
                <h3 className={styles.cardMainTitle}>
                  {packageCardsData[0].title}
                </h3>
                <p className={styles.cardOverview}>
                  {packageCardsData[0].overview}
                </p>
              </div>
              <CardPointerTicker />
              <a href="#" className={styles.viewPackageBtn}>
                View Package
              </a>
            </motion.div>

            {/* CARD 2 (Middle) — enters rounded, becomes sharp at full width */}
            <motion.div
              className={styles.cardContainer}
              style={{
                zIndex: 2,
                y: card2Y,
                scale: card2Scale,
                filter: card2Blur,
                borderRadius: card2Radius,
                transformOrigin: "center top",
                backgroundImage: `url(${packageCardsData[1].bgImage})`,
              }}
            >
              <motion.div
                className={styles.cardDimOverlay}
                style={{ opacity: card2DimOpacity }}
              />
              <div className={styles.cardTextUnit}>
                <h3 className={styles.cardMainTitle}>
                  {packageCardsData[1].title}
                </h3>
                <p className={styles.cardOverview}>
                  {packageCardsData[1].overview}
                </p>
              </div>
              <CardPointerTicker />
              <a href="#" className={styles.viewPackageBtn}>
                View Package
              </a>
            </motion.div>

            {/* CARD 3 (Top) — enters rounded, becomes sharp at full width, then shrinks 20% as user scrolls past */}
            <motion.div
              className={styles.cardContainer}
              style={{
                zIndex: 3,
                y: card3Y,
                scale: card3Scale,
                filter: card3Blur,
                borderRadius: card3Radius,
                transformOrigin: "center top",
                backgroundImage: `url(${packageCardsData[2].bgImage})`,
              }}
            >
              <motion.div
                className={styles.cardDimOverlay}
                style={{ opacity: card3DimOpacity }}
              />
              <div className={styles.cardTextUnit}>
                <h3 className={styles.cardMainTitle}>
                  {packageCardsData[2].title}
                </h3>
                <p className={styles.cardOverview}>
                  {packageCardsData[2].overview}
                </p>
              </div>
              <CardPointerTicker paused={isCard3Shrinking} />
              <a href="#" className={styles.viewPackageBtn}>
                View Package
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
