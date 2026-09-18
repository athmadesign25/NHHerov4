"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue, useScroll, LayoutGroup } from "framer-motion";
import { Search, X } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import { BorderBeam } from "@/components/ui/BorderBeam/BorderBeam";
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

  // Use global scroll to precisely sync with FloatingQuickActions visibility,
  // but wait until the square morph (activeProgress >= 0.99) is achieved.
  const { scrollY } = useScroll();

  // Starting dimensions (Hero anchor)
  const startWidth = anchorRect?.width || Math.min(840, winSize.w - 48);
  const startHeight = anchorRect?.height || 136;
  const startTop = anchorRect?.top || Math.round(winSize.h * 0.68 - 28);
  const startLeft = anchorRect?.left || Math.round((winSize.w - startWidth) / 2);

  // Docked dimensions (matches Item 3 of the vertical floating utility group on the right side)
  const [pulseTarget, setPulseTarget] = useState({
    width: isMobile ? 96 : 100,
    height: 91,
    top: winSize.h / 2 + 46.5,
    left: winSize.w - 124,
  });

  useEffect(() => {
    const updateTargetRect = () => {
      const el = document.getElementById("floating-pulse-target");
      const container = document.querySelector(".global-floating-quick-actions") as HTMLElement;
      if (el && container) {
        // Temporarily reset transform to force layout measurement in 'visible' state
        const originalTransform = container.style.transform;
        const originalTransition = container.style.transition;
        
        container.style.transition = "none";
        
        if (window.innerWidth < 900) {
          container.style.transform = "translateY(0)";
        } else {
          container.style.transform = "translateY(-50%) translateX(0)";
        }
        
        const rect = el.getBoundingClientRect();
        
        setPulseTarget({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
        });

        // Restore
        container.style.transform = originalTransform;
        // Force reflow before restoring transition to prevent glitch
        void container.offsetHeight; 
        container.style.transition = originalTransition;
      }
    };

    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    
    // Quick actions might mount late or fonts might load
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
  const targetSquareSize = 110;
  const composerWidth = useTransform(activeProgress, [0.5, 1.0], [startWidth, targetSquareSize]);
  const composerHeight = useTransform(activeProgress, [0.5, 1.0], [startHeight, targetSquareSize]);
  const composerMarginBottom = useTransform(activeProgress, [0.5, 1.0], ["28px", "0px"]);
  const promptOpacity = useTransform(activeProgress, [0.5, 0.75], [1, 0]);
  const compactLabelOpacity = useTransform(activeProgress, [0.75, 1.0], [0, 1]);

  useMotionValueEvent(scrollY, "change", () => {
    const isPastThreshold = scrollY.get() >= winSize.h * 0.65;
    const isSquareAchieved = activeProgress.get() >= 0.99;
    setIsDocked(isPastThreshold && isSquareAchieved);
  });

  useMotionValueEvent(activeProgress, "change", (latestProgress) => {
    // Docking matches the new FloatingQuickActions threshold (after Specialities title reveals)
    const isPastThreshold = scrollY.get() >= winSize.h * 0.65;
    const isSquareAchieved = latestProgress >= 0.99;
    setIsDocked(isPastThreshold && isSquareAchieved);
  });

  // We are now using a state-driven animation for the morphing shell
  // so we compute the target values directly based on `isDocked`.
  const shellTarget = isDocked
    ? {
        borderRadius: 18,
        padding: "8px 6px",
        opacity: 0,
      }
    : {
        borderRadius: 20,
        padding: "20px 24px",
        opacity: 1,
      };

  // Secondary buttons fade out when docked (now handled by promptOpacity)

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

  const searchShellContent = (
    <motion.div
      layoutId="search-composer"
      layout="position"
      className={`${styles.searchShell} ${
        searchState === "landing" ? styles.stateLanding : styles.stateActive
      } ${isDocked ? styles.dockedShell : ""}`}
      animate={searchState === "landing" ? shellTarget : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 1,
        opacity: { duration: 0.1, delay: 0, ease: "easeOut" }
      }}
      style={{
        position: isDocked ? "fixed" : "relative",
        margin: isDocked ? "0" : "0 auto",
        ...(isDocked && {
          top: endTop,
          left: endLeft,
        }),
        maxWidth: "none",
        boxSizing: "border-box",
        zIndex: 8990,
        pointerEvents: isDocked ? "none" : "auto",
        overflow: "hidden",
        width: isDocked ? endWidth : composerWidth,
        height: isDocked ? endHeight : composerHeight,
        cursor: searchState === "landing" ? "pointer" : "default",
        ...((searchState !== "landing") && {
          width: "100%",
          height: "auto",
          minHeight: "400px",
        })
      }}
      onClick={() => {
        if (searchState === "landing" && !isDocked) handleActivate();
      }}
    >
      {searchState === "landing" && !isDocked && (
        <BorderBeam size={150} duration={10} colorFrom="#FF3B30" colorTo="#2F78FF" />
      )}
      <DefaultSearchPrompt
        onActivate={handleActivate}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        onSelectActionPill={setActivePill}
        onOpenPulse={() => {
          if (onOpenPulseAI) {
            onOpenPulseAI(pulseInitialQuery);
          } else {
            handleActivate();
          }
        }}
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
      <LayoutGroup>
        {isDocked && mounted ? createPortal(searchShellContent, document.body) : searchShellContent}
      </LayoutGroup>

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
