"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";
import BlogHeroV3 from "@/components/blog/BlogHeroV3";
import BlogCategoryExplore from "@/components/blog/BlogCategoryExplore";
import BlogMedicalExperts from "@/components/blog/BlogMedicalExperts";
import BlogBentoGrid from "@/components/blog/BlogBentoGrid";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";

function ArticlesLibraryInner() {
  const [isScrolled, setIsScrolled] = useState(false);

  const transitionRef = useRef<HTMLDivElement>(null);
  const bgTransitionProgress = useMotionValue(0);
  const unifiedWhiteProgress = useMotionValue(0);

  useEffect(() => {
    const updateTransition = () => {
      const sy = window.scrollY || 0;
      setIsScrolled(sy > 300);

      // Top fold transition: 0..36px stays dark (#060c18), 36..360px transitions to white (#ffffff)
      const topWhite = Math.max(0, Math.min(1, (sy - 36) / (360 - 36)));

      // Bottom fold transition: when sentinel below doctor cards rises from 68% vh to 28% vh, return to dark (#060c18)
      let bottomDark = 0;
      const el = transitionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const startY = vh * 0.68;
        const endY = vh * 0.28;
        const raw = (startY - rect.top) / (startY - endY);
        bottomDark = Math.max(0, Math.min(1, raw));
      }

      bgTransitionProgress.set(bottomDark);
      unifiedWhiteProgress.set(Math.max(0, Math.min(topWhite, 1 - bottomDark)));
    };

    updateTransition();
    window.addEventListener("scroll", updateTransition, { passive: true });
    window.addEventListener("resize", updateTransition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateTransition);
      window.removeEventListener("resize", updateTransition);
    };
  }, [bgTransitionProgress, unifiedWhiteProgress]);

  // Single unified V2 dynamism canvas for the entire page: Dark (#060c18) -> Deep Black (#020408) -> Alabaster (#f4f7fb) -> Pure White (#ffffff)
  const pageBgColor = useTransform(
    unifiedWhiteProgress,
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );

  return (
    <motion.main style={{ minHeight: "100vh", backgroundColor: pageBgColor }}>
      {/* ── SECTION 1: HERO (PERMANENT FINAL V3 CLEAN GENERIC HEADER + FEATURED CAROUSEL) ── */}
      <BlogHeroV3 />

      {/* ── SECTIONS 2, 3, 4 & 5: UNIFIED SCROLL-DRIVEN CANVAS (Zero Horizontal Cuts) ── */}
      <div>
        {/* ── SECTION 2: EXPLORE BY CATEGORY (Circle Category Select + 3-Col Cards Grid) ── */}
        <BlogCategoryExplore articles={ARTICLES_DIRECTORY_DATA} />

        {/* ── SECTION 3: MEDICAL EXPERTS SECTION (Doctor Cards in refDoctorCard style) ── */}
        <BlogMedicalExperts scrollYProgress={bgTransitionProgress} />

        {/* Sentinel for smooth background scroll transition */}
        <div
          ref={transitionRef}
          style={{ height: "1px", width: "100%", pointerEvents: "none" }}
          aria-hidden="true"
        />

        {/* ── SECTION 4: BENTO GRID SECTION (Why Trust Narayana Health Knowledge) ── */}
        <BlogBentoGrid scrollYProgress={bgTransitionProgress} />

        {/* ── SECTION 5: CTA BANNER (Talk to a Specialist / Book Appointment) ── */}
        <BlogCtaBanner bg="transparent" />
      </div>

      {/* ── FLOATING CLINICAL SIDE ACTIONS (Book Consultation, Call, Ask Pulse AI) ── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nConsultation"}
        conditionTitle="Health Guides"
        pulseQuery="I have questions about a recent symptom or want to know more about Narayana Health clinical guides."
        isScrolled={isScrolled}
      />
    </motion.main>
  );
}

export default function ArticlesLibraryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060e1b" }} />}>
      <ArticlesLibraryInner />
    </Suspense>
  );
}
