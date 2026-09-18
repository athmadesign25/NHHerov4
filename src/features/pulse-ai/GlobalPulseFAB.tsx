"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import styles from "./GlobalPulseFAB.module.css";
import PulseAIWorkspace from "./PulseAIWorkspace";

export default function GlobalPulseFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show explainer briefly on load
  useEffect(() => {
    const timer1 = setTimeout(() => setShowExplainer(true), 2000);
    const timer2 = setTimeout(() => setShowExplainer(false), 8000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Track scroll position to hide/show FAB when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY >= window.innerHeight - 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={styles.fabContainer}>
        <div className={`${styles.explainerBox} ${showExplainer ? styles.explainerBoxVisible : ""}`}>
          <div className={styles.explainerTitle}>Ask Pulse AI</div>
          <div className={styles.explainerSubtitle}>Your smart health assistant</div>
        </div>
        
        <AnimatePresence>
          {isVisible && (
            <motion.button 
              className={styles.fabButton}
              onClick={() => setIsOpen(true)}
              aria-label="Open Pulse AI"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div className={styles.pulseAnim} layoutId="shared-pulse-transition">
                <Lottie animationData={pulseAnimation} loop={true} />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {isOpen && (
        <PulseAIWorkspace onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
