"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroSearchFirst from "@/components/home/HeroSearchFirst";
import CentreOfExcellence from "@/components/home/CentreOfExcellence";
import WhyChooseNH from "@/components/home/WhyChooseNH";
import HealthPackages from "@/components/home/HealthPackages";
import PatientStories from "@/components/home/PatientStories";
import ChairmanQuote from "@/components/home/ChairmanQuote";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";

export default function HomePage() {
  const patientStoriesRef = useRef<HTMLDivElement>(null);

  // Track the scroll position as Patient Stories enters and exits viewport
  const { scrollYProgress } = useScroll({
    target: patientStoriesRef,
    offset: ["start 85%", "end 20%"],
  });

  // Seamless natural color transition: #F7F6F2 (Light) ➔ #061323 (Dark Navy) ➔ #FCFCFC (Light)
  const dynamicBgColor = useTransform(
    scrollYProgress,
    [0.0, 0.28, 0.72, 1.0],
    ["#F7F6F2", "#061323", "#061323", "#FCFCFC"]
  );

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "clip", background: "transparent" }}>
      {/* ─── Seamless Global Scroll-Driven Background Layer (Zero Cutoff Lines) ─── */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: dynamicBgColor,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <FloatingQuickActions />

      {/* ─── ZONE 1: HERO ────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 100, background: "transparent" }}>
        <HeroSearchFirst />
      </div>

      {/* ─── ZONE 2: CENTRES OF EXCELLENCE ──────────────────────────── */}
      <div style={{ position: "relative", zIndex: 90, background: "transparent" }}>
        <CentreOfExcellence />
      </div>

      {/* ─── ZONE 3: PATIENT STORIES ────────────────────────────────── */}
      <div ref={patientStoriesRef} style={{ position: "relative", zIndex: 80, background: "transparent" }}>
        <PatientStories />
      </div>

      {/* ─── ZONE 4: HEALTH PACKAGES ────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 70, background: "transparent" }}>
        <HealthPackages />
      </div>

      {/* ─── ZONE 5: WHY CHOOSE NH ──────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 60, background: "transparent" }}>
        <WhyChooseNH />
      </div>

      {/* ─── ZONE 6: CHAIRMAN QUOTE (Pinned sticky background) ───────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 15 }}>
        <ChairmanQuote />
      </div>

      {/* ─── ZONE 7: APP DOWNLOAD BANNER (Overlays ChairmanQuote) ────── */}
      <div style={{ position: "relative", zIndex: 25 }}>
        <AppDownloadBanner />
      </div>
    </div>
  );
}
