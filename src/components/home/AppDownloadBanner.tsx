"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Video, Calendar, FileText, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import AppDownloadNeatBackground from "./AppDownloadNeatBackground";
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
    popupWidth: 257,
    popupHeight: 348,
  },
  {
    id: 2,
    title: "Book appointments in 60 seconds",
    icon: Calendar,
    img: "/NHCare Screens/Book Appointment.png",
    popupImg: "/NHCare Screens/Book Appointment Popup.png",
    popupWidth: 259,
    popupHeight: 246,
  },
  {
    id: 3,
    title: "Access your health records anytime",
    icon: FileText,
    img: "/NHCare Screens/Health Records.png",
    popupImg: "/NHCare Screens/Health Records Popup.png",
    popupWidth: 257,
    popupHeight: 210,
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    icon: Activity,
    img: "/NHCare Screens/Vital Tracking.png",
    popupImg: "/NHCare Screens/Vital Tracking Popup.png",
    popupWidth: 326,
    popupHeight: 258,
  },
];

const TRUST_STACK = [
  { icon: "/trust-heart-icon.svg", label: "India's Most Trusted", subtext: "Hospital App" },
  { icon: "/downloads-count-icon.svg", label: "2.2M+", subtext: "Downloads" },
  { icon: "/rating-star-icon.svg", label: "4.8", subtext: "Rating" },
];

const BASE_WIDTH = 310;
const BASE_HEIGHT = 512; // natural aspect (726:1200) at BASE_WIDTH
const BASE_VISIBLE_HEIGHT = 464; // crops the bottom edge off so the phone appears to sink below frame

// Sequential blur+grow-in reveal timing for the entrance copy — quick,
// snappy gaps that still keep a clear eyebrow -> title -> image order
// (image's delay is tuned to land just after title's own word-reveal
// finishes, not before it).
const REVEAL = {
  eyebrow: 0.1,
  title: 0.5,
  image: 0.5,
};

// How much bigger the phone starts before settling into its bottom-anchored
// resting size; interpolated continuously against scroll progress. Scaling
// from a bottom transform-origin already makes the top edge grow upward and
// then descend as it shrinks back down — that alone reads as "moves down
// and shrinks," with no separate y-offset needed (one was tried and pushed
// the enlarged phone up far enough to overlap the title above it).
const PHONE_APPEAR_SCALE = 1.22;

// Once the whole word-reveal for "Always With You." has visually finished
// (title's own inView delay + its per-word stagger + duration), fade in the
// permanent gradient overlay across the full phrase.
const SHIMMER_POP_DELAY = REVEAL.title + 0.6;

const EASE = [0.16, 1, 0.3, 1] as const;

