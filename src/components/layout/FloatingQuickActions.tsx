"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import styles from "./FloatingQuickActions.module.css";

export default function FloatingQuickActions() {
  console.log("FloatingQuickActions rendered");

  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isSearchDocked, setIsSearchDocked] = useState(false);
  const [darkLinks, setDarkLinks] = useState<boolean[]>([false, false, false]);
  const [isMounted, setIsMounted] = useState(false);
  const [containerTop, setContainerTop] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const updatePosition = (e?: Event) => {
      const customDetail = (e as CustomEvent)?.detail;
      if (customDetail && typeof customDetail.fabTop === "number") {
        setContainerTop(customDetail.fabTop);
        return;
      }

      if (typeof window !== "undefined") {
        const cssVal = getComputedStyle(document.documentElement).getPropertyValue("--fab-target-top");
        if (cssVal && cssVal.trim()) {
          const parsed = parseFloat(cssVal);
          if (!isNaN(parsed) && parsed > 0) {
            setContainerTop(parsed);
            return;
          }
        }
        const winH = window.innerHeight;
        const defaultStartTop = Math.round(winH * 0.68 - 28);
        const defaultSquareTop = Math.round(defaultStartTop + (136 - 100) / 2);
        setContainerTop(defaultSquareTop - 202);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("nh:search-pos-update", updatePosition);

    const handleDock = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.isDocked === "boolean") {
        setIsSearchDocked(detail.isDocked);
      }
    };
    window.addEventListener("nh:search-docked", handleDock);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("nh:search-pos-update", updatePosition);
      window.removeEventListener("nh:search-docked", handleDock);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef0 = useRef<HTMLAnchorElement>(null);
  const linkRef1 = useRef<HTMLAnchorElement>(null);
  const linkRef2 = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Quick Health Actions Bar appears as the user scrolls past hero (at ~35% scroll, showing 2 buttons)
      const showQuickActions = window.scrollY >= window.innerHeight * 0.35;
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
        className={`${styles.container} ${isQuickActionsVisible ? styles.visible : styles.hidden} ${isSearchDocked ? styles.dockedThreeButtons : styles.dockedTwoButtons}`}
        style={containerTop !== null ? { top: `${containerTop}px` } : undefined}
      >
        {/* Action 1: Book Appointment (Primary utility) */}
        <Link
          ref={linkRef0}
          className={`${styles.link} ${darkLinks[0] ? styles.linkOnDark : ""}`}
          href="/find-a-doctor"
        >
          <span className={styles.iconWrap}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }} aria-hidden>
              <path d="M7.33301 1.83398V4.58398" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.667 1.83398V4.58398" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.4167 2.75H4.58333C3.57081 2.75 2.75 3.57081 2.75 4.58333V17.4167C2.75 18.4292 3.57081 19.25 4.58333 19.25H17.4167C18.4292 19.25 19.25 18.4292 19.25 17.4167V4.58333C19.25 3.57081 18.4292 2.75 17.4167 2.75Z" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.75 8.25H19.25" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.25 13.7493L10.0833 15.5827L13.75 11.916" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.actionLabel}>Book<br />Appointment</span>
        </Link>

        <div aria-hidden="true" className={styles.divider} />

        {/* Action 2: Pulse AI Search (Interactive search utility - Minimized Search) */}
        <button
          ref={linkRef1}
          type="button"
          className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[1] ? styles.linkOnDark : ""}`}
          onClick={handleOpenSearch}
          aria-label="Pulse AI Search"
        >
          <div aria-hidden="true" className={styles.divider} />
          <button
            ref={linkRef2}
            type="button"
            className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[2] ? styles.linkOnDark : ""}`}
            onClick={handleOpenSearch}
            aria-label="Pulse AI Search"
          >
            <span className={styles.iconWrap}>
              {isMounted ? (
                <div className={styles.pulseLottieContainer} aria-hidden="true">
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
              ) : (
                <span className={styles.pulseBars} aria-hidden="true">
                  <span className={styles.pulseBar1} />
                  <span className={styles.pulseBar2} />
                  <span className={styles.pulseBar3} />
                </span>
              )}
            </span>
          </span>
          <span className={styles.actionLabel}>Pulse AI<br />Search</span>
        </button>

        <div aria-hidden="true" className={styles.divider} />

        {/* Action 3: Download NH Care App (Secondary utility) */}
        <Link
          ref={linkRef2}
          className={`${styles.link} ${darkLinks[2] ? styles.linkOnDark : ""}`}
          href="#app-download-banner"
        >
          <span className={styles.iconWrap}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }} aria-hidden>
              <path d="M13.6476 0.675781C14.523 0.694168 15.234 0.949481 15.759 1.70794C16.3096 2.50334 16.1902 3.60656 16.2 4.52036C16.2037 4.864 16.2291 5.41718 16.1655 5.74948C16.6706 5.73485 17.1972 5.75994 17.7041 5.75259C18.6999 5.73818 19.6462 5.63224 20.4624 6.35871C20.9549 6.79375 21.2544 7.4067 21.2948 8.06259C21.3678 9.44683 20.3516 10.5283 18.9765 10.5999C18.9009 10.6249 17.8642 10.6007 17.704 10.6007L13.3896 10.6037C12.7865 10.6048 11.8491 10.5704 11.2844 10.6172C11.2837 10.6091 11.283 10.6009 11.2824 10.5928C11.2548 10.2334 11.2769 9.55103 11.2771 9.16305L11.2783 6.349L11.2771 4.16857C11.2765 3.46614 11.2245 2.93537 11.4607 2.25793C11.8231 1.2185 12.5951 0.756891 13.6476 0.675781Z" fill="white" />
              <path d="M2.9581 11.3954C3.64255 11.4101 10.4512 11.3552 10.518 11.4164C10.587 11.4796 10.5758 11.6064 10.5786 11.6931C10.5944 12.181 10.5753 12.6713 10.5749 13.1597L10.5781 16.1594L10.5762 17.8892C10.5787 18.3785 10.5971 18.8648 10.5327 19.3508C10.3918 20.4138 9.40064 21.2846 8.33085 21.3157C7.61441 21.4032 6.9007 21.1148 6.4008 20.6032C5.5816 19.7647 5.67598 18.9589 5.67785 17.9001C5.67963 17.3668 5.67798 16.8336 5.67286 16.3003C5.59097 16.2281 5.06187 16.2595 4.91502 16.26L3.53508 16.2649C2.73281 16.2666 2.06055 16.1788 1.41883 15.6349C0.417136 14.786 0.321846 13.2159 1.16404 12.2279C1.65893 11.6474 2.20088 11.4389 2.9581 11.3954Z" fill="white" />
              <path d="M7.97633 0.672988C8.71331 0.590763 9.37294 0.911643 9.89173 1.40803C10.626 2.11058 10.5687 2.94732 10.5641 3.88361L10.5627 5.14523C10.5619 6.9409 10.5352 8.81837 10.574 10.6093L3.21885 10.6085C2.54156 10.5873 1.90293 10.4852 1.3926 9.99015C0.879518 9.49245 0.612287 8.94994 0.605623 8.22796C0.598571 7.46381 0.833714 6.95819 1.36194 6.41363C1.64923 6.11747 2.24847 5.87022 2.64006 5.78564C2.9703 5.71431 3.5562 5.7379 3.91387 5.73848L5.69985 5.7373C5.69332 5.70097 5.68837 5.66436 5.68507 5.62758C5.65213 5.25596 5.68021 4.76434 5.68148 4.37657C5.68371 3.69356 5.60428 2.91945 5.84768 2.27754C6.20746 1.32862 6.96564 0.759628 7.97633 0.672988Z" fill="white" />
            </svg>
          </span>
          <span className={styles.actionLabel}>Download<br />NH Care App</span>
        </Link>
      </div>


    </>
  );
}

