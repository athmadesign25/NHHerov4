"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import styles from "./PulseAIFloatingEntry.module.css";

export default function PulseAIFloatingEntry() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling past the full-height hero section (100vh)
      setIsVisible(window.scrollY >= window.innerHeight - 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenPulse = () => {
    // Dispatch a custom event that HeroSearchFirst will listen for
    window.dispatchEvent(new CustomEvent("openPulseAI"));
  };

  return (
    <button
      className={`${styles.floatingButton} ${isVisible ? styles.visible : styles.hidden}`}
      onClick={handleOpenPulse}
      aria-label="Open Pulse AI"
    >
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.lottieWrapper}>
          <Lottie animationData={pulseAnimation} loop={true} />
        </div>
        <span className={styles.text}>Ask Pulse AI</span>
      </div>
    </button>
  );
}
