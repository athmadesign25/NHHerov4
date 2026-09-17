"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, Smartphone } from "lucide-react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";
import fabStyles from "@/features/pulse-ai/GlobalPulseFAB.module.css";
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

      // Global Pulse FAB appears exactly when hero search section starts blurring out
      // HeroSearchFirst container is 130vh, and it triggers at 0.05 progress (0.05 * 130vh = 6.5vh)
      const showPulseFab = window.scrollY >= (window.innerHeight * 1.3 * 0.05);
      setIsPulseFabVisible(showPulseFab);

      if (!showQuickActions || !containerRef.current) return;

      // Temporarily disable pointer events on container to sample element underneath
      const prevPointerEvents = containerRef.current.style.pointerEvents;
      containerRef.current.style.pointerEvents = "none";

      // Same data-nav-theme probe the navbar uses (see Navbar.tsx) — reads
      // whatever section marker actually sits under each link, instead of
      // hard-coding a list of section names/classes here that would drift
      // out of sync with it. Only the resulting colors differ (white vs
      // this component's own blue, rather than the navbar's dark text).
      const linkRefs = [linkRef0, linkRef1];
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
        return detectedTheme === "dark";
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              key="pulse-logo-shared"
              layoutId="shared-pulse-transition"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '23px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 2.4 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%' }}
              >
                <Lottie animationData={pulseAnimation} loop={true} style={{ width: "100%", height: "100%" }} />
              </motion.div>
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Pulse AI Workspace Modal */}
      {isPulseWorkspaceOpen && (
        <PulseAIWorkspace onClose={() => setIsPulseWorkspaceOpen(false)} />
      )}
    </>
  );
}
