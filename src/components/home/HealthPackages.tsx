"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Clock, Sparkles, ArrowUpRight, ArrowRight } from "lucide-react";
import styles from "./HealthPackages.module.css";
import TextSweepEffect from "@/components/ui/TextSweepEffect";

type PackageCard = {
  id: string;
  name: string;
  image: string;
  audience: string;
  inclusions: string[];
};

// Mock/demo data, keyed by city — packages (and their contents) genuinely
// vary per unit, so this is structured as a lookup rather than one fixed
// list. Only Bangalore is populated for now; any other/undetected city
// falls through to the empty state below.
const PACKAGES_BY_CITY: Record<string, PackageCard[]> = {
  Bangalore: [
    {
      id: "healthy-heart",
      name: "Healthy Heart Package",
      image: "/Healthy-Heart-Package.png",
      audience: "35–55 yrs · All genders",
      inclusions: ["ECG & 2D Echo", "Lipid Profile", "Treadmill Stress Test", "Cardiologist Consult"],
    },
    {
      id: "diabetes-care",
      name: "Diabetes Care Package",
      image: "/diabetes-package.jpg",
      audience: "30+ yrs · All genders",
      inclusions: ["Fasting & PP Glucose", "HbA1c", "Kidney Function", "Eye Screening"],
    },
    {
      id: "thyroid-health",
      name: "Thyroid Health Package",
      image: "/thyroid-package.jpg",
      audience: "18+ yrs · Women",
      inclusions: ["TSH, T3 & T4", "Antibody Panel", "Endocrinologist Review"],
    },
  ],
};

// No real geolocation wired up — mock detected city, same convention as
// the rest of the homepage's placeholder data.
const DETECTED_CITY = "Bangalore";

const USPS = [
  { icon: Layers, label: "All-in-one: tests, doctors, pharmacy" },
  { icon: Clock, label: "Reports on the same day" },
  { icon: Sparkles, label: "Hospital-grade AI diagnostics" },
];

const PHASE1_END = 0.32;
const PHASE2_START = 0.38;
const PHASE2_END = 0.92;
const RAIL_STAGGER = 0.09;
const RAIL_ITEM_DURATION = 0.2;
const MOBILE_BREAKPOINT = 900;

// Package card entrance: blur + grow into place, no directional slide.
const CARD_SCALE_FROM = 0.85;
const CARD_BLUR_FROM_PX = 14;

const EASE = [0.16, 1, 0.3, 1] as const;

// Left-column text reveal: a strict one-by-one sequence — eyebrow, then
// title (word by word), then subtitle (line by line), then each USP item —
// gated on the `textRevealed` boolean (see the scroll-trigger writeup
// above applyState) rather than a generic whileInView, since this section
// is sticky-pinned and a naive viewport check would fire the instant the
// pinned box exists at all. Each stage's start delay is derived from the
// one before it finishing (or nearly finishing), so the sequence reads as
// continuous rather than segmented, and everything shares the same
// slide-in-from-above + blur-in character as the rest of the homepage.
const TITLE_LINES = ["Health check-ups, built by", "the specialists who treat you"];
const WORD_STEP = 0.06;
const WORD_DURATION = 0.45;
const TITLE_WORD_COUNT = TITLE_LINES.join(" ").split(" ").length;

const TEXT_REVEAL_EYEBROW_DELAY = 0;
const TEXT_REVEAL_TITLE_DELAY = 0.3;
// Last title word's own extra delay (on top of TEXT_REVEAL_TITLE_DELAY),
// so the subtitle can be timed to start right as the title's word-by-word
// stagger is wrapping up rather than only after every word's transition
// has fully finished.
const TITLE_LAST_WORD_OFFSET = (TITLE_WORD_COUNT - 1) * WORD_STEP;
const TEXT_REVEAL_SUB_LINE1_DELAY = TEXT_REVEAL_TITLE_DELAY + TITLE_LAST_WORD_OFFSET + 0.25;
const TEXT_REVEAL_SUB_LINE2_DELAY = TEXT_REVEAL_SUB_LINE1_DELAY + 0.15;
const TEXT_REVEAL_USP_BASE_DELAY = TEXT_REVEAL_SUB_LINE2_DELAY + 0.35;
const TEXT_REVEAL_USP_STAGGER = 0.12;

