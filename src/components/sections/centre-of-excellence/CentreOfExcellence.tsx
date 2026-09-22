"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import styles from "./CentreOfExcellence.module.css";
import { COE_SPECIALITIES as SPECIALITIES } from "@/data/specialities";

import { ArrowRight } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";


const RollingNumber = ({ value, isHovered }: { value: string; isHovered: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-10px" });
  const hasPlus = value.includes("+");
  const hasK = value.includes("K");
  const hasL = value.includes("L");

  let numValue = parseFloat(value.replace(/,/g, "").replace(/\+/g, "").replace(/K/g, "").replace(/L/g, ""));
  if (hasK) numValue *= 1000;
  if (hasL) numValue *= 100000;

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isHovered || isInView) {
      const controls = animate(0, numValue, {
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (val) => {
          const num = Math.round(val);
          if (num >= 100000) {
            setDisplayValue((num / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 }) + "L");
          } else if (num >= 1000) {
            setDisplayValue((num / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 }) + "K");
          } else {
            setDisplayValue(num.toLocaleString("en-IN"));
          }
        },
      });
      return () => controls.stop();
    } else {
      setDisplayValue("0");
    }
  }, [isHovered, isInView, numValue]);

  return <span ref={ref}>{displayValue}{hasPlus ? "+" : ""}</span>;
};

