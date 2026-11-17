"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CsrHero from "@/components/csr/CsrHero";
import CsrEditorialsGrid from "@/components/csr/CsrEditorialsGrid";
import CsrProgramsFlow from "@/components/csr/CsrProgramsFlow";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { CSR_HERO_DATA, CSR_EDITORIALS_DATA, CSR_PROGRAMS_DATA } from "@/data/csrData";

export default function CsrPage() {
  const { scrollY } = useScroll();

  // Dynamic dark-to-white scroll transition: sweeps from hero dark to pure white across scroll
  const dynamicBg = useTransform(
    scrollY,
    [100, 320, 560, 800],
    ["#060c18", "#0c1d3b", "#e0ebf7", "#ffffff"]
  );

  const dynamicTextColor = useTransform(
    scrollY,
    [150, 420, 720],
    ["#ffffff", "#cbd5e1", "#0f172a"]
  );

  const dynamicSubtitleColor = useTransform(
    scrollY,
    [150, 420, 720],
    ["rgba(255, 255, 255, 0.76)", "rgba(148, 163, 184, 0.90)", "#64748B"]
  );

  const dynamicEyebrowColor = useTransform(
    scrollY,
    [150, 420, 720],
    ["#38bdf8", "#0284c7", "#034EA2"]
  );

  return (
    <motion.main
      style={{
        minHeight: "100vh",
        backgroundColor: dynamicBg,
        ["--csr-text" as unknown as string]: dynamicTextColor,
        ["--csr-subtitle" as unknown as string]: dynamicSubtitleColor,
        ["--csr-eyebrow" as unknown as string]: dynamicEyebrowColor,
      }}
    >
      {/* ── SECTION 1: HERO WITH VIDEO STORYTELLING & IMPACT NUMBERS ── */}
      <CsrHero data={CSR_HERO_DATA} />

      {/* ── SECTION 2: DOWNLOADABLE CSR EDITORIALS WITH DYNAMIC SCROLL TRANSITION ── */}
      <CsrEditorialsGrid items={CSR_EDITORIALS_DATA} />

      {/* ── SECTION 3: FLAGSHIP PROGRAMS (ALTERNATING SMOOTH SCROLL REVEAL) ── */}
      <CsrProgramsFlow programs={CSR_PROGRAMS_DATA} />

      {/* ── SECTION 4: EXACT SIGNATURE BLUE CTA BANNER (SAME AS BLOG & PROCEDURES) ── */}
      <BlogCtaBanner />

      {/* ── UNIFIED CLINICAL SIDE ACTIONS ── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nOPD"}
        conditionTitle="Corporate Social Responsibility"
        pulseQuery="Tell me more about Narayana Health's CSR initiatives, free pediatric heart surgeries, and community health camps."
      />
    </motion.main>
  );
}

