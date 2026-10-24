"use client";

import React, { memo, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./LiquidMetalEdge.module.css";

export interface LiquidMetalEdgeProps {
  /** Ring thickness in px. */
  borderWidth?: number;
  /** Base colour of the metal. */
  colorBack?: string;
  /** Highlight/chrome colour. */
  colorTint?: string;
  speed?: number;
  repetition?: number;
  distortion?: number;
  scale?: number;
  /** Overall strength of the ring, for dialling it back against bright art. */
  opacity?: number;
  className?: string;
}

/**
 * Liquid-metal glow drawn as an edge only.
 *
 * The stylesheet masks the content-box out of it so only a `borderWidth`-thick ring is visible,
 * leaving whatever the host element paints in the middle untouched.
 */
export const LiquidMetalEdge = memo(function LiquidMetalEdge({
  borderWidth = 1,
  colorBack = "#5a606b",
  colorTint = "#aab3c2",
  opacity = 0.9,
  className,
}: LiquidMetalEdgeProps) {
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!isDesktop || reduceMotion) return null;

  return (
    <span
      className={`${styles.edge}${className ? ` ${className}` : ""}`}
      style={{ padding: borderWidth, opacity }}
      aria-hidden="true"
    >
      <span
        className={styles.shaderHost}
        style={{
          background: `conic-gradient(from 45deg at 50% 50%, ${colorBack} 0%, ${colorTint} 25%, ${colorBack} 50%, ${colorTint} 75%, ${colorBack} 100%)`,
        }}
      />
    </span>
  );
});

export default LiquidMetalEdge;
