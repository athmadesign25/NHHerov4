"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { bannerCollapse } from "@/components/marketing/MarketingDrawer/bannerCollapse";
import AnnouncementIcon from "@/components/marketing/MarketingDrawer/AnnouncementIcon";
import { duration, ease } from "@/lib/motion";
import { searchDockProgress } from "./dockProgress";
import { createPortal } from "react-dom";
import { animate, motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import { Search, X, CalendarCheck, Activity, HeartPulse, Mic, Sparkles } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import ActiveSearchCanvas from "./ActiveSearchCanvas";
import SearchResultsCanvas from "./SearchResultsCanvas";
import SkeletonResultsCanvas from "./SkeletonResultsCanvas";
import PulseAIView from "./PulseAIView";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";
import AnimatedGradientWaves from "./AnimatedGradientWaves";
import { 
  getSearchResults, 
  SearchResultsData, 
  CARDIOLOGY_RESULTS,
  countWords,
  enforceWordLimit,
  MAX_SEARCH_WORDS
} from "./searchData";
import { analyzePulseIntent } from "./pulseClinicalEngine";
import { playFemaleEmpatheticVoice } from "./voiceSynthesizer";

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

  // Search Experience Theme: "white" (primary Figma experience)
  const [searchTheme, setSearchTheme] = useState<"dark" | "white">("white");

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-search-theme", "white");
    }
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

  const isMobile = winSize.w <= 900;
  const router = useRouter();
  const pathname = usePathname();

  // Floating search / Pulse AI modal state (when triggered from docked control in fold 2+)
  const [isDocked, setIsDocked] = useState(false);
  const [isPulseWorkspaceOpen, setIsPulseWorkspaceOpen] = useState(false);
  const [pulseInitialQuery, setPulseInitialQuery] = useState("");
  const bannerBubble =
    useSyncExternalStore(
      bannerCollapse.subscribe,
      bannerCollapse.get,
      bannerCollapse.getServerSnapshot,
    ) === "island" && pathname === "/L1banner";

  // Motion values for continuous morphing
  const hasScroll = Boolean(scrollProgress);
  const defaultProgress = useMotionValue(0);
  const baseProgress = scrollProgress || defaultProgress;

  // Accelerate the scroll animation on mobile so it completes in 40% of the normal distance
  // This makes the transition to bottom island feel much cleaner and more responsive
  const fastMobileProgress = useTransform(baseProgress, [0, 0.4], [0, 1]);
  const naturalProgress = isMobile ? fastMobileProgress : baseProgress;
  const announcementDockProgress = useMotionValue(0);
  // An announcement closes into the real island even at the top of the hero.
  // Scroll resumes control when L3 is restored.
  useEffect(() => {
    const animation = animate(announcementDockProgress, bannerBubble ? 1 : 0, {
      duration: prefersReducedMotion ? 0 : duration.slowest, ease: ease.out,
    });
    return () => animation.stop();
  }, [announcementDockProgress, bannerBubble, prefersReducedMotion]);
  const activeProgress = useTransform([naturalProgress, announcementDockProgress], ([scroll, announcement]) => Math.max(Number(scroll), Number(announcement)));

  // Starting dimensions (Hero anchor)
  const isPhone = winSize.w <= 640;
  const startWidth = isMobile ? Math.min(winSize.w - 32, 600) : (anchorRect?.width || Math.min(840, winSize.w - 48));
  const startHeight = isMobile ? 96 : (anchorRect ? Math.max(132, anchorRect.height) : 132);
  const startTop = isMobile 
    ? (winSize.h > 0 ? winSize.h - 116 - startHeight : 420)
    : (anchorRect ? anchorRect.top : (winSize.h > 0 ? winSize.h / 2 - 72 : 300));
  const startLeft = isMobile ? Math.round((winSize.w - startWidth) / 2) : (anchorRect?.left || Math.round((winSize.w - startWidth) / 2));

  // Apple Spotlight Bottom Floating Island Dimensions
  const bubbleGap = isPhone ? 8 : 10;
  const bubbleWidth1 = isMobile ? 65 : 46;
  const bubbleWidth2 = isMobile ? 65 : 46;
  const bubbleWidth3 = 46;
  const bubblesCount = bannerBubble ? 3 : 2;
  const bubblesTotalWidth = bubbleWidth1 + bubbleWidth2 + (bannerBubble ? bubbleWidth3 : 0) + bubbleGap * (bubblesCount - 1);
  
  const spotlightWidth = isMobile 
    ? Math.max(96, Math.min(192, winSize.w - 24 - bubblesTotalWidth - bubbleGap))
    : 360;
  const spotlightHeight = isPhone ? 46 : 46;
  const islandTotalWidth = spotlightWidth + bubbleGap + bubblesTotalWidth;
  const islandLeft = Math.round((winSize.w - islandTotalWidth) / 2);

  // Raised above the bottom edge by the height of the compact search for an elevated floating dock
  const bottomClearance = isMobile ? 32 : 56;
  const targetTop = winSize.h > 0 ? winSize.h - bottomClearance - spotlightHeight : 600;
  const targetLeft = islandLeft;

  // Hero Outside Buttons Dimensions & Starting Coordinates
  const heroBtn1Width = isPhone ? 156 : 180;
  const heroBtn2Width = isPhone ? 188 : 218;
  const heroBtnGap = isPhone ? 8 : 12;
  const heroRowWidth = heroBtn1Width + heroBtnGap + heroBtn2Width;
  const heroRowLeft = Math.round(startLeft + (startWidth - heroRowWidth) / 2);

  const heroBtn1Left = heroRowLeft;
  const heroBtn2Left = heroRowLeft + heroBtn1Width + heroBtnGap;
  const heroBtnTop = startTop + startHeight + 14;
  const heroBtnHeight = isPhone ? 38 : 40;
  const heroBtnRadius = 12;

  // Docked Buttons Target Coordinates (flanking the Spotlight pill at the bottom dock)
  const dockBtn1Left = targetLeft + spotlightWidth + bubbleGap;
  const dockBtn2Left = dockBtn1Left + bubbleWidth1 + bubbleGap;
  const dockBtn3Left = dockBtn2Left + bubbleWidth2 + bubbleGap;

  const [isMorphing, setIsMorphing] = useState(false);

  useMotionValueEvent(activeProgress, "change", (latest) => {
    searchDockProgress.set(latest);
    setIsMorphing(latest > 0.02 && latest < 0.35);
    const docked = latest >= 0.22;
    setIsDocked(docked);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:search-docked", { detail: { isDocked: docked } }));
    }
  });

  // ── 3-Stage Choreography: Center Down -> Minimize Length -> Water-Drop Bubbles ──
  // Stage 1 (0.02 -> 0.14): Take search bar center down & round into pill
  // Stage 2 (0.14 -> 0.24): Minimize length/width & shift to left dock position
  // Stage 3 (0.22 -> 0.34): Out of the search bar, bubbles pop out like water droplets

  // Stage 1: Glides straight down to bottom center & rounds into compact pill
  const composerTop = useTransform(activeProgress, [0.02, 0.14], [startTop, targetTop]);
  const composerHeight = useTransform(activeProgress, [0.02, 0.14], [startHeight, spotlightHeight]);
  const composerRadius = useTransform(activeProgress, [0.02, 0.14], [20, 9999]);
  const composerPaddingTop = useTransform(activeProgress, [0.02, 0.14], [isMobile ? 12 : 18, 0]);
  const composerPaddingBottom = useTransform(activeProgress, [0.02, 0.14], [isMobile ? 10 : 12, 0]);

  // Stage 2: Stays centered wide during Stage 1 (0.02 -> 0.14), then minimizes width & glides left in Stage 2 (0.14 -> 0.24)
  const composerLeft = useTransform(activeProgress, [0.02, 0.14, 0.24], [startLeft, startLeft, targetLeft]);
  const composerWidth = useTransform(activeProgress, [0.02, 0.14, 0.24], [startWidth, startWidth, spotlightWidth]);
  const composerPaddingX = useTransform(activeProgress, [0.02, 0.14, 0.24], [isMobile ? 14 : 22, isMobile ? 14 : 22, isMobile ? 10 : 14]);

  // Inside content immediately blurs & dissolves on initial scroll before shape morphs
  // Eliminates all cluttered text/buttons during transition ("kachra inside transition")
  const promptOpacity = useTransform(activeProgress, [0.005, 0.032], [1, 0]);
  const promptBlur = useTransform(activeProgress, [0.005, 0.032], ["blur(0px)", "blur(12px)"]);
  const spotlightOpacity = useTransform(activeProgress, [0.08, 0.16], [0, 1]);

  // Stage 3: WATER DROP BUBBLE EJECTION
  // Starts ONLY after search bar has minimized its length at targetLeft
  // Origin: emerging right from the right edge of the minimized search bar
  const bubbleOrigin = targetLeft + spotlightWidth - 10;

  // Water-Bubble 1 (Book Appointment): Ejects out of right edge of minimized search pill
  const btn1Top = useTransform(activeProgress, [0.22, 0.28], [targetTop, targetTop]);
  const btn1Left = useTransform(activeProgress, [0.22, 0.28], [bubbleOrigin, dockBtn1Left]);
  const btn1Opacity = useTransform(activeProgress, [0.22, 0.24], [0, 1]);
  const btn1Scale = useTransform(activeProgress, [0.22, 0.26, 0.29], [0, 1.08, 1.0]);

  // Water-Bubble 2 (Book Tests & Checkups): Ejects in synchronized wave behind Bubble 1
  const btn2Top = useTransform(activeProgress, [0.25, 0.31], [targetTop, targetTop]);
  const btn2Left = useTransform(activeProgress, [0.25, 0.31], [bubbleOrigin, dockBtn2Left]);
  const btn2Opacity = useTransform(activeProgress, [0.25, 0.27], [0, 1]);
  const btn2Scale = useTransform(activeProgress, [0.25, 0.29, 0.32], [0, 1.08, 1.0]);

  // Water-Bubble 3 (QR Code App Download): Ejects next to Bubble 2 (desktop only)

  // Secondary buttons and prompt cross-fades
  const controlsOpacity = useTransform(activeProgress, [0.02, 0.08], [1, 0]);
  const controlsHeight = useTransform(activeProgress, [0.02, 0.10], ["36px", "0px"]);
  const controlsMarginBottom = useTransform(activeProgress, [0.02, 0.10], [isMobile ? "6px" : "18px", "0px"]);

  // Moving gradient border around landing search bar edges
  const landingBorderOpacity = searchTheme === "white" ? 0.75 : 0.95;
  const gradientBorderOpacity = useTransform(activeProgress, [0.0, 0.10, 0.24], [landingBorderOpacity, 0.50, 0.18]);

  // Translucent dark glass for default landing prompt, smoothly deepening as it docks into the bottom pill
  const composerBg = useTransform(
    activeProgress,
    [0.0, 0.12, 0.24],
    [
      "rgba(22, 28, 36, 0.28)",
      "rgba(22, 28, 36, 0.36)",
      "rgba(20, 26, 36, 0.46)"
    ]
  );

  // Section-aware contextual placeholder for docked Spotlight Search
  const [dockedPlaceholder, setDockedPlaceholder] = useState(isMobile ? "Search doctors, tests..." : "Search doctors, symptoms, packages...");

  // Section theme detection: probes what section is directly underneath the docked island
  const [isDockOverDark, setIsDockOverDark] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleSectionScroll = () => {
      if (typeof window === "undefined") return;
      const vh = window.innerHeight;

      const coeEl = document.getElementById("centre-of-excellence") || document.querySelector('[class*="gridSection"]');
      const healthEl = document.getElementById("health-packages");
      const whyEl = document.getElementById("WhyChooseNH_section");

      const isElementInView = (el: Element | null) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= vh * 0.65 && rect.bottom >= vh * 0.25;
      };

      if (isElementInView(whyEl)) {
        setDockedPlaceholder(isMobile ? "Hospitals & care..." : "Search hospitals & network...");
      } else if (isElementInView(healthEl)) {
        setDockedPlaceholder(isMobile ? "Checkups & tests..." : "Search health checkups & tests...");
      } else if (isElementInView(coeEl)) {
        setDockedPlaceholder(isMobile ? "Specialities..." : "Search by speciality...");
      } else {
        setDockedPlaceholder(isMobile ? "Search doctors, tests..." : "Search doctors, symptoms, packages...");
      }

      // Sample theme at the exact center of the docked floating island
      const probeX = Math.round(window.innerWidth / 2);
      const probeY = Math.round(window.innerHeight - (isMobile ? 32 : 56) - 23);
      const elements = document.elementsFromPoint(probeX, probeY);
      let detectedTheme = "light";

      for (const el of elements) {
        if (el.closest(`.${styles.searchExperienceWrapper}`) || el.closest("nav")) continue;
        const themeEl = el.closest("[data-nav-theme]");
        if (themeEl) {
          detectedTheme = themeEl.getAttribute("data-nav-theme") || "light";
          break;
        }
      }

      setIsDockOverDark(detectedTheme === "dark");
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        handleSectionScroll();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleSectionScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const morphShellOpacity = useTransform(activeProgress, [0.84, 0.88], [1, 1]);
  const composerOverflow = useTransform(activeProgress, (latest) => (latest > 0.02 ? "hidden" : "visible"));
  const controlsOverflow = useTransform(activeProgress, (latest) => (latest > 0.02 ? "hidden" : "visible"));

  // Primary search state
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [activePill, setActivePill] = useState<"doctor" | "symptoms" | null>(null);
  const [attachedReportFile, setAttachedReportFile] = useState<{ name: string; size?: number } | null>(null);

  // Suggestions & Results
  const [resultsData, setResultsData] = useState<SearchResultsData>(CARDIOLOGY_RESULTS);

  const containerRef = useRef<HTMLDivElement>(null);
  const landingShellRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const [originRect, setOriginRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const captureOrigin = () => {
    if (landingShellRef.current) {
      const rect = landingShellRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setOriginRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  };

  // Activate search (Landing → Active)
  const handleActivate = (customScroll?: number) => {
    captureOrigin();
    const currentScroll = typeof customScroll === "number"
      ? customScroll
      : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
    savedScrollY.current = currentScroll;
    setQuery(""); // Always show active empty search state when launched
    setActivePill(null);
    setSearchState("active");
    onOpenChange?.(true);
  };

  // Exit animation mode: 'collapse' (drops back down to hero search box on manual dismiss) vs 'expand' (expands forward into page upon clicking a result)
  const [exitMode, setExitMode] = useState<"collapse" | "expand">("collapse");

  // Close search manually (Active/Results → Landing via X or backdrop click)
  const handleClose = () => {
    setExitMode("collapse");
    setSearchState("landing");
    setActivePill(null);
    onOpenChange?.(false);
  };

  // Navigate forward to a clinical destination (procedure, library, doctor) with an expanding forward transition
  const handleNavigateOut = (targetHref: string) => {
    setExitMode("expand");
    setSearchState("landing");
    onOpenChange?.(false);
    setTimeout(() => {
      router.push(targetHref);
    }, 200);
  };

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

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // Prevent background scrolling only when interacting outside the active modal (e.g. on backdrop)
      const preventBackdropScroll = (e: WheelEvent | TouchEvent) => {
        const target = e.target as HTMLElement | null;
        const modalEl = document.getElementById("nh-active-search-modal");

        // If event is inside the search modal, never intercept or block it
        if (modalEl && (modalEl === target || modalEl.contains(target))) {
          return;
        }

        // Outside modal (backdrop or background) — prevent background leakage
        if (e.cancelable) {
          e.preventDefault();
        }
      };

      const preventScrollKeys = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        // If inside modal, allow space, PageUp, PageDown, arrow keys for scrolling
        const modalEl = document.getElementById("nh-active-search-modal");
        if (modalEl && modalEl.contains(target)) return;

        if ([" ", "PageUp", "PageDown", "End", "Home"].includes(e.key)) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventBackdropScroll, { passive: false });
      window.addEventListener("touchmove", preventBackdropScroll, { passive: false });
      window.addEventListener("keydown", preventScrollKeys, { passive: false });

      return () => {
        // Restore document styles
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;

        // Remove event listeners
        window.removeEventListener("wheel", preventBackdropScroll);
        window.removeEventListener("touchmove", preventBackdropScroll);
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

  // Handle Query typing (enforces max 500 words limit)
  const handleQueryChange = useCallback((newQuery: string) => {
    const words = countWords(newQuery);
    if (words > MAX_SEARCH_WORDS) {
      setQuery(enforceWordLimit(newQuery, MAX_SEARCH_WORDS));
    } else {
      setQuery(newQuery);
    }

    if (!newQuery.trim()) {
      setActivePill(null);
    } else {
      setActivePill((currentPill) => {
        if (!currentPill) return null;
        const lower = newQuery.toLowerCase().trim();
        if (currentPill === "doctor" && !lower.startsWith("find a doctor")) {
          return null;
        }
        if (
          currentPill === "symptoms" &&
          !lower.startsWith("i have chest pain") &&
          !lower.startsWith("book health checkup") &&
          !lower.startsWith("describe my symptom")
        ) {
          return null;
        }
        return currentPill;
      });
    }
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

  // Submit query (Active → Skeleton Loading → Results)
  const handleSubmit = async (searchQuery: string) => {
    const targetQuery = enforceWordLimit(searchQuery.trim() || "I have chest pain and need a doctor", MAX_SEARCH_WORDS);
    setQuery(targetQuery);
    setActivePill(null);
    
    // Step 1: Transition to Pulse AI clinical intelligence analyzing state
    setSearchState("skeleton");
    
    // Step 2: AI clinical intelligence matching delay (1100ms)
    const [results] = await Promise.all([
      getSearchResults(targetQuery, selectedLocation),
      new Promise((resolve) => setTimeout(resolve, 1100)),
    ]);

    // Step 3: Smoothly reveal final results
    setResultsData(results);
    setSearchState("results");
  };

  // Voice Submit: Triggers analyzing screen, speaks "Getting you the right care" female voice, then populates results
  const handleVoiceSubmit = async (transcript: string) => {
    captureOrigin();
    const currentScroll = typeof window !== "undefined"
      ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0)
      : 0;
    savedScrollY.current = currentScroll;

    const rawQuery = transcript.trim() || "I have chest pain and shortness of breath since morning";
    const targetQuery = enforceWordLimit(rawQuery, MAX_SEARCH_WORDS);
    setQuery(targetQuery);
    setPulseInitialQuery(targetQuery);
    setActivePill(null);

    // Step 1: Transition into analyzing screen
    setSearchState("skeleton");
    onOpenChange?.(true);

    // Step 2: Speak warm female empathetic audio voice: "Getting you the right care"
    playFemaleEmpatheticVoice("Getting you the right care");

    // Step 3: Concurrently fetch matching doctors and hold analyzing screen until voice audio completes (~1900ms)
    try {
      const triage = analyzePulseIntent(targetQuery, [], selectedLocation);
      const [matchedResults] = await Promise.all([
        getSearchResults(triage.searchQueryForApi || targetQuery, selectedLocation),
        new Promise((resolve) => setTimeout(resolve, 1950)),
      ]);

      if (matchedResults && matchedResults.doctors.length > 0) {
        setResultsData(matchedResults);
      }
    } catch (e) {
      console.warn("Failed fetching voice matching results:", e);
    }

    // Step 4: After voice output finishes, populate the results!
    setSearchState("pulse");
  };

  // Document Submit: Directly opens Pulse AI to understand and explain attached health report
  const handleDocumentSubmit = async (file: { name: string; size?: number }, prompt: string) => {
    captureOrigin();
    const currentScroll = typeof window !== "undefined"
      ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0)
      : 0;
    savedScrollY.current = currentScroll;

    const targetQuery = prompt || "Understand my health report";
    setQuery(targetQuery);
    setPulseInitialQuery(targetQuery);
    setAttachedReportFile(file);
    setActivePill(null);

    try {
      const triage = analyzePulseIntent(targetQuery, [], selectedLocation);
      const matchedResults = await getSearchResults(triage.searchQueryForApi || targetQuery, selectedLocation);
      if (matchedResults && matchedResults.doctors.length > 0) {
        setResultsData(matchedResults);
      }
    } catch (e) {
      console.warn("Failed fetching report matching doctors:", e);
    }

    setSearchState("pulse");
    onOpenChange?.(true);
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

  // Handle quick action pill clicks (toggle on/off)
  const handleSelectActionPill = (pill: "doctor" | "symptoms") => {
    captureOrigin();
    if (activePill === pill) {
      setActivePill(null);
      setQuery("");
      return;
    }
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

  return (
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
        ref={landingShellRef}
        className={`${styles.searchShell} ${styles.stateLanding} ${isMorphing ? styles.searchShellMorphing : ""} ${isDocked ? styles.searchShellDocked : ""} ${isDocked ? (isDockOverDark ? styles.dockThemeDark : styles.dockThemeLight) : ""} ${styles.themeDark}`}
        data-search-theme="dark"
        data-dock-theme={isDocked ? (isDockOverDark ? "dark" : "light") : undefined}
        onClick={() => {
          if (hasScroll) {
            handleActivate();
          }
        }}
        style={
          searchState !== "landing"
            ? {
                visibility: "hidden",
                pointerEvents: "none",
                opacity: 0,
              }
            : hasScroll
            ? {
                position: "fixed",
                top: composerTop,
                left: composerLeft,
                width: composerWidth,
                height: composerHeight,
                borderRadius: composerRadius,
                paddingLeft: composerPaddingX,
                paddingRight: composerPaddingX,
                paddingTop: composerPaddingTop,
                paddingBottom: composerPaddingBottom,
                opacity: isMobile ? 1 : morphShellOpacity,
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
                pointerEvents: "auto",
                overflow: composerOverflow,
                cursor: "pointer",
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }
            : undefined
        }
        transition={{
          duration: prefersReducedMotion ? 0.1 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Layer 1: Dark glass background layer for composer & docked spotlight pill */}
        {hasScroll && searchState === "landing" && (
          <motion.div
            aria-hidden="true"
            className={`${styles.dockedGlassLayer} ${isDocked ? (isDockOverDark ? styles.dockGlassDark : styles.dockGlassLight) : ""}`}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background: !isDocked ? composerBg : undefined,
              backdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              WebkitBackdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              border: !isDocked ? "1px solid rgba(255, 255, 255, 0.14)" : undefined,
              boxShadow: !isDocked ? "0 12px 32px -8px rgba(0, 0, 0, 0.24), inset 0 1px 1.5px rgba(255, 255, 255, 0.14)" : undefined,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {/* Animated Motion Gradient Border Outline */}
        {hasScroll && searchState === "landing" && (
          <motion.div
            className={styles.animatedBorderOutline}
            style={{
              opacity: gradientBorderOpacity,
            }}
            aria-hidden="true"
          />
        )}

        {/* Apple Spotlight Content (fades in as search morphs into bottom pill) */}
        {hasScroll && searchState === "landing" && (
          <motion.div 
            className={styles.spotlightContent}
            style={{ 
              position: "absolute",
              inset: 0,
              opacity: spotlightOpacity, 
              pointerEvents: isDocked ? "auto" : "none",
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleActivate();
            }}
          >
            <div className={styles.spotlightLeft}>
              <div className={styles.spotlightIconWrapper}>
                <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
                  <defs>
                    <linearGradient id="nhSearchPillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00C4FF" />
                      <stop offset="35%" stopColor="#8B5CF6" />
                      <stop offset="70%" stopColor="#FF2E93" />
                      <stop offset="100%" stopColor="#ED1C24" />
                    </linearGradient>
                  </defs>
                </svg>
                <Search size={17} className={styles.spotlightSearchIcon} strokeWidth={2.0} />
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={dockedPlaceholder}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={styles.spotlightPlaceholder}
                >
                  {dockedPlaceholder}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <DefaultSearchPrompt
          onActivate={handleActivate}
          onVoiceSubmit={handleVoiceSubmit}
          onDocumentSubmit={handleDocumentSubmit}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onSelectActionPill={handleSelectActionPill}
          onOpenPulse={() => handleOpenPulse()}
          searchTheme="dark"
          isMobile={isMobile}
          promptOpacity={hasScroll ? promptOpacity : undefined}
          promptBlur={hasScroll ? promptBlur : undefined}
          controlsOpacity={hasScroll ? controlsOpacity : undefined}
          controlsHeight={hasScroll ? controlsHeight : undefined}
          controlsMarginBottom={hasScroll ? controlsMarginBottom : undefined}
          controlsOverflow={hasScroll ? controlsOverflow : undefined}
        />
      </motion.div>

      {/* ── Unified Morphing Action Buttons (Hero Pill Buttons -> Docked Circular Bubbles) ── */}
      {hasScroll && searchState === "landing" && (
        <>
          {/* Water-Bubble 1: Book Appointment -> Ejects out into Docked Bubble 1 */}
          <motion.button
            type="button"
            className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""} ${isDocked ? (isDockOverDark ? styles.dockBtnDark : styles.dockBtnLight) : ""}`}
            style={{
              position: "fixed",
              top: btn1Top,
              left: btn1Left,
              width: bubbleWidth1,
              height: spotlightHeight,
              borderRadius: isMobile ? 14 : 9999,
              opacity: btn1Opacity,
              scale: btn1Scale,
              background: !isDocked ? composerBg : undefined,
              backdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              WebkitBackdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              border: !isDocked ? "1px solid rgba(255, 255, 255, 0.14)" : undefined,
              boxShadow: !isDocked ? "0 12px 32px -8px rgba(0, 0, 0, 0.24), inset 0 1px 1.5px rgba(255, 255, 255, 0.14)" : undefined,
              pointerEvents: isDocked ? "auto" : "none",
              zIndex: 9990,
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/doctors");
            }}
            aria-label="Book Appointment"
          >
            <div className={styles.morphingActionIcon}>
              <CalendarCheck size={18} strokeWidth={1.8} />
            </div>
            {isMobile ? (
              <span className={styles.dockedBtnText}>Book Appt</span>
            ) : (
              <span className={styles.bubbleTooltip}>Book Appointment</span>
            )}
          </motion.button>

          {/* Water-Bubble 2: Book Tests & Checkups -> Ejects out into Docked Bubble 2 */}
          <motion.button
            type="button"
            className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""} ${isDocked ? (isDockOverDark ? styles.dockBtnDark : styles.dockBtnLight) : ""}`}
            style={{
              position: "fixed",
              top: btn2Top,
              left: btn2Left,
              width: bubbleWidth2,
              height: spotlightHeight,
              borderRadius: isMobile ? 14 : 9999,
              opacity: btn2Opacity,
              scale: btn2Scale,
              background: !isDocked ? composerBg : undefined,
              backdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              WebkitBackdropFilter: !isDocked ? "blur(24px) saturate(140%)" : undefined,
              border: !isDocked ? "1px solid rgba(255, 255, 255, 0.14)" : undefined,
              boxShadow: !isDocked ? "0 12px 32px -8px rgba(0, 0, 0, 0.24), inset 0 1px 1.5px rgba(255, 255, 255, 0.14)" : undefined,
              pointerEvents: isDocked ? "auto" : "none",
              zIndex: 9990,
            }}
            onClick={(e) => {
              e.stopPropagation();
              captureOrigin();
              setActivePill("symptoms");
              setSearchState("active");
              setQuery("Book health checkup and lab tests");
            }}
            aria-label="Book Health Checkups"
          >
            <div className={styles.morphingActionIcon}>
              <HeartPulse size={18} strokeWidth={2} />
            </div>
            {isMobile ? (
              <span className={styles.dockedBtnText}>Checkups</span>
            ) : (
              <span className={styles.bubbleTooltip}>Book Health Checkups</span>
            )}
          </motion.button>

          {/* Water-Bubble 4: a collapsed marketing banner. Present only
              while a banner has something to come back to, so the dock is
              three bubbles wide the rest of the time. It re-opens the
              banner through the same global hook the bar used. */}
          {bannerBubble && (
            <motion.button
              type="button"
              data-banner-bubble
              className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""}`}
              style={{
                position: "fixed",
                top: targetTop,
                left: dockBtn3Left,
                width: bubbleWidth3,
                height: spotlightHeight,
                borderRadius: 9999,
                opacity: 1,
                scale: 1,
                pointerEvents: "auto",
                zIndex: 9990,
              }}
              onClick={(e) => {
                e.stopPropagation();
                (window as unknown as { __reopenBanner?: () => void }).__reopenBanner?.();
              }}
              aria-label="Announcements, 3 unread"
            >
              <motion.div className={styles.morphingActionIcon} initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: prefersReducedMotion ? 0 : duration.slow, duration: prefersReducedMotion ? 0 : duration.slow, ease: ease.out }}>
                <AnnouncementIcon size={19} />
              </motion.div>
              <motion.span className={styles.announcementCount} initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: prefersReducedMotion ? 0 : duration.slowest, duration: prefersReducedMotion ? 0 : duration.base, ease: ease.spring }} aria-hidden="true">3</motion.span>
              <span className={styles.bubbleTooltip}>3 announcements</span>
            </motion.button>
          )}
        </>
      )}

      {/* Mobile-Only Balanced Quick Actions (Directly beneath search box on landing) */}
      {isMobile && searchState === "landing" && (
        <motion.div
          className={styles.mwebHeroActionsRow}
          style={{
            position: "fixed",
            top: startTop + startHeight + 12,
            left: startLeft,
            width: startWidth,
            opacity: controlsOpacity,
            pointerEvents: isDocked || isMorphing ? "none" : "auto",
            zIndex: 9980,
          }}
        >
          <button
            type="button"
            className={styles.mwebHeroActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/doctors");
            }}
          >
            <CalendarCheck size={14} className={styles.mwebHeroActionIcon} strokeWidth={1.8} />
            <span>Book Appointment</span>
          </button>
          <button
            type="button"
            className={styles.mwebHeroActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              captureOrigin();
              setActivePill("symptoms");
              setSearchState("active");
              setQuery("Book health checkup and lab tests");
            }}
          >
            <HeartPulse size={14} className={styles.mwebHeroActionIcon} strokeWidth={2} />
            <span>Health Checkups</span>
          </button>
        </motion.div>
      )}

      {/* Viewport-level Active Search Modal Overlay (Portaled directly to document.body) */}
      {/* Operates at the true viewport level anywhere on the page without hero-anchored transforms */}
      {mounted && createPortal(
        <AnimatePresence>
          {searchState !== "landing" && (() => {
            const isPhone = winSize.w <= 640;
            const isCompactModal = searchState === "results" || searchState === "skeleton" || searchState === "pulse";
            const modalTargetTop = typeof window !== "undefined"
              ? (isPhone 
                  ? (isCompactModal ? 10 : 16)
                  : (isCompactModal ? Math.max(16, window.innerHeight * 0.02) : Math.max(60, window.innerHeight * 0.12)))
              : 100;
            const modalTargetWidth = typeof window !== "undefined"
              ? (isPhone
                  ? Math.min(600, winSize.w - 16)
                  : Math.min(
                      searchState === "pulse" ? 1040 : (searchState === "results" || searchState === "skeleton") ? 1120 : 880,
                      winSize.w - 32
                    ))
              : 880;

            const originDeltaY = originRect ? Math.round(originRect.top - modalTargetTop) : 0;
            const originScale = originRect && modalTargetWidth > 0
              ? Math.min(1, Math.max(0.86, originRect.width / modalTargetWidth))
              : 0.96;

            return (
              <div
                id="nh-search-overlay-root"
                key="nh-search-overlay-root"
                data-lenis-prevent="true"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: isPhone
                    ? (isCompactModal ? "8px" : "16px")
                    : (isCompactModal ? "max(14px, 2vh)" : "max(60px, 12vh)"),
                  paddingBottom: isPhone ? "8px" : "18px",
                  paddingLeft: isPhone ? "8px" : "16px",
                  paddingRight: isPhone ? "8px" : "16px",
                  boxSizing: "border-box",
                  pointerEvents: "auto",
                }}
              >
                {/* Backdrop with translucent blur and stationary background freeze (40% white overlay with blur on freeze screen) */}
                <motion.div
                  key="search-backdrop"
                  data-backdrop="true"
                  data-lenis-prevent="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : (exitMode === "expand" ? 0.25 : 0.32), ease: "easeOut" }}
                  onClick={handleClose}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: searchTheme === "white"
                      ? "rgba(255, 255, 255, 0.40)"
                      : "rgba(5, 10, 18, 0.55)",
                    backdropFilter: searchTheme === "white"
                      ? "blur(12px)"
                      : "blur(14px)",
                    WebkitBackdropFilter: searchTheme === "white"
                      ? "blur(12px)"
                      : "blur(14px)",
                    zIndex: 1,
                    touchAction: "none",
                  }}
                />

                {/* ── Layer 2: Animated Gradient Waves Background (Hidden on white theme to keep 40% translucent frosted freeze screen) ── */}
                {searchTheme !== "white" && (
                  <motion.div
                    key="animated-gradient-waves-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 2,
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                    aria-hidden="true"
                  >
                    <AnimatedGradientWaves
                      colorStops={["#0A25C9", "#7C3AED", "#EC4899"]}
                      amplitude={1.35}
                      blend={0.5}
                      speed={0.85}
                      opacity={0.92}
                    />
                  </motion.div>
                )}

                {/* ── Layer 3: Modal Wrapper holding the Search Viewport (On top of translucent backdrop) ── */}
                <div
                  className={styles.modalWithAmbientWrap}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    width: modalTargetWidth,
                    height: (searchState === "results" || searchState === "skeleton") 
                      ? (isPhone ? "calc(100dvh - 20px)" : "min(920px, 94vh)") 
                      : searchState === "pulse" 
                      ? (isPhone ? "calc(100dvh - 20px)" : "min(920px, 94vh)") 
                      : undefined,
                    maxHeight: isCompactModal ? (isPhone ? "calc(100dvh - 16px)" : "95vh") : (isPhone ? "calc(100dvh - 24px)" : "90vh"),
                    zIndex: 3,
                  }}
                >
                  <motion.div
                    id="nh-active-search-modal"
                    className={`${styles.searchShell} ${stateClass} ${searchTheme === "white" ? styles.themeWhite : styles.themeDark}`}
                    data-search-theme={searchTheme}
                    data-lenis-prevent="true"
                    initial={{
                      opacity: 0.85,
                      y: originDeltaY,
                      scale: originScale,
                      borderRadius: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      borderRadius: isPhone ? 18 : 24,
                    }}
                    exit={
                      exitMode === "expand"
                        ? {
                            opacity: 0,
                            scale: 1.05,
                            y: -14,
                            filter: "blur(6px)",
                          }
                        : {
                            opacity: 0,
                            y: originDeltaY,
                            scale: originScale,
                            borderRadius: 20,
                          }
                    }
                    transition={{
                      duration: prefersReducedMotion ? 0.1 : (exitMode === "expand" ? 0.28 : 0.42),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "100%",
                      height: (searchState === "results" || searchState === "skeleton") 
                        ? (isPhone ? "calc(100dvh - 20px)" : "min(920px, 94vh)") 
                        : searchState === "pulse" 
                        ? (isPhone ? "calc(100dvh - 20px)" : "min(920px, 94vh)") 
                        : undefined,
                      maxHeight: isCompactModal ? (isPhone ? "calc(100dvh - 16px)" : "95vh") : (isPhone ? "calc(100dvh - 24px)" : "90vh"),
                      display: (searchState === "results" || searchState === "skeleton" || searchState === "pulse") ? "flex" : undefined,
                      flexDirection: "column",
                      overflow: "hidden",
                      overscrollBehavior: "contain",
                      margin: 0,
                      boxSizing: "border-box",
                      transformOrigin: "center top",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {searchState === "active" && (
                        <motion.div
                          key="active"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          style={{ width: "100%" }}
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
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            flex: 1,
                          }}
                        >
                          <SkeletonResultsCanvas
                            query={query}
                            selectedLocation={selectedLocation}
                            onClose={handleClose}
                            onSelectLocation={handleSelectLocation}
                          />
                        </motion.div>
                      )}

                      {searchState === "results" && (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            flex: 1,
                          }}
                        >
                          <SearchResultsCanvas
                            query={query || "I have chest pain and need a doctor"}
                            results={resultsData}
                            onEditSearch={handleEditSearch}
                            onSubmit={handleSubmit}
                            onClose={handleClose}
                            onNavigateOut={handleNavigateOut}
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
                          style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", minHeight: 0, flex: 1, overflow: "hidden" }}
                        >
                          <PulseAIView
                            query={pulseInitialQuery || query}
                            selectedLocation={selectedLocation}
                            doctors={resultsData.doctors}
                            onBack={handleBackToResults}
                            onClose={handleClose}
                            onNavigateOut={handleNavigateOut}
                            attachedFile={attachedReportFile}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            );
          })()}
        </AnimatePresence>,
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
}
