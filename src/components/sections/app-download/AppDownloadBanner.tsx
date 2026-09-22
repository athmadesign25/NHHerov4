"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import AppDownloadNeatBackground from "./AppDownloadNeatBackground";
import styles from "./AppDownloadBanner.module.css";
import TextSweepEffect from "@/components/ui/TextSweepEffect";

type Feature = {
  id: number;
  title: string;
  img: string;
};

// Digital Twin is the entry-animated feature (id 0, always first — see the
// digital-twin overlay logic below).
const DIGITAL_TWIN_ID = 0;

const features: Feature[] = [
  {
    id: 0,
    title: "View detailed test reports",
    img: "/App Screens/Test details.png?v=3",
  },
  {
    id: 1,
    title: "Your health dashboard at a glance",
    img: "/App Screens/Home Page.png?v=3",
  },
  {
    id: 2,
    title: "Access your health records anytime",
    img: "/App Screens/Health records.png?v=3",
  },
  {
    id: 3,
    title: "Video consultations from home",
    img: "/App Screens/Video Consultation.png?v=3",
  },
  {
    id: 4,
    title: "Track vitals and wellness reports",
    img: "/App Screens/Vitals tracking.png?v=3",
  },
];

// Digital twin is now just a plain feature image like the other four (a
// complete phone mockup at the same 726x1200 native size as the rest —
// see BASE_WIDTH/BASE_HEIGHT below), not a separate raw-content graphic
// composited onto phone-base.png at runtime — so it needs no special
// sizing/positioning constants of its own anymore.
const MATURITY_THRESHOLD = 0.85;

// Design-provided paths (single stroke, 24x24) rather than lucide
// equivalents — none of the three match closely enough.
function ValueIconTrust() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12.409 5.8239L9.586 8.5859C9.21106 8.96096 9.00043 9.46957 9.00043 9.9999C9.00043 10.5302 9.21106 11.0388 9.586 11.4139C9.96106 11.7888 10.4697 11.9995 11 11.9995C11.5303 11.9995 12.0389 11.7888 12.414 11.4139L14.124 9.7039C14.3478 9.48 14.6135 9.30239 14.906 9.18121C15.1985 9.06003 15.5119 8.99766 15.8285 8.99766C16.1451 8.99766 16.4585 9.06003 16.751 9.18121C17.0435 9.30239 17.3092 9.48 17.533 9.7039L19.414 11.5859C19.7889 11.961 19.9996 12.4696 19.9996 12.9999C19.9996 13.5302 19.7889 14.0388 19.414 14.4139C21 12.8279 22 11.4999 22 9.4999C22 8.3871 21.6624 7.30048 21.0319 6.38356C20.4013 5.46664 19.5075 4.76256 18.4684 4.3643C17.4293 3.96604 16.2938 3.89234 15.212 4.15294C14.1301 4.41354 13.1528 4.99618 12.409 5.8239ZM19.414 14.4139C19.2168 14.6112 18.9826 14.7676 18.7249 14.8744C18.4672 14.9812 18.191 15.0361 17.912 15.0361C17.633 15.0361 17.3568 14.9812 17.0991 14.8744C16.8414 14.7676 16.6072 14.6112 16.41 14.4139C16.6235 14.607 16.7956 14.8415 16.9157 15.1032C17.0358 15.3648 17.1015 15.6482 17.1087 15.936C17.116 16.2238 17.0646 16.5101 16.9578 16.7774C16.851 17.0448 16.6909 17.2876 16.4873 17.4912C16.2837 17.6948 16.0409 17.8549 15.7735 17.9617C15.5062 18.0685 15.2199 18.1199 14.9321 18.1126C14.6443 18.1054 14.3609 18.0397 14.0993 17.9196C13.8376 17.7995 13.6031 17.6274 13.41 17.4139C13.6074 17.6105 13.7641 17.8441 13.8712 18.1014C13.9782 18.3586 14.0335 18.6344 14.0339 18.9131C14.0342 19.1917 13.9797 19.4677 13.8733 19.7252C13.767 19.9827 13.6109 20.2167 13.414 20.4139C13.224 20.604 12.9976 20.7538 12.7484 20.8544C12.4991 20.9551 12.2322 21.0044 11.9635 20.9996C11.6947 20.9947 11.4297 20.9358 11.1843 20.8262C10.9389 20.7166 10.718 20.5587 10.535 20.3619L5 14.9999C3.5 13.4999 2 11.7999 2 9.4999C2.00022 8.38719 2.33794 7.30071 2.96856 6.38395C3.59917 5.46718 4.49303 4.76325 5.53208 4.36512C6.57112 3.96699 7.7065 3.89337 8.78826 4.154C9.87002 4.41463 10.8473 4.99724 11.591 5.8249C11.7022 5.92823 11.8484 5.98559 12.0002 5.9854C12.152 5.98522 12.2981 5.92751 12.409 5.8239" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ValueIconDownloads() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 17V3" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 11L12 17L18 11" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 21H5" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ValueIconRating() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11.5248 2.29489C11.5687 2.20635 11.6364 2.13183 11.7203 2.07972C11.8042 2.02761 11.9011 2 11.9998 2C12.0986 2 12.1955 2.02761 12.2794 2.07972C12.3633 2.13183 12.431 2.20635 12.4748 2.29489L14.7848 6.97389C14.937 7.28186 15.1617 7.5483 15.4395 7.75035C15.7173 7.95239 16.04 8.08401 16.3798 8.13389L21.5458 8.88989C21.6437 8.90408 21.7357 8.94537 21.8113 9.00909C21.887 9.07282 21.9433 9.15644 21.9739 9.2505C22.0045 9.34456 22.0081 9.4453 21.9844 9.54133C21.9607 9.63736 21.9107 9.72485 21.8398 9.79389L18.1038 13.4319C17.8575 13.672 17.6731 13.9684 17.5667 14.2955C17.4602 14.6227 17.4349 14.9708 17.4928 15.3099L18.3748 20.4499C18.3921 20.5477 18.3816 20.6485 18.3443 20.7406C18.3071 20.8327 18.2448 20.9125 18.1644 20.9709C18.084 21.0293 17.9888 21.0639 17.8897 21.0708C17.7906 21.0777 17.6915 21.0566 17.6038 21.0099L12.9858 18.5819C12.6816 18.4221 12.343 18.3386 11.9993 18.3386C11.6557 18.3386 11.3171 18.4221 11.0128 18.5819L6.39585 21.0099C6.30818 21.0563 6.20924 21.0772 6.1103 21.0701C6.01135 21.0631 5.91636 21.0285 5.83614 20.9701C5.75592 20.9118 5.69368 20.8321 5.6565 20.7401C5.61933 20.6482 5.6087 20.5476 5.62585 20.4499L6.50685 15.3109C6.56504 14.9716 6.53983 14.6233 6.43338 14.2959C6.32694 13.9686 6.14245 13.672 5.89585 13.4319L2.15985 9.79489C2.08844 9.72593 2.03784 9.63829 2.01381 9.54197C1.98978 9.44565 1.99328 9.34451 2.02393 9.25008C2.05457 9.15566 2.11111 9.07174 2.18712 9.00788C2.26313 8.94402 2.35555 8.90279 2.45385 8.88889L7.61885 8.13389C7.9591 8.08439 8.28224 7.95295 8.56043 7.75088C8.83863 7.54881 9.06355 7.28216 9.21585 6.97389L11.5248 2.29489Z" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const TRUST_STACK = [
  { Icon: ValueIconTrust, label: "India's Most Trusted", subtext: "Hospital App" },
  { Icon: ValueIconDownloads, label: "2.2M+", subtext: "Downloads" },
  { Icon: ValueIconRating, label: "4.8", subtext: "Rating" },
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

