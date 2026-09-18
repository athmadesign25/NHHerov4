"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue, useScroll, LayoutGroup } from "framer-motion";
import { Search, X } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import ActiveSearchCanvas from "./ActiveSearchCanvas";
import SearchResultsCanvas from "./SearchResultsCanvas";
import SkeletonResultsCanvas from "./SkeletonResultsCanvas";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";
import { 
  getSearchResults, 
  SearchResultsData, 
  CARDIOLOGY_RESULTS 
} from "./searchData";

/**
 * Formal Search Experience State Machine:
 * - 'landing': Neutral default floating prompt integrated in homepage hero
 * - 'active': Expanded canvas (State 2) — empty waiting to type OR live predictive sentence completion
 * - 'skeleton': Short 600-900ms AI inference loading simulation showing doctor/category skeletons
 * - 'results': Full search results canvas with doctors, treatments, articles, and tags
 */
export type SearchState = "landing" | "active" | "skeleton" | "results";

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface NHSearchExperienceProps {
  /** Optional callback to notify parent hero (e.g. to dim video or slide headlines) */
  onOpenChange?: (isOpen: boolean) => void;
  /** Optional initial state */
  initialState?: SearchState;
  /** Optional initial location */
  initialLocation?: string;
  /** Optional trigger when user requests deep Pulse AI assistance */
  onOpenPulseAI?: (query: string) => void;
  /** Optional scroll progress motion value to drive the continuous morph into the floating control */
  scrollProgress?: MotionValue<number>;
  /** Optional anchor rect from hero spacer */
  anchorRect?: AnchorRect;
}

