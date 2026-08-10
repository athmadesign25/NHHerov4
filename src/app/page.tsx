"use client";

import React, { useEffect, useRef } from "react";
import HeroSearchFirst from "@/components/home/HeroSearchFirst";
import CentreOfExcellence from "@/components/home/CentreOfExcellence";
import WhyChooseNH from "@/components/home/WhyChooseNH";
import HealthPackages from "@/components/home/HealthPackages";

import PatientStories from "@/components/home/PatientStories";
import ChairmanQuote from "@/components/home/ChairmanQuote";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      
      // Calculate scale (from 1 to 0.90) and opacity (from 1 to 0.15) based on scroll
      const threshold = window.innerHeight; // 1 viewport height
      const progress = Math.min(1, scrollY / threshold);
      
      const scale = 1 - progress * 0.10; // Shrinks to 90%
      const opacity = 1 - progress * 0.85; // Fades to 15% opacity
      const translateY = progress * 100; // Parallax translate down slightly
      
      // Apply styles to the outer hero container
      heroRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      heroRef.current.style.opacity = `${opacity}`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: "#0b0f19" }}>
      <FloatingQuickActions />
      
      {/* Wrapper to apply the high-performance 3D perspective scale reveal */}
      <div 
        ref={heroRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 0,
          width: "100%",
          height: "100vh",
          transformOrigin: "center bottom",
          willChange: "transform, opacity"
        }}
      >
        <HeroSearchFirst />
      </div>
      
      {/* Wrapper for the rest of the content */}
      <div 
        style={{ 
          position: "relative", 
          zIndex: 10, 
          background: "#ffffff"
        }}
      >
        {/* Dark theme section block with a premium glowing split divider */}
        <div style={{ background: "#090d16", position: "relative", zIndex: 11 }}>
          {/* Subtle neon gradient border line at top boundary */}
          <div style={{
            height: "1px",
            background: "linear-gradient(to right, transparent, rgba(6, 182, 212, 0.4), rgba(99, 102, 241, 0.4), transparent)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 15
          }} />
          
          <CentreOfExcellence />
          <HealthPackages />
        </div>

        <PatientStories />
        <WhyChooseNH />
        <ChairmanQuote />
        <AppDownloadBanner />
      </div>
    </div>
  );
}