// Enter/exit scale — restores the previous version's "text grows in with
// the section, then everything eases back down as you scroll past it"
// feel. Enter scales the frame's CONTENT (so copy grows in step with the
// photo, not just the crop window); exit scales the frame itself back
// down and un-rounds it as it scrolls away, computed from the section's
// own bottom edge crossing the viewport post-pin — no extra page height
// needed, it just rides the natural scroll-away distance.
const ENTER_SCALE_FROM = 0.84;
const EXIT_SCALE_TO = 0.9;
const EXIT_RADIUS_PX = 20;
const EXIT_DURATION = 0.75;

// Threshold (on phase-1 progress) past which the frame is fully grown and
// covers the whole viewport — the page bg swaps to light exactly then, so
// the switch is hidden behind opaque content instead of ever being seen.
const LIGHT_SWITCH_THRESHOLD = 0.98;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Same visual technique as AppDownloadBanner's RevealWords (word wrapped in
// an overflow-hidden mask, sliding up from below while blurring in) — see
// that file for the original — adapted here to (a) take an externally
// driven `active` boolean instead of its own useInView, since the reveal is
// gated by this section's own scroll-trigger condition, and (b) span
// multiple design-forced lines (a manual <br/> between them) while keeping
// one continuous word-stagger order across the whole title.
function RevealTitleWords({
  lines,
  active,
  startDelay,
}: {
  lines: string[];
  active: boolean;
  startDelay: number;
}) {
  return (
    <>
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        // Word order counts continuously across lines (not reset per line)
        // so the whole title reads as one uninterrupted stagger — derived
        // from the preceding lines' own word counts rather than a mutable
        // counter, since lines/words here are tiny (a handful of words).
        const priorWordCount = lines.slice(0, lineIdx).reduce((sum, l) => sum + l.split(" ").length, 0);
        return (
          <React.Fragment key={lineIdx}>
            {words.map((word, i) => {
              const wordDelay = startDelay + (priorWordCount + i) * WORD_STEP;
              return (
                <React.Fragment key={i}>
                  {/* The trailing space between words must live OUTSIDE the
                      overflow:hidden clipped span — see AppDownloadBanner's
                      RevealWords for why. */}
                  <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                    <motion.span
                      style={{ display: "inline-block" }}
                      initial={{ y: "-110%", opacity: 0, filter: "blur(6px)" }}
                      animate={active ? { y: "0%", opacity: 1, filter: "blur(0px)" } : {}}
                      transition={{ duration: WORD_DURATION, delay: wordDelay, ease: EASE }}
                    >
                      {word}
                    </motion.span>
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default function HealthPackages() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const scrimDullRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const railItemRefs = useRef<(HTMLElement | null)[]>([]);
  // Background video: only ever plays while the section has actually
  // appeared on screen, and (on desktop) pauses again the instant the
  // cards-overlay phase (scrimDull) starts appearing — resuming smoothly
  // if you scroll back up out of that phase, and simply staying paused
  // once you've scrolled past the section entirely (p2 stays clamped at 1
  // there, same as mid-overlay).
  const hasAppearedRef = useRef(false);
  const isPlayingRef = useRef(false);
  // Left-column text reveal gate — flips true exactly once (ref-guarded,
  // same one-shot pattern as hasAppearedRef/isPlayingRef above) the moment
  // the scroll-driven trigger condition below is met, and drives the
  // Framer Motion word/line/item reveal further down via `animate` rather
  // than initial/whileInView.
  const textRevealedRef = useRef(false);
  const [textRevealed, setTextRevealed] = useState(false);
  const zoomStartedRef = useRef(false);
  const [zoomStarted, setZoomStarted] = useState(false);

  const packages = PACKAGES_BY_CITY[DETECTED_CITY] ?? [];
  const hasPackages = packages.length > 0;
  const railSlots = hasPackages ? ["label", ...packages.map((p) => p.id), "explore"] : ["explore"];

  // Video pauses once the third card (or the last one, if fewer than
  // three ever exist) has fully appeared, rather than the instant the
  // cards-overlay phase begins — matches the old p2<=0 cutoff when there
  // are no packages at all.
  const targetCardIdx = hasPackages ? Math.min(3, packages.length) : 0;
  const thirdCardVisibleP = hasPackages
    ? PHASE2_START + targetCardIdx * RAIL_STAGGER + RAIL_ITEM_DURATION
    : PHASE2_START;

  // Left-column text reveal trigger: fires once the frame/section itself is
  // genuinely visible, not once the right-rail package cards reach some
  // point in their own (much later, PHASE2-gated) reveal — waiting on the
  // cards left a long dead stretch of the fully-formed video playing with
  // no text at all. Keyed to phase-1 (the frame's own grow-in, see p1
  // below) reaching 0.78 — comfortably before it's fully filled (p1=1)
  // rather than waiting for that either, but still past the point
  // (empirically confirmed via direct DOM inspection in an earlier pass)
  // where the frame's real width has stabilized enough that the title's
  // manual 2-line break is no longer at risk of wrapping into 3-4 lines.
  // Package cards/rail/explore/video below are untouched — they keep their
  // own separate PHASE2-based timeline entirely.
  const TEXT_REVEAL_P1_THRESHOLD = 0.78;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    const applyState = (p: number, exitP: number) => {
      const frame = frameRef.current;
      const bgVideo = bgVideoRef.current;
      const scrimDull = scrimDullRef.current;
      const grid = gridRef.current;
      const leftCol = leftColRef.current;
      if (!frame || !bgVideo || !scrimDull || !grid || !leftCol) return;

      const p1 = clamp01(p / PHASE1_END);
      const exitT = clamp01(exitP / EXIT_DURATION);

      // Frame: box grow (width/height/radius) while entering, then a
      // separate scale-down + un-round as it exits — the two never
      // overlap in time, so they can share the one element cleanly.
      const enterScale = ENTER_SCALE_FROM + (1 - ENTER_SCALE_FROM) * p1;
      const exitScale = 1 - (1 - EXIT_SCALE_TO) * exitT;
      frame.style.width = `${76 + 24 * p1}%`;
      frame.style.height = `${72 + 28 * p1}%`;
      const exitRadiusPx = EXIT_RADIUS_PX * exitT;
      const enterRadiusPx = 26 * (1 - p1);
      frame.style.borderRadius = `${exitRadiusPx > 0 ? exitRadiusPx : enterRadiusPx}px`;
      frame.style.transform = `scale(${exitScale})`;
      bgVideo.style.transform = `scale(${1.14 - 0.08 * p1})`;

      // Content (copy + rail) grows in with the frame, then eases back
      // down together with it on exit — restores the "text enlarges with
      // the section" feel from the previous version.
      grid.style.transform = `scale(${enterScale * exitScale})`;

      const p2 = clamp01((p - PHASE2_START) / (PHASE2_END - PHASE2_START));
      scrimDull.style.opacity = String(p2);
      leftCol.style.transform = `translateY(${-34 * p2}px)`;

      // Left-column text reveal: one-shot gate, flips the React state on
      // once the frame is ~78% grown (see TEXT_REVEAL_P1_THRESHOLD above)
      // and never flips back — the Framer Motion word/line/item
      // choreography below is driven entirely off that boolean, not off p1
      // directly, so it plays out on its own timeline once triggered.
      if (!textRevealedRef.current && p1 >= TEXT_REVEAL_P1_THRESHOLD) {
        textRevealedRef.current = true;
        setTextRevealed(true);
      }
      
      if (!zoomStartedRef.current && p1 >= 0.05) {
        zoomStartedRef.current = true;
        setZoomStarted(true);
      }

      // Video plays once the section has appeared, and pauses again once
      // the third card has fully appeared (rather than the instant the
      // cards-overlay phase begins) — resuming on scroll-up, and staying
      // paused for the rest of the scroll once past that point.
      const shouldPlay = hasAppearedRef.current && p < thirdCardVisibleP;
      if (shouldPlay !== isPlayingRef.current) {
        isPlayingRef.current = shouldPlay;
        if (shouldPlay) bgVideo.play().catch(() => {});
        else bgVideo.pause();
      }

      railItemRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = PHASE2_START + i * RAIL_STAGGER;
        const t = clamp01((p - start) / RAIL_ITEM_DURATION);
        const isCard = hasPackages && i >= 1 && i <= packages.length;
        // The trailing "explore all packages" link is always the last rail
        // slot regardless of package count — it now enters the same way as
        // the cards above it (blur + grow, no horizontal slide) so the
        // whole rail reads as one consistent top-to-bottom appearance.
        const isExplore = i === railSlots.length - 1;
        if (isCard || isExplore) {
          // Package cards (and the explore link): blur + grow into place,
          // one after another — no directional slide.
          el.style.transform = `scale(${CARD_SCALE_FROM + (1 - CARD_SCALE_FROM) * t})`;
          el.style.filter = `blur(${CARD_BLUR_FROM_PX * (1 - t)}px)`;
        } else {
          el.style.transform = `translateX(${38 * (1 - t)}px)`;
        }
        el.style.opacity = String(t);
      });

      // Page bg swaps to light once the frame fully covers the viewport —
      // hidden behind the opaque photo, so the switch is never seen, and
      // it's already light by the time the exit shrink reveals the edges
      // again. Fully reversible on scroll-up. Applied directly here (same
      // rAF tick as the frame's own width/height/scale) rather than via a
      // React state + CSS class, which had just enough render lag for a
      // brief flash of the wrong color to show through on a fast scroll-up
      // — this keeps the color switch perfectly in sync with the frame.
      const stickyViewport = stickyViewportRef.current;
      const nextIsLight = p1 >= LIGHT_SWITCH_THRESHOLD;
      if (stickyViewport) {
        stickyViewport.style.backgroundColor = nextIsLight ? "var(--color-bg, #fafcfc)" : "#031224";
      }
    };

    const computeProgress = () => {
      const section = sectionRef.current;
      if (!section) return { p: 0, exitP: 0 };
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = total <= 0 ? 0 : clamp01(-rect.top / total);
      const exitP = clamp01((vh - rect.bottom) / vh);
      return { p, exitP };
    };

    let ticking = false;
    const tick = () => {
      ticking = false;
      if (reduced || isMobile()) return;
      const { p, exitP } = computeProgress();
      applyState(p, exitP);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    };
    const onResize = () => {
      if (!reduced && !isMobile()) {
        const { p, exitP } = computeProgress();
        applyState(p, exitP);
      }
    };
    const onMotionChange = () => {
      reduced = mq.matches;
      if (reduced) applyState(1, 0);
    };

    if (reduced) {
      applyState(1, 0);
    } else if (!isMobile()) {
      const { p, exitP } = computeProgress();
      applyState(p, exitP);
    } else if (!textRevealedRef.current) {
      // Mobile: no sticky pin, so applyState's scroll-driven trigger check
      // never runs — the left-column text should just be visible like the
      // rest of the static mobile layout (matches the rail's own mobile
      // CSS override further down, which forces the same items opaque).
      textRevealedRef.current = true;
      setTextRevealed(true);
      zoomStartedRef.current = true;
      setZoomStarted(true);
    }

    // Drives hasAppearedRef and, for desktop, immediately re-syncs the
    // video the moment visibility changes (rather than waiting for the
    // next scroll event, which might not come right away if the page
    // loads with the section already in view). On mobile/reduced-motion,
    // where applyState's own scroll-driven phase-2 gating never runs,
    // this is the only thing controlling play/pause — simple
    // visible-or-not, since there's no cards-overlay phase to also gate on
    // there.
    const section = sectionRef.current;
    let observer: IntersectionObserver | null = null;
    if (section) {
      observer = new IntersectionObserver(
        ([entry]) => {
          hasAppearedRef.current = entry.isIntersecting;
          if (reduced || isMobile()) {
            const video = bgVideoRef.current;
            if (!video) return;
            const shouldPlay = entry.isIntersecting;
            if (shouldPlay !== isPlayingRef.current) {
              isPlayingRef.current = shouldPlay;
              if (shouldPlay) video.play().catch(() => {});
              else video.pause();
            }
          } else {
            const { p, exitP } = computeProgress();
            applyState(p, exitP);
          }
        },
        { threshold: 0 }
      );
      observer.observe(section);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mq.addEventListener?.("change", onMotionChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener?.("change", onMotionChange);
      observer?.disconnect();
    };
  }, [railSlots.length]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="health-packages"
      // Always "dark" here, deliberately not tied to the sticky viewport's
      // own bg-color switch above (applyState's nextIsLight) — that flips
      // early, as soon as the frame is fully grown, purely so the color is
      // already correct once the exit shrink reveals it, while it's safely
      // hidden behind the still-opaque frame the entire time in between.
      // The FAB/navbar probe THIS attribute to decide text color, so it
      // needs to track what's actually on screen (dark photo/video/cards
      // for virtually the whole dwell), not that internal pre-emption.
      // Once the section has genuinely scrolled past (out of the FAB's
      // fixed screen position), the probe naturally picks up
      // whichever section comes next instead — no dynamic toggle needed.
      data-nav-theme="dark"
    >
      <div ref={stickyViewportRef} className={styles.stickyViewport}>
        <div ref={frameRef} className={styles.frame}>
          <video
            ref={bgVideoRef}
            className={styles.bgVideo}
            src="/0_Close_up_Objective_1280x720.mp4"
            loop
            muted
            playsInline
            aria-hidden
          />
          <div className={styles.scrimBase} aria-hidden />
          <div className={styles.scrimLeft} aria-hidden />
          <div ref={scrimDullRef} className={styles.scrimDull} aria-hidden />

          <div ref={gridRef} className={styles.grid}>
            <div ref={leftColRef} className={styles.leftCol}>
              <div className={styles.titleGroup}>
                {/* Eyebrow (label + dash) slides in from above as one unit,
                    first in the sequence. */}
                <motion.div
                  className={styles.eyebrowUnit}
                  initial={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                  transition={{ duration: 0.6, delay: TEXT_REVEAL_EYEBROW_DELAY, ease: EASE }}
                >
                  <div className={`section-eyebrow ${styles.eyebrowOnDark}`}>PREVENTIVE HEALTH PACKAGES</div>
                  <div className={styles.eyebrowDash} />
                </motion.div>
                <h2 className={styles.title}>
                  <TextSweepEffect words={[TITLE_LINES.join(" ")]} sweepMs={1500} finalColor="#FFFFFF" active={zoomStarted} delayMs={0} />
                </h2>
              </div>
              <div className={styles.subGroup}>
                <p className={styles.sub}>
                  <motion.span
                    className={styles.subLine}
                    initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                    animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.7, delay: TEXT_REVEAL_SUB_LINE1_DELAY, ease: EASE }}
                  >
                    Check-ups that catch problems early, while they&apos;re easier to treat.
                  </motion.span>
                  <motion.span
                    className={styles.subLine}
                    initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                    animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.7, delay: TEXT_REVEAL_SUB_LINE2_DELAY, ease: EASE }}
                  >
                    Tests, reports and a doctor&apos;s review, in one visit.
                  </motion.span>
                </p>
                <ul className={styles.uspList}>
                  {USPS.map((usp, uspIdx) => (
                    <motion.li
                      key={usp.label}
                      className={styles.uspItem}
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                      transition={{
                        duration: 0.5,
                        delay: TEXT_REVEAL_USP_BASE_DELAY + uspIdx * TEXT_REVEAL_USP_STAGGER,
                        ease: EASE,
                      }}
                    >
                      <usp.icon size={17} strokeWidth={1.3} className={styles.uspIcon} aria-hidden />
                      {usp.label}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.rightRail}>
              {hasPackages ? (
                <>
                  <div
                    ref={(el) => { railItemRefs.current[railSlots.indexOf("label")] = el; }}
                    className={styles.railLabel}
                  >
                    Popular Packages in {DETECTED_CITY}
                  </div>

                  <div className={styles.cardStack}>
                    {packages.map((pkg) => (
                      <Link
                        key={pkg.id}
                        href={`/health-packages/${pkg.id}`}
                        ref={(el) => { railItemRefs.current[railSlots.indexOf(pkg.id)] = el; }}
                        className={styles.packageCard}
                      >
                        <div className={styles.thumb}>
                          <img src={pkg.image} alt="" className={styles.thumbImage} />
                        </div>
                        <div className={styles.cardBody}>
                          <h3 className={styles.cardName}>{pkg.name}</h3>
                          <p className={styles.cardAudience}>{pkg.audience}</p>
                          <div className={styles.chipsRow}>
                            <span className={styles.chip}>{pkg.inclusions[0]}</span>
                            <span className={styles.chip}>{pkg.inclusions[1]}</span>
                            {pkg.inclusions.length > 2 && (
                              <span className={styles.chipOverflow}>+{pkg.inclusions.length - 2}</span>
                            )}
                          </div>
                        </div>
                        <span className={styles.arrowBadge} aria-hidden>
                          <ArrowUpRight size={14} />
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/health-packages"
                    ref={(el) => { railItemRefs.current[railSlots.indexOf("explore")] = el; }}
                    className={styles.exploreRow}
                  >
                    Explore all packages
                    <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <Link
                  href="/hospitals"
                  ref={(el) => { railItemRefs.current[railSlots.indexOf("explore")] = el; }}
                  className={styles.exploreRow}
                >
                  Find a check-up near you
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
