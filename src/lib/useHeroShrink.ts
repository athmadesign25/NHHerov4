"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";

export type HeroShrinkMode = "detail" | "library";

/**
 * Permanent clean white surface & typography tokens for Detail pages.
 * Pairs with the dark inset hero card so reading content never flashes
 * from dark-to-white while scrolling.
 */
export const DETAIL_WHITE_PAGE_VARS: React.CSSProperties = {
  backgroundColor: "#ffffff",
  ["--v2-bg" as string]: "#ffffff",
  ["--v2-heading" as string]: "#0f172a",
  ["--v2-subtitle" as string]: "#64748b",
  ["--v2-body" as string]: "#374151",
  ["--v2-muted" as string]: "#64748b",
  ["--v2-toc-link" as string]: "#4b5563",
  ["--v2-toc-active" as string]: "var(--red-600)",
  ["--v2-toc-active-bg" as string]: "rgba(var(--red-600-rgb), 0.07)",
  ["--v2-border" as string]: "rgba(15, 23, 42, 0.08)",
  ["--v2-card-bg" as string]: "#ffffff",
  ["--hero-bottom-bg" as string]: "#060e1b",
  ["--summary-bg" as string]: "rgba(248, 250, 252, 0.9)",
  ["--summary-border" as string]: "rgba(15, 23, 42, 0.08)",
  ["--summary-accent" as string]: "#034EA2",
  ["--summary-text" as string]: "#1e293b",
  ["--summary-badge-bg" as string]: "#ffffff",
  ["--summary-badge-text" as string]: "#334155",
};

/**
 * Permanent crisp light-surface tokens (used on light-mode wrappers such as Blog lower bands & CSR).
 */
export const LIBRARY_WHITE_PAGE_VARS: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
  ["--dyn-heading" as string]: "#0f172a",
  ["--dyn-subtitle" as string]: "#475569",
  ["--dyn-muted" as string]: "#64748b",
  ["--dyn-eyebrow" as string]: "#64748b",
  ["--dyn-bubble-label" as string]: "#1e293b",
  ["--dyn-bubble-hover" as string]: "#0f172a",
  ["--dyn-bubble-active" as string]: "#cf171f",
  ["--dyn-bubble-border" as string]: "rgba(15, 23, 42, 0.16)",
  ["--dyn-bubble-bg" as string]: "#f8fafc",
  ["--dyn-arrow" as string]: "#334155",
  ["--dyn-arrow-hover" as string]: "#0f172a",
  ["--dyn-filter-border" as string]: "rgba(15, 23, 42, 0.16)",
  ["--dyn-filter-bg" as string]: "#ffffff",
  ["--dyn-filter-text" as string]: "#1e293b",
  ["--dyn-filter-bg-hover" as string]: "#f8fafc",
  ["--dyn-filter-text-hover" as string]: "#0f172a",
  ["--dyn-rail-all" as string]: "#1e293b",
  ["--dyn-rail-letter" as string]: "#1e293b",
  ["--dyn-rail-hover-bg" as string]: "rgba(15, 23, 42, 0.06)",
  ["--dyn-rail-hover-text" as string]: "#0f172a",
  ["--dyn-border" as string]: "rgba(15, 23, 42, 0.12)",
  ["--dyn-search-bg" as string]: "#ffffff",
  ["--dyn-search-border" as string]: "rgba(15, 23, 42, 0.18)",
  ["--dyn-search-text" as string]: "#0f172a",
  ["--dyn-search-placeholder" as string]: "#475569",
  ["--dyn-red-sel-bg" as string]: "rgba(237, 28, 36, 0.06)",
  ["--dyn-red-sel-border" as string]: "rgba(220, 38, 38, 0.65)",
  ["--dyn-red-sel-text" as string]: "#cf171f",
  ["--featured-title-color" as string]: "#0f172a",
};

/**
 * Dark atmospheric hero surface tokens applied directly on the hero card so hero headings,
 * glass search pills, and metrics stay legible light-on-dark inside both Detail & Library heroes.
 */
