"use client";

import React from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
import styles from "./NHSearchExperience.module.css";

interface PulseAnalyzingCentralProps {
  query: string;
  selectedLocation?: string;
}

export default function PulseAnalyzingCentral({
  query,
}: PulseAnalyzingCentralProps) {
  const cleanQuery = query?.trim() || "";

  return (
    <div className={styles.pulseAnalyzingCentralWrap}>
      {/* ── Center: Animated Pulse AI Lottie Orb with Ambient Aura ── */}
      <motion.div
        className={styles.pulseAnalyzingLottieWrap}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.pulseAnalyzingGlowAura} />
        <div className={styles.pulseAnalyzingLottieBox}>
          <Lottie animationData={pulseAnimation} loop={true} />
        </div>
      </motion.div>

      {/* ── Minimal Clean Status: Finding results ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.08, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h3 className={styles.pulseAnalyzingTitleSimple}>
          {cleanQuery ? `Finding results for “${cleanQuery}”…` : "Finding results…"}
        </h3>

        <div className={styles.pulseAnalyzingVoiceCaption}>
          <Volume2 size={14} className={styles.pulseAnalyzingVoiceIcon} />
          <span>&ldquo;Getting you the right care&rdquo;</span>
        </div>
      </motion.div>
    </div>
  );
}
