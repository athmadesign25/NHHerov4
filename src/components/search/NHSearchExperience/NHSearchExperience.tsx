"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, animate, MotionValue } from "framer-motion";
import { Search, X } from "lucide-react";
import Lottie from "lottie-react";
import calendarCheckAnimation from "../../../../public/assets/calendar-check.json";
import nhAppIconAnimation from "../../../../public/assets/nh-app-icon.json";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import { searchDockProgress } from "./dockProgress";
import ActiveSearchCanvas from "./ActiveSearchCanvas";
import SearchResultsCanvas from "./SearchResultsCanvas";
import SkeletonResultsCanvas from "./SkeletonResultsCanvas";
import PulseAIView from "./PulseAIView";
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
 * - 'pulse': Attached Pulse AI window with navigation back to search results
 */
export type SearchState = "landing" | "active" | "skeleton" | "results" | "pulse";

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

  // Search Experience Theme: "dark" (default) or "white" (simulated Figma experience)
  const [searchTheme, setSearchTheme] = useState<"dark" | "white">("white");

  useEffect(() => {
    // Check initial search theme from localStorage or data-search-theme attribute
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("nh_search_theme") as "dark" | "white" | null;
      const docAttr = document.documentElement.getAttribute("data-search-theme") as "dark" | "white" | null;
      if (savedTheme === "white" || docAttr === "white") {
        setSearchTheme("white");
      }
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: "dark" | "white" }>;
      if (customEvent.detail?.theme) {
        setSearchTheme(customEvent.detail.theme);
      }
    };
    window.addEventListener("nh:search-theme-change", handleThemeChange);
    return () => window.removeEventListener("nh:search-theme-change", handleThemeChange);
  }, []);

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

  // Motion values for continuous morphing
  const hasScroll = Boolean(scrollProgress);
  const defaultProgress = useMotionValue(0);
  const activeProgress = scrollProgress || defaultProgress;

  // Starting dimensions (Hero anchor)
  const startWidth = anchorRect?.width || Math.min(840, winSize.w - 48);
  const startHeight = anchorRect?.height || 136;
  const startTop = anchorRect?.top || Math.round(winSize.h * 0.68 - 28);
  const startLeft = anchorRect?.left || Math.round((winSize.w - startWidth) / 2);

  // Minimized search card size (100px x 100px, matches sidebar 3rd button)
  const compactWidth = 100;
  const compactHeight = 100;
  const compactRadius = 18;

  const squareLeft = Math.round((winSize.w - compactWidth) / 2);
  const squareTopInPlace = Math.round(startTop + (startHeight - compactHeight) / 2);

  // Where the composer is actually going: the floating bar's own Pulse
  // tile, measured rather than computed. The old arithmetic here assumed
  // the bar was positioned from the composer (top: squareTopInPlace - 202),
  // but the bar is simply centred in the viewport — so the composer was
  // landing ~250px below the slot it was supposed to be entering, which is
  // why the handoff could only ever be a cross-fade.
  const [pulseTarget, setPulseTarget] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById("floating-pulse-target");
      const container = document.querySelector(
        ".global-floating-quick-actions"
      ) as HTMLElement | null;
      if (!el || !container) return;

      // The bar is parked off-screen by a transform until it is shown, and
      // sits short-and-raised until its third slot has opened — both are
      // forced to their final state here, so what gets measured is where
      // the tile ends up rather than where it currently is.
      const originalTransform = container.style.transform;
      const originalTransition = container.style.transition;
      const originalMarginTop = container.style.marginTop;
      const originalHeight = container.style.height;
      container.style.transition = "none";
      container.style.transform =
        window.innerWidth < 900 ? "translateY(0)" : "translateY(-50%) translateX(0)";
      container.style.marginTop = "0px";
      container.style.height = "auto";

      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        setPulseTarget({
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }

      container.style.transform = originalTransform;
      container.style.marginTop = originalMarginTop;
      container.style.height = originalHeight;
      void container.offsetHeight;
      container.style.transition = originalTransition;
    };

    measure();
    // Below 900px the bar is display:none and there is nothing to measure;
    // the settle pass covers the case where the bar mounts after this does.
    const settle = setTimeout(measure, 800);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const targetButton3Top = isMobile
    ? Math.round(winSize.h - 36 - compactHeight)
    : pulseTarget?.top ?? squareTopInPlace;

  const targetButton3Left = isMobile
    ? Math.round(winSize.w - 16 - compactWidth)
    : pulseTarget?.left ?? (winSize.w - 124);

  // The composer finishes at the slot's own size, not at the 100x100 it
  // crosses the screen as — otherwise it is a card sitting on a tile
  // rather than the tile itself.
  const targetWidth = isMobile ? compactWidth : pulseTarget?.width ?? compactWidth;
  const targetHeight = isMobile ? compactHeight : pulseTarget?.height ?? compactHeight;
  const targetRadius = isMobile || !pulseTarget ? compactRadius : 14;

  // Broadcast fab-target-top so FloatingQuickActions places Button 3 at exact squareTopInPlace
  useEffect(() => {
    if (typeof window !== "undefined" && squareTopInPlace > 0) {
      const fabTop = squareTopInPlace - 202;
      document.documentElement.style.setProperty("--fab-target-top", `${fabTop}px`);
      document.documentElement.style.setProperty("--compact-search-top", `${squareTopInPlace}px`);
      window.dispatchEvent(new CustomEvent("nh:search-pos-update", { detail: { fabTop, squareTopInPlace } }));
    }
  }, [squareTopInPlace]);

  const [isMorphing, setIsMorphing] = useState(false);

  // Scrolling down plays the full multi-stage glide into the FAB, same as
  // always. Scrolling back up used to replay that same glide in reverse —
  // the composer visibly flying back across the screen. It doesn't need
  // to: past this cut, reversing just holds position at the FAB's own
  // slot (matching wherever main.tsx's absorbed tile currently sits); once
  // scroll crosses back below it, the composer cuts straight to its hero
  // anchor, the same way it looks on first load. REVERSE_CUT matches the
  // floating bar's own appear/disappear threshold, so the two hand off at
  // the same instant rather than at two different points.
  const REVERSE_CUT = 0.45;
  const reversingRef = useRef(false);
  const lastActiveProgressRef = useRef(0);

  useMotionValueEvent(activeProgress, "change", (latest) => {
    setIsMorphing(latest > 0.02);
    const docked = latest >= 0.84;
    setIsDocked(docked);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:search-docked", { detail: { isDocked: docked } }));
    }

    const delta = latest - lastActiveProgressRef.current;
    if (delta < -0.0008) reversingRef.current = true;
    else if (delta > 0.0008) reversingRef.current = false;
    lastActiveProgressRef.current = latest;
  });

  // The channel every geometry/appearance transform below reads instead of
  // activeProgress directly: identical to it while scrolling down, but a
  // hard step while scrolling up, so there is nothing in between to crawl
  // through on the way back.
  const positionProgress = useTransform(activeProgress, (v) =>
    reversingRef.current ? (v > REVERSE_CUT ? 1 : 0) : v
  );

  // Choreography:
  // Phase 1 [0.02 - 0.14]: Search bar shrinks in place to 100x100 glassmorphic card at center (squareLeft, squareTopInPlace)
  // Phase 2 [0.14 - 0.54]: WAITS at center position with dark glassmorphism while hero scales & side panel appears with 2 buttons
  // Phase 3 [0.54 - 0.84]: HORIZONTAL GLIDE: glides straight across horizontally to targetButton3Left at constant squareTopInPlace
  // Phase 4 [0.84 - 0.88]: DOCKS & MERGES into 3rd slot, side panel expands to 3 buttons
  const composerTop = useTransform(
    positionProgress,
    [0.02, 0.14, 0.54, 0.84],
    [startTop, squareTopInPlace, squareTopInPlace, targetButton3Top]
  );

  const composerLeft = useTransform(
    positionProgress,
    [0.02, 0.14, 0.54, 0.84],
    [startLeft, squareLeft, squareLeft, targetButton3Left]
  );

  const composerWidth = useTransform(
    positionProgress,
    [0.02, 0.14, 0.54, 0.84],
    [startWidth, compactWidth, compactWidth, targetWidth]
  );

  const composerHeight = useTransform(
    positionProgress,
    [0.02, 0.14, 0.54, 0.84],
    [startHeight, compactHeight, compactHeight, targetHeight]
  );

  const composerRadius = useTransform(
    positionProgress,
    [0.02, 0.14, 0.54, 0.84],
    [20, compactRadius, compactRadius, targetRadius]
  );

  const composerPaddingX = useTransform(
    positionProgress,
    [0.02, 0.14],
    [24, 0]
  );

  const composerPaddingY = useTransform(
    positionProgress,
    [0.02, 0.14],
    [20, 0]
  );

  // Water droplet squash & stretch during horizontal motion [0.54 -> 0.84]
  const dropletScaleX = useTransform(
    positionProgress,
    [0.0, 0.54, 0.62, 0.74, 0.84, 0.88],
    [1.0, 1.0, 1.15, 1.08, 0.95, 1.0]
  );

  const dropletScaleY = useTransform(
    positionProgress,
    [0.0, 0.54, 0.62, 0.74, 0.84, 0.88],
    [1.0, 1.0, 0.88, 0.94, 1.06, 1.0]
  );

  // Background layers adaptation:
  // 1) Dark glassmorphism layer (same like main search box)
  const darkGlassOpacity = useTransform(
    positionProgress, 
    [0.0, 0.02, 0.54, 0.84], 
    [1, 1, 1, 0]
  );

  // 2) Side button frosted glass layer (adapts during horizontal movement 0.54 -> 0.84)
  const sideButtonBgOpacity = useTransform(
    positionProgress, 
    [0.54, 0.84], 
    [0, 1]
  );

  // Text color adaptation: white/dark in glassmorphism -> blue in side button style
  const textColor = useTransform(
    positionProgress,
    [0.54, 0.84],
    [searchTheme === "white" ? "#1E293B" : "#FFFFFF", "#0B5DF4"]
  );

  // Secondary buttons and prompt cross-fades
  const controlsOpacity = useTransform(positionProgress, [0.02, 0.08], [1, 0]);
  const controlsHeight = useTransform(positionProgress, [0.02, 0.09], ["36px", "0px"]);
  const controlsMarginBottom = useTransform(positionProgress, [0.02, 0.09], ["32px", "0px"]);
  const promptOpacity = useTransform(positionProgress, [0.02, 0.08], [1, 0]);

  // Minimized search content (Pulse Lottie + text below) fades in as prompt fades out
  const minimizedSearchOpacity = useTransform(positionProgress, [0.04, 0.12], [0, 1]);

  // Moving gradient border around landing search bar edges (vibrant 0.65 on white, 0.25 on dark, fades smoothly on scroll compress)
  const landingBorderOpacity = searchTheme === "white" ? 0.65 : 0.25;
  const gradientBorderOpacity = useTransform(activeProgress, [0.0, 0.02, 0.10], [landingBorderOpacity, landingBorderOpacity, 0]);

  // ─── Hero entrance ───
  // The composer used to be painted at full strength from the first frame,
  // before the headline above it had resolved — which left it sitting on an
  // otherwise empty hero looking stranded rather than like part of the
  // stack. It now holds off until the headline has read, then rises into
  // its place under it.
  //
  // The hold is most of the headline's own sweep: TextSweepEffect eases
  // hard out of the gate (cubic-bezier 0.2, 0, 0.3, 0.3), so by this point
  // the line has essentially arrived and the rest of its 2.6s is polish —
  // waiting for the literal end of the sweep would leave the hero empty
  // long enough to read as a stall instead of a sequence.
  const ENTRANCE_HOLD_MS = 1100;
  const ENTRANCE_MS = 700;

  // Only the hero instance waits: everything else (the page-level search)
  // has no hero above it to come after.
  const entranceProgress = useMotionValue(hasScroll ? 0 : 1);

  useEffect(() => {
    if (!hasScroll) return;
    // Loaded already scrolled (a refresh mid-page, or a restored position):
    // the headline is not on screen to be waited for, and holding here
    // would mean holding the docked tile back too.
    if (typeof window !== "undefined" && window.scrollY > 40) {
      entranceProgress.set(1);
      return;
    }
    if (prefersReducedMotion) {
      entranceProgress.set(1);
      return;
    }
    const controls = animate(entranceProgress, 1, {
      duration: ENTRANCE_MS / 1000,
      delay: ENTRANCE_HOLD_MS / 1000,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasScroll, prefersReducedMotion]);

  const entranceOpacity = useTransform(entranceProgress, [0, 1], [0, 1]);
  // Rises into place rather than dropping in, so it reads as arriving under
  // the headline rather than falling past it.
  const entranceY = useTransform(entranceProgress, [0, 1], [22, 0]);
  const entranceFilter = useTransform(
    entranceProgress,
    (v) => `blur(${((1 - v) * 10).toFixed(2)}px)`
  );

  // Published for the floating bar, which opens its own third slot against
  // it — the bar grows downward as the composer arrives, so the composer is
  // absorbed into an opening space rather than dissolved on top of a tile
  // that was already sitting there.
  // Published for the floating bar as positionProgress, not raw
  // activeProgress — otherwise the bar's own slot would replay its
  // opening/closing exactly in step with the composer's reverse crawl,
  // which is the animation this is removing.
  useMotionValueEvent(positionProgress, "change", (v) => searchDockProgress.set(v));

  // At the end of merge, morphShellOpacity fades out into the static docked button in FloatingQuickActions
  const morphShellOpacity = useTransform(positionProgress, [0.84, 0.88], [1, 0]);
  // Multiplied, not chosen between: the entrance and the dock own different
  // ends of the same scroll and either one reaching 0 has to win.
  const shellOpacity = useTransform(
    [morphShellOpacity, entranceOpacity] as MotionValue<number>[],
    ([morph, entrance]: number[]) => morph * entrance
  );
  // Declared here because main references it without ever defining it: the
  // mobile quick actions come up exactly as the composer's own chrome goes.
  const fabOpacity = useTransform(activeProgress, [0.84, 0.88], [0, 1]);
  const dockedMobile = isDocked && isMobile;
  const composerOverflow = useTransform(positionProgress, (latest) => (latest > 0.02 ? "hidden" : "visible"));
  const controlsOverflow = useTransform(positionProgress, (latest) => (latest > 0.02 ? "hidden" : "visible"));

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

  // Handle global keyboard Escape to return to landing (or back to results if in pulse)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchState !== "landing") {
        if (searchState === "pulse") {
          setSearchState("results");
        } else {
          handleClose();
        }
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

  // Handle Ask Pulse CTA: Smoothly transitions into the attached Pulse AI window
  const handleAskPulse = () => {
    const q = query && query.trim().length > 0 
      ? query.trim() 
      : "I have chest pain and need clinical guidance";
    setPulseInitialQuery(q);
    setSearchState("pulse");
  };

  // Back from Pulse to Results stage (preserves search query, location, and doctor matches)
  const handleBackToResults = () => {
    setSearchState("results");
  };

  // Class mapping based on state:
  const stateClass = 
    searchState === "landing"
      ? styles.stateLanding
      : searchState === "active"
      ? styles.stateActive
      : searchState === "results"
      ? styles.stateResults
      : searchState === "pulse"
      ? styles.statePulse
      : styles.stateResults;

  // Portaled to the body once docked on mobile. The wrapper is fixed, but
  // it renders inside the hero, whose own transform makes it the containing
  // block and bounds its stacking context — so past the hero the docked bar
  // painted at the right coordinates yet behind the following sections.
  const experience = (

    <div 
      className={`${styles.searchExperienceWrapper} ${searchTheme === "white" ? styles.themeWhite : styles.themeDark}`} 
      data-search-theme={searchTheme}
      ref={containerRef}
      style={
        hasScroll
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: searchState === "landing" ? "none" : "auto",
              zIndex: 9990,
            }
          : undefined
      }
    >
      {/* Landing / Hero search composer (morphs to floating dock on scroll) */}
      <motion.div
        layout
        className={`${styles.searchShell} ${styles.stateLanding} ${isMorphing ? styles.searchShellMorphing : ""} ${styles.themeDark}`}
        data-search-theme="dark"
        onClick={() => {
          handleActivate();
        }}
        style={
          hasScroll && searchState === "landing"
            ? {
                position: "fixed",
                // Mobile docks to a full-width bar along the bottom rather
                // than to the desktop's corner: below 900px the floating
                // quick-actions bar is display:none, so this IS that bar.
                top: dockedMobile ? "auto" : composerTop,
                bottom: dockedMobile ? "max(16px, env(safe-area-inset-bottom))" : "auto",
                left: dockedMobile ? "16px" : composerLeft,
                right: dockedMobile ? "auto" : "auto",
                width: dockedMobile ? "calc(100vw - 32px)" : composerWidth,
                height: dockedMobile ? "80px" : composerHeight,
                borderRadius: composerRadius,
                scaleX: dropletScaleX,
                scaleY: dropletScaleY,
                paddingLeft: composerPaddingX,
                paddingRight: composerPaddingX,
                paddingTop: composerPaddingY,
                paddingBottom: composerPaddingY,
                // The docked desktop shell dissolves into the bar beside
                // it; the docked mobile shell is the bar, so it stays.
                opacity: dockedMobile ? 1 : shellOpacity,
                y: entranceY,
                filter: entranceFilter,
                maxWidth: "none",
                minWidth: 0,
                minHeight: 0,
                transition: "none",
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                boxSizing: "border-box",
                zIndex: 9990,
                pointerEvents: isDocked && !dockedMobile ? "none" : "auto",
                overflow: composerOverflow,
                cursor: dockedMobile ? "default" : "pointer",
                background: "transparent",
                border: "none",
                boxShadow: "none",
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
                  <Lottie animationData={calendarCheckAnimation} loop={false} autoplay style={{ width: 26, height: 26 }} aria-hidden />
                </span>
                <span>Book<br/>Appointment</span>
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
              <div className={styles.fabDivider} aria-hidden="true" />
              <a className={styles.fabLink} href="#app-download-banner" onClick={(e) => e.stopPropagation()}>
                <span className={styles.fabIconWrap}>
                  <Lottie animationData={nhAppIconAnimation} loop={false} autoplay style={{ width: 22, height: 22 }} aria-hidden />
                </span>
                <span>Download<br/>NH Care App</span>
              </a>
            </motion.div>
          </>
        )}

        <DefaultSearchPrompt
          onActivate={handleActivate}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onSelectActionPill={handleSelectActionPill}
          onOpenPulse={() => handleOpenPulse()}
          searchTheme="dark"
          promptOpacity={hasScroll ? promptOpacity : undefined}
          minimizedSearchOpacity={hasScroll ? minimizedSearchOpacity : undefined}
          textColor={hasScroll ? textColor : undefined}
          controlsOpacity={hasScroll ? controlsOpacity : undefined}
          controlsHeight={hasScroll ? controlsHeight : undefined}
          controlsMarginBottom={hasScroll ? controlsMarginBottom : undefined}
          controlsOverflow={hasScroll ? controlsOverflow : undefined}
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
            paddingTop: (searchState === "results" || searchState === "skeleton" || searchState === "pulse")
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
              background: searchTheme === "white" 
                ? "rgba(255, 255, 255, 0.52)" 
                : "rgba(5, 10, 18, 0.50)",
              backdropFilter: searchTheme === "white" 
                ? "blur(20px) saturate(140%)" 
                : "blur(14px)",
              WebkitBackdropFilter: searchTheme === "white" 
                ? "blur(20px) saturate(140%)" 
                : "blur(14px)",
              zIndex: 1,
              touchAction: "none",
            }}
          />

          {/* Modal Wrapper holding the Card and its Ambient Glow Around Effect */}
          <div
            className={styles.modalWithAmbientWrap}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              width: Math.min(
                (searchState === "results" || searchState === "skeleton") 
                  ? 1080 
                  : searchState === "pulse" 
                  ? 1000 
                  : 880, 
                winSize.w - 32
              ),
              maxHeight: (searchState === "results" || searchState === "skeleton" || searchState === "pulse") ? "92vh" : "85vh",
              zIndex: 2,
            }}
          >
            {/* ── Soft Feathered Random Diffused Motion Glow Behind Card ── */}
            <div className={`${styles.cardFeatheredGlowWrap} ${searchTheme === "white" ? styles.featherWhite : styles.featherDark}`} aria-hidden="true">
              <div className={styles.featherMeshWash} />
              <div className={`${styles.featherLobe} ${styles.featherLobeCyan}`} />
              <div className={`${styles.featherLobe} ${styles.featherLobePurple}`} />
              <div className={`${styles.featherLobe} ${styles.featherLobeBlue}`} />
              <div className={`${styles.featherLobe} ${styles.featherLobePink}`} />
            </div>
            <motion.div
              layout
              id="nh-active-search-modal"
              className={`${styles.searchShell} ${stateClass} ${searchTheme === "white" ? styles.themeWhite : styles.themeDark}`}
              data-search-theme={searchTheme}
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                maxHeight: (searchState === "results" || searchState === "skeleton" || searchState === "pulse") ? "92vh" : "85vh",
                height: searchState === "pulse" ? "min(760px, 88vh)" : undefined,
                overflowY: searchState === "pulse" ? "hidden" : "auto",
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
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                    onSelectSpecialtyTag={handleSelectSpecialtyTag}
                    onAskPulse={handleAskPulse}
                  />
                </motion.div>
              )}

              {searchState === "pulse" && (
                <motion.div
                  key="pulse"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <PulseAIView
                    query={pulseInitialQuery || query}
                    selectedLocation={selectedLocation}
                    doctors={resultsData.doctors}
                    onBack={handleBackToResults}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
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
    </div>
  );

  return dockedMobile && mounted ? createPortal(experience, document.body) : experience;
}
