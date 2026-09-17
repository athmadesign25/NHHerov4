"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  animate,
  useInView,
} from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import styles from "./Hero.module.css";
import { NHSearchExperience } from "@/components/search/NHSearchExperience";

const STAT_GROUPS = [
  [
    { value: 5000, suffix: "+", label: "Robotic Surgeries\nPerformed" },
    { value: 550000, suffix: "+", label: "Cardiac Consults\nAnnually" },
    { value: 33000, suffix: "+", label: "Image Guided\nProcedures" },
    { value: 8000, suffix: "+", label: "Solid Organ\nTransplants" },
  ],
  [
    { value: 80000, suffix: "+", label: "Chemotherapy Sessions\nAnnually" },
    { value: 15000, suffix: "+", label: "Joint Replacements\nPerformed" },
    { value: 2000, suffix: "+", label: "Bone Marrow\nTransplants" },
    { value: 120000, suffix: "+", label: "Dialysis Sessions\nAnnually" },
  ],
];

function MetricValueReveal({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  const { unit, to } = (() => {
    if (value >= 100000) return { unit: "L", to: value / 100000 };
    if (value >= 1000) return { unit: "K", to: value / 1000 };
    return { unit: "", to: value };
  })();

  const count = useMotionValue(1);
  const rounded = useTransform(count, (latest) => {
    const num = unit ? latest : Math.round(latest);
    const formattedNum = unit
      ? num.toLocaleString("en-IN", { maximumFractionDigits: 1 })
      : num.toLocaleString("en-IN");
    return formattedNum + unit + suffix;
  });

  useEffect(() => {
    if (!isInView) return;
    const animation = animate(count, to, { duration: 1, ease: [0.16, 1, 0.3, 1] });
    return animation.stop;
  }, [isInView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [currentStatGroup, setCurrentStatGroup] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroAnchorRef = useRef<HTMLDivElement>(null);

  // Rotate metric stat group periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatGroup((prev) => (prev + 1) % STAT_GROUPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Listen to external openPulseAI events if triggered elsewhere
  useEffect(() => {
    const handleOpenPulse = () => {
      setIsPulseActive(true);
    };
    window.addEventListener("openPulseAI", handleOpenPulse);
    return () => window.removeEventListener("openPulseAI", handleOpenPulse);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 1,
    restDelta: 0.001,
  });

  // Scale down and round border radius on scroll
  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.85]);
  const heroRadius = useTransform(smoothProgress, [0, 1], ["0px", "16px"]);

  // Blurs out across exit travel as next section approaches
  const { scrollYProgress: heroExitProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const heroBlur = useTransform(heroExitProgress, [0, 1], ["blur(0px)", "blur(20px)"]);

  // Measure initial hero search position accurately
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({
    top: 520,
    left: 200,
    width: 840,
    height: 136,
  });

  // Update anchor rectangle on mount & resize
  useEffect(() => {
    const updateRect = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const initialWidth = Math.min(840, winW - 48);

      if (heroAnchorRef.current && window.scrollY < 20) {
        const rect = heroAnchorRef.current.getBoundingClientRect();
        setAnchorRect({
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height || 136),
        });
      } else {
        setAnchorRect({
          top: Math.round(winH * 0.68 - 28),
          left: Math.round((winW - initialWidth) / 2),
          width: initialWidth,
          height: 136,
        });
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  // Video playback speed management on active search / pulse AI
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;

    if (videoRef.current) {
      if (isOpen || isPulseActive) {
        let rate = videoRef.current.playbackRate;
        intervalId = setInterval(() => {
          if (videoRef.current && (isOpen || isPulseActive)) {
            rate -= 0.05;
            if (rate <= 0.1) {
              videoRef.current.pause();
              videoRef.current.playbackRate = 1.0;
              clearInterval(intervalId);
            } else {
              videoRef.current.playbackRate = rate;
            }
          } else {
            clearInterval(intervalId);
          }
        }, 30);
      } else {
        clearInterval(intervalId);
        videoRef.current.playbackRate = 1.0;
        videoRef.current.play().catch((err) => {
          console.log("Playback prevented:", err);
        });
      }
    }
    return () => clearInterval(intervalId);
  }, [isOpen, isPulseActive]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "130vh",
        position: "relative",
        zIndex: isPulseActive ? 9999 : 1,
        background: "transparent",
      }}
    >
      <motion.section
        className={styles.hero}
        id="hero-section-search-first"
        data-nav-theme="dark"
        style={{
          scale: heroScale,
          borderRadius: heroRadius,
          filter: heroBlur,
        }}
      >
        <video
          ref={videoRef}
          src="/videos/Hero-Video-New.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.bgVideo}
        />
        <div className={`${styles.videoOverlay} ${isOpen && !isPulseActive ? styles.videoOverlayActive : ""}`} />

        {/* Side Metrics Carousel */}
        <div className={styles.metricsSideWrap}>
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={
              isOpen
                ? { opacity: 0, y: 20, filter: "blur(8px)", pointerEvents: "none" }
                : { opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" }
            }
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={styles.metricsRow}
          >
            {STAT_GROUPS[currentStatGroup].map((stat, i) => (
              <div className={styles.metricItem} key={i}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div className={styles.metricValue}>
                      <MetricValueReveal value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className={styles.metricLabel}>
                      {stat.label.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx !== stat.label.split("\n").length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Center Title & Anchor Spacer */}
        <div className={styles.centerWrap}>
          <div className={`${styles.heroStack} ${isOpen ? styles.heroStackActive : ""}`}>
            <div className={`${styles.titleUnit} ${isOpen ? styles.titleHidden : ""}`}>
              <SplitText text="Trusted Care, Every Day" tag="h1" className={styles.headline} delay={0.08} />
              <motion.p
                className={styles.subHeadline}
                initial={{ opacity: 0, y: -16, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
              >
                Compassion Backed by Expertise
              </motion.p>
            </div>

            {/* Layout spacer reserving the search composer's position in the hero stack */}
            <div
              ref={heroAnchorRef}
              style={{
                width: "min(840px, calc(100vw - 48px))",
                height: 136,
                pointerEvents: "none",
                opacity: 0,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </motion.section>

      {/* Continuously morphing Search Experience: starts at hero, smoothly scales down to docked pill on scroll */}
      <NHSearchExperience
        onOpenChange={setIsOpen}
        scrollProgress={smoothProgress}
        anchorRect={anchorRect}
        onOpenPulseAI={() => setIsPulseActive(true)}
      />
    </div>
  );
}
