"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue, useScroll } from "framer-motion";
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

  // ── Dock travel ──────────────────────────────────────────────────────
  // The trip to the floating bar is driven straight off scroll position
  // rather than a spring fired by a state flip. Two reasons it has to be:
  // the hero is `position: sticky` AND carries a scale transform, so it is
  // the containing block for any fixed-position descendant — the shell
  // only gets true viewport coordinates once it is portaled out to the
  // body, and animating a layout across that portal swap is what made the
  // travel jump through the middle of the screen or snap to the right.
  // Scroll-linked interpolation between two measured points has no such
  // race: every frame's position is a pure function of scrollY.
  const DOCK_START = winSize.h * 0.35;
  const DOCK_END = winSize.h * 0.65;

  // The shell's own viewport rect while it is still in the hero's flow,
  // kept current so the travel can start from exactly where it is at the
  // moment it leaves the flow (rather than a computed guess, which would
  // show up as a jump: the hero is mid-scale at that point).
  const shellRef = useRef<HTMLDivElement>(null);
  const flowRectRef = useRef({ top: 0, left: 0, width: targetSquareSize, height: targetSquareSize });
  const [dockOrigin, setDockOrigin] = useState({ top: 0, left: 0, width: targetSquareSize, height: targetSquareSize });

  const dockProgress = useTransform(scrollY, [DOCK_START, DOCK_END], [0, 1], { clamp: true });
  const dockTop = useTransform(dockProgress, [0, 1], [dockOrigin.top, endTop]);
  const dockLeft = useTransform(dockProgress, [0, 1], [dockOrigin.left, endLeft]);
  // Size travels from the measured origin too — the shrink is spring-driven
  // and may not have quite landed on the square when the handoff happens,
  // so reading it back is what keeps the switch seamless.
  const dockWidth = useTransform(dockProgress, [0, 1], [dockOrigin.width, endWidth]);
  const dockHeight = useTransform(dockProgress, [0, 1], [dockOrigin.height, endHeight]);
  // Gone by the time the bar itself has faded in, so the two are never
  // both on screen.
  const dockOpacity = useTransform(dockProgress, [0.75, 1], [1, 0]);

  const syncDocked = useCallback(() => {
    const y = scrollY.get();
    const shouldDock = y >= DOCK_START;

    setIsDocked((wasDocked) => {
      if (shouldDock && !wasDocked) {
        // Leaving the flow: pin the travel's starting point to wherever
        // the shell physically is right now.
        setDockOrigin({ ...flowRectRef.current });
      }
      return shouldDock;
    });
  }, [scrollY, DOCK_START]);

  useMotionValueEvent(scrollY, "change", syncDocked);

  // Tracked while in flow only — once docked the element is driven by the
  // motion values above, so reading it back would feed itself.
  useMotionValueEvent(scrollY, "change", () => {
    if (isDocked || !shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    flowRectRef.current = {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });

  const shellTarget = { borderRadius: 20, padding: "20px 24px" };

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

  // One element throughout: in the hero's flow while it shrinks, then
  // portaled to the body and flown to the bar on scroll-linked motion
  // values. No layout animation — see the dock travel notes above.
  const searchShellContent = (
    <motion.div
      ref={shellRef}
      className={`${styles.searchShell} ${
        searchState === "landing" ? styles.stateLanding : styles.stateActive
      }`}
      animate={searchState === "landing" ? shellTarget : undefined}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: isDocked ? "fixed" : "relative",
        margin: isDocked ? "0" : "0 auto",
        ...(isDocked && { top: dockTop, left: dockLeft, opacity: dockOpacity }),
        maxWidth: "none",
        boxSizing: "border-box",
        zIndex: 8990,
        pointerEvents: isDocked ? "none" : "auto",
        overflow: "hidden",
        width: isDocked ? dockWidth : composerWidth,
        height: isDocked ? dockHeight : composerHeight,
        cursor: searchState === "landing" ? "pointer" : "default",
        ...(searchState !== "landing" && {
          width: "100%",
          height: "auto",
          minHeight: "400px",
        }),
      }}
      onClick={() => {
        if (searchState === "landing" && !isDocked) handleActivate();
      }}
    >
      <DefaultSearchPrompt
        onActivate={handleActivate}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        onSelectActionPill={handleSelectActionPill}
        onOpenPulse={() => handleOpenPulse()}
        promptOpacity={promptOpacity}
        compactLabelOpacity={compactLabelOpacity}
        controlsOpacity={promptOpacity}
        controlsMarginBottom={composerMarginBottom}
      />
    </motion.div>
  );

  return (
    <motion.div
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
      {isDocked && mounted ? createPortal(searchShellContent, document.body) : searchShellContent}

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
}
