"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Video, Calendar, FileText, Activity, PersonStanding } from "lucide-react";
import Image from "next/image";
import AppDownloadNeatBackground from "./AppDownloadNeatBackground";
import styles from "./AppDownloadBanner.module.css";

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
    id: DIGITAL_TWIN_ID,
    title: "See your whole body's health at a glance",
    icon: PersonStanding,
    img: "/digital-twin-fullphone.png",
  },
  {
    id: 1,
    title: "Video consultations from home",
    icon: Video,
    img: "/NHCare Screens/Video Consultation.png",
  },
  {
    id: 2,
    title: "Book appointments in 60 seconds",
    icon: Calendar,
    img: "/NHCare Screens/Book Appointment.png",
  },
  {
    id: 3,
    title: "Access your health records anytime",
    icon: FileText,
    img: "/NHCare Screens/Health Records.png",
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    icon: Activity,
    img: "/NHCare Screens/Vital Tracking.png",
  },
];

// Digital twin is now just a plain feature image like the other four (a
// complete phone mockup at the same 726x1200 native size as the rest —
// see BASE_WIDTH/BASE_HEIGHT below), not a separate raw-content graphic
// composited onto phone-base.png at runtime — so it needs no special
// sizing/positioning constants of its own anymore.
const MATURITY_THRESHOLD = 0.94;

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
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState<Phase>("pre");
  const phaseRef = useRef<Phase>("pre");
  const [isDesktopFX, setIsDesktopFX] = useState(false);

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
  const phoneScale = useTransform(enterProgress, [0, 0.4, 1], [PHONE_APPEAR_SCALE, PHONE_APPEAR_SCALE, 1]);

  // No fade/blur on entry anymore — the phone is fully opaque and sharp
  // from the moment it appears; the "entrance" reads entirely through
  // motion instead: it starts big, sitting just under the text unit (see
  // entryOffsetY below), and travels down into its normal carousel slot as
  // phoneScale shrinks it back to size — same [0, 0.4, 1] shape as
  // phoneScale so both finish their travel together.
  const phoneEntryY = useTransform(enterProgress, [0, 0.4, 1], [entryOffsetY, entryOffsetY, 0]);

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

  // Auto-play carousel every 4 seconds, only once matured and not hovered.
  useEffect(() => {
    if (isHovered || phase !== "matured") return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, phase, activeIndex]);

  const activeFeature = features[activeIndex];
  const IconComponent = activeFeature.icon;

  return (
    <section className={styles.section} id="app-download-banner">
      {/* 300vh (not 200vh): the extra pinned scroll distance this buys is
          what gives the section a genuine "stay here" dwell once it's
          fully matured, BEFORE the footer starts rising over it (see
          FooterRevealWrapper, which anchors that reveal to the document's
          true end, not to this track's own height) — at 200vh the reveal
          window actually started before the pin had even finished
          engaging, so the footer appeared to slap on top immediately with
          no pause at all. */}
      <div ref={trackRef} className={styles.stackTrack} style={{ height: isDesktopFX ? "300vh" : "auto" }}>
        <div className={styles.stickyViewport} style={{ position: isDesktopFX ? "sticky" : "relative", height: isDesktopFX ? "100vh" : "auto" }}>
          <div aria-hidden className={styles.neatBackdrop}>
            <AppDownloadNeatBackground />
          </div>

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
              <motion.span
                className={styles.titleLine}
                initial={{ opacity: 0, y: -24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: REVEAL.title, ease: EASE }}
              >
                Your Health,
              </motion.span>
              <br />
              <motion.span
                className={styles.titleLine}
                initial={{ opacity: 0, y: -24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: REVEAL.title + 0.12, ease: EASE }}
              >
                <span className={styles.titleHighlightWrap}>
                  <span className={styles.titleHighlightBase}>Always With You.</span>
                  {/* One continuous gradient spanning the whole phrase at once
                      (rather than per-word, which would repeat light-to-dark
                      on each word instead of reading as one sweep across the
                      full phrase) — a plain duplicate copy overlaid on top,
                      invisible until the line's own slide-down has settled,
                      then fading in permanently. */}
                  <motion.span
                    aria-hidden
                    className={styles.titleShimmerOverlay}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: SHIMMER_POP_DELAY, ease: "easeOut" }}
                  >
                    Always With You.
                  </motion.span>
                </span>
              </motion.span>
            </h2>
          </div>

          {/* Bottom-anchored block: feature pill, phone carousel, QR + stores.
              Pushed to the bottom of the sticky viewport via margin-top:auto. */}
          <div className={styles.bottomBlock}>
            <motion.div
              className={styles.pillWrapper}
              animate={{
                opacity: hasMatured && phoneSettled ? 1 : 0,
                filter: hasMatured && phoneSettled ? "blur(0px)" : "blur(8px)",
                y: hasMatured && phoneSettled ? 0 : 8,
              }}
              style={{ pointerEvents: hasMatured && phoneSettled ? "auto" : "none" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
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
            </motion.div>

            <div className={styles.bottomRow}>
              {/* Plain (non-motion) positioning wrapper: framer-motion writes
                  its own inline `transform` for the `y` entrance animation
                  below, which would otherwise silently overwrite this CSS
                  translateY(-50%) centering if they lived on the same
                  element. */}
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
                  <div key={item.subtext} className={`${styles.trustUnit} ${styles.storeContainer}`}>
                    <div className={styles.trustIconSlot}>
                      <img
                        src={item.icon}
                        alt=""
                        className={[
                          styles.trustIcon,
                          i !== 1 ? styles.trustIconLarge : "",
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
                  ref={phoneStageWrapRef}
                  className={styles.phoneStageWrap}
                  style={{
                    // phoneScale/phoneEntryY are the "pre"-only entrance
                    // grow-in + travel — frozen at their resting values once
                    // matured/exiting so they can't fight the exit
                    // wrapper's own continuous shrink further down (which
                    // was making the phone look like it was regrowing huge
                    // again on scroll-up).
                    scale: isDesktopFX ? (phase === "pre" ? phoneScale : 1) : 1,
                    y: isDesktopFX ? (phase === "pre" ? phoneEntryY : 0) : 0,
                    transformOrigin: "bottom center",
                  }}
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
                      {/* Wraps the phone frame so exiting recedes it as one piece —
                          continuously scroll-linked (see exitOpacity/exitBlur/exitScale
                          above), so it works the same regardless of which feature the
                          autoplaying carousel landed on, and reverses smoothly if you
                          scroll back down without fully leaving. "pre" leaves this neutral
                          since the entrance handles its own reveal instead. */}
                      <motion.div
                        style={
                          phase === "pre"
                            ? { opacity: 1, filter: "blur(0px)", scale: 1, transformOrigin: "bottom center" }
                            : { opacity: exitOpacity, filter: exitBlur, scale: exitScale, transformOrigin: "bottom center" }
                        }
                      >
                        {/* Base screen: bottom edge cropped off so it appears to sink below the
                            frame. Every feature (digital twin included) is now just its own
                            complete phone-mockup image — fades in as part of phoneStageWrap's
                            own scroll-driven reveal above, no separate timing of its own needed. */}
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
                  <img src="/qr.svg" alt="QR Code" width={64} height={64} className={styles.qrImg} style={{ borderRadius: 6 }} />
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