// How much further down the phone walks at the very end of its entrance,
// to clear room for the feature pill above it. The resting layout leaves
// ~59px between the title's baseline box and the phone's own visible top
// edge; the pill needs its own height plus a generous gap to the title and
// a tight one to the phone (~127px all in), so the phone gives up the
// difference. It is spent on
// the hand's already-cropped bottom edge, not on anything readable.
const PHONE_SETTLE_DROP = 68;

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
  // Rise finishes at 0.85 (mweb timing, from nahid_work) and the settle
  // drop picks up right after it — the two no longer overlap, so the phone
  // lifts, lands, then walks down into its resting spot.
  const handRotation = useTransform(enterProgress, [0, 0.85], [30, 0]);
  const handRiseY = useTransform(enterProgress, [0, 0.85], [60, 0]);

  // The last stretch of the entrance walks the phone down by
  // PHONE_SETTLE_DROP, which is what opens the band the feature pill then
  // fades into (see PHONE_SETTLE_DROP for how that number is arrived at).
  const phoneSettleDrop = useTransform(enterProgress, [0.86, 1], [0, PHONE_SETTLE_DROP]);
  const handY = useTransform([handRiseY, phoneSettleDrop], ([rise, drop]: number[]) => rise + drop);
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

  return (
    <section className={styles.section} id="app-download-banner">
      {/* 120vh + 700px: gives the section a real, clearly-perceptible "stay
          here" dwell (not just a sliver of one scroll tick) before the
          footer starts smoothly rising over it. The dwell is real, added
          scroll distance (not just visual) — position:sticky above holds
          this section's content frozen in the viewport for exactly
          (own height - 100vh) of scroll, so the extra 700px here directly
          becomes extra hold time, not extra travel for anything inside it
          (the phone's own entrance is keyed to this track's top position,
          not its height, so it's unaffected by this). */}
      <div ref={trackRef} className={styles.stackTrack} style={{ height: "calc(120vh + 700px)" }}>
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
              maskImage: "linear-gradient(to bottom, transparent 0%, transparent 30%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 30%, black 100%)",
            }}
          >
            <Image
              src="/img-bg-app-2.png"
              alt=""
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

            {/* Feature pill: held back through the whole entrance (the phone
                is still travelling through the space it occupies) and faded
                in only once the phone has finished settling into place. */}
            <motion.div
              className={`${styles.featurePill} ${styles.desktopOnly}`}
              initial={false}
              animate={
                phoneSettled && phase !== "pre"
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 8, filter: "blur(6px)" }
              }
              transition={{ duration: 0.45, ease: EASE }}
              aria-hidden={!phoneSettled}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeFeature.id}
                  className={styles.featurePillInner}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className={styles.featurePillText}>{activeFeature.title}</span>
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className={styles.bottomRow}>
            {/* Value stack on the left — replaces the per-screen pop-over
                cards, which competed with the feature pill above the phone
                for the same "what does the app do" job. */}
            <div className={`${styles.trustStackPosition} ${styles.desktopOnly}`} style={{ marginLeft: "100px" }}>
              <motion.div
                className={styles.trustStack}
                initial="hidden"
                animate={phase === "matured" ? "visible" : "hidden"}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
                }}
              >
                {(() => {
                  const [primary, ...rest] = TRUST_STACK;
                  const unitVariants: Variants = {
                    hidden: { opacity: 0, filter: "blur(10px)", y: 24 },
                    visible: {
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                    },
                  };
                  return (
                    <>
                      <motion.div
                        key={primary.label}
                        className={`${styles.valueUnit} ${styles.valueUnitFull}`}
                        variants={unitVariants}
                      >
                        <span className={styles.valueIconTile}>
                          <primary.Icon />
                        </span>
                        <span className={styles.valueText}>
                          <span className={styles.valueLabel}>{primary.label}</span>
                          <span className={styles.valueSubtext}>{primary.subtext}</span>
                        </span>
                      </motion.div>
                      <div className={styles.trustStackBottomRow}>
                        {rest.map(({ Icon, label, subtext }) => (
                          <motion.div
                            key={label}
                            className={`${styles.valueUnit} ${styles.valueUnitCompact}`}
                            variants={unitVariants}
                          >
                            <span className={styles.valueIconTile}>
                              <Icon />
                            </span>
                            <span className={styles.valueText}>
                              <span className={styles.valueLabel}>{label}</span>
                              <span className={styles.valueSubtext}>{subtext}</span>
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>

            {/* Middle Phone + Floating Hand Stage wrapped in a Mask Container */}
            <div className={styles.phoneMaskWrapper}>
            <motion.div
              className={styles.phoneWrapper}
              style={{
                position: "relative",
                rotate: handRotation,
                y: handY,
                // The phone itself sits ~86px right-of-center within the
                // hand image's own frame (the hand is centered, but the
                // phone it's holding isn't) — shift the whole unit left by
                // that same amount so the phone (not the image canvas)
                // lands centered on the page. Applied here, alongside the
                // existing rotate/y motion values, so it rides through
                // every scroll-driven entrance/exit transform unchanged.
                x: -86,
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
          </div>

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
                  {activeFeature.title}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Store links on the right */}
            <div className={styles.storesColPosition}>
              <motion.div 
                className={styles.storesCol}
                style={{ pointerEvents: "auto", zIndex: 30 }}
                initial="hidden"
                animate={phase === "matured" ? "visible" : "hidden"}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
                }}
              >
                <motion.div
                  className={`${styles.qrStack} ${styles.desktopOnly} ${styles.popoverGlass}`}
                  variants={{
                    hidden: { opacity: 0, filter: "blur(10px)", y: 24 },
                    visible: {
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <Image src="/app-download-QR.png" alt="QR code to download the NH Care app" width={140} height={140} className={styles.qrImg} />
                  <span className={styles.qrLabel}>Scan to install</span>
                </motion.div>
                <motion.div
                  className={styles.storeBadgeStack}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } },
                  }}
                >
                  <motion.a
                    href="#"
                    className={styles.storeBadge}
                    tabIndex={0}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(10px)", y: 24 },
                      visible: {
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                  >
                    <Image width={140} height={46} alt="Download on the App Store" src="/App store.svg" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className={styles.storeBadge}
                    tabIndex={0}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(10px)", y: 24 },
                      visible: {
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                  >
                    <Image width={140} height={46} alt="Get it on Google Play" src="/Google play.svg" />
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
