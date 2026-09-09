"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, Smartphone } from "lucide-react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PulseAIWorkspace from "../pulse-ai/PulseAIWorkspace";
import fabStyles from "../pulse-ai/GlobalPulseFAB.module.css";
import styles from "./FloatingQuickActions.module.css";

export default function FloatingQuickActions() {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isPulseFabVisible, setIsPulseFabVisible] = useState(false);
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
      // Quick Health Actions Bar appears after scrolling past hero section (100vh)
      const showQuickActions = window.scrollY >= window.innerHeight - 100;
      setIsQuickActionsVisible(showQuickActions);

      // Global Pulse FAB appears immediately right after hero search section blurs out (180px)
      const showPulseFab = window.scrollY >= 180;
      setIsPulseFabVisible(showPulseFab);

      if (!showQuickActions || !containerRef.current) return;

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
      {/* Quick Health Actions Bar (Right Vertically Centered - appears after hero scroll) */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Quick health actions"
        className={`${styles.container} ${isQuickActionsVisible ? styles.visible : styles.hidden}`}
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

      {/* Global Pulse Button FAB (Appears right after hero search container disappears) */}
      <AnimatePresence>
        {isPulseFabVisible && (
          <div className={fabStyles.fabContainer}>
            <div className={`${fabStyles.explainerBox} ${showExplainer ? fabStyles.explainerBoxVisible : ""}`}>
              <div className={fabStyles.explainerTitle}>Ask Pulse AI</div>
              <div className={fabStyles.explainerSubtitle}>Your smart health assistant</div>
            </div>

            <motion.button
              key="floating-pulse-fab-global"
              type="button"
              className={fabStyles.fabButton}
              onClick={() => setIsPulseWorkspaceOpen(true)}
              aria-label="Open Pulse AI"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(12px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={fabStyles.pulseAnim}>
                <Lottie animationData={pulseAnimation} loop={true} style={{ width: "100%", height: "100%" }} />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Pulse AI Workspace Modal */}
      {isPulseWorkspaceOpen && (
        <PulseAIWorkspace onClose={() => setIsPulseWorkspaceOpen(false)} />
      )}
    </>
  );
}