function RevealWords({
  text,
  startDelay,
  reverse = false,
  wordClassName,
}: {
  text: string;
  startDelay: number;
  reverse?: boolean;
  wordClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // A single useInView on the parent (proven pattern already used by
  // SplitText.tsx elsewhere in this codebase) drives all the words — putting
  // whileInView directly on each tiny word span was unreliable, they never
  // triggered.
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(" ");
  return (
    <span ref={ref}>
      {words.map((word, i) => {
        const order = reverse ? words.length - 1 - i : i;
        const wordDelay = startDelay + order * 0.06;
        return (
          <React.Fragment key={i}>
            {/* The trailing space between words must live OUTSIDE the
                overflow:hidden clipped span — a browser's shrink-to-fit
                width calculation trims trailing whitespace at the end of
                inline-block content, so a space placed inside here gets
                clipped away by overflow:hidden instead of rendering as a
                visible gap. */}
            <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
              <motion.span
                className={wordClassName}
                style={{ display: "inline-block" }}
                initial={{ y: "110%", opacity: 0, filter: "blur(6px)" }}
                animate={inView ? { y: "0%", opacity: 1, filter: "blur(0px)" } : {}}
                transition={{
                  y: { duration: 0.45, delay: wordDelay, ease: EASE },
                  opacity: { duration: 0.45, delay: wordDelay, ease: EASE },
                  filter: { duration: 0.45, delay: wordDelay, ease: EASE },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </span>
  );
}

export default function AppDownloadBanner({ darkOpacity }: { darkOpacity?: MotionValue<number> }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasMatured, setHasMatured] = useState(false);
  const [isDesktopFX, setIsDesktopFX] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll-driven entrance: the phone travels from an enlarged "appear" spot
  // down to its final bottom-anchored size/position over the pre-pin scroll
  // distance, finishing exactly as the sticky viewport engages — same
  // proven pattern as HealthPackages' own entrance.
  const { scrollYProgress: enterProgress } = useScroll({
    target: trackRef,
    offset: ["start 92%", "start 0px"],
  });

  // Holds at the enlarged appear-size while the section is still mostly
  // scrolling into view, then shrinks smoothly to the resting size over the
  // remaining scroll distance — rather than shrinking continuously from the
  // very first pixel of scroll.
  const phoneScale = useTransform(enterProgress, [0, 0.4, 1], [PHONE_APPEAR_SCALE, PHONE_APPEAR_SCALE, 1]);

  // Below desktop, the scroll-jacked pin/travel is disabled (per project
  // rule against scroll-driven animation on mobile) — everything just
  // renders in its settled, fully-matured state statically.
  useEffect(() => {
    const check = () => setIsDesktopFX(window.innerWidth > 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isDesktopFX) setHasMatured(true);
  }, [isDesktopFX]);

  // Reversible: scrolling back up un-matures the section again.
  useMotionValueEvent(enterProgress, "change", (latest) => {
    if (!isDesktopFX) return;
    setHasMatured(latest >= 0.94);
  });

  // Carousel always resets to the first feature while not matured, so the
  // pre-mature glimpse consistently shows the first feature.
  useEffect(() => {
    if (!hasMatured) setActiveIndex(0);
  }, [hasMatured]);

  // Auto-play carousel every 4 seconds, only once matured and not hovered.
  useEffect(() => {
    if (isHovered || !hasMatured) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, hasMatured, activeIndex]);

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
      <div ref={trackRef} className={styles.stackTrack} style={{ height: isDesktopFX ? "200vh" : "auto" }}>
        <div className={styles.stickyViewport} style={{ position: isDesktopFX ? "sticky" : "relative", height: isDesktopFX ? "100vh" : "auto" }}>
          <motion.div
            aria-hidden
            className={styles.neatBackdrop}
            style={{ opacity: darkOpacity ?? 1 }}
          >
            <AppDownloadNeatBackground />
          </motion.div>

          <div className={styles.contentStack}>
          {/* Centered copy: eyebrow, then title a beat later, sequentially */}
          <div className={styles.topTextBlock}>
            <motion.div
              className={styles.eyebrow}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: REVEAL.eyebrow, ease: EASE }}
            >
              <span>DOWNLOAD NH CARE APP</span>
              <span className={styles.eyebrowLine} />
            </motion.div>

            <h2 className={styles.title}>
              <RevealWords text="Your Health," startDelay={REVEAL.title} reverse />{" "}
              <span className={styles.titleHighlightWrap}>
                <RevealWords
                  text="Always With You."
                  startDelay={REVEAL.title}
                  reverse
                  wordClassName={styles.titleHighlightBase}
                />
                {/* One continuous gradient spanning the whole phrase at once
                    (rather than per-word, which would repeat light-to-dark
                    on each word instead of reading as one sweep across the
                    full phrase) — a plain duplicate copy overlaid on top,
                    invisible until the word reveal beneath it has settled,
                    then fading in permanently. */}
                <motion.span
                  aria-hidden
                  className={styles.titleShimmerOverlay}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: SHIMMER_POP_DELAY, ease: "easeOut" }}
                >
                  Always With You.
                </motion.span>
              </span>
            </h2>
          </div>

          {/* Bottom-anchored block: feature pill, phone carousel, QR + stores.
              Pushed to the bottom of the sticky viewport via margin-top:auto. */}
          <div className={styles.bottomBlock}>
            <motion.div
              className={styles.pillWrapper}
              animate={{
                opacity: hasMatured ? 1 : 0,
                filter: hasMatured ? "blur(0px)" : "blur(8px)",
                y: hasMatured ? 0 : 8,
              }}
              style={{ pointerEvents: hasMatured ? "auto" : "none" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <button
                onClick={handlePrev}
                className={styles.pillArrowBtn}
                aria-label="Previous feature"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>

              <div className={styles.pillInner}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={styles.featurePill}
                  >
                    <div className={styles.pillIconBg}>
                      <IconComponent className={styles.pillIcon} size={16} />
                    </div>
                    <span className={styles.pillText}>{activeFeature.title}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={handleNext}
                className={styles.pillArrowBtn}
                aria-label="Next feature"
                type="button"
              >
                <ChevronRight size={16} />
              </button>
            </motion.div>

            <div className={styles.bottomRow}>
              {/* Plain (non-motion) positioning wrapper: framer-motion writes
                  its own inline `transform` for the `y` entrance animation
                  below, which would otherwise silently overwrite this CSS
                  translateY(-50%) centering if they lived on the same
                  element — same issue .popupFrame worked around earlier. */}
              <div className={styles.trustStackPosition}>
              <motion.div
                className={styles.trustStack}
                animate={{
                  opacity: hasMatured ? 1 : 0,
                  filter: hasMatured ? "blur(0px)" : "blur(8px)",
                  y: hasMatured ? 0 : 10,
                }}
                transition={{ duration: 0.5, delay: hasMatured ? 0.3 : 0, ease: EASE }}
              >
                {TRUST_STACK.map((item, i) => (
                  <div key={item.subtext} className={styles.trustUnit}>
                    <div className={styles.trustIconSlot}>
                      <img
                        src={item.icon}
                        alt=""
                        className={[
                          styles.trustIcon,
                          i !== 1 ? styles.trustIconLarge : "",
                          i === 0 ? styles.trustIconBright : "",
                        ].join(" ")}
                      />
                    </div>
                    <div className={styles.trustTextBlock}>
                      <span className={i === 0 ? styles.trustLabel : styles.trustMainText}>{item.label}</span>
                      <span className={styles.trustSubtext}>{item.subtext}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
              </div>

              <div
                className={styles.phoneCarouselUnit}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Scroll-linked stage: travels from its enlarged "appear"
                    spot down to resting size/position, bottom-anchored so it
                    reads as sliding down while shrinking. The bottom edge of
                    the phone itself is never revealed — .phoneFrame below
                    keeps a shorter visible height than the image's own
                    height at every scale, and .stickyViewport clips the rest. */}
                <motion.div
                  className={styles.phoneStageWrap}
                  style={{
                    scale: isDesktopFX ? phoneScale : 1,
                    transformOrigin: "bottom center",
                  }}
                  initial={{ opacity: 0, filter: "blur(14px)" }}
                  whileInView={{ opacity: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: REVEAL.image, ease: EASE }}
                >
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

                      {/* Popup: center touches the base screen's right edge, ~32px
                          below its top, appears as an overlay shortly after the base screen mounts */}
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
                          transition: { duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
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
                </motion.div>
              </div>

              <div className={styles.storesColPosition}>
              <motion.div
                className={styles.storesCol}
                animate={{
                  opacity: hasMatured ? 1 : 0,
                  filter: hasMatured ? "blur(0px)" : "blur(8px)",
                  y: hasMatured ? 0 : 10,
                }}
                transition={{ duration: 0.5, delay: hasMatured ? 0.3 : 0, ease: EASE }}
              >
                <div className={`${styles.storeContainer} ${styles.qrContainer}`}>
                  <img src="/qr.svg" alt="QR Code" width={64} height={64} style={{ borderRadius: 6 }} />
                  <span className={styles.qrLabel}>Scan to install</span>
                </div>
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
              </motion.div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
