"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useTransform, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import calendarCheckAnimation from "../../../public/assets/calendar-check.json";
import nhAppIconAnimation from "../../../public/assets/nh-app-icon.json";
import styles from "./FloatingQuickActions.module.css";
import { searchDockProgress } from "@/components/search/NHSearchExperience/dockProgress";

// The icons idle on their finished frame and only replay while hovered —
// a bar that's always on screen shouldn't have two things animating on it
// unprompted. They still play once on mount (loop={false} + autoplay),
// which is what leaves them on that finished frame in the first place:
// seeking there instead would mean resting on frame 0, which for both of
// these is an empty tile (the calendar's box starts at zero scale, the NH
// mark's layers start at zero opacity).
const HOVER_REPLAY_DELAY_MS = 1500;

// Each hovered play waits this long after finishing before playing again —
// a paced replay rather than lottie-web's own back-to-back `loop`. Bundles
// the hover-tracking ref (so a stale completion from after the mouse has
// already left doesn't schedule a replay) and the pending-timeout ref
// (cleared on mouse-leave) that a plain loop=true toggle didn't need.
function useHoverLoop(ref: React.RefObject<LottieRefCurrentProps | null>) {
  const hoveringRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onMouseEnter = () => {
    hoveringRef.current = true;
    ref.current?.goToAndPlay(0, true);
  };

  // Doesn't stop the pass already in flight — same "let it settle rather
  // than cut off mid-draw" reasoning as before — just cancels the next
  // scheduled one and stops the completion handler from queuing another.
  const onMouseLeave = () => {
    hoveringRef.current = false;
    clearTimeout(timeoutRef.current);
  };

  // Fires after every play, including the initial mount autoplay — hoveringRef
  // is false then, so it's a no-op until the first real hover.
  const onComplete = () => {
    if (!hoveringRef.current) return;
    timeoutRef.current = setTimeout(() => {
      if (hoveringRef.current) ref.current?.goToAndPlay(0, true);
    }, HOVER_REPLAY_DELAY_MS);
  };

  return { onMouseEnter, onMouseLeave, onComplete };
}

