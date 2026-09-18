"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import calendarCheckAnimation from "../../../public/assets/calendar-check.json";
import nhAppIconAnimation from "../../../public/assets/nh-app-icon.json";
import styles from "./FloatingQuickActions.module.css";

// Both icon animations replay from the start on this cadence (they each
// play once on mount via their own `autoplay`, then sit on their last
// frame until the next tick) rather than looping continuously — a
// resting icon that occasionally "blinks" to life reads as a deliberate
// bit of life, not a busy, distracting animation.
const ICON_REPLAY_INTERVAL_MS = 10000;

export default function FloatingQuickActions() {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [darkLinks, setDarkLinks] = useState<boolean[]>([false, false, false]);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef0 = useRef<HTMLAnchorElement>(null);
  const linkRef1 = useRef<HTMLAnchorElement>(null);
  const linkRef2 = useRef<HTMLButtonElement>(null);

  const calendarLottieRef = useRef<LottieRefCurrentProps>(null);
  const nhAppIconLottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const replay = () => {
      calendarLottieRef.current?.goToAndPlay(0, true);
      nhAppIconLottieRef.current?.goToAndPlay(0, true);
    };
    const interval = setInterval(replay, ICON_REPLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Quick Health Actions Bar appears as the user scrolls past hero (at ~38% scroll)
      const showQuickActions = window.scrollY >= window.innerHeight * 0.38;
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
        className={`${styles.container} ${isQuickActionsVisible ? styles.visible : styles.hidden}`}
      >
        {/* Action 1: Book Appointment (Primary utility) */}
        <Link
          ref={linkRef0}
          className={`${styles.link} ${darkLinks[0] ? styles.linkOnDark : ""}`}
          href="/find-a-doctor"
        >
          <span className={styles.iconWrap}>
            <Lottie
              lottieRef={calendarLottieRef}
              animationData={calendarCheckAnimation}
              loop={false}
              autoplay
              style={{ width: 22, height: 22, flexShrink: 0 }}
              aria-hidden
            />
          </span>
          <span className={styles.actionLabel}>Book<br />Appointment</span>
        </Link>

        <div aria-hidden="true" className={styles.divider} />

        {/* Action 2: Download NH Care App (Secondary utility) */}
        <Link
          ref={linkRef1}
          className={`${styles.link} ${darkLinks[1] ? styles.linkOnDark : ""}`}
          href="#app-download-banner"
        >
          <span className={styles.iconWrap}>
            <Lottie
              lottieRef={nhAppIconLottieRef}
              animationData={nhAppIconAnimation}
              loop={false}
              autoplay
              style={{ width: 22, height: 22, flexShrink: 0 }}
              aria-hidden
            />
          </span>
          <span className={styles.actionLabel}>Download<br />NH Care App</span>
        </Link>

        <div aria-hidden="true" className={styles.divider} />

        {/* Action 3: Pulse AI Search (Interactive search utility - Minimized Search) */}
        <button
          ref={linkRef2}
          type="button"
          className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[2] ? styles.linkOnDark : ""}`}
          onClick={handleOpenSearch}
          aria-label="Pulse AI Search"
        >
          <span className={styles.iconWrap}>
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

