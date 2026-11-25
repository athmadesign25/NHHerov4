"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import CsrHero from "@/components/csr/CsrHero";
import CsrEditorialsGrid from "@/components/csr/CsrEditorialsGrid";
import CsrTransitionBridge from "@/components/csr/CsrTransitionBridge";
import CsrProgramsFlow from "@/components/csr/CsrProgramsFlow";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { CSR_HERO_DATA, CSR_EDITORIALS_DATA, CSR_PROGRAMS_DATA } from "@/data/csrData";

export default function CsrPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Top fold scroll progress (0 at scrollY <= 36px, 1 at scrollY >= 360px)
  const topProgress = useMotionValue(0);
  // Unified white factor across the entire page (0 = Dark #060c18, 1 = White #ffffff)
  const unifiedWhiteProgress = useMotionValue(0);
  const ctaSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY || 0;
      setIsScrolled(sy > 300);

      // 1. Hero to Content dynamic transition: 36px to 360px
      const topWhite = Math.max(0, Math.min(1, (sy - 36) / (360 - 36)));
      topProgress.set(topWhite);

      // 2. Pre-footer CTA dynamic return transition: when sentinel rises from 75% vh to 25% vh
      let bottomDark = 0;
      const el = ctaSentinelRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const startY = vh * 0.75;
        const endY = vh * 0.25;
        const raw = (startY - rect.top) / (startY - endY);
        bottomDark = Math.max(0, Math.min(1, raw));
      }

      unifiedWhiteProgress.set(Math.max(0, Math.min(topWhite, 1 - bottomDark)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [topProgress, unifiedWhiteProgress]);

  // Single unified V2 dynamism canvas: Dark Navy (#060c18) -> Deep Black (#020408) -> Alabaster (#f4f7fb) -> Pure White (#ffffff)
  const pageBgColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );

  // Smoothly crossfade hero video canvas into the unified dynamic canvas so there is ZERO horizontal seam
  const heroCanvasOpacity = useTransform(
    topProgress,
    [0, 0.38, 0.68],
    [1, 0.75, 0]
  );

  // Dynamic text & stat color inversions matching Procedure Detail V2
  const dynHeadingColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.44, 0.64, 1],
    ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]
  );
  const dynSubtitleColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.76)", "rgba(255, 255, 255, 0.82)", "#475569", "#64748b"]
  );
  const heroStatNumColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]
  );
  const heroStatLabelColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.50)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]
  );
  const heroStatDividerColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]
  );

  return (
    <motion.main
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "clip",
        backgroundColor: pageBgColor,
        ["--dyn-heading" as string]: dynHeadingColor,
        ["--dyn-subtitle" as string]: dynSubtitleColor,
        ["--stat-num-color" as string]: heroStatNumColor,
        ["--stat-label-color" as string]: heroStatLabelColor,
        ["--stat-divider-color" as string]: heroStatDividerColor,
        ["--hero-canvas-opacity" as string]: heroCanvasOpacity,
      }}
    >
      {/* ── SECTION 1: HERO (UNIFIED V2 DYNAMIC CANVAS) ── */}
      <CsrHero data={CSR_HERO_DATA} canvasOpacity={heroCanvasOpacity} />

      {/* ── SECTION 2: DOWNLOADABLE CSR EDITORIALS ── */}
      <CsrEditorialsGrid items={CSR_EDITORIALS_DATA} />

      {/* ── SECTION 3: SPACIOUS DYNAMIC HORIZON TRANSITION BRIDGE & FOUNDER QUOTE ── */}
      <CsrTransitionBridge />

      {/* ── SECTION 4: FLAGSHIP PROGRAMS (LIGHT STAGE FOLDER CARDS) ── */}
      <CsrProgramsFlow programs={CSR_PROGRAMS_DATA} />

      {/* Sentinel for smooth pre-footer CTA background return to dark */}
      <div
        ref={ctaSentinelRef}
        style={{ height: "1px", width: "100%", pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* ── SECTION 5: PRE-FOOTER CTA CARD BANNER ── */}
      <BlogCtaBanner bg="transparent" />

      {/* ── UNIFIED CLINICAL SIDE ACTIONS ── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nOPD"}
        conditionTitle="Corporate Social Responsibility"
        pulseQuery="Tell me more about Narayana Health's CSR initiatives, free pediatric heart surgeries, and community health camps."
        isScrolled={isScrolled}
      />
    </motion.main>
  );
}