function SpecialityCardItem({ spec, screenMode = "desktop" }: { spec: typeof SPECIALITIES[0], screenMode?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Require the card to intersect the middle 30% of the viewport to play
  const isInView = useInView(ref, { 
    amount: "some", 
    margin: "-35% 0px -35% 0px" 
  });

  useEffect(() => {
    if (screenMode === "mobile" || screenMode === "tablet") {
      if (isInView) {
        setIsHovered(true);
        videoRef.current?.play().catch(() => {});
      } else {
        setIsHovered(false);
        videoRef.current?.pause();
      }
    }
  }, [isInView, screenMode]);

  const handleMouseEnter = () => {
    if (screenMode === "desktop") {
      setIsHovered(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => { });
      }
    }
  };

  const handleMouseLeave = () => {
    if (screenMode === "desktop") {
      setIsHovered(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  return (
    <a
      ref={ref}
      aria-label={spec.name}
      className={styles.specialityCard}
      href={spec.href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        alt={spec.name}
        loading="lazy"
        src={spec.img}
        className={styles.cardImage}
      />
      {spec.video && (
        <video
          ref={videoRef}
          src={spec.video}
          className={`${styles.cardVideo} ${isHovered ? styles.cardVideoActive : ""}`}
          muted
          loop
          playsInline
        />
      )}
      <div className={styles.cardOverlay} />

      <div className={styles.cardTextWrap}>
        {spec.stats && (
          <div className={styles.cardStats}>
            <div className={styles.metricValue}>{spec.stats.value}</div>
            <div className={styles.metricLabel}>{spec.stats.label}</div>
          </div>
        )}
        <div className={styles.specialityNameRow}>
          <span className={styles.specialityName}>{spec.name}</span>
          <ArrowRight className={styles.nameArrow} size={16} strokeWidth={2.5} />
        </div>
        <span className={styles.cardAction}>
          Explore
          <span className={styles.actionUnderline} aria-hidden />
        </span>
      </div>
    </a>
  );
}

// ─── 4 Columns Data Distribution for True Podium Stagger ───
const COLUMN_SPECIALITIES = [
  // Column 0: Cardiology, Nephrology, General Surgery
  [SPECIALITIES[0], SPECIALITIES[4], SPECIALITIES[8]],
  // Column 1: Cancer Care, Gastroenterology, Urology
  [SPECIALITIES[1], SPECIALITIES[5], SPECIALITIES[9]],
  // Column 2: Neurology, Pulmonology, Endocrinology
  [SPECIALITIES[2], SPECIALITIES[6], SPECIALITIES[10]],
  // Column 3: Orthopaedics, Paediatrics, Rheumatology
  [SPECIALITIES[3], SPECIALITIES[7], SPECIALITIES[11]],
];

function PodiumColumnTrack({
  colIndex,
  items,
  scrollYProgress,
  screenMode,
  dimOpacity,
  dimBlur,
}: {
  colIndex: number;
  items: typeof SPECIALITIES;
  scrollYProgress: import("framer-motion").MotionValue<number>;
  screenMode: "desktop" | "tablet" | "mobile";
  dimOpacity: import("framer-motion").MotionValue<number>;
  dimBlur: import("framer-motion").MotionValue<string>;
}) {
  const isDesktop = screenMode === "desktop";
  const isTablet = screenMode === "tablet";
  const yMultiplier = isDesktop ? 1.0 : 0.45;

  // Asymmetric continuous parallax rate per column (Odd columns glide faster, Even columns lag gracefully)
  const yOffsets = [
    [40 * yMultiplier, -120 * yMultiplier],
    [-30 * yMultiplier, 80 * yMultiplier],
    [35 * yMultiplier, -90 * yMultiplier],
    [-40 * yMultiplier, 105 * yMultiplier],
  ][colIndex] || [0, 0];

  const y = useTransform(scrollYProgress, [0, 1], yOffsets);

  // Entrance reveal only (0 -> 0.15); combined multiplicatively with the
  // shared `dimOpacity` below (a subtle, partial dim — not a fade to
  // invisible — that only starts once the CTA has reached screen-center,
  // see dimRange in the parent). The grid itself never fully disappears.
  const entranceOpacity = useTransform(scrollYProgress, [0.0, 0.15], [0.35, 1.0]);
  const opacity = useTransform(
    [entranceOpacity, dimOpacity],
    ([entrance, dim]: number[]) => entrance * dim
  );

  return (
    <motion.div
      className={`${styles.columnTrack} ${styles[`col${colIndex}`]}`}
      style={{ y, opacity, filter: dimBlur }}
    >
      {items.map((spec, idx) => (
        <SpecialityCardItem key={idx} spec={spec} screenMode={screenMode} />
      ))}
    </motion.div>
  );
}

export default function CentreOfExcellence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridSectionRef = useRef<HTMLDivElement>(null);
  const columnsContainerRef = useRef<HTMLDivElement>(null);
  const viewAllBtnRef = useRef<HTMLAnchorElement>(null);

  const [screenMode, setScreenMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const updateScreen = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenMode("mobile");
      else if (w < 1024) setScreenMode("tablet");
      else setScreenMode("desktop");
    };
    updateScreen();
    window.addEventListener("resize", updateScreen, { passive: true });
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  // 1. Continuous Scroll-Driven 4-Column Track Parallax Progression
  const { scrollYProgress: trackProgress } = useScroll({
    target: gridSectionRef,
    offset: ["start 90%", "end 10%"],
  });

  // 2. Seamless bg handoff to Patient Stories:
  // Fades the background to dark *just before* the button scrolls into view.
  const { scrollYProgress: handoffProgress } = useScroll({
    target: gridSectionRef,
    offset: ["end 130%", "end 100%"],
  });
  const handoffOpacity = useTransform(handoffProgress, [0, 1], [0, 1]);

  // 3. Grid Blur & Dim:
  // Starts dimming only after the button has scrolled high up the viewport.
  const { scrollYProgress: dimProgress } = useScroll({
    target: gridSectionRef,
    offset: ["end 70%", "end 30%"],
  });
  const dimOpacity = useTransform(dimProgress, [0, 1], [1, 0.6]);
  const dimBlurPx = useTransform(dimProgress, [0, 1], [0, 5]);
  const dimBlur = useTransform(dimBlurPx, (v) => `blur(${v}px)`);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* 1. Title Unit — plain scroll-reveal entrance (whileInView, once),
          same pattern every other homepage section uses. It's normal
          in-flow content now, not a pinned/sticky track, so the grid
          below just follows it directly instead of being held off behind
          a scroll-through — no "keep scrolling" hint needed either. */}
      <section className={styles.titleSection} id="centre-of-excellence">
        <div className={styles.centerContent}>
          <div className={styles.header}>
            <motion.div
              style={{ color: "#000000", marginBottom: "28px" }}
              className="section-eyebrow"
              initial={{ opacity: 0, y: 10, filter: "blur(14px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              CENTRES OF EXCELLENCE
            </motion.div>

            <h2 className={styles.sectionTitle}>
              <TextSweepEffect words={["40+ Specialties, World-class care"]} className={styles.titleGroup} sweepMs={1200} />
            </h2>

            <p className={styles.sectionSubtitle}>
              <motion.span
                className={styles.subtitleLine}
                initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                Integrated expertise across tertiary and quaternary care,
              </motion.span>
              <motion.span
                className={styles.subtitleLine}
                initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                delivered through one trusted network.
              </motion.span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Editorial 4-Column Staggered Tracks (True Podium.global Architecture) */}
      <div ref={gridSectionRef} className={styles.gridSection} data-nav-theme="dark">
        <div className={styles.gridAnimatedWrapper}>
          <div ref={columnsContainerRef} className={styles.columnsContainer}>
            {(screenMode === "desktop" ? COLUMN_SPECIALITIES : COLUMN_SPECIALITIES.slice(0, 2)).map((items, colIdx) => (
              <PodiumColumnTrack
                key={colIdx}
                colIndex={colIdx}
                items={items}
                scrollYProgress={trackProgress}
                screenMode={screenMode}
                dimOpacity={dimOpacity}
                dimBlur={dimBlur}
              />
            ))}
          </div>

          {/* Seamless Dark Grid Extension with View All Specialties CTA */}
          <div className={styles.gridBottomStrip}>
            <motion.a
              href="/specialities"
              ref={viewAllBtnRef}
              className={styles.viewAllBtn}
              style={{ opacity: dimOpacity, filter: dimBlur }}
            >
              View All Specialties
            </motion.a>
          </div>

          {/* Reversible bg-only handoff to Patient Stories' solid backdrop */}
          <motion.div
            className={styles.handoffPlate}
            style={{ opacity: handoffOpacity }}
            aria-hidden
          />
        </div>
      </div>
    </div>

  );
}
