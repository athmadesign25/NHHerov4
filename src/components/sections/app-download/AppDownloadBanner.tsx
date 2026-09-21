"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Video, Calendar, FileText, Activity, PersonStanding, Microscope } from "lucide-react";
import Image from "next/image";
import AppDownloadNeatBackground from "./AppDownloadNeatBackground";
import styles from "./AppDownloadBanner.module.css";
import TextSweepEffect from "@/components/ui/TextSweepEffect";

type Feature = {
  id: number;
  title: string;
  icon: typeof Video;
  img: string;
};

// Digital Twin is the entry-animated feature (id 0, always first — see the
// digital-twin overlay logic below).
const DIGITAL_TWIN_ID = 0;

const features: Feature[] = [
  {
    id: 0,
    title: "View detailed test reports",
    icon: Microscope,
    img: "/App Screens/Test details.png?v=3",
  },
  {
    id: 1,
    title: "Your health dashboard at a glance",
    icon: PersonStanding,
    img: "/App Screens/Home Page.png?v=3",
  },
  {
    id: 2,
    title: "Access your health records anytime",
    icon: FileText,
    img: "/App Screens/Health records.png?v=3",
  },
  {
    id: 3,
    title: "Video consultations from home",
    icon: Video,
    img: "/App Screens/Video Consultation.png?v=3",
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    icon: Activity,
    img: "/App Screens/Vitals tracking.png?v=3",
  },
];

const POP_OVER_CARDS = [
  { img: "/App Screens/Pop over cards/Body analysis.png", text: "Get Digital twin health analysis" },
  { img: "/App Screens/Pop over cards/Dr Card.png", text: "Book appointments in 60 seconds" },
  { img: "/App Screens/Pop over cards/Trend Card.png", text: "Access your health records anytime" },
  { img: "/App Screens/Pop over cards/Video block.png", text: "Video consultations from home" },
  { img: "/App Screens/Pop over cards/Recommend.png", text: "Track vitals and wellness reports" },
];

// Digital twin is now just a plain feature image like the other four (a
// complete phone mockup at the same 726x1200 native size as the rest —
// see BASE_WIDTH/BASE_HEIGHT below), not a separate raw-content graphic
// composited onto phone-base.png at runtime — so it needs no special
// sizing/positioning constants of its own anymore.
const MATURITY_THRESHOLD = 0.85;

const TRUST_STACK = [
  { icon: "/trust-heart-icon-new.png", label: "India's Most Trusted", subtext: "Hospital App" },
  { icon: "/downloads-count-icon-new.png", label: "2.2M+", subtext: "Downloads" },
  { icon: "/rating-star-icon-new.png", label: "4.8", subtext: "Rating" },
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

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const screenVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "100%" : "-100%",
    };
  },
  center: {
    zIndex: 1,
    x: 0,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
    };
  }
};

const EASE = [0.16, 1, 0.3, 1] as const;

// Three phases instead of a plain matured/not-matured boolean, so scrolling
// back UP out of a matured state reads differently from scrolling DOWN into
// it the first time:
//  - "pre": first-time entry, continuous scroll-linked digital-twin assembly.
//  - "matured": fully settled, normal carousel (autoplay, etc).
//  - "exiting": was matured, now scrolling up — the current feature simply
//    blurs out (a plain state transition, not the assembly reversed), until
//    either scrolling back down re-matures it, or scrolling all the way back
//    up resets to "pre" so the next entry replays the assembly from scratch.
type Phase = "pre" | "matured" | "exiting";

