"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const SWEEP_EASE = [0.2, 0, 0.3, 0.3];
const FADE_MS = 250;
const GAP_MS = 70;

export default function TextSweepEffect({
  words,
  sweepMs = 1500,
  delayMs = 0,
  className = "",
  finalColor = "#000000",
  active,
}: {
  words: string[];
  sweepMs?: number;
  delayMs?: number;
  holdMs?: number;
  className?: string;
  finalColor?: string;
  active?: boolean;
}) {
  const word = words?.[0] ?? "";
  const isControlled = typeof active === "boolean";
  const gradient = `
    linear-gradient(90deg,
      ${finalColor} 0%, ${finalColor} 40%,
      #034EA2 48%,
      #ED1C24 56%,
      transparent 64%, transparent 100%
    )
  `;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", overflow: "hidden" }}>
      <span
        aria-live="polite"
        className={className}
        style={{ position: "relative", display: "inline" }}
      >
        <motion.span
          style={{
            display: "inline",
            backgroundOrigin: "padding-box",
            backgroundImage: gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            backgroundRepeat: "no-repeat",
            backgroundSize: "400% 100%",
            willChange: "background-position, filter",
            filter: "blur(var(--blur))",
          }}
          initial={{ backgroundPositionX: "100%", "--blur": "4px" } as any}
          animate={isControlled ? (active ? { backgroundPositionX: "0%", "--blur": ["4px", "0.5px", "0px"] } : {}) : undefined}
          whileInView={!isControlled ? { backgroundPositionX: "0%", "--blur": ["4px", "0.5px", "0px"] } as any : undefined}
          viewport={!isControlled ? { once: true, amount: 0.3 } : undefined}
          transition={{
            backgroundPositionX: { duration: sweepMs / 1000, delay: delayMs / 1000, ease: SWEEP_EASE },
            "--blur": { duration: sweepMs / 1000, delay: delayMs / 1000, times: [0, 0.8, 1], ease: "easeOut" },
          }}
        >
          {word}
        </motion.span>
      </span>
    </div>
  );
}
