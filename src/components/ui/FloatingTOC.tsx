"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FloatingTOC.module.css";

export interface TOCItem {
  id: string;
  label: string;
}

interface FloatingTOCProps {
  items: TOCItem[];
  defaultActiveId?: string;
}

export default function FloatingTOC({ items, defaultActiveId }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>(defaultActiveId || (items[0]?.id ?? ""));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const rafRef = useRef<number | null>(null);

  // Probe the section behind the TOC to switch dark/light dash colors
  useEffect(() => {
    const probeTheme = () => {
      // TOC sits at left:12px, vertically centered — probe slightly to the right to hit the page body
      const probeX = 100;
      const probeY = window.innerHeight / 2;
      const elements = document.elementsFromPoint(probeX, probeY);
      let dark = true; // default to dark (hero)
      for (const el of elements) {
        // Skip the TOC itself and navbar
        if (el.closest("aside") || el.closest("nav")) continue;
        const themeEl = el.closest("[data-nav-theme]");
        if (themeEl) {
          dark = themeEl.getAttribute("data-nav-theme") === "dark";
          break;
        }
      }
      setIsDarkTheme(dark);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(probeTheme);
    };

    probeTheme(); // run immediately on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", probeTheme, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", probeTheme);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Scroll-based active section tracker — much smoother than IntersectionObserver
  useEffect(() => {
    if (!items.length) return;

    const TRIGGER_RATIO = 0.35; // section is "active" once its top crosses this % from viewport top

    const updateActive = () => {
      const triggerY = window.innerHeight * TRIGGER_RATIO;
      let currentId = items[0].id;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // If this section's top has crossed above the trigger line, it's the current section
        if (top <= triggerY) {
          currentId = item.id;
        }
      }

      setActiveId(currentId);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActive);
    };

    updateActive(); // set immediately on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    const navHeight = 72;
    const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (!items.length) return null;

  const themeClass = isDarkTheme ? styles.themeDark : styles.themeLight;

  return (
    <aside
      className={`${styles.tocWrapper} ${themeClass}`}
      role="navigation"
      aria-label="Table of contents"
    >
      <div className={styles.tocInner}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              className={styles.tocItem}
              role="link"
              tabIndex={0}
              aria-label={item.label}
              aria-current={isActive ? "true" : undefined}
              onClick={() => handleScrollTo(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleScrollTo(item.id);
                }
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Dash Line Indicator */}
              <div
                className={`${styles.dash} ${isActive ? styles.dashActive : ""} ${isHovered ? styles.dashHovered : ""}`}
              />

              {/* Hover Floating Tooltip Badge */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, x: -6, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -6, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={styles.tooltipLabel}>{item.label}</span>
                    <span className={styles.tooltipArrow} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
