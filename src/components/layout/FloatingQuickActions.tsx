"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import calendarCheckAnimation from "../../../public/assets/calendar-check.json";
import nhAppIconAnimation from "../../../public/assets/nh-app-icon.json";
import styles from "./FloatingQuickActions.module.css";

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

  const calendarLottieRef = useRef<LottieRefCurrentProps>(null);
  const nhAppIconLottieRef = useRef<LottieRefCurrentProps>(null);
  const calendarHover = useHoverLoop(calendarLottieRef);
  const nhAppIconHover = useHoverLoop(nhAppIconLottieRef);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Appears exactly where the hero search composer finishes its morph
      // and hands off to the Pulse tile below — any earlier and both are on
      // screen at once (see NHSearchExperience's own docking threshold).
      const showQuickActions = window.scrollY >= window.innerHeight * 0.65;
      setIsQuickActionsVisible(showQuickActions);





      if (!showQuickActions || !containerRef.current) return;

      // Temporarily disable pointer events on container to sample element underneath
      const prevPointerEvents = containerRef.current.style.pointerEvents;
      containerRef.current.style.pointerEvents = "none";

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
        // HealthPackages marks itself data-nav-theme="dark" (same as every
        // other dark section, for the navbar's own separate probe), but
        // this component's own text should stay its default blue over it
        // specifically rather than switching to white like it does over
        // every other dark section.
        const isOverPackages = elements.some((el) => el.closest("#health-packages"));
        return detectedTheme === "dark" && !isOverPackages;
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

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } }));
    }
  };

  return (
    <>
      {/* Consistent Vertical Floating Utility Group on the Right Side */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Quick actions and search"
        className={`${styles.container} global-floating-quick-actions ${isQuickActionsVisible ? styles.visible : styles.hidden}`}
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
                style={{ width: 46, height: 46, flexShrink: 0 }}
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
              style={{ width: 32, height: 32, flexShrink: 0 }}
              aria-hidden
            />
          </span>
          <span className={styles.actionLabel}>Download<br />NH App</span>
        </Link>

        {/* Action 3: Pulse AI Search (Interactive search utility - Minimized Search) */}
        <button
          id="floating-pulse-target"
          ref={linkRef2}
          type="button"
          className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[2] ? styles.linkOnDark : ""}`}
          onClick={handleOpenSearch}
          aria-label="Pulse AI Search"
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
        </button>
      </div>


    </>
  );
}