export default function NHSearchExperience({
  onOpenChange,
  initialState = "landing",
  initialLocation = "Bangalore",
  onOpenPulseAI,
  scrollProgress,
  anchorRect,
}: NHSearchExperienceProps) {
  const prefersReducedMotion = useReducedMotion();

  // SSR-safety for window calculations
  const [mounted, setMounted] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    setMounted(true);
    setWinSize({ w: window.innerWidth, h: window.innerHeight });

    const handleResize = () => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = winSize.w < 640;

  // Floating search / Pulse AI modal state (when triggered from docked control in fold 2+)
  const [isDocked, setIsDocked] = useState(false);
  const [isPulseWorkspaceOpen, setIsPulseWorkspaceOpen] = useState(false);
  const [pulseInitialQuery, setPulseInitialQuery] = useState("");

  // Global scroll, so the handoff can be gated on the same threshold the
  // floating quick actions use to appear — the shell must not dock onto a
  // bar that isn't on screen yet.
  const { scrollY } = useScroll();

  // Starting dimensions (Hero anchor)
  const startWidth = anchorRect?.width || Math.min(840, winSize.w - 48);
  const startHeight = anchorRect?.height || 136;

  // Docked dimensions are measured off the real Pulse AI tile in the
  // floating bar rather than guessed from viewport math, so the shell
  // lands exactly on it whatever that bar's own padding/size happen to be.
  const [pulseTarget, setPulseTarget] = useState({
    width: isMobile ? 96 : 100,
    height: 91,
    top: winSize.h / 2 + 46.5,
    left: winSize.w - 124,
  });

  useEffect(() => {
    const updateTargetRect = () => {
      const el = document.getElementById("floating-pulse-target");
      const container = document.querySelector(".global-floating-quick-actions") as HTMLElement | null;
      if (!el || !container) return;

      // The bar is parked off-screen by a transform until it's shown, so
      // it's briefly forced into its visible position to be measured.
      const originalTransform = container.style.transform;
      const originalTransition = container.style.transition;
      container.style.transition = "none";
      container.style.transform =
        window.innerWidth < 900 ? "translateY(0)" : "translateY(-50%) translateX(0)";

      const rect = el.getBoundingClientRect();
      setPulseTarget({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
      });

      container.style.transform = originalTransform;
      void container.offsetHeight;
      container.style.transition = originalTransition;
    };

    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    // The bar can mount late / fonts can still be loading on first paint.
    const to = setTimeout(updateTargetRect, 1000);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      clearTimeout(to);
    };
  }, []);

  const endWidth = pulseTarget.width;
  const endHeight = pulseTarget.height;
  const endTop = pulseTarget.top;
  const endLeft = pulseTarget.left;

  const defaultProgress = useMotionValue(0);
  const activeProgress = scrollProgress || defaultProgress;

  // Scroll shrinks the composer down to a square in place; only once it's
  // fully square does it hand off to the floating bar's Pulse tile.
  const targetSquareSize = 110;
  const composerWidth = useTransform(activeProgress, [0.5, 1.0], [startWidth, targetSquareSize]);
  const composerHeight = useTransform(activeProgress, [0.5, 1.0], [startHeight, targetSquareSize]);
  const composerMarginBottom = useTransform(activeProgress, [0.5, 1.0], ["28px", "0px"]);
  const promptOpacity = useTransform(activeProgress, [0.5, 0.75], [1, 0]);
  const compactLabelOpacity = useTransform(activeProgress, [0.75, 1.0], [0, 1]);

  // Past the hero entirely there is nothing to animate between, so the
  // shell just appears docked instead of flying across the page.
  const [skipTransition, setSkipTransition] = useState(false);

  const syncDocked = useCallback(() => {
    const isPastThreshold = scrollY.get() >= winSize.h * 0.65;
    const isSquareAchieved = activeProgress.get() >= 0.99;
    setIsDocked(isPastThreshold && isSquareAchieved);
    setSkipTransition(scrollY.get() >= winSize.h * 1.5);
  }, [scrollY, winSize.h, activeProgress]);

  useMotionValueEvent(scrollY, "change", syncDocked);
  useMotionValueEvent(activeProgress, "change", syncDocked);

  const shellTarget = isDocked
    ? { borderRadius: 18, padding: "8px 6px", opacity: 0 }
    : { borderRadius: 20, padding: "20px 24px", opacity: 1 };

  // Primary search state
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [activePill, setActivePill] = useState<"doctor" | "symptoms" | null>(null);

  // Suggestions & Results
  const [resultsData, setResultsData] = useState<SearchResultsData>(CARDIOLOGY_RESULTS);

  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for global open-search event triggered from the 3rd floating action (Pulse AI Search)
  useEffect(() => {
    const handleTriggerSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ scrollY?: number }>;
      const targetScroll = (customEvent.detail && typeof customEvent.detail.scrollY === "number")
        ? customEvent.detail.scrollY
        : (window.scrollY || window.pageYOffset || 0);
      handleActivate(targetScroll);
    };
    window.addEventListener("nh:open-search", handleTriggerSearch);
    return () => window.removeEventListener("nh:open-search", handleTriggerSearch);
  }, []);

  // Sync state change with parent (e.g. to dim background video / hide hero title)
  useEffect(() => {
    const isExpanded = searchState !== "landing";
    onOpenChange?.(isExpanded);
  }, [searchState, onOpenChange]);

  // Handle global keyboard Escape to return to landing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchState !== "landing") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchState]);

  // Track previous scroll position to freeze and restore
  const savedScrollY = useRef(0);

  // Freeze background page scroll when search overlay is open, and restore when closed
  useEffect(() => {
    const isSearchOpen = searchState !== "landing";

    const getLenis = () => {
      if (typeof window === "undefined") return null;
      return (window as unknown as { __lenis?: { stop: () => void; start: () => void; scrollTo?: (y: number, opts?: { immediate?: boolean }) => void } }).__lenis 
        || (window as unknown as { lenis?: { stop: () => void; start: () => void; scrollTo?: (y: number, opts?: { immediate?: boolean }) => void } }).lenis 
        || null;
    };

    if (isSearchOpen) {
      // 1. Record current scroll position (only if not already recorded)
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (currentScroll > 0 && savedScrollY.current === 0) {
        savedScrollY.current = currentScroll;
      }

      // 2. Stop Lenis smooth scroll
      const lenis = getLenis();
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }

      // 3. Freeze document scroll
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyTouchAction = document.body.style.touchAction;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      // 4. Intercept wheel, touchmove and page-scrolling keys
      const preventBackgroundScroll = (e: WheelEvent | TouchEvent) => {
        const target = e.target as HTMLElement | null;

        // Check if event target is inside the portaled active search modal
        const modalEl = document.getElementById("nh-active-search-modal");
        if (modalEl && modalEl.contains(target)) {
          // If inside an intentionally scrollable area within the modal, allow internal scrolling
          const scrollable = target?.closest(`.${styles.searchShell}, .${styles.resultsRightCol}`) as HTMLElement | null;
          if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
            if (e instanceof WheelEvent) {
              const isScrollingUp = e.deltaY < 0;
              const isScrollingDown = e.deltaY > 0;
              const isAtTop = scrollable.scrollTop <= 0;
              const isAtBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

              if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                if (e.cancelable) e.preventDefault();
              }
            }
            return;
          }
        }

        // Outside modal (backdrop or background) — strictly prevent scrolling
        if (e.cancelable) {
          e.preventDefault();
        }
      };

      const preventScrollKeys = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        if ([" ", "PageUp", "PageDown", "End", "Home"].includes(e.key)) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
      window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
      window.addEventListener("keydown", preventScrollKeys, { passive: false });

      return () => {
        // Restore document styles
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalBodyTouchAction;

        // Remove event listeners
        window.removeEventListener("wheel", preventBackgroundScroll);
        window.removeEventListener("touchmove", preventBackgroundScroll);
        window.removeEventListener("keydown", preventScrollKeys);

        // Resume Lenis smooth scroll and restore exact scroll position
        const activeLenis = getLenis();
        if (activeLenis && typeof activeLenis.start === "function") {
          activeLenis.start();
          if (typeof activeLenis.scrollTo === "function") {
            activeLenis.scrollTo(savedScrollY.current, { immediate: true });
          }
        }
        window.scrollTo({ top: savedScrollY.current, behavior: "instant" as ScrollBehavior });
      };
    }
  }, [searchState !== "landing"]);

  // Handle Query typing
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Open Pulse AI Workspace
  const handleOpenPulse = (initialQueryText?: string) => {
    setPulseInitialQuery(initialQueryText || query || "");
    setIsPulseWorkspaceOpen(true);
    onOpenChange?.(true);
    onOpenPulseAI?.(initialQueryText || query || "");
  };

  const handleClosePulse = () => {
    setIsPulseWorkspaceOpen(false);
    onOpenChange?.(false);
  };

  // Activate search (Landing → Active)
  const handleActivate = (customScroll?: number) => {
    const currentScroll = typeof customScroll === "number"
      ? customScroll
      : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
    savedScrollY.current = currentScroll;
    setQuery(""); // Always show active empty search state when launched
    setSearchState("active");
    onOpenChange?.(true);
  };

  // Submit query (Active → Skeleton Loading → Results)
  const handleSubmit = async (searchQuery: string) => {
    const targetQuery = searchQuery.trim() || "I have chest pain and need a doctor";
    setQuery(targetQuery);
    
    // Step 1: Immediately transition to realistic skeleton state
    setSearchState("skeleton");
    
    // Step 2: Realistic AI matching delay (750ms)
    const [results] = await Promise.all([
      getSearchResults(targetQuery, selectedLocation),
      new Promise((resolve) => setTimeout(resolve, 750)),
    ]);

    // Step 3: Smoothly reveal final results
    setResultsData(results);
    setSearchState("results");
  };

  // Edit search (Results → Active)
  const handleEditSearch = () => {
    setSearchState("active");
  };

  // Handle location change dynamically from chip
  const handleSelectLocation = async (newLocation: string) => {
    setSelectedLocation(newLocation);

    // If currently viewing results, recalculate results immediately while keeping query unchanged
    if (searchState === "results") {
      const updated = await getSearchResults(query || "I have chest pain and need a doctor", newLocation);
      setResultsData(updated);
    }
  };

  // Close search (Active/Results → Landing)
  const handleClose = () => {
    setSearchState("landing");
    setActivePill(null);
    onOpenChange?.(false);
  };

  // Handle quick action pill clicks
  const handleSelectActionPill = (pill: "doctor" | "symptoms") => {
    setActivePill(pill);
    setSearchState("active");
    if (pill === "doctor") {
      setQuery("Find a doctor");
    } else {
      setQuery("I have chest pain");
    }
  };

  // Handle specialty tag click in Results
  const handleSelectSpecialtyTag = (tag: string) => {
    handleSubmit(`${tag} specialist in ${selectedLocation}`);
  };

  // Handle click outside to close active/results state
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchState === "landing") return;
      const target = e.target as Node;
      const modalEl = document.getElementById("nh-active-search-modal");
      if (modalEl && modalEl.contains(target)) {
        return; // Click is inside the portaled modal - do not close
      }
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      handleClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchState]);

  // Handle Ask Pulse CTA
  const handleAskPulse = () => {
    handleOpenPulse(query || "I have chest pain and need clinical guidance");
  };

  // Class mapping based on state:
  const stateClass = 
    searchState === "landing"
      ? styles.stateLanding
      : searchState === "active"
      ? styles.stateActive
      : styles.stateResults;

  const content = (
    <div 
      className={styles.searchExperienceWrapper} 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pointerEvents: searchState === "landing" ? "none" : "auto",
        zIndex: 8990,
      }}
    >
      {/* Landing / Hero search composer (morphs to floating dock on scroll) */}
      <motion.div
        layout
        className={`${styles.searchShell} ${styles.stateLanding}`}
        onClick={() => {
          handleActivate();
        }}
        style={
          hasScroll && searchState === "landing"
            ? {
                position: "fixed",
                top: (isDocked && isMobile) ? "auto" : composerTop,
                bottom: (isDocked && isMobile) ? "max(16px, env(safe-area-inset-bottom))" : "auto",
                left: isDocked ? (isMobile ? "16px" : "auto") : composerLeft,
                right: isDocked ? (isMobile ? "auto" : "24px") : "auto",
                width: isDocked ? (isMobile ? "calc(100vw - 32px)" : "100px") : composerWidth,
                height: isDocked ? (isMobile ? "80px" : "74px") : composerHeight,
                borderRadius: composerRadius,
                paddingLeft: composerPaddingX,
                paddingRight: composerPaddingX,
                paddingTop: composerPaddingY,
                paddingBottom: composerPaddingY,
                opacity: morphShellOpacity,
                maxWidth: "none",
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                boxSizing: "border-box",
                zIndex: 9990,
                pointerEvents: (isDocked && !isMobile) ? "none" : "auto",
                overflow: "hidden",
                cursor: (isDocked && isMobile) ? "default" : "pointer",
              }
            : searchState !== "landing"
            ? {
                display: "none",
                pointerEvents: "none",
              }
            : undefined
        }
        transition={{
          layout: { duration: prefersReducedMotion ? 0.1 : 0.42, ease: [0.16, 1, 0.3, 1] },
          duration: prefersReducedMotion ? 0.1 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {isMobile && hasScroll && (
          <>
            {/* The 3 Action Buttons that fade in as the search UI fades out */}
            <motion.div 
              style={{ opacity: fabOpacity, pointerEvents: isDocked ? "auto" : "none" }}
              className={styles.mobileFabContent}
            >
              <a className={styles.fabLink} href="/find-a-doctor" onClick={(e) => e.stopPropagation()}>
                <span className={styles.fabIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M7.33301 1.83398V4.58398" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.667 1.83398V4.58398" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.4167 2.75H4.58333C3.57081 2.75 2.75 3.57081 2.75 4.58333V17.4167C2.75 18.4292 3.57081 19.25 4.58333 19.25H17.4167C18.4292 19.25 19.25 18.4292 19.25 17.4167V4.58333C19.25 3.57081 18.4292 2.75 17.4167 2.75Z" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.75 8.25H19.25" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.25 13.7493L10.0833 15.5827L13.75 11.916" stroke="white" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>Book<br/>Appointment</span>
              </a>
              <div className={styles.fabDivider} aria-hidden="true" />
              <a className={styles.fabLink} href="#app-download-banner" onClick={(e) => e.stopPropagation()}>
                <span className={styles.fabIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M13.6476 0.675781C14.523 0.694168 15.234 0.949481 15.759 1.70794C16.3096 2.50334 16.1902 3.60656 16.2 4.52036C16.2037 4.864 16.2291 5.41718 16.1655 5.74948C16.6706 5.73485 17.1972 5.75994 17.7041 5.75259C18.6999 5.73818 19.6462 5.63224 20.4624 6.35871C20.9549 6.79375 21.2544 7.4067 21.2948 8.06259C21.3678 9.44683 20.3516 10.5283 18.9765 10.5999C18.9009 10.6249 17.8642 10.6007 17.704 10.6007L13.3896 10.6037C12.7865 10.6048 11.8491 10.5704 11.2844 10.6172C11.2837 10.6091 11.283 10.6009 11.2824 10.5928C11.2548 10.2334 11.2769 9.55103 11.2771 9.16305L11.2783 6.349L11.2771 4.16857C11.2765 3.46614 11.2245 2.93537 11.4607 2.25793C11.8231 1.2185 12.5951 0.756891 13.6476 0.675781Z" fill="white" />
                    <path d="M2.9581 11.3954C3.64255 11.4101 10.4512 11.3552 10.518 11.4164C10.587 11.4796 10.5758 11.6064 10.5786 11.6931C10.5944 12.181 10.5753 12.6713 10.5749 13.1597L10.5781 16.1594L10.5762 17.8892C10.5787 18.3785 10.5971 18.8648 10.5327 19.3508C10.3918 20.4138 9.40064 21.2846 8.33085 21.3157C7.61441 21.4032 6.9007 21.1148 6.4008 20.6032C5.5816 19.7647 5.67598 18.9589 5.67785 17.9001C5.67963 17.3668 5.67798 16.8336 5.67286 16.3003C5.59097 16.2281 5.06187 16.2595 4.91502 16.26L3.53508 16.2649C2.73281 16.2666 2.06055 16.1788 1.41883 15.6349C0.417136 14.786 0.321846 13.2159 1.16404 12.2279C1.65893 11.6474 2.20088 11.4389 2.9581 11.3954Z" fill="white" />
                    <path d="M7.97633 0.672988C8.71331 0.590763 9.37294 0.911643 9.89173 1.40803C10.626 2.11058 10.5687 2.94732 10.5641 3.88361L10.5627 5.14523C10.5619 6.9409 10.5352 8.81837 10.574 10.6093L3.21885 10.6085C2.54156 10.5873 1.90293 10.4852 1.3926 9.99015C0.879518 9.49245 0.612287 8.94994 0.605623 8.22796C0.598571 7.46381 0.833714 6.95819 1.36194 6.41363C1.64923 6.11747 2.24847 5.87022 2.64006 5.78564C2.9703 5.71431 3.5562 5.7379 3.91387 5.73848L5.69985 5.7373C5.69332 5.70097 5.68837 5.66436 5.68507 5.62758C5.65213 5.25596 5.68021 4.76434 5.68148 4.37657C5.68371 3.69356 5.60428 2.91945 5.84768 2.27754C6.20746 1.32862 6.96564 0.759628 7.97633 0.672988Z" fill="white" />
                  </svg>
                </span>
                <span>Download<br/>NH Care App</span>
              </a>
              <div className={styles.fabDivider} aria-hidden="true" />
              <button
                type="button"
                className={styles.fabLink}
                style={{ border: "none" }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent search box from opening
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } }));
                  }
                }}
              >
                <span className={styles.fabIconWrap}>
                  {/* Pulse AI bars styling placeholder or simple bars */}
                  <div style={{ display: "flex", gap: "2px", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "2px", height: "10px", background: "white", borderRadius: "1px" }} />
                    <div style={{ width: "2px", height: "16px", background: "white", borderRadius: "1px" }} />
                    <div style={{ width: "2px", height: "10px", background: "white", borderRadius: "1px" }} />
                  </div>
                </span>
                <span>Pulse AI<br/>Search</span>
              </button>
            </motion.div>
          </>
        )}

        <DefaultSearchPrompt
          onActivate={handleActivate}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onSelectActionPill={handleSelectActionPill}
          onOpenPulse={() => handleOpenPulse()}
          promptOpacity={hasScroll ? promptOpacity : undefined}
          compactLabelOpacity={hasScroll ? compactLabelOpacity : undefined}
          controlsOpacity={hasScroll ? controlsOpacity : undefined}
          controlsHeight={hasScroll ? controlsHeight : undefined}
          controlsMarginBottom={hasScroll ? controlsMarginBottom : undefined}
        />
      </motion.div>

      {/* Viewport-level Active Search Modal Overlay (Portaled directly to document.body) */}
      {/* Operates at the true viewport level anywhere on the page without hero-anchored transforms */}
      {mounted && searchState !== "landing" && createPortal(
        <div
          id="nh-search-overlay-root"
          data-lenis-prevent="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: (searchState === "results" || searchState === "skeleton")
              ? "max(20px, 3vh)"
              : "max(60px, 12vh)",
            paddingBottom: "24px",
            paddingLeft: "16px",
            paddingRight: "16px",
            boxSizing: "border-box",
            pointerEvents: "auto",
          }}
        >
          {/* Backdrop with translucent blur and stationary background freeze */}
          <motion.div
            key="search-backdrop"
            data-backdrop="true"
            data-lenis-prevent="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: "easeOut" }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 10, 18, 0.45)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              zIndex: 1,
              touchAction: "none",
            }}
          />

          {/* Active Search Modal Container: viewport-centered, never hero-anchored */}
          <motion.div
            layout
            id="nh-active-search-modal"
            className={`${styles.searchShell} ${stateClass}`}
            data-lenis-prevent="true"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              zIndex: 2,
              width: Math.min((searchState === "results" || searchState === "skeleton") ? 1080 : 880, winSize.w - 32),
              maxHeight: (searchState === "results" || searchState === "skeleton") ? "92vh" : "85vh",
              overflowY: "auto",
              overscrollBehavior: "contain",
              margin: 0,
              boxSizing: "border-box",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {searchState === "active" && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ActiveSearchCanvas
                    query={query}
                    onQueryChange={handleQueryChange}
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                    activePill={activePill}
                    onSelectActionPill={handleSelectActionPill}
                  />
                </motion.div>
              )}

              {searchState === "skeleton" && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SkeletonResultsCanvas query={query} />
                </motion.div>
              )}

              {searchState === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SearchResultsCanvas
                    query={query || "I have chest pain and need a doctor"}
                    results={resultsData}
                    onEditSearch={handleEditSearch}
                    onClose={handleClose}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                    onSelectSpecialtyTag={handleSelectSpecialtyTag}
                    onAskPulse={handleAskPulse}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Existing Pulse AI Workspace (When opened while docked in compact size or via Pulse trigger) */}
      {mounted && isPulseWorkspaceOpen && createPortal(
        <PulseAIWorkspace
          onClose={handleClosePulse}
          initialQuery={pulseInitialQuery}
        />,
        document.body
      )}
    </motion.div>
  );

  return mounted ? createPortal(content, document.body) : content;
}
