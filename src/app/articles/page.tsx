"use client";

import React, { useState, useEffect } from "react";
import BlogHero from "@/components/blog/BlogHero";
import BlogCategoryExplore from "@/components/blog/BlogCategoryExplore";
import BlogMedicalExperts from "@/components/blog/BlogMedicalExperts";
import BlogBentoGrid from "@/components/blog/BlogBentoGrid";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";

export default function ArticlesLibraryPage() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      {/* ── SECTION 1: HERO (Main Featured Blog + 3 Glassmorphism Sub-Cards) ── */}
      <BlogHero />

      {/* ── SECTION 2: EXPLORE BY CATEGORY (Circle Category Select + 3-Col Cards Grid) ── */}
      <BlogCategoryExplore articles={ARTICLES_DIRECTORY_DATA} />

      {/* ── SECTION 3: MEDICAL EXPERTS SECTION (Doctor Cards in refDoctorCard style) ── */}
      <BlogMedicalExperts />

      {/* ── SECTION 4: BENTO GRID SECTION (Why Trust Narayana Health Knowledge) ── */}
      <BlogBentoGrid />

      {/* ── SECTION 5: CTA BANNER (Talk to a Specialist / Book Appointment) ── */}
      <BlogCtaBanner />

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