export default function AppDownloadBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState<Phase>("pre");
  const phaseRef = useRef<Phase>("pre");
  const [isDesktopFX, setIsDesktopFX] = useState(false);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = features.length - 1;
      if (next >= features.length) next = 0;
      return next;
    });
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const topTextBlockRef = useRef<HTMLDivElement>(null);
  const phoneStageWrapRef = useRef<HTMLDivElement>(null);
  const [entryOffsetY, setEntryOffsetY] = useState(0);
  const [phoneSettled, setPhoneSettled] = useState(false);

  const hasMatured = phase === "matured";

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
  const phoneScale = useTransform(enterProgress, [0, 0.4, 0.85], [PHONE_APPEAR_SCALE, PHONE_APPEAR_SCALE, 1]);

  // No fade/blur on entry anymore — the phone is fully opaque and sharp
  // from the moment it appears; the "entrance" reads entirely through
  // motion instead: it starts big, sitting just under the text unit (see
  // entryOffsetY below), and travels down into its normal carousel slot as
  // phoneScale shrinks it back to size — same [0, 0.4, 0.85] shape as
  // phoneScale so both finish their travel together.
  const phoneEntryY = useTransform(enterProgress, [0, 0.4, 0.85], [entryOffsetY, entryOffsetY, 0]);

  // Hand rotation and float on scroll to simulate lifting the phone
  const handRotation = useTransform(enterProgress, [0, 0.85], [30, 0]);
  const handY = useTransform(enterProgress, [0, 0.85], [60, 0]);
  const bgOpacity = useTransform(enterProgress, [0.75, 0.85], [0, 1]);

  // Measures the gap between the text unit's bottom and the phone stage's
  // own natural (already-enlarged, bottom-anchored) resting position, so
  // the "big" entry state can be pulled up to sit exactly 24px below the
  // text instead of wherever bottom-anchoring alone would leave it.
  useEffect(() => {
    const measure = () => {
      const textEl = topTextBlockRef.current;
      const phoneEl = phoneStageWrapRef.current;
      if (!textEl || !phoneEl) return;
      const textRect = textEl.getBoundingClientRect();
      const phoneRect = phoneEl.getBoundingClientRect();
      const desiredTop = textRect.bottom + 24;
      setEntryOffsetY(desiredTop - phoneRect.top);
    };
    // Double rAF: waits for the phoneScale motion value's own initial style
    // write (applied outside React's render) to land before measuring, so
    // phoneRect reflects the already-enlarged state, not an unscaled one.
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Exit: continuous and scroll-linked (not a discrete state snap), so it
  // works identically no matter which feature the autoplaying carousel
  // happened to land on. Reads as the whole phone unit gently receding —
  // shrinking, blurring and fading — in exact proportion to how far back up
  // you scroll, then reversing smoothly if you scroll back down without
  // fully leaving. Only applied once actually matured/exiting; "pre" leaves
  // this neutral since the entrance above already handles that reveal.
  const EXIT_PROGRESS_END = 0.6;
  const exitAmount = useTransform(enterProgress, [MATURITY_THRESHOLD, EXIT_PROGRESS_END], [0, 1]);
  const exitOpacity = useTransform(exitAmount, [0, 1], [1, 0]);
  const exitBlur = useTransform(exitAmount, [0, 1], ["blur(0px)", "blur(30px)"]);
  const exitScale = useTransform(exitAmount, [0, 1], [1, 0.9]);

  // Below desktop, the scroll-jacked pin/travel is disabled (per project
  // rule against scroll-driven animation on mobile) — everything just
  // renders in its settled, fully-matured state statically. Checks
  // window.innerWidth directly (rather than branching on the isDesktopFX
  // state in a separate effect keyed off it) because that second effect
  // would otherwise run once on mount with isDesktopFX's stale initial
  // value (false) before this effect's own setIsDesktopFX(true) had
  // propagated — forcing phase to "matured" on every desktop load too,
  // which is what was letting autoplay jump the carousel off the
  // digital-twin entry before it had ever been seen.
  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth > 1024;
      setIsDesktopFX(desktop);
      if (!desktop) {
        phaseRef.current = "matured";
        setPhase("matured");
        setPhoneSettled(true);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Phase transitions driven by scroll direction, not just position — see
  // the Phase type above for what each one means.
  useMotionValueEvent(enterProgress, "change", (latest) => {
    if (!isDesktopFX) return;
    // Feature pill waits for the phone to have fully finished its own
    // travel (phoneScale/phoneEntryY both reach their end value at
    // progress=1) before it's allowed to appear — a separate, stricter
    // gate than MATURITY_THRESHOLD, which fires slightly earlier.
    setPhoneSettled(latest >= 0.98);
    const current = phaseRef.current;
    let next: Phase = current;
    if (current === "pre") {
      if (latest >= MATURITY_THRESHOLD) next = "matured";
    } else if (current === "matured") {
      if (latest < MATURITY_THRESHOLD) next = "exiting";
    } else if (current === "exiting") {
      if (latest >= MATURITY_THRESHOLD) next = "matured";
      else if (latest <= 0.05) next = "pre";
    }
    if (next !== current) {
      phaseRef.current = next;
      setPhase(next);
    }
  });

  // Carousel resets to the first (digital-twin) feature only on a fresh
  // entry — not while merely "exiting", which should keep showing whatever
  // was active and blur it out in place.
  useEffect(() => {
    if (phase === "pre") setActiveIndex(0);
  }, [phase]);

  // Auto-play carousel every 3 seconds, only once matured and not hovered.
  useEffect(() => {
    if (isHovered || phase !== "matured") return;

    const timer = setInterval(() => {
      paginate(1);
    }, 3000);

    return () => clearInterval(timer);
  }, [isHovered, phase, activeIndex]);

  const activeFeature = features[activeIndex];
  const IconComponent = activeFeature.icon;

  return (
    <section className={styles.section} id="app-download-banner">
      {/* 120vh: gives the section a brief "stay here" dwell (a single scroll) 
          before the footer starts smoothly rising over it. */}
      <div ref={trackRef} className={styles.stackTrack} style={{ height: "120vh" }}>
        <div className={styles.stickyViewport} style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: isDesktopFX ? bgOpacity : 1,
              zIndex: 0,
              maskImage: "linear-gradient(to bottom, transparent 0%, transparent 50%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 50%, black 100%)",
            }}
          >
            <Image
              src="/House Interior.jpg"
              alt="House Interior"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </motion.div>

          <div className={styles.contentStack}>
          {/* Centered copy: eyebrow, then title a beat later, sequentially */}
          <div className={styles.topTextBlock} ref={topTextBlockRef}>
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

            {/* Short slide-down entry: each line starts a short distance
                above its resting spot and drops down while fading in, one
                beat after the other — replaces the old per-word reveal for
                this title specifically. Shimmer + red highlight on line 2
                are unchanged. */}
            <h2 id="app-download-title-unit" className={styles.title}>
              <span className={styles.titleLine}>
                <TextSweepEffect words={["Your Health,"]} sweepMs={1500} />
              </span>
              <br />
              <motion.span className={styles.titleLine}>
                <span className={styles.titleHighlightWrap}>
                  <TextSweepEffect
                    words={["Always With You."]}
                    className={styles.titleHighlightBase}
                    sweepMs={1500}
                    holdMs={3500}
                  />
                </span>
              </motion.span>
            </h2>
          </div>

          <div className={styles.bottomRow}>
            {/* Pop-over Card matching active screen on the left */}
            <div className={`${styles.trustStackPosition} ${styles.desktopOnly}`} style={{ marginTop: "-171px", marginLeft: "100px" }}>
              <motion.div 
                className={styles.trustStack}
                initial={{ opacity: 0, filter: "blur(4px)", y: 30 }}
                animate={phase === "matured" ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(4px)", y: 30 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ width: "240px", position: "relative", height: "180px" }}
              >
                <AnimatePresence mode="popLayout">
                  {POP_OVER_CARDS[activeIndex] && (
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.55)",
                        backdropFilter: "blur(20px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                        borderRadius: "20px",
                        padding: "16px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                        border: "1px solid rgba(255,255,255,0.6)"
                      }}
                    >
                      <div style={{ textAlign: "center", color: "#334155", fontSize: "14px", fontWeight: 500, lineHeight: "1.4" }}>
                        {POP_OVER_CARDS[activeIndex].text}
                      </div>
                      <Image
                        src={POP_OVER_CARDS[activeIndex].img}
                        alt={POP_OVER_CARDS[activeIndex].text}
                        width={240}
                        height={100}
                        style={{ width: "100%", height: "auto", display: "block", marginTop: "12px" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connecting Line from Phone to Card */}
              <AnimatePresence mode="popLayout">
                {phase === "matured" && (
                  <motion.svg
                    key={`line-${activeIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      left: "240px", 
                      top: "40%", 
                      width: "160px", 
                      height: "80px",
                      overflow: "visible",
                      pointerEvents: "none",
                      zIndex: 5
                    }}
                    viewBox="0 0 160 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="lineGrad" x1="160" y1="80" x2="10" y2="10" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="15%" stopColor="#FF6B6B" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>

                    <motion.path 
                      d="M 160 80 C 100 80, 50 10, 10 10" 
                      stroke="url(#lineGrad)" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className={styles.phoneWrapper}
              style={{
                position: "relative",
                rotate: handRotation,
                y: handY,
                pointerEvents: "none",
              }}
            >
              <Image
                src="/Mobile phone in hand.png"
                width={1019}
                height={1130}
                alt="Mobile phone in hand"
                className={styles.handImage}
              />
              
              {/* Auto-playing Screens sandwiched in the middle */}
              <div style={{
                position: "absolute",
                top: "calc(8% + 1px)",      
                left: "calc(48.5% + 1.5px)",
                width: "27.5%",
                height: "58.5%",
                zIndex: 10,
                overflow: "hidden",
                borderRadius: "82px",
                transform: "rotate(0deg) scale(1.3)",
                pointerEvents: "auto", 
              }}>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={activeFeature.id}
                    src={activeFeature.img}
                    alt={activeFeature.title}
                    custom={direction}
                    variants={screenVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.6 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);
                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute" }}
                  />
                </AnimatePresence>
              </div>

              {/* The overlay is positioned absolutely on top of the base image, allowing us to sandwich screens between them (e.g. zIndex: 10) */}
              <Image
                src="/Mobile phone in hand Over lay.png"
                width={1019}
                height={1130}
                alt="Mobile phone in hand Overlay"
                className={styles.handOverlayImage}
              />
            </motion.div>

            {/* Mobile Feature Caption */}
            <div className={`${styles.mobileCaption} ${styles.mobileOnly}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {POP_OVER_CARDS[activeIndex] && POP_OVER_CARDS[activeIndex].text}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Store links on the right */}
            <div className={styles.storesColPosition}>
              <motion.div 
                className={styles.storesCol}
                style={{ pointerEvents: "auto", zIndex: 30 }}
                initial={{ opacity: 0, filter: "blur(4px)", y: 30 }}
                animate={phase === "matured" ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(4px)", y: 30 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className={`${styles.storeContainer} ${styles.qrContainer} ${styles.desktopOnly}`}>
                  <Image src="/qr.svg" alt="QR Code" width={64} height={64} style={{ borderRadius: "6px" }} className={styles.qrImg} />
                  <span className={styles.qrLabel}>Scan to install</span>
                </div>
                <a href="#" className={styles.storeBadge} tabIndex={0}>
                  <Image width={140} height={38} alt="Download on the App Store" src="/App store.svg" />
                </a>
                <a href="#" className={styles.storeBadge} tabIndex={0}>
                  <Image width={140} height={38} alt="Get it on Google Play" src="/Google play.svg" />
                </a>
              </motion.div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
