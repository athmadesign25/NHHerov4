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
import TextSweepEffect from "@/components/ui/TextSweepEffect";
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

  // A refresh anywhere below the hero would otherwise replay the whole
  // dock: the spring starts at 0 and travels to the scrolled value, so the
  // Pulse composer flew across the screen and into the floating bar on a
  // page the user never scrolled. Jumping the spring to where the page
  // already is skips the travel — the bar simply comes up with its third
  // slot already open. Repeated across a frame and a settle because
  // scrollYProgress only reads true once the hero has been laid out.
  useEffect(() => {
    if (typeof window === "undefined" || window.scrollY < 40) return;
    const sync = () => smoothProgress.jump(scrollYProgress.get());
    sync();
    const frame = requestAnimationFrame(sync);
    const settle = setTimeout(sync, 150);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scale down and round border radius on scroll
  const heroScale = useTransform(smoothProgress, [0, 0.6], [1, 0.88]);
  const heroRadius = useTransform(smoothProgress, [0, 0.6], ["0px", "20px"]);

  // Blurs out only once CentreOfExcellence's own header has scrolled up
  // to the vertical center of the viewport — rather than reacting to the
  // Hero wrapper's own scroll travel (which finished, and so started the
  // blur, well before that header was actually in view). Same
  // measure-on-scroll pattern as WhyChooseNH's own exit-blur gating.
  const [heroBlurRange, setHeroBlurRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const BLUR_RANGE_PX = 400;
    const measure = () => {
      const headerEl = document.getElementById("CentreOfExcellence_header");
      if (!headerEl) return;
      const vh = window.innerHeight;
      const headerTop = headerEl.getBoundingClientRect().top + window.scrollY;
      // Trigger point: header's top reaches the vertical center of viewport.
      const center = headerTop - vh / 2;
      setHeroBlurRange([center, center + BLUR_RANGE_PX]);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        measure();
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    const settleTimer = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer);
    };
  }, []);

  const { scrollY: heroScrollY } = useScroll();
  const heroBlur = useTransform(heroScrollY, heroBlurRange, ["blur(0px)", "blur(20px)"]);

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

  // Whether the anchor has ever been read from the real element. Until it
  // has, the guess below is all there is; once it has, the guess must never
  // be allowed to overwrite it.
  const anchorMeasuredRef = useRef(false);
  const lastWinHRef = useRef(0);

  // Update anchor rectangle on mount, resize, and on every return to rest
  useEffect(() => {
    const updateRect = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const initialWidth = Math.min(840, winW - 48);
      const prevWinH = lastWinHRef.current || winH;
      lastWinHRef.current = winH;

      // The anchor only reads true while the hero is untouched: past ~20px
      // it has already been scaled and morphed, so its rect describes where
      // the morph currently is rather than where the composer rests.
      if (heroAnchorRef.current && window.scrollY < 20) {
        const rect = heroAnchorRef.current.getBoundingClientRect();
        const next = {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height || 136),
        };
        anchorMeasuredRef.current = true;
        // Compared before setting because this also runs on scroll: an
        // identical object every frame near the top would re-render the
        // whole hero for nothing.
        setAnchorRect((prev) =>
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.height === next.height
            ? prev
            : next
        );
        return;
      }

      // Resized while scrolled away. The old fallback guessed the vertical
      // position as 0.68vh, which sits ~150px above where the anchor really
      // is — so the next time the page came back to the top the composer
      // was resting on the hero headline. The horizontal values are exact
      // from the viewport, so those are still refreshed; vertically the
      // anchor tracks the bottom of the hero, so a measured top is carried
      // by the height change rather than thrown away, and the scroll
      // handler below re-measures it for real on arrival.
      setAnchorRect((prev) => ({
        top: anchorMeasuredRef.current
          ? Math.round(prev.top + (winH - prevWinH))
          : Math.round(winH * 0.68 - 28),
        left: Math.round((winW - initialWidth) / 2),
        width: initialWidth,
        height: anchorMeasuredRef.current ? prev.height : 136,
      }));
    };

    // Self-gated on scrollY < 20, so this is a no-op for all but the last
    // few pixels of a scroll back to the hero — which is the one moment the
    // anchor is both measurable and about to be used.
    const onScroll = () => {
      if (window.scrollY < 20) updateRect();
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", onScroll);
    };
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
        height: "200vh",
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
              <h1 className={styles.headline}>
                <TextSweepEffect words={["Trusted Care, Every Day"]} sweepMs={2600} delayMs={80} finalColor="#FFFFFF" />
              </h1>
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
