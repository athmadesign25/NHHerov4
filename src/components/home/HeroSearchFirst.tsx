"use client";

import React, { useState, useRef, useEffect } from "react";
import { useScroll, useSpring, useTransform, useMotionValueEvent, motion } from "framer-motion";
import styles from "./HeroSearchFirst.module.css";

import StatCarousel from "@/features/home/hero/components/StatCarousel";
import HeroHeadline from "@/features/home/hero/components/HeroHeadline";
import HeroSearch from "@/features/home/hero/components/search/HeroSearch";

export default function HeroSearchFirst() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 1,
    restDelta: 0.001
  });

  // Stage 1 (0 -> 0.50): Scale down from 1.0 to 0.75
  // Stage 2 (0.50 -> 1.0): Lock scale at 0.75
  const heroScale = useTransform(
    smoothProgress,
    [0, 0.05, 0.50, 1],
    [1, 1, 0.75, 0.75]
  );

  // Border radius rounds during scale-down, then stays locked
  const heroRadius = useTransform(
    smoothProgress,
    [0, 0.05, 0.50, 1],
    ["0px", "0px", "24px", "24px"]
  );

  // Stage 1 (0 -> 0.50): Y stays locked at 0px
  // Stage 2 (0.50 -> 1.0): Y moves smoothly upward
  const heroY = useTransform(
    smoothProgress,
    [0, 0.50, 1],
    ["0px", "0px", "-140px"]
  );



  // Control video playback based on search state or Pulse AI state
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    
    if (videoRef.current) {
      if (isOpen || isPulseActive) {
        let rate = videoRef.current.playbackRate;
        intervalId = setInterval(() => {
          if (videoRef.current && (isOpen || isPulseActive)) {
            rate -= 0.05; 
            if (rate <= 0.1) {
              videoRef.current.pause();
              videoRef.current.playbackRate = 1.0; 
            } else {
              videoRef.current.playbackRate = rate;
            }
          } else {
            clearInterval(intervalId);
          }
        }, 30); 
      } else {
        clearInterval(intervalId);
        videoRef.current.playbackRate = 1.0;
        videoRef.current.play().catch((err) => {
          console.log("Playback prevented:", err);
        });
      }
    }
    return () => clearInterval(intervalId);
  }, [isOpen, isPulseActive]);

  return (
    <div ref={containerRef} data-nav-theme="light" style={{ height: "185vh", position: "relative", zIndex: isPulseActive ? 9999 : 1, background: "transparent" }}>
      <motion.section 
        className={styles.hero} 
        id="hero-section-search-first"
        data-nav-theme="dark"
        style={{
          scale: heroScale,
          borderRadius: heroRadius,
          y: heroY,
        }}
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
          <StatCarousel isOpen={isOpen} />
        </div>

        <div className={styles.centerWrap}>
          <div className={styles.heroStack}>
            <HeroHeadline isOpen={isOpen} />
            <HeroSearch 
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              isPulseActive={isPulseActive}
              onPulseActiveChange={setIsPulseActive}
            />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
