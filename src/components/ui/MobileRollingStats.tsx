"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MobileRollingStats.module.css";

export interface RollingStatItem {
  value?: number;
  suffix?: string;
  staticValue?: string;
  label: string;
}

interface MobileRollingStatsProps {
  items: RollingStatItem[];
  className?: string;
  intervalMs?: number;
}

export default function MobileRollingStats({
  items,
  className = "",
  intervalMs = 3200,
}: MobileRollingStatsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextStat = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(nextStat, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, nextStat, intervalMs, items.length]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const displayValue =
    current.staticValue || `${current.value ?? ""}${current.suffix || ""}`;

  return (
    <div
      className={`${styles.container} ${className}`}
      onClick={nextStat}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-live="polite"
      aria-label="Clinical credential parameters reel"
      title="Tap to view next credential"
    >
      <div className={styles.statTrack}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={styles.statItem}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.statValue}>{displayValue}</div>
            <div className={styles.statLabel}>{current.label}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.dotsContainer}>
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            aria-label={`Jump to stat ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