export const HERO_DARK_SURFACE_VARS: React.CSSProperties = {
  color: "#ffffff",
  ["--v2-heading" as string]: "#ffffff",
  ["--v2-subtitle" as string]: "rgba(255, 255, 255, 0.84)",
  ["--v2-muted" as string]: "rgba(255, 255, 255, 0.72)",
  ["--v2-border" as string]: "rgba(255, 255, 255, 0.16)",
  ["--dyn-heading" as string]: "#ffffff",
  ["--dyn-subtitle" as string]: "rgba(255, 255, 255, 0.84)",
  ["--dyn-muted" as string]: "rgba(255, 255, 255, 0.70)",
  ["--dyn-eyebrow" as string]: "rgba(255, 255, 255, 0.66)",
  ["--dyn-search-bg" as string]: "rgba(255, 255, 255, 0.09)",
  ["--dyn-search-border" as string]: "rgba(255, 255, 255, 0.28)",
  ["--dyn-search-text" as string]: "#ffffff",
  ["--dyn-search-placeholder" as string]: "rgba(255, 255, 255, 0.78)",
  ["--dyn-red-sel-bg" as string]: "rgba(237, 28, 36, 0.16)",
  ["--dyn-red-sel-border" as string]: "rgba(248, 113, 113, 0.78)",
  ["--dyn-red-sel-text" as string]: "#ff7b82",
  ["--stat-num-color" as string]: "rgba(255, 255, 255, 0.86)",
  ["--stat-label-color" as string]: "rgba(255, 255, 255, 0.56)",
  ["--stat-divider-color" as string]: "rgba(255, 255, 255, 0.14)",
};

/**
 * Shared scroll-driven shrink + dark-to-white blend progress hook (`8px -> 280px`).
 * Keeps rest stage at `scrollY = 0` dark `#060c18` with zero seam, then cleanly scales
 * and rounds the hero card over pure `#ffffff` while transitioning below-hero tokens.
 */
