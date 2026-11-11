"use client";

import { useEffect, type ComponentPropsWithRef } from "react";
import { useReducedMotion } from "framer-motion";
import { duration } from "@/lib/motion";
import TextSweepEffect from "./TextSweepEffect";
import styles from "./JourneyHeading.module.css";

interface Props extends Omit<ComponentPropsWithRef<"h1">, "children"> {
  children: string;
  tone?: "brand" | "success";
  onSweepComplete?: () => void;
}

/** The same decorative wipe used in doctor discovery and booking confirmation. */
export default function JourneyHeading({ children, tone = "brand", onSweepComplete, className = "", ...props }: Props) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) onSweepComplete?.();
  }, [reduced, onSweepComplete]);

  return <h1 {...props} className={`${styles.heading} ${className}`}>
    {children}
    <span className={styles.sweep} aria-hidden="true">
      <TextSweepEffect key={`${tone}-${children}`} words={[children]} sweepMs={duration.slowest * 2000}
        active={!reduced} onSweepComplete={onSweepComplete}
        sweepColor={tone === "success" ? "var(--journey-paper-success)" : "var(--color-heading-wipe, var(--color-primary))"}
        sweepHighlightColor={tone === "success" ? "var(--color-success)" : undefined}
        finalColor="var(--color-text)" />
    </span>
  </h1>;
}
