"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import styles from "./CsrTransitionBridge.module.css";

export default function CsrTransitionBridge() {
  const bridgeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bridgeRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.8,
  });

  // Dynamic atmospheric light beam translation & expansion on scroll
  const glowY = useTransform(smoothProgress, [0, 1], [-80, 80]);
  const glowScale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1.15, 0.95]);
  const quoteOpacity = useTransform(smoothProgress, [0.15, 0.45, 0.85], [0, 1, 0.3]);
  const quoteY = useTransform(smoothProgress, [0.15, 0.5], [30, 0]);

  return (
    <div ref={bridgeRef} className={styles.transitionBridgeWrapper} aria-hidden="false">
      {/* Dynamic Ambient Light Glow that follows scroll */}
      <motion.div
        className={styles.dynamicGlow}
        style={{
          y: glowY,
          scale: glowScale,
        }}
      />

      {/* Luminous Horizon Radial Wave */}
      <div className={styles.horizonWave} />

      {/* Narrative Bridge Quote from Founder Dr. Devi Shetty */}
      <motion.div
        className={styles.bridgeContent}
        style={{
          opacity: quoteOpacity,
          y: quoteY,
        }}
      >
        <div className={styles.bridgeEyebrow}>
          <span>GRASSROOTS IMPACT ECOSYSTEM</span>
        </div>
        <blockquote className={styles.bridgeQuote}>
          &ldquo;Healthcare is not a privilege for the few — it is a fundamental human right we deliver to India&rsquo;s most vulnerable doorsteps.&rdquo;
        </blockquote>
        <div className={styles.bridgeAuthor}>
          <span className={styles.authorName}>Dr. Devi Prasad Shetty</span>
          <span className={styles.authorTitle}>Founder &amp; Chairman, Narayana Health</span>
        </div>
      </motion.div>
    </div>
  );
}
