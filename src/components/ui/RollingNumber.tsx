"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import styles from "./RollingNumber.module.css";

const DIGIT_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface RollingNumberProps {
  value: string | number;
  className?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
}

function RollingDigit({
  digit,
  delay,
  duration,
  isInView,
}: {
  digit: number;
  delay: number;
  duration: number;
  isInView: boolean;
}) {
  const targetIndex = 10 + digit;
  const targetPercent = targetIndex * 5; // 100% / 20 items = 5% per item

  return (
    <span className={styles.digitSlot} aria-hidden="true">
      <motion.span
        className={styles.digitTrack}
        initial={{ y: "0%" }}
        animate={isInView ? { y: `-${targetPercent}%` } : { y: "0%" }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {DIGIT_SEQUENCE.map((d, idx) => (
          <span key={idx} className={styles.digitItem}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export default function RollingNumber({
  value,
  className = "",
  duration = 1.1,
  delay = 0.1,
  stagger = 0.07,
}: RollingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const strValue = String(value);

  // If user prefers reduced motion or before client mount, render static text
  if (prefersReducedMotion || !hasMounted) {
    return (
      <span ref={ref} className={`${styles.rollingWrapper} ${className}`}>
        {strValue}
      </span>
    );
  }

  const chars = strValue.split("");
  let digitCount = 0;

  return (
    <span
      ref={ref}
      className={`${styles.rollingWrapper} ${className}`}
      aria-label={strValue}
    >
      {chars.map((char, index) => {
        const isDigit = /\d/.test(char);
        if (isDigit) {
          const currentDigit = parseInt(char, 10);
          const currentDelay = delay + digitCount * stagger;
          digitCount++;
          return (
            <RollingDigit
              key={index}
              digit={currentDigit}
              delay={currentDelay}
              duration={duration}
              isInView={isInView}
            />
          );
        }

        return (
          <span key={index} className={styles.nonDigit}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
