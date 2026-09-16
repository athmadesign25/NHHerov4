"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import styles from "./HeroSearchFirst.module.css";
import { useAuthState } from "@/hooks/useAuthState";
import { useHeroSearch } from "@/hooks/useHeroSearch";

import HeroHeadline from "@/features/home/hero/components/HeroHeadline";
import HeroStats from "@/features/home/hero/components/HeroStats";
import HeroSearchBar from "@/features/home/hero/components/HeroSearchBar";
import HeroPulseEntry from "@/features/home/hero/components/HeroPulseEntry";

const AI_SUGGESTIONS = [
  "Book Doctors",
  "Find Specialties",
  "Find Treatment"
];

export default function HeroSearchFirst() {
  const [hasOpened, setHasOpened] = useState(false);
  const [aiSuggestionIdx, setAiSuggestionIdx] = useState(0);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [isPulseAnalyzed, setIsPulseAnalyzed] = useState(false);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [pulseInitialAction, setPulseInitialAction] = useState<string | null>(null);
  const [pulseInitialActionData, setPulseInitialActionData] = useState<any>(null);

  const [currentStatGroup, setCurrentStatGroup] = useState(0);

  const { isUserLoggedIn } = useAuthState();
  
  const searchProps = useHeroSearch(() => {
    setIsPulseActive(false);
  });
  
  const { searchQuery, setSearchQuery, isOpen, setIsOpen } = searchProps;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatGroup((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiSuggestionIdx((prev) => (prev + 1) % AI_SUGGESTIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPastHero(window.scrollY >= 180);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenPulse = () => {
      setHasOpened(true);
      setIsPulseActive(true);
      setTimeout(() => setIsPulseAnalyzed(true), 300);
      setSearchQuery("");
      setHasSubmittedQuery(false);
    };
    window.addEventListener("openPulseAI", handleOpenPulse);
    return () => window.removeEventListener("openPulseAI", handleOpenPulse);
  }, [setSearchQuery]);

  useEffect(() => {
    if (isPulseActive) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        setIsPulseAnalyzed(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPulseActive]);

  const searchRef = useRef<HTMLFormElement>(null!);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const P_SPLIT = 0.375;
  const heroScale = useTransform(scrollYProgress, [0, P_SPLIT, 1], [1, 0.75, 0.75]);
  const heroRadius = useTransform(scrollYProgress, [0, P_SPLIT, 1], ["0px", "20px", "20px"]);
  const heroBlur = useTransform(scrollYProgress, [0, P_SPLIT, 1], ["blur(0px)", "blur(0px)", "blur(20px)"]);
  const heroY = useTransform(scrollYProgress, [0, P_SPLIT, 1], ["0vh", "0vh", "-100vh"]);

  return (
    <div ref={containerRef} className={styles.heroWrapper} style={{ zIndex: isPulseActive ? 9999 : 1 }}>
      <motion.section 
        className={styles.hero} 
        id="hero-section-search-first"
        style={{ scale: heroScale, borderRadius: heroRadius, filter: heroBlur }}
      >
        <video
          ref={videoRef}
          src="/videos/Hero-Video-New.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.bgVideo}
        />
        <div className={`${styles.videoOverlay} ${isOpen && !isPulseActive ? styles.videoOverlayActive : ""}`} />

        <div className={styles.metricsSideWrap}>
          <HeroStats isOpen={isOpen} currentStatGroup={currentStatGroup} />
        </div>

        <div className={styles.centerWrap}>
          <div className={styles.heroStack}>
            <HeroHeadline isOpen={isOpen} />
            
            <HeroSearchBar 
              searchProps={searchProps} 
              searchRef={searchRef}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              hasOpened={hasOpened}
              setHasOpened={setHasOpened}
              isScrolledPastHero={isScrolledPastHero}
              isPulseActive={isPulseActive}
              setIsPulseActive={setIsPulseActive}
              aiSuggestionIdx={aiSuggestionIdx}
              isUserLoggedIn={isUserLoggedIn}
            />
            
          </div>
        </div>
      </motion.section>

      <HeroPulseEntry 
        isPulseActive={isPulseActive}
        setIsPulseActive={setIsPulseActive}
        isPulseAnalyzed={isPulseAnalyzed}
        hasSubmittedQuery={hasSubmittedQuery}
        setHasSubmittedQuery={setHasSubmittedQuery}
        pulseInitialAction={pulseInitialAction}
        pulseInitialActionData={pulseInitialActionData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isUserLoggedIn={isUserLoggedIn}
      />
    </div>
  );
}
