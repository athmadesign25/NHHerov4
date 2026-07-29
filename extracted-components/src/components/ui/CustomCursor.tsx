"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Dot follows mouse directly, cursor lags
  const dotSpring = { damping: 35, stiffness: 400, mass: 0.2 };
  const dotX = useSpring(mouseX, dotSpring);
  const dotY = useSpring(mouseY, dotSpring);

  const [hoverState, setHoverState] = useState<"default" | "link" | "button" | "image">("default");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest("a, button, [data-cursor]");
      if (!el) {
        setHoverState("default");
        return;
      }
      const cursor = el.getAttribute("data-cursor");
      if (cursor) {
        setHoverState(cursor as "link" | "button" | "image");
      } else if (el.tagName === "BUTTON" || el.closest("button")) {
        setHoverState("button");
      } else {
        setHoverState("link");
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [isVisible, mouseX, mouseY]);

  const cursorScale = hoverState === "button" ? 2.2 : hoverState === "link" ? 1.6 : 1;
  const dotScale = hoverState !== "default" ? 0 : 1;

  return (
    <>
      {/* Main cursor blob */}
      <motion.div
        className={`${styles.cursor} ${hoverState === "button" ? styles.cursorButton : ""}`}
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
          scale: cursorScale,
        }}
        transition={{ scale: { type: "spring", damping: 18, stiffness: 300 } }}
      />
      {/* Precision dot */}
      <motion.div
        className={styles.dot}
        style={{
          x: dotX,
          y: dotY,
          opacity: isVisible ? 1 : 0,
          scale: dotScale,
        }}
        transition={{ scale: { type: "spring", damping: 20, stiffness: 400 } }}
      />
    </>
  );
}
