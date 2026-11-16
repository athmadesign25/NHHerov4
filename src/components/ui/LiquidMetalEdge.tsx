"use client";

import React, { memo, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { LiquidMetal } from "@paper-design/shaders-react";
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
 * The shader itself paints a full rectangle; the stylesheet masks the
 * content-box out of it so only a `borderWidth`-thick ring is visible,
 * leaving whatever the host element paints in the middle untouched. Sits
 * absolutely inside a `position: relative` host and inherits its radius, so
 * it follows a host whose corner radius animates.
 *
 * It renders nothing at all below 900px or under reduced-motion rather than
 * rendering and hiding: this mounts a live WebGL context, which is worth
 * avoiding entirely on phones and pointless for someone who has asked the
 * interface to stop moving.
 */
export const LiquidMetalEdge = memo(function LiquidMetalEdge({
  borderWidth = 1,
  // Darker base and a cool silver highlight rather than the shader's stock
  // light grey on pure white. On a ring only a few pixels wide there is no
  // room for the full light-to-dark falloff, so the bright lobes land
  // side by side and the whole stroke reads as white; pulling both ends
  // down keeps the travelling highlight while leaving dark metal between.
  colorBack = "#5a606b",
  colorTint = "#aab3c2",
  speed = 0.5,
  repetition = 4,
  distortion = 0.1,
  scale = 1,
  /** Overall strength of the ring, for dialling it back against bright art. */
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
      {/* Own wrapper rather than passing the class to <LiquidMetal>: the
          positioning above has to apply whether or not the library forwards
          className to its root node. */}
      <span className={styles.shaderHost}>
        <LiquidMetal
          colorBack={colorBack}
          colorTint={colorTint}
          speed={speed}
          repetition={repetition}
          distortion={distortion}
          softness={0}
          shiftRed={0.3}
          shiftBlue={-0.3}
          angle={45}
          shape="none"
          scale={scale}
          fit="cover"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </span>
    </span>
  );
});

export default LiquidMetalEdge;
