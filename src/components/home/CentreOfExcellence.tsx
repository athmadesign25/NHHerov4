"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import styles from "./CentreOfExcellence.module.css";

const SPECIALITIES = [
  {
    name: "Cardiology & Cardiac Surgery",
    href: "/specialities/cardiology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stats: { value: "5K+", label: "Cardiac Surgeries Performed" },
  },
  {
    name: "Cancer Care",
    href: "/specialities/oncology",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stats: { value: "10K+", label: "Oncology Patients Treated" },
  },
  {
    name: "Neurology & Neurosurgery",
    href: "/specialities/neurology",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stats: { value: "3K+", label: "Neuro Surgeries Performed" },
  },
  {
    name: "Orthopaedics",
    href: "/specialities/orthopaedics",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stats: { value: "8K+", label: "Joint Replacements" },
  },
  {
    name: "Nephrology & Transplant",
    href: "/specialities/nephrology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stats: { value: "2K+", label: "Kidney Transplants" },
  },
  {
    name: "Gastroenterology",
    href: "/specialities/gastroenterology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stats: { value: "15K+", label: "Endoscopies Performed" },
  },
  {
    name: "Pulmonology",
    href: "/specialities/pulmonology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stats: { value: "4.5K+", label: "Respiratory Cases" },
  },
  {
    name: "Paediatrics",
    href: "/specialities/paediatrics",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stats: { value: "12K+", label: "Children Treated" },
  },
  {
    name: "General Surgery",
    href: "/specialities/general-surgery",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stats: { value: "8.5K+", label: "Surgeries Performed" },
  },
  {
    name: "Urology",
    href: "/specialities/urology",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stats: { value: "6K+", label: "Urological Procedures" },
  },
  {
    name: "Endocrinology",
    href: "/specialities/endocrinology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stats: { value: "5K+", label: "Endocrine Cases" },
  },
  {
    name: "Rheumatology",
    href: "/specialities/rheumatology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stats: { value: "3.5K+", label: "Rheumatology Patients" },
  },
];

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

