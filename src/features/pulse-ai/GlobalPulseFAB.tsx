"use client";

import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import styles from "./GlobalPulseFAB.module.css";
import PulseAIWorkspace from "./PulseAIWorkspace";

export default function GlobalPulseFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  // Show explainer briefly on load
  useEffect(() => {
    const timer1 = setTimeout(() => setShowExplainer(true), 2000);
    const timer2 = setTimeout(() => setShowExplainer(false), 8000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <div className={styles.fabContainer}>
        <div className={`${styles.explainerBox} ${showExplainer ? styles.explainerBoxVisible : ""}`}>
          <div className={styles.explainerTitle}>Ask Pulse AI</div>
          <div className={styles.explainerSubtitle}>Your smart health assistant</div>
        </div>
        
        <button 
          className={styles.fabButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open Pulse AI"
        >
          <div className={styles.pulseAnim}>
            <Lottie animationData={pulseAnimation} loop={true} />
          </div>
        </button>
      </div>

      {isOpen && (
        <PulseAIWorkspace onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
