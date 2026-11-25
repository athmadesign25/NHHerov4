"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
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

  // High-performance Framer Motion scroll progress (hardware-accelerated, zero-lag)
  const ringCircumference = 44; // 2 * PI * 7 ~ 43.98
  const { scrollYProgress } = useScroll();
  const ringOffset = useTransform(scrollYProgress, [0, 1], [ringCircumference, 0]);

  // Keep numerical percentage in sync for dropdown without re-rendering the SVG ring
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

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

  // Determine active section (only triggers React state update when active section actually changes)
  useEffect(() => {
    let ticking = false;

    const checkActiveSection = () => {
      const triggerY = window.innerHeight * 0.35;
      let currentId = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= triggerY) {
          currentId = item.id;
        }
      }
      if (currentId) {
        setActiveId((prev) => (prev !== currentId ? currentId : prev));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(checkActiveSection);
        ticking = true;
      }
    };

    checkActiveSection();
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
    };
  }, [items]);

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
        {/* Seamless Hardware-Accelerated Circular Progress Ring */}
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
            <motion.circle
              className={styles.progressRingFill}
              cx="9"
              cy="9"
              r="7"
              strokeWidth="2"
              strokeDasharray={ringCircumference}
              style={{
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
