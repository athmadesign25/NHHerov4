"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { ChevronRight } from "lucide-react";
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
  const yMultiplier = isDesktop ? 1.0 : isTablet ? 0.45 : 0;

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
        <SpecialityCardItem key={idx} spec={spec} />
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

  // 2. Seamless bg handoff to Patient Stories: fades in a solid #031224 plate
  // (rendered behind the grid/CTA via negative z-index, so only empty
  // background space is affected) starting the instant "View All Specialties"
  // enters from the bottom of the viewport, and fully resolving to solid
  // before Patient Stories' own background can surface underneath it.
  // Measured in raw scroll pixels (not viewport-relative %) because the
  // buffer between the button and the section boundary is a fixed CSS
  // distance — a percentage-based range would over/undershoot depending on
  // viewport height. Fully reversible on scroll-up.
  const [handoffRange, setHandoffRange] = useState<[number, number]>([0, 1]);

  // Subtle dim (partial opacity + light blur, never a full fade-out) for
  // the grid cards and the CTA button as the background goes solid —
  // gated to only start once Patient Stories' own title unit has scrolled
  // a third of the way up the viewport (measured from the bottom), not
  // from the moment the button first appears. Ends in step with the
  // handoff plate reaching fully solid (handoffRange's own end), so
  // everything settles into its "dark mode" look together.
  const [dimRange, setDimRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const SAFETY_PX = 48; // margin so the plate is solid before the boundary hits
    const MIN_RANGE_PX = 80; // guards against a degenerate/inverted range
    const MIN_DIM_RANGE_PX = 100; // dim needs at least this much scroll to feel eased, not snapped

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

      // Gate the dim on Patient Stories' own title unit reaching a third
      // of the way up the viewport (from the bottom) — i.e. its top edge
      // crossing the line at 2/3 of the viewport height. The dim only ever
      // starts at that exact point; the end is whichever comes later
      // between the background finishing its handoff (fadeEnd) or a
      // minimum scroll distance so the transition never snaps instantly.
      const patientTitleUnit = document.getElementById("patient-stories-title-unit");
      const titleUnitTop = patientTitleUnit
        ? patientTitleUnit.getBoundingClientRect().top + window.scrollY
        : btnTop - vh / 2; // fallback if the element isn't mounted yet
      const dimStart = titleUnitTop - (vh - vh / 3);
      const dimEnd = Math.max(fadeEnd, dimStart + MIN_DIM_RANGE_PX);
      setDimRange([dimStart, dimEnd]);
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

  // Subtle, partial dim — opacity only eases down to 0.6 and blur only to
  // 5px, never fully hiding the grid/CTA (see dimRange above for timing).
  const dimOpacity = useTransform(scrollY, dimRange, [1, 0.6]);
  const dimBlurPx = useTransform(scrollY, dimRange, [0, 5]);
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
              {/* Two groups slide in from above as their own units — first
                  "40+ Specialities.", then "World-Class Care." Each one is
                  red while it's still sliding/blurring in, then settles to
                  the resting dark shade once that motion finishes (color
                  transitions on a delay so it settles after the slide/blur
                  completes). */}
              <motion.span
                className={styles.titleGroup}
                initial={{ opacity: 0, y: -28, filter: "blur(10px)", color: "#ED1C24" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", color: "#000000" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  opacity: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  filter: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  color: { duration: 0.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                40+ Specialities.
              </motion.span>{" "}
              <motion.span
                className={styles.titleGroup}
                initial={{ opacity: 0, y: -28, filter: "blur(10px)", color: "#ED1C24" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", color: "#000000" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                  filter: { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                  color: { duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                World-Class Care.
              </motion.span>
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
            {COLUMN_SPECIALITIES.map((items, colIdx) => (
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
              <ChevronRight size={16} />
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
