"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useTransform, useMotionValue } from "framer-motion";
import BlogHero from "@/components/blog/BlogHero";
import BlogHeroV2 from "@/components/blog/BlogHeroV2";
import BlogHeroV3 from "@/components/blog/BlogHeroV3";
import BlogVersionController, { BlogVersionId } from "@/components/blog/BlogVersionController";
import BlogCategoryExplore from "@/components/blog/BlogCategoryExplore";
import BlogMedicalExperts from "@/components/blog/BlogMedicalExperts";
import BlogBentoGrid from "@/components/blog/BlogBentoGrid";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";

function ArticlesLibraryInner() {
  const searchParams = useSearchParams();
  const queryVersion = searchParams?.get("v") || searchParams?.get("version");

  const [activeVersion, setActiveVersion] = useState<BlogVersionId>(3); // Default to V3 (Clean Generic Hero + Featured Carousel Below)

  // Initialize from query param
  useEffect(() => {
    if (queryVersion === "3") {
      setActiveVersion(3);
    } else if (queryVersion === "2") {
      setActiveVersion(2);
    } else if (queryVersion === "1") {
      setActiveVersion(1);
    }
  }, [queryVersion]);
  const [isScrolled, setIsScrolled] = useState(false);

  const transitionRef = useRef<HTMLDivElement>(null);
  const bgTransitionProgress = useMotionValue(0);

  useEffect(() => {
    const updateTransition = () => {
      const el = transitionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;

      // Keep background 100% pure white (#ffffff) while viewing BlogCategoryExplore
      // and BlogMedicalExperts. Only transition when the sentinel below the doctor
      // cards rises from 68% vh to 28% vh as the Bento section enters the viewport.
      const startY = vh * 0.68;
      const endY = vh * 0.28;
      const raw = (startY - rect.top) / (startY - endY);
      const clamped = Math.max(0, Math.min(1, raw));
      bgTransitionProgress.set(clamped);
    };

    updateTransition();
    window.addEventListener("scroll", updateTransition, { passive: true });
    window.addEventListener("resize", updateTransition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateTransition);
      window.removeEventListener("resize", updateTransition);
    };
  }, [bgTransitionProgress]);

  const pageBgColor = useTransform(
    bgTransitionProgress,
    [0, 1],
    ["#ffffff", "#060c18"]
  );

  const handleVersionChange = (newVersion: BlogVersionId) => {
    setActiveVersion(newVersion);
    try {
      localStorage.setItem("nh_blog_version", String(newVersion));
    } catch {
      // Ignore
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(newVersion));
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-bg, #ffffff)" }}>
      {/* ── FLOATING VERSION CONTROLLER (ON SCREEN AT SIDE: V1 / V2 SWITCHER) ── */}
      <BlogVersionController
        activeVersion={activeVersion}
        onVersionChange={handleVersionChange}
      />

      {/* ── SECTION 1: HERO (V1 GRID SHOWCASE, V2 IMMERSIVE DECK, OR V3 GENERIC HEADER + FEATURED CAROUSEL) ── */}
      {activeVersion === 1 ? (
        <BlogHero />
      ) : activeVersion === 2 ? (
        <BlogHeroV2 />
      ) : (
        <BlogHeroV3 />
      )}

      {/* ── SECTIONS 2, 3, 4 & 5: UNIFIED SCROLL-DRIVEN CANVAS (Zero Horizontal Cuts) ── */}
      <motion.div style={{ backgroundColor: pageBgColor }}>
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
      </motion.div>

      {/* ── FLOATING CLINICAL SIDE ACTIONS (Book Consultation, Call, Ask Pulse AI) ── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nConsultation"}
        conditionTitle="Health Guides"
        pulseQuery="I have questions about a recent symptom or want to know more about Narayana Health clinical guides."
        isScrolled={isScrolled}
      />
    </main>
  );
}

export default function ArticlesLibraryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060e1b" }} />}>
      <ArticlesLibraryInner />
    </Suspense>
  );
}