function SpecialityCardItem({ spec }: { spec: typeof SPECIALITIES[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <a
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
        <span className={styles.specialityName}>{spec.name}</span>
        <span className={styles.cardAction}>
          Explore <ChevronRight size={14} className={styles.actionArrow} />
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
}: {
  colIndex: number;
  items: typeof SPECIALITIES;
  scrollYProgress: import("framer-motion").MotionValue<number>;
  screenMode: "desktop" | "tablet" | "mobile";
}) {
  const isDesktop = screenMode === "desktop";
  const isTablet = screenMode === "tablet";
  const yMultiplier = isDesktop ? 1.0 : isTablet ? 0.45 : 0;

  // Asymmetric continuous parallax rate per column (Odd columns glide faster, Even columns lag gracefully)
  const yOffsets = [
    [40 * yMultiplier, -120 * yMultiplier],
    [-30 * yMultiplier, 80 * yMultiplier],
    [35 * yMultiplier, -90 * yMultiplier],
    [-40 * yMultiplier, 105 * yMultiplier],
  ][colIndex] || [0, 0];

  const y = useTransform(scrollYProgress, [0, 1], yOffsets);

  // Entrance reveal (0 -> 0.15) and photographic exit fade (0.68 -> 0.98) matching Podium
  const opacity = useTransform(
    scrollYProgress,
    [0.0, 0.15, 0.68, 0.98],
    [0.35, 1.0, 1.0, 0.18]
  );

  return (
    <motion.div
      className={`${styles.columnTrack} ${styles[`col${colIndex}`]}`}
      style={{ y, opacity }}
    >
      {items.map((spec, idx) => (
        <SpecialityCardItem key={idx} spec={spec} />
      ))}
    </motion.div>
  );
}

export default function CentreOfExcellence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleTrackRef = useRef<HTMLDivElement>(null);
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

  // 1. Sticky Header Track Scroll Sequence
  const { scrollYProgress: titleScrollProgress } = useScroll({
    target: titleTrackRef,
    offset: ["start 80%", "end end"],
  });

  const eyebrowOpacity = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [1, 1, 1, 0]);
  const eyebrowY = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [10, 0, 0, -16]);
  const eyebrowBlur = useTransform(titleScrollProgress, [0.15, 0.38, 0.88, 0.98], ["blur(14px)", "blur(0px)", "blur(0px)", "blur(12px)"]);

  const titleOpacity = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [1, 1, 1, 0]);
  const titleY = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [12, 0, 0, -16]);
  const titleBlur = useTransform(titleScrollProgress, [0.28, 0.52, 0.88, 0.98], ["blur(16px)", "blur(0px)", "blur(0px)", "blur(12px)"]);

  const subtitleOpacity = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [1, 1, 1, 0]);
  const subtitleY = useTransform(titleScrollProgress, [0.00, 0.04, 0.88, 0.98], [12, 0, 0, -16]);
  const subtitleBlur = useTransform(titleScrollProgress, [0.42, 0.68, 0.88, 0.98], ["blur(16px)", "blur(0px)", "blur(0px)", "blur(12px)"]);

  const strokeProgressHeight = useTransform(titleScrollProgress, [0.04, 0.75], ["0%", "100%"]);

  const indicatorOpacity = useTransform(titleScrollProgress, [0.00, 0.08, 0.85, 0.96], [0, 1, 1, 0]);
  const indicatorY = useTransform(titleScrollProgress, [0.00, 0.08, 0.85, 0.96], [12, 0, 0, -12]);

  // 2. Continuous Scroll-Driven 4-Column Track Parallax Progression
  const { scrollYProgress: trackProgress } = useScroll({
    target: gridSectionRef,
    offset: ["start 90%", "end 10%"],
  });

  // 3. Seamless bg handoff to Patient Stories: fades in a solid #031224 plate
  // (rendered behind the grid/CTA via negative z-index, so only empty
  // background space is affected) starting the instant "View All Specialties"
  // enters from the bottom of the viewport, and fully resolving to solid
  // before Patient Stories' own background can surface underneath it.
  // Measured in raw scroll pixels (not viewport-relative %) because the
  // buffer between the button and the section boundary is a fixed CSS
  // distance — a percentage-based range would over/undershoot depending on
  // viewport height. Fully reversible on scroll-up.
  const [handoffRange, setHandoffRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const SAFETY_PX = 48; // margin so the plate is solid before the boundary hits
    const MIN_RANGE_PX = 80; // guards against a degenerate/inverted range

    const measure = () => {
      const btn = viewAllBtnRef.current;
      const section = gridSectionRef.current;
      if (!btn || !section) return;

      const vh = window.innerHeight;
      const btnTop = btn.getBoundingClientRect().top + window.scrollY;
      const sectionBottom = section.getBoundingClientRect().bottom + window.scrollY;

      const fadeStart = btnTop - vh; // button's top edge touches viewport bottom
      const boundary = sectionBottom - vh; // section's bottom touches viewport bottom (Patient Stories about to surface)
      const fadeEnd = Math.max(fadeStart + MIN_RANGE_PX, boundary - SAFETY_PX);

      setHandoffRange([fadeStart, fadeEnd]);
    };

    measure();
    window.addEventListener("resize", measure);
    const settleTimer = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(settleTimer);
    };
  }, []);

  const { scrollY } = useScroll();
  const handoffOpacity = useTransform(scrollY, handoffRange, [0, 1]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* 1. Pinned Sticky Header Scroll Track */}
      <div ref={titleTrackRef} className={styles.scrollTrack}>
        <section className={styles.stickySection} id="centre-of-excellence">
          <div className={styles.centerContent}>
            <div className={styles.header}>
              <motion.div
                style={{
                  opacity: eyebrowOpacity,
                  y: eyebrowY,
                  filter: eyebrowBlur,
                  color: "#000000",
                  marginBottom: "28px",
                }}
                className="section-eyebrow"
              >
                CENTRES OF EXCELLENCE
              </motion.div>

              <motion.h2
                style={{
                  opacity: titleOpacity,
                  y: titleY,
                  filter: titleBlur,
                }}
                className={styles.sectionTitle}
              >
                {["40+", "Specialities.", "World-Class", "Care."].map((word, index) => (
                  <React.Fragment key={index}>
                    <motion.span
                      className={styles.flashWord}
                      initial={{ color: "#000000" }}
                      whileInView={{
                        color: ["#000000", "#ED1C24", "#ED1C24", "#000000"],
                      }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{
                        duration: 1.1,
                        ease: [0.25, 1, 0.3, 1],
                        delay: 0.3 + index * 0.28,
                      }}
                    >
                      {word}
                    </motion.span>
                    {index < 3 ? " " : ""}
                  </React.Fragment>
                ))}
              </motion.h2>

              <motion.p
                style={{
                  opacity: subtitleOpacity,
                  y: subtitleY,
                  filter: subtitleBlur,
                }}
                className={styles.sectionSubtitle}
              >
                Integrated expertise across tertiary and quaternary care,
                <br />
                delivered through one trusted network.
              </motion.p>
            </div>
          </div>

          {/* Bottom Spaced Keep Scrolling Indicator Unit with Double Blinking Top Arrow */}
          <motion.div
            className={styles.scrollIndicatorUnit}
            style={{
              opacity: indicatorOpacity,
              y: indicatorY,
              x: "-50%",
            }}
          >
            <div className={styles.doubleBlinkingArrows}>
              <ChevronDown size={18} className={styles.arrowTop} />
              <ChevronDown size={18} className={styles.arrowBottom} />
            </div>
            <span className={styles.scrollUpText}>Keep Scrolling</span>
          </motion.div>
        </section>
      </div>

      {/* 2. Editorial 4-Column Staggered Tracks (True Podium.global Architecture) */}
      <div ref={gridSectionRef} className={styles.gridSection}>
        <div className={styles.gridAnimatedWrapper}>
          <div ref={columnsContainerRef} className={styles.columnsContainer}>
            {COLUMN_SPECIALITIES.map((items, colIdx) => (
              <PodiumColumnTrack
                key={colIdx}
                colIndex={colIdx}
                items={items}
                scrollYProgress={trackProgress}
                screenMode={screenMode}
              />
            ))}
          </div>

          {/* Seamless Dark Grid Extension with View All Specialties CTA */}
          <div className={styles.gridBottomStrip}>
            <a href="/specialities" ref={viewAllBtnRef} className={styles.viewAllBtn}>
              View All Specialties
              <ChevronRight size={16} />
            </a>
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
