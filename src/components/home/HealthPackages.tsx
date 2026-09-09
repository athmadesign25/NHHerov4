"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import styles from "./HealthPackages.module.css";

const CLIPPING_PACKAGES = [
  {
    id: "heart",
    title: "Healthy Heart Package",
    image: "/Healthy-Heart-Package.png",
  },
  {
    id: "diabetes",
    title: "Diabetes Care Package",
    image: "/clipping-diabetes.png",
  },
  {
    id: "thyroid",
    title: "Thyroid Health Package",
    image: "/clipping-thyroid.png",
  },
  {
    id: "women",
    title: "Women's Health Package",
    image: "/Special-Screening-Packages.png",
  },
  {
    id: "renal",
    title: "Renal & Kidney Package",
    image: "/clipping-renal.png",
  },
  {
    id: "wellness",
    title: "General Wellness 360",
    image: "/Wellness-360-Health-Package.png",
  },
];

export default function HealthPackages() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [clipIndex, setClipIndex] = useState(0);

  // Auto-rotate health package clippings every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setClipIndex((prev) => (prev + 1) % CLIPPING_PACKAGES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const currentClip = CLIPPING_PACKAGES[clipIndex];

  // Gradual entrance grow-in (starts as soon as card enters bottom of screen)
  const { scrollYProgress: enterProgress } = useScroll({
    target: trackRef,
    offset: ["start 92%", "start 70px"],
  });

  // Exit shrink as user scrolls past
  const { scrollYProgress: exitProgress } = useScroll({
    target: trackRef,
    offset: ["end end", "end start"],
  });

  const enterScale = useTransform(enterProgress, [0, 1], [0.84, 1.0]);
  const enterRadius = useTransform(enterProgress, [0, 1], ["24px", "0px"]);

  const exitScale = useTransform(exitProgress, [0.0, 0.75], [1.0, 0.90]);
  const exitRadius = useTransform(exitProgress, [0.0, 0.75], ["0px", "20px"]);

  const combinedScale = useTransform([enterScale, exitScale], ([sIn, sOut]) => Number(sIn) * Number(sOut));
  const combinedRadius = useTransform([enterRadius, exitRadius], ([rIn, rOut]) => {
    return rOut !== "0px" ? rOut : rIn;
  });

  // Title & Subtitle scroll-linked blur-in transforms
  const titleBlurPx = useTransform(enterProgress, [0.05, 0.55], [12, 0]);
  const titleOpacity = useTransform(enterProgress, [0.05, 0.55], [0, 1]);
  const cardTitleBlur = useTransform(titleBlurPx, (v) => `blur(${v}px)`);

  const subtitleBlurPx = useTransform(enterProgress, [0.18, 0.68], [12, 0]);
  const subtitleOpacity = useTransform(enterProgress, [0.18, 0.68], [0, 1]);
  const cardSubtitleBlur = useTransform(subtitleBlurPx, (v) => `blur(${v}px)`);

  return (
    <div className={styles.sectionWrap} id="health-packages">
      {/* Header section (scrolls up naturally, no eyebrow) */}
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <SplitText
              text="Recommended Health Packages"
              tag="h2"
              className={styles.title}
            />
            <p className={`section-subtitle ${styles.subtitle}`}>
              Built by the doctors who treat what these tests find
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Scroll Runway: Card pins to top nav and expands end-to-end */}
      <div ref={trackRef} className={styles.stackTrack}>
        <div className={styles.stickyViewport}>
          <motion.div
            className={styles.mainCard}
            style={{
              scale: combinedScale,
              borderRadius: combinedRadius,
              transformOrigin: "center top",
              backgroundImage: "url('/health-packages-bg.png')",
            }}
          >
            {/* Subtle gradient vignette overlays for contrast */}
            <div className={styles.cardVignetteOverlay} />

            {/* Card Inner Content Container */}
            <div className={styles.cardInnerContent}>
              {/* Top Text Block */}
              <div className={styles.topTextBlock}>
                <motion.h3
                  className={styles.cardMainTitle}
                  style={{
                    filter: cardTitleBlur,
                    opacity: titleOpacity,
                  }}
                >
                  Wellness 360 Health Package
                </motion.h3>
                <motion.p
                  className={styles.cardSubtitle}
                  style={{
                    filter: cardSubtitleBlur,
                    opacity: subtitleOpacity,
                  }}
                >
                  Comprehensive health check covering major systems and key markers
                </motion.p>
              </div>

              {/* Bottom Unit: Clippings Card + Secondary Button vertically stacked with 24px gap */}
              <div className={styles.bottomUnitBlock}>
                <div className={styles.clippingWrapper}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={currentClip.id}
                      className={styles.clippingBox}
                      initial={{ opacity: 0, filter: "blur(14px)", scale: 0.88, y: 10 }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1.0, y: 0 }}
                      exit={{ opacity: 0, filter: "blur(14px)", scale: 0.88, y: -10 }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.img
                        src={currentClip.image}
                        alt={currentClip.title}
                        className={styles.clippingImage}
                        initial={{ scale: 1.18 }}
                        animate={{ scale: 1.0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                      <div className={styles.clippingDarkOverlay} />
                      <motion.h4
                        className={styles.clippingTitle}
                        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {currentClip.title}
                      </motion.h4>
                      {/* Entry Shimmer Sheen */}
                      <motion.div
                        className={styles.clippingShimmer}
                        initial={{ x: "-100%", opacity: 0.8 }}
                        animate={{ x: "180%", opacity: 0 }}
                        transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
                      />

                      {/* 3.2s Timer Progress Bar Line */}
                      <div className={styles.clipProgressTrack}>
                        <motion.div
                          key={currentClip.id}
                          className={styles.clipProgressFill}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 3.2, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Secondary Outline Button */}
                <a href="#all-packages" className={styles.secondaryButton}>
                  See all 24 packages
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
