"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, Smartphone } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PulseAIWorkspace from "../pulse-ai/PulseAIWorkspace";
import fabStyles from "../pulse-ai/GlobalPulseFAB.module.css";
import styles from "./FloatingQuickActions.module.css";

export default function FloatingQuickActions() {
  const [isVisible, setIsVisible] = useState(false);
  const [darkLinks, setDarkLinks] = useState<boolean[]>([false, false]);
  const [isPulseWorkspaceOpen, setIsPulseWorkspaceOpen] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef0 = useRef<HTMLAnchorElement>(null);
  const linkRef1 = useRef<HTMLAnchorElement>(null);

  // Explainer banner timer
  useEffect(() => {
    const timer1 = setTimeout(() => setShowExplainer(true), 2000);
    const timer2 = setTimeout(() => setShowExplainer(false), 8000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Floating buttons appear after scrolling past hero section (100vh)
      const shouldBeVisible = window.scrollY >= window.innerHeight - 100;
      setIsVisible(shouldBeVisible);

      if (!shouldBeVisible || !containerRef.current) return;

      // Temporarily disable pointer events on container to sample element underneath
      const prevPointerEvents = containerRef.current.style.pointerEvents;
      containerRef.current.style.pointerEvents = "none";

      const linkRefs = [linkRef0, linkRef1];
      const newDarkState = linkRefs.map((ref) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let topEl = document.elementFromPoint(centerX, centerY);

        while (topEl) {
          const className = typeof topEl.className === "string" ? topEl.className : "";
          const id = topEl.id || "";
          const tag = topEl.tagName || "";

          // Check for Leadership section (ChairmanQuote)
          if (id === "chairman-quote" || className.includes("ChairmanQuote")) {
            const sectionRect = topEl.getBoundingClientRect();
            if (rect.bottom >= sectionRect.bottom - 100) {
              return true;
            }
            return false;
          }

          // Check if top-most visible section under this link is a dark section
          if (
            id === "hero-section-search-first" ||
            id === "patient-stories" ||
            className.includes("HeroSearchFirst") ||
            className.includes("PatientStories") ||
            className.includes("specialityCard") ||
            className.includes("specialitiesGrid") ||
            className.includes("AppDownloadBanner") ||
            className.includes("Footer") ||
            tag === "FOOTER"
          ) {
            return true;
          }
          topEl = topEl.parentElement;
        }

        return false;
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

  return (
    <>
      {/* Quick Health Actions Bar (Right Vertically Centered) */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Quick health actions"
        className={`${styles.container} ${isVisible ? styles.visible : styles.hidden}`}
      >
        <Link
          ref={linkRef0}
          className={`${styles.link} ${darkLinks[0] ? styles.linkOnDark : ""}`}
          href="/find-a-doctor"
        >
          <span className={styles.iconWrap}>
            <Calendar size={17} />
          </span>
          <span style={{ flexShrink: 0 }}>Book<br/>Appointment</span>
        </Link>

        <div aria-hidden="true" className={styles.divider}></div>

        <Link
          ref={linkRef1}
          className={`${styles.link} ${darkLinks[1] ? styles.linkOnDark : ""}`}
          href="#app-download-banner"
        >
          <span className={styles.iconWrap}>
            <Smartphone size={17} />
          </span>
          <span style={{ flexShrink: 0 }}>Download<br/>NH Care App</span>
        </Link>
      </div>

      {/* Global Pulse Button FAB from Pulse-AI repo (Appears on scroll) */}
      <div
        className={`${fabStyles.fabContainer} ${isVisible ? styles.pulseVisible : styles.pulseHidden}`}
      >
        <div className={`${fabStyles.explainerBox} ${showExplainer ? fabStyles.explainerBoxVisible : ""}`}>
          <div className={fabStyles.explainerTitle}>Ask Pulse AI</div>
          <div className={fabStyles.explainerSubtitle}>Your smart health assistant</div>
        </div>

        <button
          type="button"
          className={fabStyles.fabButton}
          onClick={() => setIsPulseWorkspaceOpen(true)}
          aria-label="Open Pulse AI"
        >
          <div className={fabStyles.pulseAnim}>
            <Lottie animationData={pulseAnimation} loop={true} />
          </div>
        </button>
      </div>

      {/* Pulse AI Workspace Modal */}
      {isPulseWorkspaceOpen && (
        <PulseAIWorkspace onClose={() => setIsPulseWorkspaceOpen(false)} />
      )}
    </>
  );
}
