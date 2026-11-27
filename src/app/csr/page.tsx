"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import CsrHero from "@/components/csr/CsrHero";
import CsrEditorialsGrid from "@/components/csr/CsrEditorialsGrid";
import CsrTransitionBridge from "@/components/csr/CsrTransitionBridge";
import CsrProgramsFlow from "@/components/csr/CsrProgramsFlow";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import PinnedStickyShell from "@/components/ui/PinnedStickyShell";
import StickyBreadcrumbBar, { HEALTH_LIBRARY_SIBLING_PAGES } from "@/components/ui/StickyBreadcrumbBar";
import { CSR_HERO_DATA, CSR_EDITORIALS_DATA, CSR_PROGRAMS_DATA } from "@/data/csrData";

const CSR_SIBLING_PAGES = [
  {
    label: "CSR Overview",
    href: "/csr",
    description: "Narayana Health Foundation impact",
  },
  {
    label: "Community Radio Program",
    href: "/csr/community-radioprogram",
    description: "Grassroots health broadcasting",
  },
  ...HEALTH_LIBRARY_SIBLING_PAGES,
];

export default function CsrPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isStickyPinned, setIsStickyPinned] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const { pageMotionStyle } = useLibraryHeroBlendShrink();

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY || 0;
      setIsScrolled(sy > 300);

      const topY = topSentinelRef.current?.getBoundingClientRect().top ?? Infinity;
      const endY = endSentinelRef.current?.getBoundingClientRect().top ?? Infinity;
      setIsStickyPinned(topY <= 92 && endY > 220);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <motion.main
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "clip",
        ...pageMotionStyle,
      }}
    >
      {/* ── SECTION 1: HERO (BLENDED DARK AT REST -> MINIMISES & SETTLES OVER WHITE) ── */}
      <CsrHero data={CSR_HERO_DATA} />

      <div ref={topSentinelRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

      {/* ── PINNED TOP STICKY BREADCRUMB BAR (CRISP BAR WITHOUT GRADIENT MIST) ── */}
      <PinnedStickyShell isPinned={isStickyPinned} motionKey="csr-sticky-dock" gradientBlur={false}>
        <StickyBreadcrumbBar
          currentTitle="CSR Overview"
          parentLabel="About Narayana Health"
          siblingPages={CSR_SIBLING_PAGES}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </PinnedStickyShell>

      <div data-nav-theme="light">
        {/* ── SECTION 2: DOWNLOADABLE CSR EDITORIALS ── */}
        <CsrEditorialsGrid items={CSR_EDITORIALS_DATA} />

        {/* ── SECTION 3: SPACIOUS DYNAMIC HORIZON TRANSITION BRIDGE & FOUNDER QUOTE ── */}
        <CsrTransitionBridge />

        {/* ── SECTION 4: FLAGSHIP PROGRAMS (LIGHT STAGE FOLDER CARDS) ── */}
        <CsrProgramsFlow programs={CSR_PROGRAMS_DATA} />

        <div ref={endSentinelRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

        {/* ── SECTION 5: PRE-FOOTER CTA CARD BANNER ── */}
        <BlogCtaBanner bg="transparent" />
      </div>

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

