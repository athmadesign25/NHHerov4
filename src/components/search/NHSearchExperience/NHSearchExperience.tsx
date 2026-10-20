"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import { Search, X, CalendarCheck, Activity, QrCode, Mic, Sparkles } from "lucide-react";
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

  // Search Experience Theme: "dark" (default) or "white" (simulated Figma experience)
  const [searchTheme, setSearchTheme] = useState<"dark" | "white">("dark");

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

  const isMobile = winSize.w <= 900;
  const router = useRouter();

  // Floating search / Pulse AI modal state (when triggered from docked control in fold 2+)
  const [isDocked, setIsDocked] = useState(false);
  const [isPulseWorkspaceOpen, setIsPulseWorkspaceOpen] = useState(false);
  const [pulseInitialQuery, setPulseInitialQuery] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Close QR code popover when clicking outside
  useEffect(() => {
    if (!isQrOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.qrPopoverCard}`) && !target.closest(`.${styles.morphingActionBtn}`) && !target.closest(`.${styles.islandBubble}`)) {
        setIsQrOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isQrOpen]);

  // Motion values for continuous morphing
  const hasScroll = Boolean(scrollProgress);
  const defaultProgress = useMotionValue(0);
  const baseProgress = scrollProgress || defaultProgress;

  // Accelerate the scroll animation on mobile so it completes in 40% of the normal distance
  // This makes the transition to bottom island feel much cleaner and more responsive
  const fastMobileProgress = useTransform(baseProgress, [0, 0.4], [0, 1]);
  const activeProgress = isMobile ? fastMobileProgress : baseProgress;

  // Starting dimensions (Hero anchor)
  const isPhone = winSize.w <= 640;
  const startWidth = isMobile ? Math.min(winSize.w - 32, 600) : (anchorRect?.width || Math.min(840, winSize.w - 48));
  const startHeight = anchorRect ? (isMobile ? 114 : Math.max(132, anchorRect.height)) : (isMobile ? 114 : 132);
  const startTop = isMobile 
    ? (winSize.h > 0 ? winSize.h - 36 - startHeight : 500)
    : (anchorRect ? anchorRect.top : (winSize.h > 0 ? winSize.h / 2 - 72 : 300));
  const startLeft = isMobile ? Math.round((winSize.w - startWidth) / 2) : (anchorRect?.left || Math.round((winSize.w - startWidth) / 2));

  // Apple Spotlight Bottom Floating Island Dimensions
  const bubbleSize = isPhone ? 46 : 46;
  const bubbleGap = isPhone ? 8 : 10;
  const bubblesCount = 3;
  const bubblesTotalWidth = (bubbleSize * bubblesCount) + (bubbleGap * (bubblesCount - 1));
  
  const spotlightWidth = isMobile 
    ? Math.max(130, Math.min(200, winSize.w - 32 - bubblesTotalWidth - bubbleGap)) 
    : 360;
  const spotlightHeight = isPhone ? 46 : 46;
  const islandTotalWidth = spotlightWidth + bubbleGap + bubblesTotalWidth;
  const islandLeft = Math.round((winSize.w - islandTotalWidth) / 2);

  // Raised above the bottom edge by the height of the compact search for an elevated floating dock
  const bottomClearance = isMobile ? 38 : 56;
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
  const dockBtn2Left = dockBtn1Left + bubbleSize + bubbleGap;
  const dockBtn3Left = dockBtn2Left + bubbleSize + bubbleGap;

  const [isMorphing, setIsMorphing] = useState(false);

  useMotionValueEvent(activeProgress, "change", (latest) => {
    setIsMorphing(latest > 0.02);
    const docked = latest >= 0.08;
    setIsDocked(docked);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:search-docked", { detail: { isDocked: docked } }));
    }
  });

  // Intermediate centered pill width & left position (Stage 1)
  const centerPillWidth = isMobile ? Math.max(240, winSize.w - 32) : 380;
  const centerPillLeft = Math.round((winSize.w - centerPillWidth) / 2);

  // Choreography:
  // Stage 1 (0.02 -> 0.16): Search bar shrinks and glides down to centered position
  // Stage 2 (0.16 -> 0.30): Centered search bar gets pushed to the left, reduces width, and pops out water-drop bubbles to the right
  const composerTop = useTransform(activeProgress, [0.04, 0.18, 0.30], [startTop, targetTop, targetTop]);
  const composerLeft = useTransform(activeProgress, [0.04, 0.16, 0.30], [startLeft, centerPillLeft, targetLeft]);
  const composerWidth = useTransform(activeProgress, [0.02, 0.16, 0.30], [startWidth, centerPillWidth, spotlightWidth]);
  const composerHeight = useTransform(activeProgress, [0.02, 0.16], [startHeight, spotlightHeight]);
  const composerRadius = useTransform(activeProgress, [0.02, 0.16], [20, 9999]);
  const composerPaddingX = useTransform(activeProgress, [0.02, 0.16], [22, 14]);
  const composerPaddingTop = useTransform(activeProgress, [0.02, 0.16], [18, 0]);
  const composerPaddingBottom = useTransform(activeProgress, [0.02, 0.16], [12, 0]);

  // Content cross-fades inside Search Bar
  const promptOpacity = useTransform(activeProgress, [0.02, 0.12], [1, 0]);
  const spotlightOpacity = useTransform(activeProgress, [0.12, 0.22], [0, 1]);

  // 2. WATER-DROP BUBBLE EJECTION (Stage 2: 0.16 -> 0.36):
  // Origin: As search bar shifts left from centerPillLeft, bubbles emerge from its right edge!
  const splitStartLeft = centerPillLeft + centerPillWidth - 10;

  // Water-Bubble 1 (Book Appointment): Ejects out as search pill gets pushed left
  const btn1Top = useTransform(activeProgress, [0.16, 0.28], [targetTop, targetTop]);
  const btn1Left = useTransform(activeProgress, [0.16, 0.28], [splitStartLeft, dockBtn1Left]);
  const btn1Opacity = useTransform(activeProgress, [0.16, 0.22], [0, 1]);
  const btn1Scale = useTransform(activeProgress, [0.16, 0.24, 0.30], [0.15, 1.25, 1.0]);

  // Water-Bubble 2 (Book Tests & Checkups): Ejects right after Bubble 1
  const btn2Top = useTransform(activeProgress, [0.20, 0.32], [targetTop, targetTop]);
  const btn2Left = useTransform(activeProgress, [0.20, 0.32], [splitStartLeft, dockBtn2Left]);
  const btn2Opacity = useTransform(activeProgress, [0.20, 0.26], [0, 1]);
  const btn2Scale = useTransform(activeProgress, [0.20, 0.28, 0.34], [0.15, 1.25, 1.0]);

  // Water-Bubble 3 (QR Code App Download): Ejects next to Bubble 2
  const btn3Top = useTransform(activeProgress, [0.23, 0.35], [targetTop, targetTop]);
  const btn3Left = useTransform(activeProgress, [0.23, 0.35], [splitStartLeft, dockBtn3Left]);
  const btn3Opacity = useTransform(activeProgress, [0.23, 0.29], [0, 1]);
  const btn3Scale = useTransform(activeProgress, [0.23, 0.31, 0.37], [0.15, 1.25, 1.0]);

  // Secondary buttons and prompt cross-fades
  const controlsOpacity = useTransform(activeProgress, [0.02, isMobile ? 0.25 : 0.08], [1, 0]);
  const controlsHeight = useTransform(activeProgress, [0.02, isMobile ? 0.30 : 0.09], ["36px", "0px"]);
  const controlsMarginBottom = useTransform(activeProgress, [0.02, isMobile ? 0.30 : 0.09], [isMobile ? "14px" : "18px", "0px"]);

  // Moving gradient border around landing search bar edges (vibrant 0.95 on landing, refined 0.40 on docked pill)
  const landingBorderOpacity = searchTheme === "white" ? 0.75 : 0.95;
  const gradientBorderOpacity = useTransform(activeProgress, [0.0, 0.10, 0.32], [landingBorderOpacity, 0.65, 0.40]);

  // Translucent dark glass for default landing prompt, smoothly deepening only as it docks into the bottom pill
  const composerBg = useTransform(
    activeProgress,
    [0.0, 0.12, 0.32],
    [
      "rgba(22, 28, 36, 0.28)",
      "rgba(22, 28, 36, 0.45)",
      "rgba(20, 26, 36, 0.72)"
    ]
  );

  // Section-aware contextual placeholder for docked Spotlight Search
  const [dockedPlaceholder, setDockedPlaceholder] = useState("Search doctors, symptoms, packages...");

  useEffect(() => {
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
        setDockedPlaceholder("Search hospitals & network...");
      } else if (isElementInView(healthEl)) {
        setDockedPlaceholder("Search health checkups & tests...");
      } else if (isElementInView(coeEl)) {
        setDockedPlaceholder("Search by speciality...");
      } else {
        setDockedPlaceholder(isMobile ? "Search Narayana Health..." : "Search doctors, symptoms, packages...");
      }
    };

    window.addEventListener("scroll", handleSectionScroll, { passive: true });
    handleSectionScroll();
    return () => window.removeEventListener("scroll", handleSectionScroll);
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
    setSearchState("active");
    onOpenChange?.(true);
  };

  // Close search (Active/Results → Landing)
  const handleClose = () => {
    setSearchState("landing");
    setActivePill(null);
    onOpenChange?.(false);
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

  // Handle quick action pill clicks
  const handleSelectActionPill = (pill: "doctor" | "symptoms") => {
    captureOrigin();
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
        className={`${styles.searchShell} ${styles.stateLanding} ${isMorphing ? styles.searchShellMorphing : ""} ${styles.themeDark}`}
        data-search-theme="dark"
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
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background: composerBg,
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              boxShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.16)",
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
                <Search size={17} className={styles.spotlightSearchIcon} strokeWidth={2.5} />
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
            className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""}`}
            style={{
              position: "fixed",
              top: btn1Top,
              left: btn1Left,
              width: bubbleSize,
              height: spotlightHeight,
              borderRadius: 9999,
              opacity: btn1Opacity,
              scale: btn1Scale,
              pointerEvents: isDocked || isMorphing ? "auto" : "none",
              zIndex: 9990,
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/doctors");
            }}
            aria-label="Book Appointment"
          >
            <div className={styles.morphingActionIcon}>
              <CalendarCheck size={18} strokeWidth={2.0} />
            </div>
            <span className={styles.bubbleTooltip}>Book Appointment</span>
            {isDocked && <span className={styles.mwebBubbleTag}>Book Appt</span>}
          </motion.button>

          {/* Water-Bubble 2: Book Tests & Checkups -> Ejects out into Docked Bubble 2 */}
          <motion.button
            type="button"
            className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""}`}
            style={{
              position: "fixed",
              top: btn2Top,
              left: btn2Left,
              width: bubbleSize,
              height: spotlightHeight,
              borderRadius: 9999,
              opacity: btn2Opacity,
              scale: btn2Scale,
              pointerEvents: isDocked || isMorphing ? "auto" : "none",
              zIndex: 9990,
            }}
            onClick={(e) => {
              e.stopPropagation();
              captureOrigin();
              setActivePill("symptoms");
              setSearchState("active");
              setQuery("Book health checkup and lab tests");
            }}
            aria-label="Book Tests & Checkups"
          >
            <div className={styles.morphingActionIcon}>
              <Activity size={18} strokeWidth={2.0} />
            </div>
            <span className={styles.bubbleTooltip}>Book Tests & Checkups</span>
            {isDocked && <span className={styles.mwebBubbleTag}>Book Tests</span>}
          </motion.button>

          {/* Water-Bubble 3: QR Code App Download -> Splits out next to Bubble 2 */}
          <motion.button
            type="button"
            className={`${styles.morphingActionBtn} ${styles.waterBubblePill} ${isDocked ? styles.morphingActionBtnDocked : ""} ${isQrOpen ? styles.qrBubbleActive : ""}`}
            style={{
              position: "fixed",
              top: btn3Top,
              left: btn3Left,
              width: bubbleSize,
              height: spotlightHeight,
              borderRadius: 9999,
              opacity: btn3Opacity,
              scale: btn3Scale,
              pointerEvents: isDocked || isMorphing ? "auto" : "none",
              zIndex: 9990,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQrOpen((prev) => !prev);
            }}
            aria-label="Download NH Care App (QR Code)"
          >
            <div className={styles.morphingActionIcon}>
              <QrCode size={19} strokeWidth={2.2} />
            </div>
            <span className={styles.bubbleTooltip}>Download NH Care App</span>
            {isDocked && <span className={styles.mwebBubbleTag}>NH App</span>}
          </motion.button>
        </>
      )}

      {/* ── QR Code Popover Card ── */}
      <AnimatePresence>
        {isQrOpen && searchState === "landing" && (
          <motion.div
            className={styles.qrPopoverCard}
            style={{
              bottom: bottomClearance + spotlightHeight + 12,
              left: Math.min(
                winSize.w - 266,
                Math.max(16, dockBtn3Left - 190)
              ),
            }}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.qrHeader}>
              <div className={styles.qrTitleGroup}>
                <span className={styles.qrAppTitle}>Narayana Health App</span>
                <span className={styles.qrAppSubtitle}>Scan with phone camera to install</span>
              </div>
              <button
                type="button"
                className={styles.qrCloseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQrOpen(false);
                }}
                aria-label="Close QR Code Popover"
              >
                <X size={15} />
              </button>
            </div>

            <div className={styles.qrImageWrapper}>
              <Image
                src="/app-download-QR.png"
                alt="Scan to download NH Care App"
                width={124}
                height={124}
                className={styles.qrCodeImage}
                priority
              />
            </div>

            <div className={styles.qrStoreBadges}>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadgeLink}
              >
                App Store
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadgeLink}
              >
                Google Play
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



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
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.32, ease: "easeOut" }}
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
                    exit={{
                      opacity: 0,
                      y: originDeltaY,
                      scale: originScale,
                      borderRadius: 20,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0.1 : 0.42,
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
