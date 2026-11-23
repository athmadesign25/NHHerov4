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

  // Unified scroll handler for active section tracking and dynamic theme probing
  useEffect(() => {
    if (!items.length) return;

    const probeAndTrack = () => {
      // 1. Determine active section based on scroll position
      const triggerY = window.innerHeight * 0.35;
      let currentId = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= triggerY) {
          currentId = item.id;
        }
      }
      setActiveId(currentId);

      // 2. Determine theme (dark vs light) based on what sits directly behind TOC
      const probeX = Math.min(Math.max(window.innerWidth * 0.15, 60), 200);
      const probeY = window.innerHeight / 2;
      const elements = document.elementsFromPoint(probeX, probeY);
      let dark: boolean | null = null;

      // 2a. Probe actual computed background color of elements directly under TOC (skip fixed footer)
      for (const el of elements) {
        if (el.closest("aside") || el.closest("nav") || el.closest("footer") || el.tagName === "HTML" || el.tagName === "BODY") continue;
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (match) {
            const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
            if (a > 0.2) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              dark = luminance < 0.5;
              break;
            }
          }
        }
      }

      // 2b. If no direct non-transparent background found, check data-nav-theme attribute (skipping footer)
      if (dark === null) {
        for (const el of elements) {
          if (el.closest("aside") || el.closest("nav") || el.closest("footer")) continue;
          const themeEl = el.closest("[data-nav-theme]");
          if (themeEl && !themeEl.closest("footer")) {
            dark = themeEl.getAttribute("data-nav-theme") === "dark";
            break;
          }
        }
      }

      // 2c. Fallback to active section's background or theme
      if (dark === null) {
        const activeEl = document.getElementById(currentId);
        if (activeEl && !activeEl.closest("footer")) {
          const activeBg = window.getComputedStyle(activeEl).backgroundColor;
          if (activeBg && activeBg !== "transparent" && activeBg !== "rgba(0, 0, 0, 0)") {
            const match = activeBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              dark = luminance < 0.5;
            }
          }
          if (dark === null) {
            const themeEl = activeEl.closest("[data-nav-theme]") || (activeEl.hasAttribute("data-nav-theme") ? activeEl : null);
            if (themeEl && !themeEl.closest("footer")) {
              dark = themeEl.getAttribute("data-nav-theme") === "dark";
            }
          }
        }
      }

      setIsDarkTheme(dark ?? true);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(probeAndTrack);
    };

    probeAndTrack();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", probeAndTrack, { passive: true });

    // Also listen to Lenis scroll if present
    const lenis = (window as unknown as { lenis?: { on?: (evt: string, fn: () => void) => void; off?: (evt: string, fn: () => void) => void } }).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", onScroll);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", probeAndTrack);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", onScroll);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
