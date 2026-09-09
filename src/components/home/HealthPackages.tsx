"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HealthPackages.module.css";

// Mock package data for the right-side carousel (reuses existing package art).
const PACKAGES = [
  {
    id: "heart",
    title: "Healthy Heart Package",
    subtitle: "Preventive health, regular checkups, and more tailored for you.",
    image: "/Healthy-Heart-Package.png",
  },
  {
    id: "diabetes",
    title: "Diabetes Care Package",
    subtitle: "Blood sugar, kidney and eye screening bundled for early detection.",
    image: "/clipping-diabetes.png",
  },
  {
    id: "thyroid",
    title: "Thyroid Health Package",
    subtitle: "Complete thyroid panel with expert review of your hormone levels.",
    image: "/clipping-thyroid.png",
  },
];

const AUTOPLAY_MS = 5000;
const TRANSFORM_DELAY_MS = 600;

export default function HealthPackages() {
  const trackRef = useRef<HTMLDivElement>(null);

  // One-time auto transform: main card narrows + right package panel reveals.
  // Fires once, ~2.5s after the card first reaches its fully-pinned full-screen
  // state, and never re-triggers or reverses afterward.
  const [hasTransformed, setHasTransformed] = useState(false);
  const [isFullyEntered, setIsFullyEntered] = useState(false);

  // Right-side package carousel (independent from the main card; never
  // affects it).
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const { scrollYProgress: enterProgress } = useScroll({
    target: trackRef,
    offset: ["start 92%", "start 0px"],
  });

  const { scrollYProgress: exitProgress } = useScroll({
    target: trackRef,
    offset: ["end end", "end start"],
  });

  const enterScale = useTransform(enterProgress, [0, 1], [0.84, 1.0]);
  const enterRadius = useTransform(enterProgress, [0, 1], ["24px", "0px"]);

  const exitScale = useTransform(exitProgress, [0.0, 0.75], [1.0, 0.90]);
  const exitRadius = useTransform(exitProgress, [0.0, 0.75], ["0px", "20px"]);

  const combinedScale = useTransform([enterScale, exitScale], ([sIn, sOut]) => Number(sIn) * Number(sOut));
  const combinedRadius = useTransform([enterRadius, exitRadius], ([rIn, rOut]) => {
    return rOut !== "0px" ? rOut : rIn;
  });

  // Title & Subtitle scroll-linked blur-in transforms (only active before the
  // one-time transform has happened; afterward the text just stays settled).
  const titleBlurPx = useTransform(enterProgress, [0.05, 0.55], [12, 0]);
  const titleOpacity = useTransform(enterProgress, [0.05, 0.55], [0, 1]);
  const cardTitleBlur = useTransform(titleBlurPx, (v) => `blur(${v}px)`);

  const subtitleBlurPx = useTransform(enterProgress, [0.18, 0.68], [12, 0]);
  const subtitleOpacity = useTransform(enterProgress, [0.18, 0.68], [0, 1]);
  const cardSubtitleBlur = useTransform(subtitleBlurPx, (v) => `blur(${v}px)`);

  useMotionValueEvent(enterProgress, "change", (latest) => {
    if (hasTransformed) return;
    setIsFullyEntered(latest >= 0.98);
  });

  useEffect(() => {
    if (hasTransformed || !isFullyEntered) return;
    const timer = setTimeout(() => setHasTransformed(true), TRANSFORM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFullyEntered, hasTransformed]);

  // Autoplay for the right-side carousel, starts once the panel exists.
  useEffect(() => {
    if (!hasTransformed) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PACKAGES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [hasTransformed]);

  const restartAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PACKAGES.length);
    }, AUTOPLAY_MS);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % PACKAGES.length);
    restartAutoplay();
  };
  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + PACKAGES.length) % PACKAGES.length);
    restartAutoplay();
  };

  // Stacked-card carousel: every package always stays mounted, each just
  // animates toward whichever "role" slot it currently occupies (front /
  // peek / further back & hidden), computed from its offset from
  // activeIndex. Advancing rotates which package holds which role, so the
  // peek card visibly grows into the front position (and the next one
  // grows into the peek position) instead of the front card just crossfading
  // in place against a static peek image.
  const ROLE_STYLE = [
    { top: 0, left: 0, width: 483, height: 658, opacity: 1, zIndex: 3 }, // front
    { top: 97, left: 42, width: 465, height: 568, opacity: 0.2, zIndex: 2 }, // peek
    { top: 129, left: 66, width: 434, height: 515, opacity: 0, zIndex: 1 }, // hidden, further back
  ];
  const roleFor = (pkgIndex: number) => (pkgIndex - activeIndex + PACKAGES.length) % PACKAGES.length;

  return (
    <div className={styles.sectionWrap} id="health-packages" data-nav-theme="light">
      {/* Header section (scrolls up naturally, no eyebrow). Explicit here
          (rather than relying on the probe's default light fallback) so
          this doesn't silently depend on every other section always
          tagging itself correctly. */}
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <SplitText
              text="Recommended Health Packages"
              tag="h2"
              className={styles.title}
            />
            <p className={`section-subtitle ${styles.subtitle}`}>
              Built by the doctors who treat what these tests find
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Scroll Runway: Card pins to the very top and expands end-to-end */}
      <div ref={trackRef} className={styles.stackTrack}>
        <div className={styles.stickyViewport} data-nav-theme="dark">
          <motion.div
            className={styles.sectionScaleWrap}
            style={{
              scale: combinedScale,
              borderRadius: combinedRadius,
              transformOrigin: "center top",
            }}
          >
            {/* Main Card: width narrows (one-time) while the photo itself
                pans slightly rightward in sync, giving the shrink a subtle
                parallax feel instead of a flat static crop. */}
            <div
              className={`${styles.mainCard} ${hasTransformed ? styles.mainCardShrunk : ""}`}
              style={{ backgroundImage: "url('/health-package-main-card.jpg')" }}
            >
              <div className={styles.cardVignetteOverlay} />

              <div className={styles.cardInnerContent}>
                <div className={styles.topTextBlock}>
                  <motion.h3
                    className={styles.cardMainTitle}
                    style={{
                      filter: hasTransformed ? "blur(0px)" : cardTitleBlur,
                      opacity: hasTransformed ? 1 : titleOpacity,
                    }}
                  >
                    Wellness 360 Health Package
                  </motion.h3>
                  <motion.p
                    className={styles.cardSubtitle}
                    style={{
                      filter: hasTransformed ? "blur(0px)" : cardSubtitleBlur,
                      opacity: hasTransformed ? 1 : subtitleOpacity,
                    }}
                  >
                    Comprehensive health check covering major systems and key markers
                  </motion.p>

                  {/* Hover-only CTA, revealed on hovering anywhere over the main card */}
                  <a href="#book-health-package" className={styles.mainCardBookLink}>
                    Book Health Package
                  </a>
                </div>
              </div>

              {/* Fades + blurs the photo itself toward its own cut edge, so
                  it continues seamlessly into the gap gradient beyond it
                  instead of ending in a hard line. */}
              <div className={`${styles.mainCardEdgeFade} ${hasTransformed ? styles.mainCardEdgeFadeVisible : ""}`} />
            </div>

            {/* Right-edge gradient: sits in the gap revealed as the main card
                narrows, blending it into the section background. Anchored to
                the full-width wrapper (not the narrowed card) so it stays in
                the reveal gap instead of eating into the visible photo. */}
            <div className={`${styles.rightGradientOverlay} ${hasTransformed ? styles.rightGradientOverlayVisible : ""}`} />

            {/* Right-side package carousel panel: blurs in the instant the
                main card starts narrowing, no delay. */}
            <AnimatePresence>
              {hasTransformed && (
                <motion.div
                  className={styles.rightPanel}
                  initial={{ opacity: 0, y: 16, filter: "blur(24px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.packageStackWrap}>
                    <h3 className={styles.morePackagesTitle}>More Packages</h3>
                    <div className={styles.packageStack}>
                    {PACKAGES.map((pkg, i) => {
                      const role = roleFor(i);
                      const roleStyle = ROLE_STYLE[role];
                      const isFront = role === 0;
                      return (
                        <motion.div
                          key={pkg.id}
                          className={styles.stackCard}
                          style={{
                            backgroundImage: `url('${pkg.image}')`,
                            zIndex: roleStyle.zIndex,
                            pointerEvents: isFront ? "auto" : "none",
                          }}
                          animate={{
                            top: roleStyle.top,
                            left: roleStyle.left,
                            width: roleStyle.width,
                            height: roleStyle.height,
                            opacity: roleStyle.opacity,
                          }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className={styles.activeCardOverlay} />

                          <div className={styles.activeCardTextUnit}>
                            <h4 className={styles.activeCardTitle}>{pkg.title}</h4>
                            <p className={styles.activeCardSubtext}>{pkg.subtitle}</p>
                          </div>

                          {/* Hover-only CTA link, only reachable on the front card */}
                          <a href="#book-health-package" className={styles.bookPackageLink}>
                            Book Health Package
                          </a>

                          {/* Carousel arrows: only on the front card, only ever affect the right-side cards */}
                          {isFront && (
                            <div className={styles.packageArrows}>
                              <button
                                type="button"
                                onClick={goPrev}
                                className={styles.packageArrowBtn}
                                aria-label="Previous package"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={goNext}
                                className={styles.packageArrowBtn}
                                aria-label="Next package"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                    </div>
                  </div>

                  <a href="#all-packages" className={styles.secondaryButton}>
                    See all 24 packages
                    <ChevronRight size={16} className={styles.linkChevron} />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
