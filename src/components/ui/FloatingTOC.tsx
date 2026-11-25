"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import styles from "./FloatingTOC.module.css";

export interface TOCItem {
  id: string;
  label: string;
}

interface FloatingTOCProps {
  items: TOCItem[];
  defaultActiveId?: string;
  theme?: "light" | "dark";
}

export default function FloatingTOC({ items, defaultActiveId, theme }: FloatingTOCProps) {
  const [activeId, setActiveId] = useState<string>(defaultActiveId || (items[0]?.id ?? ""));
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(theme ? theme === "dark" : true);
  const tagRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Sync directly with theme prop passed from parent pinned bar
  useEffect(() => {
    if (theme) {
      setIsDarkTheme(theme === "dark");
    }
  }, [theme]);

  // Sync directly with global navbar/pinned bar theme on <html>
  useEffect(() => {
    if (typeof document === "undefined") return;

    const syncThemeWithNav = () => {
      const active = document.documentElement.getAttribute("data-nav-theme-active");
      if (active === "light") {
        setIsDarkTheme(false);
      } else if (active === "dark") {
        setIsDarkTheme(true);
      }
    };

    syncThemeWithNav();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-nav-theme-active") {
          syncThemeWithNav();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-nav-theme-active"],
    });

    return () => observer.disconnect();
  }, []);

  // Probe active section, scroll progress, and background theme
  const updateScrollAndTheme = useCallback(() => {
    if (!items.length) return;

    // 1. Calculate overall scroll progress (0.0 to 1.0)
    const docElem = document.documentElement;
    const docBody = document.body;
    const scrollTop = window.pageYOffset || docElem.scrollTop || docBody.scrollTop || 0;
    const scrollHeight = Math.max(
      docBody.scrollHeight,
      docElem.scrollHeight,
      docBody.offsetHeight,
      docElem.offsetHeight
    );
    const clientHeight = docElem.clientHeight || window.innerHeight;
    const totalScroll = scrollHeight - clientHeight;
    const progress = totalScroll > 0 ? Math.min(Math.max(scrollTop / totalScroll, 0), 1) : 0;
    setScrollProgress(progress);

    // 2. Determine active section based on scroll position
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

    // 3. Determine theme (dark vs light) - priority to active navbar/pinned bar theme
    const navThemeAttr = document.documentElement.getAttribute("data-nav-theme-active");
    if (navThemeAttr === "light") {
      setIsDarkTheme(false);
      return;
    } else if (navThemeAttr === "dark") {
      setIsDarkTheme(true);
      return;
    }

    const probeX = Math.min(Math.max(window.innerWidth * 0.15, 60), 200);
    const probeY = 120;
    const elements = document.elementsFromPoint(probeX, probeY);
    let dark: boolean | null = null;

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

    if (dark === null) {
      const activeEl = document.getElementById(currentId);
      if (activeEl && !activeEl.closest("footer")) {
        const themeEl = activeEl.closest("[data-nav-theme]") || (activeEl.hasAttribute("data-nav-theme") ? activeEl : null);
        if (themeEl && !themeEl.closest("footer")) {
          dark = themeEl.getAttribute("data-nav-theme") === "dark";
        }
      }
    }

    setIsDarkTheme(dark ?? true);
  }, [items]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScrollAndTheme);
    };

    updateScrollAndTheme();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const lenis = (window as unknown as { lenis?: { on?: (evt: string, fn: () => void) => void; off?: (evt: string, fn: () => void) => void } }).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", onScroll);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", onScroll);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateScrollAndTheme]);

  // Click outside to dismiss menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Escape key to dismiss menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    const navOffset = 114; // accounts for navbar + pinned breadcrumb bar
    const y = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  };

  if (!items.length) return null;

  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);
  const activeItem = items[activeIndex] || items[0];
  const ringCircumference = 44; // 2 * PI * 7 ~ 43.98
  const ringOffset = ringCircumference * (1 - scrollProgress);

  return (
    <div
      className={styles.floatingTagWrapper}
      ref={tagRef}
      data-theme={isDarkTheme ? "dark" : "light"}
    >
      {/* Sleek Floating Tag */}
      <div
        className={`${styles.floatingTag} ${isDarkTheme ? styles.tagDark : styles.tagLight}`}
        data-theme={isDarkTheme ? "dark" : "light"}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={isMenuOpen}
        aria-label={`Current section: ${activeItem?.label}. Click to jump to another section.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsMenuOpen((prev) => !prev);
          }
        }}
      >
        {/* Circular Progress Ring */}
        <div
          className={styles.progressRingWrapper}
          title={`${Math.round(scrollProgress * 100)}% page scrolled`}
        >
          <svg className={styles.progressRing} width="18" height="18" viewBox="0 0 18 18">
            <circle
              className={styles.progressRingBg}
              cx="9"
              cy="9"
              r="7"
              strokeWidth="1.8"
            />
            <circle
              className={styles.progressRingFill}
              cx="9"
              cy="9"
              r="7"
              strokeWidth="2"
              style={{
                strokeDasharray: ringCircumference,
                strokeDashoffset: ringOffset,
              }}
            />
          </svg>
        </div>

        {/* Section Counter */}
        <span className={styles.sectionIndexBadge}>
          {activeIndex + 1}/{items.length}
        </span>

        <span className={styles.tagDivider} aria-hidden="true" />

        {/* Active Page Indicator */}
        <div className={styles.activeLabelContainer}>
          <AnimatePresence mode="wait">
            <motion.span
              key={activeItem?.id || "section"}
              className={styles.activeLabelText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeItem?.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Dropdown Chevron */}
        <ChevronDown
          size={12}
          className={`${styles.tagChevron} ${isMenuOpen ? styles.tagChevronOpen : ""}`}
          aria-hidden="true"
        />
      </div>

      {/* Quick Jump Section Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`${styles.tagDropdownMenu} ${isDarkTheme ? styles.menuDark : styles.menuLight}`}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.menuHeader}>
              <span className={styles.menuHeaderTitle}>Jump to Section</span>
              <span className={styles.menuHeaderProgress}>{Math.round(scrollProgress * 100)}%</span>
            </div>
            <div className={styles.menuItemsList}>
              {items.map((item, idx) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.menuItemBtn} ${isActive ? styles.menuItemBtnActive : ""}`}
                    onClick={() => {
                      handleScrollTo(item.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className={styles.menuItemIndex}>{String(idx + 1).padStart(2, "0")}</span>
                    <span className={styles.menuItemLabel}>{item.label}</span>
                    {isActive && <Check size={13} className={styles.menuItemCheck} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