export default function FloatingQuickActions() {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [darkLinks, setDarkLinks] = useState<boolean[]>([false, false, false]);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef0 = useRef<HTMLAnchorElement>(null);
  const linkRef1 = useRef<HTMLAnchorElement>(null);
  const linkRef2 = useRef<HTMLButtonElement>(null);

  // The bar carries two actions until the hero search arrives; the third
  // slot is opened by growing the bar rather than by the tile appearing in
  // place, so the arriving composer is absorbed into a space that opens for
  // it instead of landing on top of something. Heights are measured (not
  // hardcoded) because the slot height follows the label's own line count.
  const [slotHeights, setSlotHeights] = useState<{ open: number; closed: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      const pulse = linkRef2.current;
      if (!el || !pulse) return;
      const open = el.scrollHeight;
      const pulseH = pulse.offsetHeight;
      // Below 900px the bar is display:none and both read 0 — leaving this
      // null keeps the inline height off entirely, so the mobile layout is
      // never driven by a measurement that was never taken.
      if (open === 0 || pulseH === 0) {
        setSlotHeights(null);
        return;
      }
      const styleOf = window.getComputedStyle(el);
      const gap = parseFloat(styleOf.rowGap || "0") || 0;
      setSlotHeights({ open, closed: open - (pulseH + gap) });
    };
    measure();
    window.addEventListener("resize", measure);
    const settle = setTimeout(measure, 1000);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(settle);
    };
  }, []);

  // Opens across the composer's glide (0.54 -> 0.84), so the bar is already
  // reaching for it well before it lands.
  const absorb = useTransform(searchDockProgress, [0.54, 0.84], [0, 1]);
  const openH = slotHeights?.open ?? 0;
  const closedH = slotHeights?.closed ?? 0;
  const barHeight = useTransform(absorb, [0, 1], [closedH, openH]);
  // Pins the bar's top edge while it grows, so the expansion reads as the
  // bottom extending downward — and still leaves the grown bar centred.
  // (.container is centred with top: 50% + translateY(-50%), which would
  // otherwise split the growth evenly above and below.)
  const barMarginTop = useTransform(absorb, [0, 1], [-(openH - closedH) / 2, 0]);
  // The real tile only takes over once the composer sitting on top of it
  // has gone, at identical geometry, so the swap itself is invisible.
  const pulseTileOpacity = useTransform(searchDockProgress, [0.84, 0.88], [0, 1]);

  const calendarLottieRef = useRef<LottieRefCurrentProps>(null);
  const nhAppIconLottieRef = useRef<LottieRefCurrentProps>(null);
  const calendarHover = useHoverLoop(calendarLottieRef);
  const nhAppIconHover = useHoverLoop(nhAppIconLottieRef);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Has to be on screen before the composer starts its glide, or the
      // slot opening for it is never seen. The dock progress is the honest
      // signal (it is what drives the glide); the pixel threshold stays as
      // the fallback for the case where the hero is not what is scrolling.
      const showQuickActions =
        searchDockProgress.get() >= 0.45 || window.scrollY >= window.innerHeight * 0.65;
      setIsQuickActionsVisible(showQuickActions);





      if (!showQuickActions || !containerRef.current) return;

      // Temporarily disable pointer events on container to sample element underneath
      const prevPointerEvents = containerRef.current.style.pointerEvents;
      containerRef.current.style.pointerEvents = "none";

      // Section-level overrides are decided from what the bar's own box
      // actually overlaps, not from a single sampled point: a section can
      // be behind the bar long before anything in it is, and it is the
      // content arriving under the labels that matters, not the section's
      // own top edge.
      const barRect = containerRef.current.getBoundingClientRect();
      const overlapsBar = (el: Element) => {
        const r = el.getBoundingClientRect();
        return (
          r.right > barRect.left &&
          r.left < barRect.right &&
          r.bottom > barRect.top &&
          r.top < barRect.bottom
        );
      };

      // Entry happens while the hero is still behind the bar. The hero is
      // marked dark for the navbar's sake, but the bar arrives over its
      // pale lower half, so its labels stay blue there.
      const hero = document.querySelector("#hero-section-search-first");
      const overHero = Boolean(hero && overlapsBar(hero));

      // Specialities: the grid section is dark from its first pixel, but
      // most of that is empty backdrop. The labels only need to go white
      // once a speciality image is genuinely behind them — or once the
      // handoff strip at the bottom (CTA + the reversible plate fading to
      // Patient Stories' solid backdrop) is behind them, since that empty
      // gap turns solid dark well before Patient Stories itself arrives.
      const grid = document.querySelector('[class*="gridSection"]');
      const overGrid = Boolean(grid && overlapsBar(grid));
      const overGridImage =
        overGrid && Array.from(grid!.querySelectorAll("img")).some(overlapsBar);
      const bottomStrip = document.querySelector('[class*="gridBottomStrip"]');
      const overBottomStrip = Boolean(bottomStrip && overlapsBar(bottomStrip));

      // Packages: dark like every other section, so the labels are white
      // through it — until a card has grown far enough to sit under the
      // bar, where white would be reading against the card's light glass.
      const packages = document.querySelector("#health-packages");
      const overPackages = Boolean(packages && overlapsBar(packages));
      const packageCardAtBar =
        overPackages &&
        Array.from(packages!.querySelectorAll('a[class*="packageCard"]')).some(overlapsBar);
      const packagesFrame = packages?.querySelector('[class*="frame"]') ?? null;
      const overPackagesFrame = Boolean(packagesFrame && overlapsBar(packagesFrame));

      const linkRefs = [linkRef0, linkRef1, linkRef2];
      const newDarkState = linkRefs.map((ref) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const elements = document.elementsFromPoint(centerX, centerY);
        let detectedTheme = "light";
        for (const el of elements) {
          const themeEl = el.closest("[data-nav-theme]");
          if (themeEl) {
            detectedTheme = themeEl.getAttribute("data-nav-theme") || "light";
            break;
          }
        }

        let isDark = detectedTheme === "dark";
        if (overGrid) isDark = overGridImage || overBottomStrip;
        if (overPackages) isDark = !packageCardAtBar && !overPackagesFrame;
        if (overHero) isDark = false;
        return isDark;
      });

      containerRef.current.style.pointerEvents = prevPointerEvents;
      setDarkLinks(newDarkState);
    };

    window.addEventListener("scroll", handleScrollAndTheme, { passive: true });
    window.addEventListener("resize", handleScrollAndTheme, { passive: true });
    handleScrollAndTheme();

    return () => {
      window.removeEventListener("scroll", handleScrollAndTheme);
      window.removeEventListener("resize", handleScrollAndTheme);
    };
  }, []);

  // The scroll listener alone is too coarse here: the glide is driven by a
  // spring, so progress keeps moving after the last scroll event and the
  // bar would arrive late (or not at all, on a single flick).
  useMotionValueEvent(searchDockProgress, "change", (v) => {
    setIsQuickActionsVisible(
      v >= 0.45 ||
        (typeof window !== "undefined" && window.scrollY >= window.innerHeight * 0.65)
    );
  });

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } }));
    }
  };

  return (
    <>
      {/* Consistent Vertical Floating Utility Group on the Right Side */}
      <motion.div
        ref={containerRef}
        role="region"
        aria-label="Quick actions and search"
        className={`${styles.container} global-floating-quick-actions ${isQuickActionsVisible ? styles.visible : styles.hidden}`}
        style={slotHeights ? { height: barHeight, marginTop: barMarginTop } : undefined}
      >
        {/* Action 1: Book Appointment (Primary utility) */}
        <Link
          ref={linkRef0}
          className={`${styles.link} ${darkLinks[0] ? styles.linkOnDark : ""}`}
          href="/find-a-doctor"
          onMouseEnter={calendarHover.onMouseEnter}
          onMouseLeave={calendarHover.onMouseLeave}
        >
          <span className={styles.iconWrap}>
            {/* The animation's own glyph only fills ~18x20 of its 32x32
                canvas — rendered at the slot's own size it reads visibly
                smaller than the other two action icons. Scaled up and
                clipped back down so the glyph itself (not the
                transparent canvas around it) fills the slot, at a size
                that still clears the window rather than touching it. */}
            <span className={styles.calendarIconClip}>
              <Lottie
                lottieRef={calendarLottieRef}
                animationData={calendarCheckAnimation}
                loop={false}
                autoplay
                onComplete={calendarHover.onComplete}
                style={{ width: 42, height: 42, flexShrink: 0 }}
                aria-hidden
              />
            </span>
          </span>
          <span className={styles.actionLabel}>Book<br />Appointment</span>
        </Link>

        {/* Action 2: Download NH App (Secondary utility) */}
        <Link
          ref={linkRef1}
          className={`${styles.link} ${darkLinks[1] ? styles.linkOnDark : ""}`}
          href="#app-download-banner"
          onMouseEnter={nhAppIconHover.onMouseEnter}
          onMouseLeave={nhAppIconHover.onMouseLeave}
        >
          <span className={styles.iconWrap}>
            <Lottie
              lottieRef={nhAppIconLottieRef}
              animationData={nhAppIconAnimation}
              loop={false}
              autoplay
              onComplete={nhAppIconHover.onComplete}
              style={{ width: 29, height: 29, flexShrink: 0 }}
              aria-hidden
            />
          </span>
          <span className={styles.actionLabel}>Download<br />NH App</span>
        </Link>

        {/* Action 3: Pulse AI Search (Interactive search utility - Minimized Search) */}
        <motion.button
          id="floating-pulse-target"
          ref={linkRef2}
          type="button"
          className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[2] ? styles.linkOnDark : ""}`}
          onClick={handleOpenSearch}
          aria-label="Pulse AI Search"
          style={slotHeights ? { opacity: pulseTileOpacity } : undefined}
        >
          {/* This tile paints its own animated background rather than the
              shared blue glass, so it overrides .iconWrap's own fill. */}
          <span className={`${styles.iconWrap} ${styles.pulseIconWrap}`}>
            <span className={styles.gradientLayer} aria-hidden="true" />
            <span className={`${styles.gradientLayer} ${styles.gradientLayerDodge}`} aria-hidden="true" />
            <span className={styles.pulseIconLight} aria-hidden="true" />
            <span className={styles.pulseBars} aria-hidden="true">
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </span>
          </span>
          <span className={styles.actionLabel}>Pulse AI<br />Search</span>
        </motion.button>
      </motion.div>


    </>
  );
}

