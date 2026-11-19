"use client";

import React from "react";
import CsrHero from "@/components/csr/CsrHero";
import CsrEditorialsGrid from "@/components/csr/CsrEditorialsGrid";
import CsrProgramsFlow from "@/components/csr/CsrProgramsFlow";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { CSR_HERO_DATA, CSR_EDITORIALS_DATA, CSR_PROGRAMS_DATA } from "@/data/csrData";

export default function CsrPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#060c18" }}>
      {/* ── SECTION 1: HERO WITH VIDEO STORYTELLING & IMPACT NUMBERS (DARK STAGE) ── */}
      <CsrHero data={CSR_HERO_DATA} />

      {/* ── SECTION 2: DOWNLOADABLE CSR EDITORIALS (DARK STAGE CONTINUATION) ── */}
      <CsrEditorialsGrid items={CSR_EDITORIALS_DATA} />

      {/* ── SECTION 3: FLAGSHIP PROGRAMS (LIGHT STAGE FOLDER CARDS) ── */}
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