function useBlendScrollMetrics(mode: HeroShrinkMode) {
  const [isMobile, setIsMobile] = useState(false);
  const rawProgress = useMotionValue(0);
  const targetScaleVal = useMotionValue(mode === "detail" ? 0.88 : 0.92);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.45,
    restDelta: 0.001,
  });

  useEffect(() => {
    const syncMq = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        targetScaleVal.set((window.innerWidth - 32) / window.innerWidth);
      } else if (mode === "detail") {
        targetScaleVal.set(Math.min(0.92, Math.max(0.84, 1240 / window.innerWidth)));
      } else {
        targetScaleVal.set(0.92);
      }
    };
    syncMq();
    window.addEventListener("resize", syncMq, { passive: true });
    return () => window.removeEventListener("resize", syncMq);
  }, [mode, targetScaleVal]);

  useEffect(() => {
    const updateScroll = () => {
      const sy = window.scrollY || 0;
      const startScroll = 8;
      const endScroll = 280;
      const clamped = Math.max(0, Math.min(1, (sy - startScroll) / (endScroll - startScroll)));
      rawProgress.set(clamped);
    };

    updateScroll();
    if (typeof window !== "undefined" && window.scrollY > 8) {
      smoothProgress.jump(rawProgress.get());
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [rawProgress, smoothProgress]);

  const pageBgColor = useTransform(
    smoothProgress,
    [0, 0.22, 0.65, 1],
    ["#060c18", "#0b1426", "#eef3f9", "#ffffff"]
  );
  const heroCardBg = useTransform(
    smoothProgress,
    [0, 0.16, 0.55, 1],
    ["rgba(6, 14, 27, 0)", "#060e1b", "#060e1b", "#060e1b"]
  );
  const heroScale = useTransform([smoothProgress, targetScaleVal], ([p, target]: number[]) => {
    const progress = Math.min(1, Math.max(0, p / 0.9));
    return 1 - (1 - target) * progress;
  });
  const heroRadius = useTransform(
    smoothProgress,
    [0, 0.9],
    ["0px", isMobile ? "16px" : "22px"]
  );
  const heroShadow = useTransform(
    smoothProgress,
    [0, 0.25, 0.9],
    [
      "0 0 0 rgba(0, 0, 0, 0)",
      "0 10px 28px -8px rgba(3, 18, 36, 0.20)",
      "0 20px 50px -10px rgba(3, 18, 36, 0.30), 0 10px 20px -5px rgba(3, 18, 36, 0.16)",
    ]
  );

  return {
    isMobile,
    smoothProgress,
    pageBgColor,
    heroCardBg,
    heroScale,
    heroRadius,
    heroShadow,
  };
}

/**
 * Detail Hero inset shrink over seamless `#060c18 -> #ffffff` dark-to-white page transition:
 * - At rest (`scrollY = 0`): cohesive `#060c18` canvas behind hero and initial below-hero fold.
 * - On scroll (`8px -> 280px`): hero solidifies, scales down with rounded corners over `#ffffff`,
 *   while all below-hero `--v2-*` typography/surfaces transition cleanly from light-on-dark to dark-on-white.
 */
export function useHeroShrink(mode: HeroShrinkMode) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isMobile,
    smoothProgress,
    pageBgColor,
    heroCardBg,
    heroScale,
    heroRadius,
    heroShadow,
  } = useBlendScrollMetrics(mode);

  const v2Heading = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#e2e8f0", "#0f172a", "#0f172a"]);
  const v2Subtitle = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.72)", "#64748b", "#64748b"]);
  const v2Body = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.84)", "rgba(255, 255, 255, 0.80)", "#374151", "#374151"]);
  const v2Muted = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.60)", "rgba(255, 255, 255, 0.58)", "#64748b", "#64748b"]);
  const v2TocLink = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.72)", "rgba(255, 255, 255, 0.68)", "#4b5563", "#4b5563"]);
  const v2Border = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.14)", "rgba(15, 23, 42, 0.08)", "rgba(15, 23, 42, 0.08)"]);
  const v2CardBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.08)", "#f8fafc", "#ffffff"]);

  const pageMotionStyle: MotionStyle = {
    backgroundColor: pageBgColor,
    color: v2Body,
    ["--v2-bg" as string]: "transparent",
    ["--v2-heading" as string]: v2Heading,
    ["--v2-subtitle" as string]: v2Subtitle,
    ["--v2-body" as string]: v2Body,
    ["--v2-muted" as string]: v2Muted,
    ["--v2-toc-link" as string]: v2TocLink,
    ["--v2-toc-active" as string]: "var(--red-600)",
    ["--v2-toc-active-bg" as string]: "rgba(var(--red-600-rgb), 0.07)",
    ["--v2-border" as string]: v2Border,
    ["--v2-card-bg" as string]: v2CardBg,
    ["--hero-bottom-bg" as string]: "#060e1b",
    ["--summary-bg" as string]: v2CardBg,
    ["--summary-border" as string]: v2Border,
    ["--summary-accent" as string]: "#034EA2",
    ["--summary-text" as string]: v2Body,
    ["--summary-badge-bg" as string]: v2CardBg,
    ["--summary-badge-text" as string]: v2Muted,
    ["--featured-title-color" as string]: v2Heading,
  };

  const wrapperStyle: React.CSSProperties =
    mode === "detail"
      ? {
        position: "relative",
        height: !isMobile ? "calc(100vh + 160px)" : "auto",
        backgroundColor: "transparent",
        width: "100%",
      }
      : {
        position: "relative",
        backgroundColor: "transparent",
        width: "100%",
        overflowX: "clip",
      };

  const heroMotionStyle: MotionStyle =
    !isMobile && mode === "detail"
      ? {
        ...HERO_DARK_SURFACE_VARS,
        position: "sticky",
        top: 0,
        zIndex: 1,
        backgroundColor: heroCardBg,
        scale: heroScale,
        borderRadius: heroRadius,
        boxShadow: heroShadow,
        overflow: "hidden",
        transformOrigin: "center top",
        willChange: "transform, border-radius, box-shadow, background-color",
        height: "100vh",
        minHeight: "100vh",
      }
      : {
        ...HERO_DARK_SURFACE_VARS,
        position: "relative",
        zIndex: 1,
        backgroundColor: heroCardBg,
        scale: heroScale,
        borderRadius: heroRadius,
        boxShadow: heroShadow,
        overflow: "hidden",
        transformOrigin: "center top",
        willChange: "transform, border-radius, box-shadow, background-color",
      };

  return {
    containerRef,
    isMobile,
    progress: smoothProgress,
    wrapperStyle,
    heroMotionStyle,
    pageMotionStyle,
  };
}

/**
 * Blended Dark Landing -> CoE-Style Hero Shrink Over White -> Smooth Dark-to-White Below-Fold
 * for mixed Hero + Search/Filter/Cards Library pages:
 *
 * 1. At scrollY = 0: seamless `#060c18` dark canvas across Hero and top of Filter/Card peek (zero sharp cut).
 * 2. Immediately on scroll (`8px -> 280px`):
 *    - Page background behind hero & below transitions `#060c18 -> #ffffff`.
 *    - Hero card solidifies cleanly to `#060e1b`, scales down crisply over `#ffffff`, and rounds all edges.
 *    - Below-hero headings, filter chips, A-Z rail, and search smoothly morph from light-on-dark to dark-on-white.
 */
