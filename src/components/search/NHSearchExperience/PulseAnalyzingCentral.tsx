"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
import styles from "./NHSearchExperience.module.css";

interface PulseAnalyzingCentralProps {
  query: string;
  selectedLocation: string;
}

export default function PulseAnalyzingCentral({
  query,
  selectedLocation = "Bangalore",
}: PulseAnalyzingCentralProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    `Analysing clinical intent & symptoms for “${query}”…`,
    `Matching verified specialists & departments in ${selectedLocation}…`,
    `Verifying slot availability & diagnostic care in ${selectedLocation}…`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 700);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className={styles.pulseAnalyzingCentralWrap}>
      {/* ── Above the Star: Finding Results & Clinical Intelligence Text ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <div className={styles.pulseAnalyzingBadge}>
          <Sparkles size={13} className={styles.pulseAnalyzingBadgeIcon} />
          <span>Pulse Clinical Intelligence</span>
        </div>

        <h2 className={styles.pulseAnalyzingTitle}>
          Finding results &amp; clinical intelligence
        </h2>

        <p className={styles.pulseAnalyzingSubtitle}>
          Pulse AI is finding results &amp; analysing clinical intent for{" "}
          <strong>&ldquo;{query}&rdquo;</strong> in {selectedLocation}…
        </p>
      </motion.div>

      {/* ── Center: Animated Pulse AI Star / Lottie Orb with Ambient Aura ── */}
      <motion.div
        className={styles.pulseAnalyzingLottieWrap}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.pulseAnalyzingGlowAura} />
        <div className={styles.pulseAnalyzingLottieBox}>
          <Lottie animationData={pulseAnimation} loop={true} />
        </div>
      </motion.div>

      {/* ── Below the Star: Cycling Clinical Matching Step Pill ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
      >
        <div className={styles.pulseAnalyzingStepPill}>
          <span className={styles.pulseAnalyzingStepDot} />
          <AnimatePresence mode="wait">
            <motion.span
              key={stepIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.22 }}
            >
              {steps[stepIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
