"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CsrHero from "@/components/csr/CsrHero";
import CsrEditorialsGrid from "@/components/csr/CsrEditorialsGrid";
import CsrProgramsFlow from "@/components/csr/CsrProgramsFlow";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { CSR_HERO_DATA, CSR_EDITORIALS_DATA, CSR_PROGRAMS_DATA } from "@/data/csrData";

export default function CsrPage() {
  const transitionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: transitionRef,
    offset: ["start 0.95", "start 0.25"],
  });

  const pageBgColor = useTransform(
    scrollYProgress,
    [0, 0.35, 0.72, 1],
    ["#060c18", "#0d2142", "#eef4fb", "#ffffff"]
  );
  const pageTextColor = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    ["#ffffff", "#1e293b", "#0f172a"]
  );

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* ── SECTION 1: HERO WITH VIDEO STORYTELLING & IMPACT NUMBERS ── */}
      <CsrHero data={CSR_HERO_DATA} />

      {/* ── SECTION 2: DOWNLOADABLE CSR EDITORIALS WITH DYNAMIC SCROLL TRANSITION ── */}
      <motion.div
        ref={transitionRef}
        style={{ backgroundColor: pageBgColor, color: pageTextColor }}
      >
        <CsrEditorialsGrid items={CSR_EDITORIALS_DATA} />
      </motion.div>

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
    </main>
  );
}