export function useLibraryHeroBlendShrink() {
  const {
    isMobile,
    smoothProgress,
    pageBgColor,
    heroCardBg,
    heroScale,
    heroRadius,
    heroShadow,
  } = useBlendScrollMetrics("library");

  // Smooth dark -> light color transitions for below-hero sections (reaches crisp white visibility by 0.52)
  const dynHeading = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#e2e8f0", "#0f172a", "#0f172a"]);
  const dynSubtitle = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.72)", "#475569", "#475569"]);
  const dynMuted = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.60)", "rgba(255, 255, 255, 0.58)", "#64748b", "#64748b"]);
  const dynEyebrow = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.58)", "rgba(255, 255, 255, 0.58)", "#64748b", "#64748b"]);
  const dynBubbleLabel = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.86)", "rgba(255, 255, 255, 0.80)", "#1e293b", "#1e293b"]);
  const dynBubbleHover = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBubbleActive = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ff6b72", "#ff6b72", "#b91c1c", "#b91c1c"]);
  const dynBubbleBorder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.22)", "rgba(255, 255, 255, 0.20)", "#cbd5e1", "#cbd5e1"]);
  const dynBubbleBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.08)", "#f8fafc", "#f8fafc"]);
  const dynArrow = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.76)", "#334155", "#334155"]);
  const dynArrowHover = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynFilterBorder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.22)", "rgba(255, 255, 255, 0.20)", "#cbd5e1", "#cbd5e1"]);
  const dynFilterBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.08)", "#ffffff", "#ffffff"]);
  const dynFilterText = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.88)", "rgba(255, 255, 255, 0.82)", "#334155", "#334155"]);
  const dynFilterBgHover = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.12)", "#f8fafc", "#f8fafc"]);
  const dynFilterTextHover = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynRailAll = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.82)", "rgba(255, 255, 255, 0.76)", "#1e293b", "#1e293b"]);
  const dynRailLetter = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.72)", "#334155", "#334155"]);
  const dynRailHoverBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.10)", "rgba(15, 23, 42, 0.06)", "rgba(15, 23, 42, 0.06)"]);
  const dynRailHoverText = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynBorder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.14)", "#e2e8f0", "#e2e8f0"]);
  const dynSearchBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.16)", "#ffffff", "#ffffff"]);
  const dynSearchBorder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.26)", "rgba(255, 255, 255, 0.26)", "#cbd5e1", "#cbd5e1"]);
  const dynSearchBorderHover = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.42)", "rgba(255, 255, 255, 0.38)", "#94a3b8", "#94a3b8"]);
  const dynSearchBorderFocus = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.48)", "rgba(255, 255, 255, 0.45)", "#034EA2", "#034EA2"]);
  const dynSearchText = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynSearchPlaceholder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.72)", "#475569", "#475569"]);
  const dynSearchOutlineOpacity = useTransform(smoothProgress, [0, 0.18, 0.46, 1], [0.38, 0.22, 0, 0]);
  const dynSearchOutlineHoverOpacity = useTransform(smoothProgress, [0, 0.18, 0.46, 1], [0.56, 0.32, 0, 0]);
  const dynSearchIconGradOpacity = useTransform(smoothProgress, [0, 0.20, 0.48, 1], [1, 0.5, 0, 0]);
  const dynSearchIconPlainOpacity = useTransform(smoothProgress, [0, 0.20, 0.48, 1], [0, 0.5, 1, 1]);
  const dynSearchIconColor = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#00C4FF", "#38bdf8", "#475569", "#475569"]);
  const dynSearchGrad1 = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ED1C24", "#ED1C24", "#475569", "#475569"]);
  const dynSearchGrad2 = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#8B5CF6", "#8B5CF6", "#475569", "#475569"]);
  const dynSearchGrad3 = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#00C4FF", "#00C4FF", "#475569", "#475569"]);
  const dynSearchClearHoverText = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]);
  const dynSearchClearHoverBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.15)", "#f1f5f9", "#f1f5f9"]);
  const dynSearchShadowRest = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["none", "none", "0 1px 3px rgba(15, 23, 42, 0.07)", "0 1px 3px rgba(15, 23, 42, 0.07)"]);
  const dynSearchShadowFocus = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["none", "none", "0 0 0 3px rgba(3, 78, 162, 0.14)", "0 0 0 3px rgba(3, 78, 162, 0.14)"]);
  const dynRedSelBg = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(237, 28, 36, 0.16)", "rgba(237, 28, 36, 0.14)", "#fef2f2", "#fef2f2"]);
  const dynRedSelBorder = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["rgba(248, 113, 113, 0.80)", "rgba(248, 113, 113, 0.75)", "#dc2626", "#dc2626"]);
  const dynRedSelText = useTransform(smoothProgress, [0, 0.20, 0.52, 1], ["#ff8a90", "#ff8a90", "#b91c1c", "#b91c1c"]);

  const pageMotionStyle: MotionStyle = {
    backgroundColor: pageBgColor,
    color: dynHeading,
    ["--dyn-heading" as string]: dynHeading,
    ["--dyn-subtitle" as string]: dynSubtitle,
    ["--dyn-muted" as string]: dynMuted,
    ["--dyn-eyebrow" as string]: dynEyebrow,
    ["--dyn-bubble-label" as string]: dynBubbleLabel,
    ["--dyn-bubble-hover" as string]: dynBubbleHover,
    ["--dyn-bubble-active" as string]: dynBubbleActive,
    ["--dyn-bubble-border" as string]: dynBubbleBorder,
    ["--dyn-bubble-bg" as string]: dynBubbleBg,
    ["--dyn-arrow" as string]: dynArrow,
    ["--dyn-arrow-hover" as string]: dynArrowHover,
    ["--dyn-filter-border" as string]: dynFilterBorder,
    ["--dyn-filter-bg" as string]: dynFilterBg,
    ["--dyn-filter-text" as string]: dynFilterText,
    ["--dyn-filter-bg-hover" as string]: dynFilterBgHover,
    ["--dyn-filter-text-hover" as string]: dynFilterTextHover,
    ["--dyn-rail-all" as string]: dynRailAll,
    ["--dyn-rail-letter" as string]: dynRailLetter,
    ["--dyn-rail-hover-bg" as string]: dynRailHoverBg,
    ["--dyn-rail-hover-text" as string]: dynRailHoverText,
    ["--dyn-border" as string]: dynBorder,
    ["--dyn-search-bg" as string]: dynSearchBg,
    ["--dyn-search-border" as string]: dynSearchBorder,
    ["--dyn-search-border-hover" as string]: dynSearchBorderHover,
    ["--dyn-search-border-focus" as string]: dynSearchBorderFocus,
    ["--dyn-search-shadow-rest" as string]: dynSearchShadowRest,
    ["--dyn-search-text" as string]: dynSearchText,
    ["--dyn-search-placeholder" as string]: dynSearchPlaceholder,
    ["--dyn-search-outline-opacity" as string]: dynSearchOutlineOpacity,
    ["--dyn-search-outline-hover-opacity" as string]: dynSearchOutlineHoverOpacity,
    ["--dyn-search-icon-grad-opacity" as string]: dynSearchIconGradOpacity,
    ["--dyn-search-icon-plain-opacity" as string]: dynSearchIconPlainOpacity,
    ["--dyn-search-icon-color" as string]: dynSearchIconColor,
    ["--dyn-search-grad-1" as string]: dynSearchGrad1,
    ["--dyn-search-grad-2" as string]: dynSearchGrad2,
    ["--dyn-search-grad-3" as string]: dynSearchGrad3,
    ["--dyn-search-clear-hover-text" as string]: dynSearchClearHoverText,
    ["--dyn-search-clear-hover-bg" as string]: dynSearchClearHoverBg,
    ["--dyn-search-shadow-focus" as string]: dynSearchShadowFocus,
    ["--dyn-red-sel-bg" as string]: dynRedSelBg,
    ["--dyn-red-sel-border" as string]: dynRedSelBorder,
    ["--dyn-red-sel-text" as string]: dynRedSelText,
    ["--featured-title-color" as string]: dynHeading,
  };

  const heroMotionStyle: MotionStyle = {
    ...HERO_DARK_SURFACE_VARS,
    position: "relative",
    zIndex: 1,
    backgroundColor: heroCardBg,
    scale: heroScale,
    borderRadius: heroRadius,
    boxShadow: heroShadow,
    overflow: "hidden",
    transformOrigin: "center top",
    willChange: "transform, border-radius, box-shadow, background-color",
  };

  return {
    progress: smoothProgress,
    isMobile,
    pageMotionStyle,
    heroMotionStyle,
    dynHeading,
    dynSubtitle,
  };
}
