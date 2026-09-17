"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
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

  // Motion values for continuous morphing
  const hasScroll = Boolean(scrollProgress);
  const defaultProgress = useMotionValue(0);
  const activeProgress = scrollProgress || defaultProgress;

  useMotionValueEvent(activeProgress, "change", (latest) => {
    setIsDocked(latest >= 0.50);
  });

  // Starting dimensions (Hero anchor)
  const startWidth = anchorRect?.width || Math.min(840, winSize.w - 48);
  const startHeight = anchorRect?.height || 136;
  const startTop = anchorRect?.top || Math.round(winSize.h * 0.68 - 28);
  const startLeft = anchorRect?.left || Math.round((winSize.w - startWidth) / 2);

  // Docked dimensions (Bottom right corner)
  const endWidth = isMobile ? Math.min(230, winSize.w - 32) : 240;
  const endHeight = 46;
  const endTop = winSize.h - 28 - endHeight;
  const endLeft = isMobile ? Math.round((winSize.w - endWidth) / 2) : winSize.w - 28 - endWidth;

  // Continuous numeric scroll transforms: [0.03, 0.55]
  const composerTop = useTransform(activeProgress, [0.03, 0.55], [startTop, endTop]);
  const composerLeft = useTransform(activeProgress, [0.03, 0.55], [startLeft, endLeft]);
  const composerWidth = useTransform(activeProgress, [0.03, 0.55], [startWidth, endWidth]);
  const composerHeight = useTransform(activeProgress, [0.03, 0.55], [startHeight, endHeight]);
  const composerRadius = useTransform(activeProgress, [0.03, 0.55], [20, 24]);
  const composerPaddingX = useTransform(activeProgress, [0.03, 0.55], [24, 18]);
  const composerPaddingY = useTransform(activeProgress, [0.03, 0.55], [20, 0]);

  // Secondary buttons and prompt cross-fades
  const controlsOpacity = useTransform(activeProgress, [0.03, 0.22], [1, 0]);
  const controlsHeight = useTransform(activeProgress, [0.03, 0.25], ["36px", "0px"]);
  const controlsMarginBottom = useTransform(activeProgress, [0.03, 0.25], ["32px", "0px"]);
  const promptOpacity = useTransform(activeProgress, [0.03, 0.20], [1, 0]);
  const compactLabelOpacity = useTransform(activeProgress, [0.18, 0.45], [0, 1]);

  // Primary search state
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [activePill, setActivePill] = useState<"doctor" | "symptoms" | null>(null);

  // Suggestions & Results
  const [resultsData, setResultsData] = useState<SearchResultsData>(CARDIOLOGY_RESULTS);

  const containerRef = useRef<HTMLDivElement>(null);

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
  const handleActivate = () => {
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
      if (
        searchState !== "landing" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
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

  return (
    <div 
      className={styles.searchExperienceWrapper} 
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
      {/* Dimmed backdrop when in active/results search on scroll */}
      <AnimatePresence>
        {hasScroll && searchState !== "landing" && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 10, 18, 0.28)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 9991,
              pointerEvents: "auto",
            }}
          />
        )}
      </AnimatePresence>

      {/* Unified expanding & morphing search container */}
      <motion.div
        layout
        className={`${styles.searchShell} ${stateClass}`}
        onClick={() => {
          if (isDocked) {
            handleActivate();
          }
        }}
        style={
          hasScroll && searchState === "landing"
            ? {
                position: "fixed",
                top: composerTop,
                left: composerLeft,
                width: composerWidth,
                height: composerHeight,
                borderRadius: composerRadius,
                paddingLeft: composerPaddingX,
                paddingRight: composerPaddingX,
                paddingTop: composerPaddingY,
                paddingBottom: composerPaddingY,
                maxWidth: "none",
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                boxSizing: "border-box",
                zIndex: 9990,
                pointerEvents: "auto",
                overflow: "hidden",
                cursor: "pointer",
              }
            : searchState !== "landing" && hasScroll
            ? {
                position: "fixed",
                top: (searchState === "results" || searchState === "skeleton")
                  ? Math.max(28, Math.round(winSize.h * 0.05))
                  : Math.max(60, Math.round(winSize.h * 0.14)),
                left: Math.round((winSize.w - Math.min((searchState === "results" || searchState === "skeleton") ? 1080 : 880, winSize.w - 40)) / 2),
                width: Math.min((searchState === "results" || searchState === "skeleton") ? 1080 : 880, winSize.w - 40),
                height: "auto",
                maxHeight: (searchState === "results" || searchState === "skeleton") ? "92vh" : "85vh",
                overflowY: "auto",
                borderRadius: 22,
                paddingTop: (searchState === "results" || searchState === "skeleton") ? 26 : 24,
                paddingRight: (searchState === "results" || searchState === "skeleton") ? 32 : 28,
                paddingBottom: (searchState === "results" || searchState === "skeleton") ? 28 : 24,
                paddingLeft: (searchState === "results" || searchState === "skeleton") ? 32 : 28,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                boxSizing: "border-box",
                zIndex: 99999,
                pointerEvents: "auto",
              }
            : undefined
        }
        transition={{
          layout: { duration: prefersReducedMotion ? 0.1 : 0.42, ease: [0.16, 1, 0.3, 1] },
          duration: prefersReducedMotion ? 0.1 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {searchState === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%" }}
            >
              <DefaultSearchPrompt
                onActivate={handleActivate}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onSelectActionPill={handleSelectActionPill}
                onOpenPulse={() => handleOpenPulse()}
                promptOpacity={hasScroll ? promptOpacity : undefined}
                compactLabelOpacity={hasScroll ? compactLabelOpacity : undefined}
                controlsOpacity={hasScroll ? controlsOpacity : undefined}
                controlsHeight={hasScroll ? controlsHeight : undefined}
                controlsMarginBottom={hasScroll ? controlsMarginBottom : undefined}
              />
            </motion.div>
          )}

          {searchState === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ActiveSearchCanvas
                query={query}
                onQueryChange={handleQueryChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
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
                onSelectLocation={setSelectedLocation}
                onSelectSpecialtyTag={handleSelectSpecialtyTag}
                onAskPulse={handleAskPulse}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
