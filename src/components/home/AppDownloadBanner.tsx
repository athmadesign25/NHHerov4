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

  // Hand rotation and float on scroll to simulate lifting the phone
  const handRotation = useTransform(enterProgress, [0, 1], [30, 0]);
  const handY = useTransform(enterProgress, [0, 1], [60, 0]);

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
      <div ref={trackRef} className={styles.stackTrack} style={{ height: "200vh" }}>
        <div className={styles.stickyViewport} style={{ position: "sticky", top: 0, height: "100vh" }}>

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

          <motion.div
            style={{
              position: "relative",
              rotate: handRotation,
              y: handY,
              pointerEvents: "none",
              marginTop: "-30px",
              marginBottom: "-45px"
            }}
          >
            <Image
              src="/Mobile phone in hand.png"
              width={1019}
              height={1130}
              alt="Mobile phone in hand"
              style={{ width: "700px", height: "auto", objectFit: "contain", clipPath: "inset(0 0 45px 0)" }}
            />
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
